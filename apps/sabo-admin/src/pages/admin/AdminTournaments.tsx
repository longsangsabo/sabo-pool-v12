export default function AdminTournaments() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🏆 Tournament Management</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-amber-500/20">
          <h2 className="text-xl font-bold mb-4 text-amber-400">Coming Soon in Phase 2.2</h2>
          <p className="text-gray-300 mb-4">
            Advanced tournament management features will be migrated and enhanced here.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-blue-400">Tournament Creation</h3>
              <p className="text-sm text-gray-400">Create and configure new tournaments</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-green-400">Bracket Management</h3>
              <p className="text-sm text-gray-400">Manage tournament brackets and matches</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-purple-400">Participant Control</h3>
              <p className="text-sm text-gray-400">Add/remove tournament participants</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-orange-400">Real-time Updates</h3>
              <p className="text-sm text-gray-400">Monitor live tournament progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
