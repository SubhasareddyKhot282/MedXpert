import mongoose from "mongoose"

const MedicalFileSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth', // Make sure the name matches the User model ("Auth")
    required: true,
  },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true }, // "PDF", "Image", etc.
  description: { type: String, default: '' },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth',
  }],
  uploadedAt: { type: Date, default: Date.now },
});

const MedicalFile = mongoose.model('MedicalFile', MedicalFileSchema);

export default MedicalFile