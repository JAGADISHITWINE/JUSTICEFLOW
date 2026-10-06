const { pool } = require('../../database/db');
const crypto = require('crypto');

class ConflictModel {
  static async checkConflicts(params) {
    const {
      prospectiveClient = '',
      matterType = 'General Civil Litigation',
      adverseParties = '',
      corporateAffiliates = '',
      opposingCounsel = '',
      witnesses = '',
      userId = 1,
      lawyerName = 'Alexander Vance, Esq.'
    } = params;

    const findings = [];
    let riskScore = 0;
    let status = 'CLEARED';

    // 1. Fetch all existing clients
    const [existingClients] = await pool.query('SELECT id, name, email, phone, status FROM clients');
    
    // 2. Fetch all cases with parties, counsel, and affiliates
    const [allCases] = await pool.query(`
      SELECT 
        c.id, c.case_name, c.case_number, c.status, c.adverse_party, 
        c.opposing_counsel, c.corporate_affiliates, c.witnesses,
        cl.name as client_name
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
    `);

    const pClientNorm = prospectiveClient.trim().toLowerCase();
    const adverseNorm = adverseParties.trim().toLowerCase();
    const affiliatesNorm = corporateAffiliates.trim().toLowerCase();
    const counselNorm = opposingCounsel.trim().toLowerCase();
    const witnessesNorm = witnesses.trim().toLowerCase();

    // Check A: Is prospective client already an existing client or known adversary?
    if (pClientNorm.length > 2) {
      for (const client of existingClients) {
        if (client.name.toLowerCase().includes(pClientNorm) || pClientNorm.includes(client.name.toLowerCase())) {
          findings.push({
            category: 'EXISTING_CLIENT_MATCH',
            severity: 'CRITICAL',
            riskWeight: 95,
            title: `Exact / Substantial Client Identity Match: "${client.name}"`,
            description: `Prospective client matches existing firm client ID #${client.id} (${client.name}, Status: ${client.status}). Representation requires conflict clearance review.`
          });
          riskScore = Math.max(riskScore, 95);
        }
      }

      // Check B: Adverse parties in existing cases
      for (const cs of allCases) {
        if (cs.adverse_party) {
          const advLower = cs.adverse_party.toLowerCase();
          if (advLower.includes(pClientNorm) || pClientNorm.includes(advLower)) {
            const isLive = cs.status !== 'Closed';
            const weight = isLive ? 100 : 70;
            findings.push({
              category: 'ADVERSE_PARTY_MATCH',
              severity: isLive ? 'CRITICAL' : 'HIGH',
              riskWeight: weight,
              title: `${isLive ? 'DIRECT ADVERSE LITIGATION CONFLICT' : 'Prior Adverse Party in Closed Matter'}: Case ${cs.case_number}`,
              description: `Prospective client "${prospectiveClient}" is named as an Adverse Party in ${cs.case_name} (${cs.case_number}, Status: ${cs.status}). Bar Council of India (BCI) Rule 33 & Indian Evidence Act Section 126 prohibit simultaneous adverse representation.`
            });
            riskScore = Math.max(riskScore, weight);
          }
        }

        // Check C: Corporate affiliates
        if (cs.corporate_affiliates && affiliatesNorm.length > 2) {
          const affLower = cs.corporate_affiliates.toLowerCase();
          const pAffs = affiliatesNorm.split(',').map(s => s.trim()).filter(Boolean);
          for (const aff of pAffs) {
            if (affLower.includes(aff) || aff.includes(affLower)) {
              findings.push({
                category: 'CORPORATE_AFFILIATE_MATCH',
                severity: 'HIGH',
                riskWeight: 60,
                title: `Corporate Affiliate / Subsidiary Match: "${aff}"`,
                description: `Named affiliate "${aff}" overlaps with matter ${cs.case_number} (${cs.case_name}). Corporate piercing and disqualification doctrine applies.`
              });
              riskScore = Math.max(riskScore, 60);
            }
          }
        }

        // Check D: Opposing Counsel
        if (cs.opposing_counsel && counselNorm.length > 2) {
          if (cs.opposing_counsel.toLowerCase().includes(counselNorm) || counselNorm.includes(cs.opposing_counsel.toLowerCase())) {
            findings.push({
              category: 'OPPOSING_COUNSEL_MATCH',
              severity: 'INFORMATIONAL',
              riskWeight: 25,
              title: `Opposing Counsel Co-Litigation Flag: "${opposingCounsel}"`,
              description: `Counsel appears as opposing representative in active docket ${cs.case_number}. No bar impediment, flagged for matter strategy.`
            });
            riskScore = Math.max(riskScore, 25);
          }
        }

        // Check E: Witnesses
        if (cs.witnesses && witnessesNorm.length > 2) {
          const witParts = witnessesNorm.split(',').map(s => s.trim()).filter(Boolean);
          for (const w of witParts) {
            if (cs.witnesses.toLowerCase().includes(w.toLowerCase())) {
              findings.push({
                category: 'WITNESS_CROSS_EXAMINATION_FLAG',
                severity: 'MEDIUM',
                riskWeight: 45,
                title: `Key Fact Witness Overlap: "${w}"`,
                description: `Witness "${w}" is scheduled for testimony in matter ${cs.case_number}. Potential ethical conflict regarding cross-examination limitations.`
              });
              riskScore = Math.max(riskScore, 45);
            }
          }
        }
      }
    }

    // Determine final status
    if (riskScore >= 80) {
      status = 'DIRECT_CONFLICT';
    } else if (riskScore > 30) {
      status = 'POTENTIAL_CONFLICT';
    } else {
      status = 'CLEARED';
    }

    // Generate certified Certificate ID & cryptographic audit hash
    const certId = `CERT-ETHICS-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const hashData = `${certId}|${prospectiveClient}|${matterType}|${status}|${riskScore}|${Date.now()}`;
    const auditHash = crypto.createHash('sha256').update(hashData).digest('hex');

    // Save to conflict_checks table
    const sql = `
      INSERT INTO conflict_checks (
        user_id, prospective_client, matter_type, adverse_parties,
        corporate_affiliates, opposing_counsel, witnesses, status,
        risk_score, findings_json, audit_certificate_id, checked_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [res] = await pool.query(sql, [
      userId,
      prospectiveClient,
      matterType,
      adverseParties || null,
      corporateAffiliates || null,
      opposingCounsel || null,
      witnesses || null,
      status,
      riskScore,
      JSON.stringify(findings),
      certId,
      lawyerName
    ]);

    return {
      id: res.insertId,
      audit_certificate_id: certId,
      audit_hash: auditHash,
      prospective_client: prospectiveClient,
      matter_type: matterType,
      status,
      risk_score: riskScore,
      findings,
      checked_by: lawyerName,
      checked_at: new Date().toISOString()
    };
  }

  static async findAll(params = {}) {
    let sql = `
      SELECT cc.*, u.name as attorney_name
      FROM conflict_checks cc
      LEFT JOIN users u ON cc.user_id = u.id
      ORDER BY cc.checked_at DESC
    `;
    const [rows] = await pool.query(sql);
    return rows.map(r => ({
      ...r,
      findings: typeof r.findings_json === 'string' ? JSON.parse(r.findings_json) : (r.findings_json || [])
    }));
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT cc.*, u.name as attorney_name
      FROM conflict_checks cc
      LEFT JOIN users u ON cc.user_id = u.id
      WHERE cc.id = ? OR cc.audit_certificate_id = ?
    `, [id, id]);

    if (!rows[0]) return null;
    const r = rows[0];
    return {
      ...r,
      findings: typeof r.findings_json === 'string' ? JSON.parse(r.findings_json) : (r.findings_json || [])
    };
  }
}

module.exports = ConflictModel;
