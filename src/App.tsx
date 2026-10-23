import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Sparkles,
  Cake,
  Mail,
  Gift,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  X,
  Minus,
  Square,
  Volume2,
  VolumeX,
  Star,
  PartyPopper,
  Flame,
  Award,
  Check,
  Share2,
  Copy,
  ExternalLink,
  MessageCircle,
  Smile,
  ShieldCheck,
  Gamepad2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChoosePenguinGame } from './components/ChoosePenguinGame';
import { ScratchCardGame } from './components/ScratchCardGame';
import { HeartCatcherGame } from './components/HeartCatcherGame';
import { DodgeNoModal } from './components/DodgeNoModal';

// Penguin image asset
const PENGUIN_IMG = "/penguin.jpg";

// Web Audio API Synthesizer for Retro 8-bit & Kawaii Sound Effects
class RetroAudio {
  ctx: AudioContext | null = null;
  muted: boolean = false;

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playPop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  playChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.08, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.2);
      });
    } catch {}
  }

  playFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.1, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch {}
  }
}

const soundManager = new RetroAudio();

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export default function App() {
  const [screen, setScreen] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Screen 2 states
  const [candlesBlown, setCandlesBlown] = useState<boolean>(false);
  const [wishMade, setWishMade] = useState<boolean>(false);

  // Screen 3 states
  const [unlockedCards, setUnlockedCards] = useState<{ [key: number]: boolean }>({
    1: true,
    2: false,
    3: false
  });

  // Screen 4 states (Romantic Question)
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | null>(null);

  // Screen 5 states (Letter)
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [letterSealed, setLetterSealed] = useState<boolean>(false);

  // Screen 6 states (Surprise & Confetti)
  const [giftOpened, setGiftOpened] = useState<boolean>(false);
  const [redeemedCoupons, setRedeemedCoupons] = useState<{ [key: number]: boolean }>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mini-Games & Cheeky Modal states
  const [activeGame, setActiveGame] = useState<'penguin' | 'scratch' | 'catcher' | null>(null);
  const [showDodgeModal, setShowDodgeModal] = useState<boolean>(false);
  const [noButtonText, setNoButtonText] = useState<string>("Nahi dekhna 🙈");
  const [noOffset, setNoOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleCheekyNo = () => {
    soundManager.playPop();
    setShowDodgeModal(true);
  };

  const handleNoHover = () => {
    soundManager.playPop();
    const prompts = [
      "Are you sure? 🥺",
      "Think again Kuchu Puchu!",
      "Sach mein nahi dekhna?! 😭",
      "Galat button dab raha hai! 😜",
      "Aise mat karo! 🥺👉👈"
    ];
    setNoButtonText(prompts[Math.floor(Math.random() * prompts.length)]);
    const newX = (Math.random() - 0.5) * 60;
    const newY = (Math.random() - 0.5) * 30;
    setNoOffset({ x: newX, y: newY });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.muted = !next;
    if (next) soundManager.playPop();
  };

  const handleNext = () => {
    soundManager.playPop();
    setScreen((prev) => Math.min(prev + 1, 7));
  };

  const handlePrev = () => {
    soundManager.playPop();
    setScreen((prev) => Math.max(prev - 1, 1));
  };

  const restartApp = () => {
    soundManager.playFanfare();
    setScreen(1);
    setActiveGame(null);
    setShowDodgeModal(false);
    setNoButtonText("Nahi dekhna 🙈");
    setNoOffset({ x: 0, y: 0 });
    setCandlesBlown(false);
    setWishMade(false);
    setUnlockedCards({ 1: true, 2: false, 3: false });
    setSelectedAnswer(null);
    setFloatingHearts([]);
    setLetterSealed(false);
    setGiftOpened(false);
    setRedeemedCoupons({});
    showToast("Restarted SURPRISE.EXE 🎀");
  };

  // Blow out candles
  const handleBlowCandles = () => {
    if (candlesBlown) return;
    soundManager.playFanfare();
    setCandlesBlown(true);
    setWishMade(true);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#f472b6', '#fb7185', '#ffe4ec', '#f59e0b', '#380026']
    });
    showToast("✨ Wish register ho gayi universe me! 🌟");
  };

  // Unlock memory cards
  const handleToggleCard = (cardId: number) => {
    soundManager.playChime();
    setUnlockedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Trigger floating hearts on letter screen
  const triggerFloatingHearts = () => {
    soundManager.playChime();
    const newHearts: FloatingHeart[] = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 50 + 20,
      size: Math.random() * 16 + 16,
      color: ['#f472b6', '#fb7185', '#ec4899', '#fda4af'][Math.floor(Math.random() * 4)]
    }));
    setFloatingHearts((prev) => [...prev, ...newHearts]);
    setLetterSealed(true);
    showToast("Lots of warm hugs & love sent! 🫂💗");
  };

  // Confetti effect for Screen 6
  useEffect(() => {
    if (screen === 6 && giftOpened && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvas.parentElement?.clientWidth || 360;
      canvas.height = canvas.parentElement?.clientHeight || 540;

      const confettiCount = 80;
      const particles: Array<{
        x: number;
        y: number;
        color: string;
        size: number;
        speedX: number;
        speedY: number;
        rotation: number;
        rotationSpeed: number;
      }> = [];

      const colors = ['#f472b6', '#fb7185', '#ffe4ec', '#380026', '#fbcfe8', '#f59e0b', '#ec4899'];

      for (let i = 0; i < confettiCount; i++) {
        particles.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 60,
          y: canvas.height * 0.45,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          speedX: (Math.random() - 0.5) * 10,
          speedY: (Math.random() - 0.9) * 12,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 12
        });
      }

      let animationFrameId: number;
      let frame = 0;

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          p.x += p.speedX;
          p.y += p.speedY;
          p.speedY += 0.22; // gravity
          p.rotation += p.rotationSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.3);
          ctx.restore();
        });

        frame++;
        if (frame < 180) {
          animationFrameId = requestAnimationFrame(render);
        }
      };

      render();

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [screen, giftOpened]);

  // Redeem voucher
  const handleRedeemCoupon = (couponId: number) => {
    soundManager.playFanfare();
    setRedeemedCoupons((prev) => ({
      ...prev,
      [couponId]: true
    }));
    showToast("Voucher unlocked! Lifetime valid ❤️");
  };

  return (
    <div className="min-h-screen bg-[#ffe4ec] text-[#380026] flex items-center justify-center p-3 sm:p-5 font-sans selection:bg-[#fbcfe8] selection:text-[#380026]">
      {/* Background Retro Grid & Floating Sparkles */}
      <div className="fixed inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#380026_1px,transparent_1px)] [background-size:18px_18px]" />

      {/* Main Container - Retro Computer Window */}
      <div className="relative w-full max-w-md bg-[#fffdfa] border-4 border-[#380026] rounded-2xl shadow-[6px_6px_0px_#380026] overflow-hidden flex flex-col z-10 transition-all duration-300">
        
        {/* Retro Window Title Bar */}
        <div className="bg-[#380026] text-[#fffdfa] px-3.5 py-2.5 flex items-center justify-between select-none border-b-2 border-[#380026]">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-3 h-3 bg-[#f472b6] border border-[#fffdfa] rounded-sm animate-pulse" />
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider flex items-center gap-1.5">
              <span>SURPRISE.EXE</span>
              <span className="text-[10px] text-[#fbcfe8] font-normal hidden xs:inline">| NIHARIKA_EDITION</span>
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Cute Mini-Games Toggle Button */}
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveGame((prev) => (prev ? null : 'penguin'));
              }}
              title="Play Cute Birthday Mini Games"
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded flex items-center gap-1 border transition-all ${
                activeGame
                  ? 'bg-[#f472b6] text-white border-[#fffdfa] shadow-xs'
                  : 'bg-[#4a0e35] text-[#fbcfe8] border-[#380026] hover:bg-[#5b1442]'
              }`}
            >
              <Gamepad2 size={12} />
              <span>{activeGame ? 'STORY' : 'GAMES 🎮'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? "Mute audio" : "Unmute audio"}
              className="p-1 hover:bg-[#4a0e35] text-[#fffdfa] rounded transition-colors text-xs"
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>

            {/* Window Action Buttons */}
            <button
              onClick={() => showToast("Kuchu Puchu's surprise window can't be minimized! 🌸")}
              title="Minimize"
              className="w-5 h-5 flex items-center justify-center bg-[#ffe4ec] text-[#380026] border border-[#380026] rounded text-[10px] font-bold hover:bg-[#fffdfa] active:translate-y-0.5"
            >
              <Minus size={10} />
            </button>
            <button
              onClick={() => showToast("Window is already at maximum cute size! ✨")}
              title="Maximize"
              className="w-5 h-5 flex items-center justify-center bg-[#ffe4ec] text-[#380026] border border-[#380026] rounded text-[10px] font-bold hover:bg-[#fffdfa] active:translate-y-0.5"
            >
              <Square size={9} />
            </button>
            <button
              onClick={() => showToast("Hehe no exit! Ye surprise pura dekhna padega 😜")}
              title="Close"
              className="w-5 h-5 flex items-center justify-center bg-[#f472b6] text-[#fffdfa] border border-[#380026] rounded text-[10px] font-bold hover:bg-[#e11d48] active:translate-y-0.5"
            >
              <X size={11} />
            </button>
          </div>
        </div>

        {/* Progress Bar & Breadcrumb Header */}
        <div className="bg-[#fff7ed] px-3.5 py-1.5 border-b-2 border-[#380026] flex items-center justify-between text-[11px] font-mono text-[#380026]">
          <div className="flex items-center gap-1.5">
            <span className="font-bold">STEP {screen}/7:</span>
            <span className="text-[#4a0e35] font-semibold">
              {screen === 1 && "Start"}
              {screen === 2 && "Reveal 🎂"}
              {screen === 3 && "Memories 📸"}
              {screen === 4 && "Question ❓"}
              {screen === 5 && "Letter 💌"}
              {screen === 6 && "Surprise 🎁"}
              {screen === 7 && "Finale 💖"}
            </span>
          </div>

          {/* Retro Progress Pips */}
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <span
                key={s}
                className={`w-2 h-2 rounded-full border border-[#380026] transition-all duration-300 ${
                  s === screen
                    ? 'bg-[#f472b6] scale-125'
                    : s < screen
                    ? 'bg-[#380026]'
                    : 'bg-[#fffdfa]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-[#380026] text-[#fffdfa] px-3.5 py-1.5 rounded-full border-2 border-[#f472b6] shadow-md text-xs font-medium flex items-center gap-1.5 animate-bounce">
            <Sparkles size={12} className="text-[#f472b6]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Interactive Screen Content Body */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between overflow-y-auto min-h-[460px]">
          {activeGame !== null ? (
            <div className="flex-1 flex flex-col justify-between animate-fadeIn">
              {/* Mini-Games Tab Switcher */}
              <div className="flex items-center justify-between gap-1 p-1 bg-[#fff7ed] border-2 border-[#380026] rounded-xl mb-2 text-xs font-bold shadow-xs">
                <button
                  onClick={() => {
                    soundManager.playPop();
                    setActiveGame('penguin');
                  }}
                  className={`flex-1 py-1 px-1.5 rounded-lg border transition-all text-[10px] sm:text-[11px] flex items-center justify-center gap-1 ${
                    activeGame === 'penguin'
                      ? 'bg-[#380026] text-white border-[#380026]'
                      : 'bg-white text-[#380026] border-[#380026]/30 hover:bg-[#ffe4ec]'
                  }`}
                >
                  <span>🐧</span>
                  <span>Penguins</span>
                </button>
                <button
                  onClick={() => {
                    soundManager.playPop();
                    setActiveGame('scratch');
                  }}
                  className={`flex-1 py-1 px-1.5 rounded-lg border transition-all text-[10px] sm:text-[11px] flex items-center justify-center gap-1 ${
                    activeGame === 'scratch'
                      ? 'bg-[#380026] text-white border-[#380026]'
                      : 'bg-white text-[#380026] border-[#380026]/30 hover:bg-[#ffe4ec]'
                  }`}
                >
                  <span>🎫</span>
                  <span>Scratch Card</span>
                </button>
                <button
                  onClick={() => {
                    soundManager.playPop();
                    setActiveGame('catcher');
                  }}
                  className={`flex-1 py-1 px-1.5 rounded-lg border transition-all text-[10px] sm:text-[11px] flex items-center justify-center gap-1 ${
                    activeGame === 'catcher'
                      ? 'bg-[#380026] text-white border-[#380026]'
                      : 'bg-white text-[#380026] border-[#380026]/30 hover:bg-[#ffe4ec]'
                  }`}
                >
                  <span>🍓</span>
                  <span>Catch Hearts</span>
                </button>
              </div>

              {/* Game View */}
              {activeGame === 'penguin' && (
                <ChoosePenguinGame
                  onBack={() => setActiveGame(null)}
                  playPop={() => soundManager.playPop()}
                  playFanfare={() => soundManager.playFanfare()}
                  playChime={() => soundManager.playChime()}
                />
              )}
              {activeGame === 'scratch' && (
                <ScratchCardGame
                  onBack={() => setActiveGame(null)}
                  playPop={() => soundManager.playPop()}
                  playFanfare={() => soundManager.playFanfare()}
                />
              )}
              {activeGame === 'catcher' && (
                <HeartCatcherGame
                  onBack={() => setActiveGame(null)}
                  playPop={() => soundManager.playPop()}
                  playFanfare={() => soundManager.playFanfare()}
                  playChime={() => soundManager.playChime()}
                />
              )}
            </div>
          ) : (
            <>
          
          {/* ========================================================
              SCREEN 1: OPENING SURPRISE SCREEN
              Exact Headings & the ONLY instance of the word "ButtonText"
             ======================================================== */}
          {screen === 1 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-2 animate-fadeIn">
              {/* Cute Penguin Avatar Card */}
              <div className="relative group">
                <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-2xl bg-[#ffe4ec] border-4 border-[#380026] p-2 shadow-[4px_4px_0px_#380026] overflow-hidden flex items-center justify-center">
                  <img
                    src={PENGUIN_IMG}
                    alt="Cute Kawaii Penguin with Heart Balloon"
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {/* Pixel Sparkle Badges */}
                <span className="absolute -top-2 -right-2 bg-[#f472b6] text-[#fffdfa] text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#380026] shadow-sm flex items-center gap-0.5">
                  <Sparkles size={10} /> 100% CUTE
                </span>
                <span className="absolute -bottom-2 -left-2 bg-[#fff7ed] text-[#380026] text-[10px] font-mono px-2 py-0.5 rounded-md border-2 border-[#380026] shadow-sm">
                  ✨ SPECIAL GIFT
                </span>
              </div>

              {/* Exact Requested Headings */}
              <div className="space-y-1.5 max-w-xs">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#380026] tracking-tight">
                  Oyeee Kuchu Puchuuu 🎀
                </h1>
                <p className="text-sm sm:text-base font-medium text-[#4a0e35] leading-relaxed">
                  Tumhare liye kuch banaya hai maineee 🥹💗
                </p>
              </div>

              {/* Cute Teaser Card */}
              <div className="bg-[#fff7ed] border-2 border-dashed border-[#380026] rounded-xl p-3 text-xs text-[#4a0e35] max-w-xs flex items-center gap-2.5 shadow-sm">
                <span className="text-xl">🌸</span>
                <span className="text-left leading-snug font-medium">
                  Dil thaam ke baithna... andar bohot saara pyaar, thodi nautanki aur ek pyara sa surprise chhupa hai! 🥺👉👈
                </span>
              </div>

              {/* Main Opening Button - The ONLY location where the exact word appears */}
              <div className="w-full max-w-xs pt-1 space-y-2">
                <button
                  onClick={handleNext}
                  className="w-full py-3 px-5 bg-[#f472b6] hover:bg-[#fb7185] text-[#fffdfa] font-bold text-sm sm:text-base rounded-xl border-3 border-[#380026] shadow-[4px_4px_0px_#380026] active:translate-y-1 active:shadow-[1px_1px_0px_#380026] transition-all flex items-center justify-center gap-2"
                >
                  <span>Achha Takle, dikhao 👀💕</span>
                </button>

                {/* Playful Cheeky 'Nahi dekhna' Button (Triggers dramatic video-style reaction) */}
                <div className="flex justify-center">
                  <button
                    onClick={handleCheekyNo}
                    onMouseEnter={handleNoHover}
                    onTouchStart={handleNoHover}
                    style={{ transform: `translate(${noOffset.x}px, ${noOffset.y}px)` }}
                    className="text-xs font-bold text-[#4a0e35] hover:text-[#e11d48] underline transition-transform duration-150 py-1 px-3 bg-[#fff7ed] rounded-lg border border-[#380026]/30 shadow-xs inline-flex items-center gap-1 active:scale-95"
                  >
                    <span>{noButtonText}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN 2: CUTE BIRTHDAY REVEAL & INTERACTIVE CAKE
             ======================================================== */}
          {screen === 2 && (
            <div className="flex-1 flex flex-col items-center justify-between text-center space-y-4 py-2 animate-fadeIn">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 bg-[#fce7f3] border border-[#f472b6] text-[#380026] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  <Sparkles size={11} className="text-[#f472b6]" />
                  <span>BIRTHDAY GIRL DETECTED</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#380026] tracking-tight">
                  Happy Birthday Niharika! 🎂✨
                </h2>
                <p className="text-xs sm:text-sm text-[#4a0e35] max-w-xs mx-auto">
                  Aaj ka din tumhara hai! Sabse pyaari aur sabse special Kuchu Puchu ko dher saara pyaar! 🌸
                </p>
              </div>

              {/* Interactive Birthday Cake */}
              <div className="relative my-2">
                <div
                  onClick={handleBlowCandles}
                  className={`cursor-pointer transition-transform duration-300 ${
                    candlesBlown ? 'scale-100' : 'hover:scale-105 active:scale-95'
                  }`}
                  title="Candles pe tap karke wish maango!"
                >
                  <div className="w-48 h-36 bg-[#fff7ed] border-3 border-[#380026] rounded-2xl shadow-[4px_4px_0px_#380026] p-3 flex flex-col items-center justify-center relative overflow-hidden">
                    
                    {/* Cake Frosting Waves */}
                    <div className="absolute top-0 inset-x-0 h-4 bg-[#f472b6] flex justify-around">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="w-4 h-3 bg-[#f472b6] rounded-b-full -mb-1" />
                      ))}
                    </div>

                    {/* 3 Interactive Candles */}
                    <div className="flex space-x-6 mb-2 mt-4 z-10">
                      {[1, 2, 3].map((candleIndex) => (
                        <div key={candleIndex} className="flex flex-col items-center">
                          {/* Candle Flame */}
                          {!candlesBlown ? (
                            <div className="w-3 h-4 bg-[#f59e0b] rounded-full animate-bounce shadow-[0_0_8px_#f59e0b] flex items-center justify-center">
                              <div className="w-1.5 h-2 bg-yellow-200 rounded-full" />
                            </div>
                          ) : (
                            <div className="w-2 h-2 text-[10px] text-gray-400 animate-pulse">💨</div>
                          )}
                          {/* Candle Stick */}
                          <div className="w-2.5 h-8 bg-gradient-to-b from-[#f472b6] to-[#ec4899] border border-[#380026] rounded-sm mt-0.5" />
                        </div>
                      ))}
                    </div>

                    {/* Cake Layer */}
                    <div className="w-full bg-[#fce7f3] border-2 border-[#380026] rounded-lg py-1.5 px-3 flex items-center justify-center gap-1.5 shadow-inner">
                      <Cake size={16} className="text-[#380026]" />
                      <span className="text-[11px] font-bold tracking-wider text-[#380026]">
                        {candlesBlown ? "WISH REGISTERED! 🌟" : "TAP TO BLOW CANDLES"}
                      </span>
                    </div>
                  </div>
                </div>

                {wishMade && (
                  <div className="mt-2 bg-[#fbcfe8] text-[#380026] border-2 border-[#380026] rounded-lg p-2 text-xs font-medium max-w-xs shadow-sm animate-fadeIn">
                    🎉 Happy Birthday meri favorite human! Har wish poori ho tumhari! 💖
                  </div>
                )}
              </div>

              {/* Teaser text */}
              <div className="bg-[#ffe4ec] border border-[#f472b6] rounded-xl p-2.5 text-xs text-[#380026] max-w-xs">
                <span>Penguin says: </span>
                <span className="font-semibold">Abhi toh surprise shuru hua hai... aage dekhein? 👀</span>
              </div>

              {/* Navigation */}
              <div className="w-full flex items-center justify-between pt-2">
                <button
                  onClick={handlePrev}
                  className="py-2 px-3.5 bg-[#fffdfa] hover:bg-[#ffe4ec] text-[#380026] border-2 border-[#380026] rounded-xl text-xs font-bold shadow-[2px_2px_0px_#380026] active:translate-y-0.5 flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <button
                  onClick={handleNext}
                  className="py-2 px-4 bg-[#f472b6] hover:bg-[#fb7185] text-[#fffdfa] border-2 border-[#380026] rounded-xl text-xs sm:text-sm font-bold shadow-[3px_3px_0px_#380026] active:translate-y-0.5 flex items-center gap-1"
                >
                  Aage Chalo <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN 3: THREE PERSONAL MEMORY CARDS
             ======================================================== */}
          {screen === 3 && (
            <div className="flex-1 flex flex-col justify-between space-y-3 py-1 animate-fadeIn">
              <div className="text-center space-y-0.5">
                <h2 className="text-xl sm:text-2xl font-black text-[#380026]">
                  Hamari Khaas Yaadein 📸✨
                </h2>
                <p className="text-xs text-[#4a0e35]">
                  Cards pe tap karke yaadein unseal karo!
                </p>
              </div>

              {/* 3 Interactive Memory Cards */}
              <div className="space-y-2.5 overflow-y-auto max-h-[310px] pr-1">
                {/* Card 1 */}
                <div
                  onClick={() => handleToggleCard(1)}
                  className={`p-3 rounded-xl border-2 border-[#380026] cursor-pointer transition-all ${
                    unlockedCards[1]
                      ? 'bg-[#fff7ed] shadow-[3px_3px_0px_#380026]'
                      : 'bg-[#fffdfa] opacity-90 hover:opacity-100 shadow-[2px_2px_0px_#380026]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌙</span>
                      <span className="text-xs font-bold text-[#380026]">
                        Wo Der Raat Wali Random Baatein
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-[#fce7f3] text-[#380026] px-1.5 py-0.5 rounded border border-[#380026]">
                      {unlockedCards[1] ? "OPEN" : "TAP"}
                    </span>
                  </div>
                  {unlockedCards[1] && (
                    <p className="mt-2 text-xs text-[#4a0e35] leading-relaxed border-t border-dashed border-[#f472b6] pt-1.5 animate-fadeIn">
                      Yaad hai hamari ghanton lambi 3 AM conversations? Jahan random reels se shuru hoke deep life thoughts aur silly jokes tak sab discuss hota hai. Tumse baat karke waqt ka pata hi nahi chalta! ☕✨
                    </p>
                  )}
                </div>

                {/* Card 2 */}
                <div
                  onClick={() => handleToggleCard(2)}
                  className={`p-3 rounded-xl border-2 border-[#380026] cursor-pointer transition-all ${
                    unlockedCards[2]
                      ? 'bg-[#fff7ed] shadow-[3px_3px_0px_#380026]'
                      : 'bg-[#fffdfa] opacity-90 hover:opacity-100 shadow-[2px_2px_0px_#380026]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">😜</span>
                      <span className="text-xs font-bold text-[#380026]">
                        Affectionate Teasing & Drama
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-[#fce7f3] text-[#380026] px-1.5 py-0.5 rounded border border-[#380026]">
                      {unlockedCards[2] ? "OPEN" : "TAP"}
                    </span>
                  </div>
                  {unlockedCards[2] && (
                    <p className="mt-2 text-xs text-[#4a0e35] leading-relaxed border-t border-dashed border-[#f472b6] pt-1.5 animate-fadeIn">
                      Tumhara wo cute pout jab tum fake gussa hoti ho, aur main tumhe aur irritate karta hoon sirf tumhara adorable reaction dekhne ke liye! Nobody does cute nautanki better than you. 🎭💗
                    </p>
                  )}
                </div>

                {/* Card 3 */}
                <div
                  onClick={() => handleToggleCard(3)}
                  className={`p-3 rounded-xl border-2 border-[#380026] cursor-pointer transition-all ${
                    unlockedCards[3]
                      ? 'bg-[#fff7ed] shadow-[3px_3px_0px_#380026]'
                      : 'bg-[#fffdfa] opacity-90 hover:opacity-100 shadow-[2px_2px_0px_#380026]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🫂</span>
                      <span className="text-xs font-bold text-[#380026]">
                        My Safe Place & Constant
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-[#fce7f3] text-[#380026] px-1.5 py-0.5 rounded border border-[#380026]">
                      {unlockedCards[3] ? "OPEN" : "TAP"}
                    </span>
                  </div>
                  {unlockedCards[3] && (
                    <p className="mt-2 text-xs text-[#4a0e35] leading-relaxed border-t border-dashed border-[#f472b6] pt-1.5 animate-fadeIn">
                      Duniya chahe kitni bhi chaotic ho, tumse baat karke instant sukoon milta hai. The warmth, the understanding, and knowing we have got each other no matter what. Purest blessing! 🌸
                    </p>
                  )}
                </div>
              </div>

              {/* Progress counter */}
              <div className="bg-[#fce7f3] text-[#380026] text-[11px] font-mono py-1 px-3 rounded-lg border border-[#f472b6] text-center">
                MEMORIES UNLOCKED: {Object.values(unlockedCards).filter(Boolean).length}/3
              </div>

              {/* Navigation */}
              <div className="w-full flex items-center justify-between pt-1">
                <button
                  onClick={handlePrev}
                  className="py-2 px-3.5 bg-[#fffdfa] hover:bg-[#ffe4ec] text-[#380026] border-2 border-[#380026] rounded-xl text-xs font-bold shadow-[2px_2px_0px_#380026] active:translate-y-0.5 flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <button
                  onClick={handleNext}
                  className="py-2 px-4 bg-[#f472b6] hover:bg-[#fb7185] text-[#fffdfa] border-2 border-[#380026] rounded-xl text-xs sm:text-sm font-bold shadow-[3px_3px_0px_#380026] active:translate-y-0.5 flex items-center gap-1"
                >
                  Agla Sawal <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN 4: PLAYFUL ROMANTIC QUESTION (DUAL BRANCHING)
             ======================================================== */}
          {screen === 4 && (
            <div className="flex-1 flex flex-col justify-between space-y-3 py-1 animate-fadeIn">
              <div className="text-center space-y-1">
                <span className="bg-[#fce7f3] text-[#380026] border border-[#f472b6] text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Star size={10} className="text-[#f472b6]" />
                  HONEST QUESTION FOR KUCHU PUCHU
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#380026] leading-snug">
                  Sach sach batana... Mujhse ladne mein zyaada maza aata hai ya mujhpe pyaar lutane mein? 🤭💭
                </h2>
                <p className="text-xs text-[#4a0e35]">
                  Dil pe haath rakh ke ek option select karo:
                </p>
              </div>

              {/* Two Clickable Choices */}
              <div className="space-y-2.5">
                {/* Option A */}
                <button
                  onClick={() => {
                    soundManager.playPop();
                    setSelectedAnswer('A');
                  }}
                  className={`w-full p-3 rounded-xl border-2 border-[#380026] text-left transition-all ${
                    selectedAnswer === 'A'
                      ? 'bg-[#f472b6] text-[#fffdfa] shadow-[4px_4px_0px_#380026] scale-[1.02]'
                      : 'bg-[#fffdfa] hover:bg-[#ffe4ec] text-[#380026] shadow-[2px_2px_0px_#380026]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-xs">
                      A
                    </span>
                    <span className="text-xs sm:text-sm font-bold">
                      Ladne mein! (Tumhe pareshan karna mera birthright hai 😈⚔️)
                    </span>
                  </div>
                </button>

                {/* Option B */}
                <button
                  onClick={() => {
                    soundManager.playPop();
                    setSelectedAnswer('B');
                  }}
                  className={`w-full p-3 rounded-xl border-2 border-[#380026] text-left transition-all ${
                    selectedAnswer === 'B'
                      ? 'bg-[#f472b6] text-[#fffdfa] shadow-[4px_4px_0px_#380026] scale-[1.02]'
                      : 'bg-[#fffdfa] hover:bg-[#ffe4ec] text-[#380026] shadow-[2px_2px_0px_#380026]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-xs">
                      B
                    </span>
                    <span className="text-xs sm:text-sm font-bold">
                      Pyaar lutane mein! (Par thoda drama zaroori hai 🥺💗)
                    </span>
                  </div>
                </button>
              </div>

              {/* Branching Response Card */}
              {selectedAnswer && (
                <div className="bg-[#fff7ed] border-2 border-[#380026] rounded-xl p-3 shadow-[3px_3px_0px_#380026] animate-fadeIn text-xs text-[#380026] space-y-1">
                  {selectedAnswer === 'A' ? (
                    <>
                      <div className="font-bold flex items-center gap-1.5 text-[#380026]">
                        <span>🐧 Penguin Verdict:</span>
                        <span className="text-[#f472b6]">“Haha I knew it!” 🤣</span>
                      </div>
                      <p className="text-[#4a0e35] leading-relaxed">
                        Mujhe 100% pata tha tum yahi bologi! Tumhara bina wajah ladna aur fir cute sa munh banana hi toh sabse pyara lagta hai. Par deep down, pyaar bhi mujhi se karti ho na? 😉💕
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="font-bold flex items-center gap-1.5 text-[#380026]">
                        <span>🐧 Penguin Verdict:</span>
                        <span className="text-[#f472b6]">“Awwwww meli jaan!” 🥹💗</span>
                      </div>
                      <p className="text-[#4a0e35] leading-relaxed">
                        Mera dil pighal gaya sach mein! Dekha, finally accept kar liya! Ab promise karo aaj birthday pe zero gussa aur full cuteness dogi! (Thoda drama chalta hai waise hehe) 🥰✨
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="w-full flex items-center justify-between pt-1">
                <button
                  onClick={handlePrev}
                  className="py-2 px-3.5 bg-[#fffdfa] hover:bg-[#ffe4ec] text-[#380026] border-2 border-[#380026] rounded-xl text-xs font-bold shadow-[2px_2px_0px_#380026] active:translate-y-0.5 flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <button
                  onClick={handleNext}
                  className="py-2 px-4 bg-[#f472b6] hover:bg-[#fb7185] text-[#fffdfa] border-2 border-[#380026] rounded-xl text-xs sm:text-sm font-bold shadow-[3px_3px_0px_#380026] active:translate-y-0.5 flex items-center gap-1"
                >
                  Aage Chalo <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN 5: HEARTFELT BIRTHDAY LETTER
             ======================================================== */}
          {screen === 5 && (
            <div className="flex-1 flex flex-col justify-between space-y-2 py-1 animate-fadeIn relative">
              {/* Floating Hearts Container */}
              {floatingHearts.map((h) => (
                <div
                  key={h.id}
                  style={{
                    left: `${h.x}%`,
                    top: `${h.y}%`,
                    color: h.color,
                    fontSize: `${h.size}px`
                  }}
                  className="absolute pointer-events-none animate-ping z-30 opacity-75"
                >
                  💗
                </div>
              ))}

              <div className="text-center space-y-0.5">
                <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-[#fce7f3] text-[#380026] px-2 py-0.5 rounded border border-[#380026]">
                  <Mail size={11} className="text-[#f472b6]" />
                  <span>LETTER_FROM_HEART.TXT</span>
                </div>
                <h2 className="text-xl font-black text-[#380026]">
                  A Letter Just For You 💌
                </h2>
              </div>

              {/* Letter Parchment Box */}
              <div className="bg-[#fffbf0] border-2 border-[#380026] rounded-xl p-3.5 shadow-[3px_3px_0px_#380026] max-h-[260px] overflow-y-auto space-y-2 text-xs leading-relaxed text-[#380026]">
                <p className="font-bold text-[#4a0e35]">
                  Dear Niharika (Meli Kuchu Puchu),
                </p>
                <p>
                  Aise toh hum roz bohot baatein karte hain, ek doosre ko irritate karte rehte hain... par aaj tumhare birthday pe dil se kuch bolna chahta hoon.
                </p>
                <p>
                  Tum mere life ka wo hissa ho jiske bina mera din poora hi nahi lagta. Tumhari hassi, tumhara wo bacho jaisa masoom dil, tumhara choti choti baaton pe excited hona aur meri har silly baat pe dhyaan dena—these little things mean the entire world to me.
                </p>
                <p>
                  Life chahe jitni bhi busy ho, knowing that I have you to talk to, laugh with, and share my feelings with is the greatest comfort. Thank you for simply being you, my constant and my happiest safe space.
                </p>
                <p>
                  I wish you all the joy, success, peace, and endless smiles this year. May every dream of yours turn into reality. Always remember, I will always be right here—to cheer you up, protect your smile, and yes, annoy you forever!
                </p>
                <div className="pt-1 text-right font-semibold text-[#f472b6]">
                  <span>With all my love & hugs,</span>
                  <br />
                  <span>Always Yours 🎀</span>
                </div>
              </div>

              {/* Action Button: Sprinkle Hearts */}
              <button
                onClick={triggerFloatingHearts}
                className="w-full py-2 px-3 bg-[#fce7f3] hover:bg-[#fbcfe8] text-[#380026] border-2 border-[#380026] rounded-xl text-xs font-bold shadow-[2px_2px_0px_#380026] active:translate-y-0.5 flex items-center justify-center gap-1.5"
              >
                <Heart size={14} className="text-[#f472b6] fill-[#f472b6]" />
                <span>{letterSealed ? "Hearts Sent! Tap for More 💕" : "Send Warm Hugs & Hearts 💕"}</span>
              </button>

              {/* Navigation */}
              <div className="w-full flex items-center justify-between pt-1">
                <button
                  onClick={handlePrev}
                  className="py-2 px-3.5 bg-[#fffdfa] hover:bg-[#ffe4ec] text-[#380026] border-2 border-[#380026] rounded-xl text-xs font-bold shadow-[2px_2px_0px_#380026] active:translate-y-0.5 flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <button
                  onClick={handleNext}
                  className="py-2 px-4 bg-[#f472b6] hover:bg-[#fb7185] text-[#fffdfa] border-2 border-[#380026] rounded-xl text-xs sm:text-sm font-bold shadow-[3px_3px_0px_#380026] active:translate-y-0.5 flex items-center gap-1"
                >
                  Surprise Dekho <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN 6: CUTE FINAL SURPRISE WITH CONFETTI & VOUCHERS
             ======================================================== */}
          {screen === 6 && (
            <div className="flex-1 flex flex-col justify-between space-y-2 py-1 animate-fadeIn relative">
              {/* Confetti Canvas Layer */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none z-40"
              />

              <div className="text-center space-y-0.5">
                <span className="bg-[#fce7f3] text-[#380026] border border-[#f472b6] text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Gift size={10} className="text-[#f472b6]" />
                  MAGIC BOX READY
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#380026]">
                  A Final Sweet Surprise! 🎁✨
                </h2>
                <p className="text-xs text-[#4a0e35]">
                  Box pe tap karke apna birthday hamper unwrap karo!
                </p>
              </div>

              {/* Gift Unwrapping Container */}
              {!giftOpened ? (
                <div className="my-auto py-6 flex flex-col items-center justify-center space-y-3">
                  <div
                    onClick={() => {
                      soundManager.playFanfare();
                      setGiftOpened(true);
                      confetti({
                        particleCount: 120,
                        spread: 80,
                        origin: { y: 0.5 },
                        colors: ['#f472b6', '#fb7185', '#ffe4ec', '#380026', '#fbcfe8', '#f59e0b']
                      });
                      showToast("🎉 YAAYYY! Confetti Blast! 🎈");
                    }}
                    className="w-32 h-32 bg-[#fff7ed] border-4 border-[#380026] rounded-2xl shadow-[5px_5px_0px_#380026] flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform relative group"
                  >
                    {/* Retro Ribbon */}
                    <div className="absolute inset-y-0 w-5 bg-[#f472b6] border-x border-[#380026]" />
                    <div className="absolute inset-x-0 h-5 bg-[#f472b6] border-y border-[#380026]" />
                    <div className="relative z-10 text-3xl animate-bounce">🎁</div>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playFanfare();
                      setGiftOpened(true);
                      confetti({
                        particleCount: 120,
                        spread: 80,
                        origin: { y: 0.5 },
                        colors: ['#f472b6', '#fb7185', '#ffe4ec', '#380026', '#fbcfe8', '#f59e0b']
                      });
                      showToast("🎉 YAAYYY! Confetti Blast! 🎈");
                    }}
                    className="py-2.5 px-6 bg-[#f472b6] hover:bg-[#fb7185] text-[#fffdfa] font-bold text-xs sm:text-sm rounded-xl border-2 border-[#380026] shadow-[3px_3px_0px_#380026] active:translate-y-0.5 flex items-center gap-1.5"
                  >
                    <PartyPopper size={14} />
                    <span>Open Birthday Hamper 🎀</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 animate-fadeIn">
                  <div className="text-center bg-[#fce7f3] border border-[#f472b6] rounded-lg py-1 px-2 text-xs font-bold text-[#380026] flex items-center justify-center gap-1">
                    <Sparkles size={12} className="text-[#f472b6]" />
                    <span>3 Special Lifetime Coupons Unlocked!</span>
                  </div>

                  {/* Coupon 1 */}
                  <div className="p-2.5 bg-[#fff7ed] border-2 border-[#380026] rounded-xl flex items-center justify-between shadow-[2px_2px_0px_#380026]">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-[#380026] flex items-center gap-1">
                        <span>🎫</span> Lifetime Unlimited Warm Hugs
                      </div>
                      <div className="text-[10px] text-[#4a0e35]">
                        Redeemable anytime you feel sad, tired, or low.
                      </div>
                    </div>
                    <button
                      onClick={() => handleRedeemCoupon(1)}
                      className={`text-[10px] font-bold px-2 py-1 rounded border border-[#380026] transition-all ${
                        redeemedCoupons[1]
                          ? 'bg-[#380026] text-[#fffdfa]'
                          : 'bg-[#f472b6] text-[#fffdfa] hover:bg-[#fb7185] shadow-[1px_1px_0px_#380026]'
                      }`}
                    >
                      {redeemedCoupons[1] ? "CLAIMED ❤️" : "REDEEM"}
                    </button>
                  </div>

                  {/* Coupon 2 */}
                  <div className="p-2.5 bg-[#fff7ed] border-2 border-[#380026] rounded-xl flex items-center justify-between shadow-[2px_2px_0px_#380026]">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-[#380026] flex items-center gap-1">
                        <span>🍦</span> 100 Midnight Ice-Cream Dates
                      </div>
                      <div className="text-[10px] text-[#4a0e35]">
                        Zero arguments, 100% treats and sweet conversations.
                      </div>
                    </div>
                    <button
                      onClick={() => handleRedeemCoupon(2)}
                      className={`text-[10px] font-bold px-2 py-1 rounded border border-[#380026] transition-all ${
                        redeemedCoupons[2]
                          ? 'bg-[#380026] text-[#fffdfa]'
                          : 'bg-[#f472b6] text-[#fffdfa] hover:bg-[#fb7185] shadow-[1px_1px_0px_#380026]'
                      }`}
                    >
                      {redeemedCoupons[2] ? "CLAIMED ❤️" : "REDEEM"}
                    </button>
                  </div>

                  {/* Coupon 3 */}
                  <div className="p-2.5 bg-[#fff7ed] border-2 border-[#380026] rounded-xl flex items-center justify-between shadow-[2px_2px_0px_#380026]">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-[#380026] flex items-center gap-1">
                        <span>👑</span> ‘You Are Always Right’ Pass
                      </div>
                      <div className="text-[10px] text-[#4a0e35]">
                        Instantly win any debate without explanation!
                      </div>
                    </div>
                    <button
                      onClick={() => handleRedeemCoupon(3)}
                      className={`text-[10px] font-bold px-2 py-1 rounded border border-[#380026] transition-all ${
                        redeemedCoupons[3]
                          ? 'bg-[#380026] text-[#fffdfa]'
                          : 'bg-[#f472b6] text-[#fffdfa] hover:bg-[#fb7185] shadow-[1px_1px_0px_#380026]'
                      }`}
                    >
                      {redeemedCoupons[3] ? "CLAIMED ❤️" : "REDEEM"}
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="w-full flex items-center justify-between pt-1">
                <button
                  onClick={handlePrev}
                  className="py-2 px-3.5 bg-[#fffdfa] hover:bg-[#ffe4ec] text-[#380026] border-2 border-[#380026] rounded-xl text-xs font-bold shadow-[2px_2px_0px_#380026] active:translate-y-0.5 flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <button
                  onClick={handleNext}
                  className="py-2 px-4 bg-[#f472b6] hover:bg-[#fb7185] text-[#fffdfa] border-2 border-[#380026] rounded-xl text-xs sm:text-sm font-bold shadow-[3px_3px_0px_#380026] active:translate-y-0.5 flex items-center gap-1"
                >
                  Final Message <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN 7: FINAL BIRTHDAY SCREEN WITH RESTART BUTTON
             ======================================================== */}
          {screen === 7 && (
            <div className="flex-1 flex flex-col items-center justify-between text-center space-y-3 py-1 animate-fadeIn">
              <div className="space-y-1">
                <span className="bg-[#fce7f3] text-[#380026] border border-[#f472b6] text-[10px] font-bold px-3 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Heart size={10} className="text-[#f472b6] fill-[#f472b6]" />
                  MISSION SURPRISE COMPLETE
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#380026] tracking-tight">
                  Happy Birthday Niharika! 🌸✨
                </h2>
                <p className="text-xs text-[#4a0e35] max-w-xs mx-auto">
                  Hope this little retro program brought a huge smile to your face today! 💖
                </p>
              </div>

              {/* Penguin Celebration Stamp */}
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#ffe4ec] border-3 border-[#380026] p-1.5 shadow-[4px_4px_0px_#380026] overflow-hidden mx-auto flex items-center justify-center">
                  <img
                    src={PENGUIN_IMG}
                    alt="Kawaii Penguin Mascot"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#fff7ed] border-2 border-[#380026] px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-sm">
                  100% LOVE 💕
                </div>
              </div>

              {/* Final Personal Message Box */}
              <div className="bg-[#fff7ed] border-2 border-dashed border-[#380026] rounded-xl p-3 text-xs text-[#380026] max-w-xs space-y-1 shadow-inner">
                <p className="font-bold text-[#4a0e35]">
                  “Always stay the wonderful, shining, adorable person that you are, Kuchu Puchu.”
                </p>
                <p className="text-[11px] text-[#380026]">
                  Your smile is truly magic. May this new year bring you everything you've ever hoped for! 🌟
                </p>
              </div>

              {/* Action Buttons: Mini-Games & Restart */}
              <div className="w-full max-w-xs space-y-2 pt-1">
                {/* Play Cute Mini-Games */}
                <button
                  onClick={() => {
                    soundManager.playFanfare();
                    setActiveGame('penguin');
                  }}
                  className="w-full py-2.5 px-4 bg-[#fffdfa] hover:bg-[#ffe4ec] text-[#380026] font-bold text-xs sm:text-sm rounded-xl border-3 border-[#380026] shadow-[3px_3px_0px_#380026] active:translate-y-0.5 active:shadow-[1px_1px_0px_#380026] transition-all flex items-center justify-center gap-2"
                >
                  <Gamepad2 size={15} className="text-[#f472b6]" />
                  <span>Play Cute Mini-Games (3) 🎮✨</span>
                </button>

                {/* Working Restart Option */}
                <button
                  onClick={restartApp}
                  className="w-full py-2.5 px-4 bg-[#f472b6] hover:bg-[#fb7185] text-[#fffdfa] font-bold text-xs sm:text-sm rounded-xl border-3 border-[#380026] shadow-[3px_3px_0px_#380026] active:translate-y-0.5 active:shadow-[1px_1px_0px_#380026] transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={15} />
                  <span>Phir Se Shuru Karein? 🔄</span>
                </button>
              </div>

              {/* Digital Footer Signature */}
              <div className="text-[10px] font-mono text-[#4a0e35]">
                <span>Crafted with endless care for Niharika 🎀</span>
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* Retro Bottom Status Bar */}
        <div className="bg-[#380026] text-[#fffdfa] px-3.5 py-1.5 border-t-2 border-[#380026] flex items-center justify-between text-[10px] font-mono select-none">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping inline-block" />
            <span className="text-[#fbcfe8]">STATUS: 100% CUTE</span>
          </div>
          <div className="flex items-center space-x-3 text-[#fbcfe8]">
            <span>FOR: NIHARIKA</span>
            <span>MEMORY: HEART.DAT</span>
          </div>
        </div>

        {/* Dramatic Cheeky No Modal */}
        <DodgeNoModal
          isOpen={showDodgeModal}
          onProceed={() => {
            setShowDodgeModal(false);
            handleNext();
          }}
          onTryAgain={() => {
            setShowDodgeModal(false);
            setNoButtonText("Nahi dekhna 🙈");
            setNoOffset({ x: 0, y: 0 });
          }}
          playPop={() => soundManager.playPop()}
        />

      </div>
    </div>
  );
}