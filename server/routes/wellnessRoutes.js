const express = require('express');
const router = express.Router();
const { analyzeMessage } = require('../services/emotionService');
const { 
  getActivityById, 
  getAllActivities, 
  getActivitiesByCategory,
  categories 
} = require('../data/wellnessActivities');

/**
 * POST /api/wellness/analyze
 * Analyze user message and get wellness recommendations
 */
router.post('/analyze', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    const result = await analyzeMessage(message);

    res.json(result);
  } catch (error) {
    console.error('Error analyzing message:', error);
    res.status(500).json({ 
      error: 'Failed to analyze message',
      details: error.message 
    });
  }
});

/**
 * GET /api/wellness/activities
 * Get all wellness activities
 */
router.get('/activities', (req, res) => {
  try {
    const activities = getAllActivities();
    res.json({ 
      success: true,
      count: activities.length,
      activities 
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activities',
      details: error.message 
    });
  }
});

/**
 * GET /api/wellness/activities/:id
 * Get specific activity by ID
 */
router.get('/activities/:id', (req, res) => {
  try {
    const { id } = req.params;
    const activity = getActivityById(id);

    if (!activity) {
      return res.status(404).json({ 
        error: 'Activity not found' 
      });
    }

    res.json({ 
      success: true,
      activity 
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activity',
      details: error.message 
    });
  }
});

/**
 * GET /api/wellness/categories
 * Get all activity categories
 */
router.get('/categories', (req, res) => {
  try {
    res.json({ 
      success: true,
      categories 
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      details: error.message 
    });
  }
});

/**
 * GET /api/wellness/categories/:category
 * Get activities by category
 */
router.get('/categories/:category', (req, res) => {
  try {
    const { category } = req.params;
    const activities = getActivitiesByCategory(category);

    res.json({ 
      success: true,
      category,
      count: activities.length,
      activities 
    });
  } catch (error) {
    console.error('Error fetching activities by category:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activities',
      details: error.message 
    });
  }
});

module.exports = router;
