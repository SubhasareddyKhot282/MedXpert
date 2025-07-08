import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardLayout from "./components/DashboardLayout";
import DoctorAppointments from "./components/appoinmentdoctor";
import DoctorProfile from "./components/DoctorProfile";
import SetAvailability from "./components/docotr-set-slots";
import LabReport from "./components/LabReport";
import PatientProfile from "./components/Profile";
import Appointments from "./components/Appointments";
import TreatmentAndDiagnosis from "./components/Treatmentanddiagnosis";
import UploadData from "./components/uploadFile";
import MyFiles from "./components/GetFiles";
import Settings from "./components/Settings";
import PageTransition from "./components/PageTransition";
import AppointmentDetails from "./components/AppointmentDetails";
import PrescriptionList from "./components/PrescriptionList";
import PatientAppointmentDetails from "./components/PatientAppointmentDetails";
import BookAppointment from "./components/BookAppointment";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          } />
          <Route path="/signup" element={
            <PageTransition>
              <SignupPage />
            </PageTransition>
          } />
          
          {/* Doctor Routes */}
          <Route path="/doctor" element={
            <PageTransition>
              <ProtectedRoute requiredRole="doctor">
                <DashboardLayout userType="doctor" />
              </ProtectedRoute>
            </PageTransition>
          }>
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="availability" element={<SetAvailability />} />
            <Route path="appointment/:appointmentId" element={<AppointmentDetails />} />
          </Route>

          {/* Patient Routes */}
          <Route path="/patient" element={
            <PageTransition>
              <ProtectedRoute requiredRole="patient">
                <DashboardLayout userType="patient" />
              </ProtectedRoute>
            </PageTransition>
          }>
            <Route path="labreports" element={<LabReport />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="book-appointment" element={<BookAppointment />} />
            <Route path="treatmentanddiagnosis" element={<TreatmentAndDiagnosis />} />
            <Route path="uploadData" element={<UploadData />} />
            <Route path="Myfiles" element={<MyFiles />} />
            <Route path="settings" element={<Settings />} />
            <Route path="prescriptions/:patientId" element={<PrescriptionList />} />
            <Route path="appointment/:appointmentId" element={<AppointmentDetails />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
