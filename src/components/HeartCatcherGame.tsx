import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Trophy, ArrowLeft, RotateCcw, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeartCatcherGameProps {
  onBack?: () => void;
  playPop: () => void;
  playFanfare: () => void;
  playChime: () => void;
}

interface FallingItem {
  id: number;
  x: number; // percentage 10% to 90%
  y: number; // percentage 0% to 100%
  emoji: string;
  points: number;
  speed: number;
}

export const HeartCatcherGame: React.FC<HeartCatcherGameProps> = ({
  onBack,
  playPop,
  playFanfare,
  playChime,
}) => {
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(25);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'over'>('idle');
  const [playerX, setPlayerX] = useState<number>(50); // percentage 10 to 90
  const [items, setItems] = useState<FallingItem[]>([]);
  
  const gameLoopRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const nextItemIdRef = useRef<number>(1);
  const playerXRef = useRef<number>(50);
  playerXRef.current = playerX;

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(25);
    setGameState('playing');
    setItems([]);
    setPlayerX(50);
    playPop();
  }, [playPop]);

  // Main countdown timer
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameState((currentState) => (currentState === 'won' ? 'won' : 'over'));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Win condition check
  useEffect(() => {
    if (score >= 100 && gameState === 'playing') {
      setGameState('won');
      playFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f472b6', '#fb7185', '#ffe4ec', '#f59e0b', '#380026']
      });
    }
  }, [score, gameState, playFanfare]);

  // Animation frame game loop for falling items & collision
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    let lastSpawn = Date.now();

    const loop = () => {
      const now = Date.now();
      // Spawn new item every 400ms
      if (now - lastSpawn > 420) {
        lastSpawn = now;
        const itemTypes = [
          { emoji: '💖', points: 10, speed: 1.2 },
          { emoji: '🍓', points: 15, speed: 1.4 },
          { emoji: '🍰', points: 20, speed: 1.3 },
          { emoji: '⭐', points: 25, speed: 1.6 },
          { emoji: '⏰', points: -10, speed: 1.5 }, // funny obstacle
        ];
        const selected = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const newItem: FallingItem = {
          id: nextItemIdRef.current++,
          x: Math.floor(Math.random() * 75) + 12,
          y: -5,
          emoji: selected.emoji,
          points: selected.points,
          speed: selected.speed,
        };
        setItems((prev) => [...prev, newItem]);
      }

      // Update positions & check collision with player
      setItems((prevItems) => {
        const nextItems: FallingItem[] = [];
        const currentP = playerXRef.current;

        for (const it of prevItems) {
          const nextY = it.y + it.speed;

          // Check collision near bottom (y between 78 and 88, x distance < 14)
          if (nextY >= 75 && nextY <= 88 && Math.abs(it.x - currentP) < 14) {
            // Caught!
            if (it.points > 0) {
              playChime();
            } else {
              playPop();
            }
            setScore((s) => Math.max(0, s + it.points));
            continue; // item consumed
          }

          if (nextY < 100) {
            nextItems.push({ ...it, y: nextY });
          }
        }
        return nextItems;
      });

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, playChime, playPop]);

  // Touch and Keyboard movement
  const moveLeft = () => setPlayerX((x) => Math.max(10, x - 12));
  const moveRight = () => setPlayerX((x) => Math.min(90, x + 12));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  return (
    <div className="flex-1 flex flex-col justify-between py-1 animate-fadeIn text-center">
      {/* Header */}
      <div className="space-y-0.5">
        <div className="inline-flex items-center gap-1.5 bg-[#fce7f3] border border-[#f472b6] text-[#380026] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
          <Sparkles size={11} className="text-[#f472b6]" />
          <span>MINI GAME 3: CATCH THE LOVE</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#380026] tracking-tight">
          Catch The Treats! 🍓✨
        </h2>
        <p className="text-xs text-[#4a0e35] max-w-xs mx-auto">
          Move penguin to catch treats! Avoid ⏰ alarm clocks to score 100 points!
        </p>
      </div>

      {/* Game Stage Arena */}
      <div className="relative w-full max-w-xs h-[250px] mx-auto bg-[#fffdfa] border-4 border-[#380026] rounded-2xl shadow-[4px_4px_0px_#380026] overflow-hidden my-auto select-none">
        {/* HUD Top Bar */}
        <div className="absolute top-0 inset-x-0 bg-[#fff7ed] border-b-2 border-[#380026] px-3 py-1 flex items-center justify-between text-xs font-mono font-bold z-20">
          <span className="text-[#f472b6]">SCORE: {score}/100</span>
          <span className="text-[#380026]">TIME: {timeLeft}s</span>
        </div>

        {/* Falling Items */}
        {gameState === 'playing' &&
          items.map((it) => (
            <div
              key={it.id}
              style={{
                left: `${it.x}%`,
                top: `${it.y}%`,
              }}
              className="absolute -translate-x-1/2 text-xl pointer-events-none drop-shadow"
            >
              {it.emoji}
            </div>
          ))}

        {/* Player Penguin */}
        <div
          style={{
            left: `${playerX}%`,
          }}
          className="absolute bottom-2 -translate-x-1/2 text-3xl sm:text-4xl transition-all duration-75 z-10 filter drop-shadow"
        >
          🐧
          <span className="block text-[8px] font-bold font-mono text-[#380026] -mt-1 bg-[#ffe4ec] rounded px-1 border border-[#380026]">
            KUCHU
          </span>
        </div>

        {/* Overlays: Idle / Won / Game Over */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-[#fffdfa]/95 z-30 flex flex-col items-center justify-center p-4 space-y-3">
            <div className="text-4xl animate-bounce">🍓💖</div>
            <div className="text-sm font-black text-[#380026]">
              Ready, Kuchu Puchu?
            </div>
            <p className="text-[11px] text-[#4a0e35]">
              Catch hearts 💖 (+10) & cake 🍰 (+20)! Target: 100 Points.
            </p>
            <button
              onClick={startGame}
              className="py-2 px-5 bg-[#f472b6] hover:bg-[#fb7185] text-white font-bold text-xs rounded-xl border-2 border-[#380026] shadow-[2px_2px_0px_#380026] flex items-center gap-1.5"
            >
              <Play size={13} />
              <span>Start Game!</span>
            </button>
          </div>
        )}

        {gameState === 'won' && (
          <div className="absolute inset-0 bg-[#fffdfa]/95 z-30 flex flex-col items-center justify-center p-4 space-y-2 animate-fadeIn">
            <Trophy size={36} className="text-[#f59e0b] animate-bounce" />
            <h3 className="text-base font-black text-[#380026]">
              YOU WON, CHAMPION! 🎉
            </h3>
            <p className="text-xs text-[#4a0e35]">
              100% Love Points Captured! Certified cutie score 💖
            </p>
            <button
              onClick={startGame}
              className="py-2 px-4 bg-[#f472b6] hover:bg-[#fb7185] text-white font-bold text-xs rounded-xl border-2 border-[#380026] shadow-[2px_2px_0px_#380026] flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span>Play Again</span>
            </button>
          </div>
        )}

        {gameState === 'over' && (
          <div className="absolute inset-0 bg-[#fffdfa]/95 z-30 flex flex-col items-center justify-center p-4 space-y-2 animate-fadeIn">
            <div className="text-3xl">🥺</div>
            <h3 className="text-sm font-black text-[#380026]">
              Time's Up! Score: {score}
            </h3>
            <p className="text-xs text-[#4a0e35]">
              Almost there! Ek baar aur try karo, aaram se 100 ho jayega!
            </p>
            <button
              onClick={startGame}
              className="py-2 px-4 bg-[#f472b6] hover:bg-[#fb7185] text-white font-bold text-xs rounded-xl border-2 border-[#380026] shadow-[2px_2px_0px_#380026] flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span>Try Again</span>
            </button>
          </div>
        )}
      </div>

      {/* Touch Left/Right Controls for Mobile */}
      {gameState === 'playing' && (
        <div className="flex items-center justify-center gap-4 py-1">
          <button
            onClick={moveLeft}
            className="w-16 py-2 bg-[#fffdfa] active:bg-[#ffe4ec] text-[#380026] font-bold text-base rounded-xl border-2 border-[#380026] shadow-[2px_2px_0px_#380026] active:translate-y-0.5"
          >
            ◀ LEFT
          </button>
          <button
            onClick={moveRight}
            className="w-16 py-2 bg-[#fffdfa] active:bg-[#ffe4ec] text-[#380026] font-bold text-base rounded-xl border-2 border-[#380026] shadow-[2px_2px_0px_#380026] active:translate-y-0.5"
          >
            RIGHT ▶
          </button>
        </div>
      )}

      {/* Footer Back Button */}
      {onBack && (
        <div className="pt-1">
          <button
            onClick={() => {
              playPop();
              onBack();
            }}
            className="py-1.5 px-4 bg-[#fffdfa] hover:bg-[#ffe4ec] text-[#380026] border-2 border-[#380026] rounded-xl text-xs font-bold shadow-[2px_2px_0px_#380026] active:translate-y-0.5 inline-flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span>Back to Surprise Menu</span>
          </button>
        </div>
      )}
    </div>
  );
};
