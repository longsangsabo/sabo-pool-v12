// =====================================================
// 👨‍💼 ADMIN FUNCTIONS BUSINESS LOGIC
// =====================================================

/**
 * Centralized admin business logic extracted from:
 * - useAdminCheck.ts
 * - AdminUsers.tsx
 * - AdminAnalytics.tsx
 * - Admin role management systems
 * - Permission management components
 * 
 * Provides unified admin management for:
 * - Role-based access control
 * - User management operations
 * - Admin authentication
 * - Permission validation
 * - System moderation
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ===== ADMIN TYPES =====

export type UserRole = 'user' | 'admin' | 'super_admin' | 'moderator' | 'club_owner' | 'club_admin';
export type Permission = 
  | 'users.read' | 'users.write' | 'users.delete'
  | 'clubs.read' | 'clubs.write' | 'clubs.delete' | 'clubs.moderate'
  | 'tournaments.read' | 'tournaments.write' | 'tournaments.delete'
  | 'matches.read' | 'matches.write' | 'matches.delete' | 'matches.moderate'
  | 'analytics.read' | 'analytics.write'
  | 'system.read' | 'system.write' | 'system.admin'
  | 'notifications.read' | 'notifications.write'
  | 'content.moderate' | 'reports.handle'
  | 'financial.read' | 'financial.write';

export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'moderate' | 'admin';

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  permissions: Permission[];
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface RoleDefinition {
  role: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  hierarchy: number; // Higher number = more permissions
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalClubs: number;
  totalMatches: number;
  pendingReports: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  recentActivity: AdminActivity[];
}

export interface AdminActivity {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: 'user' | 'club' | 'match' | 'tournament' | 'report' | 'system';
  target_id?: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ModerationReport {
  id: string;
  reporter_id: string;
  reporter_name: string;
  target_type: 'user' | 'club' | 'match' | 'comment' | 'chat';
  target_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  assigned_admin?: string;
  resolution?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserManagementAction {
  action: 'suspend' | 'unsuspend' | 'delete' | 'warn' | 'update_role' | 'reset_password';
  userId: string;
  reason?: string;
  duration?: number; // in days for suspension
  newRole?: UserRole;
  metadata?: Record<string, any>;
}

// ===== ROLE DEFINITIONS =====

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    role: 'user',
    displayName: 'Người dùng',
    description: 'Người dùng thông thường',
    permissions: [],
    hierarchy: 1
  },
  {
    role: 'club_admin',
    displayName: 'Admin CLB',
    description: 'Quản trị viên câu lạc bộ',
    permissions: [
      'clubs.read', 'clubs.write',
      'users.read',
      'matches.read', 'matches.write',
      'analytics.read'
    ],
    hierarchy: 2
  },
  {
    role: 'club_owner',
    displayName: 'Chủ CLB',
    description: 'Chủ sở hữu câu lạc bộ',
    permissions: [
      'clubs.read', 'clubs.write', 'clubs.moderate',
      'users.read', 'users.write',
      'matches.read', 'matches.write', 'matches.moderate',
      'tournaments.read', 'tournaments.write',
      'analytics.read',
      'financial.read'
    ],
    hierarchy: 3
  },
  {
    role: 'moderator',
    displayName: 'Điều hành viên',
    description: 'Điều hành viên hệ thống',
    permissions: [
      'users.read', 'users.write',
      'clubs.read', 'clubs.moderate',
      'matches.read', 'matches.moderate',
      'tournaments.read',
      'content.moderate', 'reports.handle',
      'notifications.read', 'notifications.write'
    ],
    hierarchy: 4
  },
  {
    role: 'admin',
    displayName: 'Quản trị viên',
    description: 'Quản trị viên hệ thống',
    permissions: [
      'users.read', 'users.write', 'users.delete',
      'clubs.read', 'clubs.write', 'clubs.delete', 'clubs.moderate',
      'tournaments.read', 'tournaments.write', 'tournaments.delete',
      'matches.read', 'matches.write', 'matches.delete', 'matches.moderate',
      'analytics.read', 'analytics.write',
      'notifications.read', 'notifications.write',
      'content.moderate', 'reports.handle',
      'financial.read', 'financial.write',
      'system.read'
    ],
    hierarchy: 5
  },
  {
    role: 'super_admin',
    displayName: 'Siêu quản trị',
    description: 'Siêu quản trị viên',
    permissions: [
      'users.read', 'users.write', 'users.delete',
      'clubs.read', 'clubs.write', 'clubs.delete', 'clubs.moderate',
      'tournaments.read', 'tournaments.write', 'tournaments.delete',
      'matches.read', 'matches.write', 'matches.delete', 'matches.moderate',
      'analytics.read', 'analytics.write',
      'notifications.read', 'notifications.write',
      'content.moderate', 'reports.handle',
      'financial.read', 'financial.write',
      'system.read', 'system.write', 'system.admin'
    ],
    hierarchy: 6
  }
];

// ===== ADMIN SERVICE =====

export class AdminService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // ===== ROLE & PERMISSION MANAGEMENT =====

  /**
   * Check if user has admin role
   */
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error checking admin status:', error);
        return false;
      }

      const adminRoles: UserRole[] = ['admin', 'super_admin', 'moderator'];
      return adminRoles.includes(data?.role as UserRole);
    } catch (error) {
      console.error('❌ Exception checking admin status:', error);
      return false;
    }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    try {
      const user = await this.getUserWithRole(userId);
      if (!user) return false;

      const roleDefinition = ROLE_DEFINITIONS.find(r => r.role === user.role);
      if (!roleDefinition) return false;

      return roleDefinition.permissions.includes(permission);
    } catch (error) {
      console.error('❌ Exception checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user can perform action on resource
   */
  async canPerformAction(
    userId: string,
    action: ActionType,
    resourceType: string,
    resourceId?: string
  ): Promise<boolean> {
    try {
      // Special case: users can always read their own data
      if (action === 'read' && resourceType === 'user' && resourceId === userId) {
        return true;
      }

      // Map action and resource to permission
      const permission = this.mapActionToPermission(action, resourceType);
      if (!permission) return false;

      // Check basic permission
      const hasBasicPermission = await this.hasPermission(userId, permission);
      if (!hasBasicPermission) return false;

      // Additional checks for specific resources
      if (resourceType === 'club' && resourceId) {
        return this.canAccessClub(userId, resourceId, action);
      }

      return true;
    } catch (error) {
      console.error('❌ Exception checking action permission:', error);
      return false;
    }
  }

  /**
   * Get user with role information
   */
  async getUserWithRole(userId: string): Promise<AdminUser | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('id, email, full_name, avatar_url, role, is_active, last_login, created_at, updated_at, metadata')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error getting user with role:', error);
        return null;
      }

      const roleDefinition = ROLE_DEFINITIONS.find(r => r.role === data.role);
      
      return {
        ...data,
        permissions: roleDefinition?.permissions || []
      } as AdminUser;
    } catch (error) {
      console.error('❌ Exception getting user with role:', error);
      return null;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(
    adminId: string,
    targetUserId: string,
    newRole: UserRole,
    reason?: string
  ): Promise<boolean> {
    try {
      // Check if admin has permission to update roles
      const canUpdate = await this.hasPermission(adminId, 'users.write');
      if (!canUpdate) {
        console.error('❌ Admin lacks permission to update roles');
        return false;
      }

      // Check role hierarchy (admin can't assign higher role than their own)
      const admin = await this.getUserWithRole(adminId);
      const adminHierarchy = ROLE_DEFINITIONS.find(r => r.role === admin?.role)?.hierarchy || 0;
      const newRoleHierarchy = ROLE_DEFINITIONS.find(r => r.role === newRole)?.hierarchy || 0;

      if (newRoleHierarchy >= adminHierarchy && admin?.role !== 'super_admin') {
        console.error('❌ Cannot assign role equal or higher than admin role');
        return false;
      }

      // Update role
      const { error } = await this.supabase
        .from('user_profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUserId);

      if (error) {
        console.error('❌ Error updating user role:', error);
        return false;
      }

      // Log admin activity
      await this.logAdminActivity(adminId, {
        action: 'update_user_role',
        target_type: 'user',
        target_id: targetUserId,
        description: `Updated user role to ${newRole}`,
        metadata: { new_role: newRole, reason }
      });

      return true;
    } catch (error) {
      console.error('❌ Exception updating user role:', error);
      return false;
    }
  }

  // ===== USER MANAGEMENT =====

  /**
   * Get all users with admin information
   */
  async getAllUsers(filters?: {
    role?: UserRole[];
    isActive?: boolean;
    searchTerm?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: AdminUser[]; total: number }> {
    try {
      let query = this.supabase
        .from('user_profiles')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters?.role?.length) {
        query = query.in('role', filters.role);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters?.searchTerm) {
        query = query.or(`full_name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%`);
      }

      // Apply pagination
      if (filters?.page && filters?.limit) {
        const offset = (filters.page - 1) * filters.limit;
        query = query.range(offset, offset + filters.limit - 1);
      }

      // Order by created date
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error getting all users:', error);
        return { users: [], total: 0 };
      }

      const users = data?.map(user => {
        const roleDefinition = ROLE_DEFINITIONS.find(r => r.role === user.role);
        return {
          ...user,
          permissions: roleDefinition?.permissions || []
        } as AdminUser;
      }) || [];

      return { users, total: count || 0 };
    } catch (error) {
      console.error('❌ Exception getting all users:', error);
      return { users: [], total: 0 };
    }
  }

  /**
   * Suspend user
   */
  async suspendUser(
    adminId: string,
    targetUserId: string,
    reason: string,
    duration?: number
  ): Promise<boolean> {
    try {
      const canSuspend = await this.hasPermission(adminId, 'users.write');
      if (!canSuspend) return false;

      const expiresAt = duration ? 
        new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString() : 
        null;

      const { error } = await this.supabase
        .from('user_suspensions')
        .insert({
          user_id: targetUserId,
          admin_id: adminId,
          reason,
          expires_at: expiresAt,
          is_active: true
        });

      if (error) {
        console.error('❌ Error suspending user:', error);
        return false;
      }

      // Update user status
      await this.supabase
        .from('user_profiles')
        .update({ is_active: false })
        .eq('id', targetUserId);

      // Log activity
      await this.logAdminActivity(adminId, {
        action: 'suspend_user',
        target_type: 'user',
        target_id: targetUserId,
        description: `Suspended user for: ${reason}`,
        metadata: { reason, duration }
      });

      return true;
    } catch (error) {
      console.error('❌ Exception suspending user:', error);
      return false;
    }
  }

  /**
   * Unsuspend user
   */
  async unsuspendUser(adminId: string, targetUserId: string): Promise<boolean> {
    try {
      const canUnsuspend = await this.hasPermission(adminId, 'users.write');
      if (!canUnsuspend) return false;

      // Deactivate suspension
      const { error } = await this.supabase
        .from('user_suspensions')
        .update({ is_active: false })
        .eq('user_id', targetUserId)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error unsuspending user:', error);
        return false;
      }

      // Update user status
      await this.supabase
        .from('user_profiles')
        .update({ is_active: true })
        .eq('id', targetUserId);

      // Log activity
      await this.logAdminActivity(adminId, {
        action: 'unsuspend_user',
        target_type: 'user',
        target_id: targetUserId,
        description: 'Unsuspended user'
      });

      return true;
    } catch (error) {
      console.error('❌ Exception unsuspending user:', error);
      return false;
    }
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(adminId: string, targetUserId: string, reason: string): Promise<boolean> {
    try {
      const canDelete = await this.hasPermission(adminId, 'users.delete');
      if (!canDelete) return false;

      // Soft delete user
      const { error } = await this.supabase
        .from('user_profiles')
        .update({ 
          is_active: false,
          deleted_at: new Date().toISOString(),
          deleted_by: adminId,
          deletion_reason: reason
        })
        .eq('id', targetUserId);

      if (error) {
        console.error('❌ Error deleting user:', error);
        return false;
      }

      // Log activity
      await this.logAdminActivity(adminId, {
        action: 'delete_user',
        target_type: 'user',
        target_id: targetUserId,
        description: `Deleted user for: ${reason}`,
        metadata: { reason }
      });

      return true;
    } catch (error) {
      console.error('❌ Exception deleting user:', error);
      return false;
    }
  }

  // ===== MODERATION =====

  /**
   * Get moderation reports
   */
  async getModerationReports(filters?: {
    status?: ModerationReport['status'][];
    targetType?: ModerationReport['target_type'][];
    assignedAdmin?: string;
    page?: number;
    limit?: number;
  }): Promise<{ reports: ModerationReport[]; total: number }> {
    try {
      let query = this.supabase
        .from('moderation_reports')
        .select(`
          *,
          reporter:user_profiles!reporter_id(full_name),
          assigned_admin_profile:user_profiles!assigned_admin(full_name)
        `, { count: 'exact' });

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.targetType?.length) {
        query = query.in('target_type', filters.targetType);
      }
      if (filters?.assignedAdmin) {
        query = query.eq('assigned_admin', filters.assignedAdmin);
      }

      // Apply pagination
      if (filters?.page && filters?.limit) {
        const offset = (filters.page - 1) * filters.limit;
        query = query.range(offset, offset + filters.limit - 1);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error getting moderation reports:', error);
        return { reports: [], total: 0 };
      }

      const reports = data?.map(report => ({
        ...report,
        reporter_name: report.reporter?.full_name || 'Unknown'
      })) || [];

      return { reports, total: count || 0 };
    } catch (error) {
      console.error('❌ Exception getting moderation reports:', error);
      return { reports: [], total: 0 };
    }
  }

  /**
   * Handle moderation report
   */
  async handleModerationReport(
    adminId: string,
    reportId: string,
    status: ModerationReport['status'],
    resolution?: string
  ): Promise<boolean> {
    try {
      const canHandle = await this.hasPermission(adminId, 'reports.handle');
      if (!canHandle) return false;

      const { error } = await this.supabase
        .from('moderation_reports')
        .update({
          status,
          assigned_admin: adminId,
          resolution,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) {
        console.error('❌ Error handling moderation report:', error);
        return false;
      }

      // Log activity
      await this.logAdminActivity(adminId, {
        action: 'handle_report',
        target_type: 'report',
        target_id: reportId,
        description: `Updated report status to ${status}`,
        metadata: { status, resolution }
      });

      return true;
    } catch (error) {
      console.error('❌ Exception handling moderation report:', error);
      return false;
    }
  }

  // ===== ADMIN STATISTICS =====

  /**
   * Get admin dashboard statistics
   */
  async getAdminStats(): Promise<AdminStats | null> {
    try {
      const { data: stats, error } = await this.supabase
        .rpc('get_admin_dashboard_stats');

      if (error) {
        console.error('❌ Error getting admin stats:', error);
        return null;
      }

      // Get recent admin activities
      const recentActivity = await this.getRecentAdminActivity();

      return {
        totalUsers: stats?.total_users || 0,
        activeUsers: stats?.active_users || 0,
        totalClubs: stats?.total_clubs || 0,
        totalMatches: stats?.total_matches || 0,
        pendingReports: stats?.pending_reports || 0,
        systemHealth: stats?.system_health || 'healthy',
        recentActivity
      };
    } catch (error) {
      console.error('❌ Exception getting admin stats:', error);
      return null;
    }
  }

  /**
   * Get recent admin activity
   */
  async getRecentAdminActivity(limit: number = 10): Promise<AdminActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('admin_activities')
        .select(`
          *,
          admin:user_profiles!admin_id(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error getting recent admin activity:', error);
        return [];
      }

      return data?.map(activity => ({
        ...activity,
        admin_name: activity.admin?.full_name || 'Unknown Admin'
      })) || [];
    } catch (error) {
      console.error('❌ Exception getting recent admin activity:', error);
      return [];
    }
  }

  /**
   * Log admin activity
   */
  async logAdminActivity(
    adminId: string,
    activity: Omit<AdminActivity, 'id' | 'admin_id' | 'admin_name' | 'created_at'>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('admin_activities')
        .insert({
          admin_id: adminId,
          action: activity.action,
          target_type: activity.target_type,
          target_id: activity.target_id,
          description: activity.description,
          metadata: activity.metadata || {}
        });

      return !error;
    } catch (error) {
      console.error('❌ Exception logging admin activity:', error);
      return false;
    }
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Map action to permission
   */
  private mapActionToPermission(action: ActionType, resourceType: string): Permission | null {
    const permissionMap: Record<string, Permission> = {
      'read_user': 'users.read',
      'write_user': 'users.write',
      'delete_user': 'users.delete',
      'read_club': 'clubs.read',
      'write_club': 'clubs.write',
      'delete_club': 'clubs.delete',
      'moderate_club': 'clubs.moderate',
      'read_tournament': 'tournaments.read',
      'write_tournament': 'tournaments.write',
      'delete_tournament': 'tournaments.delete',
      'read_match': 'matches.read',
      'write_match': 'matches.write',
      'delete_match': 'matches.delete',
      'moderate_match': 'matches.moderate',
      'read_analytics': 'analytics.read',
      'write_analytics': 'analytics.write',
      'read_system': 'system.read',
      'write_system': 'system.write',
      'admin_system': 'system.admin',
      'read_notification': 'notifications.read',
      'write_notification': 'notifications.write',
      'moderate_content': 'content.moderate',
      'handle_reports': 'reports.handle',
      'read_financial': 'financial.read',
      'write_financial': 'financial.write'
    };

    return permissionMap[`${action}_${resourceType}`] || null;
  }

  /**
   * Check if user can access specific club
   */
  private async canAccessClub(userId: string, clubId: string, action: ActionType): Promise<boolean> {
    try {
      // Check if user is club owner or admin
      const { data: membership } = await this.supabase
        .from('club_members')
        .select('role')
        .eq('user_id', userId)
        .eq('club_id', clubId)
        .single();

      if (membership?.role === 'owner' || membership?.role === 'admin') {
        return true;
      }

      // Check if user has system-level permissions
      const user = await this.getUserWithRole(userId);
      const roleHierarchy = ROLE_DEFINITIONS.find(r => r.role === user?.role)?.hierarchy || 0;
      
      // Moderators and above can access all clubs
      return roleHierarchy >= 4;
    } catch (error) {
      console.error('❌ Exception checking club access:', error);
      return false;
    }
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role: UserRole): string {
    const roleDefinition = ROLE_DEFINITIONS.find(r => r.role === role);
    return roleDefinition?.displayName || role;
  }

  /**
   * Get role hierarchy
   */
  getRoleHierarchy(role: UserRole): number {
    const roleDefinition = ROLE_DEFINITIONS.find(r => r.role === role);
    return roleDefinition?.hierarchy || 0;
  }

  /**
   * Check if role A can manage role B
   */
  canManageRole(adminRole: UserRole, targetRole: UserRole): boolean {
    const adminHierarchy = this.getRoleHierarchy(adminRole);
    const targetHierarchy = this.getRoleHierarchy(targetRole);
    
    // Super admin can manage all roles
    if (adminRole === 'super_admin') return true;
    
    // Admin can only manage roles below their hierarchy
    return adminHierarchy > targetHierarchy;
  }

  /**
   * Get available roles for assignment by admin
   */
  getAssignableRoles(adminRole: UserRole): UserRole[] {
    const adminHierarchy = this.getRoleHierarchy(adminRole);
    
    return ROLE_DEFINITIONS
      .filter(role => role.hierarchy < adminHierarchy || adminRole === 'super_admin')
      .map(role => role.role);
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Create factory function for AdminService
 */
export function createAdminService(supabase: SupabaseClient): AdminService {
  return new AdminService(supabase);
}

/**
 * Check if role has specific permission
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  const roleDefinition = ROLE_DEFINITIONS.find(r => r.role === role);
  return roleDefinition?.permissions.includes(permission) || false;
}

/**
 * Get all permissions for role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  const roleDefinition = ROLE_DEFINITIONS.find(r => r.role === role);
  return roleDefinition?.permissions || [];
}

export default AdminService;
