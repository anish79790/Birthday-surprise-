import React, { useState } from 'react';
import { Sparkles, Heart, Cake, ArrowLeft, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChoosePenguinGameProps {
  onBack?: () => void;
  playPop: () => void;
  playFanfare: () => void;
  playChime: () => void;
}

export const ChoosePenguinGame: React.FC<ChoosePenguinGameProps> = ({
  onBack,
  playPop,
  playFanfare,
  playChime,
}) => {
  const [selectedPenguin, setSelectedPenguin] = useState<number | null>(null);
  const [openedPenguins, setOpenedPenguins] = useState<{ [key: number]: boolean }>({});
  const [hugCount, setHugCount] = useState<number>(10);
  const [candleBlown, setCandleBlown] = useState<boolean>(false);

  const handleSelectPenguin = (id: number) => {
    playChime();
    setSelectedPenguin(id);
    setOpenedPenguins((prev) => {
      const next = { ...prev, [id]: true };
      if (Object.keys(next).length === 3) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f472b6', '#fb7185', '#ffe4ec', '#f59e0b', '#380026']
        });
      }
      return next;
    });
  };

  const handleAddHug = () => {
    playPop();
    setHugCount((c) => c + 1);
    confetti({
      particleCount: 15,
      spread: 45,
      origin: { y: 0.7 },
      colors: ['#f472b6', '#ec4899', '#fda4af']
    });
  };

  const handleBlowCake = () => {
    playFanfare();
    setCandleBlown(true);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f472b6', '#fb7185', '#ffe4ec', '#f59e0b']
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-1 animate-fadeIn text-center">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 bg-[#fce7f3] border border-[#f472b6] text-[#380026] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
          <Sparkles size={11} className="text-[#f472b6]" />
          <span>MINI GAME 1: MYSTERY PENGUINS</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#380026] tracking-tight">
          Choose A Penguin! 🐧✨
        </h2>
        <p className="text-xs text-[#4a0e35] max-w-xs mx-auto">
          Each penguin has something special to say... tap on any gift to open!
        </p>
      </div>

      {/* Main Penguin Selection or Opened Card */}
      {selectedPenguin === null ? (
        <div className="my-auto py-3 space-y-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-sm mx-auto">
            {[1, 2, 3].map((id) => {
              const isOpened = openedPenguins[id];
              return (
                <button
                  key={id}
                  onClick={() => handleSelectPenguin(id)}
                  className={`p-2 sm:p-3 rounded-2xl border-3 border-[#380026] flex flex-col items-center justify-between transition-all group ${
                    isOpened
                      ? 'bg-[#ffe4ec] shadow-[2px_2px_0px_#380026]'
                      : 'bg-[#fffdfa] hover:bg-[#fff7ed] shadow-[4px_4px_0px_#380026] hover:-translate-y-1 active:translate-y-0.5'
                  }`}
                >
                  <div className="relative w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center">
                    {/* Cute Kawaii Penguin SVG Holding Gift Box */}
                    <div className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform select-none">
                      🐧
                    </div>
                    <span className="absolute bottom-0 right-0 text-xl sm:text-2xl animate-bounce">
                      🎁
                    </span>
                    {isOpened && (
                      <span className="absolute -top-1 -right-1 bg-[#380026] text-white text-[9px] font-mono px-1 rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] font-bold text-[#380026]">
                    Pengu #{id}
                  </div>
                  <div className="text-[9px] text-[#4a0e35] font-medium">
                    {isOpened ? 'Opened ❤️' : 'Tap to Open'}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-[#fff7ed] border border-[#380026] rounded-xl p-2 text-[11px] text-[#4a0e35] max-w-xs mx-auto font-medium">
            Penguins Opened: {Object.keys(openedPenguins).length}/3 🎀
          </div>
        </div>
      ) : (
        /* Detailed Opened Penguin View */
        <div className="my-auto py-2 space-y-3 animate-fadeIn max-w-xs mx-auto">
          {selectedPenguin === 1 && (
            <div className="bg-[#fffbf0] border-3 border-[#380026] rounded-2xl p-4 shadow-[4px_4px_0px_#380026] space-y-2.5">
              <div className="text-3xl animate-bounce">🎂</div>
              <div className="text-xs font-mono font-bold bg-[#fce7f3] text-[#380026] py-0.5 px-2 rounded-full inline-block">
                PENGUIN #1: THE BIRTHDAY WISH
              </div>
              <h3 className="text-base font-black text-[#380026]">
                Make A Secret Wish, Kuchu Puchu! 🌟
              </h3>
              <p className="text-xs text-[#4a0e35] leading-relaxed">
                “May your year be filled with zero stress, tons of chocolates, your favorite food treats, and endless reasons to smile!”
              </p>
              
              <button
                onClick={handleBlowCake}
                className={`w-full py-2 px-3 rounded-xl border-2 border-[#380026] font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  candleBlown
                    ? 'bg-[#380026] text-[#fffdfa]'
                    : 'bg-[#f472b6] hover:bg-[#fb7185] text-[#fffdfa] shadow-[2px_2px_0px_#380026]'
                }`}
              >
                <Cake size={13} />
                <span>{candleBlown ? "Wish Registered in Universe! ✨" : "Tap To Blow Candle & Wish 🎂"}</span>
              </button>
            </div>
          )}

          {selectedPenguin === 2 && (
            <div className="bg-[#fff7ed] border-3 border-[#380026] rounded-2xl p-4 shadow-[4px_4px_0px_#380026] space-y-2.5">
              <div className="text-3xl animate-pulse">🫂</div>
              <div className="text-xs font-mono font-bold bg-[#fce7f3] text-[#380026] py-0.5 px-2 rounded-full inline-block">
                PENGUIN #2: VIRTUAL HUG MACHINE
              </div>
              <h3 className="text-base font-black text-[#380026]">
                Infinite Virtual Hugs For Ya! 💕
              </h3>
              <p className="text-xs text-[#4a0e35] leading-relaxed">
                Jab bhi tum low feel karo, ye button tap karna! Ek big warm bear hug is on its way to you! 🥺
              </p>

              <div className="bg-[#fce7f3] border border-[#f472b6] rounded-xl p-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#380026]">Hugs Delivered:</span>
                <span className="text-sm font-black text-[#f472b6] font-mono">{hugCount} Hugs ❤️</span>
              </div>

              <button
                onClick={handleAddHug}
                className="w-full py-2 px-3 bg-[#f472b6] hover:bg-[#fb7185] text-[#fffdfa] rounded-xl border-2 border-[#380026] font-bold text-xs shadow-[2px_2px_0px_#380026] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
              >
                <Heart size={13} className="fill-white" />
                <span>Send One More Big Cuddle 🫂</span>
              </button>
            </div>
          )}

          {selectedPenguin === 3 && (
            <div className="bg-[#fffdfa] border-3 border-[#380026] rounded-2xl p-4 shadow-[4px_4px_0px_#380026] space-y-2.5">
              <div className="text-3xl animate-bounce">💌</div>
              <div className="text-xs font-mono font-bold bg-[#fce7f3] text-[#380026] py-0.5 px-2 rounded-full inline-block">
                PENGUIN #3: SWEET SECRET NOTE
              </div>
              <h3 className="text-base font-black text-[#380026]">
                My Favorite Human Award 🏆
              </h3>
              <div className="bg-[#ffe4ec] border border-[#f472b6] rounded-xl p-2.5 text-xs text-[#380026] leading-relaxed text-left space-y-1">
                <p className="font-semibold">“You know what makes you so special?”</p>
                <p className="text-[11px] text-[#4a0e35]">
                  Tumhare sath har choti choti baat funny ho jaati hai. Tumhari hassi pure din ki thakaan mita deti hai. Never change yourself, Kuchu Puchu! 🎀
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              playPop();
              setSelectedPenguin(null);
            }}
            className="w-full py-2 px-3 bg-[#fffdfa] hover:bg-[#ffe4ec] text-[#380026] rounded-xl border-2 border-[#380026] text-xs font-bold shadow-[2px_2px_0px_#380026] flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={12} />
            <span>Check Other Penguins 🐧</span>
          </button>
        </div>
      )}

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
