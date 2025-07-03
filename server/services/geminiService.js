const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Main function to generate personalized plan for one family member
async function generatePersonalizedPlan(member) {
  const {
    fullName,
    age,
    gender,
    height,
    weight,
    conditions,
    dietType,
    allergens = [],
    fitnessGoals = [],
  } = member;

  const prompt = `
  Create a personalized 7-day health plan for ${fullName}:

  PROFILE:
  • Age: ${age} | Gender: ${gender} | ${height}cms, ${weight}kgs
  • Medical: ${conditions || "None"}
  • Diet: ${dietType} | Allergens: ${allergens.length ? allergens.join(", ") : "None"}
  • Goals: ${fitnessGoals.join(", ")}

  REQUIREMENTS:
  Daily format for 7 days:
  - Meals: Breakfast, lunch, dinner (with nutrition information)
  - Workout: Warm-up → Main exercise → Cool-down
  - Intensity: Age/weight-appropriate
  - Clear day separation with friendly tone
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    return text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate plan from Gemini API.");
  }
}

module.exports = { generatePersonalizedPlan };