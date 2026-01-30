/**
 * Emotion Analysis Service
 * Uses Hugging Face API for sentiment/emotion detection
 * Fallback to rule-based analysis if API unavailable
 */

const axios = require('axios');

// Hugging Face API endpoint
const HF_API_URL = 'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY; // Optional: set in .env for higher rate limits

/**
 * Analyze emotion using Hugging Face model
 */
async function analyzeEmotionHF(text) {
  try {
    const headers = HF_API_KEY 
      ? { 'Authorization': `Bearer ${HF_API_KEY}` }
      : {};

    const response = await axios.post(
      HF_API_URL,
      { inputs: text },
      { headers, timeout: 10000 }
    );

    // Response format: [{ label: 'joy', score: 0.89 }, ...]
    const emotions = response.data[0];
    
    // Get top emotion
    const topEmotion = emotions.reduce((max, curr) => 
      curr.score > max.score ? curr : max
    );

    return {
      primary: topEmotion.label,
      confidence: topEmotion.score,
      all: emotions,
      method: 'huggingface'
    };
  } catch (error) {
    console.warn('HuggingFace API error, falling back to rule-based:', error.message);
    return analyzeEmotionRuleBased(text);
  }
}

/**
 * Rule-based emotion analysis (fallback)
 * Uses keyword matching and sentiment analysis
 */
function analyzeEmotionRuleBased(text) {
  const lowerText = text.toLowerCase();
  
  // Emotion keywords
  const emotionPatterns = {
    stress: {
      keywords: ['stress', 'overwhelm', 'pressure', 'anxious', 'worried', 'tense', 'frantic', 'rushed'],
      weight: 0
    },
    anxiety: {
      keywords: ['anxiety', 'nervous', 'scared', 'panic', 'worry', 'fear', 'uneasy'],
      weight: 0
    },
    sadness: {
      keywords: ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'gloomy', 'blue', 'crying'],
      weight: 0
    },
    anger: {
      keywords: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated', 'rage'],
      weight: 0
    },
    joy: {
      keywords: ['happy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'awesome', 'love', 'joy'],
      weight: 0
    },
    fatigue: {
      keywords: ['tired', 'exhausted', 'drained', 'sleepy', 'fatigued', 'worn out', 'weary'],
      weight: 0
    },
    motivation: {
      keywords: ['motivated', 'pumped', 'ready', 'determined', 'focused', 'driven', 'energized'],
      weight: 0,
      positive: true
    },
    unmotivated: {
      keywords: ['unmotivated', 'lazy', "don't feel like", "don't want", 'skip', 'give up', 'quit'],
      weight: 0
    }
  };

  // Calculate weights
  for (const [emotion, data] of Object.entries(emotionPatterns)) {
    data.weight = data.keywords.reduce((count, keyword) => {
      return count + (lowerText.includes(keyword) ? 1 : 0);
    }, 0);
  }

  // Find top emotion
  let topEmotion = 'neutral';
  let maxWeight = 0;

  for (const [emotion, data] of Object.entries(emotionPatterns)) {
    if (data.weight > maxWeight) {
      maxWeight = data.weight;
      topEmotion = emotion;
    }
  }

  // Calculate confidence (rough approximation)
  const totalWords = lowerText.split(/\s+/).length;
  const confidence = maxWeight > 0 
    ? Math.min(0.5 + (maxWeight / totalWords) * 2, 0.95)
    : 0.3;

  return {
    primary: topEmotion,
    confidence: confidence,
    all: Object.entries(emotionPatterns).map(([label, data]) => ({
      label,
      score: data.weight / (data.keywords.length + 1)
    })),
    method: 'rule-based'
  };
}

/**
 * Detect user intent from text
 */
function detectIntent(text) {
  const lowerText = text.toLowerCase();
  
  const intents = {
    skipWorkout: /skip|don't feel like|too tired|not today|maybe tomorrow|give up/i.test(text),
    seekMotivation: /motivate|inspire|encourage|need help|struggling|can't do/i.test(text),
    askAdvice: /should i|what do|how do|advice|recommend|suggest/i.test(text),
    reportSuccess: /did it|completed|finished|crushed|nailed|accomplished/i.test(text),
    expressGratitude: /thank|thanks|appreciate|grateful/i.test(text),
    sleepIssues: /can't sleep|insomnia|tired|exhausted|sleep|rest/i.test(text),
    stressRelief: /stress|overwhelm|calm|relax|breathe/i.test(text),
  };

  return Object.entries(intents)
    .filter(([_, matches]) => matches)
    .map(([intent]) => intent);
}

/**
 * Map emotion to wellness activities
 */
function getWellnessActivities(emotionResult, intents = []) {
  const { primary, confidence } = emotionResult;
  
  const activityMap = {
    stress: [
      { id: 'box-breathing', priority: 1 },
      { id: 'body-scan-meditation', priority: 2 },
      { id: 'stress-journal', priority: 3 },
      { id: 'gentle-yoga', priority: 4 },
      { id: 'nature-walk', priority: 5 }
    ],
    anxiety: [
      { id: '5-4-3-2-1-grounding', priority: 1 },
      { id: 'alternate-nostril-breathing', priority: 2 },
      { id: 'anxiety-reframe', priority: 3 },
      { id: 'calming-meditation', priority: 4 }
    ],
    sadness: [
      { id: 'gratitude-journal', priority: 1 },
      { id: 'mood-boost-movement', priority: 2 },
      { id: 'self-compassion-meditation', priority: 3 },
      { id: 'music-therapy', priority: 4 }
    ],
    fatigue: [
      { id: 'power-nap-guide', priority: 1 },
      { id: 'energy-breathing', priority: 2 },
      { id: 'sleep-hygiene-check', priority: 3 },
      { id: 'caffeine-timing', priority: 4 }
    ],
    unmotivated: [
      { id: 'micro-goal-setting', priority: 1 },
      { id: 'victory-log', priority: 2 },
      { id: 'motivation-meditation', priority: 3 },
      { id: '5-min-movement', priority: 4 }
    ],
    anger: [
      { id: 'anger-release-breathing', priority: 1 },
      { id: 'physical-release', priority: 2 },
      { id: 'perspective-shift', priority: 3 }
    ],
    joy: [
      { id: 'celebrate-wins', priority: 1 },
      { id: 'gratitude-practice', priority: 2 },
      { id: 'energy-channel', priority: 3 }
    ]
  };

  // Get activities for detected emotion
  const activities = activityMap[primary] || activityMap.stress;

  // Adjust based on intents
  if (intents.includes('sleepIssues')) {
    activities.unshift({ id: 'sleep-routine', priority: 0 });
  }
  if (intents.includes('skipWorkout')) {
    activities.unshift({ id: 'micro-workout', priority: 0 });
  }

  return activities.slice(0, 4); // Return top 4
}

/**
 * Generate empathetic response
 */
function generateResponse(emotionResult, activities, userMessage) {
  const { primary, confidence } = emotionResult;
  
  // Response templates by emotion
  const responses = {
    stress: [
      "I can tell you're feeling overwhelmed right now. Let's take a moment to reset.",
      "Work stress is tough - you're not alone in this. Let's find some calm together.",
      "That sounds really stressful. Taking care of your mental health is just as important as physical health."
    ],
    anxiety: [
      "Anxiety can be really challenging. Let's ground ourselves and find some peace.",
      "I hear you. Anxiety is real, but we have tools to help you feel more centered.",
      "Take a deep breath - you're safe, and we'll work through this together."
    ],
    fatigue: [
      "Being tired is completely valid. Rest is a crucial part of health.",
      "Exhaustion is your body's way of asking for care. Let's listen to it.",
      "You don't have to power through everything. Let's focus on recovery."
    ],
    unmotivated: [
      "It's totally normal to feel this way sometimes. Small steps still count!",
      "Motivation comes and goes - that's human. Let's make today manageable.",
      "You don't need to be perfect. Showing up, even a little, is progress."
    ],
    sadness: [
      "I'm here with you. It's okay to not feel okay sometimes.",
      "Sadness is part of being human. Let's be gentle with ourselves today.",
      "Your feelings are valid. Let's find something that might help lift your spirits a bit."
    ],
    joy: [
      "That's wonderful! Let's capture this positive energy!",
      "I love hearing this! Keep riding this wave of positivity.",
      "Amazing! This is what it's all about - celebrate yourself!"
    ],
    neutral: [
      "Thanks for checking in. How can I support your wellness today?",
      "I'm here to help you feel your best. What do you need right now?",
      "Let's see what we can do to support your health journey today."
    ]
  };

  const emotionResponses = responses[primary] || responses.neutral;
  const response = emotionResponses[Math.floor(Math.random() * emotionResponses.length)];

  return {
    message: response,
    emotion: primary,
    confidence: confidence,
    activities: activities,
    timestamp: new Date()
  };
}

/**
 * Main analysis function
 */
async function analyzeMessage(userMessage) {
  try {
    // 1. Analyze emotion
    const emotionResult = await analyzeEmotionHF(userMessage);
    
    // 2. Detect intents
    const intents = detectIntent(userMessage);
    
    // 3. Map to activities
    const activities = getWellnessActivities(emotionResult, intents);
    
    // 4. Generate response
    const response = generateResponse(emotionResult, activities, userMessage);
    
    return {
      success: true,
      ...response,
      intents,
      method: emotionResult.method
    };
  } catch (error) {
    console.error('Error analyzing message:', error);
    return {
      success: false,
      message: "I'm here to support you. Could you tell me more about how you're feeling?",
      emotion: 'neutral',
      activities: [],
      error: error.message
    };
  }
}

module.exports = {
  analyzeMessage,
  analyzeEmotionHF,
  analyzeEmotionRuleBased,
  detectIntent,
  getWellnessActivities,
  generateResponse
};
