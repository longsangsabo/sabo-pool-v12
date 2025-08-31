import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MobileCardProps {
 title?: string;
 icon?: LucideIcon;
 iconColor?: string;
 headerAction?: React.ReactNode;
 className?: string;
 children: React.ReactNode;
 compact?: boolean;
 variant?: 'default' | 'outlined' | 'elevated';
}

export const MobileCard: React.FC<MobileCardProps> = ({
 title,
 icon: Icon,
 iconColor = 'text-primary',
 headerAction,
 className,
 children,
 compact = false,
 variant = 'default',
}) => {
 const cardVariants = {
  default: 'border bg-card',
  outlined: 'border-2 bg-card/50',
  elevated: 'border bg-card shadow-md',
 };

 const headerPadding = compact ? 'pb-2' : 'pb-3';
 const contentPadding = compact ? 'pt-0' : 'pt-0';

 return (
  <Card className={cn(cardVariants[variant], className)}>
   {title && (
    <CardHeader className={headerPadding}>
     <div className='flex items-center justify-between'>
      <CardTitle className='text-body-small font-semibold flex items-center gap-2'>
       {Icon && <Icon className={cn('w-4 h-4', iconColor)} />}
       {title}
      </CardTitle>
      {headerAction}
     </div>
    </CardHeader>
   )}
   <CardContent className={contentPadding}>{children}</CardContent>
  </Card>
 );
};

export default MobileCard;
