import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Breathing Exercise Player
export function BreathingExercise({ activity, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cycleCount, setcycleCount] = useState(0);
  const intervalRef = useRef(null);

  const instructions = activity.instructions || [];
  const currentInstruction = instructions[currentStep] || {};

  useEffect(() => {
    if (isActive && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            // Move to next step
            if (currentStep < instructions.length - 1) {
              setCurrentStep((s) => s + 1);
              return instructions[currentStep + 1]?.duration || 0;
            } else {
              // Cycle complete
              setcycleCount((c) => c + 1);
              setCurrentStep(0);
              return instructions[0]?.duration || 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timer, currentStep, instructions]);

  const handleStart = () => {
    setIsActive(true);
    setTimer(instructions[0]?.duration || 4);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentStep(0);
    setTimer(0);
    setcycleCount(0);
  };

  const handleFinish = () => {
    setIsActive(false);
    if (onComplete) onComplete();
  };

  // Visual breathing guide
  const getBreathingScale = () => {
    const action = currentInstruction.action;
    if (action === 'inhale') return 1.3;
    if (action === 'exhale') return 0.7;
    return 1;
  };

  const getBreathingColor = () => {
    const action = currentInstruction.action;
    if (action === 'inhale') return 'from-primary-400 to-primary-600';
    if (action === 'exhale') return 'from-accent-400 to-accent-600';
    return 'from-purple-400 to-purple-600';
  };

  return (
    <div className="glass-card p-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-display font-bold gradient-text mb-2">
          {activity.name}
        </h3>
        <p className="text-white/60">{activity.description}</p>
      </div>

      {/* Visual Guide */}
      <div className="flex items-center justify-center py-8">
        <motion.div
          animate={{
            scale: isActive ? getBreathingScale() : 1,
          }}
          transition={{
            duration: currentInstruction.duration || 4,
            ease: 'easeInOut',
          }}
          className={`w-48 h-48 rounded-full bg-gradient-to-br ${getBreathingColor()} shadow-glow flex items-center justify-center`}
        >
          <div className="text-center">
            <p className="text-6xl font-bold text-white mb-2">
              {timer > 0 ? timer : ''}
            </p>
            {!isActive && timer === 0 && (
              <p className="text-white/80 text-sm">Ready?</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Instruction */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-xl text-white font-medium mb-1">
          {currentInstruction.text || 'Breathe naturally'}
        </p>
        <p className="text-sm text-white/50">
          Cycle {cycleCount} completed
        </p>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isActive ? (
          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 4l10 6-10 6V4z" />
            </svg>
            <span>{timer === 0 ? 'Start' : 'Resume'}</span>
          </motion.button>
        ) : (
          <motion.button
            onClick={handlePause}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 4h3v12H6V4zm5 0h3v12h-3V4z" />
            </svg>
            <span>Pause</span>
          </motion.button>
        )}

        <motion.button
          onClick={handleReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium"
        >
          Reset
        </motion.button>

        {cycleCount >= 3 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleFinish}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 font-medium"
          >
            ✓ Complete
          </motion.button>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/40">
          <span>Progress</span>
          <span>{Math.min(cycleCount, 10)} / 10 cycles recommended</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((cycleCount / 10) * 100, 100)}%` }}
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
          />
        </div>
      </div>
    </div>
  );
}

// Meditation Player
export function MeditationPlayer({ activity, onComplete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const intervalRef = useRef(null);

  const script = activity.script || [];
  const currentScript = script[currentScriptIndex] || {};
  const duration = activity.duration;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1;

          // Check if we should move to next script item
          const nextScriptItem = script.find((s) => s.time > prev && s.time <= newTime);
          if (nextScriptItem) {
            const newIndex = script.indexOf(nextScriptItem);
            setCurrentScriptIndex(newIndex);
          }

          // Check if complete
          if (newTime >= duration) {
            setIsPlaying(false);
            if (onComplete) onComplete();
            return duration;
          }

          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, duration, script, onComplete]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentScriptIndex(0);
  };

  const progress = (currentTime / duration) * 100;

  return (
    <div className="glass-card p-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-display font-bold gradient-text mb-2">
          {activity.name}
        </h3>
        <p className="text-white/60">{activity.description}</p>
      </div>

      {/* Visual */}
      <div className="flex items-center justify-center py-8">
        <motion.div
          animate={{
            scale: isPlaying ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 4,
            repeat: isPlaying ? Infinity : 0,
            ease: 'easeInOut',
          }}
          className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-500/20 to-primary-500/20 border border-white/10 flex items-center justify-center relative overflow-hidden"
        >
          {/* Pulsing background */}
          {isPlaying && (
            <motion.div
              animate={{
                scale: [1, 2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inset-0 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full"
            />
          )}

          <div className="text-center z-10">
            <p className="text-5xl mb-2">🧘</p>
            <p className="text-white/80 text-sm">
              {Math.floor(currentTime / 60)}:{String(currentTime % 60).padStart(2, '0')} /{' '}
              {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Current Instruction */}
      <motion.div
        key={currentScriptIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[80px] flex items-center justify-center"
      >
        <p className="text-lg text-white/90 text-center max-w-md">
          {currentScript.text || 'Take a moment to settle in...'}
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-primary-500"
          />
        </div>
        <div className="flex justify-between text-xs text-white/40">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <motion.button
          onClick={handlePlayPause}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium flex items-center gap-2"
        >
          {isPlaying ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 4h3v12H6V4zm5 0h3v12h-3V4z" />
              </svg>
              <span>Pause</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 4l10 6-10 6V4z" />
              </svg>
              <span>{currentTime === 0 ? 'Start' : 'Resume'}</span>
            </>
          )}
        </motion.button>

        <motion.button
          onClick={handleRestart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium"
        >
          Restart
        </motion.button>
      </div>

      {/* Benefits */}
      {activity.benefits && (
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Benefits</p>
          <div className="flex flex-wrap gap-2">
            {activity.benefits.map((benefit, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/60"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Grounding Exercise
export function GroundingExercise({ activity, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');

  const instructions = activity.instructions || [];
  const currentInstruction = instructions[currentStep] || {};
  const isLastStep = currentStep === instructions.length - 1;

  const handleNext = () => {
    if (currentResponse.trim()) {
      setResponses([...responses, currentResponse]);
      setCurrentResponse('');
    }

    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (onComplete) onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (responses.length > 0) {
        setCurrentResponse(responses[responses.length - 1]);
        setResponses(responses.slice(0, -1));
      }
    }
  };

  return (
    <div className="glass-card p-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-display font-bold gradient-text mb-2">
          {activity.name}
        </h3>
        <p className="text-white/60">{activity.description}</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {instructions.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all ${
              idx === currentStep
                ? 'w-8 bg-primary-500'
                : idx < currentStep
                ? 'w-2 bg-primary-500/50'
                : 'w-2 bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Current Step */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <div className="text-center py-8">
          <p className="text-3xl mb-4">{activity.emoji || '🌍'}</p>
          <h4 className="text-xl font-semibold text-white mb-2">
            Step {currentStep + 1} of {instructions.length}
          </h4>
          <p className="text-lg text-white/90">{currentInstruction.text}</p>
          {currentInstruction.prompt && (
            <p className="text-sm text-white/50 mt-2">{currentInstruction.prompt}</p>
          )}
        </div>

        {currentInstruction.prompt && !isLastStep && (
          <textarea
            value={currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            placeholder="Type here... (optional)"
            className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 focus:bg-white/[0.08] focus:border-primary-500/40 focus:outline-none transition-all resize-none"
            rows={3}
          />
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <motion.button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ← Previous
        </motion.button>

        <span className="text-white/40 text-sm">
          {currentStep + 1} / {instructions.length}
        </span>

        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium"
        >
          {isLastStep ? 'Complete ✓' : 'Next →'}
        </motion.button>
      </div>

      {/* Review */}
      {responses.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-white/40 mb-2">Your responses:</p>
          <div className="space-y-1">
            {responses.map((resp, idx) => (
              <p key={idx} className="text-sm text-white/60">
                • {resp}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main Guided Exercise Component (router)
export default function GuidedExercise({ activity, onComplete, onBack }) {
  const renderExercise = () => {
    if (!activity) return null;

    switch (activity.category) {
      case 'breathing':
        return <BreathingExercise activity={activity} onComplete={onComplete} />;
      case 'meditation':
        return <MeditationPlayer activity={activity} onComplete={onComplete} />;
      case 'grounding':
        return <GroundingExercise activity={activity} onComplete={onComplete} />;
      default:
        return (
          <div className="glass-card p-8 text-center">
            <p className="text-white/60">Exercise player for "{activity.category}" coming soon!</p>
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 rounded-xl bg-primary-500/20 text-primary-400 border border-primary-500/30"
            >
              Go Back
            </button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {onBack && (
        <motion.button
          onClick={onBack}
          whileHover={{ x: -5 }}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to chat</span>
        </motion.button>
      )}
      {renderExercise()}
    </div>
  );
}
