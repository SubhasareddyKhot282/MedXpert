import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightIcon, UserIcon, LockClosedIcon, EnvelopeIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';

function AuthPage({ isSignup }) {
  const [isSignupMode, setIsSignupMode] = useState(isSignup);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("patient");
  const [speciality, setSpeciality] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignupMode) {
      try {
        const response = await axios.post("http://localhost:3000/signup", {
          firstName,
          lastName,
          email,
          password,
          role: userType,
          speciality: userType === "doctor" ? speciality.trim() : null,
        });

        if (response.data.success) {
          setIsSignupMode(false);
          setError("");
        } else {
          setError(response.data.message || "Signup failed");
        }
      } catch (error) {
        setError(error.response?.data?.message || "Error during signup");
      }
    } else {
      try {
        const response = await axios.post("http://localhost:3000/login", {
          email,
          password,
        }, {
          withCredentials: true
        });

        if (response.data.success) {
          // Store user type in localStorage as backup
          localStorage.setItem('userType', response.data.role);
          
          // Set cookies manually as backup
          Cookies.set('userType', response.data.role, { 
            expires: 1,
            path: '/',
            domain: 'localhost'
          });
          
          // Navigate based on role
          if (response.data.role === "patient") {
            navigate("/patient", { replace: true });
          } else {
            navigate("/doctor", { replace: true });
          }
        } else {
          setError(response.data.message || "Login failed");
        }
      } catch (error) {
        console.error("Login error:", error);
        setError(error.response?.data?.message || "Error during login");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex items-center justify-center">
      <div className="container mx-auto px-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={isSignupMode ? "signup" : "login"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-lg border border-white/10">
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">
                    {isSignupMode ? "Create Account" : "Welcome Back"}
                  </h1>
                  <p className="text-white/60 text-sm font-light">
                    {isSignupMode ? "Join our healthcare platform" : "Sign in to your account"}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsSignupMode(!isSignupMode);
                    setError("");
                  }}
                  className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1 group"
                >
                  <span>{isSignupMode ? "Login" : "Signup"}</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignupMode && (
                  <div className="space-y-6">
                    <div className="relative group">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                      <select
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white hover:border-white/20"
                      >
                        <option value="doctor" className="bg-black">Doctor</option>
                        <option value="patient" className="bg-black">Patient</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative group">
                        <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First Name"
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white hover:border-white/20"
                        />
                      </div>
                      <div className="relative group">
                        <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last Name"
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white hover:border-white/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative group">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white hover:border-white/20"
                  />
                </div>

                <div className="relative group">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white hover:border-white/20"
                  />
                </div>

                {userType === "doctor" && isSignupMode && (
                  <div className="relative group">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                    <select
                      name="speciality"
                      value={speciality}
                      onChange={(e) => setSpeciality(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white hover:border-white/20"
                    >
                      <option value="" disabled className="bg-black">Select Speciality</option>
                      {[
                        "Gastroenterologist",
                        "Neurologist",
                        "Endocrinologist",
                        "Infectious Disease Specialist",
                        "General Practitioner",
                        "Cardiologist",
                      ].map((spec) => (
                        <option key={spec} value={spec} className="bg-black">
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 px-4 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-all duration-300"
                >
                  {isSignupMode ? "Create Account" : "Sign In"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

AuthPage.propTypes = {
  isSignup: PropTypes.bool.isRequired,
};

export default AuthPage;
