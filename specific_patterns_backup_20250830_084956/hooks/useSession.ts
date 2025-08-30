// Lightweight compatibility hook wrapping useAuth to provide a session-centric API
// Some components import useSession expecting { session }. This re-exports the same
// state already managed inside useAuth to avoid duplication.
import { useAuth } from './useAuth';

export const useSession = () => {
  const { session, user, loading, isAuthenticated, profile } = useAuth();
  return { session, user, loading, isAuthenticated, profile };
};

export default useSession;
