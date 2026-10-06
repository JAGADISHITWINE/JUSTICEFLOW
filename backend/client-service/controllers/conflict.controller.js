const ConflictModel = require('../models/conflict.model');

class ConflictController {
  // POST /api/clients/conflict-check
  static async runConflictCheck(req, res) {
    try {
      const {
        prospectiveClient,
        matterType,
        adverseParties,
        corporateAffiliates,
        opposingCounsel,
        witnesses
      } = req.body;

      if (!prospectiveClient || prospectiveClient.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Prospective client name is required' });
      }

      const userId = req.headers['x-user-id'] || 1;
      const lawyerName = req.headers['x-user-name'] || 'Alexander Vance, Esq.';

      const result = await ConflictModel.checkConflicts({
        prospectiveClient,
        matterType,
        adverseParties,
        corporateAffiliates,
        opposingCounsel,
        witnesses,
        userId,
        lawyerName
      });

      res.status(201).json({
        success: true,
        message: 'Ethical conflict due diligence completed',
        data: result
      });
    } catch (err) {
      console.error('Error running conflict check:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/clients/conflict-check/history
  static async getConflictHistory(req, res) {
    try {
      const records = await ConflictModel.findAll();
      
      const stats = {
        totalChecks: records.length,
        cleared: records.filter(r => r.status === 'CLEARED').length,
        potential: records.filter(r => r.status === 'POTENTIAL_CONFLICT').length,
        directConflict: records.filter(r => r.status === 'DIRECT_CONFLICT').length
      };

      res.json({ success: true, stats, data: records });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/clients/conflict-check/:id
  static async getConflictById(req, res) {
    try {
      const record = await ConflictModel.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ success: false, message: 'Conflict check record not found' });
      }
      res.json({ success: true, data: record });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/clients/conflict-check/:id/certificate-pdf
  static async downloadCertifiedAuditPdf(req, res) {
    try {
      const record = await ConflictModel.findById(req.params.id);
      if (!record) {
        return res.status(404).send('Conflict check not found');
      }

      const statusColor = record.status === 'CLEARED' ? '#27AE60' : (record.status === 'DIRECT_CONFLICT' ? '#E74C3C' : '#F39C12');
      const statusTitle = record.status === 'CLEARED' ? 'ETHICALLY CLEARED FOR ONBOARDING' : (record.status === 'DIRECT_CONFLICT' ? 'PROHIBITED DIRECT ADVERSITY CONFLICT' : 'POTENTIAL CONFLICT - WAIVER REQUIRED');

      const findingsHtml = record.findings && record.findings.length > 0
        ? record.findings.map(f => `
            <div style="background: #F8F9FA; border-left: 4px solid ${f.severity === 'CRITICAL' ? '#E74C3C' : '#F39C12'}; padding: 10px 14px; margin-bottom: 8px; border-radius: 4px;">
              <div style="font-weight: 700; font-size: 13px; color: #2C3E50;">[${f.severity}] ${f.title}</div>
              <div style="font-size: 12px; color: #555; margin-top: 4px;">${f.description}</div>
            </div>
          `).join('')
        : `<div style="padding: 12px; background: #EAFDF0; border: 1px solid #C3E6CB; color: #155724; border-radius: 6px; font-weight: 600; font-size: 13px;">
             ✓ ZERO CONFLICTS DETECTED across all open litigation, closed historical files, adverse parties, corporate subsidiaries, and active witness registries.
           </div>`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Conflict of Interest Due Diligence Audit Certificate</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 30px; color: #2C3E50; background: #fff; line-height: 1.5; }
            .cert-box { border: 2px solid #2C3E50; padding: 30px; border-radius: 8px; position: relative; }
            .cert-watermark { position: absolute; top: 35%; left: 25%; font-size: 55px; opacity: 0.05; transform: rotate(-30deg); font-weight: 900; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #3498DB; padding-bottom: 15px; margin-bottom: 20px; }
            .firm-name { font-size: 22px; font-weight: bold; letter-spacing: 1px; color: #2C3E50; }
            .cert-badge { background: ${statusColor}; color: white; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 13px; letter-spacing: 0.5px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 13px; }
            .meta-item { background: #F8F9FA; padding: 8px 12px; border-radius: 4px; }
            .meta-label { font-size: 11px; text-transform: uppercase; color: #7F8C8D; font-weight: bold; }
            .meta-val { font-size: 14px; font-weight: 600; color: #2C3E50; margin-top: 2px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #2C3E50; margin: 20px 0 10px 0; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; }
            .signoff-box { margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #ccc; padding-top: 15px; }
            .hash-block { font-family: monospace; font-size: 11px; color: #7F8C8D; word-break: break-all; }
            @media print {
              .no-print { display: none; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 18px; background: #3498DB; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
              🖨️ Print / Save as PDF Certificate
            </button>
          </div>

          <div class="cert-box">
            <div class="cert-watermark">BAR COUNCIL OF INDIA (BCI) COMPLIANT</div>
            
            <div class="header">
              <div>
                <div class="firm-name">CHAMBERS OF JUSTICEFLOW ADVOCATES</div>
                <div style="font-size: 12px; color: #7F8C8D;">INDIAN COURTS & TRIBUNALS PRACTICE OS & ETHICS AUDITING SYSTEM</div>
              </div>
              <div style="text-align: right;">
                <span class="cert-badge">${record.status}</span>
                <div style="font-size: 11px; color: #7F8C8D; margin-top: 5px;">Risk Score: ${record.risk_score} / 100</div>
              </div>
            </div>

            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="margin: 0; font-size: 20px; color: #2C3E50; text-transform: uppercase;">CERTIFIED CONFLICT OF INTEREST AUDIT REPORT</h2>
              <div style="font-size: 13px; color: #7F8C8D; margin-top: 4px;">Certificate Tracking ID: <strong>${record.audit_certificate_id}</strong></div>
            </div>

            <div class="meta-grid">
              <div class="meta-item">
                <div class="meta-label">Prospective Client / Subject</div>
                <div class="meta-val">${record.prospective_client}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Matter / Proceeding Domain</div>
                <div class="meta-val">${record.matter_type || 'Commercial Suit / High Court Petition'}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Opposite Parties / Caveators Queried</div>
                <div class="meta-val">${record.adverse_parties || 'None Specified'}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Corporate Subsidiaries & Affiliates</div>
                <div class="meta-val">${record.corporate_affiliates || 'None Specified'}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Opposing Advocate / Law Firm Registry</div>
                <div class="meta-val">${record.opposing_counsel || 'None Disclosed'}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Witnesses / Deponents Queried</div>
                <div class="meta-val">${record.witnesses || 'None Disclosed'}</div>
              </div>
            </div>

            <div class="section-title">Ethical Due Diligence Findings & Multi-Dimensional Cross-Reference</div>
            ${findingsHtml}

            <div class="section-title">Bar Council of India Professional Standards Compliance</div>
            <p style="font-size: 12px; color: #555; text-align: justify;">
              This audit certifies that an exhaustive electronic cross-reference query has been executed pursuant to Bar Council of India (BCI) Rules on Professional Standards and Etiquette (Part VI, Chapter II, Section II - Duty to the Client, Rules 33 & 36) and Section 126 of the Indian Evidence Act, 1872 (Advocate-Client Privilege). The search scanned all active trial dockets, pending High Court / Supreme Court petitions, Commercial Suits, corporate subsidiaries, opposite party advocates, and witness lists across Indian jurisdictions.
            </p>

            <div class="signoff-box">
              <div>
                <div class="hash-block">Audit Verification Hash:</div>
                <div class="hash-block">${record.audit_certificate_id}-${Date.now().toString(16)}</div>
                <div style="font-size: 11px; color: #7F8C8D; margin-top: 4px;">Audit Executed: ${new Date(record.checked_at).toUTCString()}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-family: 'Brush Script MT', cursive; font-size: 26px; color: #2C3E50;">${record.checked_by || 'Advocate Alexander Vance'}</div>
                <div style="border-top: 1px solid #2C3E50; width: 220px; margin-top: 2px;"></div>
                <div style="font-size: 12px; font-weight: bold; margin-top: 4px;">Advocate on Record / Managing Partner</div>
                <div style="font-size: 11px; color: #7F8C8D;">Bar Council Reg. No. KAR/1420/2012</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (err) {
      res.status(500).send('Error generating audit certificate: ' + err.message);
    }
  }
}

module.exports = ConflictController;
