import { LeaderboardDataset } from '../types/leaderboard';

export const DEFAULT_USER_DATASET: LeaderboardDataset = {
  id: 'standard-user-dataset',
  title: 'Bảng Xếp Hạng Cuộc Thi Điểm',
  subtitle: 'Thang điểm chuẩn tối đa: 300 điểm · 8 thành viên tham gia',
  category: 'Bảng Điểm Thi Đấu',
  totalMembers: 8, // totalParticipants
  maxPossibleScore: 300, // Max điểm là 300
  items: [
    { id: 'u1', name: 'Viễn', score: 8 },
    { id: 'u2', name: 'Đăng', score: 3 },
    { id: 'u3', name: 'Hiền', score: 1 },
    { id: 'u4', name: 'Đức Anh', score: 0 },
    { id: 'u5', name: 'Nguyên', score: 0 },
    { id: 'u6', name: 'Huyền', score: 0 },
    { id: 'u7', name: 'Khang', score: 0 },
    { id: 'u8', name: 'Hương', score: 0 },
  ],
};

export const PRESET_DATASETS: LeaderboardDataset[] = [
  DEFAULT_USER_DATASET,
  {
    id: 'hackathon-algo',
    title: 'Giải Đấu Lập Trình Thuật Toán Hackathon 2026',
    subtitle: 'Thang điểm chuẩn: 300 điểm · Đua tranh thứ hạng theo thời gian thực',
    category: 'Công nghệ & Lập trình',
    totalMembers: 12,
    maxPossibleScore: 300,
    items: [
      { id: '1', name: 'Nguyễn Hoàng Nam', score: 285 },
      { id: '2', name: 'Trần Thị Mai Linh', score: 260 },
      { id: '3', name: 'Lê Quốc Bảo', score: 240 },
      { id: '4', name: 'Phạm Minh Tuấn', score: 215 },
      { id: '5', name: 'Đỗ Hải Đăng', score: 180 },
      { id: '6', name: 'Vũ Thảo Vy', score: 155 },
      { id: '7', name: 'Hoàng Gia Huy', score: 120 },
      { id: '8', name: 'Ngô Đức Trọng', score: 85 },
      { id: '9', name: 'Bùi Ánh Tuyết', score: 45 },
      { id: '10', name: 'Đinh Nhật Quang', score: 10 },
      { id: '11', name: 'Lâm Thanh Trúc', score: 0 },
      { id: '12', name: 'Trương Tuấn Kiệt', score: 0 },
    ],
  },
  {
    id: 'academic-olympiad',
    title: 'Kỳ Thi Đánh Giá Năng Lực Toán & Khoa Học',
    subtitle: 'Thang chuẩn 300 điểm · Tổng hợp kết quả toàn đoàn',
    category: 'Giáo dục & Học thuật',
    totalMembers: 10,
    maxPossibleScore: 300,
    items: [
      { id: 'a1', name: 'Nguyễn Hà My', score: 295 },
      { id: 'a2', name: 'Chu Đình Đạt', score: 275 },
      { id: 'a3', name: 'Vương Gia Phúc', score: 250 },
      { id: 'a4', name: 'Lý Thùy Tiên', score: 220 },
      { id: 'a5', name: 'Tạ Minh Khang', score: 190 },
      { id: 'a6', name: 'Phùng Hải Yến', score: 150 },
      { id: 'a7', name: 'Trịnh Bảo Trâm', score: 110 },
      { id: 'a8', name: 'Đặng Tuấn Tú', score: 70 },
      { id: 'a9', name: 'Cao Thiên An', score: 25 },
      { id: 'a10', name: 'Lê Phúc Thịnh', score: 0 },
    ],
  },
];
