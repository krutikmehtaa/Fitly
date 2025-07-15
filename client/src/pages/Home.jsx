import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const getInitialMember = () => ({
  fullName: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  conditions: ""
});

const Home = () => {
  const [family, setFamily] = useState([getInitialMember()]);
  const [errors, setErrors] = useState([{}]);
  const navigate = useNavigate();
  const { setIsRegistered, currentUser } = useAuth();

  const validateField = (field, value) => {
    // Optional validation logic here if needed
  };

  const handleChange = (index, field, value) => {
    const updated = [...family];
    updated[index][field] = value;
    setFamily(updated);
  };

  const addFamilyMember = () => {
    if (family.length >= 3) {
      alert("You cannot add more than 3 family members.");
      return;
    }
    setFamily([...family, getInitialMember()]);
  };

  const deleteFamilyMember = (index) => {
    const updated = [...family];
    updated.splice(index, 1);
    setFamily(updated);
  };

  const validateAll = () => {
    let valid = true;
    family.forEach(member => {
      if (
        !member.fullName.trim() ||
        !member.age ||
        !member.gender ||
        !member.height ||
        !member.weight
      ) {
        valid = false;
      }
    });
    if (!valid) alert("Please fill all required fields for all family members.");
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    try {
      console.log("currentUser:", currentUser);
      await axios.post("http://localhost:5000/api/family", {
        userId: currentUser.uid,
        family,
      });
      alert("Family registered!");
      setIsRegistered(true);
      navigate("/planner");
    } catch (err) {
      console.error("Failed to register family:", err);
      alert("Failed to register family details.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-lg">
      {/* Welcome message framed nicely */}
      <div className="mb-8 p-6 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-3 text-center">Welcome to FitBuddy!</h1>
        <p className="text-lg text-center max-w-2xl mx-auto leading-relaxed">
          Your personalized AI-based fitness coach and nutritionist. Please enter your details below,
          and feel free to add details of your family members to receive customized plans for everyone.
        </p>
      </div>

      {/* Family members form */}
      {family.map((member, index) => (
        <div key={index} className="mb-6 border rounded p-4 shadow-sm bg-gray-50 relative">
          <h3 className="text-xl font-semibold mb-4">Member {index + 1}</h3>

          {/* Delete button */}
          {family.length > 1 && (
            <button
              onClick={() => deleteFamilyMember(index)}
              className="absolute top-3 right-3 text-red-600 hover:text-red-800 font-bold"
              aria-label={`Delete member ${index + 1}`}
              title={`Delete member ${index + 1}`}
            >
              &times;
            </button>
          )}

          <label className="block mb-2 font-medium" htmlFor={`fullName-${index}`}>
            Full Name*
          </label>
          <input
            id={`fullName-${index}`}
            type="text"
            value={member.fullName}
            onChange={(e) => handleChange(index, "fullName", e.target.value)}
            className="w-full mb-4 p-2 border rounded"
            placeholder="Full Name"
          />

          <label className="block mb-2 font-medium" htmlFor={`age-${index}`}>
            Age*
          </label>
          <input
            id={`age-${index}`}
            type="number"
            min="1"
            value={member.age}
            onChange={(e) => handleChange(index, "age", e.target.value)}
            className="w-full mb-4 p-2 border rounded"
            placeholder="Age"
          />

          <label className="block mb-2 font-medium" htmlFor={`gender-${index}`}>
            Gender*
          </label>
          <select
            id={`gender-${index}`}
            value={member.gender}
            onChange={(e) => handleChange(index, "gender", e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <label className="block mb-2 font-medium" htmlFor={`height-${index}`}>
            Height (cms)*
          </label>
          <input
            id={`height-${index}`}
            type="number"
            min="1"
            value={member.height}
            onChange={(e) => handleChange(index, "height", e.target.value)}
            className="w-full mb-4 p-2 border rounded"
            placeholder="Height in cms"
          />

          <label className="block mb-2 font-medium" htmlFor={`weight-${index}`}>
            Weight (kgs)*
          </label>
          <input
            id={`weight-${index}`}
            type="number"
            min="1"
            value={member.weight}
            onChange={(e) => handleChange(index, "weight", e.target.value)}
            className="w-full mb-4 p-2 border rounded"
            placeholder="Weight in kgs"
          />

          <label className="block mb-2 font-medium" htmlFor={`conditions-${index}`}>
            Medical Conditions (Optional)
          </label>
          <input
            id={`conditions-${index}`}
            type="text"
            value={member.conditions}
            onChange={(e) => handleChange(index, "conditions", e.target.value)}
            className="w-full mb-4 p-2 border rounded"
            placeholder="Pre-existing medical conditions"
          />
        </div>
      ))}

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={addFamilyMember}
          disabled={family.length >= 3}
          className={`px-4 py-2 rounded text-white ${
            family.length >= 3 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Add Family Member
        </button>

        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          Save and Continue
        </button>
      </div>
    </div>
  );
};

export default Home;
