import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Trophy,
  Plus,
  CreditCard,
  Table,
  Network,
  GitBranch,
  Workflow,
  Award,
  Settings,
  Zap,
} from 'lucide-react';

// Import shared components
import { MobileSectionHeader } from '@/components/ui/mobile-section-header';
import { MobileCard } from '@/components/ui/mobile-card';

// Import components
import TournamentManagementHub from '@/components/tournament/TournamentManagementHub';
import { TournamentManagementHubRef } from '@/types/tournament-management';
import { EnhancedTournamentForm } from '@/components/tournament/EnhancedTournamentForm';
import TournamentPaymentManager from '@/components/TournamentPaymentManager';
import { SingleEliminationTemplate } from '@/components/tournament/templates/SingleEliminationTemplate';
import { DoubleEliminationTemplate } from '@/components/tournament/templates/DoubleEliminationTemplate';
import { TournamentSelector } from '@/components/shared/TournamentSelector';
import { TournamentBracket } from '@/components/tournament/TournamentBracket';

import { ManualResultsGenerator } from '@/components/tournament/ManualResultsGenerator';
import TournamentResults from '@/components/tournament/TournamentResults';
import { TournamentControlPanel } from '@/components/tournament/TournamentControlPanel';
import { TournamentMatchManager } from '@/components/tournament/TournamentMatchManager';

// Import contexts
import { TournamentProvider } from '@/contexts/TournamentContext';

import { ProfileProvider } from '@/contexts/ProfileContext';
import {
  TournamentStateProvider,
  useTournamentState,
} from '@/contexts/TournamentStateContext';
import { toast } from 'sonner';
import { createTestTournamentFlow } from '@/utils/tournamentTestFlow';

// Internal component that uses TournamentState
const ClubTournamentManagementInternal: React.FC = () => {
  console.log('🔧 ClubTournamentManagementInternal rendering...');
  const [managementActiveTab, setManagementActiveTab] = useState('create');

  const tournamentManagementRef = useRef<TournamentManagementHubRef>(null);
  const { selectedTournamentId, selectedTournament, refreshAll } =
    useTournamentState();

  const handleTournamentSuccess = (tournament: any) => {
    console.log('✅ Tournament created successfully:', tournament);
    toast.success('Giải đấu đã được tạo thành công!');

    // Always go to tournaments list after creation
    setTimeout(() => {
      tournamentManagementRef.current?.refreshTournaments();
      setManagementActiveTab('tournaments');
      if (tournament?.tournament_type === 'double_elimination') {
        toast.info(
          'Giải đấu đã được tạo! Vào "Quản lý Bảng đấu" để tạo bảng đấu loại kép'
        );
      }
    }, 500);
  };

  return (
    <div className='space-y-4'>
      {/* Mobile-optimized header using shared component */}
      <MobileSectionHeader
        title='Quản lý Giải đấu'
        subtitle='Tạo mới và quản lý các giải đấu CLB'
        icon={Trophy}
        iconColor='text-amber-500'
      />

      {/* Mobile-optimized tabs */}
      <Tabs
        value={managementActiveTab}
        onValueChange={setManagementActiveTab}
        className='space-y-4'
      >
        {/* Main tabs - improved mobile spacing */}
        <TabsList className='grid w-full grid-cols-2 h-10 bg-muted/50'>
          <TabsTrigger
            value='tournaments'
            className='text-sm h-8 px-3 font-medium'
          >
            <Trophy className='w-4 h-4 mr-1.5' />
            Danh sách
          </TabsTrigger>
          <TabsTrigger value='create' className='text-sm h-8 px-3 font-medium'>
            <Plus className='w-4 h-4 mr-1.5' />
            Tạo mới
          </TabsTrigger>
        </TabsList>

        {/* Secondary action buttons - improved mobile layout */}
        <div className='flex flex-wrap gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setManagementActiveTab('automation')}
            className={`text-sm h-8 px-3 ${managementActiveTab === 'automation' ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
          >
            <Zap className='w-4 h-4 mr-1.5' />
            Tự động hóa
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setManagementActiveTab('bracket-view')}
            className={`text-sm h-8 px-3 ${managementActiveTab === 'bracket-view' ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
          >
            <Workflow className='w-4 h-4 mr-1.5' />
            Bảng đấu
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setManagementActiveTab('results')}
            className={`text-sm h-8 px-3 ${managementActiveTab === 'results' ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
          >
            <Award className='w-4 h-4 mr-1.5' />
            Kết quả
          </Button>
        </div>

        <TabsContent value='create'>
          <ProfileProvider>
            <TournamentProvider>
              {(() => {
                console.log(
                  '🎯 About to render EnhancedTournamentForm inside providers'
                );
                return (
                  <EnhancedTournamentForm
                    onSuccess={handleTournamentSuccess}
                    onCancel={() => {
                      console.log('❌ Form canceled');
                    }}
                  />
                );
              })()}
            </TournamentProvider>
          </ProfileProvider>
        </TabsContent>

        <TabsContent value='tournaments'>
          <TournamentManagementHub ref={tournamentManagementRef} />
        </TabsContent>

        <TabsContent value='automation'>
          <div className='space-y-6'>
            {/* Tournament Selector */}
            <TournamentSelector />

            {/* Tournament Control Panel */}
            {selectedTournamentId && (
              <TournamentControlPanel
                tournamentId={selectedTournamentId}
                isClubOwner={true}
              />
            )}

            {/* Tournament Match Manager */}
            {selectedTournamentId && (
              <TournamentMatchManager
                tournamentId={selectedTournamentId}
                isClubOwner={true}
              />
            )}

            {!selectedTournamentId && (
              <MobileCard
                title='Chọn giải đấu để quản lý'
                icon={Zap}
                iconColor='text-amber-500'
                variant='outlined'
                className='border-dashed'
              >
                <div className='flex flex-col items-center justify-center py-6 text-center'>
                  <p className='text-sm text-muted-foreground max-w-sm'>
                    Vui lòng chọn một giải đấu từ danh sách để sử dụng các tính
                    năng tự động hóa
                  </p>
                </div>
              </MobileCard>
            )}
          </div>
        </TabsContent>

        <TabsContent value='bracket-view'>
          <div className='space-y-6'>
            {/* Tournament Selector */}
            <TournamentSelector />

            {/* Tournament Control Panel for selected tournament */}
            {selectedTournamentId && (
              <TournamentControlPanel
                tournamentId={selectedTournamentId}
                isClubOwner={true}
              />
            )}

            {/* Test Button for Development */}
            {process.env.NODE_ENV === 'development' && selectedTournamentId && (
              <Card className='border-dashed border-orange-200 bg-orange-50/50'>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='font-semibold text-orange-800'>
                        🧪 Development Test
                      </h3>
                      <p className='text-sm text-orange-600'>
                        Test complete tournament flow: scores → advancement →
                        completion
                      </p>
                    </div>
                    <Button
                      onClick={createTestTournamentFlow}
                      variant='outline'
                      className='border-orange-200 text-orange-700 hover:bg-orange-100'
                    >
                      🚀 Test Flow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Auto Bracket Display */}
            {selectedTournamentId ? (
              <TournamentBracket
                tournamentId={selectedTournamentId}
                adminMode={true}
              />
            ) : (
              <MobileCard
                title='Chọn giải đấu để xem bảng đấu'
                icon={Workflow}
                iconColor='text-blue-500'
                variant='outlined'
                className='border-dashed'
              >
                <div className='flex flex-col items-center justify-center py-6 text-center'>
                  <p className='text-sm text-muted-foreground max-w-sm'>
                    Vui lòng chọn một giải đấu từ danh sách để xem và quản lý
                    bảng đấu
                  </p>
                </div>
              </MobileCard>
            )}
          </div>
        </TabsContent>

        <TabsContent value='results'>
          <div className='space-y-6'>
            {/* Tournament Selector */}
            <TournamentSelector />

            {/* Manual Results Generator for Completed Tournaments */}
            {selectedTournamentId &&
              selectedTournament?.status === 'completed' && (
                <ManualResultsGenerator
                  tournamentId={selectedTournamentId}
                  tournamentName={selectedTournament.name}
                  onResultsGenerated={refreshAll}
                />
              )}

            {/* Tournament Results Display */}
            <TournamentResults tournamentId={selectedTournamentId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Main wrapper component with context
interface ClubTournamentManagementProps {
  clubId: string;
}

const ClubTournamentManagement: React.FC<ClubTournamentManagementProps> = ({
  clubId,
}) => {
  console.log('🔧 ClubTournamentManagement rendering with clubId:', clubId);

  try {
    return (
      <TournamentStateProvider clubId={clubId}>
        <ClubTournamentManagementInternal />
      </TournamentStateProvider>
    );
  } catch (error) {
    console.error('🚨 Error in ClubTournamentManagement:', error);
    return <div>Error loading tournament management: {String(error)}</div>;
  }
};

export default ClubTournamentManagement;
