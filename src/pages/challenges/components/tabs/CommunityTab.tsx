import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Flame, Clock, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Challenge } from '@/types/challenge';
import { OpenChallengeCard } from '@/components/challenges/OpenChallengeCard';
import LiveMatchCard from '@/components/challenges/LiveMatchCard';
import { CompletedChallengeCard } from '@/components/challenges/CompletedChallengeCard';
import UnifiedChallengeCard from '@/components/challenges/UnifiedChallengeCard';

interface CommunityTabProps {
  keoData: Challenge[];
  liveData: Challenge[];
  sapToiData: Challenge[];
  xongData: Challenge[];
  currentUserId?: string;
  onJoinChallenge: (challengeId: string) => Promise<void>;
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
  const [activeSection, setActiveSection] = React.useState<'keo' | 'live' | 'saptoi' | 'xong'>('keo');

  const sections = [
    {
      key: 'keo' as const,
      label: 'Kèo 🎯',
      icon: Target,
      count: keoData.length,
      data: keoData,
      color: 'bg-green-500',
      description: 'Thách đấu mở đang đợi đối thủ'
    },
    {
      key: 'live' as const,
      label: 'Live 🔥',
      icon: Flame,
      count: liveData.length,
      data: liveData,
      color: 'bg-red-500',
      description: 'Các trận đấu đang diễn ra'
    },
    {
      key: 'saptoi' as const,
      label: 'Sắp tới ⏰',
      icon: Clock,
      count: sapToiData.length,
      data: sapToiData,
      color: 'bg-blue-500',
      description: 'Trận đấu đã có cặp, sắp diễn ra'
    },
    {
      key: 'xong' as const,
      label: 'Xong 🏆',
      icon: Trophy,
      count: xongData.length,
      data: xongData,
      color: 'bg-purple-500',
      description: 'Các trận đấu đã hoàn thành'
    }
  ];

  const activeData = sections.find(s => s.key === activeSection)?.data || [];

  const renderChallengeCard = (challenge: Challenge) => {
    switch (activeSection) {
      case 'keo':
        return (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="mb-4"
          >
            <OpenChallengeCard
              challenge={challenge}
              onJoin={onJoinChallenge}
              currentUser={{ id: currentUserId }}
              isJoining={isJoining}
            />
          </motion.div>
        );

      case 'live':
        // Convert to live match format
        const liveMatch = {
          id: challenge.id,
          player1: {
            id: challenge.challenger_id || '',
            name: challenge.challenger_profile?.full_name || 'Player 1',
            avatar: challenge.challenger_profile?.avatar_url,
            rank: challenge.challenger_profile?.verified_rank || 'A',
          },
          player2: {
            id: challenge.opponent_id || '',
            name: challenge.opponent_profile?.full_name || 'Player 2',
            avatar: challenge.opponent_profile?.avatar_url,
            rank: challenge.opponent_profile?.verified_rank || 'A',
          },
          score: {
            player1: challenge.challenger_final_score || 0,
            player2: challenge.opponent_final_score || 0,
          },
          raceToTarget: challenge.race_to || 8,
          betPoints: challenge.bet_points || 100,
          startTime: challenge.scheduled_time || challenge.created_at,
          location: challenge.location || 'CLB SABO',
        };

        return (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="mb-4"
          >
            <LiveMatchCard
              match={liveMatch}
              onWatch={(matchId) => {
                console.log('Watching match:', matchId);
              }}
            />
          </motion.div>
        );

      case 'saptoi':
      case 'xong':
        return (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="mb-4"
          >
            {activeSection === 'xong' ? (
              <CompletedChallengeCard
                challenge={challenge}
                onView={() => {
                  console.log('Viewing challenge:', challenge.id);
                }}
              />
            ) : (
              <UnifiedChallengeCard
                challenge={challenge}
                variant="match"
                currentUserId={currentUserId}
                onAction={(challengeId, action) => {
                  console.log('Challenge action:', action, challengeId);
                }}
              />
            )}
          </motion.div>
        );

      default:
        return null;
    }
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
        {section.key === 'keo' && 'Chưa có kèo nào! 🎱'}
        {section.key === 'live' && 'Không có trận nào đang đấu! ⚡'}
        {section.key === 'saptoi' && 'Chưa có trận sắp tới! ⏰'}
        {section.key === 'xong' && 'Chưa có trận nào hoàn thành! 🏆'}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {section.description}
      </p>
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

export default CommunityTab;
