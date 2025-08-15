import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, Clock, Trophy, Target, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Challenge } from '@/types/challenge';
import EnhancedChallengeCard, { EnhancedChallengeCardGrid } from '@/components/challenges/EnhancedChallengeCard';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

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
  const [activeTab, setActiveTab] = useState('completed'); // Default to completed to show existing challenge
  const [clubChallenges, setClubChallenges] = useState<Challenge[]>(challenges);
  const [loading, setLoading] = useState(false);

  // Fetch challenges for this club if not provided via props
  useEffect(() => {
    if (challenges.length === 0 && clubId) {
      fetchClubChallenges();
    } else {
      setClubChallenges(challenges);
    }
  }, [clubId, challenges]);

  const fetchClubChallenges = async () => {
    if (!clubId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('club_id', clubId);

      if (error) {
        return;
      }

      setClubChallenges((data as unknown as Challenge[]) || []);
      
    } catch (error) {
      // Silent error
    } finally {
      setLoading(false);
    }
  };

  // Filter challenges by status
  const activeChalllenges = clubChallenges.filter(c => c.status === 'ongoing');
  const upcomingChallenges = clubChallenges.filter(c => c.status === 'pending');
  const completedChallenges = clubChallenges.filter(c => c.status === 'completed');
  const pendingApprovals = clubChallenges.filter(c => 
    c.status === 'accepted' && 
    c.challenger_score != null && 
    c.opponent_score != null
  );

  const tabs = [
    {
      id: 'pending',
      title: 'Chờ phê duyệt',
      icon: Shield,
      color: 'text-purple-500 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      data: pendingApprovals,
      variant: 'live' as const, // Use existing variant
      description: 'Kết quả cần phê duyệt',
    },
    {
      id: 'active',
      title: 'Đang diễn ra',
      icon: Target,
      color: 'text-red-500 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      data: activeChalllenges,
      variant: 'live' as const,
      description: 'Thách đấu đang diễn ra',
    },
    {
      id: 'upcoming',
      title: 'Sắp tới',
      icon: Clock,
      color: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      data: upcomingChallenges,
      variant: 'upcoming' as const,
      description: 'Thách đấu sắp diễn ra',
    },
    {
      id: 'completed',
      title: 'Hoàn thành',
      icon: Trophy,
      color: 'text-green-500 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
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
          <h3 className="text-lg font-semibold text-foreground dark:text-foreground/95 mb-2">
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
        className="space-y-4"
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
              <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
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
          <EnhancedChallengeCardGrid 
            challenges={tab.data} 
            variant={tab.variant}
            onAction={handleAction}
            onCardClick={handleCardClick}
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
            />
          ))}
        </div>
      </motion.div>
    );
  };

  if (!clubId) {
    return (
      <Card className="border-border/50 dark:border-border/30">
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Chưa có thông tin club</h3>
          <p className="text-muted-foreground">Vui lòng chọn club để xem thách đấu</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
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
                          'text-sm font-medium transition-colors',
                          isActive 
                            ? 'text-foreground dark:text-foreground/95' 
                            : 'text-muted-foreground dark:text-muted-foreground/70'
                        )}>
                          {tab.title}
                        </div>
                        <Badge 
                          variant={isActive ? "default" : "secondary"}
                          className={cn(
                            'text-xs mt-1',
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
            <div className="p-6">
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
