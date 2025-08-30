import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Calendar, Trophy, Users, RefreshCw, Zap } from 'lucide-react';
import { useRecentTournaments, RecentTournament } from '@/hooks/useRecentTournaments';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface TournamentTemplateDropdownProps {
  onSelectTemplate: (templateData: any) => void;
  disabled?: boolean;
  className?: string;
}

export const TournamentTemplateDropdown: React.FC<TournamentTemplateDropdownProps> = ({
  onSelectTemplate,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<RecentTournament | null>(null);
  const { tournaments, isLoading, loadRecentTournaments, loadTournamentTemplate } = useRecentTournaments();

  // Load tournaments when component mounts or dropdown opens
  useEffect(() => {
    if (isOpen && tournaments.length === 0) {
      loadRecentTournaments(10).catch(err => {
        console.error('Failed to load tournaments:', err);
        // UI already shows error via toast, so just log it
      });
    }
  }, [isOpen, tournaments.length, loadRecentTournaments]);

  // Handle tournament selection
  const handleSelectTournament = async (tournament: RecentTournament) => {
    try {
      setSelectedTournament(tournament);
      const templateData = await loadTournamentTemplate(tournament.id);
      
      if (templateData) {
        // Add date fields that the form expects
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const nextWeekEnd = new Date(nextWeek.getTime() + 1 * 24 * 60 * 60 * 1000);
        const registrationEnd = new Date(nextWeek.getTime() - 1 * 24 * 60 * 60 * 1000);

        const completeTemplateData = {
          ...templateData,
          tournament_start: nextWeek.toISOString(),
          tournament_end: nextWeekEnd.toISOString(),
          registration_start: now.toISOString(),
          registration_end: registrationEnd.toISOString(),
          start_date: nextWeek.toISOString(),
          end_date: nextWeekEnd.toISOString(),
        };

        onSelectTemplate(completeTemplateData);
      }
    } catch (error) {
      console.error('Error selecting tournament template:', error);
    } finally {
      setIsOpen(false);
    }
  };

  // Format tournament type for display
  const formatTournamentType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'elimination': 'Loại trực tiếp',
      'round_robin': 'Vòng tròn',
      'swiss': 'Hệ thống Thụy Sĩ',
      'league': 'Giải đấu',
      'single_elimination': 'Đơn loại',
      'double_elimination': 'Đôi loại',
    };
    return typeMap[type] || type;
  };

  // Format game format for display
  const formatGameFormat = (format: string | undefined) => {
    if (!format) return 'N/A';
    
    const formatMap: { [key: string]: string } = {
      '8_ball': '8-Ball',
      '9_ball': '9-Ball', 
      '10_ball': '10-Ball',
      'straight_pool': 'Straight Pool',
      'one_pocket': 'One Pocket',
    };
    return formatMap[format] || format;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isLoading}
          className={`h-7 text-xs ${className}`}
        >
          {isLoading ? (
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Zap className="h-3 w-3 mr-1" />
          )}
          Chọn từ giải đấu gần đây
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="start">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Giải đấu gần đây
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <DropdownMenuItem disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Đang tải...
          </DropdownMenuItem>
        ) : tournaments.length === 0 ? (
          <DropdownMenuItem disabled>
            <div className="text-sm text-muted-foreground">
              Chưa có giải đấu nào được tạo
            </div>
          </DropdownMenuItem>
        ) : (
          tournaments.map((tournament) => (
            <DropdownMenuItem
              key={tournament.id}
              className="flex-col items-start gap-2 p-3 cursor-pointer"
              onClick={() => handleSelectTournament(tournament)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="font-medium text-sm truncate flex-1 mr-2">
                  {tournament.name}
                </div>
                {tournament.game_format && (
                  <Badge variant="secondary" className="text-xs">
                    {formatGameFormat(tournament.game_format)}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {formatTournamentType(tournament.tournament_type)}
                  </div>
                  
                  {tournament.max_participants && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {tournament.max_participants}
                    </div>
                  )}
                  
                  {tournament.tier_level && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {String(tournament.tier_level)}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(tournament.created_at), { 
                    addSuffix: true, 
                    locale: vi 
                  })}
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        
        {tournaments.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => loadRecentTournaments(20)}
              disabled={isLoading}
              className="justify-center text-xs text-muted-foreground"
            >
              {isLoading ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Tải thêm giải đấu
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
