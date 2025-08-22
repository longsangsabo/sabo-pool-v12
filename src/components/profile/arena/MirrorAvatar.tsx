import React from 'react';

interface MirrorAvatarProps {
  avatarUrl?: string;
  username: string;
  rank: string;
  className?: string;
}

export const MirrorAvatar: React.FC<MirrorAvatarProps> = ({
  avatarUrl,
  username,
  rank,
  className,
}) => {
  const safeName = username || 'Người chơi';
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(safeName)}`;
  const displayAvatar = avatarUrl || defaultAvatar;

  return (
    <div className={className}>
      <div className='avatar-mirror-container-fixed relative'>
        {/* Left mirror avatars - fading */}
        <div className='avatar-mirror-left'>
          <img 
            src={displayAvatar} 
            alt={safeName} 
            className='mirror-avatar-3' 
            loading="lazy"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
          <img 
            src={displayAvatar} 
            alt={safeName} 
            className='mirror-avatar-2' 
            loading="lazy"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
          <img 
            src={displayAvatar} 
            alt={safeName} 
            className='mirror-avatar-1' 
            loading="lazy"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        </div>

        {/* Center main avatar */}
        <div className='avatar-main-wrapper'>
          <img 
            src={displayAvatar} 
            alt={safeName} 
            className='avatar-main' 
            loading="lazy"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        </div>

        {/* Right mirror avatars - fading */}
        <div className='avatar-mirror-right'>
          <img 
            src={displayAvatar} 
            alt={safeName} 
            className='mirror-avatar-1' 
            loading="lazy"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
          <img 
            src={displayAvatar} 
            alt={safeName} 
            className='mirror-avatar-2' 
            loading="lazy"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
          <img 
            src={displayAvatar} 
            alt={safeName} 
            className='mirror-avatar-3' 
            loading="lazy"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        </div>
      </div>

      {/* User Info Section */}
      <div className='user-info-section'>
        <h1 className='username-display'>{safeName}</h1>
        <div className='rank-badge-display'>
          <span className='rank-text'>{rank}</span>
        </div>
      </div>
    </div>
  );
};

export default MirrorAvatar;
