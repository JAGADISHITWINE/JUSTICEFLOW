const DocumentModel = require('../models/document.model');
const { logAudit } = require('../../shared/audit');
const fs = require('fs');
const path = require('path');

class DocumentController {
  static async getAll(req, res) {
    try {
      const { case_id, search, doc_type } = req.query;
      const documents = await DocumentModel.findAll({ case_id, search, doc_type });
      return res.json({
        success: true,
        data: documents
      });
    } catch (err) {
      console.error('[Document GetAll Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve documents.' });
    }
  }

  static async getById(req, res) {
    try {
      const doc = await DocumentModel.findById(req.params.id);
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document not found.' });
      }
      return res.json({ success: true, data: doc });
    } catch (err) {
      console.error('[Document GetById Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve document.' });
    }
  }

  static async upload(req, res) {
    try {
      const { case_id, doc_name, doc_type } = req.body;
      const userId = req.user ? req.user.id : 1;

      if (!case_id) {
        return res.status(400).json({ success: false, message: 'case_id is required.' });
      }

      let filePath = '';
      let fileSize = 0;
      let finalDocName = doc_name;

      if (req.file) {
        filePath = `/uploads/${req.file.filename}`;
        fileSize = req.file.size;
        if (!finalDocName) {
          finalDocName = req.file.originalname;
        }
      } else {
        if (!finalDocName) {
          return res.status(400).json({ success: false, message: 'File or document name is required.' });
        }
        filePath = `/uploads/${encodeURIComponent(finalDocName)}`;
        fileSize = 1024 * (Math.floor(Math.random() * 500) + 100);
      }

      const newDoc = await DocumentModel.create({
        case_id,
        doc_name: finalDocName,
        doc_type: doc_type || 'Legal Document',
        file_path: filePath,
        file_size: fileSize,
        uploaded_by: userId
      });

      await logAudit(
        userId,
        `Uploaded document: ${newDoc.doc_name} for Case #${case_id}`,
        'DOCUMENT',
        newDoc.id
      );

      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully.',
        data: newDoc
      });
    } catch (err) {
      console.error('[Document Upload Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to upload document.' });
    }
  }

  static async download(req, res) {
    try {
      const doc = await DocumentModel.findById(req.params.id);
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document not found.' });
      }

      const diskPath = path.join(__dirname, '../uploads', path.basename(doc.file_path));

      // If file actually exists on disk, download it; otherwise provide mock text content
      if (fs.existsSync(diskPath)) {
        return res.download(diskPath, doc.doc_name);
      } else {
        res.setHeader('Content-disposition', `attachment; filename="${doc.doc_name}"`);
        res.setHeader('Content-type', 'text/plain');
        return res.send(`JUSTICEFLOW LEGAL ARCHIVE - INDIAN COURTS PRACTICE OS\nDocument: ${doc.doc_name}\nCase: ${doc.case_name} (${doc.case_number})\nType: ${doc.doc_type}\nCourt: ${doc.court_name || 'Hon\'ble High Court / Commercial Court'}\nUploaded At: ${doc.uploaded_at}\n\n[CONFIDENTIAL ADVOCATE-CLIENT PRIVILEGED LEGAL WORK PRODUCT - SECTION 126 INDIAN EVIDENCE ACT, 1872]`);
      }
    } catch (err) {
      console.error('[Document Download Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to download document.' });
    }
  }

  static async delete(req, res) {
    try {
      const id = req.params.id;
      const doc = await DocumentModel.findById(id);
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document not found.' });
      }

      // Remove from disk if exists
      const diskPath = path.join(__dirname, '../uploads', path.basename(doc.file_path));
      if (fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (e) {
          console.warn('Could not remove file from disk:', e.message);
        }
      }

      await DocumentModel.delete(id);
      const userId = req.user ? req.user.id : 1;

      await logAudit(
        userId,
        `Deleted document: ${doc.doc_name}`,
        'DOCUMENT',
        id
      );

      return res.json({
        success: true,
        message: 'Document deleted successfully.'
      });
    } catch (err) {
      console.error('[Document Delete Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to delete document.' });
    }
  }
}

module.exports = DocumentController;
