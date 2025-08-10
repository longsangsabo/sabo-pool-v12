import React, { useEffect, useState } from 'react';
import { useLegacySPA } from '../../hooks/useLegacySPA';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  user_type: 'registered' | 'legacy';
  user_id: string | null;
  full_name: string;
  nick_name: string;
  spa_points: number;
  elo_points: number;
  verified_rank: string | null;
  avatar_url: string | null;
  facebook_url: string | null;
  is_registered: boolean;
  can_claim: boolean | null;
}

interface LegacyStats {
  total_players: number;
  claimed_players: number;
  unclaimed_players: number;
  total_spa_points: number;
  claimed_spa_points: number;
  unclaimed_spa_points: number;
}

export const CombinedSPALeaderboard: React.FC = () => {
  const { getLeaderboard, getLegacyStats, loading } = useLegacySPA();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LegacyStats | null>(null);
  const [showOnlyUnclaimed, setShowOnlyUnclaimed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load leaderboard with direct SQL to bypass view issues
        const { data: legacyData, error: legacyError } = await supabase
          .from('legacy_spa_points')
          .select('*')
          .order('spa_points', { ascending: false });

        if (legacyError) {
          console.error('Legacy data error:', legacyError);
          return;
        }

        // Transform legacy data to leaderboard format
        const legacyEntries: LeaderboardEntry[] = (legacyData || []).map(player => ({
          user_type: 'legacy' as const,
          user_id: null,
          full_name: player.full_name,
          nick_name: player.nick_name || player.full_name,
          spa_points: player.spa_points,
          elo_points: 1000,
          verified_rank: null,
          avatar_url: null,
          facebook_url: player.facebook_url,
          is_registered: false,
          can_claim: !player.claimed,
        }));

        // Load active players with SPA points
        const { data: activeData, error: activeError } = await supabase
          .from('player_rankings')
          .select(`
            player_id,
            spa_points,
            elo_points,
            profiles!inner(
              full_name,
              display_name,
              verified_rank,
              avatar_url
            )
          `)
          .gt('spa_points', 0)
          .order('spa_points', { ascending: false });

        if (!activeError && activeData) {
          const activeEntries: LeaderboardEntry[] = activeData.map(player => ({
            user_type: 'registered' as const,
            user_id: player.player_id,
            full_name: (player.profiles as any)?.full_name || (player.profiles as any)?.display_name || 'Unknown',
            nick_name: (player.profiles as any)?.display_name || 'Unknown',
            spa_points: player.spa_points,
            elo_points: player.elo_points,
            verified_rank: (player.profiles as any)?.verified_rank,
            avatar_url: (player.profiles as any)?.avatar_url,
            facebook_url: null,
            is_registered: true,
            can_claim: null,
          }));

          // Combine and sort all entries
          const allEntries = [...legacyEntries, ...activeEntries]
            .sort((a, b) => b.spa_points - a.spa_points);

          setEntries(allEntries);
        } else {
          setEntries(legacyEntries);
        }

        // Load legacy stats
        const legacyStats = await getLegacyStats();
        setStats(legacyStats);

      } catch (error) {
        console.error('Error loading leaderboard:', error);
      }
    };

    loadData();
  }, [getLegacyStats]);

  const filteredEntries = showOnlyUnclaimed
    ? entries.filter(entry => !entry.is_registered && entry.can_claim)
    : entries;

  const maskFacebookUrl = (url: string) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return `${urlObj.hostname}/***`;
    } catch {
      return 'Facebook';
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>Đang tải bảng xếp hạng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold text-gray-800'>
          🏆 Bảng Xếp Hạng SPA Tổng Hợp
        </h2>
        <button
          onClick={() => setShowOnlyUnclaimed(!showOnlyUnclaimed)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showOnlyUnclaimed
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {showOnlyUnclaimed ? 'Hiện tất cả' : 'Chỉ hiện chưa claim'}
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-blue-50 rounded-lg p-4 text-center'>
            <p className='text-2xl font-bold text-blue-600'>
              {stats.total_players}
            </p>
            <p className='text-sm text-blue-700'>Tổng players</p>
          </div>
          <div className='bg-green-50 rounded-lg p-4 text-center'>
            <p className='text-2xl font-bold text-green-600'>
              {stats.claimed_players}
            </p>
            <p className='text-sm text-green-700'>Đã đăng ký</p>
          </div>
          <div className='bg-yellow-50 rounded-lg p-4 text-center'>
            <p className='text-2xl font-bold text-yellow-600'>
              {stats.unclaimed_players}
            </p>
            <p className='text-sm text-yellow-700'>Chờ đăng ký</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className='flex flex-wrap gap-4 mb-4 text-sm'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 bg-white border-2 border-green-500 rounded'></div>
          <span>Đã đăng ký</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 bg-gray-100 border border-gray-300 rounded'></div>
          <span>Chờ đăng ký</span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className='overflow-x-auto'>
        <table className='min-w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                #
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Tên
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Nickname
              </th>
              <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Hạng
              </th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                SPA Points
              </th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                ELO Points
              </th>
              <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredEntries.map((entry, index) => (
              <tr
                key={entry.user_id || `legacy-${index}`}
                className={
                  entry.is_registered
                    ? 'bg-white hover:bg-gray-50'
                    : 'bg-gray-50 hover:bg-gray-100'
                }
              >
                <td className='px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  {index + 1}
                </td>
                <td className='px-4 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    {entry.avatar_url ? (
                      <img
                        className='h-8 w-8 rounded-full mr-3'
                        src={entry.avatar_url}
                        alt={entry.full_name}
                      />
                    ) : (
                      <div className='h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3'>
                        <span className='text-xs font-medium text-gray-600'>
                          {entry.full_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {entry.full_name}
                      </p>
                      {entry.facebook_url && (
                        <p className='text-xs text-blue-600'>
                          {maskFacebookUrl(entry.facebook_url)}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {entry.nick_name || '-'}
                </td>
                <td className='px-4 py-4 whitespace-nowrap text-center'>
                  {entry.verified_rank ? (
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                      {entry.verified_rank}
                    </span>
                  ) : (
                    <span className='text-gray-400'>-</span>
                  )}
                </td>
                <td className='px-4 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600'>
                  {entry.spa_points.toLocaleString()}
                </td>
                <td className='px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900'>
                  {entry.elo_points?.toLocaleString() || '-'}
                </td>
                <td className='px-4 py-4 whitespace-nowrap text-center text-sm'>
                  {entry.is_registered ? (
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                      ✅ Đã đăng ký
                    </span>
                  ) : (
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
                      ⏳ Chờ đăng ký
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEntries.length === 0 && (
        <div className='text-center py-8'>
          <p className='text-gray-500'>Không có dữ liệu hiển thị.</p>
        </div>
      )}

      <div className='mt-6 text-xs text-gray-500 bg-gray-50 rounded-lg p-4'>
        <p className='font-semibold mb-2'>Thông tin:</p>
        <ul className='space-y-1'>
          <li>
            • <strong>Đã đăng ký:</strong> Người chơi đã tạo tài khoản và đăng
            nhập hệ thống
          </li>
          <li>
            • <strong>Chờ đăng ký:</strong> Điểm SPA từ hệ thống cũ, chờ người
            chơi đăng ký để claim
          </li>
          <li>
            • <strong>SPA Points:</strong> Điểm dùng cho challenge betting
          </li>
          <li>
            • <strong>ELO Points:</strong> Điểm skill ranking từ tournament
          </li>
        </ul>
      </div>
    </div>
  );
};
