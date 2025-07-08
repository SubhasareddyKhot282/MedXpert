import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Billing = () => {
  const { patientId } = useParams();

  const staticMedicines = [
    { id: 1, name: "Paracetamol", cost: 10 },
    { id: 2, name: "Ibuprofen", cost: 20 },
    { id: 3, name: "Amoxicillin", cost: 15 },
    { id: 4, name: "Cough Syrup", cost: 50 },
    { id: 5, name: "Vitamin C", cost: 30 },
    { id: 6, name: "Antibiotic Cream", cost: 25 },
    { id: 7, name: "Antacid", cost: 12 },
    { id: 8, name: "Antihistamine", cost: 18 },
    { id: 9, name: "Pain Reliever", cost: 22 },
    { id: 10, name: "Eye Drops", cost: 35 },
  ];

  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [billItems, setBillItems] = useState([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await axios.get(`/prescriptions/${patientId}`);
        setPrescriptions(response.data);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      }
    };

    fetchPrescriptions();
  }, [patientId]);

  const addPrescription = async () => {
    if (billItems.length === 0) {
      alert("Please add at least one medicine to the bill before saving the prescription!");
      return;
    }
  
    try {
      const medicines = billItems.map((item) => ({
        name: item.name,
        quantity: `${item.quantity} units`,
        instructions: "Take after food",
      }));
  
      const response = await axios.post(`/prescriptions/${patientId}`, {
        medicines
      });
  
      alert("Prescription added successfully!");
  
      // Save to state
      setPrescriptions((prev) => [...prev, response.data.prescription]);
  
      // Reset everything
      setBillItems([]);
      setSelectedPrescription("");
      setQuantity(1);
    } catch (error) {
      console.error("Error adding prescription:", error);
    }
  };
  
  
  

  const addToBill = () => {
    if (selectedPrescription === "") {
      alert("Please select a medication!");
      return;
    }

    const prescription = staticMedicines.find(
      (item) => item.id === parseInt(selectedPrescription)
    );

    const existingItem = billItems.find((item) => item.id === prescription.id);

    if (existingItem) {
      setBillItems(
        billItems.map((item) =>
          item.id === prescription.id
            ? { ...item, quantity: item.quantity + parseInt(quantity) }
            : item
        )
      );
    } else {
      setBillItems([
        ...billItems,
        { ...prescription, quantity: parseInt(quantity) },
      ]);
    }

    setSelectedPrescription("");
    setQuantity(1);
  };

  const calculateTotal = () =>
    billItems.reduce((total, item) => total + item.cost * item.quantity, 0);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 shadow-lg rounded-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Prescription Billing</h1>

      {/* Prescription Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <select
          value={selectedPrescription}
          onChange={(e) => setSelectedPrescription(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select a Medication</option>
          {staticMedicines.map((medicine) => (
            <option key={medicine.id} value={medicine.id}>
              {medicine.name} - ₹{medicine.cost}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full sm:w-24 px-4 py-2 border border-gray-300 rounded-md"
          placeholder="Quantity"
        />

        <button
          onClick={addToBill}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Add to Bill
        </button>

        <button
          onClick={addPrescription}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add Prescription
        </button>
      </div>

      {/* Bill Table */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Bill Details</h2>
        {billItems.length === 0 ? (
          <p className="text-gray-500">No items added to the bill.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Medicine</th>
                <th className="border border-gray-300 px-4 py-2">Cost</th>
                <th className="border border-gray-300 px-4 py-2">Quantity</th>
                <th className="border border-gray-300 px-4 py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {billItems.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                  <td className="border border-gray-300 px-4 py-2">₹{item.cost}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    ₹{item.cost * item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Total */}
        <div className="mt-6 text-right">
          <h3 className="text-lg font-semibold">
            Total: <span className="text-green-600">₹{calculateTotal()}</span>
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Billing;
