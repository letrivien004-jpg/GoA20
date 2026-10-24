/**
 * Vibrant and harmonious color system for the Column Leaderboard
 */

export interface ColorScheme {
  id: string;
  name: string;
  barGradient: string; // CSS gradient class or style
  barBorder: string;
  glowColor: string;
  badgeBg: string;
  textColor: string;
  avatarBg: string;
  hex: string;
}

// Special palettes for podium positions
export const PODIUM_COLORS = {
  first: {
    title: 'Hạng Nhất (Vàng)',
    gradient: 'from-amber-400 via-yellow-400 to-amber-600',
    barGradient: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 50%, #B45309 100%)',
    border: 'border-amber-400/60',
    glow: 'rgba(245, 158, 11, 0.45)',
    accent: '#F59E0B',
    badge: 'bg-amber-400 text-slate-950',
    ring: 'ring-amber-400',
    text: 'text-amber-300',
    rankText: 'text-amber-950 font-extrabold',
    label: '1st',
  },
  second: {
    title: 'Hạng Nhì (Bạc)',
    gradient: 'from-slate-200 via-zinc-300 to-slate-400',
    barGradient: 'linear-gradient(180deg, #E2E8F0 0%, #CBD5E1 50%, #64748B 100%)',
    border: 'border-slate-300/60',
    glow: 'rgba(203, 213, 225, 0.35)',
    accent: '#CBD5E1',
    badge: 'bg-slate-200 text-slate-900',
    ring: 'ring-slate-300',
    text: 'text-slate-200',
    rankText: 'text-slate-900 font-extrabold',
    label: '2nd',
  },
  third: {
    title: 'Hạng Ba (Đồng)',
    gradient: 'from-amber-600 via-orange-600 to-amber-800',
    barGradient: 'linear-gradient(180deg, #D97706 0%, #B45309 50%, #78350F 100%)',
    border: 'border-amber-600/60',
    glow: 'rgba(217, 119, 6, 0.35)',
    accent: '#D97706',
    badge: 'bg-amber-600 text-white',
    ring: 'ring-amber-600',
    text: 'text-amber-500',
    rankText: 'text-white font-extrabold',
    label: '3rd',
  },
};

// Rich vibrant rotating palettes for columns
export const VIBRANT_COLUMN_PALETTES: ColorScheme[] = [
  {
    id: 'emerald',
    name: 'Ngọc Lục Bảo',
    barGradient: 'linear-gradient(180deg, #34D399 0%, #10B981 50%, #047857 100%)',
    barBorder: 'border-emerald-400/50',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    badgeBg: 'bg-emerald-500 text-white',
    textColor: 'text-emerald-400',
    avatarBg: 'bg-emerald-600 text-white',
    hex: '#10B981',
  },
  {
    id: 'cyan',
    name: 'Xanh Lam Cyan',
    barGradient: 'linear-gradient(180deg, #22D3EE 0%, #06B6D4 50%, #0E7490 100%)',
    barBorder: 'border-cyan-400/50',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    badgeBg: 'bg-cyan-500 text-slate-950',
    textColor: 'text-cyan-400',
    avatarBg: 'bg-cyan-600 text-white',
    hex: '#06B6D4',
  },
  {
    id: 'indigo',
    name: 'Chàm Indigo',
    barGradient: 'linear-gradient(180deg, #818CF8 0%, #6366F1 50%, #4338CA 100%)',
    barBorder: 'border-indigo-400/50',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    badgeBg: 'bg-indigo-500 text-white',
    textColor: 'text-indigo-400',
    avatarBg: 'bg-indigo-600 text-white',
    hex: '#6366F1',
  },
  {
    id: 'violet',
    name: 'Tím Violet',
    barGradient: 'linear-gradient(180deg, #A78BFA 0%, #8B5CF6 50%, #6D28D9 100%)',
    barBorder: 'border-violet-400/50',
    glowColor: 'rgba(139, 92, 246, 0.35)',
    badgeBg: 'bg-violet-500 text-white',
    textColor: 'text-violet-400',
    avatarBg: 'bg-violet-600 text-white',
    hex: '#8B5CF6',
  },
  {
    id: 'fuchsia',
    name: 'Hồng Fuchsia',
    barGradient: 'linear-gradient(180deg, #E879F9 0%, #D946EF 50%, #A21CAF 100%)',
    barBorder: 'border-fuchsia-400/50',
    glowColor: 'rgba(217, 70, 239, 0.35)',
    badgeBg: 'bg-fuchsia-500 text-white',
    textColor: 'text-fuchsia-400',
    avatarBg: 'bg-fuchsia-600 text-white',
    hex: '#D946EF',
  },
  {
    id: 'rose',
    name: 'Đỏ Hồng Rose',
    barGradient: 'linear-gradient(180deg, #FB7185 0%, #F43F5E 50%, #BE123C 100%)',
    barBorder: 'border-rose-400/50',
    glowColor: 'rgba(244, 63, 94, 0.35)',
    badgeBg: 'bg-rose-500 text-white',
    textColor: 'text-rose-400',
    avatarBg: 'bg-rose-600 text-white',
    hex: '#F43F5E',
  },
  {
    id: 'orange',
    name: 'Cam Sunset',
    barGradient: 'linear-gradient(180deg, #FB923C 0%, #F97316 50%, #C2410C 100%)',
    barBorder: 'border-orange-400/50',
    glowColor: 'rgba(249, 115, 22, 0.35)',
    badgeBg: 'bg-orange-500 text-white',
    textColor: 'text-orange-400',
    avatarBg: 'bg-orange-600 text-white',
    hex: '#F97316',
  },
  {
    id: 'teal',
    name: 'Xanh Teal',
    barGradient: 'linear-gradient(180deg, #2DD4BF 0%, #14B8A6 50%, #0F766E 100%)',
    barBorder: 'border-teal-400/50',
    glowColor: 'rgba(20, 184, 166, 0.35)',
    badgeBg: 'bg-teal-500 text-slate-950',
    textColor: 'text-teal-400',
    avatarBg: 'bg-teal-600 text-white',
    hex: '#14B8A6',
  },
  {
    id: 'blue',
    name: 'Xanh Dương Royal',
    barGradient: 'linear-gradient(180deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)',
    barBorder: 'border-blue-400/50',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    badgeBg: 'bg-blue-500 text-white',
    textColor: 'text-blue-400',
    avatarBg: 'bg-blue-600 text-white',
    hex: '#3B82F6',
  },
  {
    id: 'lime',
    name: 'Xanh Chanh Lime',
    barGradient: 'linear-gradient(180deg, #A3E635 0%, #84CC16 50%, #4D7C0F 100%)',
    barBorder: 'border-lime-400/50',
    glowColor: 'rgba(132, 204, 22, 0.35)',
    badgeBg: 'bg-lime-500 text-slate-950',
    textColor: 'text-lime-400',
    avatarBg: 'bg-lime-600 text-slate-950',
    hex: '#84CC16',
  },
];

/**
 * Returns a scheme based on rank (1, 2, 3 special podium colors, or vibrant cycles for others)
 */
export function getColumnColorScheme(rank: number): ColorScheme {
  if (rank === 1) {
    return {
      id: 'gold',
      name: 'Vàng Quán Quân',
      barGradient: PODIUM_COLORS.first.barGradient,
      barBorder: 'border-amber-400/70',
      glowColor: PODIUM_COLORS.first.glow,
      badgeBg: PODIUM_COLORS.first.badge,
      textColor: PODIUM_COLORS.first.text,
      avatarBg: 'bg-amber-500 text-slate-950 font-bold',
      hex: '#F59E0B',
    };
  }
  if (rank === 2) {
    return {
      id: 'silver',
      name: 'Bạc Á Quân',
      barGradient: PODIUM_COLORS.second.barGradient,
      barBorder: 'border-slate-300/70',
      glowColor: PODIUM_COLORS.second.glow,
      badgeBg: PODIUM_COLORS.second.badge,
      textColor: PODIUM_COLORS.second.text,
      avatarBg: 'bg-slate-300 text-slate-900 font-bold',
      hex: '#CBD5E1',
    };
  }
  if (rank === 3) {
    return {
      id: 'bronze',
      name: 'Đồng Hạng Ba',
      barGradient: PODIUM_COLORS.third.barGradient,
      barBorder: 'border-amber-600/70',
      glowColor: PODIUM_COLORS.third.glow,
      badgeBg: PODIUM_COLORS.third.badge,
      textColor: PODIUM_COLORS.third.text,
      avatarBg: 'bg-amber-700 text-white font-bold',
      hex: '#D97706',
    };
  }

  // Cycle through the vibrant palettes for ranks 4+
  const index = (rank - 4) % VIBRANT_COLUMN_PALETTES.length;
  return VIBRANT_COLUMN_PALETTES[index];
}

/**
 * Generate avatar initials from Vietnamese or English full name
 */
export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
