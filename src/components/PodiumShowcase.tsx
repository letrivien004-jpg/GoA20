import React from 'react';
import { Crown, Medal, Award, Flame } from 'lucide-react';
import { LeaderboardMember } from '../types/leaderboard';
import { PODIUM_COLORS, getInitials } from '../utils/colors';

interface PodiumShowcaseProps {
  topThree: LeaderboardMember[];
  onSelectMember?: (member: LeaderboardMember) => void;
}

export const PodiumShowcase: React.FC<PodiumShowcaseProps> = ({
  topThree,
  onSelectMember,
}) => {
  if (topThree.length === 0) return null;

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <section id="podium" className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 shadow-2xl overflow-hidden">
      {/* Ambient background glow behind podium */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Bục Vinh Quang Danh Dự</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Top 3 Cá Nhân Xuất Sắc Nhất
          </h2>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Dẫn đầu bảng xếp hạng
        </div>
      </div>

      {/* Podium Grid (Stepped visual: 2nd - 1st - 3rd) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-2xl mx-auto pt-6 pb-2 relative z-10">
        {/* RANK 2 - BẠC (Left Column) */}
        {second ? (
          <div
            onClick={() => onSelectMember && onSelectMember(second)}
            className="flex flex-col items-center cursor-pointer group transition-transform hover:-translate-y-1"
          >
            {/* Avatar & Rank badge */}
            <div className="relative mb-3 flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 font-bold flex items-center justify-center text-lg sm:text-xl shadow-lg ring-2 ring-slate-300/80 group-hover:scale-105 transition-all">
                {getInitials(second.name)}
              </div>
              <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-slate-200 text-slate-900 text-xs font-black shadow-md flex items-center gap-1 border border-white">
                <Medal className="w-3 h-3 text-slate-700" />
                <span>#2</span>
              </div>
            </div>

            <span className="font-semibold text-xs sm:text-sm text-slate-200 text-center line-clamp-1 max-w-[120px] mb-1">
              {second.name}
            </span>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-300 tabular-nums mb-2">
              {second.score} <span className="text-[11px] font-normal text-slate-400">điểm</span>
            </div>

            {/* Pedestal Column */}
            <div
              style={{ background: PODIUM_COLORS.second.barGradient }}
              className="w-full h-32 sm:h-40 rounded-t-xl flex flex-col items-center justify-start pt-3 shadow-lg border-t border-x border-slate-300/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-slate-900 font-black text-2xl sm:text-3xl font-mono tracking-wider opacity-90">
                2
              </span>
              <span className="text-slate-800 text-[11px] font-semibold uppercase tracking-wider mt-0.5">
                Á Quân
              </span>
            </div>
          </div>
        ) : (
          <div className="h-32 rounded-t-xl bg-slate-900/40 border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-600">
            Chưa có hạng 2
          </div>
        )}

        {/* RANK 1 - VÀNG (Center Column - Tallest) */}
        {first ? (
          <div
            onClick={() => onSelectMember && onSelectMember(first)}
            className="flex flex-col items-center cursor-pointer group transition-transform hover:-translate-y-1.5"
          >
            {/* Crown & Golden Avatar */}
            <div className="relative mb-3 flex flex-col items-center">
              <div className="absolute -top-7 text-amber-400 animate-bounce">
                <Crown className="w-7 h-7 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)] fill-amber-400" />
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-slate-950 font-black flex items-center justify-center text-xl sm:text-2xl shadow-xl shadow-amber-500/25 ring-4 ring-amber-400/90 group-hover:scale-105 transition-all">
                {getInitials(first.name)}
              </div>
              <div className="absolute -bottom-2.5 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-lg flex items-center gap-1 border border-yellow-200">
                <Award className="w-3.5 h-3.5 text-slate-950" />
                <span>TOP 1</span>
              </div>
            </div>

            <span className="font-bold text-sm sm:text-base text-amber-200 text-center line-clamp-1 max-w-[140px] mb-1">
              {first.name}
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-amber-300 tabular-nums mb-2">
              {first.score} <span className="text-xs font-normal text-amber-400/80">điểm</span>
            </div>

            {/* Pedestal Column */}
            <div
              style={{ background: PODIUM_COLORS.first.barGradient }}
              className="w-full h-44 sm:h-52 rounded-t-xl flex flex-col items-center justify-start pt-4 shadow-2xl shadow-amber-500/20 border-t border-x border-amber-300/80 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/15 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-slate-950 font-black text-3xl sm:text-4xl font-mono tracking-wider opacity-95">
                1
              </span>
              <span className="text-amber-950 text-xs font-extrabold uppercase tracking-wider mt-1">
                Quán Quân
              </span>
            </div>
          </div>
        ) : (
          <div className="h-44 rounded-t-xl bg-slate-900/40 border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-600">
            Chưa có hạng 1
          </div>
        )}

        {/* RANK 3 - ĐỒNG (Right Column) */}
        {third ? (
          <div
            onClick={() => onSelectMember && onSelectMember(third)}
            className="flex flex-col items-center cursor-pointer group transition-transform hover:-translate-y-1"
          >
            {/* Avatar & Rank badge */}
            <div className="relative mb-3 flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold flex items-center justify-center text-lg sm:text-xl shadow-lg ring-2 ring-amber-600/80 group-hover:scale-105 transition-all">
                {getInitials(third.name)}
              </div>
              <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-amber-700 text-white text-xs font-black shadow-md flex items-center gap-1 border border-amber-500">
                <Medal className="w-3 h-3 text-amber-300" />
                <span>#3</span>
              </div>
            </div>

            <span className="font-semibold text-xs sm:text-sm text-slate-200 text-center line-clamp-1 max-w-[120px] mb-1">
              {third.name}
            </span>
            <div className="text-sm sm:text-base font-bold font-mono text-amber-500 tabular-nums mb-2">
              {third.score} <span className="text-[11px] font-normal text-slate-400">điểm</span>
            </div>

            {/* Pedestal Column */}
            <div
              style={{ background: PODIUM_COLORS.third.barGradient }}
              className="w-full h-24 sm:h-32 rounded-t-xl flex flex-col items-center justify-start pt-3 shadow-lg border-t border-x border-amber-600/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-white font-black text-2xl sm:text-3xl font-mono tracking-wider opacity-90">
                3
              </span>
              <span className="text-amber-100 text-[11px] font-semibold uppercase tracking-wider mt-0.5">
                Hạng Ba
              </span>
            </div>
          </div>
        ) : (
          <div className="h-24 rounded-t-xl bg-slate-900/40 border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-600">
            Chưa có hạng 3
          </div>
        )}
      </div>

      {/* Floor reflection line */}
      <div className="h-2 max-w-2xl mx-auto rounded-full bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-80" />
    </section>
  );
};
