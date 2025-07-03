const mongoose = require('mongoose');

const mealLogSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: { type: Date, default: Date.now },
  foodItems: [String],
  calories: Number
});

module.exports = mongoose.model('MealLog', mealLogSchema);
