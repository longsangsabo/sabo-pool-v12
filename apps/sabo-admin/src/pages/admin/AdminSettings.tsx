export default function AdminSettings() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">⚙️ System Settings</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-green-500/20">
          <h2 className="text-xl font-bold mb-4 text-green-400">System Configuration</h2>
          <p className="text-gray-300 mb-4">
            Configure SABO Arena system settings and preferences.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-blue-400">Game Rules</h3>
              <p className="text-sm text-gray-400">Configure billiard game rules and scoring</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-purple-400">Tournament Settings</h3>
              <p className="text-sm text-gray-400">Default tournament configurations</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-yellow-400">Notifications</h3>
              <p className="text-sm text-gray-400">System notification preferences</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-red-400">Security</h3>
              <p className="text-sm text-gray-400">Security and access controls</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-green-400">Performance</h3>
              <p className="text-sm text-gray-400">System performance optimization</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-orange-400">Maintenance</h3>
              <p className="text-sm text-gray-400">System maintenance tools</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
