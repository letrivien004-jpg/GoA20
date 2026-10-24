import { LeaderboardDataset, LeaderboardMember } from '../types/leaderboard';

export const DATABASE_CONFIG = {
  googleSheetId: '1Xh8xWHQFb2yvXz36xu_Z-0rqzdfj1Er9L7OcRJld-us',
  googleSheetGid: '0',
  googleSheetUrl:
    import.meta.env.VITE_GOOGLE_SHEET_URL ||
    'https://docs.google.com/spreadsheets/d/1Xh8xWHQFb2yvXz36xu_Z-0rqzdfj1Er9L7OcRJld-us/edit?usp=sharing',
  cacheKey: 'SCORECHART_PRO_DATABASE',
  maxPossibleScore: Number(import.meta.env.VITE_MAX_SCORE) || 300,
  syncIntervalMs: 30000,
  requestTimeoutMs: 10000,
} as const;

export function getGoogleSheetCsvUrl(
  sheetUrl: string = DATABASE_CONFIG.googleSheetUrl,
  gid: string = DATABASE_CONFIG.googleSheetGid
): string {
  const match = sheetUrl.match(/\/spreadsheets\/d\/([^/]+)/);
  if (!match) {
    throw new Error('URL Google Sheets không hợp lệ.');
  }

  return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${encodeURIComponent(gid)}`;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      values.push(value.trim());
      value = '';
    } else {
      value += character;
    }
  }

  values.push(value.trim());
  return values;
}

export function parseGoogleSheetCsv(csv: string): LeaderboardMember[] {
  const lines = csv.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error('Google Sheets không có dữ liệu để hiển thị.');
  }

  const members = lines.slice(1).flatMap((line, index) => {
    const [name, scoreText] = parseCsvLine(line);
    const score = Number(scoreText);
    if (!name || !Number.isFinite(score)) {
      throw new Error(`Dòng ${index + 2} trong Google Sheets cần có Name và Score hợp lệ.`);
    }

    return [{
      id: `google-sheet-${index}-${name}`,
      name,
      score,
    }];
  });

  if (members.length === 0) {
    throw new Error('Google Sheets không có bản ghi hợp lệ.');
  }

  return members;
}

export function createDatabaseDataset(items: LeaderboardMember[]): LeaderboardDataset {
  return {
    id: `google-sheet-dataset-${Date.now()}`,
    title: 'Go A20',
    subtitle: `Đồng bộ từ Google Sheets · Chỉ đọc cột A (Name) và B (Score) · ${items.length} bản ghi`,
    category: 'Database Google Sheets',
    totalMembers: items.length,
    maxPossibleScore: DATABASE_CONFIG.maxPossibleScore,
    items,
  };
}

export async function fetchDatabaseDataset(
  sheetUrl: string = DATABASE_CONFIG.googleSheetUrl
): Promise<LeaderboardDataset> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), DATABASE_CONFIG.requestTimeoutMs);
  const csvUrl = `${getGoogleSheetCsvUrl(sheetUrl)}&_ts=${Date.now()}`;

  try {
    const response = await fetch(csvUrl, {
      cache: 'no-store',
      headers: { Accept: 'text/csv' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Không thể đọc Google Sheets (HTTP ${response.status}).`);
    }

    const dataset = createDatabaseDataset(parseGoogleSheetCsv(await response.text()));
    try {
      localStorage.setItem(DATABASE_CONFIG.cacheKey, JSON.stringify(dataset));
    } catch (error) {
      console.warn('Không thể lưu Database cache:', error);
    }
    return dataset;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Google Sheets không phản hồi sau ${DATABASE_CONFIG.requestTimeoutMs}ms.`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function readDatabaseCache(): LeaderboardDataset | null {
  try {
    const cached = localStorage.getItem(DATABASE_CONFIG.cacheKey);
    if (!cached) return null;
    const dataset = JSON.parse(cached) as LeaderboardDataset;
    return Array.isArray(dataset.items) && dataset.items.length > 0 ? dataset : null;
  } catch (error) {
    console.warn('Không thể đọc Database cache:', error);
    return null;
  }
}
