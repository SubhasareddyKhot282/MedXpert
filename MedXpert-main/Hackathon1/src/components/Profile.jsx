// import { useState, useEffect } from "react";
// import axios from "axios";

// function Profile() {
//   const [user, setUser] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     gender: "",
//     dob: "",
//     phone: "",
//     speciality: "",
//   });

//   const [isEditing, setIsEditing] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(true);

//   // Fetch user data on mount
//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get("http://localhost:3000/profile", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         console.log("User profile fetched:", response.data); // Debugging log
//         setUser(response.data);
//       } catch (error) {
//         console.error("Error fetching profile:", error);
//         setError("Unable to fetch profile. Please log in again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserProfile();
//   }, []);

//   // Handle input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setUser((prevUser) => ({
//       ...prevUser,
//       [name]: value,
//     }));
//   };

//   // Save updated profile data
//   const handleSave = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         throw new Error("Token not found. Please log in.");
//       }
//       const response = await axios.put("http://localhost:3000/profile", user, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setUser(response.data); // Update state with the updated profile
//       setSuccess("Profile updated successfully.");
//       setIsEditing(false); // Disable editing mode
//     } catch (error) {
//       console.error("Error saving profile:", error);
//       setError("Failed to save profile. Please try again.");
//     }
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="max-w-md mx-auto bg-white shadow-md rounded p-6">
//       <h1 className="text-xl font-bold mb-4">Profile</h1>

//       {error && <p className="text-red-500 mb-2">{error}</p>}
//       {success && <p className="text-green-500 mb-2">{success}</p>}

//       <div className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">First Name</label>
//           <input
//             type="text"
//             name="firstName"
//             value={user.firstName}
//             onChange={handleInputChange}
//             readOnly={!isEditing}
//             className={`w-full px-3 py-2 border rounded ${
//               isEditing ? "bg-gray-100" : "bg-gray-200"
//             }`}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Last Name</label>
//           <input
//             type="text"
//             name="lastName"
//             value={user.lastName}
//             onChange={handleInputChange}
//             readOnly={!isEditing}
//             className={`w-full px-3 py-2 border rounded ${
//               isEditing ? "bg-gray-100" : "bg-gray-200"
//             }`}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Email</label>
//           <input
//             type="email"
//             name="email"
//             value={user.email}
//             readOnly
//             className="w-full px-3 py-2 border rounded bg-gray-200"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Gender</label>
//           <select
//             name="gender"
//             value={user.gender}
//             onChange={handleInputChange}
//             disabled={!isEditing}
//             className={`w-full px-3 py-2 border rounded ${
//               isEditing ? "bg-gray-100" : "bg-gray-200"
//             }`}
//           >
//             <option value="">Select Gender</option>
//             <option value="male">Male</option>
//             <option value="female">Female</option>
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Date of Birth
//           </label>
//           <input
//             type="date"
//             name="dob"
//             value={user.dob}
//             onChange={handleInputChange}
//             readOnly={!isEditing}
//             className={`w-full px-3 py-2 border rounded ${
//               isEditing ? "bg-gray-100" : "bg-gray-200"
//             }`}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Phone</label>
//           <input
//             type="text"
//             name="phone"
//             value={user.phone}
//             onChange={handleInputChange}
//             readOnly={!isEditing}
//             className={`w-full px-3 py-2 border rounded ${
//               isEditing ? "bg-gray-100" : "bg-gray-200"
//             }`}
//           />
//         </div>
//       </div>

//       <div className="flex justify-between mt-4">
//         {!isEditing ? (
//           <button
//             onClick={() => setIsEditing(true)}
//             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
//           >
//             Edit
//           </button>
//         ) : (
//           <button
//             onClick={handleSave}
//             className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
//           >
//             Save
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Profile;
import { useState, useEffect } from "react";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    dob: "",
    phone: "",
    speciality: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // Ensure token is stored
        if (!token) {
          throw new Error("Token not found. Please log in.");
        }
        const response = await axios.get("http://localhost:3000/profile", {
          headers: {
            Authorization: `Bearer ${token}`, // Properly pass the token
          },
        });
        setUser(response.data); // Update state with fetched user data
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Unable to fetch profile. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  // Save updated profile data
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please log in.");
      }
      const response = await axios.put("http://localhost:3000/profile", user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data); // Update state with the updated profile
      setSuccess("Profile updated successfully.");
      setIsEditing(false); // Disable editing mode
    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Failed to save profile. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded p-6">
      <h1 className="text-xl font-bold mb-4">Profile</h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={user.firstName}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`w-full px-3 py-2 border rounded ${
              isEditing ? "bg-gray-100" : "bg-gray-200"
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={user.lastName}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`w-full px-3 py-2 border rounded ${
              isEditing ? "bg-gray-100" : "bg-gray-200"
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            readOnly
            className="w-full px-3 py-2 border rounded bg-gray-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select
            name="gender"
            value={user.gender}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded ${
              isEditing ? "bg-gray-100" : "bg-gray-200"
            }`}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            name="dob"
            value={user.dob}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`w-full px-3 py-2 border rounded ${
              isEditing ? "bg-gray-100" : "bg-gray-200"
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={user.phone}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`w-full px-3 py-2 border rounded ${
              isEditing ? "bg-gray-100" : "bg-gray-200"
            }`}
          />
        </div>
      </div>

      <div className="flex justify-between mt-4">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
}

export default Profile;
