import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import database from "./src/config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Auth from "./src/modules/userAuth.js";
import Appointment from "./src/modules/appoinment.js";
import { authenticateUser, authenticateDoctor } from "./src/middlewares/auth.js";
import path from "path";
import { fileURLToPath } from 'url';
import DoctorAvailability from "./src/modules/doctorAvailibility.js";
import medicalFilesRouter from "./src/routes/medicalFiles.js";
import MedicalFile from "./src/modules/medicalFiles.js";
import Prescription from "./src/modules/Prescription.js";
import Bill from "./src/modules/Bill.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve();

const app = express();
const PORT = 3000;

// Move these middleware configurations to the top, right after imports
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Set-Cookie']
  })
);

// Add logging middleware
app.use((req, res, next) => {
  next();
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  // Try to get token from cookies first, then from Authorization header
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Authentication failed',
      details: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, "hackathon");
    
    if (!decoded.role) {
      return res.status(401).json({
        error: 'Authentication failed',
        details: 'Token missing role information'
      });
    }
    
    // Add user info to request
    req.user = {
      _id: decoded._id,
      role: decoded.role,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ 
      error: 'Authentication failed',
      details: 'Invalid token'
    });
  }
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'src/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Use medical files routes
app.use('/medical-files', medicalFilesRouter);

// Token verification endpoint
app.get('/verify-token', authenticateUser, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      role: req.user.role,
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Connect to database before starting server
const startServer = async () => {
  try {
    console.log('Attempting to connect to database...');
    await database();
    console.log('Database connection successful, starting server...');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Server URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Signup Route
app.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password, role, speciality } = req.body;
  console.log("sp",speciality)
  try {
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Auth({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      speciality: role === "doctor" ? speciality : null,
    });
    
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Auth.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Create token payload
    const tokenPayload = {
      _id: user._id,
      role: user.role,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    // Create token
    const token = jwt.sign(tokenPayload, "hackathon");
    
    // Set cookies with proper configuration
    res.cookie("token", token, {
      httpOnly: false, // Changed to false to allow JS access
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
      domain: 'localhost'
    });

    res.cookie("userType", user.role, {
      httpOnly: false, // Changed to false to allow JS access
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
      domain: 'localhost'
    });

    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ 
      success: false,
      message: "Something went wrong" 
    });
  }
});


app.get("/profile", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await Auth.findOne({ email }).select("-password"); // Exclude the password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Fetch All Users
app.get("/patient/appointments", async (req, res) => {
  try {
    const users = await Auth.find().select("-password"); // Exclude passwords
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

// Update User Profile Route
app.put("/profile", async (req, res) => {
  try {
    const updates = req.body;

    const updatedProfile = await Auth.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select("-password"); // Exclude the password

    if (!updatedProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to fetch doctors based on recommendation
// app.post("/api/data", async (req, res) => {
//   const { recommended_doctor } = req.body;

//   console.log(">>> Received doctor recommendation for:", recommended_doctor);

//   if (!recommended_doctor) {
//     return res.status(400).json({ error: "Speciality is required" });
//   }

//   try {
//     const doctors = await Auth.find({
//       role: "doctor",
//       speciality: recommended_doctor,
//     }).select("-password"); // Exclude password

//     if (doctors.length === 0) {
//       return res.status(404).json({ error: "No matching doctors found" });
//     }

//     res.json({ doctors });
//   } catch (err) {
//     console.error("Error fetching doctors:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

app.post("/doc", async (req, res) => {
  try {
    const { recommended_doctor } = req.body;

    if (!recommended_doctor) {
      return res.status(400).json({ error: "Doctor specialization is required" });
    }

    // Case-insensitive match on 'speciality' field
    const doctors = await Auth.find({
      role: "doctor",
      speciality: { $regex: new RegExp(recommended_doctor, "i") },
    });


    const doctorList = doctors.map((doc) => ({
      _id:doc._id,
      name: `${doc.firstName} ${doc.lastName}`,
      specialization: doc.speciality,
      contact: doc.phone || doc.email, // fallback to email if phone is not present
    }));

    res.json({ doctors: doctorList });
  } catch (error) {
    console.error("Error in /api/data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Doctor dashboard stats route - MUST be before /doctor/:doctorId route
app.get('/doctor/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        error: 'Authentication failed',
        details: 'User not found in request'
      });
    }

    // Verify user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        error: 'Access denied',
        details: 'User is not a doctor'
      });
    }

    // Set up date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    try {
      // Initialize stats object
      const stats = {
        todayAppointments: 0,
        totalPatients: 0,
        sharedReports: 0,
        upcomingAppointments: 0,
        recentActivities: []
      };

      // Get today's appointments
      const todayAppointments = await Appointment.find({
        doctorId: req.user._id,
        date: {
          $gte: today,
          $lt: tomorrow
        }
      }).populate('patientId', 'firstName lastName');

      stats.todayAppointments = todayAppointments.length;

      // Get total unique patients
      const uniquePatients = await Appointment.distinct('patientId', { doctorId: req.user._id });
      stats.totalPatients = uniquePatients.length;

      // Get total shared reports
      const sharedReports = await MedicalFile.countDocuments({ sharedWith: req.user._id });
      stats.sharedReports = sharedReports;

      // Get upcoming appointments (next 7 days)
      const upcomingAppointments = await Appointment.find({
        doctorId: req.user._id,
        date: {
          $gte: today,
          $lt: nextWeek
        }
      }).populate('patientId', 'firstName lastName');

      stats.upcomingAppointments = upcomingAppointments.length;

      // Get recent activities
      const recentActivities = [];

      // Add today's appointments to recent activities
      todayAppointments.forEach(apt => {
        if (apt.patientId) {
          recentActivities.push(`Appointment with ${apt.patientId.firstName} ${apt.patientId.lastName} at ${apt.timeSlot}`);
        }
      });

      // Add upcoming appointments to recent activities
      upcomingAppointments.slice(0, 2).forEach(apt => {
        if (apt.patientId) {
          recentActivities.push(`Upcoming appointment with ${apt.patientId.firstName} ${apt.patientId.lastName} on ${new Date(apt.date).toLocaleDateString()}`);
        }
      });

      // Get recent prescriptions
      const recentPrescriptions = await Prescription.find({ doctorId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(2)
        .populate('patientId', 'firstName lastName');

      recentPrescriptions.forEach(pres => {
        if (pres.patientId) {
          recentActivities.push(`Prescribed ${pres.medicines?.[0]?.name || 'medication'} to ${pres.patientId.firstName} ${pres.patientId.lastName}`);
        }
      });

      // Get recent shared reports
      const recentSharedReports = await MedicalFile.find({ sharedWith: req.user._id })
        .sort({ createdAt: -1 })
        .limit(2)
        .populate('patientId', 'firstName lastName');

      recentSharedReports.forEach(report => {
        if (report.patientId) {
          recentActivities.push(`Received medical report from ${report.patientId.firstName} ${report.patientId.lastName}`);
        }
      });

      stats.recentActivities = recentActivities;

      res.json(stats);
    } catch (dbError) {
      res.status(500).json({
        error: 'Database error',
        details: dbError.message
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch dashboard stats',
      details: error.message
    });
  }
});

// Doctor ID route - MUST be after /doctor/dashboard-stats route
app.get('/doctor/:doctorId', async (req, res) => {
  const { doctorId } = req.params;

  try {
    // Find the doctor by the doctorId
    const doctor = await Auth.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Return doctor details if found
    res.json({
      doctor: {
        name: doctor.firstName,
        specialization: doctor.speciality,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});





app.post("/book-appointment", async (req, res) => {
  const { doctorId, patientId, date, timeSlot } = req.body;

  if (!doctorId || !patientId || !date || !timeSlot) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    const newAppointment = new Appointment({
      doctorId,
      patientId,
      timeSlot,
      date,
    });

    await newAppointment.save();

    res.status(201).json({ success: true, message: "Appointment booked!" });
  } catch (err) {
    console.error("Error booking appointment:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});




// Default time slots
const DEFAULT_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "03:00 PM"
];

//add available slots
app.post("/doctor/availability", authenticateDoctor, async (req, res) => {
  const { date, slots } = req.body;
  const doctorId = req.user._id; // Extract the doctor ID from the authenticated user

  if (!date || !slots || !Array.isArray(slots)) {
    return res.status(400).json({ error: "doctorId, date, and slots[] are required" });
  }

  try {
    const formattedDate = new Date(date);  // Store the date exactly as it is

    // Check if availability already exists for this doctor on this date
    const existing = await DoctorAvailability.findOne({ doctorId, date: formattedDate });

    if (existing) {
      // If availability exists, update the slots
      existing.slots = slots;
      await existing.save();
      return res.json({ success: true, message: "Availability updated", availability: existing });
    }

    // Otherwise, create new availability
    const newAvailability = new DoctorAvailability({
      doctorId,
      date: formattedDate,  // Store the date exactly as it is
      slots,
    });

    await newAvailability.save();
    res.json({ success: true, message: "Availability created", availability: newAvailability });
  } catch (err) {
    console.error("Error saving availability:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


//get available slots
app.get("/available-slots", async (req, res) => {
  const { doctorId, date } = req.query;
  console.log("Doctor ID:", doctorId);
  console.log("Original Date:", date);

  if (!doctorId || !date) {
    return res.status(400).json({ success: false, error: "doctorId and date are required" });
  }

  try {
    // Parse the date
    const parsedDate = new Date(date);  // Directly use the provided date without adjustments

    // Query for availability for the exact date
    const availability = await DoctorAvailability.findOne({
      doctorId,
      date: parsedDate,  // No complex time zone handling, use exact date as is
    });

    if (!availability) {
      return res.status(404).json({ success: false, message: "No availability found" });
    }

    const bookedAppointments = await Appointment.find({
      doctorId,
      date: parsedDate,  // Compare the exact date
    });

    const bookedSlots = bookedAppointments.map(app => app.timeSlot);

    const availableSlots = availability.slots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      success: true,
      slots: availableSlots,
    });
  } catch (err) {
    console.error("Error fetching slots:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});





app.post("/book-slot", authenticateUser, async (req, res) => {
  const { doctorId, date, timeSlot } = req.body;
  const patientId = req.user._id;

  if (!doctorId || !date || !timeSlot) {
    return res.status(400).json({ success: false, message: "doctorId, date, and timeSlot are required" });
  }

  try {
    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

    // Check if the slot is already booked
    const existing = await Appointment.findOne({
      doctorId,
      date: formattedDate,
      timeSlot
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "This slot is already booked" });
    }

    // Book the appointment
    const newAppointment = new Appointment({
      doctorId,
      patientId,
      date: formattedDate,
      timeSlot,
    });

    await newAppointment.save();

    res.status(201).json({ success: true, message: "Appointment booked", appointment: newAppointment });
  } catch (err) {
    console.error("Error booking slot:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get('/booked-slots', authenticateUser, async (req, res) => {
  try {
    let appointments;

    console.log(req.user);

    // Check if the user is a doctor or patient and populate fields accordingly
    if (req.user.role === 'doctor') {
      appointments = await Appointment.find({ doctorId: req.user._id })
        .populate('patientId', 'firstName lastName email')  // Populate patient details
        .populate('timeSlot');  // Populate timeSlot if necessary
    } else if (req.user.role === 'patient') {
      appointments = await Appointment.find({ patientId: req.user._id })
        .populate('doctorId', 'firstName lastName speciality email _id')  // Populate doctor details
        .populate('timeSlot');  // Populate timeSlot if necessary
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/all-files', authenticateUser, async (req, res) => {
  const patientId = req.user._id;
  try {
    const files = await MedicalFile.find({patientId:patientId})
      .populate('patientId', 'firstName lastName email') // Optional: populate patient details
      .populate('sharedWith', 'firstName lastName email'); // Optional: who it's shared with

    res.status(200).json({ success: true, files });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



// In your Express app

// Fetch patient details by patientId
app.get('/patient/:patientId', authenticateUser, async (req, res) => {
  const { patientId } = req.params;

  try {
    const patient = await Auth.findById(patientId).select("-password");  // Exclude the password
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching patient details' });
  }
});

// In your Express app

// Fetch all medical files for a specific patient
app.get('/medical-files/:patientId', authenticateUser, async (req, res) => {
  const { patientId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  try {
    let files;
    
    // If the user is a doctor, they can only see files shared with them
    if (userRole === 'doctor') {
      files = await MedicalFile.find({
        patientId,
        sharedWith: userId
      });
    } 
    // If the user is the patient, they can see all their files
    else if (userRole === 'patient' && userId.toString() === patientId) {
      files = await MedicalFile.find({ patientId });
    }
    // If neither, return unauthorized
    else {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching medical files:', error);
    res.status(500).json({ error: 'Error fetching medical files' });
  }
});

// Get all files for the authenticated user
app.get('/medical-files/my-files', authenticateUser, async (req, res) => {
  try {
    const files = await MedicalFile.find({ patientId: req.user._id });
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Error fetching files' });
  }
});

// Share a file with a doctor
app.post('/medical-files/share', authenticateUser, async (req, res) => {
  const { fileId, doctorId } = req.body;
  const patientId = req.user._id;

  try {
    const file = await MedicalFile.findOne({ _id: fileId, patientId });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!file.sharedWith.includes(doctorId)) {
      file.sharedWith.push(doctorId);
      await file.save();
    }

    res.status(200).json({ message: 'File shared successfully' });
  } catch (error) {
    console.error('Error sharing file:', error);
    res.status(500).json({ error: 'Error sharing file' });
  }
});

// Doctor adds a prescription
app.post('/prescriptions/:patientId', authenticateDoctor, async (req, res) => {
  const { patientId } = req.params;
  const doctorId = req.user._id;
  const { medicines } = req.body;

  try {
    const newPrescription = new Prescription({
      patientId,
      doctorId,
      medicines,
    });

    await newPrescription.save();
    res.status(201).json({ message: "Prescription saved", prescription: newPrescription });
  } catch (error) {
    console.error("Error saving prescription:", error);
    res.status(500).json({ error: "Failed to save prescription" });
  }
});

// Get all prescriptions for a patient (Doctor or Patient can view)
app.get('/prescriptions/:patientId', async (req, res) => {
  const { patientId } = req.params;
  try {
    const prescriptions = await Prescription.find({ patientId }).populate("doctorId", "firstName lastName email");
    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
});

// Get appointment details by appointment ID
app.get("/appointment/:appointmentId", authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName email phone speciality');
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if the user is authorized to view this appointment
    if (req.user.role === 'doctor' && appointment.doctorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to view this appointment" });
    }
    
    if (req.user.role === 'patient' && appointment.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to view this appointment" });
    }
    
    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ message: "Failed to fetch appointment details" });
  }
});

// Add a new bill
app.post('/billing/:patientId', authenticateUser, async (req, res) => {
  const { patientId } = req.params;
  const doctorId = req.user._id;
  const { items } = req.body;

  try {
    const newBill = new Bill({
      patientId,
      doctorId,
      items,
      total: items.reduce((sum, item) => sum + (item.cost * item.quantity), 0),
      status: 'pending'
    });

    await newBill.save();
    res.status(201).json({ message: "Bill created successfully", bill: newBill });
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ error: "Failed to create bill" });
  }
});

// Get bills for a patient
app.get('/billing/:patientId', authenticateUser, async (req, res) => {
  const { patientId } = req.params;
  try {
    const bills = await Bill.find({ patientId })
      .populate('doctorId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ error: "Failed to fetch bills" });
  }
});

// Patient Dashboard Stats
app.get('/api/patient/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        error: 'Authentication failed',
        details: 'User not found in request'
      });
    }

    // Verify user is a patient
    const user = await Auth.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        details: 'User does not exist'
      });
    }

    if (user.role !== 'patient') {
      return res.status(403).json({
        error: 'Access denied',
        details: 'User is not a patient'
      });
    }

    const userId = req.user._id;
    
    // Initialize stats object with default values
    const stats = {
      upcomingAppointments: 0,
      medicalReports: 0,
      totalDoctors: 0,
      recentActivity: 0,
      recentActivities: []
    };

    try {
      // Get upcoming appointments
      const appointments = await Appointment.find({
        patientId: userId,
        date: { $gte: new Date() }
      }).sort({ date: 1 })
      .populate('doctorId', 'firstName lastName speciality');

      stats.upcomingAppointments = appointments.length;

      // Get medical reports
      const medicalReports = await MedicalFile.find({ patientId: userId });
      stats.medicalReports = medicalReports.length;

      // Get prescriptions
      const prescriptions = await Prescription.find({ patientId: userId })
        .populate('doctorId', 'firstName lastName');

      // Get unique doctors from appointments
      const doctorIds = [...new Set(appointments.map(apt => apt.doctorId?._id).filter(Boolean))];
      const doctors = await Auth.find({ _id: { $in: doctorIds }, role: 'doctor' });
      stats.totalDoctors = doctors.length;

      // Get recent activities
      const recentActivities = [];
      
      // Add recent appointments
      appointments.slice(0, 3).forEach(apt => {
        if (apt.doctorId) {
          recentActivities.push(`Upcoming appointment with Dr. ${apt.doctorId.firstName} ${apt.doctorId.lastName} on ${new Date(apt.date).toLocaleDateString()}`);
        }
      });

      // Add recent prescriptions
      prescriptions.slice(0, 2).forEach(pres => {
        if (pres.doctorId) {
          recentActivities.push(`New prescription from Dr. ${pres.doctorId.firstName} ${pres.doctorId.lastName} on ${new Date(pres.createdAt).toLocaleDateString()}`);
        }
      });

      // Add recent medical reports
      medicalReports.slice(0, 2).forEach(report => {
        recentActivities.push(`New medical report uploaded: ${report.fileName || 'Unknown'} on ${new Date(report.createdAt).toLocaleDateString()}`);
      });

      stats.recentActivities = recentActivities;
      stats.recentActivity = recentActivities.length;

      res.json(stats);
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({
        error: 'Database error',
        details: dbError.message
      });
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard stats',
      details: error.message
    });
  }
});

// Serve static files
app.use(express.static(path.join(rootDir, "dist")));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Secure endpoint for viewing medical files
app.get('/medical-files/view/:fileId', authenticateUser, async (req, res) => {
  try {
    const file = await MedicalFile.findById(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({ message: "File not found in database" });
    }

    // Check if the user is authorized to view this file
    if (req.user.role === 'doctor' && !file.sharedWith.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not authorized to view this file" });
    }
    
    if (req.user.role === 'patient' && file.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to view this file" });
    }

    // Get the filename from the fileUrl
    const filename = file.fileUrl.split('/').pop();

    // Construct the absolute path to the file
    const filePath = path.join(__dirname, 'src', 'uploads', filename);
    
    // Check if file exists before sending
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        message: "File not found on server",
        details: "The file exists in the database but could not be found on the server"
      });
    }

    res.sendFile(filePath, (err) => {
      if (err) {
        if (!res.headersSent) {
          res.status(500).json({ 
            message: "Error serving file",
            details: err.message
          });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to serve file",
      details: error.message
    });
  }
});

// Add logging for file requests
app.use('/uploads', (req, res, next) => {
  next();
});

app.get("*", (req, res) => {
  res.sendFile(path.join(rootDir, "dist", "index.html"));
});

// Start the server
startServer();
