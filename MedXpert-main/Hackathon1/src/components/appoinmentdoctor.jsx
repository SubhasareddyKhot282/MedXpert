import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { CalendarIcon, ClockIcon, UserIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

function AppointmentDoctor() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedAppointments, setGroupedAppointments] = useState({});
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:3000/booked-slots', {
          withCredentials: true,
        });
        
        setAppointments(response.data);
        groupAppointmentsByDate(response.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const groupAppointmentsByDate = (appointments) => {
    const grouped = appointments.reduce((acc, appt) => {
      const date = new Date(appt.date).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(appt);
      return acc;
    }, {});
    setGroupedAppointments(grouped);
  };

  const handleDateFilterChange = (event) => {
    setSelectedDate(event.target.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  if (Object.keys(groupedAppointments).length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center p-8 bg-gray-900 rounded-2xl shadow-xl max-w-md w-full mx-4 border border-gray-800">
          <div className="mb-4">
            <CalendarIcon className="h-16 w-16 text-white mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-100 mb-2">No Appointments</h3>
          <p className="text-gray-400">No patients have booked appointments yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-100 mb-4">Patient Appointments</h2>
          <p className="text-lg text-gray-400">Manage and view your upcoming appointments</p>
        </motion.div>

        {/* Date Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-800"
        >
          <label htmlFor="dateFilter" className="block text-sm font-semibold text-gray-300 mb-2">
            Filter by Date
          </label>
          <select
            id="dateFilter"
            className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-white focus:border-white text-gray-100"
            onChange={handleDateFilterChange}
            value={selectedDate}
          >
            <option value="">All Dates</option>
            {Object.keys(groupedAppointments).map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Appointments */}
        <div className="space-y-8">
          {Object.keys(groupedAppointments).map((date) =>
            (selectedDate === '' || selectedDate === date) ? (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-800"
              >
                <div className="px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900">
                  <h3 className="text-xl font-bold text-gray-100">{date}</h3>
                </div>
                <div className="divide-y divide-gray-800">
                  {groupedAppointments[date].map((appt) => {
                    const patient = appt.patientId;
                    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';

                    return (
                      <Link
                        key={appt._id}
                        to={`/doctor/appointment/${appt._id}`}
                        className="block hover:bg-gray-800 transition-all duration-200"
                      >
                        <div className="px-6 py-6">
                          <div className="flex items-center space-x-6">
                            <div className="flex-shrink-0">
                              <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                <UserIcon className="h-8 w-8 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-xl font-semibold text-gray-100 truncate">
                                  {patientName}
                                </p>
                                <div className="ml-2 flex-shrink-0">
                                  <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-gray-800 text-gray-100 border border-gray-700">
                                    {appt.timeSlot}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div className="flex items-center text-sm text-gray-400">
                                  <EnvelopeIcon className="flex-shrink-0 mr-2 h-5 w-5 text-white" />
                                  <span>{patient?.email || 'Email not available'}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-400">
                                  <PhoneIcon className="flex-shrink-0 mr-2 h-5 w-5 text-white" />
                                  <span>{patient?.phone || 'Phone not available'}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-400">
                                  <CalendarIcon className="flex-shrink-0 mr-2 h-5 w-5 text-white" />
                                  <span>{new Date(appt.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-400">
                                  <ClockIcon className="flex-shrink-0 mr-2 h-5 w-5 text-white" />
                                  <span>{appt.timeSlot}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

export default AppointmentDoctor;
