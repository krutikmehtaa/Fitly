const mongoose = require("mongoose");

const familyMemberSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  conditions: { type: String, default: "" },
},
{ timestamps: true }
);

const familySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    family: { type: [familyMemberSchema], default: [] },
    dietType: { 
      type: String, 
      enum: ["Vegetarian", "Non-Vegetarian", "Vegan", "Jain", ""], 
      default: "" 
    },
    allergens: { type: [String], default: [] }, // list of allergen strings
  },
  { timestamps: true }
);

module.exports = mongoose.model("Family", familySchema);
