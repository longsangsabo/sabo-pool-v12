import { useState } from 'react'
import { MessageSquare, Send, Search, User, Calendar, Reply, Forward, Trash2, Star } from 'lucide-react'

interface Message {
  id: string
  from: string
  to: string
  subject: string
  content: string
  timestamp: string
  status: 'unread' | 'read' | 'replied'
  priority: 'low' | 'medium' | 'high'
  category: 'support' | 'feedback' | 'inquiry' | 'complaint' | 'general'
  starred: boolean
}

export default function AdminMessages() {
  const [messages] = useState<Message[]>([
    {
      id: '1',
      from: 'john.doe@email.com',
      to: 'support@sabo.com',
      subject: 'Tournament Registration Issue',
      content: 'I am having trouble registering for the upcoming tournament. The payment page keeps showing an error.',
      timestamp: '2024-08-28 14:30:00',
      status: 'unread',
      priority: 'high',
      category: 'support',
      starred: false
    },
    {
      id: '2',
      from: 'manager@club1.com',
      to: 'admin@sabo.com',
      subject: 'Club Verification Request',
      content: 'We would like to request verification for our club. We have submitted all required documents.',
      timestamp: '2024-08-28 13:15:00',
      status: 'read',
      priority: 'medium',
      category: 'inquiry',
      starred: true
    },
    {
      id: '3',
      from: 'player123@email.com',
      to: 'support@sabo.com',
      subject: 'Great Platform!',
      content: 'I just wanted to say how much I enjoy using Sabo Pool. The tournament system is fantastic!',
      timestamp: '2024-08-28 12:45:00',
      status: 'replied',
      priority: 'low',
      category: 'feedback',
      starred: false
    },
    {
      id: '4',
      from: 'complaint@email.com',
      to: 'admin@sabo.com',
      subject: 'Unfair Match Results',
      content: 'I believe there was an error in the match results calculation. The score doesn\'t match what was recorded.',
      timestamp: '2024-08-28 11:20:00',
      status: 'unread',
      priority: 'high',
      category: 'complaint',
      starred: false
    },
    {
      id: '5',
      from: 'info@clubpartner.com',
      to: 'partnerships@sabo.com',
      subject: 'Partnership Opportunity',
      content: 'We are interested in discussing a potential partnership for tournament sponsorship.',
      timestamp: '2024-08-28 10:00:00',
      status: 'read',
      priority: 'medium',
      category: 'general',
      starred: true
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const categories = ['all', 'support', 'feedback', 'inquiry', 'complaint', 'general']
  const statuses = ['all', 'unread', 'read', 'replied']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800'
      case 'read': return 'bg-blue-100 text-blue-800'
      case 'replied': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'support': return 'bg-blue-100 text-blue-800'
      case 'feedback': return 'bg-green-100 text-green-800'
      case 'inquiry': return 'bg-purple-100 text-purple-800'
      case 'complaint': return 'bg-red-100 text-red-800'
      case 'general': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUnreadCount = () => messages.filter(m => m.status === 'unread').length
  const getHighPriorityCount = () => messages.filter(m => m.priority === 'high').length
  const getStarredCount = () => messages.filter(m => m.starred).length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">💬 Messages</h1>
        <button className="px-4 py-2 bg-blue-600 text-var(--color-background) rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Send className="h-4 w-4" />
          Compose Message
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Total Messages</p>
              <p className="text-2xl font-bold">{messages.length}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Unread</p>
              <p className="text-2xl font-bold">{getUnreadCount()}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">High Priority</p>
              <p className="text-2xl font-bold">{getHighPriorityCount()}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Starred</p>
              <p className="text-2xl font-bold">{getStarredCount()}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Messages List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-var(--color-background) dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`bg-var(--color-background) dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:bg-neutral-background dark:hover:bg-gray-700 border-l-4 ${
                  message.status === 'unread' ? 'border-l-red-500' : 'border-l-transparent'
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-gray-400" />
                    <div>
                      <div className="font-medium">{message.from}</div>
                      <div className="text-sm text-gray-500">{message.timestamp}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {message.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(message.priority)}`}>
                      {message.priority}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold mb-2">{message.subject}</h3>
                <p className="text-neutral dark:text-gray-400 text-sm line-clamp-2 mb-3">{message.content}</p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(message.category)}`}>
                      {message.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(message.status)}`}>
                      {message.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-1 text-gray-500 hover:text-primary">
                      <Reply className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-success">
                      <Forward className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-error">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Detail */}
        <div className="bg-var(--color-background) dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-neutral dark:border-gray-700">
            <h2 className="text-lg font-semibold">
              {selectedMessage ? 'Message Details' : 'Select a Message'}
            </h2>
          </div>
          
          <div className="p-6">
            {selectedMessage ? (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <User className="h-10 w-10 text-gray-400" />
                      <div>
                        <div className="font-medium">{selectedMessage.from}</div>
                        <div className="text-sm text-gray-500">to {selectedMessage.to}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{selectedMessage.timestamp}</div>
                  </div>

                  <h3 className="text-xl font-semibold mb-4">{selectedMessage.subject}</h3>
                  
                  <div className="flex gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(selectedMessage.category)}`}>
                      {selectedMessage.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedMessage.priority)}`}>
                      {selectedMessage.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedMessage.status)}`}>
                      {selectedMessage.status}
                    </span>
                  </div>
                  
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{selectedMessage.content}</p>
                  </div>
                </div>

                <div className="border-t border-neutral dark:border-gray-700 pt-6">
                  <h4 className="font-medium mb-4">Quick Reply</h4>
                  <textarea 
                    placeholder="Type your reply..."
                    className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 mb-4"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-var(--color-background) rounded hover:bg-blue-700 flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Reply
                    </button>
                    <button className="px-4 py-2 bg-gray-600 text-var(--color-background) rounded hover:bg-gray-700">
                      Mark as Read
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📧 Auto-Reply</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Set up automated responses</p>
          <button className="w-full px-4 py-2 bg-purple-600 text-var(--color-background) rounded hover:bg-purple-700">
            Configure Auto-Reply
          </button>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📋 Templates</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Manage message templates</p>
          <button className="w-full px-4 py-2 bg-orange-600 text-var(--color-background) rounded hover:bg-orange-700">
            Manage Templates
          </button>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📊 Message Analytics</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">View response times and metrics</p>
          <button className="w-full px-4 py-2 bg-teal-600 text-var(--color-background) rounded hover:bg-teal-700">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  )
}
