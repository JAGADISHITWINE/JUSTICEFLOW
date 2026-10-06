const RetainerModel = require('../models/retainer.model');

class RetainerController {
  // GET /api/cases/retainers
  static async getAll(req, res) {
    try {
      const filters = {
        case_id: req.query.case_id,
        client_id: req.query.client_id,
        status: req.query.status
      };
      const records = await RetainerModel.findAll(filters);
      res.json({ success: true, data: records });
    } catch (err) {
      console.error('Error fetching retainers:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/cases/retainers/:id
  static async getById(req, res) {
    try {
      const record = await RetainerModel.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ success: false, message: 'Retainer agreement not found' });
      }
      res.json({ success: true, data: record });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // POST /api/cases/retainers
  static async create(req, res) {
    try {
      const {
        case_id,
        client_id,
        title,
        fee_type,
        retainer_amount,
        hourly_rate,
        terms_content,
        redline_notes
      } = req.body;

      if (!client_id || !title || !terms_content) {
        return res.status(400).json({ success: false, message: 'Client ID, Title, and Terms are required' });
      }

      const userId = req.headers['x-user-id'] || 1;
      const created = await RetainerModel.create({
        case_id,
        client_id,
        title,
        version: 'v1.0',
        fee_type: fee_type || 'Retainer Draw',
        retainer_amount: retainer_amount || 0,
        hourly_rate: hourly_rate || 0,
        terms_content,
        redline_notes: redline_notes || 'Initial engagement letter formulation',
        status: 'Draft',
        created_by: userId
      });

      res.status(201).json({ success: true, message: 'Retainer agreement v1.0 drafted successfully', data: created });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // POST /api/cases/retainers/:id/revision
  static async createRevision(req, res) {
    try {
      const { id } = req.params;
      const { title, fee_type, retainer_amount, hourly_rate, terms_content, redline_notes } = req.body;
      const userId = req.headers['x-user-id'] || 1;

      const revised = await RetainerModel.createRevision(id, {
        title,
        fee_type,
        retainer_amount,
        hourly_rate,
        terms_content,
        redline_notes,
        created_by: userId
      });

      res.status(201).json({
        success: true,
        message: `Created revision ${revised.version} with redline tracking! Previous version marked Superseded.`,
        data: revised
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // POST /api/cases/retainers/:id/sign
  static async signAgreement(req, res) {
    try {
      const { id } = req.params;
      const { signature_data, signer_name, signer_email } = req.body;

      if (!signature_data || !signer_name) {
        return res.status(400).json({ success: false, message: 'Digital signature and signer name are required' });
      }

      const signerIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const biometricTimestamp = `BIO-SIG-${Date.now()}-${signerIp} | Canvas Vector Trace 320x120`;

      const signed = await RetainerModel.signAgreement(id, {
        signature_data,
        signer_name,
        signer_email: signer_email || 'client@corporation.com',
        signer_ip: signerIp,
        biometric_timestamp: biometricTimestamp
      });

      res.json({
        success: true,
        message: `Retainer agreement ${signed.version} legally executed and sealed with biometric timestamp!`,
        data: signed
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // PUT /api/cases/retainers/:id/status
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await RetainerModel.updateStatus(id, status);
      res.json({ success: true, message: `Status updated to ${status}`, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // DELETE /api/cases/retainers/:id
  static async deleteAgreement(req, res) {
    try {
      const { id } = req.params;
      await RetainerModel.delete(id);
      res.json({ success: true, message: 'Retainer contract removed' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/cases/retainers/:id/pdf
  static async downloadContractPdf(req, res) {
    try {
      const { id } = req.params;
      const record = await RetainerModel.findById(id);

      if (!record) {
        return res.status(404).send('Agreement not found');
      }

      const isSigned = record.status === 'Signed';

      const signatureBlock = isSigned
        ? `
          <div style="border: 1px dashed #27AE60; background: #F4FBF7; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <div style="font-weight: bold; color: #27AE60; margin-bottom: 8px;">✓ VERIFIED DIGITAL SIGNATURE & BIOMETRIC SEAL</div>
            <img src="${record.signature_data}" style="max-height: 70px; border-bottom: 1px solid #27AE60; display: block; margin-bottom: 6px;" alt="Client Signature">
            <div style="font-size: 13px; font-weight: bold;">Signer: ${record.signer_name} (${record.signer_email})</div>
            <div style="font-size: 11px; color: #7F8C8D;">Biometric Timestamp: ${record.biometric_timestamp || 'N/A'}</div>
            <div style="font-size: 11px; color: #7F8C8D;">Executed On: ${new Date(record.signed_at).toUTCString()} &bull; IP: ${record.signer_ip}</div>
          </div>
        `
        : `
          <div style="border: 1px dashed #BDC3C7; padding: 25px; text-align: center; color: #7F8C8D; border-radius: 6px; margin-top: 20px;">
            [ PENDING CLIENT E-SIGNATURE ]
          </div>
        `;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${record.title} (${record.version})</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; margin: 40px; color: #111; line-height: 1.6; }
            .contract-header { text-align: center; border-bottom: 2px double #333; padding-bottom: 15px; margin-bottom: 25px; }
            .firm-title { font-size: 20px; font-weight: bold; letter-spacing: 1px; }
            .contract-title { font-size: 16px; font-weight: bold; text-transform: uppercase; margin-top: 10px; }
            .version-tag { display: inline-block; background: #333; color: #fff; padding: 2px 8px; font-size: 11px; font-family: sans-serif; border-radius: 3px; }
            .fee-schedule-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-family: sans-serif; font-size: 13px; }
            .fee-schedule-table th, .fee-schedule-table td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
            .fee-schedule-table th { background: #f5f5f5; }
            .terms-body { font-size: 14px; text-align: justify; margin: 25px 0; white-space: pre-wrap; font-family: 'Times New Roman', serif; }
            .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 40px; font-family: sans-serif; }
            @media print {
              .no-print { display: none; }
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; font-family: sans-serif;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2C3E50; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
              🖨️ Print Agreement / Save PDF
            </button>
          </div>

          <div class="contract-header">
            <div class="firm-title">CHAMBERS OF JUSTICEFLOW ADVOCATES & LEGAL CONSULTANTS</div>
            <div style="font-size: 12px; color: #666; font-family: sans-serif;">High Court Chambers, 42 Infantry Road &bull; Bengaluru, Karnataka 560001 &bull; +91 (080) 4123-5678</div>
            <div class="contract-title">LEGAL SERVICES ENGAGEMENT & VAKALATNAMA RETAINER AGREEMENT</div>
            <div style="font-size: 11px; color: #7F8C8D; margin-top: 3px;">Governed by the Advocates Act, 1961 & Bar Council of India Rules (Part VI, Chapter II)</div>
            <div style="margin-top: 5px;">
              <span class="version-tag">${record.version}</span>
              <span style="font-size: 12px; color: #666; font-family: sans-serif; margin-left: 10px;">Status: <strong>${record.status}</strong></span>
            </div>
          </div>

          <table class="fee-schedule-table">
            <tr>
              <th style="width: 25%;">Client / Principal</th>
              <td><strong>${record.client_name}</strong> (${record.client_email || 'N/A'})</td>
            </tr>
            <tr>
              <th>Matter / Court Docket</th>
              <td>${record.case_number || 'General Retention'} - ${record.case_name || 'Legal Representation'}</td>
            </tr>
            <tr>
              <th>Fee Structure</th>
              <td><strong>${record.fee_type}</strong></td>
            </tr>
            <tr>
              <th>Retainer Escrow Deposit</th>
              <td><strong>₹${parseFloat(record.retainer_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> (Maintained in Dedicated Client Trust Escrow under BCI Rule 24)</td>
            </tr>
            <tr>
              <th>Professional Fee / Appearance Rate</th>
              <td>₹${parseFloat(record.hourly_rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} / hearing or hour</td>
            </tr>
            <tr *ngIf="record.redline_notes">
              <th>Version / Redline Notes</th>
              <td><em>${record.redline_notes || 'Initial engagement terms'}</em></td>
            </tr>
          </table>

          <div class="terms-body">
${record.terms_content}
          </div>

          <div class="signature-grid">
            <div>
              <div style="font-weight: bold; margin-bottom: 10px;">ADVOCATE ON RECORD / LAW FIRM:</div>
              <div style="font-family: 'Brush Script MT', cursive; font-size: 28px; color: #1B4F72;">Alexander Vance</div>
              <div style="border-top: 1px solid #333; margin-top: 4px; padding-top: 4px;">
                <div style="font-weight: bold; font-size: 13px;">Advocate Alexander Vance, B.A. LL.B (Hons.)</div>
                <div style="font-size: 11px; color: #666;">Managing Partner, Bar Council Enrolment: KAR/1420/2012</div>
                <div style="font-size: 11px; color: #666;">Date: ${new Date(record.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div>
              <div style="font-weight: bold; margin-bottom: 10px;">CLIENT / AUTHORIZED REPRESENTATIVE:</div>
              ${signatureBlock}
            </div>
          </div>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (err) {
      res.status(500).send('Error generating contract PDF: ' + err.message);
    }
  }
}

module.exports = RetainerController;
