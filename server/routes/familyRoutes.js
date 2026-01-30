const express = require("express");
const router = express.Router();
const Family = require("../models/Family");

// GET /api/user/family?userId=xxxx
router.get("/family", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" });
  }

  try {
    const familyDoc = await Family.findOne({ userId });
    if (!familyDoc) {
      return res.status(404).json({ error: "Family not found" });
    }
    res.json({ family: familyDoc.family, dietType: familyDoc.dietType, allergens: familyDoc.allergens });
  } catch (err) {
    console.error("Error fetching family members:", err);
    res.status(500).json({ error: "Failed to fetch family members" });
  }
});


// POST /api/family - Create or update family members
router.post("/", async (req, res) => {
  const { userId, family, dietType, allergens } = req.body;

  if (!userId || !Array.isArray(family)) {
    return res.status(400).json({ error: "Missing userId or family array" });
  }

  // Validate family data
  for (let i = 0; i < family.length; i++) {
    const member = family[i];
    if (!member.fullName || !member.age || !member.gender || !member.height || !member.weight) {
      return res.status(400).json({ error: `Invalid data for family member ${i + 1}` });
    }
  }

  try {
    // Use upsert to create or update
    const updated = await Family.findOneAndUpdate(
      { userId },
      { 
        userId,
        family, 
        ...(dietType && { dietType }), 
        ...(allergens && { allergens }) 
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({ message: "Family members saved successfully", data: updated });
  } catch (err) {
    console.error("Error saving family members:", err);
    res.status(500).json({ error: "Failed to save family members" });
  }
});


module.exports = router;
