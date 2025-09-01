export default function AdminClubs() {
  return (
    <div className="min-h-screen bg-gray-900 text-var(--color-background) p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🏢 Club Management</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-purple-500/20">
          <h2 className="text-xl font-bold mb-4 text-purple-400">Club Administration</h2>
          <p className="text-gray-300 mb-4">
            Tools for managing billiard clubs and their operations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-cyan-400">Club Approval</h3>
              <p className="text-sm text-gray-400">Review and approve new club registrations</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-green-400">Club Profiles</h3>
              <p className="text-sm text-gray-400">Manage club information and settings</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-orange-400">Member Oversight</h3>
              <p className="text-sm text-gray-400">Monitor club membership activities</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-red-400">Compliance</h3>
              <p className="text-sm text-gray-400">Ensure clubs follow platform guidelines</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
