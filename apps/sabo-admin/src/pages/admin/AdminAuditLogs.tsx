import { useState } from 'react'
import { Search, Download, Shield, User, Settings, Activity } from 'lucide-react'

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  details: string
  ipAddress: string
  userAgent: string
  status: 'success' | 'failed' | 'warning'
}

export default function AdminAuditLogs() {
  const [logs] = useState<AuditLog[]>([
    {
      id: '1',
      timestamp: '2024-08-28 14:30:25',
      user: 'admin@sabo.com',
      action: 'USER_LOGIN',
      resource: 'Authentication',
      details: 'Successful login from admin panel',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'success'
    },
    {
      id: '2',
      timestamp: '2024-08-28 14:25:12',
      user: 'manager@club1.com',
      action: 'TOURNAMENT_CREATED',
      resource: 'Tournament Management',
      details: 'Created new tournament: Summer Championship 2024',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      status: 'success'
    },
    {
      id: '3',
      timestamp: '2024-08-28 14:20:45',
      user: 'user@example.com',
      action: 'LOGIN_FAILED',
      resource: 'Authentication',
      details: 'Failed login attempt - invalid password',
      ipAddress: '203.0.113.45',
      userAgent: 'Mozilla/5.0 (Linux; Android 10)',
      status: 'failed'
    },
    {
      id: '4',
      timestamp: '2024-08-28 14:15:33',
      user: 'admin@sabo.com',
      action: 'USER_PERMISSIONS_MODIFIED',
      resource: 'User Management',
      details: 'Modified permissions for user: john.doe@email.com',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'success'
    },
    {
      id: '5',
      timestamp: '2024-08-28 14:10:18',
      user: 'system',
      action: 'BACKUP_COMPLETED',
      resource: 'System Maintenance',
      details: 'Automated database backup completed successfully',
      ipAddress: 'localhost',
      userAgent: 'System/1.0',
      status: 'success'
    },
    {
      id: '6',
      timestamp: '2024-08-28 14:05:07',
      user: 'clubmanager@club2.com',
      action: 'CLUB_SETTINGS_UPDATED',
      resource: 'Club Management',
      details: 'Updated club profile and contact information',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
      status: 'success'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [dateRange, setDateRange] = useState('today')

  const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'USER_LOGIN', label: 'User Login' },
    { value: 'LOGIN_FAILED', label: 'Failed Login' },
    { value: 'TOURNAMENT_CREATED', label: 'Tournament Created' },
    { value: 'USER_PERMISSIONS_MODIFIED', label: 'Permissions Modified' },
    { value: 'BACKUP_COMPLETED', label: 'Backup Completed' },
    { value: 'CLUB_SETTINGS_UPDATED', label: 'Club Settings Updated' }
  ]

  const statusTypes = [
    { value: 'all', label: 'All Status' },
    { value: 'success', label: 'Success' },
    { value: 'failed', label: 'Failed' },
    { value: 'warning', label: 'Warning' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return <User className="h-4 w-4" />
    if (action.includes('TOURNAMENT') || action.includes('CLUB')) return <Activity className="h-4 w-4" />
    if (action.includes('PERMISSIONS') || action.includes('SETTINGS')) return <Settings className="h-4 w-4" />
    return <Shield className="h-4 w-4" />
  }

  const handleExportLogs = () => {
    // Log export functionality
    alert('Audit logs export initiated. Download will start shortly.')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📋 Audit Logs</h1>
        <button 
          onClick={handleExportLogs}
          className="px-4 py-2 bg-blue-600 text-var(--color-background) rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Logs
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Total Events</p>
              <p className="text-2xl font-bold">1,247</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Failed Attempts</p>
              <p className="text-2xl font-bold">23</p>
            </div>
            <Shield className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Unique Users</p>
              <p className="text-2xl font-bold">145</p>
            </div>
            <User className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Security Events</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <Settings className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-var(--color-background) dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <select 
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            {actionTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            {statusTypes.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-var(--color-background) dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral dark:border-gray-700">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-background dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-background dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm font-mono">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm">{log.user}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <div>
                        <div className="font-medium text-sm">{log.action}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{log.details}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{log.resource}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">🔍 Advanced Search</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Search logs with complex filters</p>
          <button className="w-full px-4 py-2 bg-purple-600 text-var(--color-background) rounded hover:bg-purple-700">
            Advanced Search
          </button>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">🚨 Set Alerts</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Configure alerts for suspicious activity</p>
          <button className="w-full px-4 py-2 bg-orange-600 text-var(--color-background) rounded hover:bg-orange-700">
            Configure Alerts
          </button>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📊 Log Analytics</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">View detailed analytics and trends</p>
          <button className="w-full px-4 py-2 bg-teal-600 text-var(--color-background) rounded hover:bg-teal-700">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  )
}
