import React, { useState } from 'react';
import { Trophy, HelpCircle, BarChart3, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { LeaderboardMember } from '../types/leaderboard';
import { getColumnColorScheme, getInitials } from '../utils/colors';
import { soundEffects } from '../utils/audio';

interface ColumnLeaderboardProps {
  items: LeaderboardMember[]; // Already sorted and filtered as desired
  totalMembers: number; // Tổng số thành viên tham gia
  maxReferenceScore?: number; // Ví dụ 300 điểm
  selectedMemberId?: string | null;
  onSelectMember?: (member: LeaderboardMember) => void;
}

export const ColumnLeaderboard: React.FC<ColumnLeaderboardProps> = ({
  items,
  totalMembers,
  maxReferenceScore = 300,
  selectedMemberId,
  onSelectMember,
}) => {
  const [scaleMode, setScaleMode] = useState<'standard' | 'autofit'>('autofit');
  const [hoveredMember, setHoveredMember] = useState<{
    member: LeaderboardMember;
    rank: number;
    rect: DOMRect | null;
  } | null>(null);

  if (items.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center">
        <BarChart3 className="w-12 h-12 text-slate-600 mb-3" />
        <h3 className="text-lg font-semibold text-slate-300">Chưa có thành viên nào trong danh sách</h3>
        <p className="text-sm text-slate-500 max-w-md mt-1">
          Dữ liệu bảng xếp hạng hiện chưa có sẵn để hiển thị.
        </p>
      </div>
    );
  }

  // Calculate highest score in dataset to set scale
  const rawLeaderScore = Math.max(...items.map((i) => i.score), 1);
  const targetScale = scaleMode === 'standard' ? Math.max(maxReferenceScore, rawLeaderScore) : rawLeaderScore;
  const topOneScore = items[0]?.score ?? 0;

  // Grid tick markers: 5 divisions (100%, 75%, 50%, 25%, 0%)
  const gridTicks = [1, 0.75, 0.5, 0.25, 0];

  return (
    <section id="chart-columns" className="relative p-5 sm:p-7 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
      {/* Title & Legend & Scale Mode Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>Biểu Đồ Xếp Hạng Dạng Cột Đa Sắc</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Phổ Điểm Toàn Diện Theo Cột
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Thang chuẩn tối đa: <strong className="text-amber-400 font-mono">{maxReferenceScore} điểm</strong>
          </p>
        </div>

        {/* Scale Toggle & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Scale mode toggle buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                setScaleMode('standard');
                soundEffects.playPop();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                scaleMode === 'standard'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Hiển thị theo thang điểm tối đa chuẩn 300 điểm"
            >
              <Minimize2 className="w-3 h-3" />
              <span>Thang Chuẩn (Max {maxReferenceScore})</span>
            </button>

            <button
              onClick={() => {
                setScaleMode('autofit');
                soundEffects.playPop();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                scaleMode === 'autofit'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Phóng to tự động theo điểm cao nhất hiện tại để quan sát chi tiết"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Phóng To So Sánh (Max {rawLeaderScore})</span>
            </button>
          </div>

          {/* Legend dots */}
          <div className="hidden xl:flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Top 1 Vàng</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span>Top 2 Bạc</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <span>Top 3 Đồng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className="relative pt-6 pb-2">
        {/* Horizontal reference grid lines */}
        <div className="absolute inset-0 top-6 bottom-24 pointer-events-none flex flex-col justify-between z-0">
          {gridTicks.map((tickRatio, idx) => {
            const tickValue = Math.round(targetScale * tickRatio);
            return (
              <div key={idx} className="relative w-full flex items-center border-b border-slate-800/70">
                <span className="text-[10px] font-mono tabular-nums text-slate-500 select-none pr-2 bg-slate-900/90 shrink-0 min-w-8">
                  {tickValue} đ
                </span>
                <div className="w-full border-b border-dashed border-slate-800/50" />
              </div>
            );
          })}
        </div>

        {/* Columns Container (Horizontally scrollable for large datasets) */}
        <div className="relative z-10 overflow-x-auto pb-4 pt-10 scrollbar-thin">
          <div
            className="flex items-end gap-3 sm:gap-4 px-4 min-w-max h-[380px]"
            style={{ minHeight: '380px' }}
          >
            {items.map((item, index) => {
              const rank = index + 1;
              const colorScheme = getColumnColorScheme(rank);
              const isSelected = selectedMemberId === item.id;
              const isZero = item.score === 0;

              // Compute height percentage:
              // If zero score: minimum baseline bar of 5% with dashed border
              // If > 0 score: proportional height with minimum 10%
              const rawPercent = (item.score / targetScale) * 100;
              const heightPercent = isZero ? 5 : Math.max(10, Math.min(100, rawPercent));

              return (
                <div
                  key={item.id}
                  className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  style={{ width: items.length > 12 ? '54px' : '68px' }}
                  onClick={() => {
                    soundEffects.playPop();
                    onSelectMember && onSelectMember(item);
                  }}
                  onMouseEnter={(e) => {
                    soundEffects.playPop();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredMember({ member: item, rank, rect });
                  }}
                  onMouseLeave={() => setHoveredMember(null)}
                >
                  {/* Floating Score Tag & Rank Badge above Column */}
                  <div
                    className="flex flex-col items-center mb-2 transition-transform duration-200 group-hover:-translate-y-1"
                  >
                    {/* Rank pill */}
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full mb-1 shadow-sm transition-all ${
                        rank <= 3 ? colorScheme.badgeBg : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      #{rank}
                    </span>

                    {/* Numeric Score */}
                    <span
                      className={`font-mono text-xs sm:text-sm font-bold tabular-nums transition-colors ${
                        isZero
                          ? 'text-slate-500'
                          : rank === 1
                          ? 'text-amber-300'
                          : rank === 2
                          ? 'text-slate-200'
                          : rank === 3
                          ? 'text-amber-500'
                          : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {item.score}
                    </span>
                  </div>

                  {/* Vertical Column Bar */}
                  <div className="w-full flex justify-center items-end" style={{ height: '70%' }}>
                    <div
                      style={{
                        height: `${heightPercent}%`,
                        background: isZero
                          ? 'linear-gradient(180deg, rgba(51, 65, 85, 0.4) 0%, rgba(30, 41, 59, 0.6) 100%)'
                          : colorScheme.barGradient,
                        boxShadow: isSelected
                          ? `0 0 25px ${colorScheme.glowColor}`
                          : isZero
                          ? 'none'
                          : `0 4px 14px ${colorScheme.glowColor}`,
                      }}
                      className={`w-full rounded-t-xl transition-all duration-300 relative overflow-hidden group-hover:brightness-110 group-hover:scale-x-105 border-t border-x ${
                        isZero ? 'border-dashed border-slate-700' : colorScheme.barBorder
                      } ${isSelected ? 'ring-2 ring-white scale-105' : ''}`}
                    >
                      {/* Top shine highlight for non-zero scores */}
                      {!isZero && (
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-white/40 rounded-t-xl" />
                      )}

                      {/* Subtle vertical texture shimmer */}
                      {!isZero && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}

                      {/* In-bar Avatar initial if column is tall enough */}
                      {heightPercent >= 28 && (
                        <div className="absolute bottom-2 inset-x-0 flex justify-center">
                          <span className="w-6 h-6 rounded-full bg-slate-950/60 backdrop-blur-sm text-white text-[10px] font-bold flex items-center justify-center border border-white/20">
                            {getInitials(item.name)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name Label below the Column */}
                  <div className="mt-3 text-center w-full px-0.5">
                    <p
                      title={item.name}
                      className={`text-xs font-semibold truncate transition-colors ${
                        isSelected
                          ? 'text-white underline'
                          : isZero
                          ? 'text-slate-400 group-hover:text-slate-200'
                          : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {item.name}
                    </p>
                    {item.department ? (
                      <span className="text-[10px] text-slate-500 truncate block">
                        {item.department}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {item.score}/{maxReferenceScore} đ
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Detailed Tooltip on Hover */}
      {hoveredMember && (
        <div
          className="fixed z-50 pointer-events-none bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-xs backdrop-blur-md transition-opacity duration-150 animate-in fade-in"
          style={{
            left: hoveredMember.rect ? `${hoveredMember.rect.left + hoveredMember.rect.width / 2}px` : '50%',
            top: hoveredMember.rect ? `${Math.max(10, hoveredMember.rect.top - 130)}px` : '50%',
            transform: 'translateX(-50%)',
            minWidth: '220px',
          }}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 gap-3">
            <span className="font-bold text-white truncate max-w-[150px]">
              {hoveredMember.member.name}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                getColumnColorScheme(hoveredMember.rank).badgeBg
              }`}
            >
              Hạng #{hoveredMember.rank}
            </span>
          </div>

          <div className="mt-2 space-y-1.5 text-slate-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Điểm số đạt được:</span>
              <strong className="text-white font-mono tabular-nums text-sm">
                {hoveredMember.member.score} <span className="text-xs text-slate-400">/ {maxReferenceScore} đ</span>
              </strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">So với Quán quân:</span>
              <span className="font-mono tabular-nums text-amber-300">
                {hoveredMember.rank === 1
                  ? 'Quán quân dẫn đầu'
                  : `-${Number((topOneScore - hoveredMember.member.score).toFixed(1))} điểm`}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Tỉ lệ đạt tối đa:</span>
              <span className="font-mono tabular-nums text-indigo-300">
                {((hoveredMember.member.score / maxReferenceScore) * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center pt-1.5 border-t border-slate-800 text-[11px] text-slate-400">
              <span>Xếp hạng đoàn:</span>
              <span className="font-semibold text-slate-200">
                Hạng {hoveredMember.rank} trên tổng {totalMembers} thành viên
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Footer with Total Participant Notice */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>
            Tổng số người tham gia: <strong className="text-white font-mono">{totalMembers} thành viên</strong> · Điểm tối đa chuẩn: <strong className="text-amber-400 font-mono">{maxReferenceScore} điểm</strong>
          </span>
        </div>
        <div className="flex items-center gap-1 text-indigo-400 font-medium">
          <span>Bấm cột để chọn hoặc di chuột để xem chi tiết</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </section>
  );
};
