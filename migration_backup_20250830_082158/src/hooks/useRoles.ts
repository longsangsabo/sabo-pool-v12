import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface RoleData {
  roles: string[];
  primaryRole: string;
  isAdmin: boolean;
  isClubOwner: boolean;
  isModerator: boolean;
}

export const useRoles = () => {
  const { user } = useAuth();
  const [roleData, setRoleData] = useState<RoleData>({
    roles: [],
    primaryRole: 'user',
    isAdmin: false,
    isClubOwner: false,
    isModerator: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setRoleData({
          roles: [],
          primaryRole: 'user',
          isAdmin: false,
          isClubOwner: false,
          isModerator: false,
        });
        setIsLoading(false);
        return;
      }

      try {
        // Use the new role functions from database
        const { data: roles, error: rolesError } = await supabase
          .rpc('get_user_roles', { _user_id: user.id });

        const { data: primaryRole, error: primaryError } = await supabase
          .rpc('get_user_primary_role', { _user_id: user.id });

        if (rolesError || primaryError) {
          console.error('Error fetching roles:', rolesError || primaryError);
          // Fallback to old system if new system fails
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('user_id', user.id)
            .single();

          if (profileError) {
            console.error('Fallback role check failed:', profileError);
            setRoleData({
              roles: ['user'],
              primaryRole: 'user',
              isAdmin: false,
              isClubOwner: false,
              isModerator: false,
            });
          } else {
            setRoleData({
              roles: profile.is_admin ? ['admin'] : ['user'],
              primaryRole: profile.is_admin ? 'admin' : 'user',
              isAdmin: !!profile.is_admin,
              isClubOwner: false,
              isModerator: false,
            });
          }
        } else {
          const userRoles = roles || [];
          setRoleData({
            roles: userRoles,
            primaryRole: primaryRole || 'user',
            isAdmin: userRoles.includes('admin'),
            isClubOwner: userRoles.includes('club_owner'),
            isModerator: userRoles.includes('moderator'),
          });
        }
      } catch (error) {
        console.error('Error checking user roles:', error);
        setRoleData({
          roles: ['user'],
          primaryRole: 'user',
          isAdmin: false,
          isClubOwner: false,
          isModerator: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  // Utility function to check specific role
  const hasRole = (role: string): boolean => {
    return roleData.roles.includes(role);
  };

  // Utility function to check if user has any of the specified roles
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => roleData.roles.includes(role));
  };

  // Utility function to check if user has all specified roles
  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => roleData.roles.includes(role));
  };

  return {
    ...roleData,
    isLoading,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
};

// Specific hooks for common role checks
export const useAdminCheck = () => {
  const { isAdmin, isLoading } = useRoles();
  return { isAdmin, isLoading };
};

export const useClubOwnerCheck = () => {
  const { isClubOwner, isLoading } = useRoles();
  return { isClubOwner, isLoading };
};

export const useModeratorCheck = () => {
  const { isModerator, isLoading } = useRoles();
  return { isModerator, isLoading };
};

// Role-based redirect function
export const getRoleBasedRedirect = (primaryRole: string, intendedPath?: string): string => {
  // If user had an intended destination, respect it
  if (intendedPath && intendedPath !== '/auth/login' && intendedPath !== '/auth/register') {
    return intendedPath;
  }

  // Role-based default redirects
  switch (primaryRole) {
    case 'admin':
      return '/admin/dashboard';
    case 'moderator':
      return '/admin/dashboard'; // Moderators also go to admin area
    case 'club_owner':
      return '/club-management';
    case 'user':
    default:
      return '/dashboard';
  }
};
