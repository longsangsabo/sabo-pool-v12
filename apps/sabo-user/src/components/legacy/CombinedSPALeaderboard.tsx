import React from "react";
import { useEffect, useState } from 'react';
import { useLegacySPA } from '@/hooks/useLegacySPA';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LegacyGiftCodeModal } from '@/components/legacy/LegacyCodeClaimModal';
import { Gift, Clock, CheckCircle, Trophy, Star, Crown, Award, Zap, TrendingUp, Users, Target } from 'lucide-react';

interface LeaderboardEntry {
  user_type: 'registered' | 'legacy';
  user_id: string | undefined;
  legacy_entry_id?: string; // For legacy entries
  full_name: string;
  nick_name: string;
  spa_points: number;
  elo_points: number;
  verified_rank: string | undefined;
  avatar_url: string | undefined;
  facebook_url: string | undefined;
  is_registered: boolean;
  can_claim: boolean | null;
  has_pending_claim?: boolean;
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
  const { loading } = useLegacySPA();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LegacyStats | null>(null);
  const [showOnlyUnclaimed, setShowOnlyUnclaimed] = useState(false);
  
  // Legacy Code Claim Modal State
  const [isLegacyCodeModalOpen, setIsLegacyCodeModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);

  const loadData = async () => {
    try {
      // Legacy claim requests system removed - now using direct code claim

      // Real legacy data from original system - 47 players
      const mockLegacyData = [
        { id: '1', full_name: 'ĐĂNG RT', nick_name: 'ĐĂNG RT', spa_points: 3600, claimed: false, facebook_url: 'https://www.facebook.com/dpmd.3011' },
        { id: '2', full_name: 'KHANH HOÀNG', nick_name: 'KHÁNH HOÀNG', spa_points: 3500, claimed: false, facebook_url: 'https://www.facebook.com/khanh.hoang.14979' },
        { id: '3', full_name: 'THÙY LINH', nick_name: 'THÙY LINH', spa_points: 3450, claimed: false, facebook_url: 'https://www.facebook.com/thuy.linh.196744' },
        { id: '4', full_name: 'BEN HUYNH', nick_name: 'BEN SABO', spa_points: 2300, claimed: false, facebook_url: 'https://www.facebook.com/ben.huynh.99999/' },
        { id: '5', full_name: 'TRƯỜNG PHÚC', nick_name: 'TRƯỜNG PHÚC', spa_points: 2300, claimed: false, facebook_url: 'https://www.facebook.com/truong.phuc.326252' },
        { id: '6', full_name: 'HUY HÙNG', nick_name: 'HUY HÙNG', spa_points: 2100, claimed: false, facebook_url: 'https://www.facebook.com/hung.nguyenhuy.9277583' },
        { id: '7', full_name: 'BI SỨA', nick_name: 'BI SỨA', spa_points: 2050, claimed: false, facebook_url: 'https://www.facebook.com/nam.hoang.635463' },
        { id: '8', full_name: 'LỌ LEM', nick_name: 'LỌ LEM', spa_points: 1650, claimed: false, facebook_url: 'https://www.facebook.com/lo.lem.278023' },
        { id: '9', full_name: 'NGÔ THẾ BĂNG', nick_name: 'BẰNG NHIỆT', spa_points: 1550, claimed: false, facebook_url: 'https://www.facebook.com/bang.ngothe.73' },
        { id: '10', full_name: 'NGỌC THỎ', nick_name: 'THÀNH', spa_points: 1450, claimed: false, facebook_url: 'https://www.facebook.com/ngocthanh.hoang.16906' },
        { id: '11', full_name: 'NGÔ LỚN', nick_name: 'NGÔ LỚN', spa_points: 1200, claimed: false, facebook_url: 'https://www.facebook.com/nho.bap.391' },
        { id: '12', full_name: 'HẢI BÉ', nick_name: 'HẢI BÉ', spa_points: 1150, claimed: false, facebook_url: 'https://www.facebook.com/ailammoc.805340' },
        { id: '13', full_name: 'VIỆT NHÍM', nick_name: 'VIỆT NHÍM', spa_points: 1100, claimed: false, facebook_url: 'https://www.facebook.com/quocviet95media' },
        { id: '14', full_name: 'ĐẶNG THỦY', nick_name: 'ĐẶNG THỦY', spa_points: 1100, claimed: false, facebook_url: 'https://www.facebook.com/thuy.tilo' },
        { id: '15', full_name: 'QUỐC MINH', nick_name: 'QUỐC MINH', spa_points: 500, claimed: false, facebook_url: 'https://www.facebook.com/ng.quoc.minh.933306' },
        { id: '16', full_name: 'KHÁ NGUYỄN', nick_name: 'KHÁ NGUYỄN', spa_points: 500, claimed: false, facebook_url: 'https://www.facebook.com/khanguyen27092000' },
        { id: '17', full_name: 'NAM DƯƠNG', nick_name: 'NAM DƯƠNG', spa_points: 500, claimed: false, facebook_url: 'https://www.facebook.com/pham.nam.duong.272676' },
        { id: '18', full_name: 'LÊ VƯƠNG', nick_name: 'LÊ VƯƠNG', spa_points: 350, claimed: false, facebook_url: 'https://www.facebook.com/le.vuong.665430' },
        { id: '19', full_name: 'MAI MÈO', nick_name: 'MAI MÈO', spa_points: 300, claimed: false, facebook_url: 'https://www.facebook.com/suongmai.nguyen.9615' },
        { id: '20', full_name: 'QUÂN TRÔI', nick_name: 'ANH QUÂN', spa_points: 300, claimed: false, facebook_url: 'https://www.facebook.com/nguyen.anh.quan.528335' },
        { id: '21', full_name: 'CHỊ DUNG', nick_name: 'CHỊ DUNG', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/angel.tran.9212' },
        { id: '22', full_name: 'NHÂN LÊ', nick_name: 'NHÂN LÊ', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/trieu.van.652085' },
        { id: '23', full_name: 'HIẾU NGUYỄN', nick_name: 'HIẾU NGUYỄN', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/hieunguyen.840922' },
        { id: '24', full_name: 'KEN', nick_name: 'KEN', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/formen.ken' },
        { id: '25', full_name: 'NGHIÊM', nick_name: 'NGHIÊM', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/HoangNghiem2307' },
        { id: '26', full_name: 'QUANG NHẬT', nick_name: 'QUANG NHẬT', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/quang.nhat.808703' },
        { id: '27', full_name: 'DUY NGUYỄN', nick_name: 'DUY NGUYỄN', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/nguyen.uc.duy.503201' },
        { id: '28', full_name: 'ĐÌNH DŨNG', nick_name: 'ĐÌNH DŨNG', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/toilaaivtvn' },
        { id: '29', full_name: 'HUY TRAN', nick_name: 'HUY TRAN', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/tran.huy.607959' },
        { id: '30', full_name: 'MINH', nick_name: 'MINH', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/minh.minh.334139' },
        { id: '31', full_name: 'SỸ NGUYÊN', nick_name: 'NGUYÊN', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/sy.nguyen.116671' },
        { id: '32', full_name: 'PHÚC NHỎ', nick_name: 'PHÚC NHỎ', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/phuc.nho.455054' },
        { id: '33', full_name: 'TIẾN BỊP', nick_name: 'TIẾN BỊP', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/linheica23' },
        { id: '34', full_name: 'TIẾN LƯƠNG', nick_name: 'TIẾN LƯƠNG', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/luong.tien.862707' },
        { id: '35', full_name: 'TN.MINH ĐỨC', nick_name: 'TN.MINH ĐỨC', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/truong.nguyen.minh.uc.70129' },
        { id: '36', full_name: 'TUẤN PHONG', nick_name: 'TUẤN PHONG', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/sasori.da.xichsa' },
        { id: '37', full_name: 'THANH', nick_name: 'THANH', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/le.trong.thanh.283820' },
        { id: '38', full_name: 'QUỐC BÉP', nick_name: 'QUỐC EM', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/quoc.em.132489' },
        { id: '39', full_name: 'LIÊM CON', nick_name: 'LIÊM CON', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/huynh.thanh.liem.646564' },
        { id: '40', full_name: 'TRẦN MINH', nick_name: 'MINH', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/groups/1057568155407784/user/100070042594003/' },
        { id: '41', full_name: 'VIỆT ANH', nick_name: 'VIỆT ANH', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/nguyen.vietanh.521441' },
        { id: '42', full_name: 'TUẤN IT NÓI', nick_name: 'TUẤN', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/le.minh.tuan.285386' },
        { id: '43', full_name: 'TUẤN', nick_name: 'TUÂN XÍ LỤM', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/thanh.tuan.796723' },
        { id: '44', full_name: 'N.LONG', nick_name: 'NHẬT LONG', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/long.ares.334' },
        { id: '45', full_name: 'H.LONG', nick_name: 'HOÀNG LONG', spa_points: 150, claimed: false, facebook_url: 'https://www.facebook.com/hlonq2711' },
        { id: '46', full_name: 'ANH LONG MAGIC', nick_name: 'ANH LONG MAGIC', spa_points: 100, claimed: false, facebook_url: 'https://www.facebook.com/longsang791' },
      ];

      // Transform legacy data to leaderboard format
      const legacyEntries: LeaderboardEntry[] = mockLegacyData.map((player, index) => ({
        user_type: 'legacy' as const,
        user_id: null,
        legacy_entry_id: player.id,
        full_name: player.full_name,
        nick_name: player.nick_name || player.full_name,
        spa_points: player.spa_points,
        elo_points: 1000,
        verified_rank: null,
        avatar_url: null,
        facebook_url: null,
        is_registered: player.claimed,
        can_claim: !player.claimed,
        has_pending_claim: false,
      }));

      console.log('🔍 Legacy entries debug:', {
        totalEntries: legacyEntries.length,
        userInfo: user ? {
          id: user.id,
          displayName: user.user_metadata?.display_name,
          fullName: user.user_metadata?.full_name,
          email: user.email
        } : null
      });

      // Set ONLY legacy entries (no combining with active players)
      setEntries(legacyEntries);

      // Load legacy stats (or use mock stats for demo)
      const mockStats = {
        total_players: 47,
        claimed_players: 0, // Chưa có ai claim
        unclaimed_players: 47,
        total_spa_points: legacyEntries.reduce((sum, entry) => sum + entry.spa_points, 0),
        claimed_spa_points: 0,
        unclaimed_spa_points: legacyEntries.reduce((sum, entry) => sum + entry.spa_points, 0)
      };
      setStats(mockStats);

    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const filteredEntries = showOnlyUnclaimed
    ? entries.filter(entry => !entry.is_registered && entry.can_claim)
    : entries;

  // Check if current user can claim a specific legacy entry
  const canUserClaim = (entry: LeaderboardEntry) => {
    // Simplified: Show claim button for all unclaimed legacy entries
    if (!user) {
      console.log('❌ No user logged in');
      return false;
    }

    if (entry.is_registered) {
      console.log('❌ Entry already registered/claimed:', entry.nick_name);
      return false;
    }

    if (!entry.can_claim) {
      console.log('❌ Entry cannot be claimed:', entry.nick_name);
      return false;
    }

    if (entry.has_pending_claim) {
      console.log('❌ Entry has pending claim:', entry.nick_name);
      return false;
    }

    // For legacy entries, always show claim button if user is logged in
    if (entry.user_type === 'legacy') {
      console.log('✅ Can claim legacy entry:', entry.nick_name);
      return true;
    }

    console.log('❌ Not a legacy entry:', entry.nick_name);
    return false;
  };

  const handleClaimClick = (entry: LeaderboardEntry) => {
    console.log('🎁 Opening legacy code claim modal for:', entry.nick_name);
    setSelectedEntry(entry);
    setIsLegacyCodeModalOpen(true);
  };

  const handleLegacyCodeClaimSuccess = () => {
    console.log('🎉 Legacy code claim successful, refreshing leaderboard...');
    loadData(); // Refresh leaderboard data
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
    <div className='bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-2xl p-6 backdrop-blur-sm border border-gray-700'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg'>
            <Crown className='h-6 w-6 text-white' />
          </div>
          <h2 className='text-2xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent'>
            BXH SABO 
          </h2>
        </div>
        <button
          onClick={() => setShowOnlyUnclaimed(!showOnlyUnclaimed)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
            showOnlyUnclaimed
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
          }`}
        >
          <Target className='w-4 h-4' />
          {showOnlyUnclaimed ? 'Hiện tất cả' : 'Chưa nhận'}
        </button>
      </div>

      {/* Cách bước - Moved to top */}
      <div className='mb-6 text-xs text-gray-300 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-600 rounded-xl p-4'>
        <p className='font-semibold mb-3 text-white flex items-center gap-2'>
  
      
        </p>
        <ul className='space-y-2'>
          <li className='flex items-start gap-2'>
            <span className='flex-shrink-0 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>1</span>
            <span><strong className='text-orange-300'></strong> Click hộp quà 🎁 bên cạnh tên bạn</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>2</span>
            <span><strong className='text-blue-300'></strong> Nhập mã CODE mà SABO đã gửi cho bạn</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>3</span>
            <span><strong className='text-green-300'></strong> Điểm SPA sẽ được cộng ngay lập tức</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>💡</span>
            <span><strong className='text-purple-300'></strong> SABO sẽ gửi CODE cho các Player có tên trong BXH qua Facebook hoặc player có thể chủ động liên hệ với SABO qua thông tin liên hệ để nhận CODE</span>
          </li>
          <li className='flex items-start gap-2'>

          </li>
          <li className='flex items-start gap-2'>
            <div>
              <strong className='text-green-300'>Hỗ trợ trực tiếp:</strong> 
              <a href="tel:0793259316" className="text-blue-400 hover:text-blue-300 underline ml-1">📞 0793259316</a> 
              <span className='text-gray-400'> hoặc </span>
              <a href="https://www.facebook.com/ben.huynh.99999" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">💬 Messenger</a>
            </div>
          </li>
        </ul>
      </div>

      {/* Statistics - Hidden for cleaner UI */}
      {false && stats && (
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300'>
            <div className='flex items-center justify-center mb-2'>
              <Users className='h-6 w-6 text-blue-400 mr-2' />
              <p className='text-2xl font-bold text-blue-300'>
                {stats.total_players}
              </p>
            </div>
            <p className='text-sm text-blue-200'>Tổng players</p>
          </div>
          <div className='bg-gradient-to-br from-green-600/20 to-emerald-800/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300'>
            <div className='flex items-center justify-center mb-2'>
              <CheckCircle className='h-6 w-6 text-green-400 mr-2' />
              <p className='text-2xl font-bold text-green-300'>
                {stats.claimed_players}
              </p>
            </div>
            <p className='text-sm text-green-200'>Đã đăng ký</p>
          </div>
          <div className='bg-gradient-to-br from-yellow-600/20 to-orange-800/20 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300'>
            <div className='flex items-center justify-center mb-2'>
              <Clock className='h-6 w-6 text-yellow-400 mr-2' />
              <p className='text-2xl font-bold text-yellow-300'>
                {stats.unclaimed_players}
              </p>
            </div>
            <p className='text-sm text-yellow-200'>Chờ đăng ký</p>
          </div>
        </div>
      )}

      {/* Legend - Hidden for cleaner UI */}
      {false && (
        <div className='flex flex-wrap gap-4 mb-4 text-sm'>
          <div className='flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-gray-600'>
            <div className='w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-green-300 rounded shadow-lg'></div>
            <span className='text-gray-200'>Đã đăng ký</span>
            <CheckCircle className='w-4 h-4 text-green-400' />
          </div>
          <div className='flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-gray-600'>
            <div className='w-4 h-4 bg-gradient-to-r from-gray-500 to-gray-600 border border-gray-400 rounded shadow-lg'></div>
            <span className='text-gray-200'>Chờ đăng ký</span>
            <Clock className='w-4 h-4 text-gray-400' />
          </div>
          <div className='flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-gray-600'>
            <div className='w-4 h-4 bg-gradient-to-r from-orange-400 to-yellow-500 border border-orange-300 rounded shadow-lg'></div>
            <span className='text-gray-200'>Đang xử lý claim</span>
            <Zap className='w-4 h-4 text-orange-400' />
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className='overflow-x-auto'>
        <div className='bg-gray-800/30 backdrop-blur-sm border border-gray-600 rounded-xl overflow-hidden'>
          <table className='min-w-full'>
            <thead className='bg-gradient-to-r from-gray-700/50 to-gray-800/50 backdrop-blur-sm sticky top-0 z-10'>
              <tr>
                <th className='px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16'>
                  <div className='flex items-center gap-1 md:gap-2'>
                    <Trophy className='w-3 h-3 md:w-4 md:h-4 text-yellow-400' />
                    <span className='hidden sm:inline'>Rank</span>
                    <span className='sm:hidden'>#</span>
                  </div>
                </th>
                <th className='px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                  <div className='flex items-center gap-1 md:gap-2'>
                    <Users className='w-3 h-3 md:w-4 md:h-4 text-blue-400' />
                    Player
                  </div>
                </th>
                <th className='px-2 md:px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider w-20'>
                  <div className='flex items-center justify-end gap-1 md:gap-2'>
                    <Star className='w-3 h-3 md:w-4 md:h-4 text-yellow-400' />
                    <span className='hidden sm:inline'>SPA</span>
                    <span className='sm:hidden'>SPA</span>
                  </div>
                </th>
                <th className='px-2 md:px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-16'>
                  <div className='flex items-center justify-center gap-1 md:gap-2'>
                    <Gift className='w-3 h-3 md:w-4 md:h-4 text-orange-400' />
                    <span className='hidden sm:inline'></span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-700/50 bg-gray-900/20'>
            {filteredEntries.map((entry, index) => (
              <tr
                key={entry.legacy_entry_id || entry.user_id || `entry-${index}`}
                className={`transition-all duration-300 hover:bg-gray-700/30 ${
                  entry.is_registered
                    ? 'bg-gray-800/20 border-l-4 border-green-500'
                    : entry.has_pending_claim
                    ? 'bg-orange-900/20 border-l-4 border-orange-500'
                    : 'bg-gray-800/10 border-l-4 border-gray-600'
                }`}
              >
                <td className='px-2 md:px-4 py-2 md:py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                  <div className='flex items-center gap-1 md:gap-2'>
                    {index === 0 && <Crown className='h-3 w-3 md:h-4 md:w-4 text-yellow-400' />}
                    {index === 1 && <Award className='h-3 w-3 md:h-4 md:w-4 text-gray-400' />}
                    {index === 2 && <Award className='h-3 w-3 md:h-4 md:w-4 text-orange-400' />}
                    <span className={`text-xs md:text-sm ${
                      index < 3 ? 'text-yellow-400 font-bold' : 'text-gray-300'
                    }`}>
                      #{index + 1}
                    </span>
                  </div>
                </td>
                <td className='px-2 md:px-4 py-2 md:py-4 whitespace-nowrap'>
                  <div className='min-w-0'>
                    <p className='text-xs md:text-sm font-medium text-gray-100 flex items-center gap-1 truncate'>
                      <span className='truncate'>{entry.nick_name || entry.full_name}</span>
                      {entry.is_registered && (
                        <CheckCircle className='w-3 h-3 md:w-4 md:h-4 text-green-400 flex-shrink-0' />
                      )}
                    </p>
                    <p className='text-xs text-gray-400 truncate hidden md:block'>
                      {entry.full_name}
                    </p>
                  </div>
                </td>
                <td className='px-2 md:px-4 py-2 md:py-4 whitespace-nowrap text-right'>
                  <div className='flex items-center justify-end gap-1 md:gap-2'>
                    <Star className='w-3 h-3 md:w-4 md:h-4 text-yellow-400' />
                    <span className='text-xs md:text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent'>
                      {entry.spa_points.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className='px-2 md:px-4 py-2 md:py-4 whitespace-nowrap text-center text-sm'>
                  {entry.is_registered ? (
                    <span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-600/20 text-green-300 border border-green-500/30 backdrop-blur-sm'>
                      <CheckCircle className='w-4 h-4' />
                    </span>
                  ) : entry.has_pending_claim ? (
                    <span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-600/20 text-orange-300 border border-orange-500/30 backdrop-blur-sm'>
                      <Clock className='w-4 h-4' />
                    </span>
                  ) : canUserClaim(entry) ? (
                    <Button
                      onClick={() => handleClaimClick(entry)}
                      size="sm"
                      className='w-8 h-8 p-0 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 rounded-full'
                    >
                      <Gift className='w-4 h-4' />
                    </Button>
                  ) : (
                    <span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-gray-600/20 to-gray-700/20 text-gray-400 border border-gray-600/30 backdrop-blur-sm'>
                      <Clock className='w-4 h-4' />
                    </span>
                  )}
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEntries.length === 0 && (
        <div className='text-center py-8'>
          <p className='text-gray-400'>Không có dữ liệu hiển thị.</p>
        </div>
      )}

      {/* Legacy Code Claim Modal */}
      <LegacyGiftCodeModal
        isOpen={isLegacyCodeModalOpen}
        onClose={() => setIsLegacyCodeModalOpen(false)}
        playerName={selectedEntry?.nick_name || selectedEntry?.full_name || ''}
        onSuccess={handleLegacyCodeClaimSuccess}
      />
    </div>
  );
};
