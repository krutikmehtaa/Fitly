const axios = require('axios');

const APP_ID = process.env.NUTRITIONIX_APP_ID;
const APP_KEY = process.env.NUTRITIONIX_APP_KEY;

async function getNutritionInfo(foodName) {
  const url = 'https://trackapi.nutritionix.com/v2/natural/nutrients';

  const response = await axios.post(url, {
    query: foodName
  }, {
    headers: {
      "x-app-id": APP_ID,
      "x-app-key": APP_KEY,
      "Content-Type": "application/json"
    }
  });

  return response.data;
}

module.exports = { getNutritionInfo };
