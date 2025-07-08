// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';

// function PrescriptionDetails() {
//   const { patientId } = useParams();
//   const [prescriptions, setPrescriptions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPrescriptions = async () => {
//       try {
//         const response = await axios.get(`http://localhost:3000/prescriptions/${patientId}`, {
//           withCredentials: true,
//         });
//         setPrescriptions(response.data);
//       } catch (error) {
//         console.error("Error fetching prescriptions:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPrescriptions();
//   }, [patientId]);

//   if (loading) return <p className="p-4 text-center">Loading prescriptions...</p>;
//   if (prescriptions.length === 0) return <p className="p-4 text-center">No prescriptions found for this appointment.</p>;

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h2 className="text-2xl font-semibold mb-6 text-blue-700 text-center">Prescription Details</h2>
//       {prescriptions.map((presc, index) => (
//         <div key={index} className="bg-white border rounded-xl p-6 mb-6 shadow">
//           <p className="mb-2"><strong>Doctor:</strong> {presc.doctorId.firstName} {presc.doctorId.lastName}</p>
//           <p className="mb-2"><strong>Email:</strong> {presc.doctorId.email}</p>
//           <p className="mb-4"><strong>Date:</strong> {new Date(presc.createdAt).toLocaleDateString()}</p>

//           <h3 className="font-semibold mb-2">Medicines:</h3>
//           <ul className="list-disc list-inside mb-4">
//             {presc.medicines.map((med, i) => (
//               <li key={i} className="mb-1">
//                 <strong>{med.name}</strong> - {med.quantity}
//                 {med.instructions && <> ({med.instructions})</>}
//               </li>
//             ))}
//           </ul>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default PrescriptionDetails;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function PrescriptionDetails() {
  const { patientId } = useParams();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/prescriptions/${patientId}`, {
          withCredentials: true,
        });
        setPrescriptions(response.data);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [patientId]);

  if (loading)
    return (
      <div className="p-4 text-center animate-pulse text-gray-500">
        Loading prescriptions...
      </div>
    );
  
  if (prescriptions.length === 0)
    return (
      <div className="p-4 text-center text-gray-500">
        No prescriptions found for this appointment.
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-semibold mb-6 text-blue-700 text-center animate__animated animate__fadeIn">
        Prescription Details
      </h2>

      {prescriptions.map((presc, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out"
        >
          <div className="mb-4">
            <p className="mb-2 text-lg text-gray-800">
              <strong className="text-blue-600">Doctor:</strong>{' '}
              {presc.doctorId.firstName} {presc.doctorId.lastName}
            </p>
            <p className="mb-2 text-sm text-gray-500">
              <strong>Email:</strong> {presc.doctorId.email}
            </p>
            <p className="mb-4 text-sm text-gray-500">
              <strong>Date:</strong> {new Date(presc.createdAt).toLocaleDateString()}
            </p>
          </div>

          <h3 className="font-semibold mb-4 text-xl text-gray-700">
            Medicines:
          </h3>
          <ul className="list-disc list-inside mb-6 space-y-2">
            {presc.medicines.map((med, i) => (
              <li key={i} className="transition-transform transform hover:scale-105 hover:text-blue-600">
                <strong>{med.name}</strong> - {med.quantity}
                {med.instructions && (
                  <span className="italic text-sm text-gray-500"> ({med.instructions})</span>
                )}
              </li>
            ))}
          </ul>

          <div className="flex justify-end">
            <button
              className="text-blue-500 hover:text-blue-700 transition duration-200 ease-in-out"
              onClick={() => alert('Download Prescription PDF functionality coming soon!')}
            >
              <span className="font-semibold">Download PDF</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PrescriptionDetails;
