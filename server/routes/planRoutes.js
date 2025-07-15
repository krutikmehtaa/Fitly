const express = require("express");
const router = express.Router();
const { generatePersonalizedPlan } = require("../services/geminiService");
const Plan = require("../models/Plan");

// Combined route to generate meal + workout plans for one member
router.post("/generate", async (req, res) => {
  const { member } = req.body;

  if (!member) {
    return res.status(400).json({ error: "Member data is required" });
  }

  try {
    const plan = await generatePersonalizedPlan(member);
    // plan could be an object with mealPlan, workoutPlan, or a combined text

    res.json({
      plan,
      message: "Personalized plan generated successfully",
    });
  } catch (error) {
    console.error("Error generating personalized plan:", error);
    res.status(500).json({ error: "Failed to generate personalized plan" });
  }
});

// POST /api/plan/save
router.post("/save", async (req, res) => {
  const { userEmail, memberName, dietType, allergens, fitnessGoals, mealPlan, workoutPlan } = req.body;

  try {
    const plan = new Plan({
      userEmail,
      memberName,
      dietType,
      allergens,
      fitnessGoals,
      mealPlan,
      workoutPlan,
    });

    await plan.save();

    res.json({ message: "Plan saved successfully", plan });
  } catch (err) {
    console.error("Error saving plan:", err);
    res.status(500).json({ error: "Failed to save plan" });
  }
});


// GET all plans for the logged-in user
router.get("/all/:email", async (req, res) => {
  try {
    const plans = await Plan.find({ userEmail: req.params.email });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

module.exports = router;
