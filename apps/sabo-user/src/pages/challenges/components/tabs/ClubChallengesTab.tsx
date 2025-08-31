import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, Clock, Trophy, Target, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Challenge } from '@/types/challenge';
import EnhancedChallengeCard, { EnhancedChallengeCardGrid } from '@/components/challenges/EnhancedChallengeCard';
import ClubApprovalCard from '@/components/challenges/ClubApprovalCard';
import { useClubAdminCheck } from '@/hooks/useClubAdminCheck';
// Removed supabase import - migrated to services
import { getUserProfile } from "../services/profileService";
import { getTournament } from "../services/tournamentService";
import { getWalletBalance } from "../services/walletService";
import { cn } from '@/lib/utils';

interface ClubChallengesTabProps {
 clubId: string;
 challenges?: Challenge[];
 onAction?: (challengeId: string, action: string) => void;
}

const ClubChallengesTab: React.FC<ClubChallengesTabProps> = ({
 clubId,
 challenges = [],
 onAction,
}) => {
 const [activeTab, setActiveTab] = useState('pending'); // Default to pending approvals
 const [clubChallenges, setClubChallenges] = useState<Challenge[]>([]);
 const [loading, setLoading] = useState(true);
 
 // Check if current user is club admin
 const { isClubAdmin } = useClubAdminCheck({ challengeClubId: clubId });

 // Fetch challenges for this club with full user profile data
 useEffect(() => {
  const fetchClubChallenges = async () => {
   try {
//     let query = supabase
     .from('challenges')
     .select(`
      *,
      challenger_profile:profiles!challenges_challenger_id_fkey(
       id,
       user_id,
       full_name,
       avatar_url,
       current_rank,
       elo_rating,
       spa_points
      ),
      opponent_profile:profiles!challenges_opponent_id_fkey(
       id,
       user_id,
       full_name,
       avatar_url,
       current_rank,
       elo_rating,
       spa_points
      )
     `)
     .order('created_at', { ascending: false });

    // If clubId is provided, filter by club, otherwise get all challenges
    if (clubId) {
     query = query.eq('club_id', clubId);
    }

    const { data, error } = await query;

    if (error) {
     console.error('Error fetching club challenges:', error);
     return;
    }

    console.log('Fetched challenges:', data?.length || 0, 'for clubId:', clubId);
    setClubChallenges(data as any[] || []);
   } catch (error) {
    console.error('Error fetching club challenges:', error);
   } finally {
    setLoading(false);
   }
  };

  fetchClubChallenges();
 }, [clubId]);

 // Use fetched data if available, otherwise use prop data
 const displayChallenges = clubChallenges.length > 0 ? clubChallenges : challenges;

 // Filter challenges by status
 const activeChalllenges = displayChallenges.filter(c => c.status === 'ongoing');
 const upcomingChallenges = displayChallenges.filter(c => c.status === 'pending' || c.status === 'accepted');
 const completedChallenges = displayChallenges.filter(c => c.status === 'completed');
 // New filter for challenges needing approval: pending_approval status (scores confirmed, waiting club approval)
 const pendingApprovals = displayChallenges.filter(c => 
  c.status === 'pending_approval'
 );

 const tabs = [
  {
   id: 'pending',
   title: 'Chờ phê duyệt',
   icon: Shield,
   color: 'text-purple-500 dark:text-purple-400',
   bgColor: 'bg-info-50 dark:bg-purple-950/30',
   data: pendingApprovals,
   variant: 'live' as const, // Use existing variant
   description: 'Kết quả cần phê duyệt',
  },
  {
   id: 'active',
   title: 'Đang diễn ra',
   icon: Target,
   color: 'text-red-500 dark:text-red-400',
   bgColor: 'bg-error-50 dark:bg-red-950/30',
   data: activeChalllenges,
   variant: 'live' as const,
   description: 'Thách đấu đang diễn ra',
  },
  {
   id: 'upcoming',
   title: 'Sắp tới',
   icon: Clock,
   color: 'text-blue-500 dark:text-blue-400',
   bgColor: 'bg-primary-50 dark:bg-blue-950/30',
   data: upcomingChallenges,
   variant: 'upcoming' as const,
   description: 'Thách đấu sắp diễn ra',
  },
  {
   id: 'completed',
   title: 'Hoàn thành',
   icon: Trophy,
   color: 'text-green-500 dark:text-green-400',
   bgColor: 'bg-success-50 dark:bg-green-950/30',
   data: completedChallenges,
   variant: 'completed' as const,
   description: 'Thách đấu đã hoàn thành',
  },
 ];

 const handleAction = (challengeId: string, action: string) => {
  onAction?.(challengeId, action);
 };

 const handleCardClick = (challengeId: string) => {
  console.log('Club challenge card clicked:', challengeId);
 };

 const renderTabContent = (tab: typeof tabs[0]) => {
  const IconComponent = tab.icon;
  
  if (tab.data.length === 0) {
   return (
    <motion.div
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     exit={{ opacity: 0, y: -20 }}
     transition={{ duration: 0.3 }}
     className="text-center py-12"
    >
     <div className={cn('w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center', tab.bgColor)}>
      <IconComponent className={cn('w-8 h-8', tab.color)} />
     </div>
     <h3 className="text-body-large-semibold text-foreground dark:text-foreground/95 mb-2">
      Chưa có thách đấu
     </h3>
     <p className="text-muted-foreground dark:text-muted-foreground/80">
      {tab.description}
     </p>
    </motion.div>
   );
  }

  return (
   <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="form-spacing"
   >
    {/* Stats Header */}
    <div className="flex items-center justify-between p-4 bg-muted/30 dark:bg-muted/20 rounded-lg border border-border/50 dark:border-border/30">
     <div className="flex items-center gap-3">
      <div className={cn('p-2 rounded-lg', tab.bgColor)}>
       <IconComponent className={cn('w-5 h-5', tab.color)} />
      </div>
      <div>
       <h3 className="font-semibold text-foreground dark:text-foreground/95">
        {tab.title}
       </h3>
       <p className="text-body-small text-muted-foreground dark:text-muted-foreground/80">
        {tab.description}
       </p>
      </div>
     </div>
     <Badge variant="secondary" className="bg-background/50 dark:bg-card/50">
      {tab.data.length}
     </Badge>
    </div>

    {/* Desktop Grid */}
    <div className="hidden md:block">
     {tab.id === 'pending' && isClubAdmin ? (
      // Show ClubApprovalCards in grid for pending approvals
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
       {tab.data.map((challenge) => {
        if (challenge.challenger_profile && challenge.opponent_profile) {
         return (
          <ClubApprovalCard
           key={challenge.id}
           challenge={challenge}
           challengerProfile={{
            id: challenge.challenger_profile.id,
            display_name: challenge.challenger_profile.full_name || 'Unknown',
            spa_rank: challenge.challenger_profile.current_rank,
            spa_points: challenge.challenger_profile.spa_points
           }}
           opponentProfile={{
            id: challenge.opponent_profile.id,
            display_name: challenge.opponent_profile.full_name || 'Unknown',
            spa_rank: challenge.opponent_profile.current_rank,
            spa_points: challenge.opponent_profile.spa_points
           }}
           isClubAdmin={isClubAdmin}
          />
         );
        }
        return null;
       })}
      </div>
     ) : (
      // Show regular EnhancedChallengeCardGrid for other tabs
      <EnhancedChallengeCardGrid 
       challenges={tab.data} 
       variant={tab.variant}
       onAction={handleAction}
       onCardClick={handleCardClick}
      />
     )}
    </div>

    {/* Mobile List */}
    <div className="md:hidden space-y-3">
     {tab.data.map((challenge) => {
      // For pending approvals, show ClubApprovalCard if user is club admin
      if (tab.id === 'pending' && isClubAdmin && challenge.challenger_profile && challenge.opponent_profile) {
       return (
        <ClubApprovalCard
         key={challenge.id}
         challenge={challenge}
         challengerProfile={{
          id: challenge.challenger_profile.id,
          display_name: challenge.challenger_profile.full_name || 'Unknown',
          spa_rank: challenge.challenger_profile.current_rank,
          spa_points: challenge.challenger_profile.spa_points
         }}
         opponentProfile={{
          id: challenge.opponent_profile.id,
          display_name: challenge.opponent_profile.full_name || 'Unknown',
          spa_rank: challenge.opponent_profile.current_rank,
          spa_points: challenge.opponent_profile.spa_points
         }}
         isClubAdmin={isClubAdmin}
        />
       );
      }
      
      // Otherwise show regular EnhancedChallengeCard
      return (
       <EnhancedChallengeCard
        key={challenge.id}
        challenge={challenge}
        variant={tab.variant}
        
        onAction={handleAction}
        onCardClick={handleCardClick}
       />
      );
     })}
    </div>
   </motion.div>
  );
 };

 if (!clubId) {
  return (
   <Card className="border-border/50 dark:border-border/30">
    <CardContent className="p-8 text-center">
     <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
     <h3 className="text-body-large-semibold mb-2">Chưa có thông tin club</h3>
     <p className="text-muted-foreground">Vui lòng chọn club để xem thách đấu</p>
    </CardContent>
   </Card>
  );
 }

 if (loading) {
  return (
   <Card className="border-border/50 dark:border-border/30">
    <CardContent className="p-8 text-center">
     <div className="animate-pulse">
      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-body-large-semibold mb-2">Đang tải...</h3>
      <p className="text-muted-foreground">Vui lòng chờ trong giây lát</p>
     </div>
    </CardContent>
   </Card>
  );
 }

 return (
  <div className="form-spacing">
   <Card className="border-border/50 dark:border-border/30 bg-card/50 dark:bg-card/80 backdrop-blur-sm">
    <CardContent className="p-0">
     <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Enhanced Tab Navigation */}
      <div className="border-b border-border/50 dark:border-border/30 bg-muted/20 dark:bg-muted/10">
       <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-2 gap-1">
        {tabs.map((tab) => {
         const IconComponent = tab.icon;
         const isActive = activeTab === tab.id;
         
         return (
          <TabsTrigger
           key={tab.id}
           value={tab.id}
           className={cn(
            'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200',
            'data-[state=active]:bg-background data-[state=active]:shadow-sm',
            'data-[state=active]:border data-[state=active]:border-border/50',
            'hover:bg-background/50 dark:hover:bg-background/30',
            isActive && 'dark:bg-background/80 dark:border-border/40'
           )}
          >
           <div className={cn(
            'p-2 rounded-lg transition-colors',
            isActive ? tab.bgColor : 'bg-muted/30 dark:bg-muted/20'
           )}>
            <IconComponent className={cn(
             'w-4 h-4 transition-colors',
             isActive ? tab.color : 'text-muted-foreground dark:text-muted-foreground/70'
            )} />
           </div>
           <div className="text-center">
            <div className={cn(
             'text-body-small-medium transition-colors',
             isActive 
              ? 'text-foreground dark:text-foreground/95' 
              : 'text-muted-foreground dark:text-muted-foreground/70'
            )}>
             {tab.title}
            </div>
            <Badge 
             variant={isActive ? "default" : "secondary"}
             className={cn(
              'text-caption mt-1',
              isActive 
               ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90' 
               : 'bg-muted dark:bg-muted/50'
             )}
            >
             {tab.data.length}
            </Badge>
           </div>
          </TabsTrigger>
         );
        })}
       </TabsList>
      </div>

      {/* Tab Content */}
      <div className="card-spacing">
       <AnimatePresence mode="wait">
        {tabs.map((tab) => (
         <TabsContent key={tab.id} value={tab.id} className="mt-0">
          {renderTabContent(tab)}
         </TabsContent>
        ))}
       </AnimatePresence>
      </div>
     </Tabs>
    </CardContent>
   </Card>
  </div>
 );
};

export { ClubChallengesTab };
export default ClubChallengesTab;
