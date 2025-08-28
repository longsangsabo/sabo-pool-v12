import { useAdminAuth } from '../hooks/useAdminAuth'
import { 
  Users, 
  Trophy, 
  Building2, 
  DollarSign, 
  Activity, 
  Settings,
  Database,
  Bell,
  LogOut,
  Shield
} from 'lucide-react'

export function AdminDashboardPage() {
  const { user, profile, signOut } = useAdminAuth()

  const dashboardCards = [
    {
      title: 'User Management',
      description: 'Manage user accounts, profiles, and permissions',
      icon: Users,
      count: '2,547',
      href: '/users',
      color: 'bg-blue-500'
    },
    {
      title: 'Tournament Management',
      description: 'Create and manage tournaments and brackets',
      icon: Trophy,
      count: '42',
      href: '/tournaments',
      color: 'bg-green-500'
    },
    {
      title: 'Club Management',
      description: 'Oversee clubs and member registrations',
      icon: Building2,
      count: '156',
      href: '/clubs',
      color: 'bg-purple-500'
    },
    {
      title: 'Financial Management',
      description: 'Monitor transactions and payments',
      icon: DollarSign,
      count: '$24,851',
      href: '/transactions',
      color: 'bg-yellow-500'
    },
    {
      title: 'System Analytics',
      description: 'View system performance and usage statistics',
      icon: Activity,
      count: '99.2%',
      href: '/analytics',
      color: 'bg-red-500'
    },
    {
      title: 'System Settings',
      description: 'Configure system parameters and features',
      icon: Settings,
      count: '12',
      href: '/settings',
      color: 'bg-gray-500'
    },
    {
      title: 'Database Operations',
      description: 'Database management and maintenance',
      icon: Database,
      count: 'Online',
      href: '/database',
      color: 'bg-indigo-500'
    },
    {
      title: 'Notifications',
      description: 'Manage system notifications and alerts',
      icon: Bell,
      count: '7',
      href: '/notifications',
      color: 'bg-orange-500'
    }
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SABO Arena Admin</h1>
                <p className="text-sm text-gray-400">Administrative Console</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{profile?.display_name || user?.email}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome back, {profile?.display_name || 'Administrator'}
          </h2>
          <p className="text-gray-400">
            Manage your SABO Arena platform from this centralized admin console.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardCards.map((card) => {
            const IconComponent = card.icon
            return (
              <div
                key={card.href}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {card.count}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {card.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors text-left">
              <h4 className="font-semibold">Create Tournament</h4>
              <p className="text-sm text-blue-100">Start a new tournament</p>
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors text-left">
              <h4 className="font-semibold">Add New User</h4>
              <p className="text-sm text-green-100">Register a new player</p>
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors text-left">
              <h4 className="font-semibold">System Backup</h4>
              <p className="text-sm text-purple-100">Create data backup</p>
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg transition-colors text-left">
              <h4 className="font-semibold">View Reports</h4>
              <p className="text-sm text-orange-100">Generate analytics</p>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-white mb-6">System Status</h3>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">99.2%</div>
                <div className="text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">2,547</div>
                <div className="text-gray-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">156</div>
                <div className="text-gray-400">Active Clubs</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
