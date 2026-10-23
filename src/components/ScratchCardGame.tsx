import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, ArrowLeft, RefreshCw, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScratchCardGameProps {
  onBack?: () => void;
  playPop: () => void;
  playFanfare: () => void;
}

export const ScratchCardGame: React.FC<ScratchCardGameProps> = ({
  onBack,
  playPop,
  playFanfare,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratched, setIsScratched] = useState<boolean>(false);
  const [scratchPercent, setScratchPercent] = useState<number>(0);
  const isDrawingRef = useRef<boolean>(false);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 280;
    const height = 180;
    canvas.width = width;
    canvas.height = height;

    // Reset composite
    ctx.globalCompositeOperation = 'source-over';

    // Pretty retro pink foil gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f472b6');
    grad.addColorStop(0.5, '#fb7185');
    grad.addColorStop(1, '#ec4899');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative retro pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < width; i += 20) {
      for (let j = 0; j < height; j += 20) {
        ctx.fillRect(i, j, 4, 4);
      }
    }

    // Border
    ctx.strokeStyle = '#380026';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Prompt Text on foil
    ctx.fillStyle = '#fffdfa';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SCRATCH HERE ✨', width / 2, height / 2 - 10);
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Rub with finger to reveal secret note!', width / 2, height / 2 + 15);
    ctx.font = '18px sans-serif';
    ctx.fillText('🎁 🎀 🌸', width / 2, height / 2 + 42);

    setIsScratched(false);
    setScratchPercent(0);
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparentPixels = 0;
      const totalPixels = imgData.data.length / 4;
      for (let i = 3; i < imgData.data.length; i += 16) {
        if (imgData.data[i] < 128) {
          transparentPixels += 4;
        }
      }

      const percent = Math.min(100, Math.round((transparentPixels / totalPixels) * 100));
      setScratchPercent(percent);

      if (percent > 35 && !isScratched) {
        setIsScratched(true);
        // Clear remaining canvas smoothly
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        playFanfare();
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.55 },
          colors: ['#f472b6', '#fb7185', '#ffe4ec', '#f59e0b', '#380026']
        });
      }
    } catch {}
  };

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2, false);
    ctx.fill();

    checkScratchPercentage();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    if (e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    if (e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    isDrawingRef.current = false;
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-1 animate-fadeIn text-center">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 bg-[#fce7f3] border border-[#f472b6] text-[#380026] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
          <Sparkles size={11} className="text-[#f472b6]" />
          <span>MINI GAME 2: SCRATCH CARD</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#380026] tracking-tight">
          Scratch To Reveal 🎫✨
        </h2>
        <p className="text-xs text-[#4a0e35] max-w-xs mx-auto">
          Apne finger ya mouse se card ko scratch karo aur secret message dekho!
        </p>
      </div>

      {/* Interactive Scratch Card Area */}
      <div className="my-auto py-2 flex flex-col items-center">
        <div className="relative w-[280px] h-[180px] rounded-2xl overflow-hidden border-4 border-[#380026] shadow-[4px_4px_0px_#380026] select-none touch-none">
          {/* Secret Message Underneath */}
          <div className="absolute inset-0 bg-[#fffdfa] p-3 flex flex-col items-center justify-center text-center space-y-1.5">
            <div className="text-2xl animate-bounce">💖</div>
            <h3 className="text-sm font-black text-[#f472b6] tracking-wider uppercase">
              I LOVE YOU KUCHU PUCHU! 💕
            </h3>
            <p className="text-[11px] text-[#4a0e35] leading-snug font-medium px-2">
              “No matter how much we tease each other, you are my favorite person forever and always. Happy Birthday meri jaan! 🌸”
            </p>
            <div className="text-[9px] font-mono text-[#380026] bg-[#ffe4ec] px-2 py-0.5 rounded border border-[#380026]">
              ★ 100% UNCONDITIONAL LOVE ★
            </div>
          </div>

          {/* Canvas Foil Overlay */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`absolute inset-0 cursor-pointer ${isScratched ? 'pointer-events-none opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          />
        </div>

        {/* Progress & Reset Status */}
        <div className="mt-3 flex items-center justify-between w-[280px] text-xs font-mono">
          <span className="text-[#380026] font-bold">
            SCRATCHED: {scratchPercent}%
          </span>
          <button
            onClick={() => {
              playPop();
              initCanvas();
            }}
            className="text-[11px] font-bold bg-[#fffdfa] hover:bg-[#ffe4ec] text-[#380026] px-2 py-1 rounded-lg border border-[#380026] inline-flex items-center gap-1 shadow-sm"
          >
            <RefreshCw size={11} />
            <span>Scratch Again</span>
          </button>
        </div>
      </div>

      {/* Footer Back Button */}
      {onBack && (
        <div className="pt-2">
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
