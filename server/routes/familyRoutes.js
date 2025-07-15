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


// POST /api/user/family
router.post("/", async (req, res) => {
  const { userId, family, dietType, allergens } = req.body;

  if (!userId || !Array.isArray(family)) {
    return res.status(400).json({ error: "Missing userId or family array" });
  }

  try {
    const updated = await Family.findOneAndUpdate(
      { userId },
      { family, dietType, allergens },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Family members saved", data: updated });
  } catch (err) {
    console.error("Error saving family members:", err);
    res.status(500).json({ error: "Failed to save family members" });
  }
});


module.exports = router;
