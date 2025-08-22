import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useAdminViewMode } from '@/hooks/useAdminViewMode';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  X,
  LayoutDashboard,
  Users,
  Trophy,
  Building2,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Shield,
  Bell,
  Database,
  Zap,
  FileText,
  Calendar,
  AlertTriangle,
  Wrench,
  Bot,
  TestTube,
  Sun,
  Moon,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdminMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const primaryItems = [
  { icon: LayoutDashboard, path: '/admin', label: 'Dashboard', category: 'main' },
  { icon: Users, path: '/admin/users', label: 'Quản Lý Users', category: 'main' },
  { icon: Trophy, path: '/admin/tournaments', label: 'Quản Lý Giải Đấu', category: 'main' },
  { icon: Building2, path: '/admin/clubs', label: 'Quản Lý CLB', category: 'main' },
  { icon: BarChart3, path: '/admin/analytics', label: 'Thống Kê', category: 'main' },
];

const secondaryItems = [
  { icon: CreditCard, path: '/admin/transactions', label: 'Giao Dịch', category: 'management' },
  { icon: Shield, path: '/admin/rank-verification', label: 'Xác Minh Rank', category: 'management' },
  { icon: Bell, path: '/admin/notifications', label: 'Thông Báo', category: 'management' },
  { icon: Wrench, path: '/admin/game-config', label: 'Cấu Hình Game', category: 'management' },
  { icon: AlertTriangle, path: '/admin/emergency', label: 'Khẩn Cấp', category: 'management' },
];

const systemItems = [
  { icon: Database, path: '/admin/database', label: 'Cơ Sở Dữ Liệu', category: 'system' },
  { icon: Zap, path: '/admin/automation', label: 'Tự Động Hóa', category: 'system' },
  { icon: FileText, path: '/admin/reports', label: 'Báo Cáo', category: 'system' },
  { icon: Calendar, path: '/admin/schedule', label: 'Lịch Trình', category: 'system' },
  { icon: Bot, path: '/admin/ai-assistant', label: 'AI Assistant', category: 'system' },
  { icon: TestTube, path: '/admin/testing', label: 'Testing', category: 'system' },
];

export const AdminMobileDrawer: React.FC<AdminMobileDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { viewMode, toggleViewMode, isPlayerView } = useAdminViewMode();
  const navigate = useNavigate();

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    toast.success(`Đã chuyển sang chế độ ${theme === 'dark' ? 'sáng' : 'tối'}`);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Đã đăng xuất thành công');
      navigate('/auth/login');
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Lỗi khi đăng xuất');
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 lg:hidden'>
      {/* Backdrop */}
      <div 
        className='absolute inset-0 bg-black/50 backdrop-blur-sm' 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className='absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-background/95 backdrop-blur-xl shadow-2xl border-r border-border'>
        {/* Header */}
        <div className='p-4 border-b border-border bg-gradient-to-r from-primary/5 to-blue-500/5'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <Shield className='h-5 w-5 text-primary' />
              <h2 className='text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent'>
                SABO Admin
              </h2>
            </div>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>
          
          {/* User Info */}
          <div className='flex items-center gap-3'>
            <Avatar className='h-10 w-10 border-2 border-primary/20'>
              <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
              <AvatarFallback className='text-sm font-bold bg-gradient-to-br from-primary to-blue-600 text-white'>
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate'>{user?.email}</p>
              <Badge variant='outline' className='text-xs mt-1 bg-red-50 text-red-700 border-red-200'>
                Administrator
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className='flex-1 overflow-y-auto p-4 space-y-6'>
          {/* Main Functions */}
          <div>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
              Chức Năng Chính
            </h3>
            <nav className='space-y-1'>
              {primaryItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`
                    }
                    onClick={onClose}
                  >
                    <Icon className='h-4 w-4 flex-shrink-0' />
                    <span className='text-sm font-medium'>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <Separator />

          {/* Management Tools */}
          <div>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
              Công Cụ Quản Lý
            </h3>
            <nav className='space-y-1'>
              {secondaryItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`
                    }
                    onClick={onClose}
                  >
                    <Icon className='h-4 w-4 flex-shrink-0' />
                    <span className='text-sm font-medium'>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <Separator />

          {/* System Tools */}
          <div>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
              Hệ Thống
            </h3>
            <nav className='space-y-1'>
              {systemItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`
                    }
                    onClick={onClose}
                  >
                    <Icon className='h-4 w-4 flex-shrink-0' />
                    <span className='text-sm font-medium'>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Actions */}
        <div className='p-4 border-t border-border bg-muted/20 space-y-2'>
          {/* View Mode Toggle */}
          <Button
            variant={isPlayerView ? 'default' : 'outline'}
            className='w-full justify-start gap-3 hover:bg-muted'
            onClick={() => {
              toggleViewMode();
              toast.success(`Chuyển sang chế độ ${isPlayerView ? 'Admin' : 'Player View'}`);
            }}
          >
            {isPlayerView ? (
              <>
                <Shield className='h-4 w-4' />
                <span>Chế Độ Admin</span>
              </>
            ) : (
              <>
                <Eye className='h-4 w-4' />
                <span>Chế Độ Player</span>
                <Badge variant='secondary' className='ml-auto text-xs'>
                  <RefreshCw className='h-3 w-3 mr-1' />
                  Clean
                </Badge>
              </>
            )}
          </Button>

          <Button
            variant='ghost'
            className='w-full justify-start gap-3 hover:bg-muted'
            onClick={() => {
              navigate('/dashboard');
              onClose();
            }}
          >
            <Home className='h-4 w-4' />
            <span>Về Trang Player</span>
          </Button>

          <Button
            variant='ghost'
            className='w-full justify-start gap-3 hover:bg-muted'
            onClick={() => {
              handleThemeToggle();
            }}
          >
            {theme === 'dark' ? (
              <Sun className='h-4 w-4' />
            ) : (
              <Moon className='h-4 w-4' />
            )}
            <span>{theme === 'dark' ? 'Chế Độ Sáng' : 'Chế Độ Tối'}</span>
          </Button>

          <Button
            variant='ghost'
            className='w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive'
            onClick={handleLogout}
          >
            <LogOut className='h-4 w-4' />
            <span>Đăng Xuất</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
