import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  Calendar,
  User,
  ArrowLeft,
  Loader2,
  AlertCircle
} from "lucide-react";

function PrescriptionList() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/prescriptions/${patientId}`);
      setPrescriptions(response.data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setError("Failed to fetch prescriptions");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading prescriptions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-8 border border-gray-800 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold">My Prescriptions</h1>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-6">
          {prescriptions.length > 0 ? (
            prescriptions.map((prescription) => (
              <div key={prescription._id} className="bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-400">
                      Prescribed by: Dr. {prescription.doctorId.firstName} {prescription.doctorId.lastName}
                    </p>
                    <p className="text-sm text-gray-400">
                      Date: {new Date(prescription.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {prescription.medicines.map((medicine, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 p-4 bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-400">Medicine</p>
                        <p className="font-medium">{medicine.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Quantity</p>
                        <p className="font-medium">{medicine.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Instructions</p>
                        <p className="font-medium">{medicine.instructions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Prescriptions Found</h3>
              <p className="text-gray-400">You don't have any prescriptions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrescriptionList; 