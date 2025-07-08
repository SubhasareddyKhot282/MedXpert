import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  CalendarCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Building2,
  GraduationCap,
  Award,
  FileText,
  Receipt,
  FileUp,
  Plus,
  Search,
  X
} from "lucide-react";
import { Link } from "react-router-dom";

// Common medications list
const commonMedications = [
  { name: "Paracetamol" },
  { name: "Amoxicillin" },
  { name: "Ibuprofen" },
  { name: "Omeprazole" },
  { name: "Metformin" },
  { name: "Atorvastatin" },
  { name: "Lisinopril" },
  { name: "Levothyroxine" },
  { name: "Metoprolol" },
  { name: "Amlodipine" },
  { name: "Albuterol" },
  { name: "Gabapentin" },
  { name: "Hydrochlorothiazide" },
  { name: "Sertraline" },
  { name: "Escitalopram" },
  { name: "Losartan" },
  { name: "Pantoprazole" },
  { name: "Tramadol" },
  { name: "Diazepam" },
  { name: "Prednisone" }
];

function AppointmentDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(location.state?.appointment);
  const [loading, setLoading] = useState(!appointment);
  const [patientFiles, setPatientFiles] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'reports', 'prescription', 'billing'
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    medicines: []
  });
  const [newBill, setNewBill] = useState({
    items: [{ name: '', quantity: 1, cost: 0 }]
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [error, setError] = useState(null);
  const isPatient = location.state?.isPatient;

  // Update fetchPatientFiles to handle both patient and doctor views
  const fetchPatientFiles = async () => {
    try {
      let response;
      
      if (isPatient) {
        // For patients, fetch their own files
        response = await axios.get('http://localhost:3000/medical-files/my-files', {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        // For doctors, fetch files shared with them for this patient
        response = await axios.get(`http://localhost:3000/medical-files/${appointment.patientId._id}`, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      // Ensure we only show shared files for doctors
      const files = Array.isArray(response.data) ? response.data : [];
      if (!isPatient) {
        // Double check that files are actually shared with this doctor
        const sharedFiles = files.filter(file => 
          file.sharedWith?.some(id => id.toString() === appointment.doctorId._id.toString())
        );
        setPatientFiles(sharedFiles);
      } else {
        setPatientFiles(files);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setPatientFiles([]);
    }
  };

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/appointment/${appointmentId}`, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        });
        
        if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
          setError('Server returned invalid response format');
          setLoading(false);
          return;
        }

        if (!response.data || !response.data.doctorId) {
          throw new Error('Invalid appointment data received');
        }
        setAppointment(response.data);
      } catch (error) {
        console.error("Error fetching appointment details:", error);
        setError(error.response?.data?.message || "Failed to fetch appointment details");
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (location.state?.appointment) {
      setAppointment(location.state.appointment);
      setLoading(false);
    } else if (!appointment && appointmentId) {
      fetchAppointment();
    }

    // Fetch prescriptions
    const fetchPrescriptions = async () => {
      if (!appointment?.patientId?._id) return;
      
      try {
        const response = await axios.get(`http://localhost:3000/prescriptions/${appointment.patientId._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setPrescriptions(response.data);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      }
    };

    if (appointment) {
      fetchPatientFiles();
      fetchPrescriptions();
    }
  }, [location, appointment, appointmentId, navigate]);

  // Filter medications based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMedications([]);
      return;
    }

    const filtered = commonMedications.filter(med => 
      med.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMedications(filtered);
  }, [searchQuery]);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleAddPrescription = async () => {
    try {
      // Filter out any medicines with empty name or quantity
      const validMedicines = newPrescription.medicines.filter(
        med => med.name.trim() !== '' && med.quantity.trim() !== ''
      );

      if (validMedicines.length === 0) {
        alert("Please add at least one medicine with name and quantity");
        return;
      }

      const response = await axios.post(`http://localhost:3000/prescriptions/${appointmentId}`, {
        medicines: validMedicines
      }, {
        withCredentials: true
      });
      setPrescriptions([...prescriptions, response.data.prescription]);
      setShowPrescriptionForm(false);
      setNewPrescription({ medicines: [] });
    } catch (error) {
      console.error("Error adding prescription:", error);
      alert("Failed to add prescription. Please make sure all required fields are filled.");
    }
  };

  const handleAddBill = async () => {
    try {
      const response = await axios.post(`http://localhost:3000/billing/${appointmentId}`, {
        items: newBill.items
      });
      setShowBillingForm(false);
      setNewBill({ items: [{ name: '', quantity: 1, cost: 0 }] });
    } catch (error) {
      console.error("Error adding bill:", error);
    }
  };

  const handleAddMedication = (medication) => {
    setNewPrescription({
      medicines: [
        ...newPrescription.medicines,
        {
          name: medication.name,
          quantity: "1 tablet",
          instructions: "Take as prescribed"
        }
      ]
    });
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', 'Medical file uploaded during appointment');
      
      if (appointment?.doctorId?._id) {
        formData.append('sharedWith', appointment.doctorId._id);
      }

      await axios.post('http://localhost:3000/medical-files/upload', formData, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      await fetchPatientFiles(); // Refresh the file list
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  const handleShareFile = async (fileId) => {
    if (!appointment?.doctorId?._id) {
      alert('No doctor associated with this appointment');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/medical-files/${fileId}/share`,
        {
          doctorId: appointment.doctorId._id
        },
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.message === 'File shared successfully') {
        alert('File shared successfully with the doctor');
        await fetchPatientFiles();
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error sharing file:', error);
      alert('Failed to share file. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading appointment details...</span>
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

  // Render patient view
  if (isPatient) {
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
              <h1 className="text-3xl font-bold">Appointment Details</h1>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="bg-gray-900 rounded-2xl p-8 mb-8 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">Doctor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="font-medium">Dr. {appointment?.doctorId?.firstName} {appointment?.doctorId?.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-medium">{appointment?.doctorId?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="font-medium">{appointment?.doctorId?.phone}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Speciality</p>
                    <p className="font-medium">{appointment?.doctorId?.speciality}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="font-medium">{new Date(appointment?.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Time</p>
                    <p className="font-medium">{appointment?.timeSlot}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Files Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Medical Files</h3>
              {isPatient && (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    <FileUp className="w-5 h-5" />
                    Upload File
                  </label>
                </div>
              )}
            </div>
            
            {patientFiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patientFiles.map((file) => (
                  <div key={file._id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-medium">{file.fileName}</h4>
                        <p className="text-gray-400 text-sm">{file.fileType}</p>
                        {file.description && (
                          <p className="text-gray-400 text-sm mt-1">{file.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`http://localhost:3000/medical-files/view/${file._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View
                        </a>
                        {isPatient && !file.sharedWith?.includes(appointment?.doctorId?._id) && (
                          <button
                            onClick={() => handleShareFile(file._id)}
                            className="text-green-400 hover:text-green-300"
                          >
                            Share
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No files uploaded yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render doctor view
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
            <h1 className="text-3xl font-bold">Appointment Details</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-8 border border-gray-800">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'details'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'reports'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('prescription')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'prescription'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Prescription
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'billing'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Billing
            </button>
          </div>

          <div className="mt-6">
            {activeTab === 'details' && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Name</p>
                      <p className="font-medium">{appointment.patientId?.firstName} {appointment.patientId?.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="font-medium">{appointment.patientId?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="font-medium">{appointment.patientId?.phone || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                {/* Appointment Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Appointment Information</h2>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Date</p>
                      <p className="font-medium">{new Date(appointment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Time</p>
                      <p className="font-medium">{appointment.timeSlot}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Medical Reports</h2>
                {patientFiles.length > 0 ? (
                  <div className="grid gap-4">
                    {patientFiles.map((file) => (
                      <div key={file._id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{file.fileName}</p>
                            <p className="text-sm text-gray-400">{file.fileType}</p>
                            {file.description && (
                              <p className="text-sm text-gray-400 mt-1">{file.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <a
                            href={`http://localhost:3000/medical-files/view/${file._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            View File
                          </a>
                          <span className="text-green-400">Shared</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No shared medical reports available.</p>
                )}
              </div>
            )}

            {activeTab === 'prescription' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Prescriptions</h2>
                  <button
                    onClick={() => setShowPrescriptionForm(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add Prescription
                  </button>
                </div>

                {showPrescriptionForm && (
                  <div className="bg-gray-800 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold mb-4">New Prescription</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="text"
                          placeholder="Search medications..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1 px-4 py-2 bg-gray-700 rounded-lg text-white"
                        />
                        <button
                          onClick={() => setShowPrescriptionForm(false)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                      {showSuggestions && (
                        <div className="bg-gray-700 rounded-lg p-2">
                          {filteredMedications.map((med) => (
                            <div
                              key={med}
                              onClick={() => {
                                setNewPrescription({
                                  ...newPrescription,
                                  medicines: [...newPrescription.medicines, { name: med, quantity: 1 }]
                                });
                                setSearchQuery('');
                                setShowSuggestions(false);
                              }}
                              className="px-4 py-2 hover:bg-gray-600 rounded cursor-pointer"
                            >
                              {med}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {prescriptions.length > 0 ? (
                  <div className="grid gap-4">
                    {prescriptions.map((prescription) => (
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
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No prescriptions available.</p>
                )}
              </div>
            )}

            {activeTab === 'billing' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Billing</h2>
                  <button
                    onClick={() => setShowBillingForm(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add Bill
                  </button>
                </div>

                {showBillingForm && (
                  <div className="bg-gray-800 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold mb-4">New Bill</h3>
                    <div className="space-y-4">
                      {newBill.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4">
                          <input
                            type="text"
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) => {
                              const newItems = [...newBill.items];
                              newItems[index].name = e.target.value;
                              setNewBill({ ...newBill, items: newItems });
                            }}
                            className="px-4 py-2 bg-gray-700 rounded-lg text-white"
                          />
                          <input
                            type="number"
                            placeholder="Quantity"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...newBill.items];
                              newItems[index].quantity = parseInt(e.target.value);
                              setNewBill({ ...newBill, items: newItems });
                            }}
                            className="px-4 py-2 bg-gray-700 rounded-lg text-white"
                          />
                          <input
                            type="number"
                            placeholder="Cost"
                            value={item.cost}
                            onChange={(e) => {
                              const newItems = [...newBill.items];
                              newItems[index].cost = parseFloat(e.target.value);
                              setNewBill({ ...newBill, items: newItems });
                            }}
                            className="px-4 py-2 bg-gray-700 rounded-lg text-white"
                          />
                        </div>
                      ))}
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => setShowBillingForm(false)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            // Handle bill submission
                            setShowBillingForm(false);
                          }}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          Save Bill
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetails; 