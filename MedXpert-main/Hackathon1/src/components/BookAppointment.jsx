import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Stethoscope,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(location.state?.doctorInfo);

  useEffect(() => {
    if (!doctorInfo) {
      // If no doctor info in state, fetch it
      const fetchDoctorInfo = async () => {
        try {
          const response = await axios.get(`/doctor/${location.state?.doctorId}`);
          setDoctorInfo(response.data);
        } catch (error) {
          console.error("Error fetching doctor info:", error);
          setError("Failed to fetch doctor information");
        }
      };
      fetchDoctorInfo();
    }
  }, [location.state?.doctorId]);

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlot(null);

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:3000/available-slots?doctorId=${doctorInfo._id}&date=${date}`);
      
      if (response.data.success) {
        setAvailableSlots(response.data.slots);
      } else {
        setError(response.data.message || "No slots available for this date");
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setError("Failed to fetch available time slots. Please try again.");
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      setError("Please select both date and time slot");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        "http://localhost:3000/book-slot",
        {
          doctorId: doctorInfo._id,
          date: selectedDate,
          timeSlot: selectedSlot
        },
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        // Navigate to appointments page after successful booking
        navigate("/patient/appointments", { 
          state: { 
            message: "Appointment booked successfully!",
            appointmentId: response.data.appointment._id
          }
        });
      } else {
        setError(response.data.message || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      setError(error.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!doctorInfo) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading doctor information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-8 border border-gray-800 shadow-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold">Book Appointment</h1>
          </div>
        </motion.div>

        {/* Doctor Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800"
        >
          <h2 className="text-xl font-semibold mb-4">Doctor Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="font-medium">Dr. {doctorInfo.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Stethoscope className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Specialization</p>
                <p className="font-medium">{doctorInfo.specialization}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-medium">{doctorInfo.contact}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Booking Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-semibold mb-6">Select Date and Time</h2>
          
          {error && (
            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-gray-600"
              />
            </div>

            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Available Time Slots
                </label>
                {loading ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading available slots...</span>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-lg border transition-colors ${
                          selectedSlot === slot
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No available slots for this date</p>
                )}
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={loading || !selectedDate || !selectedSlot}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  Book Appointment
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default BookAppointment; 