import { LeaderboardDataset, LeaderboardMember } from '../types/leaderboard';

export const LEADERBOARD_WEBHOOK_URL =
  import.meta.env.VITE_N8N_API_URL ||
  import.meta.env.VITE_LEADERBOARD_API_URL ||
  'http://localhost:1234/webhook/leaderboard';

/**
 * Chuyển đổi dữ liệu nhận từ webhook sang đối tượng LeaderboardDataset chuẩn
 */
export function parseWebhookPayload(data: any): LeaderboardDataset {
  let rawItems: Array<{ name: string; score: number; department?: string }> = [];
  let totalParticipants = 8;
  let title = 'Bảng Xếp Hạng Cuộc Thi Điểm';

  // Trường hợp 1: Dữ liệu dạng mảng [ { totalParticipants, leaderboard: [...] } ] hoặc [ { name, score } ]
  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
      if (Array.isArray(data[0].leaderboard)) {
        rawItems = data[0].leaderboard;
        if (typeof data[0].totalParticipants === 'number' && data[0].totalParticipants > 0) {
          totalParticipants = data[0].totalParticipants;
        }
      } else if (Array.isArray(data[0].data)) {
        rawItems = data[0].data;
        if (typeof data[0].totalParticipants === 'number') {
          totalParticipants = data[0].totalParticipants;
        }
      } else {
        // Dạng mảng trực tiếp các thành viên: [ { name, score } ]
        rawItems = data;
      }
    }
  }
  // Trường hợp 2: Dữ liệu dạng Object { totalParticipants, leaderboard: [...] }
  else if (data && typeof data === 'object') {
    if (Array.isArray(data.leaderboard)) {
      rawItems = data.leaderboard;
    } else if (Array.isArray(data.data)) {
      rawItems = data.data;
    } else if (Array.isArray(data.items)) {
      rawItems = data.items;
    }
    if (typeof data.totalParticipants === 'number' && data.totalParticipants > 0) {
      totalParticipants = data.totalParticipants;
    } else if (typeof data.totalMembers === 'number' && data.totalMembers > 0) {
      totalParticipants = data.totalMembers;
    }
    if (typeof data.title === 'string' && data.title.trim()) {
      title = data.title.trim();
    }
  }

  if (!rawItems || rawItems.length === 0) {
    throw new Error('Dữ liệu webhook không có danh sách leaderboard hợp lệ');
  }

  const items: LeaderboardMember[] = rawItems.map((item, index) => ({
    id: `webhook-member-${index}-${item.name || index}`,
    name: String(item.name || `Thành viên ${index + 1}`).trim(),
    score: typeof item.score === 'number' ? item.score : parseFloat(String(item.score || 0)),
    department: item.department ? String(item.department).trim() : undefined,
  }));

  const finalTotal = Math.max(totalParticipants, items.length);

  return {
    id: `webhook-dataset-${Date.now()}`,
    title,
    subtitle: `Cập nhật trực tiếp từ Webhook (${totalParticipants} thành viên) · Thang chuẩn: 300 điểm`,
    category: 'Dữ Liệu Trực Tiếp (Live Webhook)',
    totalMembers: finalTotal,
    maxPossibleScore: 300,
    items,
  };
}

/**
 * Lệnh fetch() dữ liệu bảng xếp hạng từ link webhook: http://localhost:1234/webhook/leaderboard
 */
export async function fetchLeaderboardFromWebhook(
  url: string = LEADERBOARD_WEBHOOK_URL,
  timeoutMs = 5000
): Promise<LeaderboardDataset> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Lỗi máy chủ HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    return parseWebhookPayload(json);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Webhook timeout sau ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
