import React from 'react';

export default function HUD({ score, gameOver, onRestart }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
      <div className="flex items-center justify-between p-4">
        <div className="backdrop-blur-sm bg-black/30 rounded-lg px-3 py-1.5 text-sm font-medium">Farthest row: <span className="text-emerald-300 font-semibold">{score}</span></div>
        <div className="backdrop-blur-sm bg-black/30 rounded-lg px-3 py-1.5 text-xs">Use arrows / WASD to move</div>
      </div>

      {gameOver && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center">
          <div className="bg-slate-900/90 border border-slate-700 rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-auto">
            <div className="text-3xl font-semibold mb-2">Game Over</div>
            <div className="text-slate-300 mb-6">You were hit by a car. Final score: <span className="text-emerald-300 font-semibold">{score}</span></div>
            <button
              onClick={onRestart}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 transition text-black font-semibold"
            >
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
