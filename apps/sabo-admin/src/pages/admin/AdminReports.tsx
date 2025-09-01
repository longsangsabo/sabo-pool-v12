import { useState } from 'react'
import { Download, FileText, Calendar, Filter, BarChart3 } from 'lucide-react'

interface Report {
  id: string
  name: string
  type: string
  description: string
  lastGenerated: string
  status: 'ready' | 'generating' | 'failed'
  fileSize?: string
}

export default function AdminReports() {
  const [reports] = useState<Report[]>([
    {
      id: '1',
      name: 'User Activity Report',
      type: 'user',
      description: 'Comprehensive user engagement and activity analysis',
      lastGenerated: '2024-08-28',
      status: 'ready',
      fileSize: '2.4 MB'
    },
    {
      id: '2', 
      name: 'Tournament Performance Report',
      type: 'tournament',
      description: 'Tournament statistics and performance metrics',
      lastGenerated: '2024-08-27',
      status: 'ready',
      fileSize: '1.8 MB'
    },
    {
      id: '3',
      name: 'Financial Summary Report',
      type: 'financial',
      description: 'Revenue, payments, and financial analytics',
      lastGenerated: '2024-08-26',
      status: 'generating'
    },
    {
      id: '4',
      name: 'Club Management Report',
      type: 'club',
      description: 'Club registration, membership, and activity data',
      lastGenerated: '2024-08-25',
      status: 'ready',
      fileSize: '980 KB'
    }
  ])

  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedType, setSelectedType] = useState('all')

  const generateReport = (reportId: string) => {
    // Report generation logic
    alert(`Report ${reportId} generation started. Check your email for download link.`)
  }

  const downloadReport = (reportId: string) => {
    // Report download logic
    alert(`Downloading report ${reportId}...`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800'
      case 'generating': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const reportTypes = [
    { value: 'all', label: 'All Reports' },
    { value: 'user', label: 'User Reports' },
    { value: 'tournament', label: 'Tournament Reports' },
    { value: 'financial', label: 'Financial Reports' },
    { value: 'club', label: 'Club Reports' }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📋 Reports & Analytics</h1>
        <button className="px-4 py-2 bg-blue-600 text-var(--color-background) rounded-lg hover:bg-blue-700">
          Create New Report
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Total Reports</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Generated This Month</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Downloads</p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <Download className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Scheduled Reports</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-var(--color-background) dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            {reportTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-var(--color-background) dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral dark:border-gray-700">
          <h2 className="text-lg font-semibold">Available Reports</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-background dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Generated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-neutral-background dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{report.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs capitalize">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{report.lastGenerated}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{report.fileSize || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {report.status === 'ready' && (
                        <button 
                          onClick={() => downloadReport(report.id)}
                          className="px-3 py-1 bg-green-600 text-var(--color-background) rounded text-sm hover:bg-green-700"
                        >
                          Download
                        </button>
                      )}
                      <button 
                        onClick={() => generateReport(report.id)}
                        className="px-3 py-1 bg-blue-600 text-var(--color-background) rounded text-sm hover:bg-blue-700"
                        disabled={report.status === 'generating'}
                      >
                        {report.status === 'generating' ? 'Generating...' : 'Generate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📊 Custom Report</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Create a custom report with specific metrics</p>
          <button className="w-full px-4 py-2 bg-purple-600 text-var(--color-background) rounded hover:bg-purple-700">
            Create Custom Report
          </button>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">⏰ Schedule Report</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Set up automated report generation</p>
          <button className="w-full px-4 py-2 bg-orange-600 text-var(--color-background) rounded hover:bg-orange-700">
            Schedule Report
          </button>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📤 Export Data</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Export raw data for external analysis</p>
          <button className="w-full px-4 py-2 bg-teal-600 text-var(--color-background) rounded hover:bg-teal-700">
            Export Data
          </button>
        </div>
      </div>
    </div>
  )
}
