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
    workoutDays = 4,
    exercisesPerWorkout = 5,
    dislikedFoods = "",
    workoutRestrictions = "",
  } = member;

  // Calculate which specific days get workouts
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const workoutSchedule = [];
  const restSchedule = [];
  
  // Intelligently distribute workout days with rest days in between
  if (workoutDays === 3) {
    workoutSchedule.push(1, 3, 5); // Mon, Wed, Fri - classic split
  } else if (workoutDays === 4) {
    workoutSchedule.push(1, 2, 4, 5); // Mon, Tue, Thu, Fri - rest on Wed/weekend
  } else if (workoutDays === 5) {
    workoutSchedule.push(1, 2, 4, 5, 7); // Mon-Tue, Thu-Fri, Sun - rest on Wed & Sat
  } else if (workoutDays === 6) {
    workoutSchedule.push(1, 2, 3, 4, 5, 7); // Mon-Fri, Sun - rest on Sat only
  } else {
    // Default: distribute evenly
    for (let i = 0; i < workoutDays; i++) {
      workoutSchedule.push(i + 1);
    }
  }
  
  // Determine rest days
  for (let i = 1; i <= 7; i++) {
    if (!workoutSchedule.includes(i)) {
      restSchedule.push(i);
    }
  }

  const prompt = `You are a professional nutritionist and fitness coach. Create a detailed 7-day plan.

MEMBER PROFILE:
- ${age}y ${gender}, ${height}cm, ${weight}kg
- Medical: ${conditions || "None"}  
- Diet: ${dietType}
- Avoid: ${[...allergens, dislikedFoods].filter(Boolean).join(", ") || "None"}
- Goals: ${fitnessGoals.join(", ")}
- Workout Limits: ${workoutRestrictions || "None"}

WORKOUT SCHEDULE (FOLLOW EXACTLY):
- Total workouts this week: ${workoutDays}
- WORKOUT DAYS: ${workoutSchedule.map(d => `Day ${d} (${dayNames[d-1]})`).join(", ")}
- REST DAYS: ${restSchedule.map(d => `Day ${d} (${dayNames[d-1]})`).join(", ")}
- Exercises per workout: ${exercisesPerWorkout}

MEAL REQUIREMENTS (CRITICAL):
- **MEAL NAMES MUST BE DETAILED WITH INGREDIENTS**: Examples:
  * ❌ BAD: "Oatmeal", "Salad", "Chicken", "Smoothie"
  * ✅ GOOD: "Cinnamon Apple Oatmeal with Walnuts & Greek Yogurt", "Mediterranean Quinoa Bowl with Roasted Chickpeas, Feta & Lemon Dressing"
- Include 3-5 key ingredients in every meal name
- Add cooking method if relevant (Grilled, Baked, Roasted, Steamed, etc.)
- Descriptions should mention preparation technique or what makes it special (8-15 words)
- Make meals realistic, delicious, culturally diverse, and aligned with ${dietType} diet
- Ensure proper calorie and macro distribution for ${fitnessGoals.join(", ")}

Return ONLY this JSON structure:
{
  "summary": "One sentence plan summary",
  "dailyCalories": 2500,
  "days": [
${Array.from({length: 7}, (_, i) => {
  const day = i + 1;
  const isWorkoutDay = workoutSchedule.includes(day);
  return `    {
      "day": ${day},
      "meals": {
        "breakfast": {"name": "e.g., 'Spinach & Mushroom Omelette with Whole Wheat Toast'", "description": "Sautéed veggies in eggs, served with toasted bread", "calories": 450, "protein": 28, "carbs": 35, "fat": 18},
        "lunch": {"name": "e.g., 'Grilled Salmon with Quinoa & Steamed Broccoli'", "description": "Herb-marinated fish, fluffy quinoa, tender vegetables", "calories": 600, "protein": 42, "carbs": 48, "fat": 22},
        "dinner": {"name": "e.g., 'Chicken Stir-Fry with Brown Rice & Mixed Vegetables'", "description": "Tender chicken pieces in soy-ginger sauce with veggies", "calories": 650, "protein": 45, "carbs": 60, "fat": 20},
        "snack": {"name": "e.g., 'Greek Yogurt with Blueberries & Honey Almonds'", "description": "Creamy yogurt topped with fresh berries and nuts", "calories": 250, "protein": 15, "carbs": 28, "fat": 8}
      },
      "workout": ${isWorkoutDay ? `{"isRestDay": false, "type": "Workout Type", "duration": "45 mins", "exercises": [${Array(exercisesPerWorkout).fill('{"name": "Exercise", "sets": 3, "reps": "10-12"}').join(', ')}]}` : '{"isRestDay": true}'}
    }`;
}).join(',\n')}
  ]
}

MANDATORY REQUIREMENTS - READ CAREFULLY:
1. ⚠️ **CRITICAL: MEAL NAMES** - Must include 3-5 ingredients AND cooking method
   - Example: "Herb-Grilled Chicken Breast with Roasted Sweet Potato & Garlic Green Beans"
   - NOT acceptable: "Chicken", "Salad", "Oatmeal", "Bowl"
2. MEAL DESCRIPTIONS: Explain how it's prepared or why it's beneficial (10-15 words)
3. All 7 days must have complete, unique meals (breakfast, lunch, dinner, snack)
4. Workout days (${workoutSchedule.join(", ")}): Full workout with ${exercisesPerWorkout} exercises
5. Rest days (${restSchedule.join(", ")}): ONLY {"isRestDay": true}
6. All meals MUST be ${dietType} compatible
7. ABSOLUTELY EXCLUDE: ${[...allergens, dislikedFoods].filter(Boolean).join(", ") || "None"}
8. Workout names: Specific target (e.g., "Upper Body Hypertrophy" not "Strength")
9. Exercise names: Include equipment (e.g., "Barbell Bench Press 3x10" not "Press")
10. Return ONLY valid JSON, no markdown, no extra text

Generate a comprehensive, detailed plan with specific meal names now:`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "models/gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = await response.text();
    
    // Clean up the response
    text = text.trim();
    if (text.startsWith("```json")) {
      text = text.slice(7);
    } else if (text.startsWith("```")) {
      text = text.slice(3);
    }
    if (text.endsWith("```")) {
      text = text.slice(0, -3);
    }
    text = text.trim();

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(text);
      return { type: "structured", data: parsed };
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      return { type: "raw", data: text };
    }
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error(`Failed to generate plan: ${error.message}`);
  }
}

module.exports = { generatePersonalizedPlan };
