import { useState, useEffect } from 'react'
import { supabase } from '@sabo/shared-auth'
import { 
  Search, Users, UserCheck, UserX, Crown, Shield, 
  Download, Plus, CheckCircle, Clock, Ban
} from 'lucide-react'

interface AdminUser {
  user_id: string
  full_name: string | null
  email?: string
  phone: string | null
  verified_rank: string | null
  ban_status: string | null
  ban_reason: string | null
  ban_expires_at: string | null
  role: string | null
  is_admin: boolean | null
  created_at: string
  updated_at: string
  city: string | null
  district: string | null
  bio: string | null
  avatar_url: string | null
  display_name: string | null
  nickname: string | null
  skill_level: string | null
  elo: number | null
  club_id: string | null
  member_since: string | null
  rank_verified_at: string | null
  rank_verified_by: string | null
}

interface UserAnalytics {
  total_users: number
  active_users: number
  banned_users: number
  new_users_this_month: number
  premium_users: number
  club_owners: number
  admins: number
}

export default function AdminUserManagementEnterprise() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [analytics, setAnalytics] = useState<UserAnalytics>({
    total_users: 0,
    active_users: 0,
    banned_users: 0,
    new_users_this_month: 0,
    premium_users: 0,
    club_owners: 0,
    admins: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [banDuration, setBanDuration] = useState('permanent')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Fetching users for enterprise management...')

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          phone,
          verified_rank,
          ban_status,
          ban_reason,
          ban_expires_at,
          role,
          is_admin,
          created_at,
          updated_at,
          city,
          district,
          bio,
          avatar_url,
          display_name,
          nickname,
          skill_level,
          elo,
          club_id,
          member_since,
          rank_verified_at,
          rank_verified_by
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching users:', error)
        throw error
      }

      console.log('✅ Fetched users:', data?.length || 0)
      setUsers(data || [])

      // Calculate analytics
      if (data) {
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        const analytics: UserAnalytics = {
          total_users: data.length,
          active_users: data.filter(u => u.ban_status !== 'banned').length,
          banned_users: data.filter(u => u.ban_status === 'banned').length,
          new_users_this_month: data.filter(u => new Date(u.created_at) >= thisMonth).length,
          premium_users: data.filter(u => u.role === 'premium').length,
          club_owners: data.filter(u => u.role === 'club_owner').length,
          admins: data.filter(u => u.is_admin === true).length,
        }
        setAnalytics(analytics)
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch users:', error)
      setError(error.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const updateUserBanStatus = async (userId: string, banStatus: string, banReason?: string, banExpiresAt?: string) => {
    try {
      console.log('🔨 Updating ban status:', { userId, banStatus, banReason })
      
      const { error } = await supabase
        .from('profiles')
        .update({
          ban_status: banStatus,
          ban_reason: banReason || null,
          ban_expires_at: banExpiresAt || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Error updating ban status:', error)
        throw error
      }

      console.log('✅ Ban status updated successfully')
      await fetchUsers() // Refresh the list
      return true
    } catch (error: any) {
      console.error('❌ Failed to update ban status:', error)
      alert(`Failed to update user: ${error.message}`)
      return false
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      console.log('👑 Updating user role:', { userId, newRole })
      
      const { error } = await supabase
        .from('profiles')
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Error updating role:', error)
        throw error
      }

      console.log('✅ Role updated successfully')
      await fetchUsers() // Refresh the list
      return true
    } catch (error: any) {
      console.error('❌ Failed to update role:', error)
      alert(`Failed to update role: ${error.message}`)
      return false
    }
  }

  const handleBanUser = async () => {
    if (!selectedUser) return
    
    const banExpiresAt = banDuration === 'permanent' ? null : 
      banDuration === '7days' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() :
      banDuration === '30days' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() :
      null

    const success = await updateUserBanStatus(
      selectedUser.user_id, 
      'banned', 
      banReason,
      banExpiresAt || undefined
    )
    
    if (success) {
      setBanDialogOpen(false)
      setBanReason('')
      setSelectedUser(null)
      alert('User banned successfully!')
    }
  }

  const handleUnbanUser = async (user: AdminUser) => {
    const success = await updateUserBanStatus(user.user_id, 'active')
    if (success) {
      alert('User unbanned successfully!')
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return
    
    if (!confirm(`Are you sure you want to ${bulkAction} ${selectedUsers.length} users?`)) {
      return
    }

    let successCount = 0
    for (const userId of selectedUsers) {
      try {
        if (bulkAction === 'ban') {
          await updateUserBanStatus(userId, 'banned', 'Bulk administrative action')
        } else if (bulkAction === 'unban') {
          await updateUserBanStatus(userId, 'active')
        } else if (bulkAction === 'premium') {
          await updateUserRole(userId, 'premium')
        }
        successCount++
      } catch (error) {
        console.error(`Failed to ${bulkAction} user ${userId}:`, error)
      }
    }
    
    alert(`${bulkAction} completed for ${successCount}/${selectedUsers.length} users`)
    setSelectedUsers([])
    setBulkAction('')
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm) ||
                         user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && user.ban_status !== 'banned') ||
                         (statusFilter === 'banned' && user.ban_status === 'banned')
    
    const matchesRole = roleFilter === 'all' ||
                       (roleFilter === 'admin' && user.is_admin === true) ||
                       (roleFilter === 'premium' && user.role === 'premium') ||
                       (roleFilter === 'club_owner' && user.role === 'club_owner') ||
                       (roleFilter === 'player' && (!user.role || user.role === 'player'))
    
    return matchesSearch && matchesStatus && matchesRole
  })

  const getStatusBadge = (user: AdminUser) => {
    if (user.ban_status === 'banned') {
      return <span className="px-2 py-1 text-xs bg-red-600 text-white rounded">Banned</span>
    }
    if (user.is_admin) {
      return <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded">Admin</span>
    }
    if (user.role === 'premium') {
      return <span className="px-2 py-1 text-xs bg-yellow-600 text-white rounded">Premium</span>
    }
    if (user.role === 'club_owner') {
      return <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Club Owner</span>
    }
    return <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">Active</span>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Users</h2>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">👥 User Management</h1>
            <p className="text-gray-400">Enterprise user administration and analytics</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-white">{analytics.total_users}</p>
              </div>
              <Users className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-400">{analytics.active_users}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Banned</p>
                <p className="text-2xl font-bold text-red-400">{analytics.banned_users}</p>
              </div>
              <Ban className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">New This Month</p>
                <p className="text-2xl font-bold text-blue-400">{analytics.new_users_this_month}</p>
              </div>
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Premium</p>
                <p className="text-2xl font-bold text-yellow-400">{analytics.premium_users}</p>
              </div>
              <Crown className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Club Owners</p>
                <p className="text-2xl font-bold text-blue-400">{analytics.club_owners}</p>
              </div>
              <Shield className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Admins</p>
                <p className="text-2xl font-bold text-purple-400">{analytics.admins}</p>
              </div>
              <Shield className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters and Bulk Actions */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, phone, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="player">Player</option>
                <option value="premium">Premium</option>
                <option value="club_owner">Club Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bulk Action</option>
                  <option value="ban">Ban Selected</option>
                  <option value="unban">Unban Selected</option>
                  <option value="premium">Make Premium</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  Apply ({selectedUsers.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">
              Users ({filteredUsers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No users found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.user_id))
                          } else {
                            setSelectedUsers([])
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ELO</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map(user => (
                    <tr key={user.user_id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.user_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.user_id])
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.user_id))
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.full_name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {user.phone || 'No phone'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.user_id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user)}
                        {user.ban_reason && (
                          <div className="text-xs text-red-400 mt-1">
                            {user.ban_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">
                          {user.role || 'player'}
                        </span>
                        {user.verified_rank && (
                          <div className="text-xs text-gray-500">
                            Rank: {user.verified_rank}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.elo || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {user.ban_status === 'banned' ? (
                            <button
                              onClick={() => handleUnbanUser(user)}
                              className="text-green-400 hover:text-green-300"
                              title="Unban User"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setBanDialogOpen(true)
                              }}
                              className="text-red-400 hover:text-red-300"
                              title="Ban User"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => updateUserRole(user.user_id, user.role === 'premium' ? 'player' : 'premium')}
                            className="text-yellow-400 hover:text-yellow-300"
                            title="Toggle Premium"
                          >
                            <Crown className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Ban User Modal */}
        {banDialogOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-white mb-4">
                Ban User: {selectedUser.full_name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Ban Reason
                  </label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter reason for ban..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Ban Duration
                  </label>
                  <select
                    value={banDuration}
                    onChange={(e) => setBanDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="permanent">Permanent</option>
                    <option value="7days">7 Days</option>
                    <option value="30days">30 Days</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setBanDialogOpen(false)
                      setSelectedUser(null)
                      setBanReason('')
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBanUser}
                    disabled={!banReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Ban User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
