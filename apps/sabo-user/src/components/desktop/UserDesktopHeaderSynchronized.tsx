import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Menu, 
  Search, 
  Settings, 
  User, 
  LogOut, 
  MessageCircle,
  Wallet,
  Shield,
  RefreshCw,
  Plus,
  Activity,
  Sun,
  Moon
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ClubRoleSwitch } from '@/components/club/ClubRoleSwitch';
import { UnifiedNotificationBell } from '@/components/notifications/UnifiedNotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface UserDesktopHeaderSynchronizedProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

// Design tokens synchronized with mobile header
const SABO_HEADER_TOKENS = {
  height: '4rem', // 64px - consistent with mobile header
  padding: { x: '1.5rem', y: '1rem' },
  colors: {
    background: 'hsl(var(--card))',
    border: 'hsl(var(--border))',
    text: 'hsl(var(--foreground))',
    muted: 'hsl(var(--muted-foreground))',
    primary: 'hsl(var(--primary))',
  },
  shadows: {
    elevation: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },
  borderRadius: {
    input: '0.5rem', // 8px
    badge: '9999px', // full
    button: '0.375rem', // 6px
  },
  animation: {
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    scale: {
      hover: 'scale(1.05)',
      active: 'scale(0.95)',
    },
  },
};

export const UserDesktopHeaderSynchronized: React.FC<UserDesktopHeaderSynchronizedProps> = ({
  onToggleSidebar,
  sidebarCollapsed,
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Get user profile data - synchronized with mobile
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Get notification counts - synchronized with mobile
  const { data: unreadCount } = useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .is('deleted_at', null);
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000,
  });

  // Get message counts
  const { data: messageCount } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      // Mock data - replace with actual message count
      return 3;
    },
    refetchInterval: 30000,
  });

  // Get wallet balance - synchronized with mobile
  const { data: wallet } = useQuery({
    queryKey: ['wallet-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('wallets')
        .select('balance, points_balance')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || { balance: 0, points_balance: 0 };
    },
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header 
      className="bg-card border-b border-border"
      style={{
        height: SABO_HEADER_TOKENS.height,
        boxShadow: SABO_HEADER_TOKENS.shadows.elevation,
        padding: `${SABO_HEADER_TOKENS.padding.y} ${SABO_HEADER_TOKENS.padding.x}`,
      }}
    >
      <div className="flex items-center justify-between h-full">
        {/* Left Section - Menu & Branding */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="hover:bg-muted hover:scale-105 transition-all duration-200"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold hidden md:block">Dashboard</h1>
            <Badge 
              variant="outline" 
              className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
              style={{ borderRadius: SABO_HEADER_TOKENS.borderRadius.badge }}
            >
              <Activity className="w-3 h-3 mr-1" />
              Player Mode
            </Badge>
          </div>

          {/* Role Switch - synchronized with mobile */}
          <div className="hidden lg:flex items-center">
            <ClubRoleSwitch />
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm người chơi, giải đấu..."
              className={cn(
                "pl-10 pr-4 w-full bg-background/50 backdrop-blur-sm",
                "focus:bg-background transition-all duration-200",
                "border-muted-foreground/20 focus:border-primary"
              )}
              style={{ 
                borderRadius: SABO_HEADER_TOKENS.borderRadius.input,
                transition: SABO_HEADER_TOKENS.animation.transition,
              }}
            />
          </div>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center gap-3">
          {/* Quick Action - New Match */}
          <Button
            size="sm"
            className="hidden lg:flex bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200"
            onClick={() => navigate('/challenges')}
            style={{ 
              borderRadius: SABO_HEADER_TOKENS.borderRadius.button,
              transition: SABO_HEADER_TOKENS.animation.transition,
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Trận đấu mới
          </Button>

          {/* Wallet Balance - synchronized with mobile */}
          {wallet && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/wallet')}
              className="hidden md:flex hover:bg-muted hover:scale-105 transition-all duration-200 gap-2"
              style={{ transition: SABO_HEADER_TOKENS.animation.transition }}
            >
              <Wallet className="h-4 w-4" />
              <div className="flex flex-col text-xs">
                <span className="font-medium">{wallet.points_balance || 0} SPA</span>
                <span className="text-muted-foreground">{(wallet.balance || 0).toLocaleString()} VND</span>
              </div>
            </Button>
          )}

          {/* Messages Button - synchronized with mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/messages')}
            className="relative hover:bg-muted hover:scale-105 transition-all duration-200"
            style={{ transition: SABO_HEADER_TOKENS.animation.transition }}
          >
            <MessageCircle className="h-5 w-5" />
            {messageCount && messageCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center animate-pulse"
              >
                {messageCount > 99 ? '99+' : messageCount}
              </Badge>
            )}
            <span className="hidden lg:block ml-2">Messages</span>
          </Button>

          {/* Notifications - synchronized with mobile */}
          <div className="relative">
            <UnifiedNotificationBell 
              variant="desktop" 
              onClick={() => navigate('/notifications')}
            />
            {unreadCount && unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center animate-pulse"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>

          {/* Theme Toggle - synchronized with mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleThemeToggle}
            className="hover:bg-muted hover:scale-105 transition-all duration-200"
            style={{ transition: SABO_HEADER_TOKENS.animation.transition }}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* User Menu - synchronized with mobile header */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 rounded-full hover:scale-105 transition-all duration-200"
                  style={{ transition: SABO_HEADER_TOKENS.animation.transition }}
                >
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage 
                      src={profile?.avatar_url || user.user_metadata?.avatar_url} 
                      alt={profile?.display_name || 'User'} 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {(profile?.display_name || user.user_metadata?.display_name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-80 p-4" 
                align="end"
                style={{
                  borderRadius: SABO_HEADER_TOKENS.borderRadius.input,
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                }}
              >
                {/* User Info Header */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={profile?.avatar_url || user.user_metadata?.avatar_url} 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {(profile?.display_name || user.user_metadata?.display_name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg truncate">
                      {profile?.display_name || user.user_metadata?.display_name || 'User'}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Player
                      </Badge>
                      {wallet && (
                        <Badge variant="secondary" className="text-xs">
                          {wallet.points_balance || 0} SPA
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator />

                {/* Menu Items */}
                <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-accent">
                  <Link to="/profile" className="flex items-center gap-3">
                    <User className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Hồ sơ cá nhân</p>
                      <p className="text-xs text-muted-foreground">Xem và chỉnh sửa thông tin</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-accent">
                  <Link to="/wallet" className="flex items-center gap-3">
                    <Wallet className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Ví điện tử</p>
                      <p className="text-xs text-muted-foreground">Quản lý tài chính</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-accent">
                  <Link to="/settings" className="flex items-center gap-3">
                    <Settings className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Cài đặt</p>
                      <p className="text-xs text-muted-foreground">Tùy chỉnh ứng dụng</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="cursor-pointer p-3 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  <div>
                    <p className="font-medium">Đăng xuất</p>
                    <p className="text-xs opacity-75">Thoát khỏi tài khoản</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Đăng ký
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
