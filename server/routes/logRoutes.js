const express = require("express");
const router = express.Router();
const { getNutritionInfo } = require("../services/nutritionixService");
const MealLog = require("../models/MealLog");

router.post("/meal", async (req, res) => {
  const { userId, food } = req.body;

  try {
    console.log("Logging meal for user:", userId, "with food:", food);

    const nutrition = await getNutritionInfo(food);

    const calories = nutrition.foods.reduce((sum, item) => sum + item.nf_calories, 0);

    const mealLog = new MealLog({ userId, foodItems: [food], calories });
    await mealLog.save();

    res.json({ message: "Meal logged", mealLog });
  } catch (err) {
    console.error("Error in /log/meal:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to log meal" });
  }
});

module.exports = router;
