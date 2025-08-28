
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Trophy, Archive, Activity, Settings } from 'lucide-react';
import { SPAAnalyticsDashboard } from '@/components/analytics/SPAAnalyticsDashboard';
import { RealtimeSPAFeed } from '@/components/spa/RealtimeSPAFeed';
import { AdminSPAManager } from '@/components/admin/AdminSPAManager';
import { EnhancedSPALeaderboard } from '@/components/spa/EnhancedSPALeaderboard';
import { LegacySPADashboard } from '@/components/legacy/LegacySPADashboard';
import { useAdminCheck } from '@/hooks/useAdminCheck';

export default function SPADashboardPage() {
  const { isAdmin } = useAdminCheck();

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='text-center mb-8'>
        <h1 className='text-4xl font-bold text-foreground mb-2'>
          SPA Dashboard
        </h1>
        <p className='text-muted-foreground'>
          Hệ thống phân tích và quản lý SPA Points nâng cao
        </p>
      </div>

      <Tabs defaultValue='analytics' className='w-full'>
        <TabsList
          className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}
        >
          <TabsTrigger value='analytics' className='flex items-center gap-2'>
            <BarChart3 className='h-4 w-4' />
            Phân tích
          </TabsTrigger>
          <TabsTrigger value='leaderboard' className='flex items-center gap-2'>
            <Trophy className='h-4 w-4' />
            Xếp hạng
          </TabsTrigger>
          <TabsTrigger value='legacy' className='flex items-center gap-2'>
            <Archive className='h-4 w-4' />
            Legacy
          </TabsTrigger>
          <TabsTrigger value='realtime' className='flex items-center gap-2'>
            <Activity className='h-4 w-4' />
            Real-time
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value='admin' className='flex items-center gap-2'>
              <Settings className='h-4 w-4' />
              Quản lý
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value='analytics' className='space-y-6'>
          <SPAAnalyticsDashboard />
        </TabsContent>

        <TabsContent value='leaderboard' className='space-y-6'>
          <EnhancedSPALeaderboard />
        </TabsContent>

        <TabsContent value='legacy' className='space-y-6'>
          <LegacySPADashboard />
        </TabsContent>

        <TabsContent value='realtime' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-1'>
              <RealtimeSPAFeed />
            </div>
            <div className='lg:col-span-2'>
              {/* Additional real-time components can go here */}
              <div className='text-center py-12 text-muted-foreground'>
                <p>Thêm components real-time khác tại đây</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value='admin' className='space-y-6'>
            <AdminSPAManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
