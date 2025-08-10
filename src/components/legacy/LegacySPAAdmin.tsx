import React, { useState, useEffect } from 'react';
import { useLegacySPA } from '../../hooks/useLegacySPA';

interface LegacyPlayer {
  id: string;
  full_name: string;
  nick_name: string;
  spa_points: number;
  facebook_url?: string;
  claimed: boolean;
}

interface LegacyStats {
  total_players: number;
  claimed_players: number;
  unclaimed_players: number;
  total_spa_points: number;
  claimed_spa_points: number;
  unclaimed_spa_points: number;
}

export const LegacySPAAdmin: React.FC = () => {
  const { getLegacyStats, searchLegacyPlayers, loading } = useLegacySPA();
  const [stats, setStats] = useState<LegacyStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<LegacyPlayer[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      const statsData = await getLegacyStats();
      setStats(statsData);
    };

    loadStats();
  }, [getLegacyStats]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    const results = await searchLegacyPlayers(searchTerm);
    setSearchResults(results);
  };

  const claimPercentage = stats
    ? Math.round((stats.claimed_players / stats.total_players) * 100)
    : 0;

  const pointsClaimPercentage = stats
    ? Math.round((stats.claimed_spa_points / stats.total_spa_points) * 100)
    : 0;

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      <h2 className='text-2xl font-bold mb-6 text-gray-800'>
        🔧 Quản lý Legacy SPA System
      </h2>

      {/* Statistics Overview */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
          <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-2'>Tổng quan Players</h3>
            <div className='space-y-2'>
              <p className='text-3xl font-bold'>{stats.total_players}</p>
              <p className='text-blue-100'>Tổng số players trong BXH cũ</p>
            </div>
          </div>

          <div className='bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-2'>Claim Status</h3>
            <div className='space-y-2'>
              <p className='text-3xl font-bold'>
                {stats.claimed_players}/{stats.total_players}
              </p>
              <p className='text-green-100'>
                {claimPercentage}% đã claim điểm
              </p>
            </div>
          </div>

          <div className='bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-2'>SPA Points</h3>
            <div className='space-y-2'>
              <p className='text-3xl font-bold'>
                {stats.total_spa_points.toLocaleString()}
              </p>
              <p className='text-yellow-100'>
                {pointsClaimPercentage}% điểm đã claim
              </p>
            </div>
          </div>

          <div className='bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-2'>Đã Claim</h3>
            <div className='space-y-2'>
              <p className='text-3xl font-bold'>
                {stats.claimed_spa_points.toLocaleString()}
              </p>
              <p className='text-purple-100'>SPA points đã được claim</p>
            </div>
          </div>

          <div className='bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-2'>Chưa Claim</h3>
            <div className='space-y-2'>
              <p className='text-3xl font-bold'>
                {stats.unclaimed_spa_points.toLocaleString()}
              </p>
              <p className='text-red-100'>SPA points chờ claim</p>
            </div>
          </div>

          <div className='bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-2'>Chờ Đăng Ký</h3>
            <div className='space-y-2'>
              <p className='text-3xl font-bold'>{stats.unclaimed_players}</p>
              <p className='text-gray-100'>Players chưa tạo tài khoản</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bars */}
      <div className='space-y-4 mb-8'>
        <div>
          <div className='flex justify-between mb-1'>
            <span className='text-sm font-medium text-gray-700'>
              Tỷ lệ claim players
            </span>
            <span className='text-sm text-gray-500'>{claimPercentage}%</span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-green-600 h-2 rounded-full transition-all duration-300'
              style={{ width: `${claimPercentage}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className='flex justify-between mb-1'>
            <span className='text-sm font-medium text-gray-700'>
              Tỷ lệ claim SPA points
            </span>
            <span className='text-sm text-gray-500'>
              {pointsClaimPercentage}%
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all duration-300'
              style={{ width: `${pointsClaimPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className='border-t pt-6'>
        <h3 className='text-lg font-semibold mb-4 text-gray-800'>
          🔍 Tìm kiếm Legacy Players
        </h3>

        <div className='flex gap-3 mb-4'>
          <input
            type='text'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder='Nhập tên hoặc nickname để tìm kiếm...'
            className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50'
          >
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className='bg-gray-50 rounded-lg p-4'>
            <h4 className='font-medium mb-3 text-gray-800'>
              Kết quả tìm kiếm ({searchResults.length}):
            </h4>
            <div className='space-y-2'>
              {searchResults.map(player => (
                <div
                  key={player.id}
                  className='flex items-center justify-between bg-white p-3 rounded border'
                >
                  <div>
                    <p className='font-medium'>{player.full_name}</p>
                    <p className='text-sm text-gray-600'>
                      {player.nick_name} • {player.spa_points} SPA points
                    </p>
                    <p className='text-xs text-gray-500'>
                      Trạng thái:{' '}
                      {player.claimed ? (
                        <span className='text-green-600'>✅ Đã claim</span>
                      ) : (
                        <span className='text-yellow-600'>⏳ Chưa claim</span>
                      )}
                    </p>
                  </div>
                  {player.facebook_url && (
                    <a
                      href={player.facebook_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:text-blue-800 text-xs'
                    >
                      Facebook
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && searchTerm && !loading && (
          <div className='text-center py-6 text-gray-500'>
            Không tìm thấy kết quả cho "{searchTerm}"
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className='mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <h4 className='font-semibold text-blue-800 mb-2'>
          📋 Hướng dẫn quản lý:
        </h4>
        <ul className='text-sm text-blue-700 space-y-1'>
          <li>• Database đã import {stats?.total_players} players từ BXH cũ</li>
          <li>
            • Users có thể claim điểm SPA bằng cách tìm tên trong hệ thống
          </li>
          <li>• Mỗi player chỉ được claim một lần duy nhất</li>
          <li>
            • Admin có thể theo dõi progress claim thông qua thống kê trên
          </li>
          <li>• Function claim_legacy_spa_points() xử lý việc transfer điểm</li>
        </ul>
      </div>
    </div>
  );
};

export default LegacySPAAdmin;
