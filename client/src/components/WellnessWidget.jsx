import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Quick mood check buttons
const moodOptions = [
  { emoji: '😊', label: 'Great', value: 'joy' },
  { emoji: '😌', label: 'Okay', value: 'neutral' },
  { emoji: '😟', label: 'Stressed', value: 'stress' },
  { emoji: '😰', label: 'Anxious', value: 'anxiety' },
  { emoji: '😴', label: 'Tired', value: 'fatigue' },
];

export default function WellnessWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const navigate = useNavigate();

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    // Navigate to full wellness page with mood pre-selected
    setTimeout(() => {
      navigate('/wellness', { state: { initialMood: mood.label } });
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-primary-500 flex items-center justify-center text-xl">
            🧠
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold text-white">Wellness Check-In</h3>
            <p className="text-sm text-white/50">How are you feeling today?</p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-5 space-y-4">
              {/* Mood Selector */}
              <div>
                <p className="text-sm text-white/60 mb-3">Quick mood check:</p>
                <div className="grid grid-cols-5 gap-2">
                  {moodOptions.map((mood) => (
                    <motion.button
                      key={mood.value}
                      onClick={() => handleMoodSelect(mood)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                        selectedMood?.value === mood.value
                          ? 'bg-primary-500/20 border-2 border-primary-500/40'
                          : 'bg-white/[0.03] border border-white/10 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className="text-xs text-white/70">{mood.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                  <p className="text-lg font-bold text-primary-400">3</p>
                  <p className="text-xs text-white/40">Check-ins</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                  <p className="text-lg font-bold text-accent-400">5</p>
                  <p className="text-xs text-white/40">Activities</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                  <p className="text-lg font-bold text-green-400">2d</p>
                  <p className="text-xs text-white/40">Streak</p>
                </div>
              </div>

              {/* CTA */}
              <motion.button
                onClick={() => navigate('/wellness')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-primary-500 text-white font-medium flex items-center justify-center gap-2"
              >
                <span>Open Wellness Companion</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
