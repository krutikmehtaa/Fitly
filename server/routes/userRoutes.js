const express = require("express");
const router = express.Router();
const Family = require("../models/Family");
const User = require("../models/User");

// Save family data (initial registration)
router.post("/family", async (req, res) => {
  const { userEmail, family } = req.body;

  console.log("Received family registration request:", { 
    userEmail, 
    familyCount: family?.length,
    requestBody: req.body 
  });

  // Validate userEmail
  if (!userEmail || typeof userEmail !== 'string') {
    console.error("Missing or invalid userEmail:", userEmail);
    return res.status(400).json({ error: "Missing or invalid userEmail" });
  }

  // Validate family array
  if (!family || !Array.isArray(family) || family.length === 0) {
    console.error("Missing or invalid family data:", { family, isArray: Array.isArray(family) });
    return res.status(400).json({ error: "Missing or invalid family data" });
  }

  try {
    // Lookup User by email to get their MongoDB _id
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.error("User not found for email:", userEmail);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Found user:", { userId: user._id, email: user.email });

    const userId = user._id; // This is the ObjectId

    // Check if family is already registered
    const existing = await Family.findOne({ userId });
    if (existing) {
      console.warn("Family already registered for userId:", userId);
      return res.status(400).json({ error: "Family already registered" });
    }

    // Validate family data before saving
    for (let i = 0; i < family.length; i++) {
      const member = family[i];
      if (!member.fullName || !member.age || !member.gender || !member.height || !member.weight) {
        console.error("Invalid family member data at index", i, member);
        return res.status(400).json({ error: `Invalid data for family member ${i + 1}` });
      }
    }

    // Save new family with ObjectId
    const newFamily = new Family({ userId, family });
    
    console.log("Attempting to save family:", { userId, familyMembers: family.length });
    
    const savedFamily = await newFamily.save();
    
    console.log("Family registered successfully:", { savedFamilyId: savedFamily._id, userId });
    res.status(201).json({ message: "Family registered successfully", familyId: savedFamily._id });
    
  } catch (err) {
    console.error("Error saving family members:", err);
    console.error("Error details:", err.message);
    
    // Check for specific validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: "Validation failed", details: validationErrors });
    }
    
    res.status(500).json({ error: "Failed to register family", details: err.message });
  }
});

// Update preferences like dietType, allergens, fitnessGoal
router.put("/preferences/:userEmail", async (req, res) => {
  const { dietType, allergens, updatedGoals } = req.body;

  try {
    // Get userId from email
    const user = await User.findOne({ email: req.params.userEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updated = await Family.findOneAndUpdate(
      { userId: user._id },
      {
        ...(dietType && { dietType }),
        ...(allergens && { allergens }),
        ...(updatedGoals && { "family.$[].fitnessGoal": updatedGoals }),
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

// Get family by user email
router.get("/family/email/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      console.error("User not found for email:", req.params.email);
      return res.status(404).json({ error: "User not found" });
    }

    const family = await Family.findOne({ userId: user._id });
    if (!family) {
      return res.status(404).json({ error: "No family found" });
    }

    res.json(family);
  } catch (err) {
    console.error("Error fetching family by email:", err);
    res.status(500).json({ error: "Error fetching family" });
  }
});

// Get family by MongoDB userId directly
router.get("/family/:userId", async (req, res) => {
  try {
    const family = await Family.findOne({ userId: req.params.userId });
    if (!family) {
      return res.status(404).json({ error: "No family found" });
    }
    res.json(family);
  } catch (err) {
    console.error("Error fetching family by userId:", err);
    res.status(500).json({ error: "Error fetching family" });
  }
});

module.exports = router;