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

    res.json({
      plan,
      message: "Personalized plan generated successfully",
    });
  } catch (error) {
    console.error("Error generating personalized plan:", error);
    res.status(500).json({ error: "Failed to generate personalized plan" });
  }
});

// POST /api/plan/save - Save a generated plan
router.post("/save", async (req, res) => {
  const { 
    userId, 
    memberName, 
    memberIndex,
    dietType, 
    allergens, 
    fitnessGoals, 
    workoutDays,
    exercisesPerWorkout,
    dislikedFoods,
    workoutRestrictions,
    conditions,
    planContent,
    age,
    gender,
    height,
    weight
  } = req.body;

  if (!userId || !memberName || !planContent) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const plan = new Plan({
      userId,
      memberName,
      memberIndex,
      dietType,
      allergens,
      fitnessGoals,
      workoutDays,
      exercisesPerWorkout,
      dislikedFoods,
      workoutRestrictions,
      conditions,
      planContent,
      age,
      gender,
      height,
      weight,
    });

    await plan.save();

    res.json({ message: "Plan saved successfully", plan });
  } catch (err) {
    console.error("Error saving plan:", err);
    res.status(500).json({ error: "Failed to save plan" });
  }
});

// GET all plans for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    console.error("Error fetching plans:", err);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

// GET plans for a specific member
router.get("/user/:userId/member/:memberName", async (req, res) => {
  try {
    const plans = await Plan.find({ 
      userId: req.params.userId,
      memberName: req.params.memberName
    }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    console.error("Error fetching member plans:", err);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

// GET a single plan by ID
router.get("/:planId", async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.planId);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.json(plan);
  } catch (err) {
    console.error("Error fetching plan:", err);
    res.status(500).json({ error: "Failed to fetch plan" });
  }
});

// PUT update plan status or add feedback
router.put("/:planId", async (req, res) => {
  const { status, rating, feedback } = req.body;

  try {
    const plan = await Plan.findByIdAndUpdate(
      req.params.planId,
      { 
        ...(status && { status }),
        ...(rating && { rating }),
        ...(feedback && { feedback })
      },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json({ message: "Plan updated successfully", plan });
  } catch (err) {
    console.error("Error updating plan:", err);
    res.status(500).json({ error: "Failed to update plan" });
  }
});

// DELETE a plan
router.delete("/:planId", async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.planId);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.json({ message: "Plan deleted successfully" });
  } catch (err) {
    console.error("Error deleting plan:", err);
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

// GET plan statistics for dashboard
router.get("/stats/:userId", async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.params.userId });
    
    const stats = {
      totalPlans: plans.length,
      activePlans: plans.filter(p => p.status === "active").length,
      completedPlans: plans.filter(p => p.status === "completed").length,
      memberStats: {},
      goalDistribution: {},
      dietDistribution: {},
      recentPlans: plans.slice(0, 5),
    };

    // Calculate per-member stats
    plans.forEach(plan => {
      if (!stats.memberStats[plan.memberName]) {
        stats.memberStats[plan.memberName] = { count: 0, lastPlan: null };
      }
      stats.memberStats[plan.memberName].count++;
      if (!stats.memberStats[plan.memberName].lastPlan || 
          new Date(plan.createdAt) > new Date(stats.memberStats[plan.memberName].lastPlan)) {
        stats.memberStats[plan.memberName].lastPlan = plan.createdAt;
      }

      // Diet distribution
      if (plan.dietType) {
        stats.dietDistribution[plan.dietType] = (stats.dietDistribution[plan.dietType] || 0) + 1;
      }

      // Goal distribution
      plan.fitnessGoals?.forEach(goal => {
        stats.goalDistribution[goal] = (stats.goalDistribution[goal] || 0) + 1;
      });
    });

    res.json(stats);
  } catch (err) {
    console.error("Error fetching plan stats:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

module.exports = router;
