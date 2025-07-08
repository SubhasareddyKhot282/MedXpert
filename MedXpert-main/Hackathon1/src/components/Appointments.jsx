import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  CalendarCheck,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Filter,
  Search,
  ArrowRight,
  FileText
} from "lucide-react";

function Appointments() {
  const navigate = useNavigate();
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, upcoming, past
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;

  useEffect(() => {
    fetchAppointments();
    
    // Check if we came from lab report with a selected doctor
    if (location.state?.fromLabReport && location.state?.selectedDoctorId) {
      // You can add logic here to highlight or focus on the selected doctor's appointments
      console.log('Selected doctor from lab report:', location.state.selectedDoctorId);
    }
  }, [location.state]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/booked-slots");
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filterAppointments = (appointments) => {
    const now = new Date();
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      const matchesSearch = appointment.doctorId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          appointment.doctorId?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          appointment.doctorId?.speciality?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      switch (filter) {
        case "upcoming":
          return appointmentDate >= now;
        case "past":
          return appointmentDate < now;
        default:
          return true;
      }
    });
  };

  const filteredAppointments = filterAppointments(appointments);
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * appointmentsPerPage,
    currentPage * appointmentsPerPage
  );

  const handleViewDetails = (appointment) => {
    console.log('Navigating to appointment details:', appointment._id);
    console.log('Full path:', `/patient/appointment/${appointment._id}`);
    // Navigate to appointment details page with appointment data
    navigate(`/patient/appointment/${appointment._id}`, { 
      state: { 
        appointment,
        isPatient: true 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading appointments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-8 border border-gray-800 shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
                <CalendarCheck className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
                <p className="text-gray-400">Manage and view your healthcare appointments</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-gray-600"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-gray-600"
              >
                <option value="all">All Appointments</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Appointments List */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {paginatedAppointments.map((appointment) => (
              <motion.div
                key={appointment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center">
                      <Stethoscope className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Dr. {appointment.doctorId?.firstName} {appointment.doctorId?.lastName}
                      </h3>
                      <div className="space-y-2 text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.timeSlot}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4" />
                          <span>{appointment.doctorId?.speciality}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{appointment.doctorId?.email}</span>
                        </div>
                        {appointment.doctorId?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{appointment.doctorId?.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        new Date(appointment.date) >= new Date()
                          ? "bg-green-500/20 text-green-500"
                          : "bg-gray-500/20 text-gray-500"
                      }`}>
                        {new Date(appointment.date) >= new Date() ? "Upcoming" : "Past"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/patient/prescriptions/${appointment.patientId}`)}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-4 py-2 rounded-lg hover:bg-blue-500/20"
                      >
                        View Prescriptions
                        <FileText className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewDetails(appointment)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredAppointments.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-2">No Appointments Found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </motion.div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Appointments;
