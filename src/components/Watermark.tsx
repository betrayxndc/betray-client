import React from 'react';

export const Watermark: React.FC = () => {
  return (
    <div 
      id="watermark-betray"
      className="fixed bottom-3 right-4 z-50 pointer-events-none select-none flex items-center gap-1.5 px-3 py-1 rounded bg-[#0d1017]/90 border border-rose-600/40 backdrop-blur-xs shadow-[0_0_15px_rgba(225,29,72,0.25)] transition-opacity duration-300 opacity-80 hover:opacity-100"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse" />
      <span className="text-[11px] font-rajdhani font-bold tracking-wider uppercase text-rose-300">
        feito por <span className="text-[#f8fafc] font-extrabold tracking-widest underline decoration-rose-500/60">betray</span>
      </span>
    </div>
  );
};

