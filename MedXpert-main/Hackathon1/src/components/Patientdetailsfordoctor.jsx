import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Image,
  FileArchive,
  Download,
  Loader2,
  AlertCircle
} from 'lucide-react';

function PatientDetail() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/patient/${patientId}`, {
          withCredentials: true,
        });
        setPatient(response.data);
      } catch (error) {
        console.error("Error fetching patient details:", error);
        setError("Failed to fetch patient details");
      }
    };

    const fetchPatientFiles = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/medical-files/${patientId}`, {
          withCredentials: true,
        });
        console.log('Fetched patient files:', response.data);
        setFiles(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching patient files:", error);
        setError("Failed to fetch patient files");
      }
    };

    // Fetch both details and files in parallel
    Promise.all([fetchPatientDetails(), fetchPatientFiles()])
      .finally(() => setLoading(false));
  }, [patientId]);

  const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-6 h-6" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="w-6 h-6" />;
      case 'zip':
      case 'rar':
        return <FileArchive className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading patient details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-red-500">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-2xl p-8 mb-8 border border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Patient Details</h2>

          {patient ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Name</p>
                  <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-400">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Medical Files</h3>
                {files.length > 0 ? (
                  <div className="grid gap-4">
                    {files.map((file) => (
                      <div key={file._id} className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
                              {getFileIcon(file.fileType)}
                            </div>
                            <div>
                              <h4 className="font-medium">{file.fileName}</h4>
                              <p className="text-sm text-gray-400">{file.description}</p>
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
                              View File
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No medical files available.</p>
                )}
              </div>

              <div className="mt-8">
                <Link
                  to={`/doctor/billing/${patientId}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Go to Billing
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Patient not found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientDetail;
