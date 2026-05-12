import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  size?: number;
  mdSize?: number;
  glow?: boolean;
  className?: string;
}

export function Logo({ size = 48, mdSize, glow = true, className = "" }: LogoProps) {
  const finalMdSize = mdSize || size;
  
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ 
        width: 'var(--logo-size)', 
        height: 'var(--logo-size)',
        // Use CSS variables for responsive sizing if needed, or just standard responsive classes
      } as any}
    >
      <style>{`
        :root { --logo-size: ${size}px; }
        @media (min-width: 768px) { :root { --logo-size: ${finalMdSize}px; } }
      `}</style>
      {glow && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-cyan-glow/20 blur-xl rounded-full"
        />
      )}
      
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <defs>
          <radialGradient id="logo-glow-orange" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB547" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFB547" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="logo-glow-blue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0066FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
          </radialGradient>
          <filter id="luxury-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Deep tech blue shell */}
        <motion.path
          d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z"
          stroke="#0066FF"
          strokeWidth="0.5"
          strokeOpacity="0.3"
          fill="none"
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        {/* Premium Gold/Orange Outer Ring */}
        <motion.circle
          cx="50" cy="50" r="48"
          stroke="#FFB547"
          strokeWidth="0.5"
          strokeOpacity="0.4"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          strokeDasharray="1 15"
        />

        {/* Cyan Neural Pulse */}
        <motion.circle
          cx="50" cy="50" r="42"
          stroke="#5EE3FF"
          strokeWidth="0.2"
          strokeOpacity="0.2"
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Elegant Geometric Core */}
        <g filter="url(#luxury-glow)">
          {/* Cyan structure */}
          <motion.path
            d="M50 15 L80 32 L80 68 L50 85 L20 68 L20 32 Z"
            stroke="#5EE3FF"
            strokeWidth="0.4"
            strokeOpacity="0.5"
            fill="none"
          />
          
          {/* Gold structure */}
          <motion.path
            d="M50 25 L72 38 L72 62 L50 75 L28 62 L28 38 Z"
            stroke="#FFB547"
            strokeWidth="0.6"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          
          {/* Central Monogram 'G' or Emblem in White */}
          <motion.path
            d="M42 40 C42 35 58 35 58 40 L58 60 C58 65 42 65 42 60 M42 50 L58 50"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 2 }}
          />
        </g>

        {/* Sparkling Accents - Mixed Colors */}
        {[0, 90, 180, 270].map((angle, i) => (
          <motion.circle
            key={`accent-${angle}`}
            cx={50 + Math.cos(angle * Math.PI / 180) * 48}
            cy={50 + Math.sin(angle * Math.PI / 180) * 48}
            r="1.2"
            fill={i % 2 === 0 ? "#FFB547" : "#5EE3FF"}
            animate={{ 
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.8, 1]
            }}
            transition={{ 
              duration: 2 + i * 0.5, 
              repeat: Infinity, 
              delay: i * 0.3 
            }}
          />
        ))}

        {/* Blue Inner Glow */}
        <circle cx="50" cy="50" r="10" fill="url(#logo-glow-blue)" />
        {/* Central Core Orange Glow */}
        <circle cx="50" cy="50" r="5" fill="url(#logo-glow-orange)" />
      </svg>
    </div>
  );
}
