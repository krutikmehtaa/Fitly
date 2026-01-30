const mongoose = require("mongoose");

const familyMemberSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  conditions: { type: String, default: "" },
  
  // Member-level preferences
  dietType: { 
    type: String, 
    enum: ["Vegetarian", "Non-Vegetarian", "Vegan", "Jain", ""], 
    default: "" 
  },
  allergens: { type: [String], default: [] },
  fitnessGoals: { type: [String], default: [] },
  
  // Stats tracking
  bmi: { type: Number },
  targetWeight: { type: Number },
  activityLevel: { 
    type: String, 
    enum: ["Sedentary", "Lightly Active", "Moderately Active", "Very Active", "Extra Active", ""],
    default: ""
  },
},
{ timestamps: true }
);

// Calculate BMI before saving
familyMemberSchema.pre('save', function(next) {
  if (this.height && this.weight) {
    const heightInMeters = this.height / 100;
    this.bmi = parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }
  next();
});

const familySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    family: { type: [familyMemberSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Family", familySchema);
