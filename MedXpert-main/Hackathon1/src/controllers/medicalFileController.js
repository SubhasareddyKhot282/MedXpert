import MedicalFile from '../modules/medicalFiles.js';
import path from 'path';

// Upload medical file
export const uploadFile = async (req, res) => {
  try {
    const { description, sharedWith } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!req.userId) {
      return res.status(401).json({ message: 'User not authenticated (userId missing)' });
    }

    const newFile = new MedicalFile({
      patientId: req.userId,
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileType: path.extname(file.originalname).slice(1).toUpperCase(),
      description: description || '',
      sharedWith: sharedWith ? [sharedWith] : []
    });

    await newFile.save();
    res.status(201).json(newFile);
  } catch (error) {
    console.error('Error in uploadFile:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
};

// Get all files uploaded by the patient
export const getMyFiles = async (req, res) => {
  try {
    const files = await MedicalFile.find({ patientId: req.userId });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Share a file with a doctor
export const shareFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { doctorId } = req.body;
    const userId = req.user._id;

    // Find the file and verify ownership
    const file = await MedicalFile.findOne({ _id: fileId, userId });
    if (!file) {
      return res.status(404).json({ message: 'File not found or unauthorized' });
    }

    // Add doctor to sharedWith array if not already present
    if (!file.sharedWith.includes(doctorId)) {
      file.sharedWith.push(doctorId);
      await file.save();
    }

    res.json({ message: 'File shared successfully', file });
  } catch (error) {
    console.error('Error in shareFile:', error);
    res.status(500).json({ message: 'Error sharing file' });
  }
};

// Get all files shared with this doctor
export const getFilesSharedWithDoctor = async (req, res) => {
  try {
    const files = await MedicalFile.find({ sharedWith: req.userId });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadFile,
  getMyFiles,
  shareFile,
  getFilesSharedWithDoctor
};


  