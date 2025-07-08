import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const DEFAULT_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "03:00 PM",
];

const SetAvailability = () => {
  const [date, setDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSlotToggle = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!date || selectedSlots.length === 0) {
      setMessage("Please select a date and at least one time slot.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:3000/doctor/availability",
        {
          date,
          slots: selectedSlots,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);
      setDate("");
      setSelectedSlots([]);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Something went wrong.";
      setMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-100 mb-4">Set Your Availability</h2>
          <p className="text-lg text-gray-400">Manage your appointment slots for patients</p>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-800"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Select Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 focus:ring-2 focus:ring-white focus:border-white transition-all"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Time Slots Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Select Time Slots
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {DEFAULT_SLOTS.map((slot) => (
                  <motion.button
                    key={slot}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSlotToggle(slot)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedSlots.includes(slot)
                        ? "bg-white text-black"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {slot}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Save Availability
                </>
              )}
            </motion.button>
          </form>

          {/* Message Display */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                message.includes("success") || message.includes("Success")
                  ? "bg-gray-800 text-gray-100"
                  : "bg-gray-800 text-gray-100"
              }`}
            >
              {message.includes("success") || message.includes("Success") ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <AlertCircle className="w-5 h-5 text-white" />
              )}
              <span>{message}</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SetAvailability;
