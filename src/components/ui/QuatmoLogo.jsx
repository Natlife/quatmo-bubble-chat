import React from "react";

export function QuatmoLogo({ className = "w-8 h-8", size = 100 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <radialGradient id="quatMoGrad" cx="50%" cy="75%" r="70%" fx="50%" fy="75%">
          <stop offset="0%" stopColor="#FFCC80" />
          <stop offset="35%" stopColor="#FF9800" />
          <stop offset="100%" stopColor="#E65100" />
        </radialGradient>
        <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.15" />
        </filter>
      </defs>

      <g filter="url(#dropShadow)">
        {/* 1. Handle (Cán quạt) */}
        <rect x="47.5" y="78" width="5" height="14" rx="2" fill="#8D6E63" stroke="#5D4037" strokeWidth="0.75" />
        
        {/* 2. Fan Paper / Leaf (Lá quạt) */}
        <path d="M 50 75 L 1.5 47 A 56 56 0 0 1 98.5 47 Z" fill="url(#quatMoGrad)" stroke="#BF360C" strokeWidth="1.5" strokeLinejoin="round" />
        
        {/* 3. Spokes (Nan quạt) & Folds (Nếp gấp) */}
        <line x1="50" y1="75" x2="10.4" y2="35.4" stroke="#BF360C" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="75" x2="32.7" y2="21.8" stroke="#BF360C" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="75" x2="50" y2="19" stroke="#BF360C" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="75" x2="67.3" y2="21.8" stroke="#BF360C" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="75" x2="89.6" y2="35.4" stroke="#BF360C" strokeWidth="2" strokeLinecap="round" />
        
        {/* White Highlight lines for 3D folded effect */}
        <line x1="50" y1="75" x2="11.4" y2="34.4" stroke="#FFE0B2" strokeWidth="1.25" opacity="0.8" strokeLinecap="round" />
        <line x1="50" y1="75" x2="33.7" y2="20.8" stroke="#FFE0B2" strokeWidth="1.25" opacity="0.8" strokeLinecap="round" />
        <line x1="50" y1="75" x2="51" y2="19" stroke="#FFE0B2" strokeWidth="1.25" opacity="0.8" strokeLinecap="round" />
        <line x1="50" y1="75" x2="68.3" y2="20.8" stroke="#FFE0B2" strokeWidth="1.25" opacity="0.8" strokeLinecap="round" />
        <line x1="50" y1="75" x2="90.6" y2="34.4" stroke="#FFE0B2" strokeWidth="1.25" opacity="0.8" strokeLinecap="round" />
        
        {/* 4. Base Node (Khớp quạt) */}
        <circle cx="50" cy="75" r="5" fill="#BF360C" stroke="#8D6E63" strokeWidth="1" />
        <circle cx="50" cy="75" r="2" fill="#FFE0B2" />
      </g>
    </svg>
  );
}
