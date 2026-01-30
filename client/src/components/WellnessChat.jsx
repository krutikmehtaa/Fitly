import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Message bubble component
const MessageBubble = ({ message, isUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary-500/20 border border-primary-500/30 text-white'
            : 'bg-white/[0.05] border border-white/10 text-white/90'
        }`}
      >
        {!isUser && message.emotion && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
            <span className="text-xs text-white/40">Detected emotion:</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 capitalize">
              {message.emotion}
            </span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
        {message.timestamp && (
          <p className="text-xs text-white/30 mt-1">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// Activity suggestion card
const ActivityCard = ({ activity, onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 hover:border-primary-500/30 transition-all cursor-pointer group"
      onClick={() => onStart(activity)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{activity.emoji}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white mb-1 group-hover:text-primary-300 transition-colors">
            {activity.name}
          </h4>
          <p className="text-sm text-white/60 mb-2">{activity.description}</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white/40">
              ⏱️ {Math.ceil(activity.duration / 60)} min
            </span>
            <span className="text-white/40 capitalize">
              📊 {activity.difficulty}
            </span>
          </div>
        </div>
        <div className="text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

// Main Chat Component
export default function WellnessChat({ onActivitySelect, compact = false }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your wellness companion. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedActivities, setSuggestedActivities] = useState([]);
  const [activityDetails, setActivityDetails] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestedActivities]);

  // Fetch activity details
  useEffect(() => {
    const fetchActivityDetails = async () => {
      if (suggestedActivities.length === 0) return;

      const details = {};
      for (const activity of suggestedActivities) {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/wellness/activities/${activity.id}`
          );
          details[activity.id] = response.data.activity;
        } catch (err) {
          console.error(`Error fetching activity ${activity.id}:`, err);
        }
      }
      setActivityDetails(details);
    };

    fetchActivityDetails();
  }, [suggestedActivities]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setSuggestedActivities([]);

    try {
      const response = await axios.post('http://localhost:5000/api/wellness/analyze', {
        message: input,
      });

      const { message: aiResponse, emotion, confidence, activities } = response.data;

      // Add AI response
      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          text: aiResponse,
          isUser: false,
          emotion: emotion,
          confidence: confidence,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setSuggestedActivities(activities || []);
        setIsTyping(false);
      }, 1000); // Simulate thinking time
    } catch (error) {
      console.error('Error analyzing message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. But I'm here for you - try telling me more about how you're feeling.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleActivityStart = (activity) => {
    const fullActivity = activityDetails[activity.id] || activity;
    if (onActivitySelect) {
      onActivitySelect(fullActivity);
    }
  };

  // Quick response suggestions
  const quickResponses = [
    'I feel stressed 😟',
    'Feeling unmotivated today',
    'I\'m anxious 😰',
    'Really tired 😴',
    'I\'m feeling great! 😊',
  ];

  return (
    <div className={`flex flex-col ${compact ? 'h-96' : 'h-[600px]'} glass-card overflow-hidden`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-primary-500/10 to-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-xl">
            🧠
          </div>
          <div>
            <h3 className="font-semibold text-white">Wellness Companion</h3>
            <p className="text-xs text-white/50">Here to support your mental wellness</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isUser={msg.isUser} />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-white/40 text-sm"
          >
            <div className="flex gap-1">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                className="w-2 h-2 rounded-full bg-primary-400"
              />
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-primary-400"
              />
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-primary-400"
              />
            </div>
            <span>Analyzing...</span>
          </motion.div>
        )}

        {/* Suggested Activities */}
        {suggestedActivities.length > 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-sm text-white/50 font-medium">💡 Recommended for you:</p>
            {suggestedActivities.map((activity) => {
              const details = activityDetails[activity.id];
              return details ? (
                <ActivityCard
                  key={activity.id}
                  activity={details}
                  onStart={handleActivityStart}
                />
              ) : (
                <div key={activity.id} className="h-24 rounded-xl bg-white/[0.02] animate-pulse" />
              );
            })}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Responses */}
      {messages.length === 1 && (
        <div className="px-5 pb-3">
          <p className="text-xs text-white/40 mb-2">Quick responses:</p>
          <div className="flex flex-wrap gap-2">
            {quickResponses.map((response, idx) => (
              <button
                key={idx}
                onClick={() => setInput(response)}
                className="px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-all"
              >
                {response}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-5 py-4 border-t border-white/10 bg-white/[0.02]">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share how you're feeling..."
            rows={1}
            className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 focus:bg-white/[0.08] focus:border-primary-500/40 focus:outline-none transition-all text-sm resize-none"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
