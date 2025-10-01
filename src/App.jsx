import React, { useCallback, useRef, useState } from 'react';
import GameCanvas from './components/GameCanvas.jsx';
import HUD from './components/HUD.jsx';
import Controls from './components/Controls.jsx';
import TitleBar from './components/TitleBar.jsx';

export default function App() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const restartKey = useRef(0);

  const handleScore = useCallback((s) => {
    setScore((prev) => (s > prev ? s : prev));
  }, []);

  const handleGameOver = useCallback(() => {
    setGameOver(true);
  }, []);

  const handleRestart = useCallback(() => {
    setScore(0);
    setGameOver(false);
    restartKey.current += 1;
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden">
      <TitleBar />
      <div className="relative w-full h-[calc(100vh-56px)]">
        <GameCanvas
          key={`game-${restartKey.current}`}
          onScore={handleScore}
          onGameOver={handleGameOver}
          disabled={gameOver}
        />
        <HUD score={score} gameOver={gameOver} onRestart={handleRestart} />
        {!gameOver && <Controls />}
      </div>
    </div>
  );
}
