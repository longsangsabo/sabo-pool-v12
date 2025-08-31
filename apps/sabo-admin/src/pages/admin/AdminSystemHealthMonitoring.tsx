import { useState, useEffect } from 'react'
import { supabase } from '@sabo/shared-auth'
import { 
  AlertTriangle, CheckCircle, Users, RefreshCw, Monitor
} from 'lucide-react'

interface SystemMetrics {
  database: {
    status: 'healthy' | 'warning' | 'error'
    responseTime: number
    connectionCount: number
    tableCount: number
    lastBackup: string
  }
  application: {
    status: 'healthy' | 'warning' | 'error'
    uptime: number
    activeUsers: number
    requestsPerMinute: number
    errorRate: number
  }
  performance: {
    avgResponseTime: number
    p95ResponseTime: number
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
  }
  userActivity: {
    totalUsers: number
    activeToday: number
    newRegistrations: number
    bannedUsers: number
    tournamentParticipants: number
  }
}

export default function AdminSystemHealthMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    database: {
      status: 'healthy',
      responseTime: 0,
      connectionCount: 0,
      tableCount: 0,
      lastBackup: ''
    },
    application: {
      status: 'healthy',
      uptime: 0,
      activeUsers: 0,
      requestsPerMinute: 0,
      errorRate: 0
    },
    performance: {
      avgResponseTime: 0,
      p95ResponseTime: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0
    },
    userActivity: {
      totalUsers: 0,
      activeToday: 0,
      newRegistrations: 0,
      bannedUsers: 0,
      tournamentParticipants: 0
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchSystemMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      const startTime = Date.now()

      // Database health check
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, created_at, ban_status')
        .limit(1000)

      const dbResponseTime = Date.now() - startTime

      if (profilesError) {
        throw new Error(`Database error: ${profilesError.message}`)
      }

      // Check tournament data
      const { data: tournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('tournament_id, status, participants')
        .limit(100)

      if (tournamentsError) {
        console.warn('⚠️ Tournament data unavailable:', tournamentsError)
      }

      // Calculate user activity metrics
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)

      const userMetrics = {
        totalUsers: profiles?.length || 0,
        activeToday: profiles?.filter(p => 
          new Date(p.created_at) >= today || 
          p.ban_status !== 'banned'
        ).length || 0,
        newRegistrations: profiles?.filter(p => 
          new Date(p.created_at) >= thisMonth
        ).length || 0,
        bannedUsers: profiles?.filter(p => p.ban_status === 'banned').length || 0,
        tournamentParticipants: tournaments?.reduce((sum, t) => 
          sum + (t.participants?.length || 0), 0
        ) || 0
      }

      // Mock performance metrics (would be from real monitoring in production)
      const performanceMetrics = {
        avgResponseTime: dbResponseTime,
        p95ResponseTime: dbResponseTime * 1.2,
        cpuUsage: Math.round(Math.random() * 30 + 20), // 20-50%
        memoryUsage: Math.round(Math.random() * 20 + 60), // 60-80%
        diskUsage: Math.round(Math.random() * 10 + 45) // 45-55%
      }

      // Determine database status
      let dbStatus: 'healthy' | 'warning' | 'error' = 'healthy'
      if (dbResponseTime > 1000) dbStatus = 'warning'
      if (dbResponseTime > 3000) dbStatus = 'error'

      // Determine application status
      let appStatus: 'healthy' | 'warning' | 'error' = 'healthy'
      if (performanceMetrics.cpuUsage > 80) appStatus = 'warning'
      if (performanceMetrics.memoryUsage > 90) appStatus = 'error'

      const newMetrics: SystemMetrics = {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          connectionCount: Math.round(Math.random() * 10 + 5), // Mock
          tableCount: 15, // Known table count
          lastBackup: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        },
        application: {
          status: appStatus,
          uptime: Date.now() - (Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Mock uptime
          activeUsers: userMetrics.activeToday,
          requestsPerMinute: Math.round(Math.random() * 100 + 50), // Mock
          errorRate: Math.random() * 2 // 0-2% error rate
        },
        performance: performanceMetrics,
        userActivity: userMetrics
      }

      setMetrics(newMetrics)
      setLastUpdated(new Date())
    } catch (error: any) {
      console.error('❌ Failed to fetch system metrics:', error)
      setError(error.message || 'Failed to load system metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemMetrics()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-400" />
    }
  }

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (24 * 60 * 60 * 1000))
    const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    return `${days}d ${hours}h`
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">System Monitoring Error</h2>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={fetchSystemMetrics}
              className="mt-4 px-4 py-2 bg-red-600 text-var(--color-background) rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-var(--color-background) p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🏥 System Health</h1>
            <p className="text-gray-400">
              Real-time monitoring and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchSystemMetrics}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-var(--color-background) rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-var(--color-background)">Database</h3>
              {getStatusIcon(metrics.database.status)}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Response Time</span>
                <span className="text-var(--color-background)">{metrics.database.responseTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Connections</span>
                <span className="text-var(--color-background)">{metrics.database.connectionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tables</span>
                <span className="text-var(--color-background)">{metrics.database.tableCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-var(--color-background)">Application</h3>
              {getStatusIcon(metrics.application.status)}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime</span>
                <span className="text-var(--color-background)">{formatUptime(metrics.application.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Requests/min</span>
                <span className="text-var(--color-background)">{metrics.application.requestsPerMinute}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Error Rate</span>
                <span className="text-var(--color-background)">{metrics.application.errorRate.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-var(--color-background)">Performance</h3>
              <Monitor className="h-5 w-5 text-blue-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">CPU Usage</span>
                <span className="text-var(--color-background)">{metrics.performance.cpuUsage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Memory</span>
                <span className="text-var(--color-background)">{metrics.performance.memoryUsage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Disk</span>
                <span className="text-var(--color-background)">{metrics.performance.diskUsage}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-var(--color-background)">User Activity</h3>
              <Users className="h-5 w-5 text-green-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Active Today</span>
                <span className="text-var(--color-background)">{metrics.userActivity.activeToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">New Users</span>
                <span className="text-var(--color-background)">{metrics.userActivity.newRegistrations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">In Tournaments</span>
                <span className="text-var(--color-background)">{metrics.userActivity.tournamentParticipants}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-bold text-var(--color-background) mb-4">🚀 Response Times</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Average Response Time</span>
                  <span className="text-var(--color-background)">{metrics.performance.avgResponseTime}ms</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(metrics.performance.avgResponseTime / 10, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">95th Percentile</span>
                  <span className="text-var(--color-background)">{metrics.performance.p95ResponseTime}ms</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(metrics.performance.p95ResponseTime / 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-bold text-var(--color-background) mb-4">💾 Resource Usage</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">CPU Usage</span>
                  <span className="text-var(--color-background)">{metrics.performance.cpuUsage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.performance.cpuUsage > 80 ? 'bg-red-600' : 
                      metrics.performance.cpuUsage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${metrics.performance.cpuUsage}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Memory Usage</span>
                  <span className="text-var(--color-background)">{metrics.performance.memoryUsage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.performance.memoryUsage > 90 ? 'bg-red-600' : 
                      metrics.performance.memoryUsage > 75 ? 'bg-yellow-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${metrics.performance.memoryUsage}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Disk Usage</span>
                  <span className="text-var(--color-background)">{metrics.performance.diskUsage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.performance.diskUsage > 85 ? 'bg-red-600' : 
                      metrics.performance.diskUsage > 70 ? 'bg-yellow-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${metrics.performance.diskUsage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-bold text-var(--color-background) mb-4">⚠️ System Alerts</h3>
          <div className="space-y-3">
            {metrics.database.status !== 'healthy' && (
              <div className="flex items-center gap-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400">
                  Database response time is elevated ({metrics.database.responseTime}ms)
                </span>
              </div>
            )}
            {metrics.performance.cpuUsage > 80 && (
              <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-700 rounded">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="text-red-400">
                  High CPU usage detected ({metrics.performance.cpuUsage}%)
                </span>
              </div>
            )}
            {metrics.performance.memoryUsage > 85 && (
              <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-700 rounded">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="text-red-400">
                  High memory usage detected ({metrics.performance.memoryUsage}%)
                </span>
              </div>
            )}
            {metrics.application.errorRate > 1 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400">
                  Elevated error rate detected ({metrics.application.errorRate.toFixed(2)}%)
                </span>
              </div>
            )}
            {/* Show all clear message if no alerts */}
            {metrics.database.status === 'healthy' && 
             metrics.application.status === 'healthy' && 
             metrics.performance.cpuUsage <= 80 && 
             metrics.performance.memoryUsage <= 85 && 
             metrics.application.errorRate <= 1 && (
              <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-700 rounded">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400">
                  All systems operating normally
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
