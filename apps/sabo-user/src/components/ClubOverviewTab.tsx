
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Star } from 'lucide-react';
import ClubDashboardOverview from '@/components/ClubDashboardOverview';
import ClubStatsDashboard from '@/components/ClubStatsDashboard';
import TrustScoreDisplay from '@/components/TrustScoreDisplay';
// Test components removed for production
import React, { useState, useEffect } from 'react';
import ClubTournamentManagement from './ClubTournamentManagement';
// Test component removed for production

const ClubOverviewTab = () => {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-foreground'>Tổng quan</h2>
        <p className='text-muted-foreground'>
          Dashboard tổng hợp và thống kê chi tiết của câu lạc bộ
        </p>
      </div>

      <Tabs defaultValue='dashboard' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='dashboard' className='flex items-center gap-2'>
            <BarChart3 className='w-4 h-4' />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value='trust' className='flex items-center gap-2'>
            <Star className='w-4 h-4' />
            Điểm tin cậy
          </TabsTrigger>
          <TabsTrigger value='statistics' className='flex items-center gap-2'>
            <TrendingUp className='w-4 h-4' />
            Thống kê chi tiết
          </TabsTrigger>
          {/* Test tab removed for production */}
        </TabsList>

        <TabsContent value='dashboard'>
          <ClubDashboardOverview />
        </TabsContent>

        <TabsContent value='trust'>
          <TrustScoreDisplay />
        </TabsContent>

        <TabsContent value='statistics'>
          <ClubStatsDashboard />
        </TabsContent>

        {/* Test content removed for production */}
      </Tabs>
    </div>
  );
};

export default ClubOverviewTab;
