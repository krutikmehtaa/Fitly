import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const getInitialMember = () => ({
  id: Date.now() + Math.random(),
  fullName: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  conditions: ""
});

const genderOptions = [
  { value: "Male", icon: "👨", label: "Male" },
  { value: "Female", icon: "👩", label: "Female" },
];

const EditFamily = () => {
  const [family, setFamily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchFamily() {
      if (!currentUser?.uid) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/family/family?userId=${currentUser.uid}`
        );
        const familyData = response.data.family || [];
        // Add IDs to existing members for React keys
        const familyWithIds = familyData.map((member, idx) => ({
          ...member,
          id: member.id || Date.now() + idx + Math.random()
        }));
        setFamily(familyWithIds.length > 0 ? familyWithIds : [getInitialMember()]);
      } catch (err) {
        console.error("Error fetching family:", err);
        setFamily([getInitialMember()]);
      }
      setLoading(false);
    }

    fetchFamily();
  }, [currentUser]);

  const handleChange = (index, field, value) => {
    const updated = [...family];
    updated[index][field] = value;
    setFamily(updated);
    setError("");
    setSuccess("");
  };

  const addFamilyMember = () => {
    if (family.length >= 5) {
      setError("Maximum 5 family members allowed");
      return;
    }
    setFamily([...family, getInitialMember()]);
  };

  const deleteFamilyMember = (memberId) => {
    if (family.length <= 1) {
      setError("You must have at least one family member");
      return;
    }
    setFamily(prevFamily => prevFamily.filter(member => member.id !== memberId));
    setSuccess("");
  };

  const validateAll = () => {
    for (const member of family) {
      if (!member.fullName.trim() || !member.age || !member.gender || !member.height || !member.weight) {
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateAll()) {
      setError("Please fill all required fields for all family members");
      return;
    }

    setSaving(true);
    setError("");
    try {
      // Remove the 'id' field before sending to server
      const familyToSave = family.map(({ id, ...rest }) => rest);
      
      await axios.post("http://localhost:5000/api/family", {
        userId: currentUser.uid,
        family: familyToSave,
      });
      setSuccess("Family details updated successfully!");
    } catch (err) {
      console.error("Failed to save family:", err);
      setError("Failed to save family details. Please try again.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8 border-2" />
          <p className="text-white/60">Loading family details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-display font-bold gradient-text mb-4">
            Edit Family Details
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Update your family members' information. Changes will be reflected in future plan generations.
          </p>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <p className="text-red-400 text-sm text-center">{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20"
            >
              <p className="text-green-400 text-sm text-center flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {success}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Family Members */}
        <div className="space-y-6">
          <AnimatePresence>
            {family.map((member, index) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, height: 0 }}
                className="glass-card p-6 md:p-8 relative overflow-hidden"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-2xl" />
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {member.fullName || `Family Member ${index + 1}`}
                      </h3>
                      <p className="text-sm text-white/50">
                        {index === 0 ? "Primary member" : "Additional member"}
                      </p>
                    </div>
                  </div>
                  
                  {family.length > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteFamilyMember(member.id);
                      }}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all z-10"
                      title="Remove member"
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  )}
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label className="input-label">Full Name *</label>
                    <input
                      type="text"
                      value={member.fullName}
                      onChange={(e) => handleChange(index, "fullName", e.target.value)}
                      className="input-field"
                      placeholder="Enter full name"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="input-label">Age *</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={member.age}
                      onChange={(e) => handleChange(index, "age", e.target.value)}
                      className="input-field"
                      placeholder="25"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="input-label">Gender *</label>
                    <div className="flex gap-3">
                      {genderOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleChange(index, "gender", option.value)}
                          className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 ${
                            member.gender === option.value
                              ? "bg-primary-500/20 border-primary-500/50 text-primary-300"
                              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          <span className="text-lg">{option.icon}</span>
                          <span className="font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="input-label">Height (cm) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="50"
                        max="250"
                        value={member.height}
                        onChange={(e) => handleChange(index, "height", e.target.value)}
                        className="input-field pr-12"
                        placeholder="175"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                        cm
                      </span>
                    </div>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="input-label">Weight (kg) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="20"
                        max="300"
                        value={member.weight}
                        onChange={(e) => handleChange(index, "weight", e.target.value)}
                        className="input-field pr-12"
                        placeholder="70"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                        kg
                      </span>
                    </div>
                  </div>

                  {/* Medical Conditions */}
                  <div className="md:col-span-2">
                    <label className="input-label">
                      Medical Conditions 
                      <span className="text-white/30 font-normal ml-2">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={member.conditions}
                      onChange={(e) => handleChange(index, "conditions", e.target.value)}
                      className="input-field"
                      placeholder="e.g., Diabetes, Hypertension, Asthma..."
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <motion.button
            onClick={addFamilyMember}
            disabled={family.length >= 5}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-ghost flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Family Member
            <span className="text-white/40 text-sm">({family.length}/5)</span>
          </motion.button>

          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2 px-8"
          >
            {saving ? (
              <>
                <div className="spinner" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save Changes</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default EditFamily;
