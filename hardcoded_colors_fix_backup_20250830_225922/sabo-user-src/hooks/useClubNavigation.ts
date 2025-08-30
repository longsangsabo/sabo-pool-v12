import { useNavigate } from 'react-router-dom';
import { useClubOwnership } from '@/hooks/useClubOwnership';

export const useClubNavigation = () => {
  const navigate = useNavigate();
  const { isClubOwner, clubProfile } = useClubOwnership();

  const navigateToClubManagement = () => {
    if (isClubOwner && clubProfile) {
      navigate('/club-management');
    } else {
      navigate('/club-registration');
    }
  };

  const navigateToClubDashboard = (clubId?: string) => {
    if (clubId) {
      navigate(`/clubs/${clubId}/owner`);
    } else if (clubProfile) {
      navigate(`/clubs/${clubProfile.id}/owner`);
    } else {
      navigate('/club-management');
    }
  };

  return {
    navigateToClubManagement,
    navigateToClubDashboard,
    isClubOwner,
    clubProfile,
  };
};
