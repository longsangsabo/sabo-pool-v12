/**
 * Admin Helper Utilities
 * Common utilities for admin functionality
 */

export const adminHelpers = {
  isAdmin: (user: any) => {
    return user?.role === 'admin' || user?.admin === true;
  },
  
  hasPermission: (user: any, permission: string) => {
    return user?.permissions?.includes(permission) || false;
  },
  
  formatAdminRoute: (path: string) => {
    return `/admin${path.startsWith('/') ? path : '/' + path}`;
  }
};

export async function checkUserAdminStatus(userId: string): Promise<boolean> {
  try {
    // Implementation for checking admin status
    // This should be replaced with actual admin check logic
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export function isUserAdmin(user: any): boolean {
  return user?.role === 'admin' || user?.is_admin === true;
}
