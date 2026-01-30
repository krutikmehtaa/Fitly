// models/Plan.js
const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Firebase UID
    memberName: { type: String, required: true }, // fullName from Family member
    memberIndex: { type: Number }, // Index in family array
    
    // Plan inputs
    dietType: { type: String, required: true },
    allergens: { type: [String], default: [] },
    fitnessGoals: { type: [String], default: [] },
    workoutDays: { type: Number, default: 4 },
    exercisesPerWorkout: { type: Number, default: 5 }, // Number of exercises per workout
    dislikedFoods: { type: String, default: "" },
    workoutRestrictions: { type: String, default: "" },
    conditions: { type: String, default: "" }, // Moved from member stats
    
    // Member stats at time of plan generation
    age: { type: Number },
    gender: { type: String },
    height: { type: Number },
    weight: { type: Number },
    
    // Generated plan content
    planContent: { type: String, required: true }, // Raw Gemini response
    
    // Metadata
    status: { 
      type: String, 
      enum: ["active", "completed", "archived"],
      default: "active"
    },
    weekStartDate: { type: Date, default: Date.now },
    
    // Future: Feedback & rating
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
  },
  { timestamps: true }
);

// Index for efficient queries
planSchema.index({ userId: 1, memberName: 1, createdAt: -1 });

module.exports = mongoose.model("Plan", planSchema);
