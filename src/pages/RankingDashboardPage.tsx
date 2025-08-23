import React from 'react';
import LeaderboardPage from '@/pages/LeaderboardPage';
import { SEOHead } from '@/components/SEOHead';

const RankingDashboardPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title='Hệ Thống Ranking ELO - SABO Pool Arena'
        description='Theo dõi và phân tích chi tiết thứ hạng ELO, lịch sử thay đổi ranking và thống kê hiệu suất thi đấu tại SABO Pool Arena'
        keywords='ELO ranking, bảng xếp hạng, thống kê billiards, SABO Pool Arena, phân tích ELO'
      />
      <LeaderboardPage />
    </>
  );
};

export default RankingDashboardPage;
