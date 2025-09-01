import { useState } from 'react'
import { MessageCircle, Star, TrendingUp, ThumbsUp, Search, Tag } from 'lucide-react'

interface Feedback {
  id: string
  user: string
  email: string
  type: 'feature-request' | 'bug-report' | 'improvement' | 'complaint' | 'praise'
  category: 'ui-ux' | 'performance' | 'functionality' | 'content' | 'general'
  rating: number
  title: string
  description: string
  status: 'new' | 'under-review' | 'planned' | 'implemented' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  votes: number
  submittedAt: string
  tags: string[]
}

export default function AdminFeedback() {
  const [feedback] = useState<Feedback[]>([
    {
      id: '1',
      user: 'John Player',
      email: 'john@email.com',
      type: 'feature-request',
      category: 'functionality',
      rating: 5,
      title: 'Add tournament bracket visualization',
      description: 'It would be great to have a visual tournament bracket that shows the progression of matches in real-time.',
      status: 'planned',
      priority: 'high',
      votes: 24,
      submittedAt: '2024-08-28 14:30:00',
      tags: ['tournament', 'visualization', 'ux']
    },
    {
      id: '2',
      user: 'Sarah Manager',
      email: 'sarah@club.com',
      type: 'improvement',
      category: 'ui-ux',
      rating: 4,
      title: 'Improve mobile responsiveness',
      description: 'The mobile version could be more user-friendly, especially for club management features.',
      status: 'under-review',
      priority: 'medium',
      votes: 18,
      submittedAt: '2024-08-28 12:15:00',
      tags: ['mobile', 'responsive', 'club-management']
    },
    {
      id: '3',
      user: 'Mike User',
      email: 'mike@email.com',
      type: 'bug-report',
      category: 'performance',
      rating: 2,
      title: 'Slow loading on tournament page',
      description: 'The tournament page takes a very long time to load, especially when there are many participants.',
      status: 'new',
      priority: 'high',
      votes: 31,
      submittedAt: '2024-08-28 10:45:00',
      tags: ['performance', 'loading', 'tournament']
    },
    {
      id: '4',
      user: 'Lisa Champion',
      email: 'lisa@email.com',
      type: 'praise',
      category: 'general',
      rating: 5,
      title: 'Excellent tournament organization',
      description: 'The platform makes organizing tournaments so much easier. Great job on the user experience!',
      status: 'implemented',
      priority: 'low',
      votes: 12,
      submittedAt: '2024-08-27 16:20:00',
      tags: ['tournament', 'organization', 'praise']
    },
    {
      id: '5',
      user: 'Tom Organizer',
      email: 'tom@club.com',
      type: 'feature-request',
      category: 'functionality',
      rating: 4,
      title: 'Add bulk player invitation feature',
      description: 'Allow club managers to invite multiple players to tournaments at once via CSV upload.',
      status: 'under-review',
      priority: 'medium',
      votes: 15,
      submittedAt: '2024-08-27 14:10:00',
      tags: ['bulk-operations', 'invitations', 'club-management']
    },
    {
      id: '6',
      user: 'Emma Player',
      email: 'emma@email.com',
      type: 'complaint',
      category: 'functionality',
      rating: 1,
      title: 'Payment system keeps failing',
      description: 'I have tried multiple times to pay for tournament entry but the payment system keeps rejecting my card.',
      status: 'new',
      priority: 'high',
      votes: 8,
      submittedAt: '2024-08-27 11:30:00',
      tags: ['payment', 'bug', 'urgent']
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)

  const feedbackTypes = ['all', 'feature-request', 'bug-report', 'improvement', 'complaint', 'praise']
  const statuses = ['all', 'new', 'under-review', 'planned', 'implemented', 'rejected']

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature-request': return 'bg-blue-100 text-blue-800'
      case 'bug-report': return 'bg-red-100 text-red-800'
      case 'improvement': return 'bg-orange-100 text-orange-800'
      case 'complaint': return 'bg-red-100 text-red-800'
      case 'praise': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-yellow-100 text-yellow-800'
      case 'under-review': return 'bg-blue-100 text-blue-800'
      case 'planned': return 'bg-purple-100 text-purple-800'
      case 'implemented': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const getAverageRating = () => {
    const total = feedback.reduce((sum, f) => sum + f.rating, 0)
    return (total / feedback.length).toFixed(1)
  }

  const getNewFeedbackCount = () => feedback.filter(f => f.status === 'new').length
  const getTotalVotes = () => feedback.reduce((sum, f) => sum + f.votes, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📝 Feedback Management</h1>
        <button className="px-4 py-2 bg-blue-600 text-var(--color-background) rounded-lg hover:bg-blue-700">
          Export Feedback
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Total Feedback</p>
              <p className="text-2xl font-bold">{feedback.length}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Average Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{getAverageRating()}</p>
                <div className="flex">{renderStars(Math.round(parseFloat(getAverageRating())))}</div>
              </div>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">New Feedback</p>
              <p className="text-2xl font-bold text-warning">{getNewFeedbackCount()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Total Votes</p>
              <p className="text-2xl font-bold">{getTotalVotes()}</p>
            </div>
            <ThumbsUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feedback List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-var(--color-background) dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                {feedbackTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.replace('-', ' ')}
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
                    {status === 'all' ? 'All Status' : status.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Feedback Items */}
          <div className="space-y-4">
            {feedback.map((item) => (
              <div 
                key={item.id} 
                className="bg-var(--color-background) dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:bg-neutral-background dark:hover:bg-gray-700"
                onClick={() => setSelectedFeedback(item)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex">{renderStars(item.rating)}</div>
                    <div>
                      <div className="font-medium">{item.user}</div>
                      <div className="text-sm text-gray-500">{item.submittedAt}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-neutral">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{item.votes}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-neutral dark:text-gray-400 text-sm line-clamp-2 mb-4">{item.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(item.type)}`}>
                      {item.type.replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                      {item.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    {item.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Detail */}
        <div className="bg-var(--color-background) dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-neutral dark:border-gray-700">
            <h2 className="text-lg font-semibold">
              {selectedFeedback ? 'Feedback Details' : 'Select Feedback'}
            </h2>
          </div>
          
          <div className="p-6">
            {selectedFeedback ? (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedFeedback.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">{renderStars(selectedFeedback.rating)}</div>
                        <span className="text-sm text-neutral">({selectedFeedback.rating}/5)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-neutral">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{selectedFeedback.votes}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                      <h4 className="font-medium mb-2">From:</h4>
                      <p className="font-medium">{selectedFeedback.user}</p>
                      <p className="text-sm text-neutral dark:text-gray-400">{selectedFeedback.email}</p>
                      <p className="text-sm text-gray-500">Submitted: {selectedFeedback.submittedAt}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Classification:</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${getTypeColor(selectedFeedback.type)}`}>
                        {selectedFeedback.type.replace('-', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedFeedback.status)}`}>
                        {selectedFeedback.status.replace('-', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(selectedFeedback.priority)}`}>
                        {selectedFeedback.priority} priority
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Description:</h4>
                    <p className="text-neutral dark:text-gray-400 leading-relaxed">{selectedFeedback.description}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFeedback.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-neutral dark:border-gray-700 pt-6">
                    <h4 className="font-medium mb-4">Actions</h4>
                    <div className="space-y-3">
                      <select className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        <option value="">Change Status</option>
                        <option value="under-review">Under Review</option>
                        <option value="planned">Planned</option>
                        <option value="implemented">Implemented</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      
                      <select className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        <option value="">Change Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>

                      <textarea 
                        placeholder="Add internal notes..."
                        className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
                        rows={3}
                      />

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-blue-600 text-var(--color-background) rounded hover:bg-blue-700">
                          Update
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-var(--color-background) rounded hover:bg-green-700">
                          Contact User
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select feedback to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📊 Feedback Analytics</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">View trends and insights from user feedback</p>
          <button className="w-full px-4 py-2 bg-purple-600 text-var(--color-background) rounded hover:bg-purple-700">
            View Analytics
          </button>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">🏷️ Tag Management</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Organize feedback with custom tags</p>
          <button className="w-full px-4 py-2 bg-orange-600 text-var(--color-background) rounded hover:bg-orange-700">
            Manage Tags
          </button>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📝 Feedback Survey</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Create and manage feedback surveys</p>
          <button className="w-full px-4 py-2 bg-teal-600 text-var(--color-background) rounded hover:bg-teal-700">
            Create Survey
          </button>
        </div>
      </div>
    </div>
  )
}
