import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar,
  Clock,
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Stethoscope,
  CalendarCheck,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import axios from "axios";

function DoctorAppointments() {
  const { doctorId } = useParams();
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [weeklySlots, setWeeklySlots] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const res = await axios.get(`/doctor/${doctorId}`);
        if (res.data.error) {
          setError("Error fetching doctor details");
          return;
        }
        setDoctorDetails(res.data.doctor);
      } catch (err) {
        setError("Failed to fetch doctor details");
      }
    };
    fetchDoctorDetails();
  }, [doctorId]);

  const getNext7Dates = () => {
    const dates = [];
    const startDate = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };

  useEffect(() => {
    const fetchWeeklySlots = async () => {
      const results = {};
      const dates = getNext7Dates();
      for (const date of dates) {
        try {
          const res = await axios.get(`/available-slots?doctorId=${doctorId}&date=${date}`);
          results[date] = res.data?.slots || [];
        } catch (err) {
          results[date] = [];
        }
      }
      setWeeklySlots(results);
    };
    fetchWeeklySlots();
  }, [doctorId, currentWeekStart]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setAvailableSlots(weeklySlots[date] || []);
    setSelectedTimeSlot("");
    setError(null);
    setSuccess(null);
  };

  const handleTimeSelect = (slot) => {
    setSelectedTimeSlot(slot);
    setError(null);
    setSuccess(null);
  };

  const handleBooking = async () => {
    if (!selectedTimeSlot) {
      setError("Please select a time slot");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await axios.post("/book-slot", {
        doctorId,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
      });

      setAvailableSlots(prev => prev.filter(slot => slot !== selectedTimeSlot));
      setWeeklySlots(prev => ({
        ...prev,
        [selectedDate]: prev[selectedDate].filter(slot => slot !== selectedTimeSlot)
      }));
      
      setSuccess("Appointment booked successfully!");
      setSelectedTimeSlot(null);
    } catch (error) {
      console.error("Booking error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const prevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  if (!doctorDetails) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading doctor details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section with Doctor Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-8 border border-gray-800 shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
                <Stethoscope className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Dr. {doctorDetails.name}</h1>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    <span>{doctorDetails.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5" />
                    <span>{doctorDetails.specialization}</span>
                  </div>
                </div>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white text-black px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <CalendarCheck className="w-5 h-5" />
              <span>Book Appointment</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Date Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Select a Date
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={prevWeek}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextWeek}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {getNext7Dates().map((date) => {
              const isAvailable = (weeklySlots[date] || []).length > 0;
              const isSelected = selectedDate === date;
              const day = new Date(date).toLocaleDateString(undefined, { weekday: "short" });
              const dayNum = new Date(date).getDate();
              
              return (
                <motion.button
                  key={date}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDateSelect(date)}
                  disabled={!isAvailable}
                  className={`p-4 rounded-xl text-center transition-all ${
                    isSelected
                      ? "bg-white text-black"
                      : isAvailable
                      ? "bg-gray-800 text-white hover:bg-gray-700"
                      : "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <div className="text-sm font-medium mb-1">{day}</div>
                  <div className="text-2xl font-bold">{dayNum}</div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Time Slot Selection */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Available Time Slots
            </h2>
            {availableSlots.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No slots available for this date</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableSlots.map((slot) => (
                  <motion.button
                    key={slot}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTimeSelect(slot)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedTimeSlot === slot
                        ? "bg-white text-black"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                  >
                    {slot}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-xl mb-4"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-green-500 bg-green-500/10 p-4 rounded-xl mb-4"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Button */}
        {selectedTimeSlot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBooking}
              disabled={loading}
              className="w-full max-w-md flex items-center justify-center gap-2 px-6 py-4 bg-white text-black rounded-xl font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  Confirm Appointment
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default DoctorAppointments;
