import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { AdminPlayerLayout } from '@/components/mobile/AdminPlayerLayout';
import { AdminStatsCards } from '@/components/admin/mobile/AdminStatsCards';
import { AdminQuickActions } from '@/components/admin/mobile/AdminQuickActions';
import { AdminRecentActivities } from '@/components/admin/mobile/AdminRecentActivities';
import { AdminSystemStatus } from '@/components/admin/mobile/AdminSystemStatus';
import { AdminPendingTasks } from '@/components/admin/mobile/AdminPendingTasks';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  activeTournaments: number;
  totalClubs: number;
  pendingTasks: number;
  systemAlerts: number;
  todayTransactions: number;
  onlineUsers: number;
  serverUptime: string;
}

export default function AdminDashboard() {
  const { isMobile } = useOptimizedResponsive();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeTournaments: 0,
    totalClubs: 0,
    pendingTasks: 0,
    systemAlerts: 0,
    todayTransactions: 0,
    onlineUsers: 0,
    serverUptime: '99.9%',
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all stats in parallel
      const [
        usersResult,
        tournamentsResult,
        clubsResult,
        tasksResult,
        alertsResult,
        transactionsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('tournaments').select('*', { count: 'exact', head: true }).in('status', ['registration_open', 'ongoing']),
        supabase.from('club_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('rank_verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('system_alerts').select('*', { count: 'exact', head: true }).eq('is_resolved', false),
        supabase.from('transactions').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        activeTournaments: tournamentsResult.count || 0,
        totalClubs: clubsResult.count || 0,
        pendingTasks: tasksResult.count || 0,
        systemAlerts: alertsResult.count || 0,
        todayTransactions: transactionsResult.count || 0,
        onlineUsers: Math.floor(Math.random() * 50) + 20, // Mock data
        serverUptime: '99.9%',
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Lỗi khi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Pull to refresh functionality
  const handleRefresh = useCallback(async () => {
    await fetchDashboardData();
    toast.success('Đã làm mới dashboard!');
  }, [fetchDashboardData]);

  const {
    containerRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getRefreshIndicatorStyle,
    getContainerStyle,
    isRefreshing: isPullRefreshing,
    pullDistance,
  } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  // Mobile layout
  if (isMobile) {
    return (
      <>
        <Helmet>
          <title>SABO Admin - Dashboard</title>
          <meta name='description' content='Quản trị hệ thống SABO Arena' />
        </Helmet>

        <AdminPlayerLayout pageTitle='Quản Trị Hệ Thống'>
          <div
            ref={containerRef}
            className='min-h-screen overflow-auto'
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={getContainerStyle()}
          >
            {/* Pull to refresh indicator */}
            <div
              className={`flex justify-center items-center transition-all duration-200 ${
                isPullRefreshing || loading || pullDistance > 0
                  ? 'py-2'
                  : 'h-0 py-0 overflow-hidden'
              }`}
              style={getRefreshIndicatorStyle()}
            >
              <RefreshCw
                className={`w-6 h-6 text-primary ${
                  isPullRefreshing || loading ? 'animate-spin' : ''
                }`}
              />
            </div>

            <div className='space-y-6 pb-4'>
              {/* Welcome Header */}
              <div className='bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg p-4 border border-primary/20'>
                <h2 className='text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent'>
                  Dashboard Admin
                </h2>
                <p className='text-sm text-muted-foreground mt-1'>
                  Chào mừng đến với bảng điều khiển quản trị SABO Arena
                </p>
                <div className='flex items-center gap-2 mt-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                  <span className='text-xs text-muted-foreground'>
                    Cập nhật lần cuối: {lastRefresh.toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Stats Overview */}
              <AdminStatsCards stats={stats} loading={loading} />

              {/* Quick Actions */}
              <AdminQuickActions />

              {/* Pending Tasks */}
              <AdminPendingTasks pendingCount={stats.pendingTasks} />

              {/* System Status */}
              <AdminSystemStatus 
                uptime={stats.serverUptime}
                onlineUsers={stats.onlineUsers}
                alerts={stats.systemAlerts}
              />

              {/* Recent Activities */}
              <AdminRecentActivities />
            </div>
          </div>
        </AdminPlayerLayout>
      </>
    );
  }

  // Desktop fallback - import original AdminDashboard
  const OriginalAdminDashboard = React.lazy(() => import('./AdminDashboardDesktop'));
  
  return (
    <React.Suspense fallback={<div className='p-8 text-center'>Loading...</div>}>
      <OriginalAdminDashboard />
    </React.Suspense>
  );
}
