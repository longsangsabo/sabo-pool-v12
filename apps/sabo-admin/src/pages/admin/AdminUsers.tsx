export default function AdminUsers() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">👥 User Management</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-blue-500/20">
          <h2 className="text-xl font-bold mb-4 text-blue-400">User Administration</h2>
          <p className="text-gray-300 mb-4">
            Comprehensive user management tools for SABO Arena administrators.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-green-400">User Profiles</h3>
              <p className="text-sm text-gray-400">View and edit user information</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-yellow-400">Account Status</h3>
              <p className="text-sm text-gray-400">Manage user account states</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-red-400">Moderation Tools</h3>
              <p className="text-sm text-gray-400">User moderation and safety</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
