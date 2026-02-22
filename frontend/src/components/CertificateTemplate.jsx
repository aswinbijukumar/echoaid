
import React, { forwardRef } from 'react';
import { TrophyIcon, StarIcon } from '@heroicons/react/24/solid';

const CertificateTemplate = forwardRef(({ recipientName, courseName, date, id, badgeColor = "gold" }, ref) => {
  return (
    <div ref={ref} className="w-[1123px] h-[794px] bg-white text-black relative flex flex-col items-center justify-between p-16 shadow-2xl mx-auto overflow-hidden">

      {/* 1. Sophisticated Border System */}
      <div className="absolute inset-4 border-4 border-double border-[#0f172a] z-20"></div>
      <div className="absolute inset-6 border border-[#94a3b8] z-20"></div>

      {/* 2. Abstract Geometric Background (CSS Only, No External Images) */}
      <div className="absolute inset-0 bg-[#f8fafc] z-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* 3. Corner Ornaments (SVG) */}
      <div className="absolute top-6 left-6 w-32 h-32 z-10 text-[#0f172a]">
        <svg viewBox="0 0 100 100" fill="currentColor"><path d="M0 0 L40 0 L0 40 Z" /></svg>
      </div>
      <div className="absolute top-6 right-6 w-32 h-32 z-10 text-[#0f172a] rotate-90">
        <svg viewBox="0 0 100 100" fill="currentColor"><path d="M0 0 L40 0 L0 40 Z" /></svg>
      </div>
      <div className="absolute bottom-6 left-6 w-32 h-32 z-10 text-[#0f172a] -rotate-90">
        <svg viewBox="0 0 100 100" fill="currentColor"><path d="M0 0 L40 0 L0 40 Z" /></svg>
      </div>
      <div className="absolute bottom-6 right-6 w-32 h-32 z-10 text-[#0f172a] rotate-180">
        <svg viewBox="0 0 100 100" fill="currentColor"><path d="M0 0 L40 0 L0 40 Z" /></svg>
      </div>

      {/* 4. Header Section */}
      <div className="z-30 text-center w-full mt-8">
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="h-[2px] w-20 bg-[#cca55f]"></div>
          <TrophyIcon className="w-14 h-14 text-[#cca55f]" />
          <div className="h-[2px] w-20 bg-[#cca55f]"></div>
        </div>

        <h1 className="text-6xl font-serif font-bold text-[#0f172a] tracking-widest uppercase mb-3">
          Certificate
        </h1>
        <h2 className="text-2xl font-light text-[#64748b] tracking-[0.5em] uppercase font-sans">
          of Completion
        </h2>
      </div>

      {/* 5. Main Recipient Content */}
      <div className="z-30 flex-1 flex flex-col justify-center items-center w-full max-w-5xl space-y-6">
        <p className="text-xl text-[#475569] font-serif italic text-center">
          This document certifies that
        </p>

        <div className="relative w-full text-center">
          <h3 className="text-7xl font-serif font-medium text-[#1e293b] capitalize px-12 py-2 inline-block relative">
            {recipientName || "Student Name"}
            {/* Underline Decoration */}
            <div className="absolute -bottom-2 left-1/4 right-1/4 h-[1px] bg-[#cca55f]"></div>
          </h3>
        </div>

        <p className="text-xl text-[#475569] font-serif italic text-center mt-4">
          has successfully completed the comprehensive curriculum for
        </p>

        <div className="bg-[#f1f5f9] px-12 py-4 rounded-full border border-[#e2e8f0] mt-2">
          <h4 className="text-3xl font-bold text-[#0f172a] uppercase tracking-wider text-center">
            {courseName}
          </h4>
        </div>
      </div>

      {/* 6. Footer & Signatures */}
      <div className="z-30 w-full grid grid-cols-3 gap-8 items-end mb-12 px-12">

        {/* Date Section */}
        <div className="text-center">
          <div className="mb-2 font-serif text-2xl text-[#334155]">{new Date(date).toLocaleDateString()}</div>
          <div className="h-[1px] w-40 bg-[#94a3b8] mx-auto mb-2"></div>
          <p className="text-xs text-[#64748b] uppercase tracking-widest font-bold">Date Issued</p>
        </div>

        {/* Central Seal (CSS Only) */}
        <div className="flex justify-center -mb-6">
          <div className="relative w-48 h-48">
            {/* Outer Starburst */}
            <div className="absolute inset-0 bg-[#cca55f] rounded-full flex items-center justify-center p-2 shadow-xl" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}>
              <div className="w-full h-full bg-[#b45309] rounded-full flex items-center justify-center border-4 border-[#fcd34d]">
                <div className="text-center text-white">
                  <StarIcon className="w-16 h-16 mx-auto text-[#fef3c7]" />
                  <span className="block text-xs font-bold uppercase tracking-widest mt-1">Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="text-center">
          {/* Signature Font Simulation */}
          <div className="font-serif text-4xl text-[#0f172a] mb-0 italic" style={{ fontFamily: '"Great Vibes", cursive' }}>
            EchoAid AI
          </div>
          <div className="h-[1px] w-40 bg-[#94a3b8] mx-auto mb-2"></div>
          <p className="text-xs text-[#64748b] uppercase tracking-widest font-bold">Program Director</p>
        </div>
      </div>

      {/* ID Footer */}
      <div className="absolute bottom-3 left-0 right-0 text-center z-30">
        <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
          ID: {id} • Verifiable Credential • EchoAid Learning Systems
        </p>
      </div>

    </div>
  );
});

export default CertificateTemplate;

