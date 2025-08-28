import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Medal, Trophy } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';

interface LegacyPlayer {
  id: string;
  full_name: string;
  nick_name: string;
  spa_points: number;
  claimed: boolean;
  facebook_url?: string;
}

export const SimpleSPALeaderboard: React.FC = () => {
  const [players, setPlayers] = useState<LegacyPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const { isMobile } = useOptimizedResponsive();
  const { theme } = useTheme();

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className='w-5 h-5 text-yellow-500' />;
      case 2:
        return <Medal className='w-5 h-5 text-gray-400' />;
      case 3:
        return <Trophy className='w-5 h-5 text-amber-600' />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const loadLegacyPlayers = async () => {
      try {
        const { data, error } = await supabase
          .from('legacy_spa_points')
          .select('*')
          .order('spa_points', { ascending: false });

        if (error) {
          return;
        }

        setPlayers(data || []);
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };

    loadLegacyPlayers();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  // Mobile version
  if (isMobile) {
    return (
      <div className='space-y-2'>
        <div className='text-center mb-4'>
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            🏆 BXH SPA Legacy
          </h2>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {players.length} người chơi
            {' • '}
            {players.filter(p => p.claimed).length} đã claim
          </div>
        </div>

        {players.map((player, index) => (
          <Card
            key={player.id}
            className={`overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
              theme === 'dark'
                ? 'bg-gray-800/60 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/80'
                : 'bg-white/80 border-gray-200/50 backdrop-blur-sm hover:bg-white/90 hover:shadow-lg'
            }`}
          >
            <CardContent className='p-3'>
              <div className='flex items-center space-x-3'>
                {/* Rank Position */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 ${
                    index < 3
                      ? theme === 'dark'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-md'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {getRankIcon(index + 1) || index + 1}
                </div>

                {/* User Info */}
                <div className='flex-1 min-w-0'>
                  <p
                    className={`font-semibold truncate transition-colors duration-200 ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    {player.full_name}
                  </p>
                  {player.nick_name && player.nick_name !== player.full_name && (
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      ({player.nick_name})
                    </div>
                  )}
                  <div className='flex items-center gap-2 mt-1'>
                    <Badge
                      variant='secondary'
                      className={`text-xs px-2 py-0.5 transition-all duration-200 ${
                        player.claimed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {player.claimed ? '✅ Đã claim' : '⏳ Chưa claim'}
                    </Badge>
                  </div>
                </div>

                {/* SPA Points */}
                <div className='text-right'>
                  <p
                    className={`text-lg font-bold transition-colors duration-200 ${
                      theme === 'dark'
                        ? 'text-purple-400'
                        : 'text-purple-600'
                    }`}
                  >
                    {player.spa_points.toLocaleString()}
                  </p>
                  <p
                    className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    SPA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <div className={`text-center text-sm mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Dữ liệu từ BXH SPA cũ
          {' • '}
          Tổng:
          {' '}
          {players.reduce((sum, p) => sum + p.spa_points, 0).toLocaleString()}
          {' '}
          SPA points
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>🏆 BXH SPA Legacy</h2>
        <div className='text-sm text-gray-600'>
          {players.length} người chơi
          {' • '}
          {players.filter(p => p.claimed).length} đã claim
        </div>
      </div>

      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-semibold text-sm'>
          <div className='col-span-1'>#</div>
          <div className='col-span-5'>Tên</div>
          <div className='col-span-3'>SPA Points</div>
          <div className='col-span-3'>Trạng thái</div>
        </div>

        {players.map((player, index) => (
          <div 
            key={player.id}
            className={`grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 ${
              player.claimed ? 'bg-green-50' : ''
            }`}
          >
            <div className='col-span-1 font-semibold text-gray-600'>
              {index + 1}
            </div>
            
            <div className='col-span-5'>
              <div className='font-medium'>{player.full_name}</div>
              {player.nick_name && player.nick_name !== player.full_name && (
                <div className='text-sm text-gray-500'>
                  ({player.nick_name})
                </div>
              )}
            </div>
            
            <div className='col-span-3'>
              <span className='inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800'>
                {player.spa_points.toLocaleString()} SPA
              </span>
            </div>
            
            <div className='col-span-3'>
              {player.claimed ? (
                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                  ✅ Đã claim
                </span>
              ) : (
                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
                  ⏳ Chưa claim
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className='text-center text-sm text-gray-500 mt-4'>
        Dữ liệu từ BXH SPA cũ
        {' • '}
        Tổng:
        {' '}
        {players.reduce((sum, p) => sum + p.spa_points, 0).toLocaleString()}
        {' '}
        SPA points
      </div>
    </div>
  );
};
