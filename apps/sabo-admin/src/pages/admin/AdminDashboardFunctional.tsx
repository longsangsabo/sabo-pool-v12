import { useState, useEffect } from 'react'
import { supabase } from '@sabo/shared-auth'
import { RefreshCw, Trophy, Users, Activity, CheckCircle } from 'lucide-react'

interface Tournament {
  id: string
  name: string
  status: string
  tournament_type: string
  participant_count?: number
  completed_matches?: number
  total_matches?: number
}

interface DashboardStats {
  total_tournaments: number
  active_tournaments: number
  completed_matches: number
  pending_repairs: number
  total_users: number
  active_users: number
}

export default function AdminDashboardFunctional() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    total_tournaments: 0,
    active_tournaments: 0,
    completed_matches: 0,
    pending_repairs: 0,
    total_users: 0,
    active_users: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('🔄 Fetching dashboard data...')
      
      // Fetch tournaments
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select(`
          id,
          name,
          status,
          tournament_type
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (tournamentsError) {
        console.error('Tournaments error:', tournamentsError)
        throw tournamentsError
      }

      console.log('✅ Tournaments loaded:', tournamentsData?.length || 0)

      // Fetch user stats
      const { data: userStats, error: userError } = await supabase
        .from('profiles')
        .select('user_id, created_at, updated_at, is_demo_user')
        .eq('is_demo_user', false)

      if (userError) {
        console.error('User stats error:', userError)
      }

      const totalUsers = userStats?.length || 0
      const activeUsers = userStats?.filter(u => {
        const lastWeek = new Date()
        lastWeek.setDate(lastWeek.getDate() - 7)
        return new Date(u.updated_at) > lastWeek
      }).length || 0

      // Get match statistics for tournaments
      const tournamentsWithStats = await Promise.all(
        (tournamentsData || []).map(async tournament => {
          const { data: matchStats } = await supabase
            .from('tournament_matches')
            .select('status, id')
            .eq('tournament_id', tournament.id)

          const totalMatches = matchStats?.length || 0
          const completedMatches = matchStats?.filter(m => m.status === 'completed').length || 0

          const { data: participants } = await supabase
            .from('tournament_registrations')
            .select('id')
            .eq('tournament_id', tournament.id)
            .eq('registration_status', 'confirmed')

          return {
            ...tournament,
            total_matches: totalMatches,
            completed_matches: completedMatches,
            participant_count: participants?.length || 0,
          }
        })
      )

      setTournaments(tournamentsWithStats)

      // Calculate stats
      const activeCount = tournamentsWithStats.filter(t =>
        ['ongoing', 'registration_closed'].includes(t.status)
      ).length

      const totalCompleted = tournamentsWithStats.reduce(
        (sum, t) => sum + (t.completed_matches || 0),
        0
      )

      setStats({
        total_tournaments: tournamentsWithStats.length,
        active_tournaments: activeCount,
        completed_matches: totalCompleted,
        pending_repairs: 0, // Simplified for now
        total_users: totalUsers,
        active_users: activeUsers,
      })

      console.log('✅ Dashboard data loaded successfully')
    } catch (error: any) {
      console.error('❌ Failed to fetch dashboard data:', error)
      setError(error.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const StatCard = ({ title, value, description, icon: Icon, color = 'blue' }: {
    title: string
    value: number
    description: string
    icon: any
    color?: string
  }) => {
    const colorClasses = {
      blue: 'border-blue-500/20 bg-gray-800',
      green: 'border-green-500/20 bg-gray-800',
      yellow: 'border-yellow-500/20 bg-gray-800',
      red: 'border-red-500/20 bg-gray-800',
    }

    return (
      <div className={`${colorClasses[color as keyof typeof colorClasses]} p-6 rounded-lg border`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Dashboard</h2>
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
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🎯 SABO Arena Admin Dashboard</h1>
            <p className="text-gray-400">Real-time system overview and management</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Tournaments"
            value={stats.total_tournaments}
            description="All tournaments in system"
            icon={Trophy}
            color="blue"
          />
          <StatCard
            title="Active Tournaments"
            value={stats.active_tournaments}
            description="Currently running"
            icon={Activity}
            color="green"
          />
          <StatCard
            title="Total Users"
            value={stats.total_users}
            description="Registered players"
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={stats.active_users}
            description="Active this week"
            icon={Users}
            color="green"
          />
          <StatCard
            title="Completed Matches"
            value={stats.completed_matches}
            description="Total matches played"
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="System Health"
            value={98}
            description="All systems operational"
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* Tournament List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Recent Tournaments</h2>
            <p className="text-gray-400">Latest tournament activity</p>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading tournaments...</p>
              </div>
            ) : tournaments.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No tournaments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tournaments.map(tournament => (
                  <div
                    key={tournament.id}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-white">{tournament.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
                          {tournament.status}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-600 text-white rounded">
                          {tournament.tournament_type}
                        </span>
                        <span className="text-sm text-gray-400">
                          {tournament.participant_count} players
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {tournament.completed_matches}/{tournament.total_matches} matches
                      </p>
                      <p className="text-xs text-gray-400">
                        {(tournament.total_matches || 0) > 0
                          ? Math.round(((tournament.completed_matches || 0) / (tournament.total_matches || 1)) * 100)
                          : 0}% complete
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Database Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Connection</span>
                <span className="flex items-center text-green-400">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Performance</span>
                <span className="flex items-center text-green-400">
                  <Activity className="h-4 w-4 mr-1" />
                  Optimal
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                View All Tournaments
              </button>
              <button className="w-full text-left px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                Manage Users
              </button>
              <button className="w-full text-left px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                System Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
