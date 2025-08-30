import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook để navigate đến trang Social Profile của user
 * @returns function để navigate đến social profile
 */
export const useSocialProfile = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  /**
   * Navigate đến social profile của user
   * @param userId - ID của user cần xem profile
   * @param userName - Tên của user (optional, để logging)
   */
  const navigateToSocialProfile = (userId: string, userName?: string) => {
    if (!userId) {
      console.warn('useSocialProfile: userId is required');
      return;
    }

    // Check if user is trying to view their own profile
    if (currentUser?.id === userId) {
      // Navigate to full profile page for own profile
      navigate('/profile');
      return;
    }

    // Navigate to social profile for other users
    navigate(`/players/${userId}`);
    
    if (userName) {
      console.log(`Navigating to social profile: ${userName} (${userId})`);
    }
  };

  /**
   * Generate URL for social profile
   * @param userId - ID của user
   * @returns URL string
   */
  const getSocialProfileUrl = (userId: string): string => {
    if (!userId) return '/';
    
    if (currentUser?.id === userId) {
      return '/profile';
    }
    
    return `/players/${userId}`;
  };

  return {
    navigateToSocialProfile,
    getSocialProfileUrl,
  };
};

export default useSocialProfile;
