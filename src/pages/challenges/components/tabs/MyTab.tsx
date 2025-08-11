import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Users, Target, Flame, Clock, Trophy, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Challenge } from '@/types/challenge';
import EnhancedChallengeCard, { EnhancedChallengeCardGrid } from '@/components/challenges/EnhancedChallengeCard';

interface MyTabProps {
  doiDoiThuData: Challenge[];
  sapToiData: Challenge[];
  hoanThanhData: Challenge[];
  currentUserId?: string;
  onCancelChallenge?: (challengeId: string) => void;
  isCanceling?: boolean;
}

const MyTab: React.FC<MyTabProps> = ({
  doiDoiThuData,
  sapToiData,
  hoanThanhData,
  currentUserId,
  onCancelChallenge,
  isCanceling = false,
}) => {
  const sections = [
    {
      id: 'doi-doi-thu',
      title: 'Đợi Đối Thủ',
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      data: doiDoiThuData,
      variant: 'open' as const,
    },
    {
      id: 'sap-toi',
      title: 'Sắp Tới',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      data: sapToiData,
      variant: 'upcoming' as const,
    },
    {
      id: 'hoan-thanh',
      title: 'Hoàn Thành',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      data: hoanThanhData,
      variant: 'completed' as const,
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
                <h3 className="text-lg font-semibold">{section.title}</h3>
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
              <h3 className="text-lg font-semibold">{section.title}</h3>
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

export { MyTab };
export default MyTab;
