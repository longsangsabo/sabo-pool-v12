import React from "react";
import { useState, useRef } from 'react';
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
  Settings,
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
