import React from 'react';
import { Sparkles, Volume2, VolumeX } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface HeaderProps {
  onCelebration: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNavigateTo: (section: 'podium' | 'chart' | 'table') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onCelebration,
  soundEnabled,
  onToggleSound,
  onNavigateTo,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <a href="/" className="text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-indigo-400 transition-colors">
        ScoreChart Pro
      </a>

      {/* Zone 2: clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          type="button"
          onClick={() => onNavigateTo('podium')}
          className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
        >
          Bục Vinh Quang
        </button>
        <button
          type="button"
          onClick={() => onNavigateTo('chart')}
          className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
        >
          Biểu Đồ Cột
        </button>
        <button
          type="button"
          onClick={() => onNavigateTo('table')}
          className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
        >
          Danh Sách Chi Tiết
        </button>
      </nav>

      {/* Zone 3: 1 primary action cluster */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
          className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-700/60"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        <button
          onClick={() => {
            soundEffects.playTriumph();
            onCelebration();
          }}
          title="Bắn pháo hoa chúc mừng Quán Quân"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tôn Vinh Top 1</span>
        </button>

      </div>
    </header>
  );
};
