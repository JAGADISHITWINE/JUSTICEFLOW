const CaseModel = require('../models/case.model');
const { logAudit } = require('../../shared/audit');

class CaseController {
  static async getAll(req, res) {
    try {
      const { search, status, case_type, client_id, page = 1, limit = 10 } = req.query;
      const result = await CaseModel.findAll({ search, status, case_type, client_id, page, limit });
      return res.json({
        success: true,
        ...result
      });
    } catch (err) {
      console.error('[Case GetAll Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve cases.' });
    }
  }

  static async getById(req, res) {
    try {
      const caseItem = await CaseModel.findById(req.params.id);
      if (!caseItem) {
        return res.status(404).json({ success: false, message: 'Case not found.' });
      }
      return res.json({ success: true, data: caseItem });
    } catch (err) {
      console.error('[Case GetById Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve case details.' });
    }
  }

  static async create(req, res) {
    try {
      const { case_name, client_id } = req.body;
      const userId = req.body.user_id || (req.user ? req.user.id : 1);

      if (!case_name || !client_id) {
        return res.status(400).json({
          success: false,
          message: 'Case name and Client are required.'
        });
      }

      const newCase = await CaseModel.create({
        ...req.body,
        user_id: userId
      });

      await logAudit(
        userId,
        `Created case: ${newCase.case_name} (${newCase.case_number})`,
        'CASE',
        newCase.id
      );

      return res.status(201).json({
        success: true,
        message: 'Case created successfully.',
        data: newCase
      });
    } catch (err) {
      console.error('[Case Create Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to create case.' });
    }
  }

  static async update(req, res) {
    try {
      const id = req.params.id;
      const existing = await CaseModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Case not found.' });
      }

      const updated = await CaseModel.update(id, req.body);
      const userId = req.user ? req.user.id : 1;

      await logAudit(
        userId,
        `Updated case: ${updated.case_name} (${updated.status})`,
        'CASE',
        id
      );

      return res.json({
        success: true,
        message: 'Case updated successfully.',
        data: updated
      });
    } catch (err) {
      console.error('[Case Update Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to update case.' });
    }
  }

  static async delete(req, res) {
    try {
      const id = req.params.id;
      const existing = await CaseModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Case not found.' });
      }

      await CaseModel.delete(id);
      const userId = req.user ? req.user.id : 1;

      await logAudit(
        userId,
        `Deleted case: ${existing.case_name}`,
        'CASE',
        id
      );

      return res.json({
        success: true,
        message: 'Case deleted successfully.'
      });
    } catch (err) {
      console.error('[Case Delete Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to delete case.' });
    }
  }

  static async getDashboardStats(req, res) {
    try {
      const stats = await CaseModel.getDashboardStats();
      return res.json({
        success: true,
        data: stats
      });
    } catch (err) {
      console.error('[Case Dashboard Stats Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics.' });
    }
  }
}

module.exports = CaseController;
