import { useState } from 'react'
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react'

interface AnalyticsData {
  userGrowth: { month: string; users: number; growth: number }[]
  tournamentStats: { type: string; count: number; revenue: number }[]
  topClubs: { name: string; members: number; activity: number }[]
  platformMetrics: {
    totalUsers: number
    activeUsers: number
    totalTournaments: number
    revenue: number
  }
}

export default function AdminAnalytics() {
  const [analytics] = useState<AnalyticsData>({
    userGrowth: [
      { month: 'Jan', users: 1200, growth: 15 },
      { month: 'Feb', users: 1380, growth: 15 },
      { month: 'Mar', users: 1587, growth: 15 },
      { month: 'Apr', users: 1825, growth: 15 },
      { month: 'May', users: 2099, growth: 15 },
      { month: 'Jun', users: 2414, growth: 15 }
    ],
    tournamentStats: [
      { type: 'Single Elimination', count: 45, revenue: 12500 },
      { type: 'Round Robin', count: 32, revenue: 8900 },
      { type: 'Swiss System', count: 18, revenue: 5400 }
    ],
    topClubs: [
      { name: 'Elite Billiards Club', members: 156, activity: 92 },
      { name: 'Champions Pool Hall', members: 134, activity: 87 },
      { name: 'Royal Cue Sports', members: 112, activity: 78 }
    ],
    platformMetrics: {
      totalUsers: 2414,
      activeUsers: 1847,
      totalTournaments: 95,
      revenue: 26800
    }
  })

  const [dateRange, setDateRange] = useState('30d')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📈 Analytics Dashboard</h1>
        <div className="flex gap-4">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold">{analytics.platformMetrics.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-sm text-success mt-2">↗ +15% from last month</p>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold">{analytics.platformMetrics.activeUsers.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-sm text-success mt-2">↗ +8% from last month</p>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Tournaments</p>
              <p className="text-2xl font-bold">{analytics.platformMetrics.totalTournaments}</p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-sm text-success mt-2">↗ +22% from last month</p>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Revenue</p>
              <p className="text-2xl font-bold">${analytics.platformMetrics.revenue.toLocaleString()}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-sm text-success mt-2">↗ +18% from last month</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <div className="space-y-4">
            {analytics.userGrowth.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{data.month}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(data.users / 2500) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-12">{data.users}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tournament Types */}
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Tournament Statistics</h3>
          <div className="space-y-4">
            {analytics.tournamentStats.map((stat, index) => (
              <div key={index} className="border-b border-neutral dark:border-gray-700 pb-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{stat.type}</span>
                  <span className="text-sm text-neutral dark:text-gray-400">{stat.count} tournaments</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral dark:text-gray-400">Revenue:</span>
                  <span className="font-medium text-success">${stat.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Clubs */}
      <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top Performing Clubs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral dark:border-gray-700">
                <th className="text-left py-2">Club Name</th>
                <th className="text-left py-2">Members</th>
                <th className="text-left py-2">Activity Score</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topClubs.map((club, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3">{club.name}</td>
                  <td className="py-3">{club.members}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${club.activity}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{club.activity}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
