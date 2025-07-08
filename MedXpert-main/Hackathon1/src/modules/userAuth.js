// import mongoose from "mongoose";

// // Define the userAuth schema with validations
// const userAuth = mongoose.Schema(
//   {
//     firstName: {
//       type: String,
//       //  required: true,
//       trim: true,
//     },
//     lastName: {
//       type: String,
//       // required: true,
//       trim: true,
//     },
//     email: { type: String, required: true, unique: true, lowercase: true },
//     password: { type: String, required: true, minlength: 6 },
//     role: {
//       type: String,
//       // required: true,
//       enum: ["patient", "doctor"], // Ensure only valid roles are assigned
//     },
//     gender: {
//       type: String,
//       enum: ["Male", "Female", "Other", "Prefer not to say"],
//       // required: true,
//     },
//     dob: { type: Date },
//     phone: {
//       type: String,
//       validate: { validator: (value) => /^\d{10}$/.test(value) },
//     },
//     profilePic: { type: String },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Create the model
// const Auth = mongoose.model("userAuth", userAuth);

// export default Auth;

// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ["patient", "doctor"] }, // Example roles
// });

// const Auth = mongoose.model("Auth", userSchema);

// export default Auth;

// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ["patient", "doctor"] }, // Example roles
//   gender: { type: String, enum: ["male", "female"] }, // Optional field
//   dob: { type: Date, default: null }, // Date of birth
//   phone: { type: String, default: "" }, // Optional phone number
//   // profilePic: { type: String, default: "" }, // URL or base64 for profile picture
// });

// const Auth = mongoose.model("Auth", userSchema);

// export default Auth;

// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "doctor"] }, // Example roles
  gender: { type: String, enum: ["male", "female", "other"], default: null }, // Optional field
  dob: { type: Date, default: null }, // Date of birth
  phone: { type: String, default: "" }, // Optional phone number
  speciality: { type: String, required: false }, 
});

const Auth = mongoose.model("Auth", userSchema);

export default Auth;
