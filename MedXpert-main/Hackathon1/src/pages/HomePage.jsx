import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handlePatientClick = () => {
    navigate('/signup');
  };

  const handleDoctorClick = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black z-50"
          >
            <div className="text-center">
              <motion.h1 
                className="text-7xl font-bold mb-4 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                MedXpert
              </motion.h1>
              <motion.div 
                className="w-24 h-1 bg-white mx-auto"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="page-transition"
          >
            <div className="container mx-auto px-4 py-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-4xl mx-auto"
              >
                <h1 className="text-8xl font-bold mb-6 project-name tracking-tight">
                  MedXpert
                </h1>
                <p className="text-xl text-white/60 mb-12 font-light">
                  Connecting healthcare professionals with patients through advanced AI technology
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 backdrop-blur-sm p-8 rounded-lg border border-white/10"
                  >
                    <h2 className="text-3xl font-bold mb-4">For Patients</h2>
                    <p className="text-white/60 mb-6">
                      Find the right specialist, book appointments, and manage your healthcare journey with ease.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePatientClick}
                      className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-all duration-300"
                    >
                      Find a Doctor
                    </motion.button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/5 backdrop-blur-sm p-8 rounded-lg border border-white/10"
                  >
                    <h2 className="text-3xl font-bold mb-4">For Doctors</h2>
                    <p className="text-white/60 mb-6">
                      Expand your practice, manage appointments, and provide better care with our AI-powered platform.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDoctorClick}
                      className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-all duration-300"
                    >
                      Join as Doctor
                    </motion.button>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-center"
                >
                  <h2 className="text-4xl font-bold mb-6">Why Choose MedXpert?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      {
                        title: "AI-Powered Matching",
                        description: "Find the perfect doctor-patient match using advanced algorithms"
                      },
                      {
                        title: "Secure Platform",
                        description: "Your data is protected with enterprise-grade security"
                      },
                      {
                        title: "24/7 Support",
                        description: "Round-the-clock assistance for all your needs"
                      }
                    ].map((feature, index) => (
                      <div key={index} className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10">
                        <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                        <p className="text-white/60">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HomePage;
