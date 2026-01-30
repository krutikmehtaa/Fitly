import React from "react";
import { motion } from "framer-motion";

/**
 * Minimalistic Fitly Logo
 * Design concept: A droplet shape representing health/vitality with a pulse/heartbeat
 * Symbolizes: 
 * - Droplet: Water, health, life essence
 * - Pulse line: Heart rate, fitness, activity
 * - Rising shape: Growth, progress, improvement
 */

export default function Logo({ size = "md", showText = true, animated = false }) {
  const sizes = {
    sm: { icon: "w-7 h-7", text: "text-base", viewBox: "20 20" },
    md: { icon: "w-9 h-9", text: "text-xl", viewBox: "20 20" },
    lg: { icon: "w-12 h-12", text: "text-2xl", viewBox: "20 20" },
    xl: { icon: "w-16 h-16", text: "text-3xl", viewBox: "20 20" },
  };

  const s = sizes[size] || sizes.md;

  const IconWrapper = animated ? motion.div : "div";
  const iconProps = animated ? {
    whileHover: { scale: 1.08, rotate: -5 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 300 }
  } : {};

  return (
    <div className="flex items-center gap-2.5">
      <IconWrapper
        {...iconProps}
        className={`${s.icon} relative rounded-xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 shadow-lg flex items-center justify-center`}
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-60 rounded-xl" />
        
        {/* Main icon - Droplet with pulse */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-3/5 h-3/5 relative z-10" 
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Water droplet shape representing health/vitality */}
          <path 
            d="M12 3C12 3 7 8.5 7 12.5C7 15.5 9 18 12 18C15 18 17 15.5 17 12.5C17 8.5 12 3 12 3Z"
            fill="white"
            fillOpacity="0.95"
          />
          
          {/* Heartbeat/pulse line inside droplet */}
          <path 
            d="M9 12.5H10L11 10L12.5 14L13.5 12H15"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-600"
          />
        </svg>
      </IconWrapper>
      
      {showText && (
        <span className={`font-display font-bold gradient-text ${s.text} tracking-tight`}>
          Fitly
        </span>
      )}
    </div>
  );
}

// Compact version for navbar (even more minimal)
export function LogoCompact({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 shadow-md flex items-center justify-center relative overflow-hidden">
        {/* Subtle top highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-50" />
        
        <svg 
          viewBox="0 0 24 24" 
          className="w-4 h-4 relative z-10" 
          fill="none"
        >
          <path 
            d="M12 3C12 3 7 8.5 7 12.5C7 15.5 9 18 12 18C15 18 17 15.5 17 12.5C17 8.5 12 3 12 3Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path 
            d="M9 12.5H10L11 10L12.5 14L13.5 12H15"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-600"
          />
        </svg>
      </div>
      <span className="text-lg font-display font-bold gradient-text tracking-tight hidden sm:inline">
        Fitly
      </span>
    </div>
  );
}

// Icon-only version for favicons/minimal spaces
export function LogoIcon({ className = "" }) {
  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 shadow-lg flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-60 rounded-xl" />
      <svg 
        viewBox="0 0 24 24" 
        className="w-6 h-6 relative z-10" 
        fill="none"
      >
        <path 
          d="M12 3C12 3 7 8.5 7 12.5C7 15.5 9 18 12 18C15 18 17 15.5 17 12.5C17 8.5 12 3 12 3Z"
          fill="white"
          fillOpacity="0.95"
        />
        <path 
          d="M9 12.5H10L11 10L12.5 14L13.5 12H15"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary-600"
        />
      </svg>
    </div>
  );
}
