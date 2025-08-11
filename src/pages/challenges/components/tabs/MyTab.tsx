import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Challenge } from '@/types/challenge';
import UnifiedChallengeCard from '@/components/challenges/UnifiedChallengeCard';
import { CompletedChallengeCard } from '@/components/challenges/CompletedChallengeCard';

interface MyTabProps {
  doiDoiThuData: Challenge[];
  sapToiData: Challenge[];
  hoanThanhData: Challenge[];
  currentUserId?: string;
  onCancelChallenge?: (challengeId: string) => Promise<void>;
}

const MyTab: React.FC<MyTabProps> = ({
  doiDoiThuData,
  sapToiData,
  hoanThanhData,
  currentUserId,
  onCancelChallenge,
}) => {
  const [activeSection, setActiveSection] = React.useState<'doidoithu' | 'saptoi' | 'hoanthanh'>('doidoithu');

  const sections = [
    {
      key: 'doidoithu' as const,
      label: 'Đợi đối thủ 🎯',
      icon: Clock,
      count: doiDoiThuData.length,
      data: doiDoiThuData,
      color: 'bg-yellow-500',
      description: 'Thách đấu của bạn đang đợi người tham gia'
    },
    {
      key: 'saptoi' as const,
      label: 'Sắp tới ⏰',
      icon: Users,
      count: sapToiData.length,
      data: sapToiData,
      color: 'bg-blue-500',
      description: 'Thách đấu của bạn đã có đối thủ, đợi thời gian diễn ra'
    },
    {
      key: 'hoanthanh' as const,
      label: 'Hoàn thành ✅',
      icon: CheckCircle,
      count: hoanThanhData.length,
      data: hoanThanhData,
      color: 'bg-green-500',
      description: 'Thách đấu đã hoàn thành của bạn'
    }
  ];

  const activeData = sections.find(s => s.key === activeSection)?.data || [];

  const renderChallengeCard = (challenge: Challenge) => {
    if (activeSection === 'hoanthanh') {
      return (
        <motion.div
          key={challenge.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="mb-4"
        >
          <CompletedChallengeCard
            challenge={challenge}
            onView={() => {
              console.log('Viewing completed challenge:', challenge.id);
            }}
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        key={challenge.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className="mb-4"
      >
        <UnifiedChallengeCard
          challenge={challenge}
          variant={activeSection === 'saptoi' ? 'match' : 'default'}
          currentUserId={currentUserId}
          onAction={async (challengeId, action) => {
            switch (action) {
              case 'cancel':
                if (onCancelChallenge) {
                  await onCancelChallenge(challengeId);
                }
                break;
              default:
                console.log('Challenge action:', action, challengeId);
            }
          }}
        />
      </motion.div>
    );
  };

  const EmptyState = ({ section }: { section: typeof sections[0] }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="relative mb-6">
        <motion.div
          animate={{
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className={`w-24 h-24 ${section.color}/20 rounded-full flex items-center justify-center`}
        >
          <section.icon className={`w-12 h-12 text-foreground`} />
        </motion.div>
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2">
        {section.key === 'doidoithu' && 'Chưa có kèo đang đợi! 🎱'}
        {section.key === 'saptoi' && 'Chưa có trận sắp tới! ⏰'}
        {section.key === 'hoanthanh' && 'Chưa có trận hoàn thành! 🏆'}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {section.description}
      </p>

      {section.key === 'doidoithu' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-card/50 to-accent/10 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Mẹo:</strong> Tạo thách đấu mở để mời nhiều người chơi cùng tham gia!
          </p>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {/* Section Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg overflow-x-auto">
        {sections.map((section) => (
          <motion.button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all relative ${
              activeSection === section.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <section.icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{section.label}</span>
            {section.count > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  activeSection === section.key
                    ? 'bg-primary-foreground text-primary'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {section.count}
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeData.length === 0 ? (
            <EmptyState section={sections.find(s => s.key === activeSection)!} />
          ) : (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {activeData.map(renderChallengeCard)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyTab;
