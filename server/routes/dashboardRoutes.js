const express = require("express");
const router = express.Router();
const FamilyMember = require("../models/Family");
const Plan = require("../models/Plan");

router.get("/members", async (req, res) => {
  const { userEmail } = req.query;
  try {
    const members = await FamilyMember.find({ userEmail });
    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

router.get("/plans", async (req, res) => {
  const { userEmail } = req.query;
  try {
    const plans = await Plan.find({ userEmail });
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

module.exports = router;