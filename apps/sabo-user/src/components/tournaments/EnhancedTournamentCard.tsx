/**
 * Enhanced Tournament Card - Phase 4
 * Mobile-first tournament display with gaming aesthetics and theme integration
 */

import React from 'react';
import { Button } from '@sabo/shared-ui';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
 Trophy,
 Users,
 Calendar,
 MapPin,
 Coins,
 Crown,
 Timer,
 Target,
 GitBranch,
 Play,
 Eye,
 Clock,
 CheckCircle,
 AlertCircle,
 Sparkles,
 Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tournament {
 id: string;
 name: string;
 description?: string;
 tournament_type: 'single_elimination' | 'double_elimination' | 'round_robin';
 status: 'draft' | 'registration' | 'active' | 'completed' | 'cancelled';
 start_date: string;
 end_date?: string;
 registration_deadline: string;
 entry_fee: number;
 prize_pool: number;
 max_participants: number;
 current_participants: number;
 venue?: string;
 club_name?: string;
 club_logo?: string;
 banner_image?: string;
}

interface EnhancedTournamentCardProps {
 tournament: Tournament;
 onJoin?: () => void;
 onView?: () => void;
 onManage?: () => void;
 showActions?: boolean;
 variant?: 'default' | 'featured' | 'compact';
 className?: string;
}

export function EnhancedTournamentCard({
 tournament,
 onJoin,
 onView,
 onManage,
 showActions = true,
 variant = 'default',
 className
}: EnhancedTournamentCardProps) {
 
 const getStatusConfig = (status: Tournament['status']) => {
  switch (status) {
   case 'registration':
    return {
     color: 'bg-success-500',
     variant: 'default' as const,
     text: 'Open Registration',
     icon: <Users className="h-3 w-3" />
    };
   case 'active':
    return {
     color: 'bg-primary-500',
     variant: 'default' as const,
     text: 'Live Tournament',
     icon: <Play className="h-3 w-3" />
    };
   case 'completed':
    return {
     color: 'bg-purple-500',
     variant: 'secondary' as const,
     text: 'Completed',
     icon: <CheckCircle className="h-3 w-3" />
    };
   case 'draft':
    return {
     color: 'bg-neutral-background0',
     variant: 'outline' as const,
     text: 'Draft',
     icon: <Clock className="h-3 w-3" />
    };
   default:
    return {
     color: 'bg-error-500',
     variant: 'destructive' as const,
     text: 'Cancelled',
     icon: <AlertCircle className="h-3 w-3" />
    };
  }
 };

 const getTournamentTypeConfig = (type: Tournament['tournament_type']) => {
  switch (type) {
   case 'double_elimination':
    return {
     icon: <GitBranch className="h-4 w-4" />,
     name: 'SABO Double',
     color: 'text-primary-600 dark:text-blue-400',
     bgColor: 'bg-primary-50 dark:bg-blue-950/20'
    };
   case 'single_elimination':
    return {
     icon: <Target className="h-4 w-4" />,
     name: 'Single Elim',
     color: 'text-success-600 dark:text-green-400',
     bgColor: 'bg-success-50 dark:bg-green-950/20'
    };
   default:
    return {
     icon: <Trophy className="h-4 w-4" />,
     name: 'Round Robin',
     color: 'text-purple-600 dark:text-purple-400',
     bgColor: 'bg-purple-50 dark:bg-purple-950/20'
    };
  }
 };

 const statusConfig = getStatusConfig(tournament.status);
 const typeConfig = getTournamentTypeConfig(tournament.tournament_type);

 const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
   style: 'currency',
   currency: 'VND'
  }).format(amount);
 };

 const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
   day: '2-digit',
   month: '2-digit',
   year: 'numeric'
  });
 };

 const getProgressPercentage = () => {
  return Math.min((tournament.current_participants / tournament.max_participants) * 100, 100);
 };

 const isRegistrationOpen = tournament.status === 'registration';
 const isFull = tournament.current_participants >= tournament.max_participants;

 return (
  <Card className={cn(
  "overflow-hidden transition-all duration-200 hover:shadow-lg group",
   variant === 'featured' &&"border-primary/20 shadow-lg",
   variant === 'compact' &&"p-0",
   className
  )}>
   {/* Tournament Banner/Header */}
   <div className="relative">
    {tournament.banner_image ? (
     <div className="h-32 sm:h-40 overflow-hidden">
      <img 
       src={tournament.banner_image} 
       alt={tournament.name}
       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
     </div>
    ) : (
     <div className={cn(
     "h-24 sm:h-32 bg-gradient-to-r flex items-center justify-center",
      typeConfig.bgColor
     )}>
      <div className={cn("text-center", typeConfig.color)}>
       <Trophy className="h-8 w-8 mx-auto mb-2" />
       <div className="text-sm font-medium">{typeConfig.name} Tournament</div>
      </div>
     </div>
    )}
    
    {/* Status Badge */}
    <div className="absolute top-3 right-3">
     <Badge variant={statusConfig.variant} className="flex items-center gap-1">
      {statusConfig.icon}
      {statusConfig.text}
     </Badge>
    </div>

    {/* Tournament Type Badge */}
    <div className="absolute top-3 left-3">
     <Badge variant="outline" className={cn(
     "flex items-center gap-1 bg-background/80 backdrop-blur-sm",
      typeConfig.color
     )}>
      {typeConfig.icon}
      {typeConfig.name}
     </Badge>
    </div>
   </div>

   <CardHeader className="pb-3">
    <div className="flex items-start gap-3">
     {/* Club Logo */}
     {tournament.club_logo && (
      <Avatar className="h-10 w-10 border-2 border-border">
       <AvatarImage src={tournament.club_logo} alt={tournament.club_name} />
       <AvatarFallback>
        {tournament.club_name?.charAt(0) || 'T'}
       </AvatarFallback>
      </Avatar>
     )}
     
     <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-foreground text-base leading-tight mb-1">
       {tournament.name}
      </h3>
      {tournament.club_name && (
       <p className="text-sm text-muted-foreground">
        {tournament.club_name}
       </p>
      )}
      {tournament.description && variant !== 'compact' && (
       <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
        {tournament.description}
       </p>
      )}
     </div>

     {/* Prize Pool Highlight */}
     {tournament.prize_pool > 0 && (
      <div className="text-right flex-shrink-0">
       <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
        <Crown className="h-4 w-4" />
        <span className="text-sm font-semibold">
         {formatCurrency(tournament.prize_pool)}
        </span>
       </div>
       <div className="text-xs text-muted-foreground">Prize Pool</div>
      </div>
     )}
    </div>
   </CardHeader>

   <CardContent className="space-y-4">
    {/* Tournament Stats Grid */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
     {/* Participants */}
     <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <div>
       <div className="font-medium text-foreground">
        {tournament.current_participants}/{tournament.max_participants}
       </div>
       <div className="text-xs text-muted-foreground">Players</div>
      </div>
     </div>

     {/* Entry Fee */}
     <div className="flex items-center gap-2">
      <Coins className="h-4 w-4 text-muted-foreground" />
      <div>
       <div className="font-medium text-foreground">
        {tournament.entry_fee > 0 ? formatCurrency(tournament.entry_fee) : 'Free'}
       </div>
       <div className="text-xs text-muted-foreground">Entry</div>
      </div>
     </div>

     {/* Start Date */}
     <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <div>
       <div className="font-medium text-foreground">
        {formatDate(tournament.start_date)}
       </div>
       <div className="text-xs text-muted-foreground">Start</div>
      </div>
     </div>

     {/* Venue */}
     {tournament.venue && (
      <div className="flex items-center gap-2">
       <MapPin className="h-4 w-4 text-muted-foreground" />
       <div>
        <div className="font-medium text-foreground truncate">
         {tournament.venue}
        </div>
        <div className="text-xs text-muted-foreground">Venue</div>
       </div>
      </div>
     )}
    </div>

    {/* Registration Progress */}
    {isRegistrationOpen && (
     <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
       <span className="text-muted-foreground">Registration Progress</span>
       <span className="font-medium text-foreground">
        {Math.round(getProgressPercentage())}%
       </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
       <div 
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${getProgressPercentage()}%` }}
       />
      </div>
      {isFull && (
       <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>Tournament is full</span>
       </div>
      )}
     </div>
    )}

    {/* Action Buttons - Mobile optimized */}
    {showActions && (
     <div className="flex gap-2 pt-2">
      {isRegistrationOpen && !isFull && onJoin && (
       <Button 
        onClick={onJoin}
        className="flex-1 h-10 gap-2"
        variant="default"
       >
        <Trophy className="h-4 w-4" />
        Join Tournament
       </Button>
      )}
      
      {onView && (
       <Button 
        onClick={onView}
        variant="outline" 
        className="flex-1 h-10 gap-2"
       >
        <Eye className="h-4 w-4" />
        View Details
       </Button>
      )}
      
      {onManage && (
       <Button 
        onClick={onManage}
        variant="secondary"
        className="h-10 gap-2"
       >
        <Settings className="h-4 w-4" />
        Manage
       </Button>
      )}
     </div>
    )}
   </CardContent>
  </Card>
 );
}

export default EnhancedTournamentCard;
