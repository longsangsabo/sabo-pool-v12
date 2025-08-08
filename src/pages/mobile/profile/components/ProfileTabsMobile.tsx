import React from 'react';
import { Activity, UserCircle, Award, Star } from 'lucide-react';

interface ProfileTabsMobileProps {
  activeTab: string;
  onChange: (tab: string) => void;
  theme: 'light' | 'dark';
}

const TABS = [
  { key: 'activities', label: 'Hoạt động', Icon: Activity, color: { light: 'blue', dark: 'blue' } },
  { key: 'edit', label: 'Cá nhân', Icon: UserCircle, color: { light: 'emerald', dark: 'emerald' } },
  { key: 'rank', label: 'Đăng ký hạng', Icon: Award, color: { light: 'purple', dark: 'purple' } },
  { key: 'club', label: 'Đăng ký CLB', Icon: Star, color: { light: 'cyan', dark: 'cyan' } },
];

export const ProfileTabsMobile: React.FC<ProfileTabsMobileProps> = ({ activeTab, onChange, theme }) => {
  return (
    <div className={`flex ${theme === 'dark' ? 'border-b border-slate-700/50' : 'border-b border-slate-200'}`}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        const color = tab.color[theme];
        const activeClasses = theme === 'dark'
          ? 'text-white border-b-2'
          : 'text-slate-900 border-b-2';
        const inactiveClasses = theme === 'dark'
          ? 'text-slate-300 hover:text-white'
          : 'text-slate-600 hover:text-slate-900';
        return (
          <button
            key={tab.key}
            className={`flex-1 px-2 py-3 text-sm font-medium transition-all duration-200 ${isActive ? `${activeClasses} border-${color}-400` : inactiveClasses}`}
            onClick={() => onChange(tab.key)}
          >
            <div className={`relative mx-auto mb-1 w-4 h-4 flex items-center justify-center ${isActive ? 'drop-shadow-lg' : 'drop-shadow-sm'}`}>
              <tab.Icon
                className={`w-4 h-4 transition-all duration-200 ${isActive
                  ? theme === 'dark'
                    ? `text-${color}-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]`
                    : `text-${color}-600 drop-shadow-[0_2px_4px_rgba(37,99,235,0.4)]`
                  : theme === 'dark'
                    ? 'text-slate-400'
                    : 'text-slate-500'}`}
              />
            </div>
            <div className='text-xs font-semibold'>{tab.label}</div>
          </button>
        );
      })}
    </div>
  );
};
