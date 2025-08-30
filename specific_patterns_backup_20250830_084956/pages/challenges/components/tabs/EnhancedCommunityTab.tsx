import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Flame, Clock, Trophy, Filter, Calendar, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Challenge } from '@/types/challenge';
import EnhancedChallengeCard, { EnhancedChallengeCardGrid } from '@/components/challenges/EnhancedChallengeCard';
import JoinChallengeConfirmDialog from '@/components/modals/JoinChallengeConfirmDialog';
import { cn } from '@/lib/utils';

interface EnhancedCommunityTabProps {
  keoData: Challenge[];
  liveData: Challenge[];
  sapToiData: Challenge[];
  xongData: Challenge[];
  currentUserId?: string;
  currentUserProfile?: {
    verified_rank?: string;
    current_rank?: string;
    rank?: string;
  } | null;
  onJoinChallenge?: (challengeId: string) => void;
  onCancelChallenge?: (challengeId: string) => void;
  isJoining?: boolean;
}

const EnhancedCommunityTab: React.FC<EnhancedCommunityTabProps> = ({
  keoData,
  liveData,
  sapToiData,
  xongData,
  currentUserId,
  currentUserProfile,
  onJoinChallenge,
  onCancelChallenge,
  isJoining = false,
}) => {
  const [activeTab, setActiveTab] = useState('keo');
  const [sortBy, setSortBy] = useState<'time' | 'rank' | 'amount'>('time');
  const [filterRank, setFilterRank] = useState<'all' | 'K' | 'I' | 'H' | 'G' | 'F' | 'E'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all');
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    challenge: Challenge | null;
  }>({ open: false, challenge: null });

  // Helper function to get rank from points/elo (SABO Pool Arena System)
  const getRankFromPoints = (points?: number) => {
    if (!points) return 'K';
    if (points >= 2100) return 'E';
    if (points >= 2000) return 'E';
    if (points >= 1900) return 'F';
    if (points >= 1800) return 'F';
    if (points >= 1700) return 'G';
    if (points >= 1600) return 'G';
    if (points >= 1500) return 'H';
    if (points >= 1400) return 'H';
    if (points >= 1300) return 'I';
    if (points >= 1200) return 'I';
    if (points >= 1100) return 'K';
    return 'K';
  };

  // Helper function to filter by time
  const filterByTime = (challenges: Challenge[]) => {
    if (timeFilter === 'all') return challenges;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return challenges.filter(challenge => {
      const challengeDate = new Date(challenge.scheduled_time || challenge.created_at);
      
      switch (timeFilter) {
        case 'today':
          return challengeDate >= today && challengeDate < tomorrow;
        case 'tomorrow':
          return challengeDate >= tomorrow && challengeDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
        case 'week':
          return challengeDate >= today && challengeDate < nextWeek;
        default:
          return true;
      }
    });
  };

  // Helper function to filter by rank
  const filterByRank = (challenges: Challenge[]) => {
    if (filterRank === 'all') return challenges;
    
    return challenges.filter(challenge => {
      const challengerRank = getRankFromPoints(challenge.challenger_profile?.elo || challenge.challenger_profile?.spa_points);
      return challengerRank === filterRank;
    });
  };

  // Helper function to sort challenges
  const sortChallenges = (challenges: Challenge[]) => {
    return [...challenges].sort((a, b) => {
      switch (sortBy) {
        case 'time':
          const timeA = new Date(a.scheduled_time || a.created_at).getTime();
          const timeB = new Date(b.scheduled_time || b.created_at).getTime();
          return timeA - timeB; // Earliest first
        case 'rank':
          const rankA = a.challenger_profile?.elo || a.challenger_profile?.spa_points || 0;
          const rankB = b.challenger_profile?.elo || b.challenger_profile?.spa_points || 0;
          return rankB - rankA; // Highest rank first
        case 'amount':
          const amountA = a.bet_points || a.stake_amount || 0;
          const amountB = b.bet_points || b.stake_amount || 0;
          return amountB - amountA; // Highest amount first
        default:
          return 0;
      }
    });
  };

  const tabs = [
    {
      id: 'keo',
      title: 'Kèo',
      icon: Target,
      color: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-transparent',
      data: keoData,
      variant: 'open' as const,
      description: 'Thách đấu mở chờ đối thủ',
    },
    {
      id: 'live',
      title: 'Live',
      icon: Flame,
      color: 'text-red-500 dark:text-red-400',
      bgColor: 'bg-transparent',
      data: liveData,
      variant: 'live' as const,
      description: 'Thách đấu đang diễn ra',
    },
    {
      id: 'sap',
      title: 'Sắp',
      icon: Clock,
      color: 'text-yellow-500 dark:text-yellow-400',
      bgColor: 'bg-transparent',
      data: sapToiData,
      variant: 'upcoming' as const,
      description: 'Thách đấu sắp tới',
    },
    {
      id: 'xong',
      title: 'Xong',
      icon: Trophy,
      color: 'text-green-500 dark:text-green-400',
      bgColor: 'bg-transparent',
      data: xongData,
      variant: 'completed' as const,
      description: 'Thách đấu đã hoàn thành',
    },
  ];

  // Process data with filters and sorting
  const processedTabs = useMemo(() => {
    return tabs.map(tab => ({
      ...tab,
      data: sortChallenges(filterByRank(filterByTime(tab.data)))
    }));
  }, [keoData, liveData, sapToiData, xongData, sortBy, filterRank, timeFilter]);

  const handleAction = (challengeId: string, action: string) => {
    switch (action) {
      case 'join':
        // Show confirmation dialog before joining
        const challengeToJoin = [...keoData, ...liveData, ...sapToiData, ...xongData]
          .find(c => c.id === challengeId);
        if (challengeToJoin) {
          setConfirmDialog({ open: true, challenge: challengeToJoin });
        }
        break;
      case 'cancel':
        onCancelChallenge?.(challengeId);
        break;
      case 'watch':
        console.log('Watch challenge:', challengeId);
        break;
      case 'view':
        console.log('View challenge:', challengeId);
        break;
      case 'score':
        console.log('Enter score for challenge:', challengeId);
        break;
      default:
        console.log('Unknown action:', action, 'for challenge:', challengeId);
        break;
    }
  };

  const handleConfirmJoin = () => {
    if (confirmDialog.challenge) {
      onJoinChallenge?.(confirmDialog.challenge.id);
      setConfirmDialog({ open: false, challenge: null });
    }
  };

  const handleCardClick = (challengeId: string) => {
    console.log('Card clicked:', challengeId);
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
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-gray-100 mb-2">
            Chưa có thách đấu
          </h3>
          <p className="text-neutral-600 dark:text-gray-300">
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
        className="space-y-4"
      >
        {/* Desktop Grid */}
        <div className="hidden md:block">
          <EnhancedChallengeCardGrid 
            challenges={tab.data} 
            variant={tab.variant}
            onAction={handleAction}
            onCardClick={handleCardClick}
            currentUserId={currentUserId}
            currentUserProfile={currentUserProfile}
          />
        </div>

        {/* Mobile List */}
        <div className="md:hidden space-y-3">
          {tab.data.map((challenge) => (
            <EnhancedChallengeCard
              key={challenge.id}
              challenge={challenge}
              variant={tab.variant}
              size="compact"
              onAction={handleAction}
              onCardClick={handleCardClick}
              currentUserId={currentUserId}
              currentUserProfile={currentUserProfile}
            />
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/30 dark:border-border/20 bg-transparent backdrop-blur-md">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Enhanced Tab Navigation - Compact 2-row layout */}
            <div className="border-b border-border/30 dark:border-border/20 bg-transparent backdrop-blur-sm">
              {/* Filter Controls */}
              <div className="flex items-center gap-2 p-3 border-b border-border/20 dark:border-border/10">
                <Filter className="w-4 h-4 text-neutral-600 dark:text-gray-300" />
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32 h-8 text-xs bg-transparent border-border/30 text-gray-300 dark:text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Time
                      </div>
                    </SelectItem>
                    <SelectItem value="rank">
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3" />
                        Hạng
                      </div>
                    </SelectItem>
                    <SelectItem value="amount">Điểm cược</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
                  <SelectTrigger className="w-28 h-8 text-xs bg-transparent border-border/30 text-gray-300 dark:text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="today">Hôm nay</SelectItem>
                    <SelectItem value="tomorrow">Ngày mai</SelectItem>
                    <SelectItem value="week">Tuần này</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterRank} onValueChange={(value: any) => setFilterRank(value)}>
                  <SelectTrigger className="w-28 h-8 text-xs bg-transparent border-border/30 text-gray-300 dark:text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Mọi hạng</SelectItem>
                    <SelectItem value="K">🔰 K hạng (1000-1199)</SelectItem>
                    <SelectItem value="I">🟦 I hạng (1200-1399)</SelectItem>
                    <SelectItem value="H">🟩 H hạng (1400-1599)</SelectItem>
                    <SelectItem value="G">🟨 G hạng (1600-1799)</SelectItem>
                    <SelectItem value="F">🟧 F hạng (1800-1999)</SelectItem>
                    <SelectItem value="E">� E hạng (2000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-2 gap-1">
                {processedTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 relative',
                        'data-[state=active]:bg-white/10 data-[state=active]:shadow-sm backdrop-blur-sm',
                        'data-[state=active]:border data-[state=active]:border-border/30',
                        'hover:bg-white/5 dark:hover:bg-white/5',
                        isActive && 'dark:bg-white/10 dark:border-border/30'
                      )}
                    >
                      <div className="relative">
                        <div className={cn(
                          'p-2 rounded-lg transition-colors',
                          isActive ? tab.bgColor : 'bg-transparent'
                        )}>
                          <IconComponent className={cn(
                            'w-4 h-4 transition-colors',
                            isActive ? tab.color : 'text-neutral-700 dark:text-gray-200'
                          )} />
                        </div>
                        {/* Badge on top of icon */}
                        {tab.data.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px] shadow-lg animate-pulse">
                            {tab.data.length}
                          </span>
                        )}
                      </div>
                      <div className={cn(
                        'text-xs font-medium transition-colors text-center',
                        isActive 
                          ? 'text-neutral-800 dark:text-gray-100' 
                          : 'text-neutral-600 dark:text-gray-300'
                      )}>
                        {tab.title}
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {processedTabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="mt-0">
                    {renderTabContent(tab)}
                  </TabsContent>
                ))}
              </AnimatePresence>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Join Challenge Confirmation Dialog */}
      <JoinChallengeConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open, challenge: null })}
        challenge={confirmDialog.challenge}
        onConfirm={handleConfirmJoin}
        loading={isJoining}
      />
    </div>
  );
};

export { EnhancedCommunityTab };
export default EnhancedCommunityTab;
