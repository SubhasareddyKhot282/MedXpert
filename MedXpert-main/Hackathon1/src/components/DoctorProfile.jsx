import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function DoctorProfile() {
  const [doctor, setDoctor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    dob: "",
    phone: "",
    speciality: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/doctor-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctor(response.data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctor({ ...doctor, [name]: value });
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:3000/update-doctor-profile",
        doctor,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDoctor(response.data);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Avatar initials
  const initials = `${doctor.firstName?.[0] || "D"}${doctor.lastName?.[0] || "R"}`.toUpperCase();

  return (
    <div className="min-h-screen bg-black py-12 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-800"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-3xl font-bold text-white mb-4 border-4 border-gray-700">
            {initials}
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">{doctor.firstName} {doctor.lastName}</h1>
          <p className="text-gray-400">{doctor.email}</p>
        </div>

        {/* Error/Success Messages */}
        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
        {success && <p className="text-green-400 mb-4 text-center">{success}</p>}

        {/* Profile Form */}
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={doctor.firstName}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`w-full px-4 py-3 rounded-xl border border-gray-700 text-white bg-gray-800 focus:ring-2 focus:ring-white focus:border-white transition-all ${!isEditing && "opacity-60 cursor-not-allowed"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={doctor.lastName}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`w-full px-4 py-3 rounded-xl border border-gray-700 text-white bg-gray-800 focus:ring-2 focus:ring-white focus:border-white transition-all ${!isEditing && "opacity-60 cursor-not-allowed"}`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={doctor.email}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-gray-700 text-gray-400 bg-gray-900 opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Gender</label>
              <select
                name="gender"
                value={doctor.gender}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 rounded-xl border border-gray-700 text-white bg-gray-800 focus:ring-2 focus:ring-white focus:border-white transition-all ${!isEditing && "opacity-60 cursor-not-allowed"}`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Speciality</label>
              <select
                name="speciality"
                value={doctor.speciality}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 rounded-xl border border-gray-700 text-white bg-gray-800 focus:ring-2 focus:ring-white focus:border-white transition-all ${!isEditing && "opacity-60 cursor-not-allowed"}`}
              >
                <option value="">Select Speciality</option>
                {["cardiology", "neurology", "pediatrics", "orthopedics"].map(
                  (speciality) => (
                    <option key={speciality} value={speciality}>
                      {speciality.charAt(0).toUpperCase() + speciality.slice(1)}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={doctor.dob}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`w-full px-4 py-3 rounded-xl border border-gray-700 text-white bg-gray-800 focus:ring-2 focus:ring-white focus:border-white transition-all ${!isEditing && "opacity-60 cursor-not-allowed"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Phone</label>
              <input
                type="text"
                name="phone"
                value={doctor.phone}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`w-full px-4 py-3 rounded-xl border border-gray-700 text-white bg-gray-800 focus:ring-2 focus:ring-white focus:border-white transition-all ${!isEditing && "opacity-60 cursor-not-allowed"}`}
              />
            </div>
          </div>
        </form>

        {/* Edit/Save Buttons */}
        <div className="flex justify-end mt-8 gap-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Save Changes
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default DoctorProfile;
