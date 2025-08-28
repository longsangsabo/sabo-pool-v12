export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🎯 SABO Arena Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-blue-500/20">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">Total Users</h3>
            <p className="text-3xl font-bold text-blue-400">1,234</p>
            <p className="text-sm text-gray-400 mt-2">+12% from last month</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-green-500/20">
            <h3 className="text-lg font-semibold mb-2 text-green-400">Active Tournaments</h3>
            <p className="text-3xl font-bold text-green-400">42</p>
            <p className="text-sm text-gray-400 mt-2">8 finishing today</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-purple-500/20">
            <h3 className="text-lg font-semibold mb-2 text-purple-400">Clubs</h3>
            <p className="text-3xl font-bold text-purple-400">156</p>
            <p className="text-sm text-gray-400 mt-2">3 pending approval</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-green-500/20">
            <h3 className="text-lg font-semibold mb-2 text-green-400">System Health</h3>
            <p className="text-3xl font-bold text-green-400">98%</p>
            <p className="text-sm text-gray-400 mt-2">All systems operational</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-amber-400">🚀 Phase 2 Migration Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>✅ Admin Dashboard</span>
                <span className="text-green-400 font-bold">MIGRATED</span>
              </div>
              <div className="flex justify-between items-center">
                <span>⏳ Tournament Management</span>
                <span className="text-yellow-400 font-bold">IN PROGRESS</span>
              </div>
              <div className="flex justify-between items-center">
                <span>⏳ User Management</span>
                <span className="text-yellow-400 font-bold">QUEUED</span>
              </div>
              <div className="flex justify-between items-center">
                <span>⏳ Club Management</span>
                <span className="text-yellow-400 font-bold">QUEUED</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">📊 Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <div>
                  <span className="text-green-400">●</span>
                  <span className="ml-2">New user registration</span>
                </div>
                <span className="text-sm text-gray-400">2 minutes ago</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <div>
                  <span className="text-blue-400">●</span>
                  <span className="ml-2">Tournament "Spring Championship" started</span>
                </div>
                <span className="text-sm text-gray-400">1 hour ago</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <div>
                  <span className="text-purple-400">●</span>
                  <span className="ml-2">Club "Billiards Pro" approved</span>
                </div>
                <span className="text-sm text-gray-400">3 hours ago</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <div>
                  <span className="text-amber-400">●</span>
                  <span className="ml-2">Admin separation Phase 2 initiated</span>
                </div>
                <span className="text-sm text-gray-400">Just now</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-green-900/50 to-blue-900/50 p-6 rounded-lg border border-green-500/30">
          <h2 className="text-xl font-bold mb-2 text-green-400">🎉 Migration Success!</h2>
          <p className="text-gray-300">
            Admin Dashboard successfully migrated to dedicated admin app. 
            This marks the completion of Phase 2.1 - Component Migration Batch 1.
          </p>
          <div className="mt-4 text-sm text-gray-400">
            <p>✅ Admin app running independently on port 8081</p>
            <p>✅ User app optimized and running on port 8080</p>
            <p>✅ Proper component separation achieved</p>
          </div>
        </div>
      </div>
    </div>
  )
}
