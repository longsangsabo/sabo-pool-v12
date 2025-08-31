// =====================================================
// 📊 ANALYTICS & TRACKING BUSINESS LOGIC
// =====================================================

/**
 * Centralized analytics business logic extracted from:
 * - ClubStatsDashboard.tsx
 * - AdminAnalytics.tsx
 * - AnalyticsDashboard.tsx
 * - useClubStatsHook.ts
 * - performance tracking modules
 * 
 * Provides unified analytics management for:
 * - Club performance analytics
 * - User behavior tracking
 * - Revenue and financial metrics
 * - Performance monitoring
 * - Dashboard statistics
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ===== ANALYTICS TYPES =====

export type MetricType = 'revenue' | 'users' | 'matches' | 'clubs' | 'tournaments' | 'challenges' | 'engagement';
export type TimeRange = '1d' | '7d' | '30d' | '90d' | '1y' | 'all';
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'doughnut';

export interface MetricData {
  label: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  unit?: string;
  format?: 'number' | 'currency' | 'percentage';
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }>;
}

export interface AnalyticsFilters {
  timeRange: TimeRange;
  metricTypes?: MetricType[];
  clubId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// ===== CLUB ANALYTICS =====

export interface ClubStats {
  id: string;
  name: string;
  totalMembers: number;
  activeMembers: number;
  totalMatches: number;
  totalRevenue: number;
  averageMatchValue: number;
  winRate: number;
  monthlyGrowth: number;
  membershipTrend: TimeSeriesData[];
  revenueTrend: TimeSeriesData[];
  activityTrend: TimeSeriesData[];
}

export interface ClubPerformanceMetrics {
  memberEngagement: {
    activeRate: number;
    retentionRate: number;
    averageSessionDuration: number;
    matchesPerMember: number;
  };
  financialMetrics: {
    totalRevenue: number;
    monthlyRevenue: number;
    revenuePerMember: number;
    growthRate: number;
  };
  competitiveMetrics: {
    totalMatches: number;
    winRate: number;
    averageMatchDuration: number;
    tournamentParticipation: number;
  };
}

// ===== USER ANALYTICS =====

export interface UserStats {
  id: string;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
  averageSessionTime: number;
  topCountries: Array<{ country: string; count: number }>;
  userGrowthTrend: TimeSeriesData[];
  engagementTrend: TimeSeriesData[];
}

export interface UserBehaviorMetrics {
  sessionMetrics: {
    averageDuration: number;
    bounceRate: number;
    pagesPerSession: number;
    returnVisitorRate: number;
  };
  gameplayMetrics: {
    matchesPlayed: number;
    challengesCreated: number;
    tournamentsJoined: number;
    clubsJoined: number;
  };
  engagementMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    socialInteractions: number;
  };
}

// ===== REVENUE ANALYTICS =====

export interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  revenueGrowthRate: number;
  revenueBySource: Array<{ source: string; amount: number; percentage: number }>;
  revenueTrend: TimeSeriesData[];
  topEarningClubs: Array<{ clubId: string; clubName: string; revenue: number }>;
}

// ===== PERFORMANCE METRICS =====

export interface PerformanceMetrics {
  systemHealth: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
  databaseMetrics: {
    queryTime: number;
    connectionPool: number;
    deadlocks: number;
    cacheHitRate: number;
  };
  userExperience: {
    pageLoadTime: number;
    timeToInteractive: number;
    cumulativeLayoutShift: number;
    firstContentfulPaint: number;
  };
}

// ===== ANALYTICS SERVICE =====

export class AnalyticsService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // ===== CLUB ANALYTICS =====

  /**
   * Get comprehensive club statistics
   */
  async getClubStats(clubId: string, timeRange: TimeRange = '30d'): Promise<ClubStats | null> {
    try {
      const dateRange = this.getDateRange(timeRange);
      
      // Get basic club info
      const { data: club, error: clubError } = await this.supabase
        .from('clubs')
        .select('id, name')
        .eq('id', clubId)
        .single();

      if (clubError || !club) {
        console.error('❌ Error fetching club:', clubError);
        return null;
      }

      // Get member stats
      const { data: memberStats } = await this.supabase
        .rpc('get_club_member_stats', {
          club_id: clubId,
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString()
        });

      // Get match stats
      const { data: matchStats } = await this.supabase
        .rpc('get_club_match_stats', {
          club_id: clubId,
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString()
        });

      // Get revenue stats
      const { data: revenueStats } = await this.supabase
        .rpc('get_club_revenue_stats', {
          club_id: clubId,
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString()
        });

      // Get trend data
      const membershipTrend = await this.getClubMembershipTrend(clubId, timeRange);
      const revenueTrend = await this.getClubRevenueTrend(clubId, timeRange);
      const activityTrend = await this.getClubActivityTrend(clubId, timeRange);

      return {
        id: club.id,
        name: club.name,
        totalMembers: memberStats?.total_members || 0,
        activeMembers: memberStats?.active_members || 0,
        totalMatches: matchStats?.total_matches || 0,
        totalRevenue: revenueStats?.total_revenue || 0,
        averageMatchValue: matchStats?.average_match_value || 0,
        winRate: matchStats?.win_rate || 0,
        monthlyGrowth: memberStats?.monthly_growth || 0,
        membershipTrend,
        revenueTrend,
        activityTrend
      };
    } catch (error) {
      console.error('❌ Exception getting club stats:', error);
      return null;
    }
  }

  /**
   * Get club performance metrics
   */
  async getClubPerformanceMetrics(clubId: string, timeRange: TimeRange = '30d'): Promise<ClubPerformanceMetrics | null> {
    try {
      const dateRange = this.getDateRange(timeRange);

      const { data: metrics, error } = await this.supabase
        .rpc('get_club_performance_metrics', {
          club_id: clubId,
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString()
        });

      if (error) {
        console.error('❌ Error getting club performance metrics:', error);
        return null;
      }

      return metrics as ClubPerformanceMetrics;
    } catch (error) {
      console.error('❌ Exception getting club performance metrics:', error);
      return null;
    }
  }

  /**
   * Get club membership trend
   */
  async getClubMembershipTrend(clubId: string, timeRange: TimeRange = '30d'): Promise<TimeSeriesData[]> {
    try {
      const dateRange = this.getDateRange(timeRange);
      
      const { data, error } = await this.supabase
        .rpc('get_club_membership_trend', {
          club_id: clubId,
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString(),
          interval_type: this.getIntervalType(timeRange)
        });

      if (error) {
        console.error('❌ Error getting membership trend:', error);
        return [];
      }

      return data?.map((item: any) => ({
        timestamp: item.date,
        value: item.member_count,
        label: this.formatDateLabel(item.date, timeRange)
      })) || [];
    } catch (error) {
      console.error('❌ Exception getting membership trend:', error);
      return [];
    }
  }

  /**
   * Get club revenue trend
   */
  async getClubRevenueTrend(clubId: string, timeRange: TimeRange = '30d'): Promise<TimeSeriesData[]> {
    try {
      const dateRange = this.getDateRange(timeRange);
      
      const { data, error } = await this.supabase
        .rpc('get_club_revenue_trend', {
          club_id: clubId,
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString(),
          interval_type: this.getIntervalType(timeRange)
        });

      if (error) {
        console.error('❌ Error getting revenue trend:', error);
        return [];
      }

      return data?.map((item: any) => ({
        timestamp: item.date,
        value: item.revenue,
        label: this.formatDateLabel(item.date, timeRange)
      })) || [];
    } catch (error) {
      console.error('❌ Exception getting revenue trend:', error);
      return [];
    }
  }

  /**
   * Get club activity trend
   */
  async getClubActivityTrend(clubId: string, timeRange: TimeRange = '30d'): Promise<TimeSeriesData[]> {
    try {
      const dateRange = this.getDateRange(timeRange);
      
      const { data, error } = await this.supabase
        .rpc('get_club_activity_trend', {
          club_id: clubId,
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString(),
          interval_type: this.getIntervalType(timeRange)
        });

      if (error) {
        console.error('❌ Error getting activity trend:', error);
        return [];
      }

      return data?.map((item: any) => ({
        timestamp: item.date,
        value: item.activity_count,
        label: this.formatDateLabel(item.date, timeRange)
      })) || [];
    } catch (error) {
      console.error('❌ Exception getting activity trend:', error);
      return [];
    }
  }

  // ===== USER ANALYTICS =====

  /**
   * Get user statistics
   */
  async getUserStats(timeRange: TimeRange = '30d'): Promise<UserStats | null> {
    try {
      const dateRange = this.getDateRange(timeRange);

      const { data: stats, error } = await this.supabase
        .rpc('get_user_stats', {
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString()
        });

      if (error) {
        console.error('❌ Error getting user stats:', error);
        return null;
      }

      // Get user growth trend
      const userGrowthTrend = await this.getUserGrowthTrend(timeRange);
      const engagementTrend = await this.getUserEngagementTrend(timeRange);

      return {
        id: 'global',
        totalUsers: stats?.total_users || 0,
        activeUsers: stats?.active_users || 0,
        newUsers: stats?.new_users || 0,
        retentionRate: stats?.retention_rate || 0,
        averageSessionTime: stats?.average_session_time || 0,
        topCountries: stats?.top_countries || [],
        userGrowthTrend,
        engagementTrend
      };
    } catch (error) {
      console.error('❌ Exception getting user stats:', error);
      return null;
    }
  }

  /**
   * Get user behavior metrics
   */
  async getUserBehaviorMetrics(userId?: string, timeRange: TimeRange = '30d'): Promise<UserBehaviorMetrics | null> {
    try {
      const dateRange = this.getDateRange(timeRange);

      const { data: metrics, error } = await this.supabase
        .rpc('get_user_behavior_metrics', {
          user_id: userId,
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString()
        });

      if (error) {
        console.error('❌ Error getting user behavior metrics:', error);
        return null;
      }

      return metrics as UserBehaviorMetrics;
    } catch (error) {
      console.error('❌ Exception getting user behavior metrics:', error);
      return null;
    }
  }

  /**
   * Get user growth trend
   */
  async getUserGrowthTrend(timeRange: TimeRange = '30d'): Promise<TimeSeriesData[]> {
    try {
      const dateRange = this.getDateRange(timeRange);
      
      const { data, error } = await this.supabase
        .rpc('get_user_growth_trend', {
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString(),
          interval_type: this.getIntervalType(timeRange)
        });

      if (error) {
        console.error('❌ Error getting user growth trend:', error);
        return [];
      }

      return data?.map((item: any) => ({
        timestamp: item.date,
        value: item.user_count,
        label: this.formatDateLabel(item.date, timeRange)
      })) || [];
    } catch (error) {
      console.error('❌ Exception getting user growth trend:', error);
      return [];
    }
  }

  /**
   * Get user engagement trend
   */
  async getUserEngagementTrend(timeRange: TimeRange = '30d'): Promise<TimeSeriesData[]> {
    try {
      const dateRange = this.getDateRange(timeRange);
      
      const { data, error } = await this.supabase
        .rpc('get_user_engagement_trend', {
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString(),
          interval_type: this.getIntervalType(timeRange)
        });

      if (error) {
        console.error('❌ Error getting engagement trend:', error);
        return [];
      }

      return data?.map((item: any) => ({
        timestamp: item.date,
        value: item.engagement_score,
        label: this.formatDateLabel(item.date, timeRange)
      })) || [];
    } catch (error) {
      console.error('❌ Exception getting engagement trend:', error);
      return [];
    }
  }

  // ===== REVENUE ANALYTICS =====

  /**
   * Get revenue statistics
   */
  async getRevenueStats(timeRange: TimeRange = '30d'): Promise<RevenueStats | null> {
    try {
      const dateRange = this.getDateRange(timeRange);

      const { data: stats, error } = await this.supabase
        .rpc('get_revenue_stats', {
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString()
        });

      if (error) {
        console.error('❌ Error getting revenue stats:', error);
        return null;
      }

      // Get revenue trend
      const revenueTrend = await this.getRevenueTrend(timeRange);

      return {
        totalRevenue: stats?.total_revenue || 0,
        monthlyRevenue: stats?.monthly_revenue || 0,
        dailyRevenue: stats?.daily_revenue || 0,
        revenueGrowthRate: stats?.growth_rate || 0,
        revenueBySource: stats?.revenue_by_source || [],
        revenueTrend,
        topEarningClubs: stats?.top_earning_clubs || []
      };
    } catch (error) {
      console.error('❌ Exception getting revenue stats:', error);
      return null;
    }
  }

  /**
   * Get revenue trend
   */
  async getRevenueTrend(timeRange: TimeRange = '30d'): Promise<TimeSeriesData[]> {
    try {
      const dateRange = this.getDateRange(timeRange);
      
      const { data, error } = await this.supabase
        .rpc('get_revenue_trend', {
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString(),
          interval_type: this.getIntervalType(timeRange)
        });

      if (error) {
        console.error('❌ Error getting revenue trend:', error);
        return [];
      }

      return data?.map((item: any) => ({
        timestamp: item.date,
        value: item.revenue,
        label: this.formatDateLabel(item.date, timeRange)
      })) || [];
    } catch (error) {
      console.error('❌ Exception getting revenue trend:', error);
      return [];
    }
  }

  // ===== PERFORMANCE ANALYTICS =====

  /**
   * Get system performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics | null> {
    try {
      const { data: metrics, error } = await this.supabase
        .rpc('get_performance_metrics');

      if (error) {
        console.error('❌ Error getting performance metrics:', error);
        return null;
      }

      return metrics as PerformanceMetrics;
    } catch (error) {
      console.error('❌ Exception getting performance metrics:', error);
      return null;
    }
  }

  /**
   * Track user event for analytics
   */
  async trackEvent(
    userId: string,
    eventName: string,
    properties?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('analytics_events')
        .insert({
          user_id: userId,
          event_name: eventName,
          properties: properties || {},
          timestamp: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('❌ Exception tracking event:', error);
      return false;
    }
  }

  /**
   * Record page view for analytics
   */
  async trackPageView(
    userId: string,
    page: string,
    referrer?: string,
    sessionId?: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('analytics_page_views')
        .insert({
          user_id: userId,
          page,
          referrer,
          session_id: sessionId,
          timestamp: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('❌ Exception tracking page view:', error);
      return false;
    }
  }

  // ===== DASHBOARD FUNCTIONS =====

  /**
   * Get dashboard metrics for admin
   */
  async getDashboardMetrics(timeRange: TimeRange = '30d'): Promise<{
    userMetrics: MetricData[];
    clubMetrics: MetricData[];
    revenueMetrics: MetricData[];
    performanceMetrics: MetricData[];
  } | null> {
    try {
      const dateRange = this.getDateRange(timeRange);

      const { data: dashboard, error } = await this.supabase
        .rpc('get_dashboard_metrics', {
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString()
        });

      if (error) {
        console.error('❌ Error getting dashboard metrics:', error);
        return null;
      }

      return {
        userMetrics: this.formatMetricData(dashboard?.user_metrics || []),
        clubMetrics: this.formatMetricData(dashboard?.club_metrics || []),
        revenueMetrics: this.formatMetricData(dashboard?.revenue_metrics || []),
        performanceMetrics: this.formatMetricData(dashboard?.performance_metrics || [])
      };
    } catch (error) {
      console.error('❌ Exception getting dashboard metrics:', error);
      return null;
    }
  }

  /**
   * Get chart data for visualization
   */
  async getChartData(
    metricType: MetricType,
    chartType: ChartType,
    filters: AnalyticsFilters
  ): Promise<ChartData | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_chart_data', {
          metric_type: metricType,
          chart_type: chartType,
          filters: filters
        });

      if (error) {
        console.error('❌ Error getting chart data:', error);
        return null;
      }

      return data as ChartData;
    } catch (error) {
      console.error('❌ Exception getting chart data:', error);
      return null;
    }
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Get date range for time range
   */
  private getDateRange(timeRange: TimeRange): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (timeRange) {
      case '1d':
        start.setDate(end.getDate() - 1);
        break;
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        break;
      case 'all':
        start.setFullYear(2020); // Application start year
        break;
    }

    return { start, end };
  }

  /**
   * Get interval type for time range
   */
  private getIntervalType(timeRange: TimeRange): string {
    switch (timeRange) {
      case '1d':
        return 'hour';
      case '7d':
        return 'day';
      case '30d':
      case '90d':
        return 'day';
      case '1y':
      case 'all':
        return 'month';
      default:
        return 'day';
    }
  }

  /**
   * Format date label based on time range
   */
  private formatDateLabel(date: string, timeRange: TimeRange): string {
    const d = new Date(date);
    
    switch (timeRange) {
      case '1d':
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      case '7d':
      case '30d':
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      case '90d':
      case '1y':
      case 'all':
        return d.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
      default:
        return d.toLocaleDateString('vi-VN');
    }
  }

  /**
   * Format metric data for display
   */
  private formatMetricData(rawMetrics: any[]): MetricData[] {
    return rawMetrics.map(metric => ({
      label: metric.label,
      value: metric.value,
      change: metric.change,
      changeType: this.getChangeType(metric.change),
      unit: metric.unit,
      format: metric.format
    }));
  }

  /**
   * Get change type from change value
   */
  private getChangeType(change: number): 'increase' | 'decrease' | 'neutral' {
    if (change > 0) return 'increase';
    if (change < 0) return 'decrease';
    return 'neutral';
  }

  /**
   * Format value for display
   */
  formatValue(value: number, format: 'number' | 'currency' | 'percentage' = 'number', locale: string = 'vi-VN'): string {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'VND'
        }).format(value);
      case 'percentage':
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }).format(value / 100);
      default:
        return new Intl.NumberFormat(locale).format(value);
    }
  }

  /**
   * Calculate percentage change
   */
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Get growth indicator color
   */
  getGrowthColor(change: number): string {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  }

  /**
   * Get growth indicator icon
   */
  getGrowthIcon(change: number): string {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Create factory function for AnalyticsService
 */
export function createAnalyticsService(supabase: SupabaseClient): AnalyticsService {
  return new AnalyticsService(supabase);
}

/**
 * Aggregate metrics by time period
 */
export function aggregateMetricsByPeriod(
  data: TimeSeriesData[],
  period: 'hour' | 'day' | 'week' | 'month'
): TimeSeriesData[] {
  const aggregated = new Map<string, number>();
  
  data.forEach(item => {
    const date = new Date(item.timestamp);
    let key: string;
    
    switch (period) {
      case 'hour':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
        break;
      case 'day':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${date.getMonth()}`;
        break;
      default:
        key = item.timestamp;
    }
    
    aggregated.set(key, (aggregated.get(key) || 0) + item.value);
  });
  
  return Array.from(aggregated.entries()).map(([key, value]) => ({
    timestamp: key,
    value,
    label: key
  }));
}

/**
 * Calculate moving average for trend smoothing
 */
export function calculateMovingAverage(
  data: TimeSeriesData[],
  windowSize: number = 7
): TimeSeriesData[] {
  if (data.length < windowSize) return data;
  
  const smoothed: TimeSeriesData[] = [];
  
  for (let i = windowSize - 1; i < data.length; i++) {
    const window = data.slice(i - windowSize + 1, i + 1);
    const average = window.reduce((sum, item) => sum + item.value, 0) / windowSize;
    
    smoothed.push({
      timestamp: data[i].timestamp,
      value: average,
      label: data[i].label
    });
  }
  
  return smoothed;
}

export default AnalyticsService;
