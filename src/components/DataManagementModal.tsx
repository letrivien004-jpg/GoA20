import React, { useState, useEffect } from 'react';
import { X, Code, FileText, Sparkles, Download, Check, AlertCircle, Radio } from 'lucide-react';
import { LeaderboardDataset, LeaderboardMember } from '../types/leaderboard';
import { PRESET_DATASETS } from '../data/presets';
import { fetchDatabaseDataset } from '../utils/database';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDataset: LeaderboardDataset;
  onApplyDataset: (dataset: LeaderboardDataset) => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  currentDataset,
  onApplyDataset,
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'csv' | 'presets'>('json');
  const [totalParticipants, setTotalParticipants] = useState<number>(currentDataset.totalMembers);
  const [maxScore, setMaxScore] = useState<number>(currentDataset.maxPossibleScore || 300);
  const [title, setTitle] = useState<string>(currentDataset.title);
  const [jsonText, setJsonText] = useState<string>('');
  const [csvText, setCsvText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFetchingDatabase, setIsFetchingDatabase] = useState<boolean>(false);

  const handleLoadFromGoogleSheet = async () => {
    try {
      setIsFetchingDatabase(true);
      setJsonError(null);
      onApplyDataset(await fetchDatabaseDataset());
      onClose();
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Không thể đọc Google Sheets.');
    } finally {
      setIsFetchingDatabase(false);
    }
  };

  // Sync state when opened or currentDataset changes
  useEffect(() => {
    if (isOpen) {
      setTitle(currentDataset.title);
      setTotalParticipants(currentDataset.totalMembers);
      setMaxScore(currentDataset.maxPossibleScore || 300);

      // Sort descending to get topLeader & runnerUp
      const sorted = [...currentDataset.items].sort((a, b) => b.score - a.score);
      const top1 = sorted[0];
      const top2 = sorted[1];

      // Exact user standard schema:
      // [ { totalParticipants, topLeader, runnerUp, leaderboard: [ { name, score } ] } ]
      const standardExport = [
        {
          totalParticipants: currentDataset.totalMembers,
          topLeader: top1 ? { name: top1.name, score: top1.score } : undefined,
          runnerUp: top2 ? { name: top2.name, score: top2.score } : undefined,
          leaderboard: currentDataset.items.map((i) => ({
            name: i.name,
            score: i.score,
            ...(i.department ? { department: i.department } : {}),
          })),
        },
      ];
      setJsonText(JSON.stringify(standardExport, null, 2));

      // Prepare clean CSV representation
      const csvLines = [
        'name,score,department',
        ...currentDataset.items.map(
          (i) => `"${i.name.replace(/"/g, '""')}",${i.score},"${(i.department || '').replace(/"/g, '""')}"`
        ),
      ];
      setCsvText(csvLines.join('\n'));
      setJsonError(null);
    }
  }, [isOpen, currentDataset]);

  if (!isOpen) return null;

  // Handle JSON application
  const handleApplyJson = () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(jsonText);

      let rawItems: Array<{ name: string; score: number; department?: string }> = [];
      let parsedTotal = totalParticipants;
      let parsedTitle = title;

      // Case 1: Array of objects
      if (Array.isArray(parsed)) {
        if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
          // Check if it's the user's standard wrapper: [ { totalParticipants, leaderboard: [...] } ]
          if (Array.isArray(parsed[0].leaderboard)) {
            rawItems = parsed[0].leaderboard;
            if (typeof parsed[0].totalParticipants === 'number' && parsed[0].totalParticipants > 0) {
              parsedTotal = parsed[0].totalParticipants;
            }
          } else if (Array.isArray(parsed[0].data)) {
            rawItems = parsed[0].data;
            if (typeof parsed[0].totalParticipants === 'number') {
              parsedTotal = parsed[0].totalParticipants;
            }
          } else {
            // It's a direct array of members: [ { name, score } ]
            rawItems = parsed;
          }
        }
      }
      // Case 2: Single object wrapper: { totalParticipants, leaderboard: [...] }
      else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.leaderboard)) {
          rawItems = parsed.leaderboard;
        } else if (Array.isArray(parsed.data)) {
          rawItems = parsed.data;
        } else if (Array.isArray(parsed.items)) {
          rawItems = parsed.items;
        } else {
          throw new Error('Dữ liệu JSON cần chứa mảng "leaderboard" hoặc mảng các đối tượng [{ name, score }]');
        }

        if (typeof parsed.totalParticipants === 'number' && parsed.totalParticipants > 0) {
          parsedTotal = parsed.totalParticipants;
        } else if (typeof parsed.totalMembers === 'number' && parsed.totalMembers > 0) {
          parsedTotal = parsed.totalMembers;
        }

        if (typeof parsed.title === 'string' && parsed.title.trim()) {
          parsedTitle = parsed.title.trim();
        }
      }

      if (rawItems.length === 0) {
        throw new Error('Mảng dữ liệu không chứa thành viên nào.');
      }

      // Convert items to LeaderboardMember
      const formattedItems: LeaderboardMember[] = rawItems.map((item, index) => {
        if (!item.name) {
          throw new Error(`Thành viên thứ ${index + 1} thiếu trường 'name'`);
        }
        const numericScore = typeof item.score === 'number' ? item.score : parseFloat(String(item.score));
        if (isNaN(numericScore)) {
          throw new Error(`Thành viên '${item.name}' có điểm không hợp lệ: ${item.score}`);
        }

        return {
          id: `member-${Date.now()}-${index}`,
          name: String(item.name).trim(),
          score: numericScore,
          department: item.department ? String(item.department).trim() : undefined,
        };
      });

      // Total members should be at least equal to submitted items count
      const finalTotal = Math.max(parsedTotal, formattedItems.length);

      onApplyDataset({
        id: `dataset-${Date.now()}`,
        title: parsedTitle || 'Bảng Xếp Hạng Cuộc Thi Điểm',
        subtitle: `Thang điểm chuẩn tối đa: ${maxScore} điểm · ${finalTotal} thành viên tham gia`,
        category: 'Bảng Điểm Thi Đấu',
        totalMembers: finalTotal,
        maxPossibleScore: maxScore || 300,
        items: formattedItems,
      });

      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setJsonError(err.message);
      } else {
        setJsonError('Định dạng JSON không hợp lệ.');
      }
    }
  };

  // Handle CSV application
  const handleApplyCsv = () => {
    try {
      setJsonError(null);
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('Dữ liệu CSV cần có ít nhất dòng tiêu đề và 1 dòng dữ liệu (name,score).');
      }

      const startIdx = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('score') ? 1 : 0;
      const formattedItems: LeaderboardMember[] = [];

      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((p) => p.replace(/^"|"$/g, '').trim());
        const nameVal = parts[0];
        const scoreVal = parseFloat(parts[1]);

        if (nameVal && !isNaN(scoreVal)) {
          formattedItems.push({
            id: `csv-${Date.now()}-${i}`,
            name: nameVal,
            score: scoreVal,
            department: parts[2] || undefined,
          });
        }
      }

      if (formattedItems.length === 0) {
        throw new Error('Không phân tích được dòng dữ liệu hợp lệ nào.');
      }

      const finalTotal = Math.max(totalParticipants, formattedItems.length);

      onApplyDataset({
        id: `csv-dataset-${Date.now()}`,
        title: title || 'Bảng Xếp Hạng CSV',
        subtitle: `Thang điểm chuẩn: ${maxScore} điểm · ${finalTotal} thành viên`,
        category: 'Nhập từ CSV',
        totalMembers: finalTotal,
        maxPossibleScore: maxScore || 300,
        items: formattedItems,
      });

      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setJsonError(err.message);
      } else {
        setJsonError('Lỗi phân tích CSV.');
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Quản Lý & Truyền Dữ Liệu Bảng Xếp Hạng</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chuẩn dữ liệu: <code className="text-amber-400">totalParticipants</code>, <code className="text-indigo-400">leaderboard: [&#123; name, score &#125;]</code> (Max điểm là 300)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'json'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Nhập / Sửa JSON Chuẩn</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'csv'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Nhập / Dán CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Mẫu Sẵn Có (Presets)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* General Inputs: Title, Total Participants & Max Score */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3 border-b border-slate-800/80">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tiêu đề bảng:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                placeholder="Tiêu đề..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tổng thành viên (totalParticipants):
              </label>
              <input
                type="number"
                min="1"
                value={totalParticipants}
                onChange={(e) => setTotalParticipants(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-amber-400 mb-1">
                Max điểm chuẩn (Max 300):
              </label>
              <input
                type="number"
                min="1"
                value={maxScore}
                onChange={(e) => setMaxScore(Math.max(1, parseInt(e.target.value) || 300))}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-slate-950 border border-amber-500/50 rounded-lg text-amber-300 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* JSON Tab */}
          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span>Dán đúng chuẩn cấu trúc JSON gồm <code className="text-indigo-300">totalParticipants</code> và <code className="text-emerald-300">leaderboard: [&#123; name, score &#125;]</code>:</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleLoadFromGoogleSheet}
                    disabled={isFetchingDatabase}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-2.5 py-1 rounded-md border border-cyan-800 transition-colors"
                  >
                    <Radio className={`w-3 h-3 ${isFetchingDatabase ? 'animate-pulse' : ''}`} />
                    <span>{isFetchingDatabase ? 'Đang đọc...' : 'Đồng bộ Google Sheets A:B'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3" />}
                    <span>{copied ? 'Đã sao chép!' : 'Sao chép JSON'}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setJsonError(null);
                }}
                rows={12}
                className="w-full p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 selection:bg-indigo-900"
                spellCheck={false}
              />
            </div>
          )}

          {/* CSV Tab */}
          {activeTab === 'csv' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Dán hoặc chỉnh sửa dữ liệu dạng CSV (dòng 1: name,score):
              </div>
              <textarea
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  setJsonError(null);
                }}
                rows={12}
                className="w-full p-3 bg-slate-950 text-amber-300 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                spellCheck={false}
              />
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_DATASETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    onApplyDataset(preset);
                    onClose();
                  }}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/80 hover:bg-slate-800/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                      {preset.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {preset.items.length}/{preset.totalMembers} thành viên
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {preset.subtitle}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-500">
                    <span>Thang chuẩn: <strong className="text-amber-400 font-mono">{preset.maxPossibleScore} đ</strong></span>
                    <span className="text-indigo-400 font-medium group-hover:underline">Bấm để nạp dữ liệu →</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error Message banner */}
          {jsonError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{jsonError}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Hủy bỏ
          </button>

          <div className="flex items-center gap-3">
            {activeTab === 'json' && (
              <button
                type="button"
                onClick={handleApplyJson}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
              >
                Áp Dụng Dữ Liệu JSON
              </button>
            )}

            {activeTab === 'csv' && (
              <button
                type="button"
                onClick={handleApplyCsv}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
              >
                Áp Dụng Dữ Liệu CSV
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
