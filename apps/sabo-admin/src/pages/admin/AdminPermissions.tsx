import { useState } from 'react'
import { Shield, Users, Settings, Plus, Edit, Trash2, Check, X } from 'lucide-react'

interface Role {
  id: string
  name: string
  description: string
  userCount: number
  permissions: string[]
  isDefault: boolean
}

interface Permission {
  id: string
  name: string
  category: string
  description: string
}

export default function AdminPermissions() {
  const [roles] = useState<Role[]>([
    {
      id: '1',
      name: 'Super Admin',
      description: 'Full system access and administrative privileges',
      userCount: 2,
      permissions: ['all'],
      isDefault: false
    },
    {
      id: '2',
      name: 'Admin',
      description: 'Administrative access with limited system settings',
      userCount: 5,
      permissions: ['users.manage', 'tournaments.manage', 'clubs.manage', 'reports.view'],
      isDefault: false
    },
    {
      id: '3',
      name: 'Tournament Manager',
      description: 'Manage tournaments and match results',
      userCount: 12,
      permissions: ['tournaments.manage', 'matches.manage', 'results.edit'],
      isDefault: false
    },
    {
      id: '4',
      name: 'Club Manager',
      description: 'Manage club-specific operations',
      userCount: 45,
      permissions: ['clubs.edit', 'members.manage', 'events.create'],
      isDefault: false
    },
    {
      id: '5',
      name: 'User',
      description: 'Standard user with basic access',
      userCount: 1247,
      permissions: ['profile.edit', 'tournaments.join', 'clubs.join'],
      isDefault: true
    }
  ])

  const [permissions] = useState<Permission[]>([
    { id: 'users.manage', name: 'Manage Users', category: 'User Management', description: 'Create, edit, and delete user accounts' },
    { id: 'users.view', name: 'View Users', category: 'User Management', description: 'View user profiles and information' },
    { id: 'tournaments.manage', name: 'Manage Tournaments', category: 'Tournament Management', description: 'Create and modify tournaments' },
    { id: 'tournaments.join', name: 'Join Tournaments', category: 'Tournament Management', description: 'Register for tournaments' },
    { id: 'clubs.manage', name: 'Manage Clubs', category: 'Club Management', description: 'Create and manage clubs' },
    { id: 'clubs.edit', name: 'Edit Club Info', category: 'Club Management', description: 'Edit club information and settings' },
    { id: 'clubs.join', name: 'Join Clubs', category: 'Club Management', description: 'Join existing clubs' },
    { id: 'matches.manage', name: 'Manage Matches', category: 'Match Management', description: 'Schedule and manage matches' },
    { id: 'results.edit', name: 'Edit Results', category: 'Match Management', description: 'Enter and modify match results' },
    { id: 'reports.view', name: 'View Reports', category: 'Reporting', description: 'Access system reports and analytics' },
    { id: 'system.config', name: 'System Configuration', category: 'System', description: 'Modify system settings and configuration' }
  ])

  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const permissionCategories = Array.from(new Set(permissions.map(p => p.category)))

  const hasPermission = (role: Role, permissionId: string) => {
    return role.permissions.includes('all') || role.permissions.includes(permissionId)
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'Super Admin': return 'bg-red-100 text-red-800'
      case 'Admin': return 'bg-purple-100 text-purple-800'
      case 'Tournament Manager': return 'bg-blue-100 text-blue-800'
      case 'Club Manager': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🛡️ Permissions & Roles</h1>
        <button 
          onClick={() => alert('Create role feature coming soon!')}
          className="px-4 py-2 bg-blue-600 text-var(--color-background) rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Role
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Total Roles</p>
              <p className="text-2xl font-bold">{roles.length}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold">{roles.reduce((sum, role) => sum + role.userCount, 0)}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Permissions</p>
              <p className="text-2xl font-bold">{permissions.length}</p>
            </div>
            <Settings className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Categories</p>
              <p className="text-2xl font-bold">{permissionCategories.length}</p>
            </div>
            <Shield className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Roles List */}
        <div className="bg-var(--color-background) dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-neutral dark:border-gray-700">
            <h2 className="text-lg font-semibold">Roles</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {roles.map((role) => (
                <div 
                  key={role.id} 
                  className="border border-neutral dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-neutral-background dark:hover:bg-gray-700"
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{role.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(role.name)}`}>
                          {role.name}
                        </span>
                        {role.isDefault && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral dark:text-gray-400 mt-1">{role.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1 text-gray-500 hover:text-primary">
                        <Edit className="h-4 w-4" />
                      </button>
                      {!role.isDefault && (
                        <button className="p-1 text-gray-500 hover:text-error">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral dark:text-gray-400">
                      {role.userCount} users
                    </span>
                    <span className="text-neutral dark:text-gray-400">
                      {role.permissions.includes('all') ? 'All permissions' : `${role.permissions.length} permissions`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Role Details / Permissions */}
        <div className="bg-var(--color-background) dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-neutral dark:border-gray-700">
            <h2 className="text-lg font-semibold">
              {selectedRole ? `${selectedRole.name} Permissions` : 'Select a Role'}
            </h2>
          </div>
          
          <div className="p-6">
            {selectedRole ? (
              <div>
                <div className="mb-6">
                  <h3 className="font-medium mb-2">{selectedRole.name}</h3>
                  <p className="text-sm text-neutral dark:text-gray-400 mb-4">{selectedRole.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span><strong>{selectedRole.userCount}</strong> users</span>
                    <span><strong>{selectedRole.permissions.length}</strong> permissions</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {permissionCategories.map(category => (
                    <div key={category}>
                      <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">{category}</h4>
                      <div className="space-y-2">
                        {permissions
                          .filter(p => p.category === category)
                          .map(permission => (
                            <div key={permission.id} className="flex items-center justify-between p-3 border border-neutral dark:border-gray-600 rounded">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{permission.name}</div>
                                <div className="text-xs text-neutral dark:text-gray-400">{permission.description}</div>
                              </div>
                              <div className="ml-4">
                                {hasPermission(selectedRole, permission.id) ? (
                                  <Check className="h-5 w-5 text-green-500" />
                                ) : (
                                  <X className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a role to view its permissions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">👥 Bulk User Assignment</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Assign roles to multiple users at once</p>
          <button className="w-full px-4 py-2 bg-purple-600 text-var(--color-background) rounded hover:bg-purple-700">
            Bulk Assign
          </button>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📋 Permission Audit</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Review and audit permission assignments</p>
          <button className="w-full px-4 py-2 bg-orange-600 text-var(--color-background) rounded hover:bg-orange-700">
            Run Audit
          </button>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">⚙️ Role Templates</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Create roles from predefined templates</p>
          <button className="w-full px-4 py-2 bg-teal-600 text-var(--color-background) rounded hover:bg-teal-700">
            Browse Templates
          </button>
        </div>
      </div>
    </div>
  )
}
