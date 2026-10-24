/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useCallback, useRef, useDeferredValue } from 'react';
import {
  Search,
  BarChart2,
  Trophy,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import { LeaderboardDataset, ViewMode, SortOrder, ScoreTierFilter } from './types/leaderboard';
import { PRESET_DATASETS } from './data/presets';
import { calculateLeaderboardStats } from './utils/stats';
import { fireConfettiBurst } from './utils/confetti';
import { soundEffects } from './utils/audio';
import { fetchLeaderboardFromWebhook } from './utils/api';

import { Header } from './components/Header';
import { PodiumShowcase } from './components/PodiumShowcase';
import { ColumnLeaderboard } from './components/ColumnLeaderboard';
import { HorizontalBarsLeaderboard } from './components/HorizontalBarsLeaderboard';
import { TableLeaderboard } from './components/TableLeaderboard';

function datasetsMatch(first: LeaderboardDataset, second: LeaderboardDataset) {
  if (
    first.title !== second.title ||
    first.subtitle !== second.subtitle ||
    first.category !== second.category ||
    first.totalMembers !== second.totalMembers ||
    first.maxPossibleScore !== second.maxPossibleScore ||
    first.items.length !== second.items.length
  ) {
    return false;
  }

  return first.items.every((item, index) => {
    const nextItem = second.items[index];
    return (
      item.id === nextItem.id &&
      item.name === nextItem.name &&
      item.score === nextItem.score &&
      item.avatarColor === nextItem.avatarColor &&
      item.department === nextItem.department &&
      item.notes === nextItem.notes
    );
  });
}

const CACHE_KEY = 'SCORECHART_PRO_LAST_DATA';
const SYNC_INTERVAL = Number(import.meta.env.VITE_SYNC_INTERVAL) || 30000;

function readCachedDataset(): LeaderboardDataset | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as LeaderboardDataset;
    if (
      typeof parsed?.title !== 'string' ||
      !Array.isArray(parsed.items) ||
      typeof parsed.totalMembers !== 'number' ||
      typeof parsed.maxPossibleScore !== 'number'
    ) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('Không thể đọc cache bảng xếp hạng:', error);
    return null;
  }
}

export default function App() {
  // Current Dataset state: initial is the Algorithmic Hackathon preset
  const [dataset, setDataset] = useState<LeaderboardDataset>(() => readCachedDataset() || PRESET_DATASETS[0]);

  // View & Filter states
  const [viewMode, setViewMode] = useState<ViewMode>('podium-columns');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortOrder, setSortOrder] = useState<SortOrder>('score-desc');
  const [tierFilter, setTierFilter] = useState<ScoreTierFilter>('all');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Webhook sync states
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const syncInFlight = useRef(false);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Cache giữ bản thành công gần nhất và luôn bị ghi đè bởi dataset mới.
  const replaceDataset = useCallback((nextDataset: LeaderboardDataset) => {
    setDataset((currentDataset) =>
      datasetsMatch(currentDataset, nextDataset) ? currentDataset : nextDataset
    );

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(nextDataset));
    } catch (error) {
      console.warn('Không thể ghi cache bảng xếp hạng:', error);
    }
  }, []);

  // Hàm fetch() dữ liệu từ endpoint Webhook
  const handleSyncWebhook = useCallback(async () => {
    if (syncInFlight.current) return;
    syncInFlight.current = true;
    setIsSyncing(true);
    setSyncStatus('loading');
    try {
      const liveData = await fetchLeaderboardFromWebhook();
      replaceDataset(liveData);
      setSyncStatus('success');
      setLastSyncTime(new Date());
      setSyncError(null);
    } catch (err: any) {
      console.warn('Lỗi khi fetch webhook leaderboard:', err);
      setSyncStatus('error');
      setSyncError(err?.message || 'Không thể kết nối đến dịch vụ n8n. Dữ liệu cache gần nhất vẫn được giữ lại.');
    } finally {
      syncInFlight.current = false;
      setIsSyncing(false);
    }
  }, [replaceDataset]);

  // Tự động fetch dữ liệu ngay khi tải trang web
  useEffect(() => {
    handleSyncWebhook();
  }, [handleSyncWebhook]);

  // Tự động đồng bộ mỗi 10-30 giây nếu bật autoSync
  useEffect(() => {
    if (!autoSync) return;
    const interval = setInterval(() => {
      handleSyncWebhook();
    }, SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, [autoSync, handleSyncWebhook]);

  // Calculate high-level stats for the entire dataset
  const stats = useMemo(() => {
    return calculateLeaderboardStats(dataset.items, dataset.totalMembers);
  }, [dataset.items, dataset.totalMembers]);

  // Filter and sort items for display
  const processedItems = useMemo(() => {
    let result = [...dataset.items];

    // Filter by name search
    if (deferredSearchQuery.trim()) {
      const q = deferredSearchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.department && item.department.toLowerCase().includes(q))
      );
    }
    // Filter by score tier
    if (tierFilter !== 'all' && stats.highestScore > 0) {
      result = result.filter((item) => {
        const ratio = item.score / stats.highestScore;
        if (tierFilter === 'tier-excellent') return ratio >= 0.9;
        if (tierFilter === 'tier-good') return ratio >= 0.75 && ratio < 0.9;
        if (tierFilter === 'tier-average') return ratio >= 0.5 && ratio < 0.75;
        if (tierFilter === 'tier-below') return ratio < 0.5;
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOrder === 'score-desc') return b.score - a.score;
      if (sortOrder === 'score-asc') return a.score - b.score;
      if (sortOrder === 'name-asc') return a.name.localeCompare(b.name, 'vi');
      if (sortOrder === 'name-desc') return b.name.localeCompare(a.name, 'vi');
      return 0;
    });

    return result;
  }, [dataset.items, deferredSearchQuery, tierFilter, sortOrder, stats.highestScore]);

  // Top 3 always extracted from sorted descending for podium
  const topThree = useMemo(() => {
    const sorted = [...dataset.items].sort((a, b) => b.score - a.score);
    return sorted.slice(0, 3);
  }, [dataset.items]);

  const handleCelebration = () => {
    fireConfettiBurst('confetti-canvas');
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.enabled = next;
  };

  const handleNavigateTo = (section: 'podium' | 'chart' | 'table') => {
    const nextView = section === 'podium' ? 'podium-columns' : section === 'chart' ? 'columns' : 'table';
    const targetId = section === 'podium' ? 'podium' : section === 'chart' ? 'chart-columns' : 'data-table';
    setViewMode(nextView);

    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Fullscreen Canvas for Celebration Confetti */}
      <canvas
        id="confetti-canvas"
        className="fixed inset-0 pointer-events-none z-50"
      />

      {/* Top Bar Header */}
      <Header
        onCelebration={handleCelebration}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onNavigateTo={handleNavigateTo}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
              <span>{dataset.category || 'Bảng Xếp Hạng Điểm'}</span>
              <span aria-hidden="true">·</span>
              <span>Tổng {dataset.totalMembers} thành viên</span>
              <span aria-hidden="true">·</span>
              <span>Thang chuẩn: {dataset.maxPossibleScore || 300} điểm</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {dataset.title}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {dataset.subtitle || 'Hiển thị dữ liệu điểm số cá nhân và xếp hạng theo dạng cột đa sắc.'}
            </p>
          </div>
        </div>

        {/* Interactive View Mode & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800/80 overflow-x-auto">
            <button
              onClick={() => setViewMode('podium-columns')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                viewMode === 'podium-columns'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Bục + Cột Xếp Hạng</span>
            </button>

            <button
              onClick={() => setViewMode('columns')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                viewMode === 'columns'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Chỉ Biểu Đồ Cột</span>
            </button>

            <button
              onClick={() => setViewMode('horizontal-bars')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                viewMode === 'horizontal-bars'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Thanh Ngang</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Bảng Chi Tiết</span>
            </button>
          </div>

          {/* Search & Sort Controls */}
          {viewMode === 'table' && (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm theo tên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="score-desc">Điểm: Cao nhất trước</option>
                <option value="score-asc">Điểm: Thấp nhất trước</option>
                <option value="name-asc">Tên: A → Z</option>
                <option value="name-desc">Tên: Z → A</option>
              </select>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as ScoreTierFilter)}
                className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="all">Tất cả mức điểm</option>
                <option value="tier-excellent">Xuất sắc (≥90%)</option>
                <option value="tier-good">Giỏi (75% - 89%)</option>
                <option value="tier-average">Trung bình (50% - 74%)</option>
                <option value="tier-below">Dưới trung bình (&lt;50%)</option>
              </select>
            </div>
          )}
        </div>

        {/* 3. Active Main Content based on View Mode */}
        {viewMode === 'podium-columns' && (
          <div className="space-y-8">
            {/* Podium for top 3 */}
            <PodiumShowcase
              topThree={topThree}
              onSelectMember={(m) => {
                setSelectedMemberId(m.id);
                soundEffects.playPop();
              }}
            />

            {/* Bọc định danh barchart-section phục vụ chụp ảnh tự động */}
            <div id="barchart-section">
              <ColumnLeaderboard
                items={processedItems}
                totalMembers={dataset.totalMembers}
                maxReferenceScore={dataset.maxPossibleScore}
                selectedMemberId={selectedMemberId}
                onSelectMember={(m) => setSelectedMemberId(m.id)}
              />
            </div>
          </div>
        )}

        {viewMode === 'columns' && (
          <div id="barchart-section">
            <ColumnLeaderboard
              items={processedItems}
              totalMembers={dataset.totalMembers}
              maxReferenceScore={dataset.maxPossibleScore}
              selectedMemberId={selectedMemberId}
              onSelectMember={(m) => setSelectedMemberId(m.id)}
            />
          </div>
        )}

        {viewMode === 'horizontal-bars' && (
          <HorizontalBarsLeaderboard
            items={processedItems}
            totalMembers={dataset.totalMembers}
            maxReferenceScore={dataset.maxPossibleScore}
            selectedMemberId={selectedMemberId}
            onSelectMember={(m) => setSelectedMemberId(m.id)}
          />
        )}

        {viewMode === 'table' && (
          <TableLeaderboard
            items={processedItems}
            totalMembers={dataset.totalMembers}
            maxScore={dataset.maxPossibleScore || 300}
          />
        )}

        {/* Additional Detailed Table view if in podium-columns mode for completeness */}
        {viewMode === 'podium-columns' && processedItems.length > 0 && (
          <TableLeaderboard
            items={processedItems}
            totalMembers={dataset.totalMembers}
            maxScore={dataset.maxPossibleScore || 300}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 bg-slate-900/60 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">ScoreChart Pro</span>
            <span>·</span>
            <span>Bảng Xếp Hạng Điểm Dạng Cột Trực Quan</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => {
                soundEffects.playTriumph();
                handleCelebration();
              }}
              className="hover:text-amber-300 transition-colors"
            >
              Pháo Hoa Top 1
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}