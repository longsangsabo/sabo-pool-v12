/**
 * Tournament Management List Component
 * Extracted from TournamentManagementHub.tsx for better maintainability
 * Phase 1 - Step 1.5 of refactoring process
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Calendar,
  Users,
  Settings,
  Eye,
  Target,
  Star,
  Plus,
} from 'lucide-react';
import type {
  Tournament,
  TournamentListProps,
  TournamentFilter,
} from '@/types/tournament-management';
import { TOURNAMENT_STATUSES, TOURNAMENT_TYPES } from '@/types/tournament-management';

export const TournamentManagementList: React.FC<TournamentListProps> = ({
  tournaments,
  loading,
  activeFilter,
  onFilterChange,
  onTournamentSelect,
  onGenerateBracket,
  onEditTournament,
  onDeleteTournament,
}) => {
  // Filter tournaments based on active filter
  const filteredTournaments = tournaments.filter(tournament => {
    switch (activeFilter) {
      case 'active':
        return ['registration_open', 'ongoing'].includes(tournament.status);
      case 'upcoming':
        return tournament.status === 'registration_closed';
      case 'completed':
        return tournament.status === 'completed';
      case 'all':
      default:
        return true;
    }
  });

  // Get tournament status info
  const getTournamentStatus = (status: string) => {
    const statusInfo = TOURNAMENT_STATUSES[status as keyof typeof TOURNAMENT_STATUSES];
    return statusInfo || { label: status, variant: 'outline' as const, color: 'gray' };
  };

  // Get tournament type label
  const getTournamentTypeLabel = (type: string) => {
    return TOURNAMENT_TYPES[type as keyof typeof TOURNAMENT_TYPES] || type;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-foreground'>Quản lý Giải đấu</h2>
            <p className='text-muted-foreground'>Tạo và quản lý các giải đấu do CLB tổ chức</p>
          </div>
        </div>

        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          <span className='ml-2'>Đang tải giải đấu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-foreground'>Quản lý Giải đấu</h2>
          <p className='text-muted-foreground'>
            Tạo và quản lý các giải đấu do CLB tổ chức
          </p>
        </div>
        <Button onClick={() => window.open('/tournaments', '_blank')}>
          <Plus className='w-4 h-4 mr-2' />
          Tạo giải đấu mới
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={(value) => onFilterChange(value as TournamentFilter)}>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='active'>Đang hoạt động</TabsTrigger>
          <TabsTrigger value='upcoming'>Sắp diễn ra</TabsTrigger>
          <TabsTrigger value='completed'>Đã kết thúc</TabsTrigger>
          <TabsTrigger value='all'>Tất cả</TabsTrigger>
        </TabsList>

        {/* Tournament List Content */}
        <TabsContent value={activeFilter} className='space-y-4'>
          {filteredTournaments.length === 0 ? (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <Trophy className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold mb-2'>Chưa có giải đấu</h3>
                <p className='text-muted-foreground text-center mb-4'>
                  {activeFilter === 'active' && 'Không có giải đấu nào đang hoạt động'}
                  {activeFilter === 'upcoming' && 'Không có giải đấu nào sắp diễn ra'}
                  {activeFilter === 'completed' && 'Không có giải đấu nào đã kết thúc'}
                  {activeFilter === 'all' && 'Chưa có giải đấu nào được tạo'}
                </p>
                <Button onClick={() => window.open('/tournaments', '_blank')}>
                  <Plus className='w-4 h-4 mr-2' />
                  Tạo giải đấu đầu tiên
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredTournaments.map((tournament) => (
                <TournamentManagementCard
                  key={tournament.id}
                  tournament={tournament}
                  onSelect={() => onTournamentSelect(tournament)}
                  onGenerateBracket={() => onGenerateBracket(tournament)}
                  onEdit={() => onEditTournament(tournament)}
                  onDelete={() => onDeleteTournament(tournament.id)}
                  getTournamentStatus={getTournamentStatus}
                  getTournamentTypeLabel={getTournamentTypeLabel}
                  formatDate={formatDate}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Tournament Card Component
interface TournamentCardProps {
  tournament: Tournament;
  onSelect: () => void;
  onGenerateBracket: () => void;
  onEdit: () => void;
  onDelete: () => void;
  getTournamentStatus: (status: string) => any;
  getTournamentTypeLabel: (type: string) => string;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
}

const TournamentManagementCard: React.FC<TournamentCardProps> = ({
  tournament,
  onSelect,
  onGenerateBracket,
  onEdit,
  onDelete,
  getTournamentStatus,
  getTournamentTypeLabel,
  formatDate,
  formatCurrency,
}) => {
  const statusInfo = getTournamentStatus(tournament.status);
  const canGenerateBracket = tournament.current_participants >= 3 && 
    ['registration_open', 'registration_closed'].includes(tournament.status);

  return (
    <Card className='hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <CardTitle className='text-lg mb-2 line-clamp-2'>
              {tournament.name}
            </CardTitle>
            <div className='flex items-center gap-2 flex-wrap'>
              <Badge variant={statusInfo.variant}>
                {statusInfo.label}
              </Badge>
              <Badge variant='outline'>
                {getTournamentTypeLabel(tournament.tournament_type)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Tournament Info */}
        <div className='space-y-2 text-sm'>
          <div className='flex items-center gap-2'>
            <Users className='w-4 h-4 text-muted-foreground' />
            <span>
              {tournament.current_participants}/{tournament.max_participants} người tham gia
            </span>
          </div>
          
          <div className='flex items-center gap-2'>
            <Calendar className='w-4 h-4 text-muted-foreground' />
            <span>{formatDate(tournament.tournament_start)}</span>
          </div>

          {tournament.entry_fee > 0 && (
            <div className='flex items-center gap-2'>
              <Star className='w-4 h-4 text-muted-foreground' />
              <span>Phí tham gia: {formatCurrency(tournament.entry_fee)}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {tournament.description && (
          <p className='text-sm text-muted-foreground line-clamp-2'>
            {tournament.description}
          </p>
        )}

        {/* Actions */}
        <div className='flex gap-2 pt-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={onSelect}
            className='flex-1'
          >
            <Eye className='w-4 h-4 mr-1' />
            Xem
          </Button>

          {canGenerateBracket && (
            <Button
              size='sm'
              variant='outline'
              onClick={onGenerateBracket}
              className='border-purple-500 text-purple-600 hover:bg-purple-50'
            >
              <Target className='w-4 h-4 mr-1' />
              Tạo bảng
            </Button>
          )}

          <Button
            size='sm'
            variant='outline'
            onClick={onEdit}
          >
            <Settings className='w-4 h-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
