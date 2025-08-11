import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Target, Flame, Clock, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Challenge } from '@/types/challenge';
import EnhancedChallengeCard, { EnhancedChallengeCardGrid } from '@/components/challenges/EnhancedChallengeCard';
import { cn } from '@/lib/utils';

interface EnhancedCommunityTabProps {
  keoData: Challenge[];
  liveData: Challenge[];
  sapToiData: Challenge[];
  xongData: Challenge[];
  currentUserId?: string;
  onJoinChallenge?: (challengeId: string) => void;
  isJoining?: boolean;
}

const EnhancedCommunityTab: React.FC<EnhancedCommunityTabProps> = ({
  keoData,
  liveData,
  sapToiData,
  xongData,
  currentUserId,
  onJoinChallenge,
  isJoining = false,
}) => {
  const [activeTab, setActiveTab] = useState('keo');

  const tabs = [
    {
      id: 'keo',
      title: 'Kèo',
      icon: Target,
      color: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      data: keoData,
      variant: 'open' as const,
      description: 'Thách đấu mở chờ đối thủ',
    },
    {
      id: 'live',
      title: 'Live',
      icon: Flame,
      color: 'text-red-500 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      data: liveData,
      variant: 'live' as const,
      description: 'Thách đấu đang diễn ra',
    },
    {
      id: 'sap',
      title: 'Sắp',
      icon: Clock,
      color: 'text-yellow-500 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      data: sapToiData,
      variant: 'upcoming' as const,
      description: 'Thách đấu sắp tới',
    },
    {
      id: 'xong',
      title: 'Xong',
      icon: Trophy,
      color: 'text-green-500 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      data: xongData,
      variant: 'completed' as const,
      description: 'Thách đấu đã hoàn thành',
    },
  ];

  const handleAction = (challengeId: string, action: string) => {
    switch (action) {
      case 'join':
        onJoinChallenge?.(challengeId);
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

  return (
    <div className="space-y-4">
      <Card className="border-border/50 dark:border-border/30 bg-card/50 dark:bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Enhanced Tab Navigation */}
            <div className="border-b border-border/50 dark:border-border/30 bg-muted/20 dark:bg-muted/10">
              <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-2 gap-1">
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

export { EnhancedCommunityTab };
export default EnhancedCommunityTab;
