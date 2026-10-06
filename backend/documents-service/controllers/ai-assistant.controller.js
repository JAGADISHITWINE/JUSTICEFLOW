const AiAssistantModel = require('../models/ai-assistant.model');

class AiAssistantController {
  // POST /api/documents/ai/polish-time
  static polishTime(req, res) {
    try {
      const { rawNote, matter, client, hours } = req.body;
      const result = AiAssistantModel.polishTimeSlip(rawNote, { matter, client, hours });
      res.json({ success: true, message: 'Time slip polished successfully', data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // POST /api/documents/ai/summarize
  static summarizeDoc(req, res) {
    try {
      const { text, docType } = req.body;
      const result = AiAssistantModel.summarizeDocument(text, docType);
      res.json({ success: true, message: 'Executive brief generated', data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // POST /api/documents/ai/extract-clauses
  static extractClauses(req, res) {
    try {
      const { contractText } = req.body;
      const result = AiAssistantModel.extractClauses(contractText);
      res.json({ success: true, message: 'Contract clauses extracted', data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // POST /api/documents/ai/statute-lookup
  static async searchStatute(req, res) {
    try {
      const { query, options, apiKey } = req.body;
      const opts = { ...options, apiKey: apiKey || options?.apiKey };
      const result = await AiAssistantModel.searchIndianLaw(query, opts);
      res.json({ success: true, message: 'Indian statutory legal analysis generated', data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = AiAssistantController;
