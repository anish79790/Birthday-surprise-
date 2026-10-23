import React from 'react';
import { RotateCcw } from 'lucide-react';

interface DodgeNoModalProps {
  isOpen: boolean;
  onProceed: () => void;
  onTryAgain: () => void;
  playPop: () => void;
}

export const DodgeNoModal: React.FC<DodgeNoModalProps> = ({
  isOpen,
  onProceed,
  onTryAgain,
  playPop,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#380026]/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-xs bg-[#fffdfa] border-4 border-[#380026] rounded-2xl p-5 shadow-[6px_6px_0px_#380026] text-center space-y-4">
        {/* Sad Penguin Mascot */}
        <div className="relative mx-auto w-24 h-24 bg-[#ffe4ec] rounded-2xl border-3 border-[#380026] flex items-center justify-center text-5xl shadow-[3px_3px_0px_#380026]">
          🐧
          <span className="absolute -top-2 -right-2 text-2xl animate-bounce">
            💔
          </span>
        </div>

        {/* Dramatic text inspired by video 2 */}
        <div className="space-y-1">
          <h3 className="text-xl font-black text-[#e11d48] tracking-tight">
            WHY DID YOU CLICK NO?! 😭
          </h3>
          <p className="text-xs text-[#380026] leading-relaxed font-medium">
            Itni mehnat se tumhare liye birthday surprise banaya hai aur tum “No” dabati ho?! Aise kaise chalega Kuchu Puchu! 🥺💔
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              playPop();
              onProceed();
            }}
            className="w-full py-2.5 px-4 bg-[#f472b6] hover:bg-[#fb7185] text-white font-bold text-xs sm:text-sm rounded-xl border-2 border-[#380026] shadow-[3px_3px_0px_#380026] active:translate-y-0.5 transition-all"
          >
            Achha sorry baba, dikhao! 🥺💗
          </button>

          <button
            onClick={() => {
              playPop();
              onTryAgain();
            }}
            className="w-full py-2 px-3 bg-[#fff7ed] hover:bg-[#ffe4ec] text-[#380026] font-bold text-xs rounded-xl border-2 border-[#380026] shadow-[2px_2px_0px_#380026] active:translate-y-0.5 flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={12} />
            <span>Try Again (Ek aur mauka) 🔄</span>
          </button>
        </div>
      </div>
    </div>
  );
};
