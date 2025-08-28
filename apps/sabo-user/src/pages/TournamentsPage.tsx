import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import OptimizedTournamentCard from '@/components/tournament/OptimizedTournamentCard';
import { EnhancedTournamentDetailsModal } from '@/components/tournament/EnhancedTournamentDetailsModal';
import { SimpleRegistrationModal } from '@/components/tournament/SimpleRegistrationModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tournament } from '@/types/tournament';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Search, Filter, Plus, Calendar, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';

const TournamentsPage = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registrationTournament, setRegistrationTournament] =
    useState<Tournament | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { isMobile } = useOptimizedResponsive();

  useEffect(() => {
    fetchTournaments();
    fetchUserProfile();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select(
          `
          *,
          club_profiles(*)
        `
        )
        .in('status', [
          'completed',
          'registration_open',
          'registration_closed',
          'ongoing',
          'upcoming',
        ])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tournaments:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách giải đấu',
          variant: 'destructive',
        });
        return;
      }

      setTournaments((data as any) || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi không mong muốn xảy ra',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('club_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error) {
          setUserProfile(profile);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleCreateTournament = () => {
    if (!userProfile) {
      toast({
        title: 'Thông báo',
        description: 'Bạn chưa được cấp tính năng này, hãy đăng ký là CLB',
        variant: 'destructive',
      });
      return;
    }

    // Navigate to club management page tournaments tab (ClubTournamentManagement opens with create tab by default)
    navigate('/club-management/tournaments');
  };

  const handleRegisterClub = () => {
    navigate('/club-registration');
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch =
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || tournament.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const createTestTournament = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Lỗi',
          description: 'Bạn cần đăng nhập để tạo giải đấu',
          variant: 'destructive',
        });
        return;
      }

      const now = new Date();
      const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const dayAfterTomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const tournamentData = {
        name: `Test Tournament ${Date.now()}`,
        description:
          'This is a test tournament created from the tournaments page',
        tournament_type: 'single_elimination' as const,
        game_format: '9_ball' as const,
        tier_level: 1,
        max_participants: 16,
        current_participants: 0,
        registration_start: now.toISOString(),
        registration_end: inTwoHours.toISOString(),
        tournament_start: tomorrow.toISOString(),
        tournament_end: dayAfterTomorrow.toISOString(),
        venue_address: 'Test Location Address',
        is_public: true,
        requires_approval: false,
        allow_all_ranks: true,
        entry_fee: 100000,
        prize_pool: 500000,
        status: 'registration_open' as const,
        created_by: user.id,
        club_id: null,
        is_visible: true,
      };

      const { data, error } = await supabase
        .from('tournaments')
        .insert([tournamentData])
        .select()
        .single();

      if (error) {
        console.error('Error creating tournament:', error);
        toast({
          title: 'Lỗi',
          description: `Không thể tạo giải đấu: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Thành công',
        description: 'Đã tạo giải đấu test thành công',
      });

      fetchTournaments(); // Refresh the list
    } catch (err) {
      console.error('Unexpected error creating tournament:', err);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi không mong muốn khi tạo giải đấu',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className={`container mx-auto px-4 ${isMobile ? 'py-4' : 'py-8'}`}>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-muted-foreground'>
            Đang tải danh sách giải đấu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-white' 
          : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
      }`}
    >
      <div className="container mx-auto">
      {/* Mobile: Hide title, show only action buttons */}
      {isMobile ? (
        <div className='flex gap-2 mb-1'>
          <Button
            onClick={handleCreateTournament}
            className='flex items-center gap-2 flex-1 text-sm h-7'
            size='sm'
          >
            <Plus className='w-3.5 h-3.5' />
            Tạo
          </Button>
          <Button
            onClick={handleRegisterClub}
            variant='outline'
            className='flex items-center gap-2 flex-1 text-sm h-7'
            size='sm'
          >
            <Shield className='w-3.5 h-3.5' />
            CLB
          </Button>
        </div>
      ) : (
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-foreground mb-2'>
              Giải Đấu Billiards
            </h1>
            <p className='text-muted-foreground'>
              Tham gia các giải đấu hấp dẫn và thử thách bản thân
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={handleCreateTournament}
              className='flex items-center gap-2'
            >
              <Plus className='w-4 h-4' />
              Tạo giải đấu
            </Button>
            <Button
              onClick={handleRegisterClub}
              variant='outline'
              className='flex items-center gap-2'
            >
              <Shield className='w-4 h-4' />
              Đăng ký CLB
            </Button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <Card className={isMobile ? 'mb-1' : 'mb-6'}>
        <CardContent className={isMobile ? 'p-1.5' : 'pt-6'}>
          {isMobile ? (
            /* Mobile: Single row with search and filter */
            <div className='flex gap-1.5'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3' />
                  <Input
                    placeholder='Tìm kiếm...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-7 h-7 text-xs'
                  />
                </div>
              </div>
              <div className='w-16'>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='h-7 text-xs px-2'>
                    <SelectValue placeholder='Tất cả' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả</SelectItem>
                    <SelectItem value='registration_open'>
                      Đang mở đăng ký
                    </SelectItem>
                    <SelectItem value='registration_closed'>
                      Đã đóng đăng ký
                    </SelectItem>
                    <SelectItem value='ongoing'>Đang diễn ra</SelectItem>
                    <SelectItem value='completed'>Đã kết thúc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            /* Desktop: Original layout */
            <div className='flex flex-col lg:flex-row gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                  <Input
                    placeholder='Tìm kiếm giải đấu...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='lg:w-48'>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='Trạng thái' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả</SelectItem>
                    <SelectItem value='registration_open'>
                      Đang mở đăng ký
                    </SelectItem>
                    <SelectItem value='registration_closed'>
                      Đã đóng đăng ký
                    </SelectItem>
                    <SelectItem value='ongoing'>Đang diễn ra</SelectItem>
                    <SelectItem value='completed'>Đã kết thúc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tournament Stats - Hidden on Mobile */}
      {!isMobile && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-2'>
                <Calendar className='w-4 h-4 text-primary' />
                <div>
                  <p className='text-sm text-muted-foreground'>Tổng giải đấu</p>
                  <p className='text-2xl font-bold'>{tournaments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-green-600'>
                  Mở
                </Badge>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Đang mở đăng ký
                  </p>
                  <p className='text-2xl font-bold'>
                    {
                      tournaments.filter(t => t.status === 'registration_open')
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-blue-600'>
                  Đang diễn ra
                </Badge>
                <div>
                  <p className='text-sm text-muted-foreground'>Đang thi đấu</p>
                  <p className='text-2xl font-bold'>
                    {tournaments.filter(t => t.status === 'ongoing').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-gray-600'>
                  Hoàn thành
                </Badge>
                <div>
                  <p className='text-sm text-muted-foreground'>Đã kết thúc</p>
                  <p className='text-2xl font-bold'>
                    {tournaments.filter(t => t.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tournament List */}
      {filteredTournaments.length === 0 ? (
        <Card>
          <CardContent className={isMobile ? 'p-4' : 'pt-6'}>
            <div className={`text-center ${isMobile ? 'py-4' : 'py-8'}`}>
              <Calendar
                className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} text-muted-foreground mx-auto mb-4`}
              />
              <h3
                className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-2`}
              >
                Không có giải đấu nào
              </h3>
              <p
                className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}
              >
                {searchTerm || statusFilter !== 'all'
                  ? 'Không tìm thấy giải đấu phù hợp với bộ lọc của bạn'
                  : 'Hiện tại chưa có giải đấu nào được tạo'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={`grid grid-cols-1 ${isMobile ? 'gap-2' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}
        >
          {filteredTournaments.map(tournament => (
            <OptimizedTournamentCard
              key={tournament.id}
              tournament={tournament}
              onViewDetails={() => {
                setSelectedTournament(tournament);
                setIsModalOpen(true);
              }}
              onRegister={() => {
                if (!user) {
                  toast({
                    title: 'Cần đăng nhập',
                    description:
                      'Bạn cần đăng nhập để đăng ký tham gia giải đấu',
                    variant: 'destructive',
                  });
                  return;
                }

                setRegistrationTournament(tournament);
                setShowRegistrationModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Tournament Details Modal */}
      <EnhancedTournamentDetailsModal
        tournament={selectedTournament}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      {/* Registration Modal */}
      {registrationTournament && (
        <SimpleRegistrationModal
          tournament={registrationTournament}
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={() => {
            fetchTournaments(); // Refresh tournaments list
            setShowRegistrationModal(false);
            setRegistrationTournament(null);
          }}
        />
      )}
      </div>
    </div>
  );
};

export default TournamentsPage;
