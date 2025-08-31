import React from 'react';
import { Eye, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MobileLiveIndicatorProps {
 type: 'live_match' | 'live_tournament' | 'live_challenge';
 viewers?: number;
 status: string;
 className?: string;
}

export const MobileLiveIndicator: React.FC<MobileLiveIndicatorProps> = ({
 type,
 viewers,
 status,
 className = '',
}) => {
 const getIndicatorColor = () => {
  switch (type) {
   case 'live_match':
    return 'bg-error-500 text-var(--color-background)';
   case 'live_tournament':
    return 'bg-info-500 text-var(--color-background)';
   case 'live_challenge':
    return 'bg-warning-500 text-var(--color-background)';
   default:
    return 'bg-error-500 text-var(--color-background)';
  }
 };

 return (
  <div className={`mobile-live-indicator ${className}`}>
   <Badge className={`${getIndicatorColor()} animate-pulse`}>
    <div className='live-dot'></div>
    <span className='font-semibold text-caption uppercase tracking-wide'>
     {status}
    </span>
   </Badge>

   {viewers && (
    <div className='flex items-center gap-1 ml-2 text-caption text-muted-foreground'>
     <Eye className='w-3 h-3' />
     <span>{viewers.toLocaleString()}</span>
    </div>
   )}
  </div>
 );
};

export default MobileLiveIndicator;
