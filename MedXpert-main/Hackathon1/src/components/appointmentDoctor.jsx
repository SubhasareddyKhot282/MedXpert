import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Stethoscope
} from 'lucide-react';

function AppointmentDoctor() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled
  const [sortBy, setSortBy] = useState('date'); // date, patient, status
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/appointments/doctor');
      setAppointments(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch appointments');
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await axios.patch(`/api/appointments/${appointmentId}`, { status: newStatus });
      setAppointments(appointments.map(apt => 
        apt._id === appointmentId ? { ...apt, status: newStatus } : apt
      ));
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Failed to update appointment status');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-900/50 text-green-400';
      case 'pending':
        return 'bg-yellow-900/50 text-yellow-400';
      case 'cancelled':
        return 'bg-red-900/50 text-red-400';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  const filteredAppointments = appointments
    .filter(apt => {
      const matchesSearch = 
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patientEmail.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filter === 'all' || apt.status.toLowerCase() === filter;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'patient':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="min-h-screen bg-black text-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl p-8 mb-8 border border-gray-800 shadow-xl"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
              <Stethoscope className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-200">Patient Appointments</h1>
              <p className="text-gray-400">Manage and track your patient appointments</p>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-gray-300 placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-800 rounded-lg border border-gray-700 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-gray-300"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 rounded-lg border border-gray-700 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-gray-300"
              >
                <option value="date">Sort by Date</option>
                <option value="patient">Sort by Patient</option>
                <option value="status">Sort by Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-gray-800 rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-700 transition-colors text-gray-300"
              >
                {sortOrder === 'asc' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Appointments List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading appointments...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/50 text-red-400 p-4 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-gray-900 rounded-2xl border border-gray-800">
              No appointments found
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <motion.div
                key={appointment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                        <User className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-200">{appointment.patientName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Mail className="w-4 h-4" />
                          <span>{appointment.patientEmail}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Phone className="w-4 h-4" />
                        <span>{appointment.patientPhone}</span>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${getStatusColor(appointment.status)}`}>
                        <span className="capitalize">{appointment.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                          className="px-4 py-2 bg-green-900/50 text-green-400 rounded-lg hover:bg-green-900/70 transition-colors"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                          className="px-4 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900/70 transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AppointmentDoctor; 