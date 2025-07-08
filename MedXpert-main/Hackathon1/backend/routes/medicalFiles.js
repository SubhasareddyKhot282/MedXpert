import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload a medical file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = {
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: path.extname(req.file.originalname).slice(1).toUpperCase(),
      description: req.body.description || '',
      sharedWith: req.body.sharedWith ? [req.body.sharedWith] : []
    };

    res.status(201).json(file);
  } catch (error) {
    console.error('Error in uploadFile:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Get all files for the authenticated user
router.get('/my-files', async (req, res) => {
  try {
    // For now, return a mock response
    res.json([
      {
        _id: '1',
        fileName: 'test.pdf',
        fileUrl: '/uploads/test.pdf',
        fileType: 'PDF',
        description: 'Test file',
        sharedWith: []
      }
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific file
router.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    // For now, return a mock response
    res.json({
      _id: fileId,
      fileName: 'test.pdf',
      fileUrl: '/uploads/test.pdf',
      fileType: 'PDF',
      description: 'Test file',
      sharedWith: []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View a file
router.get('/view/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    // For now, return a mock response
    res.json({
      _id: fileId,
      fileName: 'test.pdf',
      fileUrl: '/uploads/test.pdf',
      fileType: 'PDF',
      description: 'Test file',
      sharedWith: []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Share a file with a doctor
router.post('/:fileId/share', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { doctorId } = req.body;

    // For now, return a mock response
    res.json({
      message: 'File shared successfully',
      file: {
        _id: fileId,
        sharedWith: [doctorId]
      }
    });
  } catch (error) {
    console.error('Error in shareFile:', error);
    res.status(500).json({ message: 'Error sharing file' });
  }
});

export default router; 