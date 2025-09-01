
import { useQuery } from '@tanstack/react-query';
// Removed supabase import - migrated to services
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification } from "../services/notificationService";
import { uploadFile, getPublicUrl } from "../services/storageService";
import { TrustScoreCompact } from '@/components/ui/trust-score-badge';

interface TrustScoreBadgeProps {
 userId?: string;
 playerId?: string;
 size?: 'sm' | 'md' | 'lg';
 showFullDetails?: boolean;
}

const TrustScoreBadge = ({
 userId,
 playerId,
 size = 'md',
 showFullDetails,
}: TrustScoreBadgeProps) => {
 const targetId = userId || playerId;

 const { data: trustScore } = useQuery({
  queryKey: ['trust-score', targetId],
  queryFn: async () => {
   if (!targetId) return 85; // Default fallback

   // TODO: Replace with service call - const { data } = await supabase
    .from('player_trust_scores')
    .select('trust_percentage')
    .eq('user_id', targetId)
    .single();

   return data?.trust_percentage || 85;
  },
  enabled: !!targetId,
 });

 return (
  <TrustScoreCompact
   score={trustScore || 85}
   className={size === 'sm' ? 'scale-90' : undefined}
  />
 );
};

export default TrustScoreBadge;
