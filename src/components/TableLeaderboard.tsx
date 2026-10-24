import React from 'react';
import { LeaderboardMember } from '../types/leaderboard';
import { getColumnColorScheme, getInitials } from '../utils/colors';

interface TableLeaderboardProps {
  items: LeaderboardMember[];
  totalMembers: number;
  maxScore: number;
}

export const TableLeaderboard: React.FC<TableLeaderboardProps> = ({
  items,
  totalMembers,
  maxScore,
}) => {
  return (
    <div id="data-table" className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Bảng Danh Sách Điểm Chi Tiết</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dữ liệu dạng bảng của từng thành viên với tỉ lệ % và thao tác quản lý
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Tổng {items.length} / {totalMembers} thành viên
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800 tracking-wider">
            <tr>
              <th className="py-3 px-4 w-16">Thứ Hạng</th>
              <th className="py-3 px-4">Thành Viên (Name)</th>
              <th className="py-3 px-4 text-right">Điểm Số (Score)</th>
              <th className="py-3 px-4 hidden md:table-cell">% Điểm Tối Đa</th>
              <th className="py-3 px-4 hidden sm:table-cell">Xếp Hạng Đoàn</th>
              <th className="py-3 px-4 text-right w-24">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {items.map((item, idx) => {
              const rank = idx + 1;
              const scheme = getColumnColorScheme(rank);
              const percent = Math.round((item.score / maxScore) * 100);

              return (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-black ${
                        rank <= 3 ? scheme.badgeBg : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {rank}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center shrink-0 border border-slate-700">
                        {getInitials(item.name)}
                      </span>
                      <div>
                        <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {item.name}
                        </div>
                        {item.department && (
                          <div className="text-[11px] text-slate-500">{item.department}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="font-mono font-bold text-base text-white tabular-nums">
                      {item.score}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">đ</span>
                  </td>

                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          style={{
                            width: `${Math.min(100, percent)}%`,
                            background: scheme.barGradient,
                          }}
                          className="h-full rounded-full"
                        />
                      </div>
                      <span className="text-xs font-mono tabular-nums text-slate-400">{percent}%</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 hidden sm:table-cell text-xs text-slate-400">
                    Top {Math.max(1, Math.round((rank / totalMembers) * 100))}% ({rank}/{totalMembers})
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
