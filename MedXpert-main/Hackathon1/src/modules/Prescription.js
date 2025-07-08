import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, required: true }, // e.g., "2 tablets"
  instructions: { type: String }, // Optional
});

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
  medicines: [medicineSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Prescription', prescriptionSchema);
