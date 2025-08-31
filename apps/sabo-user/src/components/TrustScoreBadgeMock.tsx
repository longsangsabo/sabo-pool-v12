import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface TrustScoreBadgeProps {
 playerId: string;
 showFullDetails?: boolean;
}

const TrustScoreBadgeMock: React.FC<TrustScoreBadgeProps> = ({
 playerId,
 showFullDetails = false,
}) => {
 // Mock trust score
 const trustScore = 85;

 const getTrustColor = (score: number) => {
  if (score >= 80) return 'bg-success-100 text-success-800';
  if (score >= 60) return 'bg-warning-100 text-warning-800';
  return 'bg-error-100 text-error-800';
 };

 return (
  <Badge className={getTrustColor(trustScore)}>
   <Shield className='w-3 h-3 mr-1' />
   {trustScore}
   {showFullDetails && '/100'}
  </Badge>
 );
};

export default TrustScoreBadgeMock;
