import mongoose from 'mongoose';

const billItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  cost: { type: Number, required: true }
});

const billSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
  items: [billItemSchema],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Bill', billSchema); 