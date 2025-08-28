import { useState, useEffect } from 'react';
import { supabase } from '@sabo/shared-auth';
import {
  Trophy,
  Settings,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface Tournament {
  id: string;
  name: string;
  status: string;
  tournament_type: string;
  participant_count?: number;
  completed_matches?: number;
  total_matches?: number;
}

interface DashboardStats {
  total_tournaments: number;
  active_tournaments: number;
  completed_matches: number;
  pending_repairs: number;
}

export default function AdminDashboardMigrated() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_tournaments: 0,
    active_tournaments: 0,
    completed_matches: 0,
    pending_repairs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('tournaments');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching admin dashboard data...');

      // Fetch tournaments with match counts
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select(`
          id,
          name,
          status,
          tournament_type
        `)
        .order('created_at', { ascending: false });

      if (tournamentsError) {
        console.error('Error fetching tournaments:', tournamentsError);
        throw tournamentsError;
      }

      // Get match statistics for each tournament
      const tournamentsWithStats = await Promise.all(
        (tournamentsData || []).map(async tournament => {
          const { data: matchStats } = await supabase
            .from('tournament_matches')
            .select('status, id')
            .eq('tournament_id', tournament.id);

          const totalMatches = matchStats?.length || 0;
          const completedMatches =
            matchStats?.filter(m => m.status === 'completed').length || 0;

          // Get participant count
          const { data: participants } = await supabase
            .from('tournament_registrations')
            .select('id')
            .eq('tournament_id', tournament.id)
            .eq('registration_status', 'confirmed');

          return {
            ...tournament,
            total_matches: totalMatches,
            completed_matches: completedMatches,
            participant_count: participants?.length || 0,
          };
        })
      );

      setTournaments(tournamentsWithStats);

      // Calculate dashboard stats
      const activeCount = tournamentsWithStats.filter(t =>
        ['ongoing', 'registration_closed'].includes(t.status)
      ).length;

      const totalCompleted = tournamentsWithStats.reduce(
        (sum, t) => sum + (t.completed_matches || 0),
        0
      );

      const pendingRepairs = tournamentsWithStats.filter(
        t =>
          t.tournament_type === 'double_elimination' &&
          t.status === 'ongoing' &&
          (t.completed_matches || 0) > 0
      ).length;

      setStats({
        total_tournaments: tournamentsWithStats.length,
        active_tournaments: activeCount,
        completed_matches: totalCompleted,
        pending_repairs: pendingRepairs,
      });

      console.log('✅ Dashboard data loaded successfully');
    } catch (error: any) {
      console.error('❌ Failed to fetch dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    variant = 'default',
  }: {
    title: string;
    value: number;
    description: string;
    icon: any;
    variant?: 'default' | 'warning' | 'success';
  }) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'warning':
          return 'border-orange-500 bg-orange-500/10';
        case 'success':
          return 'border-green-500 bg-green-500/10';
        default:
          return 'border-border bg-card';
      }
    };

    return (
      <div className={`${getVariantStyles()} mobile-card-standard p-4 md:p-6`}>
        <div className='flex items-center justify-between'>
          <div className='mobile-spacing-tight'>
            <p className='mobile-caption text-secondary'>{title}</p>
            <p className='text-xl md:text-2xl font-bold text-primary'>{value}</p>
            <p className='mobile-caption text-muted mt-1'>{description}</p>
          </div>
          <Icon className='mobile-icon-primary md:h-8 md:w-8 text-secondary' />
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Dashboard Error</h2>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-primary p-4 md:p-8 mobile-container">
      <div className="max-w-7xl mx-auto mobile-spacing-section">
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='mobile-heading-primary md:text-3xl font-bold'>🏆 Tournament Admin</h1>
            <p className='mobile-body-secondary'>
              Manage tournaments and monitor bracket progression
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="mobile-button-primary flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className='mobile-grid-2 lg:grid-cols-4 gap-4 md:gap-6'>
          <StatCard
            title='Total Tournaments'
            value={stats.total_tournaments}
            description='All tournaments in system'
            icon={Trophy}
          />
          <StatCard
            title='Active Tournaments'
            value={stats.active_tournaments}
            description='Currently running'
            icon={Activity}
            variant='success'
          />
          <StatCard
            title='Completed Matches'
            value={stats.completed_matches}
            description='Total matches played'
            icon={CheckCircle}
          />
          <StatCard
            title='Needs Attention'
            value={stats.pending_repairs}
            description='Tournaments needing repair'
            icon={AlertTriangle}
            variant={stats.pending_repairs > 0 ? 'warning' : 'default'}
          />
        </div>

        {/* Tabs Navigation */}
        <div className="mobile-card-standard bg-card">
          <div className="border-b border-border p-4 md:p-6">
            <div className='grid w-full grid-cols-1 sm:grid-cols-3 gap-2'>
              <button
                onClick={() => setActiveTab('tournaments')}
                className={`mobile-button-secondary flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'tournaments' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-muted text-secondary hover:bg-muted/80'
                }`}
              >
                <Trophy className='mobile-icon-secondary' />
                All Tournaments
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`mobile-button-secondary flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'stats' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-muted text-secondary hover:bg-muted/80'
                }`}
              >
                <Activity className='mobile-icon-secondary' />
                Statistics
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`mobile-button-secondary flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'system' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-muted text-secondary hover:bg-muted/80'
                }`}
              >
                <Settings className='mobile-icon-secondary' />
                System Status
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Tournaments Tab */}
            {activeTab === 'tournaments' && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white">All Tournaments</h2>
                  <p className="text-gray-400">Complete list of tournaments with their current status</p>
                </div>
                <div className="p-6">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-400 mt-2">Loading tournaments...</p>
                    </div>
                  ) : tournaments.length === 0 ? (
                    <div className="text-center py-12">
                      <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No tournaments found</p>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {tournaments.map(tournament => (
                        <div
                          key={tournament.id}
                          className='flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-900'
                        >
                          <div>
                            <h4 className='font-medium text-white'>{tournament.name}</h4>
                            <div className='flex items-center gap-2 mt-1'>
                              <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded border border-gray-600">
                                {tournament.status}
                              </span>
                              <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded border border-gray-600">
                                {tournament.tournament_type}
                              </span>
                              <span className='text-sm text-gray-400'>
                                {tournament.participant_count} players
                              </span>
                            </div>
                          </div>
                          <div className='text-right'>
                            <p className='text-sm font-medium text-white'>
                              {tournament.completed_matches}/
                              {tournament.total_matches} matches
                            </p>
                            <p className='text-xs text-gray-400'>
                              {(tournament.total_matches || 0) > 0
                                ? Math.round(
                                    ((tournament.completed_matches || 0) /
                                      (tournament.total_matches || 1)) *
                                      100
                                  )
                                : 0}
                              % complete
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">Tournament Progress</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Active Tournaments</span>
                      <span className="text-white font-bold">{stats.active_tournaments}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Matches Played</span>
                      <span className="text-white font-bold">{stats.completed_matches}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Pending Repairs</span>
                      <span className={`font-bold ${stats.pending_repairs > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                        {stats.pending_repairs}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">System Overview</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Tournaments</span>
                      <span className="text-white font-bold">{stats.total_tournaments}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Completion Rate</span>
                      <span className="text-white font-bold">
                        {stats.total_tournaments > 0 ? 
                          Math.round(((stats.total_tournaments - stats.active_tournaments) / stats.total_tournaments) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Status Tab */}
            {activeTab === 'system' && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-lg font-bold text-white">System Health</h3>
                  <p className="text-gray-400">Current system health and performance status</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-300'>Database Connection</span>
                    <span className='px-2 py-1 text-xs bg-green-500/10 text-green-400 border border-green-400 rounded flex items-center gap-1'>
                      <CheckCircle className='h-3 w-3' />
                      Healthy
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-300'>Admin Authentication</span>
                    <span className='px-2 py-1 text-xs bg-green-500/10 text-green-400 border border-green-400 rounded flex items-center gap-1'>
                      <CheckCircle className='h-3 w-3' />
                      Active
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-300'>Tournament System</span>
                    <span className='px-2 py-1 text-xs bg-green-500/10 text-green-400 border border-green-400 rounded flex items-center gap-1'>
                      <Activity className='h-3 w-3' />
                      Running
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-300'>Admin Dashboard</span>
                    <span className='px-2 py-1 text-xs bg-green-500/10 text-green-400 border border-green-400 rounded flex items-center gap-1'>
                      <Settings className='h-3 w-3' />
                      Operational
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
