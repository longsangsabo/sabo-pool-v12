import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Challenge } from '@/types/challenge';
import EnhancedChallengeCard, { EnhancedChallengeCardGrid } from '@/components/challenges/EnhancedChallengeCard';
import { cn } from '@/lib/utils';

interface EnhancedMyTabProps {
  doiDoiThuData: Challenge[];
  sapToiData: Challenge[];
  hoanThanhData: Challenge[];
  currentUserId?: string;
  onCancelChallenge?: (challengeId: string) => void;
  isCanceling?: boolean;
  activeSubTab?: string;
  onSubTabChange?: (tabId: string) => void;
}

const EnhancedMyTab: React.FC<EnhancedMyTabProps> = ({
  doiDoiThuData,
  sapToiData,
  hoanThanhData,
  currentUserId,
  onCancelChallenge,
  isCanceling = false,
  activeSubTab = 'doi-doi-thu',
  onSubTabChange,
}) => {
  const [localActiveTab, setLocalActiveTab] = useState('doi-doi-thu');
  
  // Use controlled or uncontrolled mode
  const currentActiveTab = activeSubTab || localActiveTab;
  const handleTabChange = (tabId: string) => {
    if (onSubTabChange) {
      onSubTabChange(tabId);
    } else {
      setLocalActiveTab(tabId);
    }
  };

  const tabs = [
    {
      id: 'doi-doi-thu',
      title: 'Đợi đối thủ',
      icon: Users,
      color: 'text-orange-500 dark:text-orange-400',
      bgColor: 'bg-warning-50 dark:bg-orange-950/30',
      data: doiDoiThuData,
      variant: 'open' as const,
      description: 'Thách đấu của bạn đang chờ đối thủ',
    },
    {
      id: 'sap-toi',
      title: 'Sắp tới',
      icon: Clock,
      color: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-primary-50 dark:bg-blue-950/30',
      data: sapToiData,
      variant: 'upcoming' as const,
      description: 'Thách đấu sắp diễn ra',
    },
    {
      id: 'hoan-thanh',
      title: 'Hoàn thành',
      icon: CheckCircle,
      color: 'text-green-500 dark:text-green-400',
      bgColor: 'bg-success-50 dark:bg-green-950/30',
      data: hoanThanhData,
      variant: 'completed' as const,
      description: 'Thách đấu đã hoàn thành',
    },
  ];

  const handleAction = (challengeId: string, action: string) => {
    switch (action) {
      case 'cancel':
        onCancelChallenge?.(challengeId);
        break;
      case 'score':
        console.log('Enter score for challenge:', challengeId);
        break;
      case 'view':
        console.log('View challenge details:', challengeId);
        break;
      case 'edit':
        console.log('Edit challenge:', challengeId);
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
          <h3 className="text-body-large font-semibold text-foreground dark:text-foreground/95 mb-2">
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
        {/* Desktop Grid */}
        <div className="hidden md:block">
          <EnhancedChallengeCardGrid 
            challenges={tab.data} 
            variant={tab.variant}
            onAction={handleAction}
            onCardClick={handleCardClick}
            currentUserId={currentUserId}
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
            />
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/30 dark:border-border/20 bg-white/10 dark:bg-black/20 backdrop-blur-md">
        <CardContent className="p-0">
          <Tabs value={currentActiveTab} onValueChange={handleTabChange} className="w-full">
            {/* Enhanced Tab Navigation - Compact 2-row layout */}
            <div className="border-b border-border/30 dark:border-border/20 bg-white/5 dark:bg-black/10 backdrop-blur-sm">
              <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-2 gap-1">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = currentActiveTab === tab.id;
                  
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 relative',
                        'data-[state=active]:bg-white/20 data-[state=active]:shadow-sm backdrop-blur-sm',
                        'data-[state=active]:border data-[state=active]:border-border/30',
                        'hover:bg-white/10 dark:hover:bg-black/20',
                        isActive && 'dark:bg-black/30 dark:border-border/30'
                      )}
                    >
                      <div className="relative">
                        <div className={cn(
                          'p-2 rounded-lg transition-colors',
                          isActive ? tab.bgColor : 'bg-muted/30 dark:bg-muted/20'
                        )}>
                          <IconComponent className={cn(
                            'w-4 h-4 transition-colors',
                            isActive ? tab.color : 'text-muted-foreground dark:text-muted-foreground/70'
                          )} />
                        </div>
                        {/* Badge on top of icon */}
                        {tab.data.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-error-500 text-white text-caption rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px] shadow-lg animate-pulse">
                            {tab.data.length}
                          </span>
                        )}
                      </div>
                      <div className={cn(
                        'text-caption font-medium transition-colors text-center',
                        isActive 
                          ? 'text-foreground dark:text-foreground/95' 
                          : 'text-muted-foreground dark:text-muted-foreground/70'
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

export { EnhancedMyTab };
export default EnhancedMyTab;
