// Centralized UI constants for profile-related components
import { ReactNode } from 'react';
import { Trophy, Target, Zap, Activity } from 'lucide-react';

export const PROFILE_ICON_COMPONENTS = {
  trophy: Trophy,
  target: Target,
  zap: Zap,
  activity: Activity,
} as const;

export type ProfileIconKey = keyof typeof PROFILE_ICON_COMPONENTS;

export interface GradientSpec {
  light: string;
  dark: string;
}

export const MATCH_RESULT_GRADIENT: Record<'win' | 'loss', GradientSpec> = {
  win: {
    light: 'bg-gradient-to-r from-emerald-50 to-green-50/50 border-emerald-100',
    dark: 'bg-gradient-to-r from-emerald-950/30 to-emerald-900/20 border-emerald-800/30',
  },
  loss: {
    light: 'bg-gradient-to-r from-rose-50 to-red-50/50 border-rose-100',
    dark: 'bg-gradient-to-r from-rose-950/30 to-red-900/20 border-rose-800/30',
  },
};

export const CHALLENGE_GRADIENT: GradientSpec = {
  light: 'bg-gradient-to-r from-blue-50 to-indigo-50/50 border-blue-100',
  dark: 'bg-gradient-to-r from-blue-950/30 to-indigo-900/20 border-blue-800/30',
};

export const QUICK_ACTION_BUTTON_STYLE = {
  light:
    'h-16 flex-col gap-2 border-dashed transition-all duration-200 bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/70',
  dark: 'h-16 flex-col gap-2 border-dashed transition-all duration-200 bg-slate-800/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/40',
};

export const SECTION_CARD_STYLE = {
  light: 'bg-white border-slate-200',
  dark: 'bg-slate-900/40 border-slate-700/50 backdrop-blur-sm',
};

export const iconBadgeBase = (theme: 'light' | 'dark') =>
  theme === 'dark'
    ? 'bg-slate-700/50 border border-slate-600/30'
    : 'bg-slate-100 border border-slate-200';
