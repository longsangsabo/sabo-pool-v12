import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CalendarDays,
  MapPin,
  Users,
  Trophy,
  Star,
  Clock,
  AlertTriangle,
  Eye,
  Zap,
  Crown,
  Flame,
} from 'lucide-react';
import { Tournament } from '@/types/tournament';
import { formatCurrency } from '@/utils/prizeUtils';
import {
  getTournamentTypeText,
  getTierText,
  formatTournamentDateTime,
} from '@/utils/tournamentHelpers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';

interface ModernTournamentCardProps {
  tournament: Tournament;
  onRegister?: () => void;
  onViewDetails?: () => void;
  showActions?: boolean;
  priority?: 'high' | 'medium' | 'low';
  index?: number;
}

const ModernTournamentCard: React.FC<ModernTournamentCardProps> = ({
  tournament,
  onRegister,
  onViewDetails,
  showActions = true,
  priority = 'medium',
  index = 0,
}) => {
  const { user } = useAuth();
  const { isMobile, isTablet } = useOptimizedResponsive();
  
  // State management
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(false);
  const [currentParticipants, setCurrentParticipants] = useState(
    tournament.current_participants || 0
  );
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Responsive sizing
  const cardHeight = isMobile ? 'min-h-[320px]' : isTablet ? 'min-h-[360px]' : 'min-h-[400px]';
  const imageHeight = isMobile ? 'h-32' : isTablet ? 'h-36' : 'h-40';
  
  // Tournament status logic
  const getStatusInfo = () => {
    const now = new Date();
    const startDate = new Date(tournament.tournament_start || (tournament as any).start_date);
    const regEndDate = tournament.registration_end ? new Date(tournament.registration_end) : null;
    
    switch (tournament.status) {
      case 'registration_open':
        return {
          status: 'registration_open',
          text: 'Đang mở ĐK',
          color: 'bg-gradient-to-r from-emerald-500 to-green-500',
          glow: 'shadow-green-500/25',
          pulse: false,
        };
      case 'ongoing':
        return {
          status: 'ongoing',
          text: 'Đang diễn ra',
          color: 'bg-gradient-to-r from-red-500 to-pink-500',
          glow: 'shadow-red-500/25',
          pulse: true,
        };
      case 'registration_closed':
        return {
          status: 'registration_closed',
          text: 'Đóng ĐK',
          color: 'bg-gradient-to-r from-orange-500 to-yellow-500',
          glow: 'shadow-orange-500/25',
          pulse: false,
        };
      case 'completed':
        return {
          status: 'completed',
          text: 'Hoàn thành',
          color: 'bg-gradient-to-r from-gray-400 to-gray-500',
          glow: 'shadow-gray-500/25',
          pulse: false,
        };
      case 'cancelled':
        return {
          status: 'cancelled',
          text: 'Hủy bỏ',
          color: 'bg-gradient-to-r from-red-400 to-red-500',
          glow: 'shadow-red-500/25',
          pulse: false,
        };
      default:
        return {
          status: 'draft',
          text: 'Nháp',
          color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          glow: 'shadow-yellow-500/25',
          pulse: false,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const availableSlots = tournament.max_participants - currentParticipants;
  const registrationProgress = (currentParticipants / tournament.max_participants) * 100;
  
  // Premium tournament detection
  const isPremium = tournament.tier_level === 'premium' || (tournament.entry_fee && tournament.entry_fee > 100000);
  const isHot = statusInfo.status === 'registration_open' && availableSlots <= 5;

  // Check registration status
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!user) return;
      
      setCheckingRegistration(true);
      try {
        const { data, error } = await supabase
          .from('tournament_registrations')
          .select('*')
          .eq('tournament_id', tournament.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking registration:', error);
          return;
        }

        setIsRegistered(!!data);
      } catch (error) {
        console.error('Registration check failed:', error);
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkRegistrationStatus();
  }, [user, tournament.id]);

  // Registration handler
  const handleRegisterClick = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đăng ký giải đấu');
      return;
    }

    if (isRegistered) {
      // Handle unregister
      setRegistrationLoading(true);
      try {
        const { error } = await supabase
          .from('tournament_registrations')
          .delete()
          .eq('tournament_id', tournament.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsRegistered(false);
        setCurrentParticipants(prev => Math.max(0, prev - 1));
        toast.success('Đã hủy đăng ký thành công');
      } catch (error) {
        console.error('Error unregistering:', error);
        toast.error('Không thể hủy đăng ký');
      } finally {
        setRegistrationLoading(false);
      }
    } else {
      // Handle register
      if (onRegister) {
        onRegister();
      } else {
        setRegistrationLoading(true);
        try {
          const { error } = await supabase
            .from('tournament_registrations')
            .insert({
              tournament_id: tournament.id,
              user_id: user.id,
              registration_date: new Date().toISOString(),
              status: 'confirmed',
            });

          if (error) throw error;

          setIsRegistered(true);
          setCurrentParticipants(prev => prev + 1);
          toast.success('Đăng ký thành công!');
        } catch (error) {
          console.error('Error registering:', error);
          toast.error('Không thể đăng ký giải đấu');
        } finally {
          setRegistrationLoading(false);
        }
      }
    }
  };

  // Generate hero image or gradient background
  const getHeroBackground = () => {
    if (tournament.banner_image) {
      return {
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%), url(${tournament.banner_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    
    // Dynamic gradient based on tournament type/tier
    const gradients = {
      premium: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500',
      professional: 'bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500',
      amateur: 'bg-gradient-to-br from-green-600 via-emerald-500 to-blue-500',
      beginner: 'bg-gradient-to-br from-orange-600 via-yellow-500 to-green-500',
    };
    
    return {
      className: gradients[tournament.tier_level as keyof typeof gradients] || gradients.amateur,
    };
  };

  const heroStyle = getHeroBackground();

  return (
    <Card 
      className={`
        group relative overflow-hidden border-0 bg-white dark:bg-gray-900 
        ${cardHeight} rounded-2xl shadow-lg hover:shadow-2xl 
        transition-all duration-300 ease-out transform hover:scale-[1.02]
        ${isHovered ? 'ring-2 ring-primary/20' : ''}
        ${statusInfo.glow} hover:shadow-xl
      `}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hero Section with Background */}
      <div 
        className={`
          relative ${imageHeight} w-full overflow-hidden 
          ${heroStyle.className || ''}
        `}
        style={heroStyle.backgroundImage ? heroStyle : undefined}
      >
        {/* Tournament Badges Overlay */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          {isPremium && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-1 shadow-lg">
              <Crown className="w-3 h-3 mr-1" />
              PREMIUM
            </Badge>
          )}
          {isHot && (
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 px-3 py-1 shadow-lg animate-pulse">
              <Flame className="w-3 h-3 mr-1" />
              HOT
            </Badge>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge 
            className={`
              ${statusInfo.color} text-white border-0 px-3 py-1 shadow-lg
              ${statusInfo.pulse ? 'animate-pulse' : ''}
            `}
          >
            {statusInfo.text}
          </Badge>
        </div>

        {/* Tournament Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className={`
            font-bold text-white line-clamp-2 leading-tight
            ${isMobile ? 'text-lg' : 'text-xl'}
          `}>
            {tournament.name}
          </h3>
          {tournament.description && (
            <p className="text-gray-200 text-sm line-clamp-1 mt-1 opacity-90">
              {tournament.description}
            </p>
          )}
        </div>

        {/* Animated Pattern Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Section */}
      <CardContent className={`p-4 space-y-4 ${isMobile ? 'p-3 space-y-3' : ''}`}>
        {/* Tournament Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Date */}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            <span className="truncate">
              {formatTournamentDateTime(tournament.tournament_start || (tournament as any).start_date)}
            </span>
          </div>

          {/* Location */}
          {tournament.venue_address && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="truncate">{tournament.venue_address}</span>
            </div>
          )}

          {/* Game Format */}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="truncate">
              {tournament.game_format === '8_ball' ? '8-Ball' : 
               tournament.game_format === '9_ball' ? '9-Ball' : 
               tournament.game_format === '10_ball' ? '10-Ball' : '8-Ball'}
            </span>
          </div>

          {/* Tournament Type */}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Star className="w-4 h-4 text-purple-500" />
            <span className="truncate">{getTournamentTypeText(tournament.tournament_type)}</span>
          </div>
        </div>

        {/* Participants Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Người tham gia</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {currentParticipants}/{tournament.max_participants}
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={registrationProgress} 
              className="h-2 bg-gray-200 dark:bg-gray-700"
            />
            {/* Progress bar gradient overlay */}
            <div 
              className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${registrationProgress}%` }}
            />
          </div>
          
          {availableSlots <= 5 && availableSlots > 0 && (
            <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
              <AlertTriangle className="w-3 h-3" />
              <span>Chỉ còn {availableSlots} chỗ trống!</span>
            </div>
          )}
        </div>

        {/* Prize Information */}
        {tournament.entry_fee && (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Phí tham gia
              </span>
            </div>
            <span className="font-bold text-amber-900 dark:text-amber-100">
              {formatCurrency(tournament.entry_fee)}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className={`flex gap-2 pt-2 ${isMobile ? 'flex-col' : ''}`}>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={onViewDetails}
              className={`
                ${isMobile ? 'flex-1 h-10' : 'flex-1'} 
                border-gray-300 hover:border-primary hover:bg-primary/5
                transition-all duration-200
              `}
            >
              <Eye className="w-4 h-4 mr-2" />
              Chi tiết
            </Button>

            {statusInfo.status === 'registration_open' && availableSlots > 0 && (
              <Button
                size={isMobile ? "sm" : "default"}
                onClick={handleRegisterClick}
                disabled={checkingRegistration || registrationLoading}
                className={`
                  ${isMobile ? 'flex-1 h-10' : 'flex-1'} 
                  ${isRegistered 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  }
                  text-white border-0 shadow-lg hover:shadow-xl 
                  transition-all duration-200 transform hover:scale-[1.02]
                  ${registrationLoading ? 'animate-pulse' : ''}
                `}
              >
                {registrationLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    {isRegistered ? 'Hủy...' : 'Đăng ký...'}
                  </>
                ) : isRegistered ? (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Hủy ĐK
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Đăng ký
                  </>
                )}
              </Button>
            )}

            {isRegistered && (
              <div className="absolute -top-2 -right-2 z-20">
                <Badge className="bg-green-500 text-white px-2 py-1 text-xs shadow-lg">
                  ✓ Đã ĐK
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Registration deadline warning */}
        {tournament.registration_end && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Clock className="w-3 h-3" />
            <span>
              Hạn ĐK: {formatTournamentDateTime(tournament.registration_end)}
            </span>
          </div>
        )}
      </CardContent>

      {/* Hover Glow Effect */}
      <div className={`
        absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
        transition-opacity duration-300 pointer-events-none
        bg-gradient-to-r from-transparent via-primary/5 to-transparent
      `} />
    </Card>
  );
};

export default ModernTournamentCard;
