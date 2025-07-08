import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { authenticateUser } from '../middlewares/auth.js';
import MedicalFile from '../modules/medicalFiles.js';

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
router.post('/upload', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const newFile = new MedicalFile({
      patientId: req.user._id,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: path.extname(req.file.originalname).slice(1).toUpperCase(),
      description: req.body.description || '',
      sharedWith: req.body.sharedWith ? [req.body.sharedWith] : []
    });

    await newFile.save();
    res.status(201).json(newFile);
  } catch (error) {
    console.error('Error in uploadFile:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Get all files for the authenticated user
router.get('/my-files', authenticateUser, async (req, res) => {
  try {
    const files = await MedicalFile.find({ patientId: req.user._id })
      .populate('sharedWith', 'firstName lastName email');
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get files for a specific patient (used by doctors)
router.get('/:patientId', authenticateUser, async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    let files;
    
    // If the user is a doctor, they can ONLY see files shared with them
    if (userRole === 'doctor') {
      files = await MedicalFile.find({
        patientId,
        sharedWith: { $elemMatch: { $eq: userId } }
      }).populate('patientId', 'firstName lastName email');
    } 
    // If the user is the patient, they can see all their files
    else if (userRole === 'patient' && userId.toString() === patientId) {
      files = await MedicalFile.find({ patientId });
    }
    // If neither, return unauthorized
    else {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Double check access for each file before sending
    if (userRole === 'doctor') {
      files = files.filter(file => 
        file.sharedWith.some(id => id.toString() === userId.toString())
      );
    }
    
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ 
      message: 'Error fetching files',
      error: error.message 
    });
  }
});

// Get a specific file
router.get('/:fileId', authenticateUser, async (req, res) => {
  try {
    const file = await MedicalFile.findById(req.params.fileId)
      .populate('sharedWith', 'firstName lastName email');
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user has access to the file
    if (file.patientId.toString() !== req.user._id.toString() && 
        !file.sharedWith.some(doc => doc._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View a file
router.get('/view/:fileId', authenticateUser, async (req, res) => {
  try {
    const file = await MedicalFile.findById(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user has access to the file
    if (file.patientId.toString() !== req.user._id.toString() && 
        !file.sharedWith.some(doc => doc.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get the absolute path to the uploads directory
    const uploadsDir = path.join(process.cwd(), 'src', 'uploads');
    const filePath = path.join(uploadsDir, path.basename(file.fileUrl));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Set appropriate headers for file download/view
    res.setHeader('Content-Type', `application/${file.fileType.toLowerCase()}`);
    res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
    
    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error streaming file' });
      }
    });
  } catch (error) {
    console.error('Error in viewFile:', error);
    res.status(500).json({ 
      message: 'Error viewing file',
      error: error.message 
    });
  }
});

// Share a file with a doctor
router.post('/:fileId/share', authenticateUser, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { doctorId } = req.body;
    const patientId = req.user._id;

    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }

    const file = await MedicalFile.findOne({ 
      _id: fileId,
      patientId: patientId 
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if file is already shared with this doctor
    if (file.sharedWith.includes(doctorId)) {
      return res.json({
        message: 'File already shared with this doctor',
        file
      });
    }

    // Add doctor to sharedWith array
    file.sharedWith.push(doctorId);
    await file.save();

    res.json({
      message: 'File shared successfully',
      file
    });
  } catch (error) {
    console.error('Error in shareFile:', error);
    res.status(500).json({ 
      message: 'Error sharing file',
      error: error.message 
    });
  }
});

export default router;
