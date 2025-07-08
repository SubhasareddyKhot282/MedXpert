import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Stethoscope,
  FileText,
  Upload,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

function PatientAppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    fetchAppointmentDetails();
    fetchFiles();
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/appointment/${appointmentId}`, {
        withCredentials: true
      });
      console.log('Fetched appointment details:', response.data);
      if (!response.data || !response.data.doctorId) {
        throw new Error('Invalid appointment data received');
      }
      setAppointment(response.data);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      setError("Failed to fetch appointment details");
      toast.error("Failed to load appointment details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      console.log('Fetching files...');
      const response = await axios.get('http://localhost:3000/medical-files/my-files', {
        withCredentials: true
      });
      console.log('Fetched files response:', response.data);
      setFiles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching files:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setFiles([]);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, PDF, and DOC files are allowed.');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', `Uploaded on ${new Date().toLocaleDateString()}`);

    try {
      console.log('Starting file upload...');
      const response = await axios.post('http://localhost:3000/medical-files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted);
        }
      });

      console.log('Upload response:', response.data);

      if (response.data) {
        setUploadSuccess(true);
        toast.success('File uploaded successfully');
        await fetchFiles();
      } else {
        throw new Error(response.data.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setUploadError(error.response?.data?.message || 'Failed to upload file. Please try again.');
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
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
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Files & Reports</h2>
          
          {/* Upload Section */}
          <div className="mb-8">
            <label className="block mb-4">
              <span className="text-gray-400">Upload File</span>
              <div className="mt-2">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  {uploading ? "Uploading..." : "Choose File"}
                </label>
              </div>
            </label>
            {uploadSuccess && (
              <div className="flex items-center gap-2 text-green-500 mt-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>File uploaded successfully</span>
              </div>
            )}
            {uploadError && (
              <div className="flex items-center gap-2 text-red-500 mt-2">
                <XCircle className="w-5 h-5" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* Files List */}
          <div className="space-y-4">
            {Array.isArray(files) && files.length > 0 ? (
              files.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{file.fileName}</p>
                      <p className="text-sm text-gray-400">
                        {file.description || 'No description'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Type: {file.fileType} • Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`http://localhost:3000${file.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Download
                    </a>
                    <button
                      onClick={async () => {
                        try {
                          if (!appointment || !appointment.doctorId || !appointment.doctorId._id) {
                            toast.error('Unable to share file: Doctor information not available');
                            return;
                          }
                          const response = await axios.post('http://localhost:3000/medical-files/share', {
                            fileId: file._id,
                            doctorId: appointment.doctorId._id
                          }, {
                            withCredentials: true
                          });
                          toast.success('File shared with doctor successfully');
                        } catch (error) {
                          console.error('Error sharing file:', error);
                          toast.error(error.response?.data?.error || 'Failed to share file with doctor');
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Share with Doctor
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No files uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientAppointmentDetails; 