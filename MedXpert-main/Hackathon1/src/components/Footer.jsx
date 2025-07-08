// import PropTypes from "prop-types";

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-sm">
          &copy; 2025 Team A11, KLE Technological University, Belagvi.
        </div>

        <div className="space-x-6">
          <a href="/terms" className="hover:text-gray-300">
            Terms of Service
          </a>
          <a href="/privacy" className="hover:text-gray-300">
            Privacy Policy
          </a>
          <a href="/contact" className="hover:text-gray-300">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

// Footer.propTypes = {
//   userType: PropTypes.string.isRequired,
// };

export default Footer;
