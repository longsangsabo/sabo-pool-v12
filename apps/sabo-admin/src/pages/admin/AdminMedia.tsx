import { useState } from 'react'
import { Upload, Image, Video, File, Trash2, Download, Search, Folder, Grid, List } from 'lucide-react'

interface MediaFile {
  id: string
  name: string
  type: 'image' | 'video' | 'document' | 'audio'
  size: string
  uploadedAt: string
  uploadedBy: string
  url: string
  folder: string
  dimensions?: string
  duration?: string
}

export default function AdminMedia() {
  const [mediaFiles] = useState<MediaFile[]>([
    {
      id: '1',
      name: 'tournament-banner-2024.jpg',
      type: 'image',
      size: '2.4 MB',
      uploadedAt: '2024-08-28',
      uploadedBy: 'admin@sabo.com',
      url: '/uploads/banners/tournament-banner-2024.jpg',
      folder: 'banners',
      dimensions: '1920x1080'
    },
    {
      id: '2',
      name: 'club-logo-champions.png',
      type: 'image',
      size: '156 KB',
      uploadedAt: '2024-08-27',
      uploadedBy: 'manager@club.com',
      url: '/uploads/logos/club-logo-champions.png',
      folder: 'logos',
      dimensions: '512x512'
    },
    {
      id: '3',
      name: 'tournament-highlights.mp4',
      type: 'video',
      size: '45.2 MB',
      uploadedAt: '2024-08-26',
      uploadedBy: 'media@sabo.com',
      url: '/uploads/videos/tournament-highlights.mp4',
      folder: 'videos',
      duration: '3:24'
    },
    {
      id: '4',
      name: 'rules-document-2024.pdf',
      type: 'document',
      size: '890 KB',
      uploadedAt: '2024-08-25',
      uploadedBy: 'admin@sabo.com',
      url: '/uploads/documents/rules-document-2024.pdf',
      folder: 'documents'
    },
    {
      id: '5',
      name: 'player-profile-avatar.jpg',
      type: 'image',
      size: '342 KB',
      uploadedAt: '2024-08-24',
      uploadedBy: 'user@example.com',
      url: '/uploads/avatars/player-profile-avatar.jpg',
      folder: 'avatars',
      dimensions: '400x400'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const folders = ['all', 'banners', 'logos', 'videos', 'documents', 'avatars', 'thumbnails']
  const fileTypes = ['all', 'image', 'video', 'document', 'audio']

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-8 w-8 text-blue-500" />
      case 'video': return <Video className="h-8 w-8 text-red-500" />
      case 'document': return <File className="h-8 w-8 text-green-500" />
      case 'audio': return <File className="h-8 w-8 text-purple-500" />
      default: return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-blue-100 text-blue-800'
      case 'video': return 'bg-red-100 text-red-800'
      case 'document': return 'bg-green-100 text-green-800'
      case 'audio': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTotalSize = () => {
    const sizes = mediaFiles.map(file => {
      const sizeStr = file.size.replace(/[^0-9.]/g, '')
      const unit = file.size.includes('MB') ? 1024 : 1
      return parseFloat(sizeStr) * unit
    })
    const totalKB = sizes.reduce((sum, size) => sum + size, 0)
    return totalKB > 1024 ? `${(totalKB / 1024).toFixed(1)} MB` : `${totalKB.toFixed(0)} KB`
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📁 Media Library</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Files
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Files</p>
              <p className="text-2xl font-bold">{mediaFiles.length}</p>
            </div>
            <File className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Size</p>
              <p className="text-2xl font-bold">{getTotalSize()}</p>
            </div>
            <Image className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Images</p>
              <p className="text-2xl font-bold">{mediaFiles.filter(f => f.type === 'image').length}</p>
            </div>
            <Video className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Folders</p>
              <p className="text-2xl font-bold">{folders.length - 1}</p>
            </div>
            <Folder className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <select 
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              {folders.map(folder => (
                <option key={folder} value={folder}>
                  {folder === 'all' ? 'All Folders' : folder}
                </option>
              ))}
            </select>

            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              {fileTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {mediaFiles.map((file) => (
            <div key={file.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {file.type === 'image' ? (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                ) : (
                  getFileIcon(file.type)
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm truncate flex-1">{file.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ml-2 ${getTypeColor(file.type)}`}>
                    {file.type}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Size: {file.size}</p>
                  <p>Folder: {file.folder}</p>
                  {file.dimensions && <p>Dimensions: {file.dimensions}</p>}
                  {file.duration && <p>Duration: {file.duration}</p>}
                  <p>Uploaded: {file.uploadedAt}</p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                    <Download className="h-3 w-3 inline mr-1" />
                    Download
                  </button>
                  <button className="px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mediaFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-gray-500">{file.folder}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(file.type)}`}>
                      {file.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{file.size}</td>
                  <td className="px-6 py-4 text-sm">{file.uploadedAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        Download
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📤 Bulk Upload</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Upload multiple files at once</p>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Bulk Upload
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">🗂️ Organize Folders</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Create and manage folder structure</p>
          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
            Manage Folders
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">🔍 Advanced Search</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Search by metadata and properties</p>
          <button className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">
            Advanced Search
          </button>
        </div>
      </div>
    </div>
  )
}
