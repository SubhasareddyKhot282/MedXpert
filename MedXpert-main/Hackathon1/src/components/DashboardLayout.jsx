import Header from "./Header";
import Footer from "./Footer";
import PropTypes from "prop-types";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Stethoscope, 
  Heart, 
  Info, 
  Calendar, 
  FileText, 
  Users, 
  Clock, 
  Activity,
  ArrowRight,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import Cookies from "js-cookie";

function DashboardLayout({ userType }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    sharedReports: 0,
    upcomingAppointments: 0,
    medicalReports: 0,
    totalDoctors: 0,
    recentActivity: "",
    recentActivities: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:3000/api/${userType}/dashboard-stats`, {
          withCredentials: true
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Set default stats on error
        setStats({
          upcomingAppointments: 0,
          medicalReports: 0,
          totalDoctors: 0,
          recentActivity: 0,
          recentActivities: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [navigate]);

  const getProjectInfo = () => {
    const baseCardClasses = "rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-800";
    const statCardClasses = "bg-black rounded-xl p-4 shadow-md border border-gray-800";

    if (userType === "doctor") {
      return (
        <div className="space-y-6">
          <div className={`${baseCardClasses} bg-black`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gray-900 rounded-xl">
                <Stethoscope className="text-gray-400 w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-100">Doctor's Dashboard</h2>
                <p className="text-gray-400">Welcome back! Here's your overview</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="text-red-400 text-center py-4">{error}</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className={statCardClasses}>
                    <div className="flex items-center gap-3">
                      <Calendar className="text-gray-400 w-5 h-5" />
                      <h3 className="text-sm font-medium text-gray-400">Today's Appointments</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-100 mt-2">{stats.todayAppointments}</p>
                  </div>
                  <div className={statCardClasses}>
                    <div className="flex items-center gap-3">
                      <Users className="text-gray-400 w-5 h-5" />
                      <h3 className="text-sm font-medium text-gray-400">Total Patients</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-100 mt-2">{stats.totalPatients}</p>
                  </div>
                  <div className={statCardClasses}>
                    <div className="flex items-center gap-3">
                      <FileText className="text-gray-400 w-5 h-5" />
                      <h3 className="text-sm font-medium text-gray-400">Shared Reports</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-100 mt-2">{stats.sharedReports}</p>
                  </div>
                  <div className={statCardClasses}>
                    <div className="flex items-center gap-3">
                      <Clock className="text-gray-400 w-5 h-5" />
                      <h3 className="text-sm font-medium text-gray-400">Upcoming (7 days)</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-100 mt-2">{stats.upcomingAppointments}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-black p-4 rounded-xl border border-gray-800"
                  >
                    <h3 className="text-lg font-semibold text-gray-100 mb-2">Quick Actions</h3>
                    <div className="space-y-2">
                      <button 
                        onClick={() => navigate('/doctor/set-availability')}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        <span className="text-gray-400">Set Availability</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => navigate('/doctor/appointments')}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        <span className="text-gray-400">View Appointments</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => navigate('/doctor/prescriptions')}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        <span className="text-gray-400">Manage Prescriptions</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-black p-4 rounded-xl border border-gray-800"
                  >
                    <h3 className="text-lg font-semibold text-gray-100 mb-2">Recent Activity</h3>
                    <div className="space-y-3">
                      {stats.recentActivities?.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-900">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    if (userType === "patient") {
      return (
        <div className="space-y-6">
          <div className={`${baseCardClasses} bg-black`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gray-900 rounded-xl">
                <Heart className="text-gray-400 w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-100">Patient's Dashboard</h2>
                <p className="text-gray-400">Your health journey at a glance</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="text-red-400 text-center py-4">{error}</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className={statCardClasses}>
                    <div className="flex items-center gap-3">
                      <Calendar className="text-gray-400 w-5 h-5" />
                      <h3 className="text-sm font-medium text-gray-400">Upcoming Appointments</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-100 mt-2">{stats.upcomingAppointments}</p>
                  </div>
                  <div className={statCardClasses}>
                    <div className="flex items-center gap-3">
                      <FileText className="text-gray-400 w-5 h-5" />
                      <h3 className="text-sm font-medium text-gray-400">Medical Reports</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-100 mt-2">{stats.medicalReports}</p>
                  </div>
                  <div className={statCardClasses}>
                    <div className="flex items-center gap-3">
                      <Users className="text-gray-400 w-5 h-5" />
                      <h3 className="text-sm font-medium text-gray-400">My Doctors</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-100 mt-2">{stats.totalDoctors}</p>
                  </div>
                  <div className={statCardClasses}>
                    <div className="flex items-center gap-3">
                      <Clock className="text-gray-400 w-5 h-5" />
                      <h3 className="text-sm font-medium text-gray-400">Recent Activity</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-100 mt-2">{stats.recentActivity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-black p-4 rounded-xl border border-gray-800"
                  >
                    <h3 className="text-lg font-semibold text-gray-100 mb-2">Quick Actions</h3>
                    <div className="space-y-2">
                      <button 
                        onClick={() => navigate('/patient/book-appointment')}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        <span className="text-gray-400">Book New Appointment</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => navigate('/patient/uploadData')}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        <span className="text-gray-400">Upload Medical Report</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => navigate('/patient/Myfiles')}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        <span className="text-gray-400">View My Records</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-black p-4 rounded-xl border border-gray-800"
                  >
                    <h3 className="text-lg font-semibold text-gray-100 mb-2">Recent Activity</h3>
                    <div className="space-y-3">
                      {stats.recentActivities?.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-900">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={`${baseCardClasses} bg-black`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gray-900 rounded-xl">
            <Info className="text-gray-400 w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-100">Welcome to MedXpert</h2>
            <p className="text-gray-400">Your healthcare companion</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header userType={userType} />

      {location.pathname === `/${userType}` && (
        isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : getProjectInfo()
      )}

      <main className="flex-grow px-4 md:px-10 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : <Outlet />}
      </main>

      <Footer />
    </div>
  );
}

DashboardLayout.propTypes = {
  userType: PropTypes.string.isRequired,
};

export default DashboardLayout;
