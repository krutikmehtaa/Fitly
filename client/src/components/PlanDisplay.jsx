import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Meal icons
const mealIcons = {
  breakfast: "🍳",
  lunch: "🥗",
  dinner: "🍽️",
  snack: "🍎",
};

// Macro color classes
const macroColors = {
  protein: "text-blue-400",
  carbs: "text-amber-400",
  fat: "text-pink-400",
};

// Meal Card Component
function MealCard({ type, meal }) {
  if (!meal) return null;
  
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{mealIcons[type] || "🍴"}</span>
          <span className="font-semibold text-white capitalize">{type}</span>
        </div>
        <span className="text-sm text-primary-400 font-medium">{meal.calories} kcal</span>
      </div>
      
      <h4 className="text-white/90 font-medium mb-2">{meal.name}</h4>
      
      {meal.items && meal.items.length > 0 && (
        <ul className="space-y-1 mb-3">
          {meal.items.map((item, i) => (
            <li key={i} className="text-white/60 text-sm flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      
      {/* Macros */}
      <div className="flex gap-4 pt-2 border-t border-white/5">
        <div className="text-center">
          <p className={`text-sm font-semibold ${macroColors.protein}`}>{meal.protein}g</p>
          <p className="text-xs text-white/40">Protein</p>
        </div>
        <div className="text-center">
          <p className={`text-sm font-semibold ${macroColors.carbs}`}>{meal.carbs}g</p>
          <p className="text-xs text-white/40">Carbs</p>
        </div>
        <div className="text-center">
          <p className={`text-sm font-semibold ${macroColors.fat}`}>{meal.fat}g</p>
          <p className="text-xs text-white/40">Fat</p>
        </div>
      </div>
    </div>
  );
}

// Workout Card Component
function WorkoutCard({ workout }) {
  if (!workout) return null;
  
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-accent-500/10 to-accent-600/5 border border-accent-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💪</span>
          <span className="font-semibold text-white">{workout.type}</span>
        </div>
        <span className="px-3 py-1 rounded-full bg-accent-500/20 text-accent-300 text-sm">
          {workout.duration}
        </span>
      </div>
      
      {/* Warmup */}
      {workout.warmup && workout.warmup.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">🔥 Warm-up</p>
          <div className="flex flex-wrap gap-2">
            {workout.warmup.map((item, i) => (
              <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-white/70 text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Exercises */}
      {workout.exercises && workout.exercises.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">🏋️ Exercises</p>
          {workout.exercises.map((ex, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03]">
              <span className="text-white/90 font-medium">{ex.name}</span>
              <div className="flex items-center gap-3 text-sm">
                {ex.sets && <span className="text-white/50">{ex.sets} sets</span>}
                {ex.reps && <span className="text-accent-400">{ex.reps} reps</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Cooldown */}
      {workout.cooldown && workout.cooldown.length > 0 && (
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">❄️ Cool-down</p>
          <div className="flex flex-wrap gap-2">
            {workout.cooldown.map((item, i) => (
              <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-white/70 text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Day Card Component
function DayCard({ day, isExpanded, onToggle, index }) {
  const totalCalories = day.meals 
    ? Object.values(day.meals).reduce((sum, meal) => sum + (meal?.calories || 0), 0)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card overflow-hidden"
    >
      {/* Day Header */}
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-glow">
            {day.day}
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">Day {day.day}</h3>
            <p className="text-sm text-white/50">{day.theme}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-primary-400">{totalCalories} kcal</p>
            <p className="text-xs text-white/40">Total calories</p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-6">
              {/* Meals Grid */}
              <div>
                <h4 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                  🍽️ Meals
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {day.meals && (
                    <>
                      <MealCard type="breakfast" meal={day.meals.breakfast} />
                      <MealCard type="lunch" meal={day.meals.lunch} />
                      <MealCard type="dinner" meal={day.meals.dinner} />
                      <MealCard type="snack" meal={day.meals.snack} />
                    </>
                  )}
                </div>
              </div>
              
              {/* Workout */}
              {day.workout && (
                <div>
                  <h4 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                    💪 Workout
                  </h4>
                  <WorkoutCard workout={day.workout} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Fallback for raw text (in case JSON parsing fails)
function RawPlanDisplay({ text }) {
  // Clean up markdown formatting
  const cleanText = text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/`/g, '');

  return (
    <div className="glass-card p-6">
      <div className="prose prose-invert max-w-none">
        {cleanText.split('\n').map((line, i) => {
          if (!line.trim()) return <br key={i} />;
          return <p key={i} className="text-white/70 my-1">{line}</p>;
        })}
      </div>
    </div>
  );
}

// Main PlanDisplay Component
export default function PlanDisplay({ 
  plan, 
  memberName, 
  memberData,
  userId,
  onSaveSuccess 
}) {
  const [expandedDays, setExpandedDays] = useState([1]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  if (!plan) return null;

  // Determine if plan is structured JSON or raw text
  const isStructured = plan.type === "structured" && plan.data;
  const planData = isStructured ? plan.data : null;

  const toggleDay = (dayNumber) => {
    setExpandedDays(prev => 
      prev.includes(dayNumber)
        ? prev.filter(d => d !== dayNumber)
        : [...prev, dayNumber]
    );
  };

  const expandAll = () => {
    if (planData?.days) {
      setExpandedDays(planData.days.map(d => d.day));
    }
  };
  
  const collapseAll = () => setExpandedDays([]);

  const handleSavePlan = async () => {
    if (!userId || !memberData) return;
    
    setSaving(true);
    try {
      await axios.post("http://localhost:5000/api/plan/save", {
        userId,
        memberName,
        memberIndex: memberData.memberIndex,
        dietType: memberData.dietType,
        allergens: memberData.allergens,
        fitnessGoals: memberData.fitnessGoals,
        workoutDays: memberData.workoutDays,
        dislikedFoods: memberData.dislikedFoods,
        workoutRestrictions: memberData.workoutRestrictions,
        conditions: memberData.conditions,
        exercisesPerWorkout: memberData.exercisesPerWorkout,
        planContent: JSON.stringify(plan),
        age: memberData.age,
        gender: memberData.gender,
        height: memberData.height,
        weight: memberData.weight,
      });
      setSaved(true);
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error("Failed to save plan:", err);
    }
    setSaving(false);
  };

  // Calculate actual average daily calories from meals
  const calculateAverageDailyCalories = () => {
    if (!planData?.days) return 0;
    
    const totalCalories = planData.days.reduce((sum, day) => {
      if (!day.meals) return sum;
      const dayTotal = Object.values(day.meals).reduce((daySum, meal) => 
        daySum + (meal?.calories || 0), 0
      );
      return sum + dayTotal;
    }, 0);
    
    return Math.round(totalCalories / planData.days.length);
  };

  // Render structured plan
  if (isStructured && planData) {
    const avgDailyCalories = calculateAverageDailyCalories();
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold gradient-text">
              Your 7-Day Plan
            </h2>
            <p className="text-white/50 mt-1">{planData.summary}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              Collapse All
            </button>
            {userId && memberData && (
              <motion.button
                onClick={handleSavePlan}
                disabled={saving || saved}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  saved 
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-primary-500/20 text-primary-400 border border-primary-500/30 hover:bg-primary-500/30"
                }`}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : saved ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span>Save Plan</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <span className="stat-value">{planData.days?.length || 7}</span>
            <span className="stat-label">Days</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{avgDailyCalories || '~2000'}</span>
            <span className="stat-label">Daily Calories</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{planData.days?.filter(d => d.workout && !d.workout.isRestDay).length || 0}</span>
            <span className="stat-label">Workouts</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">✓</span>
            <span className="stat-label">Personalized</span>
          </div>
        </div>

        {/* Days */}
        <div className="space-y-4">
          {planData.days?.map((day, index) => (
            <DayCard
              key={day.day}
              day={day}
              index={index}
              isExpanded={expandedDays.includes(day.day)}
              onToggle={() => toggleDay(day.day)}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Fallback for raw text response
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold gradient-text">
            Your Personalized Plan
          </h2>
          <p className="text-white/50 mt-1">7-day health plan for {memberName}</p>
        </div>
        {userId && memberData && (
          <motion.button
            onClick={handleSavePlan}
            disabled={saving || saved}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              saved 
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-primary-500/20 text-primary-400 border border-primary-500/30 hover:bg-primary-500/30"
            }`}
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Plan"}
          </motion.button>
        )}
      </div>
      <RawPlanDisplay text={typeof plan === 'string' ? plan : JSON.stringify(plan.data || plan)} />
    </motion.div>
  );
}
