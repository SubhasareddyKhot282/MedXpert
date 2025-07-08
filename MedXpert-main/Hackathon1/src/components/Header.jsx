import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  FileText,
  User,
  Upload,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

function Header({ userType }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    navigate("/login");
  };

  const navItems = {
    patient: [
      { to: `/${userType}`, icon: Home, label: "Home" },
      { to: `/${userType}/appointments`, icon: Calendar, label: "Appointments" },
      { to: `/${userType}/labreports`, icon: FileText, label: "Lab Reports" },
      { to: `/${userType}/uploadData`, icon: Upload, label: "Upload" },
      { to: `/${userType}/Myfiles`, icon: FileText, label: "My Files" }
    ],
    doctor: [
      { to: `/${userType}`, icon: Home, label: "Home" },
      { to: `/${userType}/appointments`, icon: Calendar, label: "Appointments" },
      { to: `/${userType}/profile`, icon: User, label: "Profile" },
      { to: `/${userType}/availability`, icon: Calendar, label: "Availability" }
    ]
  };

  return (
    <header className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            MedXpert
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems[userType].map((item, index) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.to}
                  className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-900"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            ))}
            
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navItems[userType].length * 0.1 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-900 ml-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </motion.button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{ height: isMobileMenuOpen ? "auto" : 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-1">
            {navItems[userType].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-900 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

Header.propTypes = {
  userType: PropTypes.string.isRequired,
};

export default Header;
