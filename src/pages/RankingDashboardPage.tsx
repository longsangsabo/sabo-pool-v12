import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ELORankingDashboard from '@/components/ranking/ELORankingDashboard';
import { SEOHead } from '@/components/SEOHead';
import PageLayout from '@/components/layout/PageLayout';
import { useTheme } from '@/hooks/useTheme';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';

const RankingDashboardPage: React.FC = () => {
  const { theme } = useTheme();
  const { isMobile } = useOptimizedResponsive();

  return (
    <>
      {/* Full Screen Background Overlay - Mobile Ranking Dashboard */}
      {theme === 'dark' && isMobile && (
        <div 
          className='fixed inset-0 w-full h-full z-0'
          style={{
            backgroundImage: 'url(https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/logo//billiards-background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        />
      )}
      
      <SEOHead
        title='Hệ Thống Ranking ELO - SABO Pool Arena'
        description='Theo dõi và phân tích chi tiết thứ hạng ELO, lịch sử thay đổi ranking và thống kê hiệu suất thi đấu tại SABO Pool Arena'
        keywords='ELO ranking, bảng xếp hạng, thống kê billiards, SABO Pool Arena, phân tích ELO'
      />
      <Navigation />

      <PageLayout variant='dashboard' className={theme === 'dark' && isMobile ? 'relative z-10 bg-transparent' : ''}>
        <div className={`${isMobile ? 'pt-0 -mt-20' : 'pt-20'}`}>
          <ELORankingDashboard />
        </div>
      </PageLayout>

      <Footer />
    </>
  );
};

export default RankingDashboardPage;
