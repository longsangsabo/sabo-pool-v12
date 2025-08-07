import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  Star,
  Zap,
  Eye,
  Crown,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { Tournament } from '@/types/tournament';
import { formatCurrency } from '@/utils/prizeUtils';
import { formatTournamentDateTime } from '@/utils/tournamentHelpers';

interface MobileTournamentCardProps {
  tournament: Tournament;
  onRegister?: () => void;
  onViewDetails?: () => void;
  isRegistered?: boolean;
  index?: number;
}

const MobileTournamentCard: React.FC<MobileTournamentCardProps> = ({
  tournament,
  onRegister,
  onViewDetails,
  isRegistered = false,
  index = 0,
}) => {
  const [currentParticipants] = useState(tournament.current_participants || 0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Tournament status
  const getStatusInfo = () => {
    switch (tournament.status) {
      case 'registration_open':
        return {
          text: 'Đang mở ĐK',
          color: 'bg-green-500',
          textColor: 'text-white',
          pulse: false,
        };
      case 'ongoing':
        return {
          text: 'Đang diễn ra',
          color: 'bg-red-500',
          textColor: 'text-white',
          pulse: true,
        };
      case 'registration_closed':
        return {
          text: 'Đóng ĐK',
          color: 'bg-orange-500',
          textColor: 'text-white',
          pulse: false,
        };
      case 'completed':
        return {
          text: 'Hoàn thành',
          color: 'bg-gray-500',
          textColor: 'text-white',
          pulse: false,
        };
      case 'cancelled':
        return {
          text: 'Hủy bỏ',
          color: 'bg-red-400',
          textColor: 'text-white',
          pulse: false,
        };
      default:
        return {
          text: 'Nháp',
          color: 'bg-yellow-500',
          textColor: 'text-white',
          pulse: false,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const availableSlots = tournament.max_participants - currentParticipants;
  const registrationProgress = (currentParticipants / tournament.max_participants) * 100;
  const isPremium = tournament.tier_level === 'premium' || (tournament.entry_fee && tournament.entry_fee > 100000);
  const isHot = statusInfo.text === 'Đang mở ĐK' && availableSlots <= 5;

  return (
    <Card 
      className={`
        relative overflow-hidden bg-white dark:bg-gray-800 
        rounded-xl shadow-md hover:shadow-lg transition-all duration-300
        border-l-4 ${
          tournament.status === 'registration_open' ? 'border-l-green-500' :
          tournament.status === 'ongoing' ? 'border-l-red-500' :
          tournament.status === 'registration_closed' ? 'border-l-blue-500' :
          'border-l-gray-400'
        }
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header with Tournament Name and Status */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 mr-3">
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
              {tournament.name}
            </h3>
            {tournament.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                {tournament.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-1 items-end">
            <Badge 
              className={`
                ${statusInfo.color} ${statusInfo.textColor} text-xs px-2 py-1 border-0
                ${statusInfo.pulse ? 'animate-pulse' : ''}
              `}
            >
              {statusInfo.text}
            </Badge>
            
            {isRegistered && (
              <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                ✓ Đã ĐK
              </Badge>
            )}
          </div>
        </div>

        {/* Premium/Hot Badges */}
        {(isPremium || isHot) && (
          <div className="flex gap-2 mb-3">
            {isPremium && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1">
                <Crown className="w-3 h-3 mr-1" />
                PREMIUM
              </Badge>
            )}
            {isHot && (
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 animate-pulse">
                <Flame className="w-3 h-3 mr-1" />
                HOT
              </Badge>
            )}
          </div>
        )}

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Calendar className="w-3 h-3 text-blue-500" />
            <span className="truncate">
              {formatTournamentDateTime(tournament.tournament_start || (tournament as any).start_date)}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span className="truncate">
              {tournament.game_format === '8_ball' ? '8-Ball' : 
               tournament.game_format === '9_ball' ? '9-Ball' : '8-Ball'}
            </span>
          </div>
        </div>

        {/* Participants Progress */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Users className="w-3 h-3 text-blue-500" />
              <span>Người tham gia</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {currentParticipants}/{tournament.max_participants}
            </span>
          </div>
          
          <Progress value={registrationProgress} className="h-1.5 bg-gray-200 dark:bg-gray-700" />
          
          {availableSlots <= 5 && availableSlots > 0 && (
            <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
              <AlertTriangle className="w-3 h-3" />
              <span>Chỉ còn {availableSlots} chỗ!</span>
            </div>
          )}
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="space-y-2 text-xs border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
            {tournament.venue_address && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-3 h-3 text-green-500" />
                <span className="line-clamp-1">{tournament.venue_address}</span>
              </div>
            )}
            
            {tournament.entry_fee && (
              <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-600" />
                  <span className="text-amber-800 dark:text-amber-200">Phí tham gia</span>
                </div>
                <span className="font-bold text-amber-900 dark:text-amber-100">
                  {formatCurrency(tournament.entry_fee)}
                </span>
              </div>
            )}
            
            {tournament.registration_end && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>Hạn ĐK: {formatTournamentDateTime(tournament.registration_end)}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex-1 h-8 text-xs border-gray-300 hover:border-primary"
          >
            <Eye className="w-3 h-3 mr-1" />
            Chi tiết
          </Button>

          <Button
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            className="px-3 h-8 text-xs text-gray-600 hover:text-gray-900"
          >
            {isExpanded ? '▲' : '▼'}
          </Button>

          {statusInfo.text === 'Đang mở ĐK' && availableSlots > 0 && (
            <Button
              size="sm"
              onClick={onRegister}
              className={`
                flex-1 h-8 text-xs border-0 shadow-sm
                ${isRegistered 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                }
              `}
            >
              {isRegistered ? (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Hủy
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 mr-1" />
                  Đăng ký
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/2 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
    </Card>
  );
};

export default MobileTournamentCard;
