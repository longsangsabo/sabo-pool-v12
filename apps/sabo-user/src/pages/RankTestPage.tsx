
import React from 'react';
import CardAvatar from '../components/ui/card-avatar';
import DarkCardAvatar from '../components/ui/dark-card-avatar';
import RankColorReference from '../components/RankColorReference';
import { 
  PageLayout,
  Section,
  GridLayout,
  BrandedHeading
} from '@sabo/shared-ui';

const RankTestPage = () => {
  const testRanks = [
    'K', 'K+', 'J', 'J+', 'I', 'I+', 'H', 'H+', 'G', 'G+', 'F', 'F+', 'E', 'E+',
  ];

  return (
    <PageLayout variant="default" padding="md">
      <BrandedHeading variant="sabo" size="xl" className="font-orbitron">
        🎱 Test Hệ Thống Rank Mới
      </BrandedHeading>

      {/* Bảng màu tham chiếu */}
      <RankColorReference />

      {/* Test Light Mode Cards */}
      <Section variant="light" spacing="md">
        <BrandedHeading variant="section" size="md" className="font-orbitron text-gray-800">
          Light Mode - Card Avatar
        </BrandedHeading>
        <GridLayout columns="auto" gap="md" maxWidth="xl">
          {testRanks.slice(0, 6).map(rank => (
            <CardAvatar
              key={`light-${rank}`}
              nickname={`PLAYER_${rank}`}
              rank={rank}
              elo={1200 + Math.floor(Math.random() * 800)}
              spa={200 + Math.floor(Math.random() * 100)}
              ranking={Math.floor(Math.random() * 500) + 1}
              matches={Math.floor(Math.random() * 100) + 10}
              userAvatar='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
            />
          ))}
        </GridLayout>
      </Section>

      {/* Test Dark Mode Cards */}
      <Section variant="dark" spacing="lg">
        <BrandedHeading variant="section" size="md" className="font-orbitron text-gray-100">
          Dark Mode - Card Avatar
        </BrandedHeading>
        <GridLayout columns="auto" gap="md" maxWidth="xl">
          {testRanks.slice(6, 12).map(rank => (
            <DarkCardAvatar
              key={`dark-${rank}`}
              nickname={`PLAYER_${rank}`}
              rank={rank}
              elo={1200 + Math.floor(Math.random() * 800)}
              spa={200 + Math.floor(Math.random() * 100)}
              ranking={Math.floor(Math.random() * 500) + 1}
              matches={Math.floor(Math.random() * 100) + 10}
              userAvatar='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
            />
          ))}
        </GridLayout>
      </Section>

      {/* All Ranks Preview */}
      <Section variant="light" spacing="md">
        <BrandedHeading variant="section" size="md" className="font-orbitron text-gray-800">
          Tất Cả Các Hạng
        </BrandedHeading>
        <GridLayout columns={6} gap="sm" maxWidth="lg">
          {testRanks.map(rank => (
            <CardAvatar
              key={`all-${rank}`}
              nickname={`${rank}_RANK`}
              rank={rank}
              elo={1200}
              spa={250}
              ranking={100}
              matches={20}
            />
          ))}
        </GridLayout>
      </Section>
    </PageLayout>
  );
};

export default RankTestPage;
