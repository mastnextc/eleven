import React from 'react';

const Logo = ({ className = "h-12 w-auto", dark = false }) => {
  const primaryColor = dark ? "#ffffff" : "#000000";
  const accentColor = "#737373"; // Minimal Gray theme accent

  return (
    <div className={`flex items-center space-x-3 select-none`}>
      {/* "11" Graphic Icon */}
      <svg
        viewBox="0 0 100 120"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2550/svg"
      >
        {/* Left Stylized '1' */}
        <path
          d="M37 20 H50 V75 L40 85 V30 L30 30 Z"
          fill={primaryColor}
        />
        <path
          d="M40 89 L50 79 V98 L40 108 Z"
          fill={primaryColor}
        />
        
        {/* Right Stylized '1' */}
        <path
          d="M57 20 H70 V75 L60 85 V30 L50 30 Z"
          fill={accentColor}
        />
        <path
          d="M60 89 L70 79 V98 L60 108 Z"
          fill={accentColor}
        />
      </svg>

      {/* Brand Text & Slogan */}
      <div className="flex flex-col justify-center">
        <span
          className="text-base sm:text-xl font-bold tracking-[0.2em] sm:tracking-[0.25em] leading-none font-sans"
          style={{ color: primaryColor }}
        >
          ELEVEN
        </span>
        <span
          className="text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.18em] uppercase font-medium mt-1 leading-none text-stone-400"
        >
          It Suits You
        </span>
      </div>
    </div>
  );
};

export default Logo;
