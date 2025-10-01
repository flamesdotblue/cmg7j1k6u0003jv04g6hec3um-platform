import React from 'react';

export default function TitleBar() {
  return (
    <div className="h-14 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <h1 className="font-semibold tracking-tight">Block Crosser</h1>
      </div>
      <div className="text-xs text-slate-300">Minecraft-like blocks • Dodge traffic</div>
    </div>
  );
}
