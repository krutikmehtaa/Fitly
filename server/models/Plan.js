// models/Plan.js
const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true }, // from User model
    memberName: { type: String, required: true }, // fullName from Family member
    dietType: { type: String, required: true },
    allergens: { type: [String], default: [] },
    fitnessGoals: { type: [String], default: [] },
    mealPlan: { type: String, required: true },
    workoutPlan: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
