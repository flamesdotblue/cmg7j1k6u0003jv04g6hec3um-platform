import React from 'react';

export default function Controls() {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
      <div className="flex items-center gap-2 text-xs text-slate-200/80">
        <kbd className="pointer-events-auto select-none bg-black/40 border border-slate-700 rounded px-1.5 py-0.5">W</kbd>
        <kbd className="pointer-events-auto select-none bg-black/40 border border-slate-700 rounded px-1.5 py-0.5">A</kbd>
        <kbd className="pointer-events-auto select-none bg-black/40 border border-slate-700 rounded px-1.5 py-0.5">S</kbd>
        <kbd className="pointer-events-auto select-none bg-black/40 border border-slate-700 rounded px-1.5 py-0.5">D</kbd>
        <span className="opacity-60">or</span>
        <kbd className="pointer-events-auto select-none bg-black/40 border border-slate-700 rounded px-1.5 py-0.5">←</kbd>
        <kbd className="pointer-events-auto select-none bg-black/40 border border-slate-700 rounded px-1.5 py-0.5">→</kbd>
        <kbd className="pointer-events-auto select-none bg-black/40 border border-slate-700 rounded px-1.5 py-0.5">↑</kbd>
        <kbd className="pointer-events-auto select-none bg-black/40 border border-slate-700 rounded px-1.5 py-0.5">↓</kbd>
      </div>
    </div>
  );
}
