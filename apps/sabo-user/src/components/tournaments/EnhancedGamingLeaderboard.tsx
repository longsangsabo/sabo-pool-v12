/**
 * Enhanced Gaming Leaderboard - Phase 4  
 * Mobile-first leaderboard with gaming aesthetics, animations, and theme integration
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@sabo/shared-ui';
import {
 Trophy,
 Medal,
 Crown,
 TrendingUp,
 TrendingDown,
 Minus,
 Star,
 Zap,
 Target,
 Award,
 ChevronUp,
 ChevronDown,
 Filter,
 Users,
 Calendar,
 Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Player {
 id: string;
 rank: number;
 previous_rank?: number;
 full_name: string;
 display_name?: string;
 avatar_url?: string;
 elo: number;
 previous_elo?: number;
 points: number;
 wins: number;
 losses: number;
 total_games: number;
 win_rate: number;
 current_rank?: string;
 verified_rank?: string;
 club_name?: string;
 last_active?: string;
 is_online?: boolean;
}

interface EnhancedGamingLeaderboardProps {
 players: Player[];
 title?: string;
 subtitle?: string;
 currentUserId?: string;
 showRankChange?: boolean;
 showStats?: boolean;
 variant?: 'default' | 'compact' | 'tournament';
 maxDisplayed?: number;
 className?: string;
}

export function EnhancedGamingLeaderboard({
 players,
 title = "🏆 Leaderboard",
 subtitle = "Top players ranked by performance",
 currentUserId,
 showRankChange = true,
 showStats = true,
 variant = 'default',
 maxDisplayed = 50,
 className
}: EnhancedGamingLeaderboardProps) {
 const [selectedFilter, setSelectedFilter] = useState<'all' | 'online' | 'friends'>('all');
 const [showExpanded, setShowExpanded] = useState(false);

 const getRankIcon = (rank: number) => {
  switch (rank) {
   case 1:
    return <Crown className="h-5 w-5 text-yellow-500" />;
   case 2:
    return <Medal className="h-5 w-5 text-gray-400" />;
   case 3:
    return <Award className="h-5 w-5 text-amber-600" />;
   default:
    return (
     <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
      <span className="text-xs font-bold text-muted-foreground">{rank}</span>
     </div>
    );
  }
 };

 const getRankChange = (player: Player) => {
  if (!player.previous_rank || !showRankChange) return null;
  
  const change = player.previous_rank - player.rank;
  
  if (change > 0) {
   return (
    <div className="flex items-center gap-1 text-success-600 dark:text-green-400">
     <ChevronUp className="h-3 w-3" />
     <span className="text-xs font-medium">+{change}</span>
    </div>
   );
  } else if (change < 0) {
   return (
    <div className="flex items-center gap-1 text-error-600 dark:text-red-400">
     <ChevronDown className="h-3 w-3" />
     <span className="text-xs font-medium">{change}</span>
    </div>
   );
  } else {
   return (
    <div className="flex items-center gap-1 text-muted-foreground">
     <Minus className="h-3 w-3" />
     <span className="text-xs">0</span>
    </div>
   );
  }
 };

 const getEloChange = (player: Player) => {
  if (!player.previous_elo) return null;
  
  const change = player.elo - player.previous_elo;
  
  if (change > 0) {
   return (
    <span className="text-xs text-success-600 dark:text-green-400 font-medium">
     +{change}
    </span>
   );
  } else if (change < 0) {
   return (
    <span className="text-xs text-error-600 dark:text-red-400 font-medium">
     {change}
    </span>
   );
  }
  return null;
 };

 const getRankBadge = (rank?: string) => {
  if (!rank) return null;
  
  const rankColors = {
   'Novice': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
   'Amateur': 'bg-primary-100 text-blue-800 dark:bg-blue-900 dark:text-primary-100',
   'Semi-Pro': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
   'Professional': 'bg-success-100 text-green-800 dark:bg-green-900 dark:text-success-100',
   'Master': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
   'Legend': 'bg-error-100 text-red-800 dark:bg-red-900 dark:text-error-100',
  };
  
  return (
   <Badge 
    variant="outline" 
    className={cn("text-xs", rankColors[rank as keyof typeof rankColors])}
   >
    {rank}
   </Badge>
  );
 };

 const displayedPlayers = showExpanded 
  ? players.slice(0, maxDisplayed)
  : players.slice(0, Math.min(10, maxDisplayed));

 const currentPlayerIndex = players.findIndex(p => p.id === currentUserId);
 const currentPlayer = currentPlayerIndex !== -1 ? players[currentPlayerIndex] : null;

 return (
  <Card className={cn("w-full", className)}>
   <CardHeader className="pb-4">
    <div className="flex items-center justify-between">
     <div className="space-y-1">
      <CardTitle className="flex items-center gap-2 text-lg">
       <Trophy className="h-5 w-5 text-yellow-500" />
       {title}
      </CardTitle>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
     </div>
     
     <div className="flex items-center gap-2">
      <Badge variant="outline" className="flex items-center gap-1">
       <Users className="h-3 w-3" />
       {players.length}
      </Badge>
      
      {/* Filter Button - Mobile optimized */}
      <Button variant="outline" size="icon" className="h-8 w-8">
       <Filter className="h-4 w-4" />
      </Button>
     </div>
    </div>
   </CardHeader>

   <CardContent className="space-y-2">
    {/* Current User Highlight */}
    {currentPlayer && currentPlayerIndex >= 10 && (
     <>
      <div className="space-y-2">
       <div className="text-xs text-muted-foreground font-medium">Your Position</div>
       <PlayerRow 
        player={currentPlayer} 
        isCurrentUser={true}
        showStats={showStats}
        showRankChange={showRankChange}
        variant={variant}
       />
      </div>
      <div className="border-t border-border my-4" />
     </>
    )}

    {/* Top Players */}
    <div className="space-y-2">
     {displayedPlayers.map((player, index) => (
      <PlayerRow
       key={player.id}
       player={player}
       isCurrentUser={player.id === currentUserId}
       showStats={showStats}
       showRankChange={showRankChange}
       variant={variant}
       isTopThree={index < 3}
      />
     ))}
    </div>

    {/* Load More Button */}
    {players.length > 10 && !showExpanded && (
     <div className="pt-4 border-t border-border">
      <Button 
       variant="outline" 
       onClick={() => setShowExpanded(true)}
       className="w-full h-10 gap-2"
      >
       <ChevronDown className="h-4 w-4" />
       Show More Players ({players.length - 10} remaining)
      </Button>
     </div>
    )}
   </CardContent>
  </Card>
 );
}

interface PlayerRowProps {
 player: Player;
 isCurrentUser: boolean;
 showStats: boolean;
 showRankChange: boolean;
 variant: 'default' | 'compact' | 'tournament';
 isTopThree?: boolean;
}

function PlayerRow({ 
 player, 
 isCurrentUser, 
 showStats, 
 showRankChange, 
 variant,
 isTopThree = false 
}: PlayerRowProps) {
 const getRankIcon = (rank: number) => {
  switch (rank) {
   case 1:
    return <Crown className="h-5 w-5 text-yellow-500" />;
   case 2:
    return <Medal className="h-5 w-5 text-gray-400" />;
   case 3:
    return <Award className="h-5 w-5 text-amber-600" />;
   default:
    return (
     <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
      <span className="text-sm font-bold text-muted-foreground">{rank}</span>
     </div>
    );
  }
 };

 const getRankChange = () => {
  if (!player.previous_rank || !showRankChange) return null;
  
  const change = player.previous_rank - player.rank;
  
  if (change > 0) {
   return (
    <div className="flex items-center gap-1 text-success-600 dark:text-green-400">
     <ChevronUp className="h-3 w-3" />
     <span className="text-xs font-medium">+{change}</span>
    </div>
   );
  } else if (change < 0) {
   return (
    <div className="flex items-center gap-1 text-error-600 dark:text-red-400">
     <ChevronDown className="h-3 w-3" />
     <span className="text-xs font-medium">{change}</span>
    </div>
   );
  }
  return null;
 };

 return (
  <div className={cn(
   "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-muted/50",
   isCurrentUser && "bg-primary/5 border border-primary/20",
   isTopThree && "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/10 dark:to-amber-950/10"
  )}>
   {/* Rank Icon */}
   <div className="flex-shrink-0">
    {getRankIcon(player.rank)}
   </div>

   {/* Player Info */}
   <div className="flex items-center gap-3 flex-1 min-w-0">
    <Avatar className="h-10 w-10 border-2 border-border">
     <AvatarImage src={player.avatar_url} alt={player.full_name} />
     <AvatarFallback>
      {player.display_name?.charAt(0) || player.full_name.charAt(0)}
     </AvatarFallback>
    </Avatar>
    
    <div className="flex-1 min-w-0">
     <div className="flex items-center gap-2">
      <span className="font-medium text-foreground truncate">
       {player.display_name || player.full_name}
      </span>
      {player.is_online && (
       <div className="h-2 w-2 rounded-full bg-success-500" />
      )}
      {isCurrentUser && (
       <Badge variant="outline" className="text-xs">
        You
       </Badge>
      )}
     </div>
     
     <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {player.club_name && (
       <span>{player.club_name}</span>
      )}
      {player.current_rank && (
       <Badge variant="outline" className="text-xs">
        {player.current_rank}
       </Badge>
      )}
     </div>
    </div>
   </div>

   {/* Stats */}
   <div className="flex items-center gap-4 text-sm">
    {/* ELO */}
    <div className="text-right">
     <div className="font-semibold text-foreground">{player.elo}</div>
     <div className="text-xs text-muted-foreground">ELO</div>
    </div>

    {/* Win Rate */}
    {showStats && (
     <div className="text-right">
      <div className="font-semibold text-foreground">{player.win_rate}%</div>
      <div className="text-xs text-muted-foreground">Win Rate</div>
     </div>
    )}

    {/* Rank Change */}
    {showRankChange && (
     <div className="flex-shrink-0">
      {getRankChange()}
     </div>
    )}
   </div>
  </div>
 );
}

export default EnhancedGamingLeaderboard;
