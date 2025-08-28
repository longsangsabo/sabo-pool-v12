import { useState } from 'react'
import { Plus, Edit, Trash2, Eye, Search, Calendar, Tag, Image, FileText } from 'lucide-react'

interface Content {
  id: string
  title: string
  type: 'article' | 'announcement' | 'guide' | 'rule'
  status: 'published' | 'draft' | 'archived'
  author: string
  createdAt: string
  updatedAt: string
  views: number
  featured: boolean
  tags: string[]
}

export default function AdminContent() {
  const [content] = useState<Content[]>([
    {
      id: '1',
      title: 'Sabo Pool Championship 2024 Rules',
      type: 'rule',
      status: 'published',
      author: 'Admin Team',
      createdAt: '2024-08-15',
      updatedAt: '2024-08-28',
      views: 1247,
      featured: true,
      tags: ['championship', 'rules', 'tournament']
    },
    {
      id: '2',
      title: 'How to Register for Tournaments',
      type: 'guide',
      status: 'published',
      author: 'Support Team',
      createdAt: '2024-08-20',
      updatedAt: '2024-08-27',
      views: 892,
      featured: false,
      tags: ['guide', 'tournament', 'registration']
    },
    {
      id: '3',
      title: 'New Club Registration System',
      type: 'announcement',
      status: 'published',
      author: 'Development Team',
      createdAt: '2024-08-25',
      updatedAt: '2024-08-28',
      views: 456,
      featured: true,
      tags: ['announcement', 'clubs', 'update']
    },
    {
      id: '4',
      title: 'Pool Equipment Maintenance Guide',
      type: 'article',
      status: 'draft',
      author: 'Equipment Expert',
      createdAt: '2024-08-26',
      updatedAt: '2024-08-28',
      views: 0,
      featured: false,
      tags: ['equipment', 'maintenance', 'guide']
    },
    {
      id: '5',
      title: 'September Tournament Schedule',
      type: 'announcement',
      status: 'draft',
      author: 'Tournament Manager',
      createdAt: '2024-08-28',
      updatedAt: '2024-08-28',
      views: 0,
      featured: false,
      tags: ['schedule', 'september', 'tournament']
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const contentTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'article', label: 'Articles' },
    { value: 'announcement', label: 'Announcements' },
    { value: 'guide', label: 'Guides' },
    { value: 'rule', label: 'Rules' }
  ]

  const statusTypes = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800'
      case 'announcement': return 'bg-purple-100 text-purple-800'
      case 'guide': return 'bg-orange-100 text-orange-800'
      case 'rule': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-4 w-4" />
      case 'announcement': return <Calendar className="h-4 w-4" />
      case 'guide': return <Eye className="h-4 w-4" />
      case 'rule': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📝 Content Management</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Content
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Content</p>
              <p className="text-2xl font-bold">{content.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
              <p className="text-2xl font-bold">{content.filter(c => c.status === 'published').length}</p>
            </div>
            <Eye className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold">{content.reduce((sum, c) => sum + c.views, 0)}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Featured</p>
              <p className="text-2xl font-bold">{content.filter(c => c.featured).length}</p>
            </div>
            <Tag className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
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
            {contentTypes.map(type => (
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
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {content.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(item.type)}
                  <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(item.type)}`}>
                    {item.type}
                  </span>
                </div>
                <div className="flex gap-1">
                  {item.featured && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      Featured
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <p>By {item.author}</p>
                <p>Created: {item.createdAt}</p>
                <p>Updated: {item.updatedAt}</p>
                <p>{item.views} views</p>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {item.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1">
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Image className="h-5 w-5" />
            Media Library
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Manage images and files</p>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Open Media Library
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tag Management
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Organize content with tags</p>
          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
            Manage Tags
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Content Calendar
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Schedule content publication</p>
          <button className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">
            View Calendar
          </button>
        </div>
      </div>
    </div>
  )
}
