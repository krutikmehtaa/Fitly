import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Make sure this is correctly set up

const dietTypes = ["Vegetarian", "Non-Vegetarian", "Vegan", "Jain"];
const allergensOptions = ["Gluten", "Peanuts", "Dairy", "Soy"];
const fitnessGoalsOptions = ["Muscle Gain", "Weight Loss", "Endurance"];

const Planner = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { currentUser } = useAuth();

  useEffect(() => {
    setGeneratedPlan(null);
    async function fetchFamily() {
      if (!currentUser || !currentUser.uid) {
        console.warn("No currentUser yet, skipping fetchFamily");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/family/family?userId=${currentUser.uid}`
        );

        const family = response.data.family || [];
        setFamilyMembers(family);
        setPlans(
          family.map(() => ({
            dietType: "",
            allergens: [],
            fitnessGoals: [],
          }))
        );
        if (family.length > 0) setSelectedMemberIndex(0);
      } catch (err) {
        console.error("Error fetching family data:", err);
        setError("Failed to load family members.");
      }
    }

    fetchFamily();
  }, [currentUser]); // <-- re-run when currentUser updates

  useEffect(() => {
    setGeneratedPlan(null);
  }, [selectedMemberIndex]);

  const handleDietChange = (index, value) => {
    const updated = [...plans];
    updated[index].dietType = value;
    setPlans(updated);
  };

  const handleAllergensChange = (index, allergen) => {
    const updated = [...plans];
    const arr = updated[index].allergens;
    updated[index].allergens = arr.includes(allergen)
      ? arr.filter((a) => a !== allergen)
      : [...arr, allergen];
    setPlans(updated);
  };

  const handleFitnessGoalsChange = (index, goal) => {
    const updated = [...plans];
    const arr = updated[index].fitnessGoals;
    updated[index].fitnessGoals = arr.includes(goal)
      ? arr.filter((g) => g !== goal)
      : [...arr, goal];
    setPlans(updated);
  };

  const handleGeneratePlan = async () => {
    setError(null);
    setGeneratedPlan(null);

    if (selectedMemberIndex === null) {
      setError("Please select a family member.");
      return;
    }

    const member = familyMembers[selectedMemberIndex];
    const planInputs = plans[selectedMemberIndex];

    if (!planInputs.dietType || planInputs.fitnessGoals.length === 0) {
      setError("Please select Diet Type and at least one Fitness Goal.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/plan/generate",
        { member: { ...member, ...planInputs } }
      );

      setGeneratedPlan(response.data);
    } catch (err) {
      console.error("Failed to generate plan", err);
      setError("Failed to generate plan. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Planner</h2>

      {familyMembers.length === 0 && (
        <p>No family members found. Please register first.</p>
      )}

      {familyMembers.length > 0 && (
        <div className="mb-6">
          <label className="font-semibold mr-2">Select Member:</label>
          <select
            value={selectedMemberIndex}
            onChange={(e) => setSelectedMemberIndex(Number(e.target.value))}
            className="border p-2"
          >
            {familyMembers.map((member, idx) => (
              <option key={idx} value={idx}>
                {member.fullName || `Member ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedMemberIndex !== null && (
        <div className="mb-8 border p-6 rounded shadow bg-white">
          <h3 className="text-xl font-semibold mb-4">
            {familyMembers[selectedMemberIndex].fullName}
          </h3>

          <label className="block mb-2 font-semibold">Diet Type</label>
          <select
            className="mb-4 border p-2 w-full"
            value={plans[selectedMemberIndex]?.dietType || ""}
            onChange={(e) => handleDietChange(selectedMemberIndex, e.target.value)}
          >
            <option value="">Select Diet Type</option>
            {dietTypes.map((diet) => (
              <option key={diet} value={diet}>
                {diet}
              </option>
            ))}
          </select>

          <label className="block mb-2 font-semibold">Allergens</label>
          <div className="mb-4">
            {allergensOptions.map((allergen) => (
              <label key={allergen} className="mr-4 inline-flex items-center">
                <input
                  type="checkbox"
                  checked={plans[selectedMemberIndex]?.allergens.includes(allergen)}
                  onChange={() => handleAllergensChange(selectedMemberIndex, allergen)}
                />
                <span className="ml-1">{allergen}</span>
              </label>
            ))}
          </div>

          <label className="block mb-2 font-semibold">Fitness Goals</label>
          <div className="mb-4 flex space-x-6">
            {fitnessGoalsOptions.map((goal) => (
              <label key={goal} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={plans[selectedMemberIndex]?.fitnessGoals.includes(goal)}
                  onChange={() => handleFitnessGoalsChange(selectedMemberIndex, goal)}
                />
                <span className="ml-1">{goal}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {familyMembers.length > 0 && (
        <button
          onClick={handleGeneratePlan}
          className="bg-green-600 text-white px-6 py-2 rounded mb-6"
          disabled={loading}
        >
          {loading ? "Generating Plan..." : "Generate Personalized Plan"}
        </button>
      )}

      {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}

      {generatedPlan && (
        <div className="border p-4 rounded bg-gray-100 whitespace-pre-wrap">
          <h3 className="font-bold mb-2">
            Personalized Plan for {familyMembers[selectedMemberIndex]?.fullName}:
          </h3>
          <pre>{generatedPlan.plan}</pre>
        </div>
      )}
    </div>
  );
};

export default Planner;
