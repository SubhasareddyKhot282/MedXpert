import mongoose from "mongoose";

const DoctorAvailabilitySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  slots: [{
    type: String,
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const DoctorAvailability = mongoose.model("DoctorAvailability", DoctorAvailabilitySchema);
export default DoctorAvailability;
