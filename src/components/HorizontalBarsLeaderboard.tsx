import React from 'react';
import { LeaderboardMember } from '../types/leaderboard';
import { getColumnColorScheme, getInitials } from '../utils/colors';

interface HorizontalBarsLeaderboardProps {
  items: LeaderboardMember[];
  totalMembers: number;
  maxReferenceScore?: number;
  selectedMemberId?: string | null;
  onSelectMember?: (member: LeaderboardMember) => void;
}

export const HorizontalBarsLeaderboard: React.FC<HorizontalBarsLeaderboardProps> = ({
  items,
  totalMembers,
  maxReferenceScore,
  selectedMemberId,
  onSelectMember,
}) => {
  const rawMax = Math.max(...items.map((i) => i.score), 10);
  const maxScore = maxReferenceScore && maxReferenceScore > rawMax ? maxReferenceScore : rawMax;

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-lg font-bold text-white">Bảng Xếp Hạng Dạng Thanh Ngang</h3>
        <span className="text-xs text-slate-400 font-mono">
          {items.length}/{totalMembers} thành viên
        </span>
      </div>

      <div className="space-y-2.5">
        {items.map((item, index) => {
          const rank = index + 1;
          const scheme = getColumnColorScheme(rank);
          const widthPercent = Math.max(8, Math.min(100, (item.score / maxScore) * 100));
          const isSelected = selectedMemberId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => onSelectMember && onSelectMember(item)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-slate-800/90 border-indigo-500/80 ring-1 ring-indigo-500'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-md font-mono text-xs font-black flex items-center justify-center shrink-0 ${
                      rank <= 3 ? scheme.badgeBg : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {rank}
                  </span>

                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {getInitials(item.name)}
                  </span>

                  <span className="font-semibold text-slate-200 text-sm truncate max-w-[180px] sm:max-w-xs">
                    {item.name}
                  </span>
                  {item.department && (
                    <span className="hidden sm:inline text-[11px] text-slate-500">
                      ({item.department})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-white tabular-nums">
                    {item.score}
                  </span>
                  <span className="text-[10px] text-slate-400">điểm</span>
                </div>
              </div>

              {/* Bar track */}
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  style={{
                    width: `${widthPercent}%`,
                    background: scheme.barGradient,
                  }}
                  className="h-full rounded-full transition-all duration-500 shadow-sm"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
