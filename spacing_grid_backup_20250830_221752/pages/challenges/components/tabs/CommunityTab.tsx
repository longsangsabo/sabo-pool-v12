import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Flame, Clock, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Challenge } from '@/types/challenge';
import EnhancedChallengeCard, { EnhancedChallengeCardGrid } from '@/components/challenges/EnhancedChallengeCard';

interface CommunityTabProps {
  keoData: Challenge[];
  liveData: Challenge[];
  sapToiData: Challenge[];
  xongData: Challenge[];
  currentUserId?: string;
  onJoinChallenge?: (challengeId: string) => void;
  isJoining?: boolean;
}

const CommunityTab: React.FC<CommunityTabProps> = ({
  keoData,
  liveData,
  sapToiData,
  xongData,
  currentUserId,
  onJoinChallenge,
  isJoining = false,
}) => {
  const sections = [
    {
      id: 'keo',
      title: 'Kèo Mở',
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-primary-50',
      data: keoData,
      variant: 'open' as const,
    },
    {
      id: 'live',
      title: 'Đang Live',
      icon: Flame,
      color: 'text-red-500',
      bgColor: 'bg-error-50',
      data: liveData,
      variant: 'live' as const,
    },
    {
      id: 'sap-toi',
      title: 'Sắp Tới',
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-warning-50',
      data: sapToiData,
      variant: 'upcoming' as const,
    },
    {
      id: 'xong',
      title: 'Hoàn Thành',
      icon: Trophy,
      color: 'text-green-500',
      bgColor: 'bg-success-50',
      data: xongData,
      variant: 'completed' as const,
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

  const renderSection = (section: typeof sections[0]) => {
    const IconComponent = section.icon;
    
    if (section.data.length === 0) {
      return (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${section.bgColor}`}>
                <IconComponent className={`w-5 h-5 ${section.color}`} />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-body-large-semibold">{section.title}</h3>
                <Badge variant="secondary">0</Badge>
              </div>
            </div>
            
            <div className="text-center py-8 text-muted-foreground">
              <IconComponent className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có thách đấu nào trong mục này</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${section.bgColor}`}>
              <IconComponent className={`w-5 h-5 ${section.color}`} />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-body-large-semibold">{section.title}</h3>
              <Badge variant="secondary">{section.data.length}</Badge>
            </div>
          </div>

          <div className="hidden md:block">
            <EnhancedChallengeCardGrid 
              challenges={section.data} 
              variant={section.variant}
              onAction={handleAction}
              onCardClick={handleCardClick}
            />
          </div>

          <div className="md:hidden">
            <div className="space-y-3">
              {section.data.map((challenge) => (
                <EnhancedChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  variant={section.variant}
                  size="compact"
                  onAction={handleAction}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection(section)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export { CommunityTab };
export default CommunityTab;
