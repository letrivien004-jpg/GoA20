export interface LeaderboardMember {
  id: string;
  name: string;
  score: number;
  avatarColor?: string;
  department?: string;
  notes?: string;
}

export type ViewMode = 'columns' | 'podium-columns' | 'horizontal-bars' | 'table';

export type SortOrder = 'score-desc' | 'score-asc' | 'name-asc' | 'name-desc';

export type ScoreTierFilter = 'all' | 'tier-excellent' | 'tier-good' | 'tier-average' | 'tier-below';

export interface LeaderboardDataset {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  totalMembers: number; // Tổng số thành viên tham gia (totalParticipants)
  maxPossibleScore: number; // Max điểm là 300
  items: LeaderboardMember[];
}

export interface LeaderboardStats {
  totalMembers: number;
  submittedCount: number;
  completionRate: number;
  highestScore: number;
  highestScorerName: string;
  averageScore: number;
  medianScore: number;
  lowestScore: number;
}

// Chuẩn dữ liệu theo format do người dùng cung cấp
export interface UserPayloadItem {
  totalParticipants: number;
  topLeader?: {
    name: string;
    score: number;
  };
  runnerUp?: {
    name: string;
    score: number;
  };
  leaderboard: Array<{
    name: string;
    score: number;
  }>;
}
