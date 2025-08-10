import React, { useState, useEffect } from 'react';
import { useLegacySPA } from '../../hooks/useLegacySPA';
import { useAuth } from '../../hooks/useAuth';

interface LegacyPlayer {
  id: string;
  full_name: string;
  nick_name: string;
  spa_points: number;
  facebook_url?: string;
  similarity_score?: number;
}

interface ClaimResult {
  success: boolean;
  spa_points: number;
  message: string;
  player_name: string;
}

export const ClaimLegacySPA: React.FC = () => {
  const { user } = useAuth();
  const {
    loading,
    claimLoading,
    error,
    checkExistingClaim,
    getSuggestions,
    claimLegacyPoints,
    searchLegacyPlayers,
  } = useLegacySPA();

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<LegacyPlayer[]>([]);
  const [searchResults, setSearchResults] = useState<LegacyPlayer[]>([]);
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);
  const [existingClaim, setExistingClaim] = useState<LegacyPlayer | null>(null);

  // Check if user already claimed on mount
  useEffect(() => {
    if (user) {
      checkExistingClaim().then(setExistingClaim);
    }
  }, [user, checkExistingClaim]);

  // Get suggestions based on user profile
  useEffect(() => {
    if (user?.user_metadata?.full_name && !existingClaim) {
      getSuggestions(
        user.user_metadata.full_name,
        user.user_metadata.display_name
      ).then(setSuggestions);
    }
  }, [user, getSuggestions, existingClaim]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    const results = await searchLegacyPlayers(searchTerm);
    setSearchResults(results);
  };

  const handleClaim = async (player: LegacyPlayer) => {
    const result = await claimLegacyPoints(player.full_name, 'manual');
    if (result?.success) {
      setClaimResult(result);
      setExistingClaim(player);
    }
  };

  if (!user) {
    return (
      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
        <p className='text-yellow-800'>
          Vui lòng đăng nhập để nhận điểm SPA từ hệ thống cũ.
        </p>
      </div>
    );
  }

  if (existingClaim) {
    return (
      <div className='bg-green-50 border border-green-200 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-green-800 mb-2'>
          ✅ Đã nhận điểm SPA thành công!
        </h3>
        <p className='text-green-700'>
          Bạn đã nhận {existingClaim.spa_points} điểm SPA từ tài khoản{' '}
          <strong>{existingClaim.full_name}</strong>.
        </p>
        {claimResult && (
          <p className='text-green-600 mt-2 text-sm'>{claimResult.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      <h2 className='text-xl font-bold mb-4'>
        🎁 Nhận điểm SPA từ hệ thống cũ
      </h2>

      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
        <h4 className='font-semibold text-blue-800 mb-2'>
          Hướng dẫn nhận điểm:
        </h4>
        <ul className='text-sm text-blue-700 space-y-1'>
          <li>• Tìm tên của bạn trong danh sách dưới đây</li>
          <li>• Nhấn "Nhận điểm" để claim điểm SPA từ hệ thống cũ</li>
          <li>• Mỗi tài khoản chỉ được nhận điểm một lần</li>
        </ul>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-3 mb-4'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}

      {/* Suggestions based on user profile */}
      {suggestions.length > 0 && (
        <div className='mb-6'>
          <h3 className='font-semibold text-gray-800 mb-3'>
            🔍 Gợi ý cho bạn:
          </h3>
          <div className='space-y-2'>
            {suggestions.map((player) => (
              <div
                key={player.id}
                className='flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3'
              >
                <div>
                  <p className='font-medium'>{player.full_name}</p>
                  <p className='text-sm text-gray-600'>
                    {player.nick_name} • {player.spa_points} điểm SPA
                  </p>
                  <p className='text-xs text-gray-500'>
                    Độ tương đồng:{' '}
                    {Math.round((player.similarity_score || 0) * 100)}%
                  </p>
                </div>
                <button
                  onClick={() => handleClaim(player)}
                  disabled={claimLoading}
                  className='bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50'
                >
                  {claimLoading ? 'Đang xử lý...' : 'Nhận điểm'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search functionality */}
      <div className='mb-4'>
        <h3 className='font-semibold text-gray-800 mb-3'>
          🔍 Tìm kiếm tên của bạn:
        </h3>
        <div className='flex gap-3'>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Nhập tên hoặc nickname...'
            className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50'
          >
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div>
          <h3 className='font-semibold text-gray-800 mb-3'>
            📋 Kết quả tìm kiếm:
          </h3>
          <div className='space-y-2'>
            {searchResults.map((player) => (
              <div
                key={player.id}
                className='flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3'
              >
                <div>
                  <p className='font-medium'>{player.full_name}</p>
                  <p className='text-sm text-gray-600'>
                    {player.nick_name} • {player.spa_points} điểm SPA
                  </p>
                  {player.facebook_url && (
                    <a
                      href={player.facebook_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-xs text-blue-600 hover:underline'
                    >
                      Xem Facebook
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleClaim(player)}
                  disabled={claimLoading}
                  className='bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50'
                >
                  {claimLoading ? 'Đang xử lý...' : 'Nhận điểm'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchResults.length === 0 && searchTerm && !loading && (
        <div className='text-center py-6'>
          <p className='text-gray-500'>
            Không tìm thấy tên "{searchTerm}" trong danh sách.
          </p>
          <p className='text-sm text-gray-400 mt-1'>
            Vui lòng liên hệ admin để xác minh tài khoản.
          </p>
        </div>
      )}

      <div className='mt-6 text-xs text-gray-500 bg-gray-50 rounded-lg p-3'>
        <p className='font-semibold mb-1'>Lưu ý:</p>
        <ul className='space-y-1'>
          <li>• Mỗi số điện thoại/tên chỉ được nhận điểm một lần</li>
          <li>• Điểm SPA sẽ được cộng vào tài khoản ngay lập tức</li>
          <li>• Nếu không tìm thấy tên, vui lòng liên hệ admin</li>
        </ul>
      </div>
    </div>
  );
};
