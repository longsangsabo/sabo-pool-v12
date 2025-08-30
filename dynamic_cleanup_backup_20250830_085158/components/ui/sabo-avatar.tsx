import React from 'react';
import { useRainbowAvatar } from '@/hooks/useRainbowAvatar';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import '@/styles/rainbow-avatar.css';

interface SaboAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'custom';
  showUpload?: boolean;
  onAvatarUpload?: (file: File) => Promise<void>;
  fallbackName?: string;
  isUploading?: boolean;
  profile?: any; // Thêm profile prop để truyền từ parent
}

export const SaboAvatar: React.FC<SaboAvatarProps> = ({
  className,
  size = 'xl',
  showUpload = true,
  onAvatarUpload,
  fallbackName,
  isUploading = false,
  profile,
}) => {
  const { avatar, actions, fallbackUrl, isVerified } = useRainbowAvatar();
  const { theme } = useTheme();

  // Force re-render when variant changes
  const [renderKey, setRenderKey] = React.useState(0);
  React.useEffect(() => {
    setRenderKey(prev => prev + 1);
    // Force browser to repaint immediately
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        // Trigger a reflow
        document.body.offsetHeight;
      });
    }
  }, [avatar.variant, avatar.frameType, avatar.intensity, avatar.speed]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (onAvatarUpload) {
      await onAvatarUpload(file);
    } else {
      await actions.uploadAvatar(file);
    }

    event.target.value = ''; // Reset input
  };

  const renderOctagonFrame = () => (
    <svg
      key={`octagon-svg-${avatar.variant}-${renderKey}`}
      viewBox='0 0 400 400'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-full h-full'
    >
      <defs key={`octagon-defs-${avatar.variant}-${renderKey}`}>
        {(profile?.verified_rank || isVerified) && (
          <mask id={`octagon-frame-mask-${renderKey}`}>
            <rect width='400' height='400' fill='white' />
            <circle cx='350' cy='360' r='35' fill='black' />
          </mask>
        )}

        {/* Rainbow gradient cho hiệu ứng rainbow */}
        <linearGradient
          id={`octagon-rainbowGradient1-${renderKey}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#ff4646'>
            <animate
              attributeName='stop-color'
              values='#ff4646;#ffb446;#64ff64;#4682ff;#b446ff;#ff46b4;#ff4646'
              dur='6s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='50%' stopColor='#4682ff'>
            <animate
              attributeName='stop-color'
              values='#4682ff;#b446ff;#ff46b4;#ff4646;#ffb446;#64ff64;#4682ff'
              dur='6s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='100%' stopColor='#ff4646'>
            <animate
              attributeName='stop-color'
              values='#ff4646;#ffb446;#64ff64;#4682ff;#b446ff;#ff46b4;#ff4646'
              dur='6s'
              repeatCount='indefinite'
            />
          </stop>
        </linearGradient>
        <linearGradient
          id={`octagon-rainbowGradient2-${renderKey}`}
          x1='100%'
          y1='0%'
          x2='0%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#64ff64'>
            <animate
              attributeName='stop-color'
              values='#64ff64;#4682ff;#b446ff;#ff46b4;#ff4646;#ffb446;#64ff64'
              dur='6s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='50%' stopColor='#ff46b4'>
            <animate
              attributeName='stop-color'
              values='#ff46b4;#ff4646;#ffb446;#64ff64;#4682ff;#b446ff;#ff46b4'
              dur='6s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='100%' stopColor='#64ff64'>
            <animate
              attributeName='stop-color'
              values='#64ff64;#4682ff;#b446ff;#ff46b4;#ff4646;#ffb446;#64ff64'
              dur='6s'
              repeatCount='indefinite'
            />
          </stop>
        </linearGradient>

        {/* Platinum Elite gradient */}
        <linearGradient
          id={`octagon-platinumGradient1-${renderKey}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#f0f0f0'>
            <animate
              attributeName='stop-color'
              values='#f0f0f0;#ffffff;#e6e6e6;#fafafa;#f0f0f0'
              dur='8s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='50%' stopColor='#ffffff'>
            <animate
              attributeName='stop-color'
              values='#ffffff;#e6e6e6;#fafafa;#f0f0f0;#ffffff'
              dur='8s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='100%' stopColor='#e6e6e6'>
            <animate
              attributeName='stop-color'
              values='#e6e6e6;#fafafa;#f0f0f0;#ffffff;#e6e6e6'
              dur='8s'
              repeatCount='indefinite'
            />
          </stop>
        </linearGradient>
        <linearGradient
          id={`octagon-platinumGradient2-${renderKey}`}
          x1='100%'
          y1='0%'
          x2='0%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#fafafa'>
            <animate
              attributeName='stop-color'
              values='#fafafa;#f0f0f0;#ffffff;#e6e6e6;#fafafa'
              dur='8s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='50%' stopColor='#f0f0f0'>
            <animate
              attributeName='stop-color'
              values='#f0f0f0;#ffffff;#e6e6e6;#fafafa;#f0f0f0'
              dur='8s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='100%' stopColor='#ffffff'>
            <animate
              attributeName='stop-color'
              values='#ffffff;#e6e6e6;#fafafa;#f0f0f0;#ffffff'
              dur='8s'
              repeatCount='indefinite'
            />
          </stop>
        </linearGradient>

        {/* Diamond Silver gradient */}
        <linearGradient
          id={`octagon-diamondGradient1-${renderKey}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#c8c8c8'>
            <animate
              attributeName='stop-color'
              values='#c8c8c8;#ffffff;#b4b4b4;#f0f0f0;#c8c8c8'
              dur='6s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='25%' stopColor='#ffffff' />
          <stop offset='50%' stopColor='#b4b4b4'>
            <animate
              attributeName='stop-color'
              values='#b4b4b4;#f0f0f0;#c8c8c8;#ffffff;#b4b4b4'
              dur='6s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='75%' stopColor='#ffffff' />
          <stop offset='100%' stopColor='#c8c8c8' />
        </linearGradient>
        <linearGradient
          id={`octagon-diamondGradient2-${renderKey}`}
          x1='100%'
          y1='0%'
          x2='0%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#f0f0f0'>
            <animate
              attributeName='stop-color'
              values='#f0f0f0;#c8c8c8;#ffffff;#b4b4b4;#f0f0f0'
              dur='6s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='25%' stopColor='#b4b4b4' />
          <stop offset='50%' stopColor='#ffffff' />
          <stop offset='75%' stopColor='#c8c8c8' />
          <stop offset='100%' stopColor='#f0f0f0' />
        </linearGradient>

        {/* Chrome Metal gradient */}
        <linearGradient
          id={`octagon-chromeGradient1-${renderKey}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='0%'
        >
          <stop offset='0%' stopColor='#c0c0c0' />
          <stop offset='25%' stopColor='#ffffff'>
            <animate
              attributeName='offset'
              values='25%;75%;25%'
              dur='4s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='50%' stopColor='#dcdcdc' />
          <stop offset='75%' stopColor='#ffffff'>
            <animate
              attributeName='offset'
              values='75%;25%;75%'
              dur='4s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='100%' stopColor='#c0c0c0' />
        </linearGradient>
        <linearGradient
          id={`octagon-chromeGradient2-${renderKey}`}
          x1='100%'
          y1='0%'
          x2='0%'
          y2='0%'
        >
          <stop offset='0%' stopColor='#dcdcdc' />
          <stop offset='50%' stopColor='#ffffff' />
          <stop offset='100%' stopColor='#c0c0c0' />
        </linearGradient>

        {/* Frost Silver gradient */}
        <radialGradient
          id={`octagon-frostGradient1-${renderKey}`}
          cx='50%'
          cy='50%'
        >
          <stop offset='0%' stopColor='#f0f8ff'>
            <animate
              attributeName='stop-color'
              values='#f0f8ff;#dce6f0;#c8d5e6;#b4c4dc;#f0f8ff'
              dur='10s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='50%' stopColor='#dce6f0' />
          <stop offset='100%' stopColor='#c8d5e6'>
            <animate
              attributeName='stop-color'
              values='#c8d5e6;#b4c4dc;#f0f8ff;#dce6f0;#c8d5e6'
              dur='10s'
              repeatCount='indefinite'
            />
          </stop>
        </radialGradient>
        <radialGradient
          id={`octagon-frostGradient2-${renderKey}`}
          cx='30%'
          cy='30%'
        >
          <stop offset='0%' stopColor='#ffffff' />
          <stop offset='100%' stopColor='#c8d5e6' />
        </radialGradient>

        {/* White Gold gradient */}
        <linearGradient
          id={`octagon-whiteGoldGradient1-${renderKey}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#fffaf0'>
            <animate
              attributeName='stop-color'
              values='#fffaf0;#fffff5;#fff8dc;#fffded;#fffaf0'
              dur='7s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='25%' stopColor='#ffd700' opacity='0.3' />
          <stop offset='50%' stopColor='#fff8dc' />
          <stop offset='75%' stopColor='#ffd700' opacity='0.2' />
          <stop offset='100%' stopColor='#fffaf0' />
        </linearGradient>
        <linearGradient
          id={`octagon-whiteGoldGradient2-${renderKey}`}
          x1='100%'
          y1='0%'
          x2='0%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#fffded' />
          <stop offset='50%' stopColor='#fffff5' />
          <stop offset='100%' stopColor='#fff8dc' />
        </linearGradient>

        {/* Silver Holographic gradient */}
        <linearGradient
          id={`octagon-holoGradient1-${renderKey}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#c8c8c8'>
            <animate
              attributeName='stop-color'
              values='#c8c8c8;#ffb4b4;#b4ffb4;#b4b4ff;#ffffb4;#ffb4ff;#c8c8c8'
              dur='5s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='16.66%' stopColor='#ffb4b4' />
          <stop offset='33.33%' stopColor='#b4ffb4' />
          <stop offset='50%' stopColor='#b4b4ff' />
          <stop offset='66.66%' stopColor='#ffffb4' />
          <stop offset='83.33%' stopColor='#ffb4ff' />
          <stop offset='100%' stopColor='#c8c8c8' />
        </linearGradient>
        <linearGradient
          id={`octagon-holoGradient2-${renderKey}`}
          x1='100%'
          y1='0%'
          x2='0%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#e0e0e0' />
          <stop offset='50%' stopColor='#c8c8c8' />
          <stop offset='100%' stopColor='#f0f0f0' />
        </linearGradient>
      </defs>
      <g
        mask={
          profile?.verified_rank || isVerified
            ? `url(#octagon-frame-mask-${renderKey})`
            : undefined
        }
      >
        <polygon
          points='50,10 350,10 390,50 390,350 350,390 50,390 10,350 10,50'
          stroke={
            avatar.variant === 'rainbow'
              ? `url(#octagon-rainbowGradient1-${renderKey})`
              : avatar.variant === 'platinum-elite'
                ? `url(#octagon-platinumGradient1-${renderKey})`
                : avatar.variant === 'diamond-silver'
                  ? `url(#octagon-diamondGradient1-${renderKey})`
                  : avatar.variant === 'chrome-metal'
                    ? `url(#octagon-chromeGradient1-${renderKey})`
                    : avatar.variant === 'frost-silver'
                      ? `url(#octagon-frostGradient1-${renderKey})`
                      : avatar.variant === 'white-gold'
                        ? `url(#octagon-whiteGoldGradient1-${renderKey})`
                        : avatar.variant === 'silver-holographic'
                          ? `url(#octagon-holoGradient1-${renderKey})`
                          : frameStroke
          }
          strokeWidth={
            [
              'rainbow',
              'platinum-elite',
              'diamond-silver',
              'chrome-metal',
              'frost-silver',
              'white-gold',
              'silver-holographic',
            ].includes(avatar.variant)
              ? '6'
              : '4'
          }
          fill='none'
          className={
            avatar.variant === 'rainbow'
              ? 'rainbow-frame-border'
              : [
                    'platinum-elite',
                    'diamond-silver',
                    'chrome-metal',
                    'frost-silver',
                    'white-gold',
                    'silver-holographic',
                  ].includes(avatar.variant)
                ? 'premium-frame-border'
                : ''
          }
        />
        <polygon
          points='0,80 80,0 320,0 400,80 400,320 320,400 80,400 0,320'
          stroke={
            avatar.variant === 'rainbow'
              ? `url(#octagon-rainbowGradient2-${renderKey})`
              : avatar.variant === 'platinum-elite'
                ? `url(#octagon-platinumGradient2-${renderKey})`
                : avatar.variant === 'diamond-silver'
                  ? `url(#octagon-diamondGradient2-${renderKey})`
                  : avatar.variant === 'chrome-metal'
                    ? `url(#octagon-chromeGradient2-${renderKey})`
                    : avatar.variant === 'frost-silver'
                      ? `url(#octagon-frostGradient2-${renderKey})`
                      : avatar.variant === 'white-gold'
                        ? `url(#octagon-whiteGoldGradient2-${renderKey})`
                        : avatar.variant === 'silver-holographic'
                          ? `url(#octagon-holoGradient2-${renderKey})`
                          : frameStroke
          }
          strokeWidth={
            [
              'rainbow',
              'platinum-elite',
              'diamond-silver',
              'chrome-metal',
              'frost-silver',
              'white-gold',
              'silver-holographic',
            ].includes(avatar.variant)
              ? '4'
              : '2'
          }
          fill='none'
          className={
            avatar.variant === 'rainbow'
              ? 'rainbow-frame-border-outer'
              : [
                    'platinum-elite',
                    'diamond-silver',
                    'chrome-metal',
                    'frost-silver',
                    'white-gold',
                    'silver-holographic',
                  ].includes(avatar.variant)
                ? 'premium-frame-border-outer'
                : ''
          }
        />
      </g>
    </svg>
  );

  const renderTechEdgeFrame = () => (
    <svg
      key={`tech-svg-${avatar.variant}-${renderKey}`}
      viewBox='0 0 400 400'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-full h-full'
    >
      <defs key={`tech-defs-${avatar.variant}-${renderKey}`}>
        {(profile?.verified_rank || isVerified) && (
          <mask id={`tech-frame-mask-${renderKey}`}>
            <rect width='400' height='400' fill='white' />
            <circle cx='350' cy='360' r='35' fill='black' />
          </mask>
        )}

        {/* Simple gradient for all effects */}
        <linearGradient
          id={`tech-gradient-${renderKey}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor='currentColor' stopOpacity='0.8' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0.4' />
        </linearGradient>
      </defs>

      {/* Tech Edge Simple Path */}
      <path
        d='M 60 20 L 340 20 L 380 60 L 380 340 L 340 380 L 60 380 L 20 340 L 20 60 Z'
        stroke='url(#tech-gradient-${renderKey})'
        strokeWidth='1'
        fill='none'
        className='tech-edge-outer'
        mask={
          profile?.verified_rank || isVerified
            ? `url(#tech-frame-mask-${renderKey})`
            : undefined
        }
      />
    </svg>
  );

  // Premium Octagon Frame - Luxury Portrait Style
  const renderPremiumOctagonFrame = () => (
    <svg
      key={`premium-svg-${avatar.variant}-${renderKey}`}
      viewBox='0 0 320 400'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-full h-full premium-octagon-frame'
    >
      <defs key={`premium-defs-${avatar.variant}-${renderKey}`}>
        {(profile?.verified_rank || isVerified) && (
          <mask id={`premium-frame-mask-${renderKey}`}>
            <rect width='320' height='400' fill='white' />
            <circle cx='280' cy='360' r='30' fill='black' />
          </mask>
        )}

        {/* Premium Gold Gradient */}
        <linearGradient
          id={`premium-gradient-${renderKey}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#FFD700' />
          <stop offset='25%' stopColor='#FFF8DC' />
          <stop offset='50%' stopColor='#FFFFFF' />
          <stop offset='75%' stopColor='#FFF8DC' />
          <stop offset='100%' stopColor='#FFD700' />
        </linearGradient>
      </defs>

      {/* Premium Octagon Path - Portrait ratio (320x400) */}
      <path
        d='M 50 0 L 270 0 L 320 50 L 320 120 L 300 140 L 300 260 L 320 280 L 320 350 L 270 400 L 50 400 L 0 350 L 0 280 L 20 260 L 20 140 L 0 120 L 0 50 Z'
        stroke='url(#premium-gradient-${renderKey})'
        strokeWidth='3'
        fill='none'
        className='premium-octagon-outer'
        mask={
          profile?.verified_rank || isVerified
            ? `url(#premium-frame-mask-${renderKey})`
            : undefined
        }
      />

      {/* Inner White Border - Matching inner path */}
      <path
        d='M 55 5 L 265 5 L 315 55 L 315 115 L 295 135 L 295 265 L 315 285 L 315 345 L 265 395 L 55 395 L 5 345 L 5 285 L 25 265 L 25 135 L 5 115 L 5 55 Z'
        stroke='#FFFFFF'
        strokeWidth='2'
        fill='none'
        className='premium-octagon-inner'
      />
    </svg>
  );

  // Render functions cho các frame types mới
  const renderHexagonFrame = () => (
    <svg
      viewBox='0 0 400 400'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-full h-full'
    >
      <defs>
        <linearGradient
          id={`hexagon-gradient-${renderKey}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#ff6b35'>
            <animate
              attributeName='stop-color'
              values='#ff6b35;#f7931e;#ffd23f;#06ffa5;#00d4ff;#7209b7;#ff6b35'
              dur='4s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='100%' stopColor='#7209b7'>
            <animate
              attributeName='stop-color'
              values='#7209b7;#ff6b35;#f7931e;#ffd23f;#06ffa5;#00d4ff;#7209b7'
              dur='4s'
              repeatCount='indefinite'
            />
          </stop>
        </linearGradient>
      </defs>
      <path
        d='M100 20 L300 20 L380 200 L300 380 L100 380 L20 200 Z'
        stroke={`url(#hexagon-gradient-${renderKey})`}
        strokeWidth='6'
        fill='none'
        className='hexagon-frame'
      />
    </svg>
  );

  const renderCrystalFrame = () => (
    <svg
      viewBox='0 0 400 400'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-full h-full'
    >
      <defs>
        <linearGradient
          id={`crystal-gradient-${renderKey}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor='rgba(255,255,255,0.9)' />
          <stop offset='50%' stopColor='rgba(200,255,255,0.7)' />
          <stop offset='100%' stopColor='rgba(150,200,255,0.5)' />
        </linearGradient>
      </defs>
      <path
        d='M200 10 L380 120 L320 350 L80 350 L20 120 Z'
        stroke={`url(#crystal-gradient-${renderKey})`}
        strokeWidth='4'
        fill='none'
        className='crystal-frame'
      />
    </svg>
  );

  const renderBladeFrame = () => (
    <svg
      viewBox='0 0 400 400'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-full h-full'
    >
      <defs>
        <linearGradient
          id={`blade-gradient-${renderKey}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#ff0040'>
            <animate
              attributeName='stop-color'
              values='#ff0040;#ff4000;#ffbf00;#40ff00;#0040ff;#ff0040'
              dur='3s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='100%' stopColor='#0040ff'>
            <animate
              attributeName='stop-color'
              values='#0040ff;#ff0040;#ff4000;#ffbf00;#40ff00;#0040ff'
              dur='3s'
              repeatCount='indefinite'
            />
          </stop>
        </linearGradient>
      </defs>
      <path
        d='M20 80 L80 20 L320 20 L380 80 L360 200 L380 320 L320 380 L80 380 L20 320 L40 200 Z'
        stroke={`url(#blade-gradient-${renderKey})`}
        strokeWidth='5'
        fill='none'
        className='blade-frame'
      />
    </svg>
  );

  const renderNeonCircuitFrame = () => (
    <svg
      viewBox='0 0 400 400'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-full h-full'
    >
      <defs>
        <linearGradient
          id={`neon-gradient-${renderKey}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#00ffff'>
            <animate
              attributeName='stop-color'
              values='#00ffff;#ff00ff;#ffff00;#00ff00;#00ffff'
              dur='2s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='100%' stopColor='#ff00ff'>
            <animate
              attributeName='stop-color'
              values='#ff00ff;#ffff00;#00ff00;#00ffff;#ff00ff'
              dur='2s'
              repeatCount='indefinite'
            />
          </stop>
        </linearGradient>
      </defs>
      <path
        d='M60 20 L340 20 L380 60 L380 340 L340 380 L60 380 L20 340 L20 60 Z'
        stroke={`url(#neon-gradient-${renderKey})`}
        strokeWidth='3'
        fill='none'
        className='neon-circuit-frame'
      />
      {/* Circuit lines */}
      <line
        x1='20'
        y1='200'
        x2='380'
        y2='200'
        stroke='#00ffff'
        strokeWidth='1'
        opacity='0.7'
      >
        <animate
          attributeName='opacity'
          values='0.7;1;0.7'
          dur='1s'
          repeatCount='indefinite'
        />
      </line>
      <line
        x1='200'
        y1='20'
        x2='200'
        y2='380'
        stroke='#ff00ff'
        strokeWidth='1'
        opacity='0.7'
      >
        <animate
          attributeName='opacity'
          values='0.7;1;0.7'
          dur='1s'
          repeatCount='indefinite'
        />
      </line>
    </svg>
  );

  const renderPlasmaRingFrame = () => (
    <svg
      viewBox='0 0 400 400'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-full h-full'
    >
      <defs>
        <radialGradient id={`plasma-gradient-${renderKey}`} cx='50%' cy='50%'>
          <stop offset='60%' stopColor='transparent' />
          <stop offset='70%' stopColor='rgba(255,0,128,0.8)'>
            <animate
              attributeName='stop-color'
              values='rgba(255,0,128,0.8);rgba(0,255,255,0.8);rgba(255,255,0,0.8);rgba(255,0,128,0.8)'
              dur='3s'
              repeatCount='indefinite'
            />
          </stop>
          <stop offset='80%' stopColor='transparent' />
        </radialGradient>
      </defs>
      <circle
        cx='200'
        cy='200'
        r='180'
        stroke={`url(#plasma-gradient-${renderKey})`}
        strokeWidth='8'
        fill='none'
        className='plasma-ring-frame'
      >
        <animateTransform
          attributeName='transform'
          type='rotate'
          values='0 200 200;360 200 200'
          dur='4s'
          repeatCount='indefinite'
        />
      </circle>
    </svg>
  );

  // Function để render frame theo type
  const renderFrame = () => {
    switch (avatar.frameType) {
      case 'octagon':
        return renderOctagonFrame();
      case 'tech-edge':
        return renderTechEdgeFrame();
      case 'premium-octagon':
        return renderPremiumOctagonFrame();
      case 'hexagon':
        return renderHexagonFrame();
      case 'crystal':
        return renderCrystalFrame();
      case 'blade':
        return renderBladeFrame();
      case 'neon-circuit':
        return renderNeonCircuitFrame();
      case 'plasma-ring':
        return renderPlasmaRingFrame();
      default:
        return renderPremiumOctagonFrame(); // Set premium-octagon as default
    }
  };

  // Tính toán màu shadow dựa trên theme
  const shadowColor =
    theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
  const frameStroke = theme === 'light' ? '#000' : '#fff';

  // Tạo avatar URL với fallback
  const avatarSrc =
    profile?.avatar_url ||
    avatar.url ||
    fallbackUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || 'User')}&background=random&size=400`;

  return (
    <div
      className={cn('sabo-avatar-container relative w-full h-full', className)}
      className="min-w-[100px] min-h-[100px]"
    >
      {/* Container với rainbow effect */}
      <div
        key={`container-${avatar.variant}-${renderKey}`}
        className={cn(
          'rainbow-avatar-container relative w-full h-full flex items-center justify-center transition-all duration-300',
          // Universal Effect System - Auto Integration
          `${avatar.variant}-variant`,
          `${avatar.frameType}-variant`,
          `intensity-${avatar.intensity}`,
          `speed-${avatar.speed}`,
          // Legacy support for existing variants
          avatar.variant === 'rainbow' && 'rainbow-variant',
          avatar.variant === 'glow' && 'glow-variant',
          avatar.variant === 'pulse' && 'pulse-variant',
          avatar.variant === 'shimmer' && 'shimmer-variant',
          avatar.variant === 'platinum-elite' && 'platinum-elite-variant',
          avatar.variant === 'diamond-silver' && 'diamond-silver-variant',
          avatar.variant === 'chrome-metal' && 'chrome-metal-variant',
          avatar.variant === 'frost-silver' && 'frost-silver-variant',
          avatar.variant === 'white-gold' && 'white-gold-variant',
          avatar.variant === 'silver-holographic' &&
            'silver-holographic-variant'
        )}
        style={
          {
            '--rainbow-intensity':
              avatar.intensity === 'subtle'
                ? '0.6'
                : avatar.intensity === 'intense'
                  ? '1.0'
                  : '0.8',
            '--animation-duration':
              avatar.speed === 'slow'
                ? '8s'
                : avatar.speed === 'fast'
                  ? '2s'
                  : '4s',
            '--rainbow-speed':
              avatar.speed === 'slow'
                ? '12s'
                : avatar.speed === 'fast'
                  ? '4s'
                  : '6s',
            '--rainbow-border-width': '3px',
            minWidth: '100px',
            minHeight: '100px',
          } as React.CSSProperties
        }
      >
        {/* Effects - chỉ giữ lại các effect chưa tích hợp vào SVG */}
        {avatar.variant === 'glow' && (
          <div key={`glow-${renderKey}`} className='glow-effect' />
        )}

        {avatar.variant === 'pulse' && (
          <div key={`pulse-${renderKey}`} className='pulse-effect' />
        )}

        {avatar.variant === 'shimmer' && (
          <div key={`shimmer-${renderKey}`} className='shimmer-effect' />
        )}

        {/* Avatar container với all frame types */}
        <div className='relative w-full h-full overflow-hidden'>
          {/* Frame Background Effects - render trước avatar */}
          {avatar.frameType === 'tech-edge' && (
            <>
              <div
                key={`tech-background-${renderKey}`}
                className='tech-edge-background'
                className="z-10"
              />
            </>
          )}

          {avatar.frameType === 'hexagon' && (
            <>
              <div
                key={`hexagon-background-${renderKey}`}
                className='hexagon-background'
                className="z-10"
              />
            </>
          )}

          {avatar.frameType === 'crystal' && (
            <>
              <div
                key={`crystal-background-${renderKey}`}
                className='crystal-background'
                className="z-10"
              />
            </>
          )}

          {avatar.frameType === 'blade' && (
            <>
              <div
                key={`blade-background-${renderKey}`}
                className='blade-background'
                className="z-10"
              />
            </>
          )}

          {avatar.frameType === 'neon-circuit' && (
            <>
              <div
                key={`circuit-background-${renderKey}`}
                className='circuit-background'
                className="z-10"
              />
            </>
          )}

          {avatar.frameType === 'plasma-ring' && (
            <>
              <div
                key={`plasma-background-${renderKey}`}
                className='plasma-background'
                className="z-10"
              />
            </>
          )}

          {/* Avatar Image - Fill entire Premium Octagon frame */}
          <img
            src={avatarSrc}
            alt='SABO Avatar'
            className='absolute object-cover'
            style={{
              top: avatar.frameType === 'premium-octagon' ? '3px' : '4px',
              left: avatar.frameType === 'premium-octagon' ? '3px' : '4px',
              width:
                avatar.frameType === 'premium-octagon'
                  ? 'calc(100% - 6px)'
                  : 'calc(100% - 8px)',
              height:
                avatar.frameType === 'premium-octagon'
                  ? 'calc(100% - 6px)'
                  : 'calc(100% - 8px)',
              clipPath: (() => {
                switch (avatar.frameType) {
                  case 'premium-octagon':
                    // Fill toàn bộ khung Premium Octagon - Portrait ratio (320x400)
                    return 'polygon(15.625% 0%, 84.375% 0%, 100% 12.5%, 100% 30%, 93.75% 35%, 93.75% 65%, 100% 70%, 100% 87.5%, 84.375% 100%, 15.625% 100%, 0% 87.5%, 0% 70%, 6.25% 65%, 6.25% 35%, 0% 30%, 0% 12.5%)';
                  case 'tech-edge':
                    return 'polygon(0% 10%, 12% 2%, 88% 2%, 100% 10%, 100% 23%, 96% 28%, 100% 33%, 100% 67%, 96% 72%, 100% 77%, 100% 90%, 88% 98%, 12% 98%, 0% 90%, 0% 77%, 4% 72%, 0% 67%, 0% 33%, 4% 28%, 0% 23%)';
                  case 'hexagon':
                    return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
                  case 'crystal':
                    return 'polygon(50% 0%, 100% 25%, 82% 75%, 18% 75%, 0% 25%)';
                  case 'blade':
                    return 'polygon(0% 20%, 20% 0%, 80% 0%, 100% 20%, 95% 50%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 5% 50%)';
                  case 'neon-circuit':
                    return 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)';
                  case 'plasma-ring':
                    return 'circle(45% at 50% 50%)';
                  case 'octagon':
                  default:
                    return 'polygon(15% 5%, 85% 5%, 95% 15%, 95% 85%, 85% 95%, 15% 95%, 5% 85%, 5% 15%)';
                }
              })(),
              transform:
                avatar.frameType === 'premium-octagon'
                  ? 'scale(1.0)'
                  : avatar.frameType === 'tech-edge'
                    ? 'scale(0.88)'
                    : 'scale(0.92)',
              transformOrigin: 'center',
              zIndex: 5,
            }}
            onError={e => {
              e.currentTarget.src =
                fallbackUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || 'User')}&background=random&size=400`;
            }}
          />

          {/* Frame Overlay Effects - render sau avatar */}
          {avatar.frameType === 'tech-edge' && (
            <>
              <div
                key={`tech-inner-${renderKey}`}
                className='tech-edge-inner-accent'
                className="z-20"
              />
              <div
                key={`tech-outer-${renderKey}`}
                className='tech-edge-outer-border'
                className="z-20"
              />
              <div
                key={`tech-corners-${renderKey}`}
                className='tech-edge-corner-accents'
                className="z-20"
              />
              <div
                key={`tech-sides-${renderKey}`}
                className='tech-edge-side-accents'
                className="z-20"
              />
            </>
          )}

          {avatar.frameType === 'hexagon' && (
            <>
              <div
                key={`hexagon-inner-${renderKey}`}
                className='hexagon-inner-glow'
                className="z-20"
              />
            </>
          )}

          {avatar.frameType === 'crystal' && (
            <>
              <div
                key={`crystal-facets-${renderKey}`}
                className='crystal-facets'
                className="z-20"
              />
            </>
          )}

          {avatar.frameType === 'blade' && (
            <>
              <div
                key={`blade-edge-${renderKey}`}
                className='blade-edge'
                className="z-20"
              />
            </>
          )}

          {avatar.frameType === 'neon-circuit' && (
            <>
              <div
                key={`circuit-lines-${renderKey}`}
                className='circuit-lines'
                className="z-20"
              />
            </>
          )}

          {avatar.frameType === 'plasma-ring' && (
            <>
              <div
                key={`plasma-core-${renderKey}`}
                className='plasma-core'
                className="z-20"
              />
            </>
          )}
        </div>

        {/* SVG Frame overlay - render tùy theo frameType */}
        <div className='absolute inset-0 w-full h-full pointer-events-none'>
          {renderFrame()}
        </div>

        {/* Verified Stamp */}
        {(profile?.verified_rank || isVerified) && (
          <div
            className='stamp absolute bottom-[-35px] right-[-10px] w-[32%] h-auto z-30'
            style={{ filter: `drop-shadow(0 0 6px ${shadowColor})` }}
          >
            <img
              src='https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/logo//certified-sabo-arena.png'
              alt='Certified SABO ARENA'
              className='w-full h-full object-contain'
            />
          </div>
        )}
      </div>

      {/* Upload button */}
      {showUpload && (
        <div className='absolute bottom-0 right-0'>
          <input
            type='file'
            accept='image/*'
            onChange={handleFileUpload}
            className='hidden'
            id='avatar-upload'
            disabled={isUploading || avatar.isUploading}
          />
          <label
            htmlFor='avatar-upload'
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all',
              theme === 'light'
                ? 'bg-white border border-neutral-300 hover:bg-neutral-50'
                : 'bg-neutral-800 border border-gray-600 hover:bg-gray-700',
              (isUploading || avatar.isUploading) &&
                'opacity-50 cursor-not-allowed'
            )}
          >
            <Camera className='w-4 h-4' />
          </label>
        </div>
      )}
    </div>
  );
};
