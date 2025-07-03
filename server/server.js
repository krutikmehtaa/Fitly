require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
 
const app = express();

const planRoutes = require("./routes/planRoutes");
const familyRoutes = require("./routes/familyRoutes");
const authRoutes = require("./routes/authRoutes");

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes

app.use("/api/plan", planRoutes);
app.use("/api/user", familyRoutes);
app.use("/api/auth", authRoutes); 
app.use("/api/log", require("./routes/logRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Test endpoint
app.get('/test-log', (req, res) => {
  console.log("Testing logs in terminal...");
  res.json({ message: "Logs are working!" });
});
