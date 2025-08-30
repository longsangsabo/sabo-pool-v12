/**
 * Club Role Utilities
 * Helper functions for club role management and permissions
 */

export type ClubRole =
  | 'owner'
  | 'moderator'
  | 'member'
  | 'guest'
  | undefined
  | null;

export const clubRoleUtils = {
  isOwner: (role: ClubRole) => role === 'owner',
  isModerator: (role: ClubRole) => role === 'moderator',
  isStaff: (role: ClubRole) => role === 'owner' || role === 'moderator',
  canManageMembers: (role: ClubRole) =>
    role === 'owner' || role === 'moderator',
  canPromote: (currentUserRole: ClubRole, targetRole: ClubRole) => {
    if (!currentUserRole) return false;
    if (targetRole === 'owner') return false; // cannot manage owner
    return currentUserRole === 'owner';
  },
  canDemote: (currentUserRole: ClubRole, targetRole: ClubRole) => {
    if (!currentUserRole) return false;
    if (targetRole === 'owner') return false;
    if (targetRole === 'member') return false; // nothing to demote
    return currentUserRole === 'owner';
  },
  canRemove: (currentUserRole: ClubRole, targetRole: ClubRole) => {
    if (!currentUserRole) return false;
    if (targetRole === 'owner') return false;
    return currentUserRole === 'owner' || currentUserRole === 'moderator';
  },
};

export default clubRoleUtils;
