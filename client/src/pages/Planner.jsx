import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import PlanDisplay from "../components/PlanDisplay";

const dietTypes = [
  { value: "Vegetarian", icon: "🥬", description: "Plant-based with dairy & eggs" },
  { value: "Non Vegetarian", icon: "🍖", description: "Includes meat & poultry" },
  { value: "Vegan", icon: "🌱", description: "100% plant-based" },
];

const allergensOptions = [
  { value: "Gluten", icon: "🌾" },
  { value: "Peanuts", icon: "🥜" },
  { value: "Dairy", icon: "🥛" },
  { value: "Soy", icon: "🫘" },
];

const workoutDaysOptions = [
  { value: 3, label: "3 days", description: "Beginner" },
  { value: 4, label: "4 days", description: "Balanced" },
  { value: 5, label: "5 days", description: "Intermediate" },
  { value: 6, label: "6 days", description: "Advanced" },
];

const fitnessGoalsOptions = [
  { value: "Muscle Gain", icon: "💪" },
  { value: "Weight Loss", icon: "⚖️" },
  { value: "Endurance", icon: "🏃" },
  { value: "Flexibility", icon: "🧘" },
  { value: "General Fitness", icon: "❤️" },
];

const Planner = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchingFamily, setFetchingFamily] = useState(true);
  
  // Saved plans state
  const [savedPlans, setSavedPlans] = useState([]);
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [selectedSavedPlan, setSelectedSavedPlan] = useState(null);

  const { currentUser } = useAuth();

  useEffect(() => {
    setGeneratedPlan(null);
    setSelectedSavedPlan(null);
    
    async function fetchData() {
      if (!currentUser || !currentUser.uid) {
        setFetchingFamily(false);
        return;
      }

      try {
        // Fetch family members
        const familyRes = await axios.get(
          `http://localhost:5000/api/family/family?userId=${currentUser.uid}`
        );
        const family = familyRes.data.family || [];
        setFamilyMembers(family);
        setPlans(
          family.map(() => ({
            dietType: "",
            allergens: [],
            fitnessGoals: [],
            workoutDays: 4, // Default to 4 days
            dislikedFoods: "",
            workoutRestrictions: "",
            conditions: "", // Medical conditions
            exercisesPerWorkout: 5, // Number of exercises per workout session (default 5)
          }))
        );
        if (family.length > 0) setSelectedMemberIndex(0);

        // Fetch saved plans
        const plansRes = await axios.get(
          `http://localhost:5000/api/plan/user/${currentUser.uid}`
        );
        setSavedPlans(plansRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
      }
      setFetchingFamily(false);
    }

    fetchData();
  }, [currentUser]);

  useEffect(() => {
    setGeneratedPlan(null);
    setSelectedSavedPlan(null);
    setError(null);
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

  const handleWorkoutDaysChange = (index, days) => {
    const updated = [...plans];
    updated[index].workoutDays = days;
    setPlans(updated);
  };

  const handleDislikedFoodsChange = (index, value) => {
    const updated = [...plans];
    updated[index].dislikedFoods = value;
    setPlans(updated);
  };

  const handleWorkoutRestrictionsChange = (index, value) => {
    const updated = [...plans];
    updated[index].workoutRestrictions = value;
    setPlans(updated);
  };

  const handleConditionsChange = (index, value) => {
    const updated = [...plans];
    updated[index].conditions = value;
    setPlans(updated);
  };

  const handleExercisesPerWorkoutChange = (index, value) => {
    const updated = [...plans];
    updated[index].exercisesPerWorkout = value;
    setPlans(updated);
  };

  const handleGeneratePlan = async () => {
    setError(null);
    setGeneratedPlan(null);
    setSelectedSavedPlan(null);

    if (selectedMemberIndex === null) {
      setError("Please select a family member.");
      return;
    }

    const member = familyMembers[selectedMemberIndex];
    const planInputs = plans[selectedMemberIndex];

    if (!planInputs.dietType) {
      setError("Please select a diet type.");
      return;
    }

    if (planInputs.fitnessGoals.length === 0) {
      setError("Please select at least one fitness goal.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/plan/generate",
        { member: { ...member, ...planInputs } }
      );

      setGeneratedPlan(response.data.plan);
    } catch (err) {
      console.error("Failed to generate plan", err);
      setError("Failed to generate plan. Please try again.");
    }
    setLoading(false);
  };

  const handleViewSavedPlan = (plan) => {
    setSelectedSavedPlan(plan);
    setGeneratedPlan(null);
    setShowSavedPlans(false);
  };

  const handleDeletePlan = async (planId) => {
    try {
      await axios.delete(`http://localhost:5000/api/plan/${planId}`);
      setSavedPlans(prev => prev.filter(p => p._id !== planId));
      if (selectedSavedPlan?._id === planId) {
        setSelectedSavedPlan(null);
      }
    } catch (err) {
      console.error("Failed to delete plan:", err);
    }
  };

  const selectedMember = selectedMemberIndex !== null ? familyMembers[selectedMemberIndex] : null;
  const selectedPlan = selectedMemberIndex !== null ? plans[selectedMemberIndex] : null;
  const memberSavedPlans = savedPlans.filter(p => p.memberName === selectedMember?.fullName);

  if (fetchingFamily) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8 border-2" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
            Personalized Planner
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Create customized meal and workout plans for your family
          </p>
        </motion.div>

        {familyMembers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center max-w-md mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👨‍👩‍👧‍👦</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Family Members</h3>
            <p className="text-white/60 mb-6">
              Please add your family members first.
            </p>
            <a href="/family" className="btn-primary inline-flex">
              Manage Family
            </a>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Member Selection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-5"
              >
                <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <span>👤</span> Select Member
                </h3>
                <div className="space-y-2">
                  {familyMembers.map((member, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedMemberIndex(idx)}
                      className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                        selectedMemberIndex === idx
                          ? "bg-primary-500/20 border border-primary-500/40"
                          : "bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                        selectedMemberIndex === idx
                          ? "bg-gradient-to-br from-primary-500 to-primary-700"
                          : "bg-white/10"
                      }`}>
                        {member.gender === "Male" ? "👨" : "👩"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{member.fullName}</p>
                        <p className="text-xs text-white/50">{member.age}y • {member.weight}kg</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Saved Plans for Member */}
              {selectedMember && memberSavedPlans.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <span>📋</span> Saved Plans
                    </h3>
                    <span className="text-xs text-white/40">{memberSavedPlans.length}</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {memberSavedPlans.slice(0, 5).map((plan) => (
                      <div
                        key={plan._id}
                        className={`p-3 rounded-lg transition-all flex items-center justify-between ${
                          selectedSavedPlan?._id === plan._id
                            ? "bg-primary-500/20 border border-primary-500/40"
                            : "bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06]"
                        }`}
                      >
                        <button
                          onClick={() => handleViewSavedPlan(plan)}
                          className="flex-1 text-left"
                        >
                          <p className="text-sm text-white font-medium">{plan.dietType}</p>
                          <p className="text-xs text-white/40">
                            {new Date(plan.createdAt).toLocaleDateString()}
                          </p>
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan._id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Preferences Form */}
              {selectedMember && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-5 space-y-5"
                >
                  {/* Diet Type */}
                  <div>
                    <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <span>🍽️</span> Diet Type
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {dietTypes.map((diet) => (
                        <button
                          key={diet.value}
                          onClick={() => handleDietChange(selectedMemberIndex, diet.value)}
                          className={`p-2.5 rounded-xl text-center transition-all ${
                            selectedPlan?.dietType === diet.value
                              ? "bg-primary-500/20 border border-primary-500/40"
                              : "bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06]"
                          }`}
                        >
                          <span className="text-xl block mb-1">{diet.icon}</span>
                          <span className={`text-xs font-medium ${
                            selectedPlan?.dietType === diet.value ? "text-primary-300" : "text-white/70"
                          }`}>
                            {diet.value.split('-')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Workout Days */}
                  <div>
                    <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <span>📅</span> Workout Days/Week
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {workoutDaysOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleWorkoutDaysChange(selectedMemberIndex, option.value)}
                          className={`p-2.5 rounded-xl text-center transition-all ${
                            selectedPlan?.workoutDays === option.value
                              ? "bg-accent-500/20 border border-accent-500/40"
                              : "bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06]"
                          }`}
                        >
                          <span className={`text-lg font-bold block ${
                            selectedPlan?.workoutDays === option.value ? "text-accent-300" : "text-white"
                          }`}>
                            {option.value}
                          </span>
                          <span className="text-xs text-white/50">{option.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Allergens */}
                  <div>
                    <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <span>⚠️</span> Allergens
                      <span className="text-xs font-normal text-white/40">(Optional)</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {allergensOptions.map((allergen) => (
                        <button
                          key={allergen.value}
                          onClick={() => handleAllergensChange(selectedMemberIndex, allergen.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                            selectedPlan?.allergens.includes(allergen.value)
                              ? "bg-red-500/20 border border-red-500/40 text-red-300"
                              : "bg-white/[0.03] border border-white/[0.08] text-white/60 hover:bg-white/[0.06]"
                          }`}
                        >
                          <span>{allergen.icon}</span>
                          <span>{allergen.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fitness Goals */}
                  <div>
                    <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <span>🎯</span> Fitness Goals
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {fitnessGoalsOptions.map((goal) => (
                        <button
                          key={goal.value}
                          onClick={() => handleFitnessGoalsChange(selectedMemberIndex, goal.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                            selectedPlan?.fitnessGoals.includes(goal.value)
                              ? "bg-primary-500/20 border border-primary-500/40 text-primary-300"
                              : "bg-white/[0.03] border border-white/[0.08] text-white/60 hover:bg-white/[0.06]"
                          }`}
                        >
                          <span>{goal.icon}</span>
                          <span>{goal.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Disliked Foods */}
                  <div>
                    <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <span>🚫</span> Foods to Avoid
                      <span className="text-xs font-normal text-white/40">(Optional)</span>
                    </h3>
                    <input
                      type="text"
                      value={selectedPlan?.dislikedFoods || ""}
                      onChange={(e) => handleDislikedFoodsChange(selectedMemberIndex, e.target.value)}
                      placeholder="e.g., mushrooms, broccoli, fish"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:bg-white/[0.05] focus:border-primary-500/40 focus:outline-none transition-all text-sm"
                    />
                  </div>

                  {/* Workout Restrictions */}
                  <div>
                    <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <span>⚠️</span> Workout Restrictions
                      <span className="text-xs font-normal text-white/40">(Optional)</span>
                    </h3>
                    <textarea
                      value={selectedPlan?.workoutRestrictions || ""}
                      onChange={(e) => handleWorkoutRestrictionsChange(selectedMemberIndex, e.target.value)}
                      placeholder="e.g., knee injury, no gym equipment, avoid jumping"
                      rows="3"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:bg-white/[0.05] focus:border-primary-500/40 focus:outline-none transition-all text-sm resize-none"
                    />
                  </div>

                  {/* Medical Conditions */}
                  <div>
                    <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <span>🏥</span> Medical Conditions
                      <span className="text-xs font-normal text-white/40">(Optional)</span>
                    </h3>
                    <input
                      type="text"
                      value={selectedPlan?.conditions || ""}
                      onChange={(e) => handleConditionsChange(selectedMemberIndex, e.target.value)}
                      placeholder="e.g., diabetes, hypertension, asthma"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:bg-white/[0.05] focus:border-primary-500/40 focus:outline-none transition-all text-sm"
                    />
                  </div>

                  {/* Exercises per Workout Session */}
                  <div>
                    <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <span>💪</span> Exercises/Session
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {[4, 5, 6, 7].map((count) => (
                        <button
                          key={count}
                          onClick={() => handleExercisesPerWorkoutChange(selectedMemberIndex, count)}
                          className={`p-2.5 rounded-xl text-center transition-all ${
                            selectedPlan?.exercisesPerWorkout === count
                              ? "bg-accent-500/20 border border-accent-500/40"
                              : "bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06]"
                          }`}
                        >
                          <span className={`text-lg font-bold block ${
                            selectedPlan?.exercisesPerWorkout === count ? "text-accent-300" : "text-white"
                          }`}>
                            {count}
                          </span>
                          <span className="text-xs text-white/50">exercises</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <motion.button
                    onClick={handleGeneratePlan}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-accent w-full flex items-center justify-center gap-2 py-3"
                  >
                    {loading ? (
                      <>
                        <div className="spinner" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Generate Plan</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                  >
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-card p-12"
                  >
                    <div className="flex flex-col items-center justify-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl">🤖</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Crafting your plan...
                        </h3>
                        <p className="text-white/50 text-sm">
                          Hang tight. This may take a moment. Thanks for your patience!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!loading && !generatedPlan && !selectedSavedPlan && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">🎯</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Ready to Create Your Plan
                    </h3>
                    <p className="text-white/50 text-sm max-w-md mx-auto">
                      Configure your preferences on the left and click generate
                    </p>
                  </motion.div>
                )}

                {!loading && generatedPlan && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <PlanDisplay 
                      plan={generatedPlan} 
                      memberName={selectedMember?.fullName}
                      userId={currentUser?.uid}
                      memberData={{
                        memberIndex: selectedMemberIndex,
                        dietType: selectedPlan?.dietType,
                        allergens: selectedPlan?.allergens,
                        fitnessGoals: selectedPlan?.fitnessGoals,
                        workoutDays: selectedPlan?.workoutDays,
                        dislikedFoods: selectedPlan?.dislikedFoods,
                        workoutRestrictions: selectedPlan?.workoutRestrictions,
                        conditions: selectedPlan?.conditions,
                        exercisesPerWorkout: selectedPlan?.exercisesPerWorkout,
                        age: selectedMember?.age,
                        gender: selectedMember?.gender,
                        height: selectedMember?.height,
                        weight: selectedMember?.weight,
                      }}
                      onSaveSuccess={() => {
                        // Refresh saved plans list after successful save
                        axios.get(`http://localhost:5000/api/plan/user/${currentUser.uid}`)
                          .then(res => setSavedPlans(res.data || []))
                          .catch(err => console.error("Failed to refresh plans:", err));
                      }}
                    />
                  </motion.div>
                )}

                {!loading && selectedSavedPlan && !generatedPlan && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm text-white/50">
                        Viewing saved plan from {new Date(selectedSavedPlan.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => setSelectedSavedPlan(null)}
                        className="text-sm text-primary-400 hover:text-primary-300"
                      >
                        ← Back to new plan
                      </button>
                    </div>
                    <PlanDisplay 
                      plan={JSON.parse(selectedSavedPlan.planContent)} 
                      memberName={selectedSavedPlan.memberName}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Planner;
