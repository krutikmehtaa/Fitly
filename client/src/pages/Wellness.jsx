import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import WellnessChat from '../components/WellnessChat';
import GuidedExercise from '../components/GuidedExercise';
import axios from 'axios';

export default function Wellness() {
  const location = useLocation();
  const [view, setView] = useState('chat'); // 'chat', 'exercise', 'library'
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityLibrary, setActivityLibrary] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch activity library
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/wellness/activities'),
          axios.get('http://localhost:5000/api/wellness/categories'),
        ]);

        setActivityLibrary(activitiesRes.data.activities || []);
        setCategories(categoriesRes.data.categories || {});
      } catch (error) {
        console.error('Error fetching wellness data:', error);
      }
    };

    fetchData();
  }, []);

  // Handle initial mood from navigation state
  useEffect(() => {
    if (location.state?.initialMood) {
      // Could pre-fill chat with mood message
      console.log('Initial mood:', location.state.initialMood);
    }
  }, [location.state]);

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity);
    setView('exercise');
  };

  const handleExerciseComplete = () => {
    // Show completion message
    alert('Great job completing the exercise! 🎉');
    setView('chat');
    setSelectedActivity(null);
  };

  const handleBackToChat = () => {
    setView('chat');
    setSelectedActivity(null);
  };

  const filteredActivities =
    selectedCategory === 'all'
      ? activityLibrary
      : activityLibrary.filter((a) => a.category === selectedCategory);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
            Wellness Companion
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Your AI-powered mental health and wellness support system
          </p>
        </motion.div>

        {/* View Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <button
            onClick={() => setView('chat')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              view === 'chat'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow'
                : 'bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setView('library')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              view === 'library'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-glow'
                : 'bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            📚 Activity Library
          </button>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {view === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <WellnessChat onActivitySelect={handleActivitySelect} />
            </motion.div>
          )}

          {view === 'exercise' && selectedActivity && (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <GuidedExercise
                activity={selectedActivity}
                onComplete={handleExerciseComplete}
                onBack={handleBackToChat}
              />
            </motion.div>
          )}

          {view === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-2 justify-center">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  All Activities ({activityLibrary.length})
                </button>
                {Object.entries(categories).map(([key, cat]) => {
                  const count = activityLibrary.filter((a) => a.category === key).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === key
                          ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                          : 'bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {cat.icon} {cat.name} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Activity Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-5 hover:bg-white/[0.05] transition-all cursor-pointer group"
                    onClick={() => handleActivitySelect(activity)}
                    whileHover={{ y: -5 }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{activity.emoji}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60 capitalize">
                        {activity.difficulty}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="font-semibold text-white mb-2 group-hover:text-primary-300 transition-colors">
                      {activity.name}
                    </h3>
                    <p className="text-sm text-white/60 mb-3 line-clamp-2">
                      {activity.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
                      <span>⏱️ {Math.ceil(activity.duration / 60)} min</span>
                      <span>
                        📂 {categories[activity.category]?.icon}{' '}
                        {categories[activity.category]?.name}
                      </span>
                    </div>

                    {/* Benefits */}
                    {activity.benefits && activity.benefits.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-white/40">Benefits:</p>
                        <div className="flex flex-wrap gap-1">
                          {activity.benefits.slice(0, 2).map((benefit, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20"
                            >
                              {benefit}
                            </span>
                          ))}
                          {activity.benefits.length > 2 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                              +{activity.benefits.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action */}
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-primary-400 font-medium">Start Activity</span>
                        <svg
                          className="w-5 h-5 text-primary-400 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredActivities.length === 0 && (
                <div className="glass-card p-12 text-center">
                  <p className="text-white/50">No activities found in this category.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid md:grid-cols-3 gap-4"
        >
          <div className="glass-card p-5 text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold text-white mb-1">Private & Secure</h3>
            <p className="text-sm text-white/50">
              Your conversations stay on your device. We never store sensitive data.
            </p>
          </div>
          <div className="glass-card p-5 text-center">
            <div className="text-3xl mb-2">🧠</div>
            <h3 className="font-semibold text-white mb-1">AI-Powered</h3>
            <p className="text-sm text-white/50">
              Advanced emotion detection to understand what you need right now.
            </p>
          </div>
          <div className="glass-card p-5 text-center">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="font-semibold text-white mb-1">Evidence-Based</h3>
            <p className="text-sm text-white/50">
              All activities backed by research and proven to improve wellbeing.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
