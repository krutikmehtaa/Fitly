const express = require("express");
const router = express.Router();
const User = require("../models/User");

// 1. Register with Email/Password
router.post("/register", async (req, res) => {
  const { firebaseUid, email, firstName, lastName } = req.body;

  try {
    const existing = await User.findOne({ firebaseUid });
    if (existing) return res.status(409).json({ error: "User already exists" });

    const user = new User({ firebaseUid, email, firstName, lastName });
    await user.save();
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// 2. Google Sign-In (Create if not exists)
router.post("/google", async (req, res) => {
  const { firebaseUid, email, firstName, lastName } = req.body;

  try {
    // Check if the user already exists in MongoDB
    let user = await User.findOne({ firebaseUid });
    
    if (user) {
      // User exists, return success
      return res.status(200).json({ 
        message: "User already exists", 
        user: {
          firebaseUid: user.firebaseUid,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    }

    // User doesn't exist, create new user
    user = new User({ firebaseUid, email, firstName, lastName });
    await user.save();

    return res.status(201).json({ 
      message: "Google user created successfully", 
      user: {
        firebaseUid: user.firebaseUid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error("Error saving Google user:", error);
    return res.status(500).json({ error: "Server error during Google authentication" });
  }
});

// 3. Get User by Firebase UID
router.get("/userByFirebaseUid/:firebaseUid", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user by Firebase UID:", err);
    res.status(500).json({ error: "Server error fetching user" });
  }
});

module.exports = router;