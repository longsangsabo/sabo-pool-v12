import { useState } from 'react'
import { Bell, Send, Edit, Trash2, Users, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  status: 'sent' | 'scheduled' | 'draft'
  recipients: number
  sentAt?: string
  scheduledAt?: string
  channels: ('push' | 'email' | 'sms' | 'in-app')[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  readCount: number
}

export default function AdminNotifications() {
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Tournament Registration Open',
      message: 'Summer Championship 2024 registration is now open. Register before September 15th!',
      type: 'info',
      status: 'sent',
      recipients: 1247,
      sentAt: '2024-08-28 10:00:00',
      channels: ['push', 'email', 'in-app'],
      priority: 'high',
      readCount: 892
    },
    {
      id: '2',
      title: 'System Maintenance Notice',
      message: 'Scheduled maintenance on September 1st from 2:00 AM to 4:00 AM UTC.',
      type: 'warning',
      status: 'scheduled',
      recipients: 2500,
      scheduledAt: '2024-08-30 18:00:00',
      channels: ['push', 'email', 'sms', 'in-app'],
      priority: 'urgent',
      readCount: 0
    },
    {
      id: '3',
      title: 'New Club Registration Feature',
      message: 'We have launched a new club registration system with enhanced features.',
      type: 'success',
      status: 'sent',
      recipients: 890,
      sentAt: '2024-08-27 14:30:00',
      channels: ['push', 'in-app'],
      priority: 'medium',
      readCount: 654
    },
    {
      id: '4',
      title: 'Payment Gateway Issue',
      message: 'We are experiencing temporary issues with payment processing. We apologize for the inconvenience.',
      type: 'error',
      status: 'sent',
      recipients: 156,
      sentAt: '2024-08-26 16:45:00',
      channels: ['push', 'email', 'in-app'],
      priority: 'urgent',
      readCount: 142
    },
    {
      id: '5',
      title: 'Weekly Tournament Results',
      message: 'Check out the results from this week\'s tournaments and upcoming matches.',
      type: 'info',
      status: 'draft',
      recipients: 0,
      channels: ['email', 'in-app'],
      priority: 'low',
      readCount: 0
    }
  ])

  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800'
      case 'success': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Bell className="h-4 w-4" />
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertCircle className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getTotalSent = () => notifications.filter(n => n.status === 'sent').reduce((sum, n) => sum + n.recipients, 0)
  const getTotalRead = () => notifications.filter(n => n.status === 'sent').reduce((sum, n) => sum + n.readCount, 0)
  const getReadRate = () => {
    const sent = getTotalSent()
    const read = getTotalRead()
    return sent > 0 ? ((read / sent) * 100).toFixed(1) : '0'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🔔 Notifications</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Notification
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sent</p>
              <p className="text-2xl font-bold">{getTotalSent()}</p>
            </div>
            <Send className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Read Rate</p>
              <p className="text-2xl font-bold">{getReadRate()}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
              <p className="text-2xl font-bold">{notifications.filter(n => n.status === 'scheduled').length}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Drafts</p>
              <p className="text-2xl font-bold">{notifications.filter(n => n.status === 'draft').length}</p>
            </div>
            <Edit className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium">Filters:</span>
          
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4 mb-8">
        {notifications.map((notification) => (
          <div key={notification.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex items-center gap-2">
                  {getTypeIcon(notification.type)}
                  <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(notification.type)}`}>
                    {notification.type}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{notification.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{notification.message}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{notification.recipients} recipients</span>
                    </div>
                    
                    {notification.status === 'sent' && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>{notification.readCount} read ({((notification.readCount / notification.recipients) * 100).toFixed(1)}%)</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {notification.status === 'sent' && notification.sentAt && `Sent: ${notification.sentAt}`}
                        {notification.status === 'scheduled' && notification.scheduledAt && `Scheduled: ${notification.scheduledAt}`}
                        {notification.status === 'draft' && 'Draft'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    {notification.channels.map((channel) => (
                      <span key={channel} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(notification.status)}`}>
                  {notification.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(notification.priority)}`}>
                  {notification.priority}
                </span>
                
                <div className="flex gap-2 mt-2">
                  <button className="p-2 text-gray-500 hover:text-blue-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📧 Email Campaign</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Create targeted email campaigns</p>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Create Campaign
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📱 Push Notifications</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Send instant push notifications</p>
          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
            Send Push
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📊 Analytics</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">View notification performance</p>
          <button className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  )
}
