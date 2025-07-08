import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileText, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ArrowRight,
  Info
} from "lucide-react";

function LabReport() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [recommendedDoctor, setRecommendedDoctor] = useState(null);
  const [matchedDoctors, setMatchedDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Please select a valid PDF file");
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("http://127.0.0.1:5000/generate_report", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      setRecommendedDoctor(data.recommended_doctor);

      const compareResponse = await fetch("http://localhost:3000/doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommended_doctor: data.recommended_doctor }),
      });

      const compareData = await compareResponse.json();
      if (compareData.error) {
        setError(compareData.error);
      } else {
        setMatchedDoctors(compareData.doctors);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAppointment = (doctorId) => {
    navigate('/patient/book-appointment', { 
      state: { 
        doctorId: doctorId,
        fromLabReport: true,
        doctorInfo: matchedDoctors.find(doc => doc._id === doctorId)
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Upload Lab Report</h1>
          <p className="text-gray-400">Get expert medical analysis and doctor recommendations</p>
        </motion.div>

        {/* Instructions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800"
        >
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold mb-3">How it works</h2>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-sm">1</span>
                  Upload your lab report in PDF format
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-sm">2</span>
                  Our AI analyzes your report and identifies key findings
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-sm">3</span>
                  Get matched with specialized doctors based on your needs
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-sm">4</span>
                  Book an appointment with your chosen doctor
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Select your lab report (PDF only)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-800 border-dashed rounded-lg hover:border-gray-700 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-400">
                    <label className="relative cursor-pointer rounded-md font-medium text-white hover:text-gray-300">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="application/pdf"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF up to 10MB</p>
                </div>
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{selectedFile.name}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Analyze Report
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Results Section */}
        {!loading && recommendedDoctor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Recommended Specialization */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">Recommended Specialization</h2>
              <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                <FileText className="w-6 h-6 text-gray-400" />
                <span className="text-lg font-medium">{recommendedDoctor}</span>
              </div>
            </div>

            {/* Matched Doctors */}
            {matchedDoctors.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Available Doctors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchedDoctors.map((doc, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">{doc.name}</h3>
                          <p className="text-gray-400">{doc.specialization}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>Contact:</span>
                          <span>{doc.contact}</span>
                        </div>
                        <button
                          onClick={() => handleAppointment(doc._id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                        >
                          Book Appointment
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                No matching doctors found at the moment.
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default LabReport;
