import React, { useMemo, useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Tournament } from '@/types/tournament-management';
import { FastTournamentCard } from './FastTournamentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface VirtualTournamentListProps {
  tournaments: Tournament[];
  onView: (tournament: Tournament) => void;
  onEdit: (tournament: Tournament) => void;
  onGenerateBracket: (tournament: Tournament) => void;
  height?: number;
  itemHeight?: number;
}

export const VirtualTournamentList: React.FC<VirtualTournamentListProps> = ({
  tournaments,
  onView,
  onEdit,
  onGenerateBracket,
  height = 600,
  itemHeight = 200,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filteredTournaments = useMemo(() => {
    return tournaments.filter(tournament => {
      const matchesSearch = !searchQuery || 
        tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !statusFilter || tournament.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [tournaments, searchQuery, statusFilter]);

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const tournament = filteredTournaments[index];
    
    return (
      <div style={style} className="px-2 py-1">
        <FastTournamentCard
          tournament={tournament}
          onView={onView}
          onEdit={onEdit}
          onGenerateBracket={onGenerateBracket}
        />
      </div>
    );
  }, [filteredTournaments, onView, onEdit, onGenerateBracket]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm giải đấu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {['upcoming', 'ongoing', 'completed', 'registration_open'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
            >
              {status === 'upcoming' ? 'Sắp tới' :
               status === 'ongoing' ? 'Đang diễn ra' :
               status === 'completed' ? 'Hoàn thành' :
               'Đang mở ĐK'}
            </Button>
          ))}
        </div>
      </div>

      {/* Virtual List */}
      <div className="border rounded-lg">
        {filteredTournaments.length > 0 ? (
          <List
            height={height}
            itemCount={filteredTournaments.length}
            itemSize={itemHeight}
            width="100%"
          >
            {Row}
          </List>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Không tìm thấy giải đấu nào
          </div>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground">
        Hiển thị {filteredTournaments.length} / {tournaments.length} giải đấu
      </div>
    </div>
  );
};
