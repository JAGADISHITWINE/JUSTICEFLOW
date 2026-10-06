const ClientModel = require('../models/client.model');
const { logAudit } = require('../../shared/audit');
const emailService = require('../../shared/emailService');

class ClientController {
  static async getAll(req, res) {
    try {
      const { search, status, page = 1, limit = 10 } = req.query;
      const result = await ClientModel.findAll({ search, status, page, limit });
      return res.json({
        success: true,
        ...result
      });
    } catch (err) {
      console.error('[Client Controller GetAll Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve clients.' });
    }
  }

  static async getById(req, res) {
    try {
      const client = await ClientModel.findById(req.params.id);
      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found.' });
      }
      return res.json({ success: true, data: client });
    } catch (err) {
      console.error('[Client Controller GetById Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve client.' });
    }
  }

  static async create(req, res) {
    try {
      const { name, email, phone, address, city, state, zip_code, status, is_email_verified } = req.body;
      const userId = req.body.user_id || (req.user ? req.user.id : 1);

      if (!name) {
        return res.status(400).json({ success: false, message: 'Client name is required.' });
      }

      // Generate a secure portal password for client access
      const generatedPortalPassword = req.body.portal_password || `Justice@${Math.floor(1000 + Math.random() * 9000)}`;

      const client = await ClientModel.create({
        user_id: userId,
        name,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        status: status || 'Active',
        is_email_verified: is_email_verified || false,
        portal_password: generatedPortalPassword
      });

      await logAudit(req.user ? req.user.id : 1, `Created client: ${name}`, 'CLIENT', client.id);

      // If client has an email, dispatch welcome email with login credentials
      let emailDispatched = false;
      if (email) {
        const mailRes = await emailService.sendClientWelcomeEmail({
          to: email,
          clientName: name,
          tempPassword: generatedPortalPassword,
          portalUrl: 'http://localhost:4200/portal/login'
        });
        emailDispatched = mailRes.sent;
      }

      return res.status(201).json({
        success: true,
        message: 'Client retained and created successfully.',
        data: client,
        portal_credentials: {
          username: email || name,
          password: generatedPortalPassword,
          portalUrl: '/portal/login',
          emailDispatched
        }
      });
    } catch (err) {
      console.error('[Client Controller Create Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to create client.' });
    }
  }

  static async update(req, res) {
    try {
      const id = req.params.id;
      const client = await ClientModel.findById(id);
      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found.' });
      }

      const updated = await ClientModel.update(id, req.body);
      await logAudit(req.user ? req.user.id : 1, `Updated client: ${updated.name}`, 'CLIENT', id);

      return res.json({
        success: true,
        message: 'Client updated successfully.',
        data: updated
      });
    } catch (err) {
      console.error('[Client Controller Update Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to update client.' });
    }
  }

  static async delete(req, res) {
    try {
      const id = req.params.id;
      const client = await ClientModel.findById(id);
      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found.' });
      }

      await ClientModel.delete(id);
      await logAudit(req.user ? req.user.id : 1, `Deleted client: ${client.name}`, 'CLIENT', id);

      return res.json({
        success: true,
        message: 'Client deleted successfully.'
      });
    } catch (err) {
      console.error('[Client Controller Delete Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to delete client.' });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await ClientModel.getStats();
      return res.json({ success: true, data: stats });
    } catch (err) {
      console.error('[Client Controller Stats Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch client statistics.' });
    }
  }

  static async sendClientOtp(req, res) {
    try {
      const { email, clientName } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Client email is required for verification.' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // Store in global/memory client verification cache (15 min expiry)
      if (!global.clientOtps) global.clientOtps = new Map();
      global.clientOtps.set(email.toLowerCase().trim(), {
        otp,
        clientName: clientName || 'Client',
        expiresAt: Date.now() + 15 * 60 * 1000
      });

      // Dispatch real email via SMTP
      const mailRes = await emailService.sendOtpEmail({
        to: email,
        otp,
        purpose: 'Client Retainer Intake Verification'
      });

      return res.json({
        success: true,
        message: mailRes.sent
          ? `Intake verification code sent to ${email}. Please check your inbox.`
          : `Intake verification code generated for ${email}.`,
        otp,
        email,
        emailSent: mailRes.sent
      });
    } catch (err) {
      console.error('[Send Client OTP Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to send client OTP.' });
    }
  }

  static async verifyClientOtp(req, res) {
    try {
      const { email, otp, clientId } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const cached = global.clientOtps ? global.clientOtps.get(cleanEmail) : null;

      if (!cached || cached.otp !== String(otp).trim() || Date.now() > cached.expiresAt) {
        return res.status(400).json({ success: false, message: 'Invalid or expired client verification code.' });
      }

      if (global.clientOtps) {
        global.clientOtps.delete(cleanEmail);
      }

      // If an existing client ID was passed, update their verified status in database
      if (clientId) {
        await ClientModel.update(clientId, { is_email_verified: 1 });
      }

      return res.json({
        success: true,
        verified: true,
        message: 'Client email successfully verified!'
      });
    } catch (err) {
      console.error('[Verify Client OTP Error]', err);
      return res.status(500).json({ success: false, message: 'Verification failed.' });
    }
  }
}

module.exports = ClientController;
