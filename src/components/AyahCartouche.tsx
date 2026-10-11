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
  size?: 'sm' | 'md' | 'lg' | 'inline';
  scale?: number;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  ariaLabel?: string;
}

export const AyahCartouche: React.FC<AyahCartoucheProps> = ({
  number,
  active = false,
  className = '',
  size = 'md',
  scale = 1,
  onClick,
  title,
  ariaLabel,
}) => {
  const numStr = String(number || '');
  const len = numStr.length;

  // Significantly larger, high-legibility font sizing based on character count
  const fontSize =
    len <= 1
      ? 34
      : len === 2
      ? 30
      : len === 3
      ? 25
      : len <= 5
      ? 20
      : 16;

  // Dimensions based on size prop; 'inline' uses em units so it scales dynamically when user increases Arabic font size!
  const sizeClasses =
    size === 'inline'
      ? 'w-[2.15em] h-[1.68em]'
      : size === 'sm'
      ? 'w-12 h-9.5'
      : size === 'lg'
      ? 'w-16 h-12.5'
      : 'w-14 h-11';

  const customStyle =
    scale !== 1 && size !== 'inline'
      ? { transform: `scale(${scale})`, transformOrigin: 'center' }
      : undefined;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onClick(e as unknown as React.MouseEvent);
    }
  };

  return (
    <span
      style={customStyle}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick(e);
            }
          : undefined
      }
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={title}
      aria-label={ariaLabel || (onClick ? `Read verse ${numStr}` : undefined)}
      aria-hidden={onClick ? undefined : 'true'}
      className={`inline-flex items-center justify-center shrink-0 transition-transform ${
        onClick
          ? 'cursor-pointer hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] rounded-full'
          : ''
      } ${sizeClasses} ${className}`}
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
            rx="35"
            ry="22"
            className="fill-white/15 dark:fill-emerald-400/20"
          />
        )}

        {/* Main Cartouche Outer Oval Body */}
        <path
          d="M 47,16 C 38,16 17,16 10,31 C 5,40 5,44 10,53 C 17,68 38,68 47,68 M 53,16 C 62,16 83,16 90,31 C 95,40 95,44 90,53 C 83,68 62,68 53,68"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner subtle decorative border line */}
        <path
          d="M 47,20 C 39,20 20,20 14,33 C 10,40 10,44 14,51 C 20,64 39,64 47,64 M 53,20 C 61,20 80,20 86,33 C 90,40 90,44 86,51 C 80,64 61,64 53,64"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.4"
          strokeLinecap="round"
        />

        {/* Top Ornament Crest */}
        {/* Central pointed flame petal */}
        <path
          d="M 50,3 C 46,9 46,13 50,17 C 54,13 54,9 50,3 Z"
          fill="currentColor"
        />
        {/* Left top scrolling tendril */}
        <path
          d="M 47,16 C 40,10 32,11 35,17 C 37,20 43,19 46,16"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Right top scrolling tendril */}
        <path
          d="M 53,16 C 60,10 68,11 65,17 C 63,20 57,19 54,16"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Floating pearls / dots at top shoulders */}
        <circle cx="33" cy="9" r="2.4" fill="currentColor" />
        <circle cx="67" cy="9" r="2.4" fill="currentColor" />

        {/* Bottom Ornament Crest (Mirrored) */}
        {/* Central downward pointed flame petal */}
        <path
          d="M 50,81 C 46,75 46,71 50,67 C 54,71 54,75 50,81 Z"
          fill="currentColor"
        />
        {/* Left bottom scrolling tendril */}
        <path
          d="M 47,68 C 40,74 32,73 35,67 C 37,64 43,65 46,68"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Right bottom scrolling tendril */}
        <path
          d="M 53,68 C 60,74 68,73 65,67 C 63,64 57,65 54,68"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Floating pearls / dots at bottom shoulders */}
        <circle cx="33" cy="75" r="2.4" fill="currentColor" />
        <circle cx="67" cy="75" r="2.4" fill="currentColor" />

        {/* Ayah Number Inside Cartouche */}
        <text
          x="50"
          y="42.5"
          dominantBaseline="central"
          textAnchor="middle"
          fill="currentColor"
          fontSize={fontSize}
          fontWeight="800"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="-0.5px"
        >
          {numStr}
        </text>
      </svg>
    </span>
  );
};
