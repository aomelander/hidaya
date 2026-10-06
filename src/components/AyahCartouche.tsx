/**
 * @file src/components/AyahCartouche.tsx
 * @description Authentic ornate Quranic Ayah cartouche / rosette marker matching classical
 * calligraphy illumination (زخرفة رقم الآية). Displays the Ayah number cleanly centered within
 * symmetrical arabesque floral flourishes and pearls.
 */

import React from 'react';

interface AyahCartoucheProps {
  number: string | number;
  active?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AyahCartouche: React.FC<AyahCartoucheProps> = ({
  number,
  active = false,
  className = '',
  size = 'md',
}) => {
  const numStr = String(number || '');
  const len = numStr.length;

  // Responsive font sizing based on digit count (1, 2, 3 digits)
  const fontSize = len <= 1 ? 22 : len === 2 ? 19 : len === 3 ? 15 : 12;

  // Dimensions based on size prop
  const sizeClasses =
    size === 'sm'
      ? 'w-9 h-7'
      : size === 'lg'
      ? 'w-14 h-11'
      : 'w-11 h-8.5';

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 transition-transform ${sizeClasses} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-2xs"
      >
        {/* Subtle translucent backdrop fill when active */}
        {active && (
          <ellipse
            cx="50"
            cy="42"
            rx="32"
            ry="20"
            className="fill-white/15 dark:fill-emerald-400/20"
          />
        )}

        {/* Main Cartouche Outer Oval Body */}
        <path
          d="M 47,18 C 39,18 20,18 13,32 C 8,40 8,44 13,52 C 20,66 39,66 47,66 M 53,18 C 61,18 80,18 87,32 C 92,40 92,44 87,52 C 80,66 61,66 53,66"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner subtle decorative border line */}
        <path
          d="M 47,22 C 40,22 23,22 17,34 C 13,40 13,44 17,50 C 23,62 40,62 47,62 M 53,22 C 60,22 77,22 83,34 C 87,40 87,44 83,50 C 77,62 60,62 53,62"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.4"
          strokeLinecap="round"
        />

        {/* Top Ornament Crest */}
        {/* Central pointed flame petal */}
        <path
          d="M 50,5 C 46,11 46,15 50,19 C 54,15 54,11 50,5 Z"
          fill="currentColor"
        />
        {/* Left top scrolling tendril */}
        <path
          d="M 47,18 C 40,12 32,13 35,19 C 37,22 43,21 46,18"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Right top scrolling tendril */}
        <path
          d="M 53,18 C 60,12 68,13 65,19 C 63,22 57,21 54,18"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Floating pearls / dots at top shoulders */}
        <circle cx="33" cy="11" r="2.4" fill="currentColor" />
        <circle cx="67" cy="11" r="2.4" fill="currentColor" />

        {/* Bottom Ornament Crest (Mirrored) */}
        {/* Central downward pointed flame petal */}
        <path
          d="M 50,79 C 46,73 46,69 50,65 C 54,69 54,73 50,79 Z"
          fill="currentColor"
        />
        {/* Left bottom scrolling tendril */}
        <path
          d="M 47,66 C 40,72 32,71 35,65 C 37,62 43,63 46,66"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Right bottom scrolling tendril */}
        <path
          d="M 53,66 C 60,72 68,71 65,65 C 63,62 57,63 54,66"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Floating pearls / dots at bottom shoulders */}
        <circle cx="33" cy="73" r="2.4" fill="currentColor" />
        <circle cx="67" cy="73" r="2.4" fill="currentColor" />

        {/* Ayah Number Inside Cartouche */}
        <text
          x="50"
          y="42"
          dominantBaseline="central"
          textAnchor="middle"
          fill="currentColor"
          fontSize={fontSize}
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="-0.5px"
        >
          {numStr}
        </text>
      </svg>
    </div>
  );
};
