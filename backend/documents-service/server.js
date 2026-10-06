const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DocumentController = require('./controllers/document.controller');
const AiAssistantController = require('./controllers/ai-assistant.controller');
const { authenticateToken, optionalAuthenticateToken } = require('../shared/authMiddleware');
const { testConnection } = require('../database/db');

const app = express();
const PORT = process.env.DOCUMENTS_SERVICE_PORT || 3004;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static uploads serving
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'documents-service', status: 'healthy', timestamp: new Date().toISOString() });
});

// Document Routes
app.get('/api/documents', authenticateToken, DocumentController.getAll);
app.get('/api/documents/:id', authenticateToken, DocumentController.getById);
app.get('/api/documents/:id/download', optionalAuthenticateToken, DocumentController.download);
app.post('/api/documents/upload', authenticateToken, upload.single('file'), DocumentController.upload);
app.delete('/api/documents/:id', authenticateToken, DocumentController.delete);

// AI Legal Assistant (Co-Counsel) Routes
app.post('/api/documents/ai/polish-time', authenticateToken, AiAssistantController.polishTime);
app.post('/api/documents/ai/summarize', authenticateToken, AiAssistantController.summarizeDoc);
app.post('/api/documents/ai/extract-clauses', authenticateToken, AiAssistantController.extractClauses);
app.post('/api/documents/ai/statute-lookup', optionalAuthenticateToken, AiAssistantController.searchStatute);

// Error handling
app.use((err, req, res, next) => {
  console.error('[Documents Service Error]', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, async () => {
  // console.log(`🚀 [Documents Service] running on port ${PORT}`);
  await testConnection();
});
