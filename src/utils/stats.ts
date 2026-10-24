import { LeaderboardMember, LeaderboardStats } from '../types/leaderboard';

export function calculateLeaderboardStats(
  items: LeaderboardMember[],
  totalMembers: number
): LeaderboardStats {
  const safeTotal = Math.max(totalMembers, items.length, 1);
  const submittedCount = items.length;
  const completionRate = Math.min(100, Math.round((submittedCount / safeTotal) * 100));

  if (items.length === 0) {
    return {
      totalMembers: safeTotal,
      submittedCount: 0,
      completionRate: 0,
      highestScore: 0,
      highestScorerName: 'Chưa có dữ liệu',
      averageScore: 0,
      medianScore: 0,
      lowestScore: 0,
    };
  }

  // Sort descending by score for calculations
  const sorted = [...items].sort((a, b) => b.score - a.score);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];

  const sum = sorted.reduce((acc, curr) => acc + curr.score, 0);
  const average = Number((sum / sorted.length).toFixed(1));

  // Median calculation
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 !== 0
      ? sorted[mid].score
      : Number(((sorted[mid - 1].score + sorted[mid].score) / 2).toFixed(1));

  return {
    totalMembers: safeTotal,
    submittedCount,
    completionRate,
    highestScore: highest.score,
    highestScorerName: highest.name,
    averageScore: average,
    medianScore: median,
    lowestScore: lowest.score,
  };
}
