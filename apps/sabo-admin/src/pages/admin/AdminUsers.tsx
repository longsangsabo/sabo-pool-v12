import { useState, useEffect } from 'react';
import { supabase } from '@sabo/shared-auth';
import {
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Crown,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';

interface AdminUser {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  verified_rank?: string;
  elo?: number;
  skill_level?: string;
  is_demo_user?: boolean;
  ban_status: string | null;
  ban_reason?: string | null;
  ban_expires_at?: string | null;
  role: string;
  is_admin?: boolean;
  city?: string;
  club_id?: string | null;
  rank_verified_at?: string | null;
  rank_verified_by?: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [isUpdatingBan, setIsUpdatingBan] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      

      const { data, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id, user_id, full_name, email, phone, verified_rank, elo, skill_level,
          is_demo_user, ban_status, ban_reason, role, is_admin, city,
          created_at, updated_at
        `)
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error loading users:', usersError);
        throw usersError;
      }

      const formattedUsers: AdminUser[] = (data || []).map(user => ({
        ...user,
        ban_expires_at: null,
        club_id: null,
        rank_verified_at: null,
        rank_verified_by: null,
        role: user.role || 'player',
      }));

      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('❌ Failed to load users:', error);
      setError(error.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      !searchQuery ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.ban_status !== 'banned') ||
      (statusFilter === 'banned' && user.ban_status === 'banned') ||
      (statusFilter === 'inactive' && user.ban_status === 'inactive');

    return matchesSearch && matchesStatus;
  });

  const updateUserBan = async ({
    userId,
    banStatus,
    banReason,
  }: {
    userId: string;
    banStatus: string;
    banReason?: string | null;
  }) => {
    try {
      setIsUpdatingBan(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          ban_status: banStatus,
          ban_reason: banReason,
          banned_at: banStatus === 'banned' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      await loadUsers(); // Reload users after update
    } catch (error: any) {
      console.error('❌ Failed to update user ban status:', error);
      setError(error.message || 'Failed to update user ban status');
    } finally {
      setIsUpdatingBan(false);
    }
  };

  const updateUserRole = async ({ userId, role }: { userId: string; role: string }) => {
    try {
      setIsUpdatingRole(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          role: role,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      await loadUsers(); // Reload users after update
    } catch (error: any) {
      console.error('❌ Failed to update user role:', error);
      setError(error.message || 'Failed to update user role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleBanUser = (user: AdminUser) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };

  const confirmBanUser = () => {
    if (selectedUser) {
      updateUserBan({
        userId: selectedUser.user_id,
        banStatus: 'banned',
        banReason: banReason,
      });
      setBanDialogOpen(false);
      setBanReason('');
      setSelectedUser(null);
    }
  };

  const handleUnbanUser = (user: AdminUser) => {
    updateUserBan({
      userId: user.user_id,
      banStatus: 'active',
      banReason: null,
    });
  };

  const handleChangeRole = (user: AdminUser, newRole: string) => {
    updateUserRole({
      userId: user.user_id,
      role: newRole,
    });
  };

  const getStatusColor = (banStatus: string | null) => {
    switch (banStatus) {
      case 'banned':
        return 'bg-red-500/10 text-red-400 border-red-400';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-400 border-gray-400';
      default:
        return 'bg-green-500/10 text-green-400 border-green-400';
    }
  };

  const getStatusText = (banStatus: string | null) => {
    switch (banStatus) {
      case 'banned':
        return 'Banned';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Active';
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'premium' ? <Crown className='w-4 h-4 text-yellow-400' /> : null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (error) {
    return (
      <div className="text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">User Management Error</h2>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={loadUsers}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
              <p className="text-gray-400">Loading users...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-white'>👥 User Management</h1>
            <p className='text-gray-400'>Manage user accounts, roles, and permissions</p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className='flex gap-4'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              placeholder="Search users by name or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-48 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* User List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">User List</h2>
            <p className="text-gray-400">
              Total: {filteredUsers.length} users
            </p>
          </div>
          <div className="p-6">
            <div className='space-y-4'>
              {filteredUsers.map(user => (
                <div
                  key={user.user_id}
                  className='flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-900 hover:bg-gray-800/50 transition-colors'
                >
                  <div className='flex items-center space-x-4'>
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    
                    {/* User Info */}
                    <div>
                      <div className='flex items-center space-x-2'>
                        <h3 className='font-medium text-white'>
                          {user.full_name || 'Not Updated'}
                        </h3>
                        {getRoleIcon(user.role)}
                        {user.is_admin && (
                          <span className="px-2 py-1 text-xs bg-purple-500/10 text-purple-400 border border-purple-400 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className='text-sm text-gray-400'>{user.user_id}</p>
                      <p className='text-sm text-gray-400'>
                        {user.phone || 'No Phone'}
                      </p>
                      {user.ban_reason && (
                        <p className='text-sm text-red-400 flex items-center mt-1'>
                          <AlertTriangle className='w-3 h-3 mr-1' />
                          {user.ban_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* User Details & Actions */}
                  <div className='flex items-center space-x-4'>
                    {/* Rank & City */}
                    <div className='text-right'>
                      <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded border border-gray-600 mb-1 block">
                        {user.verified_rank || 'Not Verified'}
                      </span>
                      <p className='text-sm text-gray-400'>
                        {user.city || 'Not Updated'}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2 py-1 text-xs border rounded ${getStatusColor(user.ban_status)}`}>
                      {getStatusText(user.ban_status)}
                    </span>

                    {/* Dates */}
                    <div className='text-right text-sm text-gray-400'>
                      <p>Joined: {formatDate(user.created_at)}</p>
                      <p>Updated: {formatDate(user.updated_at)}</p>
                    </div>

                    {/* Actions Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === user.user_id ? null : user.user_id)}
                        disabled={isUpdatingBan || isUpdatingRole}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                      >
                        <MoreHorizontal className='w-4 h-4' />
                      </button>
                      
                      {activeDropdown === user.user_id && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                              <UserCheck className='w-4 h-4 mr-2' />
                              View Details
                            </button>
                            
                            <hr className="border-gray-700" />
                            
                            {user.ban_status === 'banned' ? (
                              <button
                                onClick={() => {
                                  handleUnbanUser({
                                    ...user,
                                    ban_expires_at: null,
                                    club_id: null,
                                    rank_verified_at: null,
                                    rank_verified_by: null,
                                  });
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-green-400 hover:bg-gray-700 transition-colors"
                              >
                                <UserCheck className='w-4 h-4 mr-2' />
                                Unlock Account
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  handleBanUser({
                                    ...user,
                                    ban_expires_at: null,
                                    club_id: null,
                                    rank_verified_at: null,
                                    rank_verified_by: null,
                                  });
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                              >
                                <UserX className='w-4 h-4 mr-2' />
                                Ban Account
                              </button>
                            )}
                            
                            <hr className="border-gray-700" />
                            
                            <button
                              onClick={() => {
                                handleChangeRole(
                                  {
                                    ...user,
                                    ban_expires_at: null,
                                    club_id: null,
                                    rank_verified_at: null,
                                    rank_verified_by: null,
                                  },
                                  user.role === 'premium' ? 'player' : 'premium'
                                );
                                setActiveDropdown(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700 transition-colors"
                            >
                              <Crown className='w-4 h-4 mr-2' />
                              {user.role === 'premium' ? 'Cancel Premium' : 'Upgrade Premium'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className='text-center py-8 text-gray-400'>
                  No users found matching the current filters
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ban User Dialog */}
        {banDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-white mb-2">Ban User Account</h3>
              <p className="text-gray-400 mb-4">
                Are you sure you want to ban {selectedUser?.full_name || 'this user'}? This action will prevent them from accessing the system.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ban Reason
                </label>
                <textarea
                  placeholder="Enter the reason for banning this user..."
                  value={banReason}
                  onChange={e => setBanReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-none"
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setBanDialogOpen(false)}
                  className="px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBanUser}
                  disabled={!banReason.trim() || isUpdatingBan}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isUpdatingBan ? 'Processing...' : 'Ban Account'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Click outside to close dropdown */}
        {activeDropdown && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setActiveDropdown(null)}
          />
        )}
      </div>
    </div>
  );
}
