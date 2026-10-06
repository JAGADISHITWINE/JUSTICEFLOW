const ClientModel = require('../models/client.model');
const { logAudit } = require('../../shared/audit');

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
      const { name, email, phone, address, city, state, zip_code, status } = req.body;
      const userId = req.body.user_id || (req.user ? req.user.id : 1);

      if (!name) {
        return res.status(400).json({ success: false, message: 'Client name is required.' });
      }

      const client = await ClientModel.create({
        user_id: userId,
        name,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        status: status || 'Active'
      });

      await logAudit(req.user ? req.user.id : 1, `Created client: ${name}`, 'CLIENT', client.id);

      return res.status(201).json({
        success: true,
        message: 'Client created successfully.',
        data: client
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
}

module.exports = ClientController;
