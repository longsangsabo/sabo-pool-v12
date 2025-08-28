import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@sabo/shared-auth'

// Simple toast replacement for now - can be enhanced later
const toast = {
  success: (message: string) => console.log('✅ SUCCESS:', message),
  error: (message: string) => console.error('❌ ERROR:', message),
}

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

interface UserStats {
  total_users: number
  active_users: number
  banned_users: number
  new_users_this_month: number
  premium_users: number
  club_owners: number
  admins: number
  avg_elo: number
  verified_players: number
  club_members: number
}

interface UserActivity {
  user_id: string
  activity_type: string
  activity_description: string
  timestamp: string
  metadata?: Record<string, any>
}

interface BanUserParams {
  userId: string
  banReason: string
  banDuration?: string
  banExpiresAt?: string
}

interface UpdateUserRoleParams {
  userId: string
  newRole: string
  isAdmin?: boolean
}

export const useAdminUsersEnterprise = () => {
  const queryClient = useQueryClient()

  // Fetch all users with comprehensive data
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['admin-users-enterprise'],
    queryFn: async (): Promise<AdminUser[]> => {
      console.log('🔄 Fetching users for enterprise admin...')
      
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
        throw new Error(`Failed to fetch users: ${error.message}`)
      }

      console.log('✅ Fetched users:', data?.length || 0)
      return data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Auto-refresh every 10 minutes
  })

  // Calculate user statistics
  const userStats: UserStats = {
    total_users: users.length,
    active_users: users.filter(u => u.ban_status !== 'banned').length,
    banned_users: users.filter(u => u.ban_status === 'banned').length,
    new_users_this_month: users.filter(u => {
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)
      return new Date(u.created_at) >= thisMonth
    }).length,
    premium_users: users.filter(u => u.role === 'premium').length,
    club_owners: users.filter(u => u.role === 'club_owner').length,
    admins: users.filter(u => u.is_admin === true).length,
    avg_elo: Math.round(
      users.filter(u => u.elo !== null).reduce((sum, u) => sum + (u.elo || 0), 0) / 
      users.filter(u => u.elo !== null).length || 0
    ),
    verified_players: users.filter(u => u.verified_rank !== null).length,
    club_members: users.filter(u => u.club_id !== null).length,
  }

  // Fetch user activity logs
  const {
    data: userActivities = [],
    isLoading: activitiesLoading
  } = useQuery({
    queryKey: ['user-activities'],
    queryFn: async (): Promise<UserActivity[]> => {
      console.log('🔄 Fetching user activities...')
      
      // First try to get from a dedicated activity table
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100)

      if (!activitiesError && activities) {
        return activities
      }

      // Fallback: Get recent profile updates as activities
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, updated_at, ban_status, role')
        .order('updated_at', { ascending: false })
        .limit(50)

      if (profilesError) {
        console.error('❌ Error fetching activities:', profilesError)
        return []
      }

      // Convert profile updates to activity format
      return profiles.map(profile => ({
        user_id: profile.user_id,
        activity_type: 'profile_update',
        activity_description: `Profile updated for ${profile.full_name || 'Unknown User'}`,
        timestamp: profile.updated_at,
        metadata: {
          ban_status: profile.ban_status,
          role: profile.role
        }
      }))
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: async ({ userId, banReason, banDuration, banExpiresAt }: BanUserParams) => {
      console.log('🔨 Banning user:', { userId, banReason, banDuration })
      
      const { error } = await supabase
        .from('profiles')
        .update({
          ban_status: 'banned',
          ban_reason: banReason,
          ban_expires_at: banExpiresAt || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Error banning user:', error)
        throw new Error(`Failed to ban user: ${error.message}`)
      }

      // Log the activity
      await logUserActivity({
        user_id: userId,
        activity_type: 'user_banned',
        activity_description: `User banned: ${banReason}`,
        metadata: { ban_duration: banDuration, ban_expires_at: banExpiresAt }
      })

      return { userId, banReason }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-enterprise'] })
      queryClient.invalidateQueries({ queryKey: ['user-activities'] })
      toast.success(`User banned successfully: ${data.banReason}`)
      console.log('✅ User banned successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to ban user: ${error.message}`)
      console.error('❌ Ban user failed:', error)
    },
  })

  // Unban user mutation
  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('🔓 Unbanning user:', userId)
      
      const { error } = await supabase
        .from('profiles')
        .update({
          ban_status: 'active',
          ban_reason: null,
          ban_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Error unbanning user:', error)
        throw new Error(`Failed to unban user: ${error.message}`)
      }

      // Log the activity
      await logUserActivity({
        user_id: userId,
        activity_type: 'user_unbanned',
        activity_description: 'User unbanned by admin',
        metadata: {}
      })

      return userId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-enterprise'] })
      queryClient.invalidateQueries({ queryKey: ['user-activities'] })
      toast.success('User unbanned successfully')
      console.log('✅ User unbanned successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to unban user: ${error.message}`)
      console.error('❌ Unban user failed:', error)
    },
  })

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole, isAdmin }: UpdateUserRoleParams) => {
      console.log('👑 Updating user role:', { userId, newRole, isAdmin })
      
      const updateData: any = {
        role: newRole,
        updated_at: new Date().toISOString(),
      }

      if (isAdmin !== undefined) {
        updateData.is_admin = isAdmin
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Error updating user role:', error)
        throw new Error(`Failed to update user role: ${error.message}`)
      }

      // Log the activity
      await logUserActivity({
        user_id: userId,
        activity_type: 'role_updated',
        activity_description: `User role updated to: ${newRole}`,
        metadata: { new_role: newRole, is_admin: isAdmin }
      })

      return { userId, newRole, isAdmin }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-enterprise'] })
      queryClient.invalidateQueries({ queryKey: ['user-activities'] })
      toast.success(`User role updated to: ${data.newRole}`)
      console.log('✅ User role updated successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user role: ${error.message}`)
      console.error('❌ Update user role failed:', error)
    },
  })

  // Bulk operations mutation
  const bulkOperationMutation = useMutation({
    mutationFn: async ({ 
      userIds, 
      operation, 
      params 
    }: { 
      userIds: string[]
      operation: 'ban' | 'unban' | 'update_role' | 'delete'
      params?: any 
    }) => {
      console.log('🔄 Performing bulk operation:', { operation, userCount: userIds.length })
      
      let successCount = 0
      const errors: string[] = []

      for (const userId of userIds) {
        try {
          switch (operation) {
            case 'ban':
              await banUserMutation.mutateAsync({
                userId,
                banReason: params.banReason || 'Bulk administrative action',
                banDuration: params.banDuration,
                banExpiresAt: params.banExpiresAt
              })
              break
            case 'unban':
              await unbanUserMutation.mutateAsync(userId)
              break
            case 'update_role':
              await updateUserRoleMutation.mutateAsync({
                userId,
                newRole: params.newRole,
                isAdmin: params.isAdmin
              })
              break
            default:
              throw new Error(`Unsupported bulk operation: ${operation}`)
          }
          successCount++
        } catch (error: any) {
          errors.push(`${userId}: ${error.message}`)
          console.error(`❌ Bulk operation failed for user ${userId}:`, error)
        }
      }

      return { successCount, totalCount: userIds.length, errors }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-enterprise'] })
      queryClient.invalidateQueries({ queryKey: ['user-activities'] })
      
      if (result.errors.length === 0) {
        toast.success(`Bulk operation completed: ${result.successCount}/${result.totalCount} users`)
      } else {
        toast.error(`Bulk operation partially failed: ${result.successCount}/${result.totalCount} succeeded`)
      }
      console.log('✅ Bulk operation completed:', result)
    },
    onError: (error: Error) => {
      toast.error(`Bulk operation failed: ${error.message}`)
      console.error('❌ Bulk operation failed:', error)
    },
  })

  // Helper function to log user activities
  const logUserActivity = async (activity: Omit<UserActivity, 'timestamp'>) => {
    try {
      // Try to insert into dedicated activity table
      const { error } = await supabase
        .from('user_activity_logs')
        .insert({
          ...activity,
          timestamp: new Date().toISOString()
        })

      if (error) {
        console.warn('⚠️ Could not log activity to dedicated table:', error)
        // Could fallback to a different logging mechanism here
      }
    } catch (error) {
      console.warn('⚠️ Activity logging failed:', error)
    }
  }

  // Export data function
  const exportUsers = async (format: 'csv' | 'json' = 'csv') => {
    try {
      console.log('📄 Exporting users in format:', format)
      
      if (format === 'csv') {
        const csvHeaders = [
          'User ID', 'Full Name', 'Phone', 'Email', 'Role', 'Status', 
          'ELO', 'Verified Rank', 'Created At', 'Ban Reason'
        ]
        
        const csvRows = users.map(user => [
          user.user_id,
          user.full_name || '',
          user.phone || '',
          '', // email not in current schema
          user.role || 'player',
          user.ban_status || 'active',
          user.elo || '',
          user.verified_rank || '',
          user.created_at,
          user.ban_reason || ''
        ])

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `sabo-users-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)
      } else {
        const jsonContent = JSON.stringify(users, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `sabo-users-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
      }

      toast.success(`Users exported successfully as ${format.toUpperCase()}`)
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`)
      console.error('❌ Export failed:', error)
    }
  }

  return {
    // Data
    users,
    userStats,
    userActivities,
    
    // Loading states
    usersLoading,
    activitiesLoading,
    isLoading: usersLoading || activitiesLoading,
    
    // Error states
    usersError,
    
    // Actions
    banUser: banUserMutation.mutate,
    unbanUser: unbanUserMutation.mutate,
    updateUserRole: updateUserRoleMutation.mutate,
    bulkOperation: bulkOperationMutation.mutate,
    exportUsers,
    refetchUsers,
    
    // Mutation states
    isBanning: banUserMutation.isPending,
    isUnbanning: unbanUserMutation.isPending,
    isUpdatingRole: updateUserRoleMutation.isPending,
    isBulkOperating: bulkOperationMutation.isPending,
  }
}
