import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Trophy, Settings, Eye, Play } from 'lucide-react';
import { Tournament } from '@/types/tournament-management';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface FastTournamentCardProps {
  tournament: Tournament;
  onView: (tournament: Tournament) => void;
  onEdit: (tournament: Tournament) => void;
  onGenerateBracket: (tournament: Tournament) => void;
}

export const FastTournamentCard = memo<FastTournamentCardProps>(({
  tournament,
  onView,
  onEdit,
  onGenerateBracket,
}) => {
  const getStatusColor = (status: string) => {
    const colorMap = {
      upcoming: 'default',
      registration_open: 'default',
      registration_closed: 'secondary',
      ongoing: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
    } as const;
    return colorMap[status as keyof typeof colorMap] || 'outline';
  };

  const getStatusLabel = (status: string) => {
    const labelMap = {
      upcoming: 'Sắp diễn ra',
      registration_open: 'Đang mở đăng ký',
      registration_closed: 'Đã đóng đăng ký',
      ongoing: 'Đang diễn ra',
      completed: 'Đã kết thúc',
      cancelled: 'Đã hủy',
    };
    return labelMap[status as keyof typeof labelMap] || status;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{tournament.name}</CardTitle>
          <Badge variant={getStatusColor(tournament.status)}>
            {getStatusLabel(tournament.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {tournament.tournament_start && format(new Date(tournament.tournament_start), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {tournament.current_participants || 0}/{tournament.max_participants} người
          </div>
          
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            {tournament.tournament_type === 'single_elimination' ? 'Loại trực tiếp' : 
             tournament.tournament_type === 'double_elimination' ? 'Loại kép' : 
             tournament.tournament_type}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(tournament)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Xem
          </Button>
          
          {tournament.status === 'registration_closed' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onGenerateBracket(tournament)}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-1" />
              Bảng đấu
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(tournament)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

FastTournamentCard.displayName = 'FastTournamentCard';
