import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Home,
  Trophy,
  Swords,
  BarChart3,
  Target,
  Users,
  TrendingUp,
  Flame,
  Star,
  Award,
  Zap,
  Activity,
  Plus,
  ChevronRight,
  Settings,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mobile-derived design tokens for desktop synchronization
const SABO_DESIGN_SYSTEM = {
  // Color palette synchronized with mobile interface
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    background: 'hsl(var(--background))',
    card: 'hsl(var(--card))',
    border: 'hsl(var(--border))',
    muted: 'hsl(var(--muted))',
    foreground: 'hsl(var(--foreground))',
  },
  
  // Typography scale aligned with mobile
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    weights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    sizes: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem' },
    lineHeights: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
  },
  
  // Spacing system from mobile
  spacing: {
    xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem',
  },
  
  // Component styling tokens
  components: {
    card: {
      borderRadius: '0.75rem', // 12px - consistent with mobile
      padding: '1.5rem', // 24px
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      border: '1px solid hsl(var(--border))',
    },
    button: {
      borderRadius: '0.5rem', // 8px
      padding: { sm: '0.5rem 1rem', md: '0.75rem 1.5rem', lg: '1rem 2rem' },
      fontSize: { sm: '0.875rem', md: '1rem', lg: '1.125rem' },
    },
    badge: {
      borderRadius: '9999px', // full
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
    },
  },
};

interface DashboardStats {
  totalMatches: number;
  winRate: number;
  currentRank: string;
  eloRating: number;
  weeklyGames: number;
  achievementsUnlocked: number;
  currentStreak: number;
  activeChallenges: number;
}

export const DesktopDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDesktop } = useOptimizedResponsive();

  // Mock stats data - replace with actual API calls
  const stats: DashboardStats = {
    totalMatches: 142,
    winRate: 68.5,
    currentRank: 'Thầy cơ',
    eloRating: 1847,
    weeklyGames: 12,
    achievementsUnlocked: 28,
    currentStreak: 5,
    activeChallenges: 3,
  };

  // Don't render on non-desktop devices
  if (!isDesktop) {
    return null;
  }

  return React.createElement('div', {
    className: "desktop-dashboard min-h-screen bg-background p-6",
    style: { fontFamily: SABO_DESIGN_SYSTEM.typography.fontFamily }
  }, [
    // Welcome Section
    React.createElement('div', { key: 'welcome', className: "mb-8" }, [
      React.createElement('div', { key: 'welcome-content', className: "flex items-center justify-between" }, [
        React.createElement('div', { key: 'welcome-text' }, [
          React.createElement('h1', {
            key: 'title',
            className: "text-3xl font-bold text-foreground mb-2",
            style: { fontSize: SABO_DESIGN_SYSTEM.typography.sizes['3xl'] }
          }, `Chào mừng trở lại, Player!`),
          React.createElement('p', {
            key: 'subtitle',
            className: "text-muted-foreground",
            style: { fontSize: SABO_DESIGN_SYSTEM.typography.sizes.base }
          }, "Sẵn sàng cho những trận đấu hấp dẫn hôm nay?")
        ]),
        React.createElement('div', { key: 'welcome-actions', className: "flex items-center gap-4" }, [
          React.createElement(Badge, {
            key: 'status-badge',
            variant: "outline",
            className: "text-sm"
          }, [
            React.createElement(Activity, { key: 'activity-icon', className: "w-4 h-4 mr-2" }),
            "Online"
          ]),
          React.createElement(Button, { key: 'new-match-btn' }, [
            React.createElement(Plus, { key: 'plus-icon', className: "w-4 h-4 mr-2" }),
            "Trận đấu mới"
          ])
        ])
      ])
    ]),

    // Stats Overview Grid
    React.createElement('div', {
      key: 'stats-grid',
      className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    }, [
      // Total Matches Card
      React.createElement(Card, {
        key: 'total-matches',
        className: "hover:shadow-md transition-shadow",
        style: { borderRadius: SABO_DESIGN_SYSTEM.components.card.borderRadius }
      }, React.createElement(CardContent, { className: "p-6" }, [
        React.createElement('div', { key: 'content', className: "flex items-center justify-between" }, [
          React.createElement('div', { key: 'text' }, [
            React.createElement('p', {
              key: 'label',
              className: "text-sm font-medium text-muted-foreground"
            }, "Tổng trận đấu"),
            React.createElement('p', {
              key: 'value',
              className: "text-2xl font-bold text-foreground"
            }, stats.totalMatches)
          ]),
          React.createElement('div', {
            key: 'icon',
            className: "p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full"
          }, React.createElement(Target, { className: "w-6 h-6 text-blue-600" }))
        ]),
        React.createElement('div', { key: 'trend', className: "mt-4 flex items-center" }, [
          React.createElement(TrendingUp, { key: 'trend-icon', className: "w-4 h-4 text-green-600 mr-1" }),
          React.createElement('span', { key: 'trend-text', className: "text-sm text-green-600" }, "+12% tuần này")
        ])
      ])),

      // Win Rate Card
      React.createElement(Card, {
        key: 'win-rate',
        className: "hover:shadow-md transition-shadow",
        style: { borderRadius: SABO_DESIGN_SYSTEM.components.card.borderRadius }
      }, React.createElement(CardContent, { className: "p-6" }, [
        React.createElement('div', { key: 'content', className: "flex items-center justify-between" }, [
          React.createElement('div', { key: 'text' }, [
            React.createElement('p', {
              key: 'label',
              className: "text-sm font-medium text-muted-foreground"
            }, "Tỷ lệ thắng"),
            React.createElement('p', {
              key: 'value',
              className: "text-2xl font-bold text-foreground"
            }, `${stats.winRate}%`)
          ]),
          React.createElement('div', {
            key: 'icon',
            className: "p-3 bg-green-100 dark:bg-green-900/20 rounded-full"
          }, React.createElement(Trophy, { className: "w-6 h-6 text-green-600" }))
        ]),
        React.createElement(Progress, { key: 'progress', value: stats.winRate, className: "mt-4" })
      ])),

      // ELO Rating Card
      React.createElement(Card, {
        key: 'elo-rating',
        className: "hover:shadow-md transition-shadow",
        style: { borderRadius: SABO_DESIGN_SYSTEM.components.card.borderRadius }
      }, React.createElement(CardContent, { className: "p-6" }, [
        React.createElement('div', { key: 'content', className: "flex items-center justify-between" }, [
          React.createElement('div', { key: 'text' }, [
            React.createElement('p', {
              key: 'label',
              className: "text-sm font-medium text-muted-foreground"
            }, "ELO Rating"),
            React.createElement('p', {
              key: 'value',
              className: "text-2xl font-bold text-foreground"
            }, stats.eloRating)
          ]),
          React.createElement('div', {
            key: 'icon',
            className: "p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full"
          }, React.createElement(BarChart3, { className: "w-6 h-6 text-purple-600" }))
        ]),
        React.createElement('div', { key: 'rank', className: "mt-4 flex items-center" }, [
          React.createElement('span', {
            key: 'rank-text',
            className: "text-sm text-muted-foreground"
          }, `Hạng: ${stats.currentRank}`)
        ])
      ])),

      // Current Streak Card
      React.createElement(Card, {
        key: 'current-streak',
        className: "hover:shadow-md transition-shadow",
        style: { borderRadius: SABO_DESIGN_SYSTEM.components.card.borderRadius }
      }, React.createElement(CardContent, { className: "p-6" }, [
        React.createElement('div', { key: 'content', className: "flex items-center justify-between" }, [
          React.createElement('div', { key: 'text' }, [
            React.createElement('p', {
              key: 'label',
              className: "text-sm font-medium text-muted-foreground"
            }, "Streak hiện tại"),
            React.createElement('p', {
              key: 'value',
              className: "text-2xl font-bold text-foreground"
            }, stats.currentStreak)
          ]),
          React.createElement('div', {
            key: 'icon',
            className: "p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full"
          }, React.createElement(Flame, { className: "w-6 h-6 text-orange-600" }))
        ]),
        React.createElement('div', { key: 'status', className: "mt-4 flex items-center" }, [
          React.createElement('span', {
            key: 'status-text',
            className: "text-sm text-green-600"
          }, "🔥 Đang lên form!")
        ])
      ]))
    ]),

    // Quick Actions Section
    React.createElement(Card, {
      key: 'quick-actions',
      className: "mb-8",
      style: { borderRadius: SABO_DESIGN_SYSTEM.components.card.borderRadius }
    }, [
      React.createElement(CardHeader, { key: 'header' },
        React.createElement(CardTitle, { className: "flex items-center" }, [
          React.createElement(Zap, { key: 'icon', className: "w-5 h-5 mr-2" }),
          "Hành động nhanh"
        ])
      ),
      React.createElement(CardContent, { key: 'content' },
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, [
          // Quick Challenge Button
          React.createElement(Button, {
            key: 'quick-challenge',
            variant: "default",
            className: "h-auto p-4 justify-start text-left hover:scale-[1.02] transition-transform"
          }, React.createElement('div', { className: "flex items-center gap-3 w-full" }, [
            React.createElement('div', {
              key: 'icon-container',
              className: "p-2 rounded-lg bg-primary-foreground/20"
            }, React.createElement(Swords, { className: "w-5 h-5" })),
            React.createElement('div', { key: 'text', className: "flex-1" }, [
              React.createElement('p', { key: 'label', className: "font-medium" }, "Thách đấu nhanh"),
              React.createElement('p', {
                key: 'desc',
                className: "text-sm text-muted-foreground mt-1"
              }, "Tìm đối thủ ngay lập tức")
            ]),
            React.createElement(ChevronRight, { key: 'chevron', className: "w-4 h-4 opacity-50" })
          ])),

          // Join Tournament Button
          React.createElement(Button, {
            key: 'join-tournament',
            variant: "outline",
            className: "h-auto p-4 justify-start text-left hover:scale-[1.02] transition-transform border-green-200 hover:bg-green-50"
          }, React.createElement('div', { className: "flex items-center gap-3 w-full" }, [
            React.createElement('div', {
              key: 'icon-container',
              className: "p-2 rounded-lg bg-green-100"
            }, React.createElement(Trophy, { className: "w-5 h-5" })),
            React.createElement('div', { key: 'text', className: "flex-1" }, [
              React.createElement('div', { key: 'header', className: "flex items-center justify-between" }, [
                React.createElement('p', { key: 'label', className: "font-medium" }, "Tham gia giải đấu"),
                React.createElement(Badge, {
                  key: 'badge',
                  variant: "secondary",
                  className: "text-xs"
                }, "3 mới")
              ]),
              React.createElement('p', {
                key: 'desc',
                className: "text-sm text-muted-foreground mt-1"
              }, "Xem các giải đấu đang mở")
            ]),
            React.createElement(ChevronRight, { key: 'chevron', className: "w-4 h-4 opacity-50" })
          ])),

          // Find Clubs Button
          React.createElement(Button, {
            key: 'find-clubs',
            variant: "outline",
            className: "h-auto p-4 justify-start text-left hover:scale-[1.02] transition-transform"
          }, React.createElement('div', { className: "flex items-center gap-3 w-full" }, [
            React.createElement('div', {
              key: 'icon-container',
              className: "p-2 rounded-lg bg-muted"
            }, React.createElement(Users, { className: "w-5 h-5" })),
            React.createElement('div', { key: 'text', className: "flex-1" }, [
              React.createElement('p', { key: 'label', className: "font-medium" }, "Tìm CLB"),
              React.createElement('p', {
                key: 'desc',
                className: "text-sm text-muted-foreground mt-1"
              }, "Kết nối với cộng đồng")
            ]),
            React.createElement(ChevronRight, { key: 'chevron', className: "w-4 h-4 opacity-50" })
          ])),

          // Practice Button
          React.createElement(Button, {
            key: 'practice',
            variant: "outline",
            className: "h-auto p-4 justify-start text-left hover:scale-[1.02] transition-transform border-orange-200 hover:bg-orange-50"
          }, React.createElement('div', { className: "flex items-center gap-3 w-full" }, [
            React.createElement('div', {
              key: 'icon-container',
              className: "p-2 rounded-lg bg-orange-100"
            }, React.createElement(Target, { className: "w-5 h-5" })),
            React.createElement('div', { key: 'text', className: "flex-1" }, [
              React.createElement('p', { key: 'label', className: "font-medium" }, "Luyện tập"),
              React.createElement('p', {
                key: 'desc',
                className: "text-sm text-muted-foreground mt-1"
              }, "Cải thiện kỹ năng")
            ]),
            React.createElement(ChevronRight, { key: 'chevron', className: "w-4 h-4 opacity-50" })
          ]))
        ])
      )
    ])
  ]);
};