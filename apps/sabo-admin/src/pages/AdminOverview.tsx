import { NavLink } from 'react-router-dom'

export default function AdminOverview() {
  const pageStatus = [
    // Production Ready Pages
    { path: '/dashboard', name: 'Dashboard (Migrated)', status: '✅ Production Ready', description: 'Full dashboard with stats, charts, real-time data' },
    { path: '/dashboard-functional', name: 'Dashboard (Functional)', status: '✅ Production Ready', description: 'Alternative dashboard implementation' },
    { path: '/users', name: 'Users (Migrated)', status: '✅ Production Ready', description: 'Complete user management with search, filters, ban controls' },
    { path: '/users-enterprise', name: 'User Management Pro', status: '✅ Production Ready', description: 'Advanced user analytics and enterprise features' },
    { path: '/tournaments', name: 'Tournaments (Migrated)', status: '✅ Production Ready', description: 'Tournament management with participant controls' },
    { path: '/tournament-manager', name: 'Tournament Manager', status: '✅ Production Ready', description: 'Advanced tournament administration tools' },
    { path: '/system-health', name: 'System Health', status: '✅ Production Ready', description: 'Real-time system monitoring and metrics' },
    { path: '/settings', name: 'Settings', status: '✅ Production Ready', description: 'System configuration and admin settings' },
    
    // Basic Implementation
    { path: '/clubs', name: 'Clubs', status: '🟡 Basic Implementation', description: 'Simple club management interface' },
    
    // Placeholder Pages - Future Development
    { path: '/analytics', name: 'Analytics', status: '🔴 Placeholder', description: 'Advanced analytics dashboard - coming soon' },
    { path: '/reports', name: 'Reports', status: '🔴 Placeholder', description: 'Comprehensive reporting system - planned' },
    { path: '/permissions', name: 'Permissions', status: '🔴 Placeholder', description: 'Role and permission management - future' },
    { path: '/audit-logs', name: 'Audit Logs', status: '🔴 Placeholder', description: 'System audit logging - planned' },
    { path: '/content', name: 'Content', status: '🔴 Placeholder', description: 'Content management system - future' },
    { path: '/media', name: 'Media', status: '🔴 Placeholder', description: 'Media library and assets - planned' },
    { path: '/notifications', name: 'Notifications', status: '🔴 Placeholder', description: 'Notification center - future' },
    { path: '/messages', name: 'Messages', status: '🔴 Placeholder', description: 'Message management - planned' },
    { path: '/finance', name: 'Finance', status: '🔴 Placeholder', description: 'Financial dashboard - future' },
    { path: '/payments', name: 'Payments', status: '🔴 Placeholder', description: 'Payment processing - planned' },
    { path: '/billing', name: 'Billing', status: '🔴 Placeholder', description: 'Billing and subscriptions - future' },
    { path: '/support', name: 'Support', status: '🔴 Placeholder', description: 'Support ticket system - planned' },
    { path: '/feedback', name: 'Feedback', status: '🔴 Placeholder', description: 'User feedback management - future' }
  ]

  const productionReady = pageStatus.filter(page => page.status === '✅ Production Ready')
  const basicImplementation = pageStatus.filter(page => page.status === '🟡 Basic Implementation')
  const placeholders = pageStatus.filter(page => page.status === '🔴 Placeholder')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🏆 SABO Admin - Page Overview</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-800 dark:text-green-200">Production Ready</h3>
          <p className="text-3xl font-bold text-success dark:text-green-400">{productionReady.length}</p>
          <p className="text-green-700 dark:text-green-300">Fully functional pages</p>
        </div>
        
        <div className="bg-yellow-100 dark:bg-yellow-900 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">Basic Implementation</h3>
          <p className="text-3xl font-bold text-warning dark:text-yellow-400">{basicImplementation.length}</p>
          <p className="text-yellow-700 dark:text-yellow-300">Simple interfaces</p>
        </div>
        
        <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-red-800 dark:text-red-200">Future Development</h3>
          <p className="text-3xl font-bold text-error dark:text-red-400">{placeholders.length}</p>
          <p className="text-red-700 dark:text-red-300">Placeholder pages</p>
        </div>
      </div>

      {/* Production Ready Pages */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-success">✅ Production Ready Pages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productionReady.map(page => (
            <div key={page.path} className="bg-var(--color-background) dark:bg-gray-800 p-4 rounded-lg border border-success dark:border-green-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-green-700 dark:text-green-300">{page.name}</h3>
                <NavLink 
                  to={page.path}
                  className="px-3 py-1 bg-green-600 text-var(--color-background) rounded text-sm hover:bg-green-700"
                >
                  Visit
                </NavLink>
              </div>
              <p className="text-sm text-neutral dark:text-gray-400">{page.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Basic Implementation */}
      {basicImplementation.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-warning">🟡 Basic Implementation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {basicImplementation.map(page => (
              <div key={page.path} className="bg-var(--color-background) dark:bg-gray-800 p-4 rounded-lg border border-warning dark:border-yellow-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-yellow-700 dark:text-yellow-300">{page.name}</h3>
                  <NavLink 
                    to={page.path}
                    className="px-3 py-1 bg-yellow-600 text-var(--color-background) rounded text-sm hover:bg-yellow-700"
                  >
                    Visit
                  </NavLink>
                </div>
                <p className="text-sm text-neutral dark:text-gray-400">{page.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Future Development */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-error">🔴 Future Development</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {placeholders.map(page => (
            <div key={page.path} className="bg-var(--color-background) dark:bg-gray-800 p-4 rounded-lg border border-error dark:border-red-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-red-700 dark:text-red-300">{page.name}</h3>
                <NavLink 
                  to={page.path}
                  className="px-3 py-1 bg-red-600 text-var(--color-background) rounded text-sm hover:bg-red-700"
                >
                  Preview
                </NavLink>
              </div>
              <p className="text-sm text-neutral dark:text-gray-400">{page.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cleanup Recommendations */}
      <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-200">🧹 Cleanup Recommendations</h2>
        <div className="space-y-2 text-blue-700 dark:text-blue-300">
          <p>• <strong>Priority 1:</strong> Keep all ✅ Production Ready pages - they contain real functionality</p>
          <p>• <strong>Priority 2:</strong> Enhance 🟡 Basic Implementation pages with full features</p>
          <p>• <strong>Priority 3:</strong> Convert 🔴 Placeholder pages to proper implementations when needed</p>
          <p>• <strong>Safe to cleanup:</strong> Duplicate or legacy files not referenced in current routing</p>
        </div>
      </div>
    </div>
  )
}
