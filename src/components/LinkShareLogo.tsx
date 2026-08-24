import React from 'react';

interface LinkShareLogoProps {
  className?: string;
  size?: number;
}

export function LinkShareLogo({ className = 'h-10 w-10', size = 40 }: LinkShareLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      aria-label="LinkShare Logo"
    >
      {/* Green Chat Bubble Base */}
      <path
        d="M250 25C125.74 25 25 125.74 25 250c0 42.66 11.9 82.63 32.55 116.7L25 475l112.35-31.55C170.15 462.62 208.77 475 250 475c124.26 0 225-100.74 225-225S374.26 25 250 25z"
        fill="#00D22B"
      />
      {/* Outer White Circular Ring */}
      <circle
        cx="250"
        cy="250"
        r="140"
        stroke="#FFFFFF"
        strokeWidth="24"
        fill="none"
      />
      {/* Slanted White Chain Link in Center */}
      <g transform="translate(250, 250) rotate(-45) translate(-250, -250)">
        {/* Left Loop */}
        <path
          d="M210 205h-35c-24.85 0-45 20.15-45 45s20.15 45 45 45h35"
          stroke="#FFFFFF"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Right Loop */}
        <path
          d="M290 205h35c24.85 0 45 20.15 45 45s-20.15 45-45 45h-35"
          stroke="#FFFFFF"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Center Connection Bar */}
        <line
          x1="205"
          y1="250"
          x2="295"
          y2="250"
          stroke="#FFFFFF"
          strokeWidth="24"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export default LinkShareLogo;
