const express = require("express");
const router = express.Router();
const Family = require("../models/Family");
const User = require("../models/User"); // You'll need to import your User model

// Save family data (initial registration)
router.post("/family", async (req, res) => {
  const { userEmail, family } = req.body;

  try {
    // First, find the user by email to get their ObjectId
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = user._id; // This is the actual ObjectId

    // Check if family already exists for this user
    const existing = await Family.findOne({ userId });
    if (existing) {
      return res.status(400).json({ error: "Family already registered" });
    }

    // Create new family document with the ObjectId
    const newFamily = new Family({ userId, family });
    await newFamily.save();

    res.status(201).json({ message: "Family registered successfully" });
  } catch (err) {
    console.error("Error saving family members:", err);
    res.status(500).json({ error: "Failed to register family" });
  }
});

// Update diet type, allergens, or fitness goal later
router.put("/preferences/:userId", async (req, res) => {
  const { dietType, allergens, updatedGoals } = req.body;

  try {
    const updated = await Family.findOneAndUpdate(
      { userId: req.params.userId },
      {
        dietType,
        allergens,
        ...(updatedGoals && { "family.$[].fitnessGoal": updatedGoals }) // Optional
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Family not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating preferences:", err);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

// Get family by user email (alternative endpoint)
router.get("/family/email/:email", async (req, res) => {
  try {
    // Find user by email first
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Then find family by userId
    const family = await Family.findOne({ userId: user._id });
    if (!family) {
      return res.status(404).json({ error: "No family found" });
    }

    res.json(family);
  } catch (err) {
    console.error("Error fetching family:", err);
    res.status(500).json({ error: "Error fetching family" });
  }
});

// Get family by user ObjectId (existing endpoint)
router.get("/family/:userId", async (req, res) => {
  try {
    const family = await Family.findOne({ userId: req.params.userId });
    if (!family) {
      return res.status(404).json({ error: "No family found" });
    }
    res.json(family);
  } catch (err) {
    console.error("Error fetching family:", err);
    res.status(500).json({ error: "Error fetching family" });
  }
});

module.exports = router;