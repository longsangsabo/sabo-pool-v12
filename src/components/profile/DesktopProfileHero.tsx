import React from 'react';
import CardAvatar from '@/components/ui/card-avatar';
import DarkCardAvatar from '@/components/ui/dark-card-avatar';
import { ProfileStats } from './responsive/ProfileStats';
import { Button } from '@/components/ui/button';
import { Shield, Building, Pencil, Users as UsersIcon } from 'lucide-react';

interface DesktopProfileHeroProps {
  profile: any;
  theme: string;
  uploading: boolean;
  onAvatarUpload: (file: File) => void;
  onEdit: () => void;
  onRequestRank: () => void;
  onNavigateClub?: () => void;
  onNavigateRank?: () => void;
  onNavigateCommunity?: () => void;
}

export const DesktopProfileHero: React.FC<DesktopProfileHeroProps> = ({
  profile,
  theme,
  uploading,
  onAvatarUpload,
  onEdit,
  onRequestRank,
  onNavigateClub,
  onNavigateRank,
  onNavigateCommunity,
}) => {
  return (
    <section aria-labelledby='profile-hero-heading' className='w-full'>
      <h1 id='profile-hero-heading' className='sr-only'>
        Hồ sơ người chơi
      </h1>
      <div
        className={`relative overflow-hidden rounded-2xl border p-6 md:p-8 transition-colors backdrop-blur-sm
          ${
            theme === 'dark'
              ? 'bg-slate-900/50 border-slate-700/60'
              : 'bg-white border-slate-200'
          }
        `}
      >
        <div className='pointer-events-none absolute inset-0 rounded-2xl [mask-image:radial-gradient(circle_at_top_left,white,transparent_70%)] bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10' />
        <div className='relative z-10 flex flex-col md:flex-row md:items-end gap-10'>
          <div className='flex justify-center md:justify-start'>
            <div
              className={`relative rounded-2xl p-[2px] ${theme === 'dark' ? 'bg-gradient-to-br from-blue-500/60 via-indigo-500/40 to-transparent' : 'bg-gradient-to-br from-blue-300 via-blue-100 to-transparent'}`}
            >
              <div
                className={`rounded-[14px] ${theme === 'dark' ? 'bg-slate-950/60' : 'bg-white'} backdrop-blur-sm`}
              >
                {theme === 'dark' ? (
                  <DarkCardAvatar
                    userAvatar={profile?.avatar_url}
                    onAvatarChange={onAvatarUpload}
                    uploading={uploading}
                    nickname={
                      profile?.display_name || profile?.full_name || 'USER'
                    }
                    rank={profile?.verified_rank || 'K'}
                    elo={
                      profile?.win_percentage
                        ? Math.round(profile.win_percentage * 10)
                        : 0
                    }
                    spa={profile?.spa_points || 0}
                    ranking={profile?.current_ranking || 0}
                    matches={profile?.matches_played || 0}
                    size='md'
                    className='md:mr-0'
                  />
                ) : (
                  <CardAvatar
                    userAvatar={profile?.avatar_url}
                    onAvatarChange={onAvatarUpload}
                    uploading={uploading}
                    nickname={
                      profile?.display_name || profile?.full_name || 'USER'
                    }
                    rank={profile?.verified_rank || 'K'}
                    elo={
                      profile?.win_percentage
                        ? Math.round(profile.win_percentage * 10)
                        : 0
                    }
                    spa={profile?.spa_points || 0}
                    ranking={profile?.current_ranking || 0}
                    matches={profile?.matches_played || 0}
                    size='md'
                    className='md:mr-0'
                  />
                )}
              </div>
            </div>
          </div>
          <div className='flex-1'>
            <ProfileStats profile={profile} />
            {/* Consolidated action buttons (replacing removed Quick Actions sidebar) */}
            <div className='mt-5 flex flex-wrap gap-3'>
              <Button
                size='sm'
                variant='outline'
                onClick={onEdit}
                className='flex items-center gap-1'
              >
                <Pencil className='w-3.5 h-3.5' /> Chỉnh sửa
              </Button>
              <Button
                size='sm'
                variant='secondary'
                onClick={onNavigateClub}
                className='flex items-center gap-1'
              >
                <Building className='w-3.5 h-3.5' /> CLB
              </Button>
              <Button
                size='sm'
                variant='secondary'
                onClick={onNavigateRank}
                className='flex items-center gap-1'
              >
                <Shield className='w-3.5 h-3.5' /> Hạng
              </Button>
              <Button
                size='sm'
                variant='secondary'
                onClick={onNavigateCommunity}
                className='flex items-center gap-1'
              >
                <UsersIcon className='w-3.5 h-3.5' /> Cộng đồng
              </Button>
              <Button size='sm' onClick={onRequestRank}>
                Yêu cầu thay đổi hạng
              </Button>
            </div>
            {/* Inline badges (tránh trùng lặp với Info Card bị loại bỏ) */}
            <div className='mt-4 flex flex-wrap gap-2'>
              {profile?.verified_rank && (
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${
                    theme === 'dark'
                      ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  RANK: {profile.verified_rank}
                </span>
              )}
              {profile?.role === 'admin' && (
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 border ${
                    theme === 'dark'
                      ? 'bg-red-500/10 text-red-300 border-red-500/30'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  ADMIN
                </span>
              )}
              {profile?.club_profile && (
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 border ${
                    theme === 'dark'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  CLB OWNER
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesktopProfileHero;
