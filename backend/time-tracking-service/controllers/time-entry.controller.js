const TimeEntryModel = require('../models/time-entry.model');
const { logAudit } = require('../../shared/audit');

class TimeEntryController {
  static async getAll(req, res) {
    try {
      const { case_id, user_id, start_date, end_date, is_billable, page = 1, limit = 15 } = req.query;
      const result = await TimeEntryModel.findAll({ case_id, user_id, start_date, end_date, is_billable, page, limit });
      return res.json({
        success: true,
        ...result
      });
    } catch (err) {
      console.error('[TimeEntry GetAll Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve time entries.' });
    }
  }

  static async getById(req, res) {
    try {
      const entry = await TimeEntryModel.findById(req.params.id);
      if (!entry) {
        return res.status(404).json({ success: false, message: 'Time entry not found.' });
      }
      return res.json({ success: true, data: entry });
    } catch (err) {
      console.error('[TimeEntry GetById Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve time entry.' });
    }
  }

  static async create(req, res) {
    try {
      const { case_id, description, hours, hourly_rate, entry_date, is_billable } = req.body;
      const userId = req.body.user_id || (req.user ? req.user.id : 1);

      if (!case_id || !description || !hours) {
        return res.status(400).json({
          success: false,
          message: 'Case, description, and hours are required.'
        });
      }

      const newEntry = await TimeEntryModel.create({
        user_id: userId,
        case_id,
        description,
        hours: parseFloat(hours),
        hourly_rate: hourly_rate ? parseFloat(hourly_rate) : 200.00,
        entry_date,
        is_billable
      });

      await logAudit(
        userId,
        `Logged ${hours} hrs for Case #${case_id}`,
        'TIME_ENTRY',
        newEntry.id
      );

      return res.status(201).json({
        success: true,
        message: 'Time entry logged successfully.',
        data: newEntry
      });
    } catch (err) {
      console.error('[TimeEntry Create Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to log time entry.' });
    }
  }

  static async update(req, res) {
    try {
      const id = req.params.id;
      const existing = await TimeEntryModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Time entry not found.' });
      }

      const updated = await TimeEntryModel.update(id, req.body);
      const userId = req.user ? req.user.id : 1;

      await logAudit(
        userId,
        `Updated time entry #${id} (${updated.hours} hrs)`,
        'TIME_ENTRY',
        id
      );

      return res.json({
        success: true,
        message: 'Time entry updated successfully.',
        data: updated
      });
    } catch (err) {
      console.error('[TimeEntry Update Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to update time entry.' });
    }
  }

  static async delete(req, res) {
    try {
      const id = req.params.id;
      const existing = await TimeEntryModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Time entry not found.' });
      }

      await TimeEntryModel.delete(id);
      const userId = req.user ? req.user.id : 1;

      await logAudit(
        userId,
        `Deleted time entry #${id}`,
        'TIME_ENTRY',
        id
      );

      return res.json({
        success: true,
        message: 'Time entry deleted successfully.'
      });
    } catch (err) {
      console.error('[TimeEntry Delete Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to delete time entry.' });
    }
  }

  static async getSummary(req, res) {
    try {
      const stats = await TimeEntryModel.getSummaryStats();
      return res.json({
        success: true,
        data: stats
      });
    } catch (err) {
      console.error('[TimeEntry Summary Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch summary stats.' });
    }
  }
}

module.exports = TimeEntryController;
