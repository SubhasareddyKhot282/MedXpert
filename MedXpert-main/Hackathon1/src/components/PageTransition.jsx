import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

const pageNames = {
  "/doctor": "Dashboard",
  "/login": "Login",
  "/signup": "Sign Up",
  "/doctor/appointments": "Doctor Appointments",
  "/doctor/profile": "Doctor Profile",
  "/doctor/availability": "Set Availability",
  "/patient/labreports": "Lab Reports",
  "/patient/profile": "Patient Profile",
  "/patient/appointments": "Appointments",
  "/patient/treatmentanddiagnosis": "Treatment & Diagnosis",
  "/patient/uploadData": "Upload Files",
  "/patient/Myfiles": "My Files",
  "/patient/settings": "Settings",
};

const PageTransition = ({ children }) => {
  const location = useLocation();
  const pageName = pageNames[location.pathname] || "Page";
  const [showContent, setShowContent] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    setShowContent(false);
    
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="relative w-full h-full">
      {/* Main Content */}
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      )}

      {/* Transition Overlay */}
      <AnimatePresence mode="wait">
        {isAnimating && (
          <motion.div
            key={location.pathname}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ 
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="fixed inset-0 bg-white z-[9999]"
          >
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-black tracking-tight"
            >
              {pageName}
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageTransition; 