import React from 'react';

const HeroImage = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Main Container */}
      <div className="relative w-64 h-64 md:w-[400px] md:h-[400px] rounded-2xl shadow-lg border-4 border-[#00CC00] bg-gradient-to-br from-white to-gray-50 overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" viewBox="0 0 400 400">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00CC00" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Animated Hands */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="80%" height="80%" viewBox="0 0 300 300" className="animate-pulse">
            {/* Left Hand - "Hello" Sign */}
            <g transform="translate(50, 80)">
              {/* Hand Base */}
              <ellipse cx="60" cy="120" rx="25" ry="35" fill="#FFE4B5" stroke="#D4A574" strokeWidth="2"/>
              
              {/* Fingers */}
              <g className="animate-bounce" style={{ animationDelay: '0.5s' }}>
                {/* Thumb */}
                <ellipse cx="35" cy="100" rx="8" ry="20" fill="#FFE4B5" stroke="#D4A574" strokeWidth="2" transform="rotate(-15 35 100)"/>
                
                {/* Index Finger */}
                <ellipse cx="60" cy="85" rx="6" ry="25" fill="#FFE4B5" stroke="#D4A574" strokeWidth="2"/>
                
                {/* Middle Finger */}
                <ellipse cx="75" cy="80" rx="6" ry="28" fill="#FFE4B5" stroke="#D4A574" strokeWidth="2"/>
                
                {/* Ring Finger */}
                <ellipse cx="90" cy="85" rx="6" ry="25" fill="#FFE4B5" stroke="#D4A574" strokeWidth="2"/>
                
                {/* Pinky */}
                <ellipse cx="105" cy="90" rx="5" ry="22" fill="#FFE4B5" stroke="#D4A574" strokeWidth="2"/>
              </g>
            </g>

            {/* Right Hand - "Thank You" Sign */}
            <g transform="translate(180, 100)">
              {/* Hand Base */}
              <ellipse cx="60" cy="120" rx="25" ry="35" fill="#FFE4B5" stroke="#D4A574" strokeWidth="2"/>
              
              {/* Fingers */}
              <g className="animate-bounce" style={{ animationDelay: '1s' }}>
                {/* Thumb */}
                <ellipse cx="85" cy="100" rx="8" ry="20" fill="#FFE4B5" stroke="#D4A574" strokeWidth="2" transform="rotate(15 85 100)"/>
                
                {/* Index Finger */}
                <ellipse cx="60" cy="85" rx="6" ry="25" fill="#FFE4B5" stroke="#D4A574" strokeWidth="2"/>
                
                {/* Middle Finger */}
                <ellipse cx="45" cy="80" rx="6" ry="28" fill="#FFE4B5" stroke="#D4A574" strokeWidth="2"/>
                
                {/* Ring Finger */}
                <ellipse cx="30" cy="85" rx="6" ry="25" fill="#FFE4B5" stroke="#D4A574" strokeWidth="2"/>
                
                {/* Pinky */}
                <ellipse cx="15" cy="90" rx="5" ry="22" fill="#FFE4B5" stroke="#D4A574" strokeWidth="2"/>
              </g>
            </g>

            {/* Connection Lines */}
            <g className="animate-pulse" style={{ animationDelay: '1.5s' }}>
              <line x1="150" y1="150" x2="200" y2="150" stroke="#00CC00" strokeWidth="3" strokeDasharray="5,5"/>
              <circle cx="150" cy="150" r="3" fill="#00CC00"/>
              <circle cx="200" cy="150" r="3" fill="#00CC00"/>
            </g>

            {/* Floating Elements */}
            <g className="animate-float">
              {/* Learning Icons */}
              <g transform="translate(20, 20)">
                <circle cx="15" cy="15" r="8" fill="#00CC00" opacity="0.8"/>
                <text x="15" y="20" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">A</text>
              </g>
              
              <g transform="translate(250, 30)">
                <circle cx="15" cy="15" r="8" fill="#4285F4" opacity="0.8"/>
                <text x="15" y="20" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">B</text>
              </g>
              
              <g transform="translate(280, 200)">
                <circle cx="15" cy="15" r="8" fill="#FFC107" opacity="0.8"/>
                <text x="15" y="20" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">C</text>
              </g>
              
              <g transform="translate(10, 250)">
                <circle cx="15" cy="15" r="8" fill="#FF6B6B" opacity="0.8"/>
                <text x="15" y="20" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">D</text>
              </g>
            </g>
          </svg>
        </div>

        {/* Overlay Text */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-sm font-semibold text-[#00CC00]">Learn • Connect • Grow</p>
          </div>
        </div>

        {/* Animated Border Glow */}
        <div className="absolute inset-0 rounded-2xl border-4 border-transparent bg-gradient-to-r from-[#00CC00]/20 via-transparent to-[#00CC00]/20 animate-pulse"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 w-2 h-2 bg-[#00CC00] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-8 right-8 w-2 h-2 bg-[#4285F4] rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-8 left-8 w-2 h-2 bg-[#FFC107] rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-4 right-4 w-2 h-2 bg-[#FF6B6B] rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
};

export default HeroImage; 