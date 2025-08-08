// DEPRECATED: useClubRole (root) is kept temporarily for backward compatibility.
// Use `useClubOwnership` instead for clearer naming & consolidated logic.
export { useClubOwnership as useClubRole } from './useClubOwnership';

// Also export the new V2 hook for advanced usage
export { useClubOwnershipV2 } from './useClubOwnershipV2';
