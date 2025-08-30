// =============================================
// SABO-32 MATCH NAVIGATOR
// Quick navigation between matches
// =============================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Clock, 
  Trophy,
  Users,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Match {
  id: string;
  match_number: number;
  round: string;
  group_stage: string;
  status: 'pending' | 'in_progress' | 'completed';
  player1?: {
    display_name: string;
  };
  player2?: {
    display_name: string;
  };
  score_player1?: number;
  score_player2?: number;
  winner_id?: string;
}

interface SABO32MatchNavigatorProps {
  matches: Match[];
  currentMatchId?: string;
  onMatchSelect: (matchId: string) => void;
  className?: string;
}

export function SABO32MatchNavigator({ 
  matches, 
  currentMatchId, 
  onMatchSelect,
  className 
}: SABO32MatchNavigatorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filteredMatches, setFilteredMatches] = useState<Match[]>(matches);

  useEffect(() => {
    let filtered = matches;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(match => match.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(match => 
        match.match_number.toString().includes(searchTerm) ||
        match.round.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.player1?.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.player2?.display_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMatches(filtered);
  }, [matches, searchTerm, filterStatus]);

  const currentIndex = filteredMatches.findIndex(match => match.id === currentMatchId);
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      onMatchSelect(filteredMatches[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredMatches.length - 1) {
      onMatchSelect(filteredMatches[currentIndex + 1].id);
    }
  };

  const getMatchStatus = (match: Match) => {
    if (match.status === 'completed') {
      return { color: 'bg-success-500', text: 'Completed' };
    } else if (match.status === 'in_progress') {
      return { color: 'bg-warning-500', text: 'In Progress' };
    } else {
      return { color: 'bg-gray-400', text: 'Pending' };
    }
  };

  const getMatchDisplay = (match: Match) => {
    const p1Name = match.player1?.display_name || 'TBD';
    const p2Name = match.player2?.display_name || 'TBD';
    
    if (match.status === 'completed') {
      return `${p1Name} ${match.score_player1}-${match.score_player2} ${p2Name}`;
    } else {
      return `${p1Name} vs ${p2Name}`;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-body-small">
          <Users className="w-4 h-4" />
          Match Navigator ({filteredMatches.length} matches)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Search and Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
          
          <div className="flex gap-1">
            {(['all', 'pending', 'completed'] as const).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className="h-6 px-2 text-caption capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        {currentMatchId && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex <= 0}
              className="h-7 px-2"
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            
            <div className="text-caption text-muted-foreground">
              {currentIndex + 1} of {filteredMatches.length}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex >= filteredMatches.length - 1}
              className="h-7 px-2"
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Match List */}
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {filteredMatches.map((match) => {
            const status = getMatchStatus(match);
            const isSelected = match.id === currentMatchId;
            
            return (
              <button
                key={match.id}
                onClick={() => onMatchSelect(match.id)}
                className={cn(
                  "w-full text-left p-2 rounded-lg transition-colors",
                  "hover:bg-muted/50 border border-transparent",
                  isSelected && "bg-primary/10 border-primary/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", status.color)} />
                    <span className="text-caption-medium">
                      #{match.match_number}
                    </span>
                    <Badge variant="outline" className="text-caption px-1 py-0">
                      {match.round}
                    </Badge>
                  </div>
                  
                  {match.status === 'completed' && (
                    <Trophy className="w-3 h-3 text-yellow-500" />
                  )}
                  {match.status === 'in_progress' && (
                    <Clock className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
                
                <div className="text-caption text-muted-foreground mt-1 truncate">
                  {getMatchDisplay(match)}
                </div>
                
                {match.group_stage && (
                  <div className="text-caption text-primary-600 dark:text-blue-400">
                    {match.group_stage}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {filteredMatches.length === 0 && (
          <div className="text-center text-caption text-muted-foreground py-4">
            No matches found
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="text-caption-medium">
              {matches.filter(m => m.status === 'pending').length}
            </div>
            <div className="text-caption text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-caption-medium">
              {matches.filter(m => m.status === 'in_progress').length}
            </div>
            <div className="text-caption text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-caption-medium">
              {matches.filter(m => m.status === 'completed').length}
            </div>
            <div className="text-caption text-muted-foreground">Done</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
