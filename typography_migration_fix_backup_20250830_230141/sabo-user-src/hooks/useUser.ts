import { useAuth } from '@/hooks/useAuth';

// Compatibility shim: some new code expects useUser; map to useAuth
export const useUser = () => {
  const { user, session, loading, profile } = useAuth();
  return { user, session, loading, profile };
};

export default useUser;
