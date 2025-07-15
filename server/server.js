require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes (order matters)
const userRoutes = require('./routes/userRoutes');   // <-- define once and use below
const planRoutes = require("./routes/planRoutes");
const familyRoutes = require("./routes/familyRoutes");
const authRoutes = require("./routes/authRoutes");
const logRoutes = require("./routes/logRoutes");

app.use("/api/user", userRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/log", logRoutes);

// Test endpoint
app.get('/test-log', (req, res) => {
  console.log("Testing logs in terminal...");
  res.json({ message: "Logs are working!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
