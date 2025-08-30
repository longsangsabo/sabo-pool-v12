import { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Check,
  X,
  Crop,
  Crown,
  Diamond,
  BarChart3,
  Swords,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getRankDisplay } from '@sabo/shared-utils';
import './card-avatar.css';

interface CardAvatarProps {
  userAvatar?: string | undefined;
  onAvatarChange?: (file: File, croppedDataUrl?: string) => void;
  uploading?: boolean;
  nickname?: string;
  rank?: string;
  elo?: number;
  spa?: number;
  ranking?: number;
  matches?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const CardAvatar: React.FC<CardAvatarProps> = ({
  userAvatar,
  onAvatarChange,
  uploading = false,
  nickname = 'Người chơi',
  rank = 'K',
  elo = 1000,
  spa = 0,
  ranking = 0,
  matches = 0,
  className = '',
  size = 'md',
  onClick,
}) => {
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Size configurations
  const sizeConfig = {
    sm: { width: 'w-[200px]', height: 'h-[320px]' },
    md: { width: 'w-[280px]', height: 'h-[400px]' },
    lg: { width: 'w-[320px]', height: 'h-[460px]' },
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
      return;
    }

    if (onAvatarChange) {
      onAvatarChange(file);
    }
  };

  const currentAvatar = croppedImage || userAvatar;
  
  console.log('🎯 CardAvatar - userAvatar:', userAvatar);
  console.log('🎯 CardAvatar - croppedImage:', croppedImage);
  console.log('🎯 CardAvatar - currentAvatar:', currentAvatar);

  return (
    <div 
      className={`card-avatar-container ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div
        className={`card-avatar-frame ${sizeConfig[size].width} ${sizeConfig[size].height}`}
      >
        {/* Dark Card Border */}
        <div className='card-border'>
          {/* Main Image Area with Nickname Overlay */}
          <div
            className='image-area'
            onClick={onAvatarChange ? () => fileInputRef.current?.click() : undefined}
            style={{ cursor: onAvatarChange ? 'pointer' : 'default' }}
          >
            {currentAvatar && currentAvatar.trim() !== '' ? (
              <img 
                src={currentAvatar} 
                alt='Avatar' 
                className='avatar-image'
                onError={(e) => {
                  console.error('❌ Avatar load error:', currentAvatar);
                  // Hide the broken image and show placeholder
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const placeholder = target.parentElement?.querySelector('.avatar-placeholder');
                  if (placeholder) {
                    (placeholder as HTMLElement).style.display = 'flex';
                  }
                }}
                onLoad={() => {
                  console.log('✅ Avatar loaded successfully:', currentAvatar);
                }}
                style={{ 
                  backgroundColor: 'transparent',
                  display: 'block',
                  position: 'relative',
                  zIndex: 2
                }}
              />
            ) : null}
            
            {/* Always render placeholder, but hide it when avatar loads successfully */}
            <div 
              className='avatar-placeholder'
              style={{ 
                display: (currentAvatar && currentAvatar.trim() !== '') ? 'none' : 'flex',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1
              }}
            >
              <div className='placeholder-content'>
                <Camera className='w-8 h-8 text-gray-400 mb-2' />
                <p className='text-body-small text-gray-400 font-medium'>Đổi ảnh</p>
              </div>
            </div>

            {/* Nickname Overlay */}
            {currentAvatar && (
              <div className='nickname-overlay'>
                <div
                  className='nickname-text-overlay'
                  style={{
                    fontFamily:
                      "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif",
                    fontWeight: 900, // font-black equivalent
                    fontSize: '2rem', // Tăng lên 2rem cho rõ ràng hơn
                    lineHeight: 1.1, // Tăng line-height cho tiếng Việt
                    background:
                      'linear-gradient(to right, #1d4ed8, #7c3aed, #1e40af, #ffffff)', // Thêm white để sáng hơn
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '0.02em', // Giảm letter-spacing cho tiếng Việt
                    textTransform: 'uppercase',
                    filter: 'brightness(1.1)', // Giảm xuống +10%
                  }}
                >
                  {nickname}
                </div>
              </div>
            )}

            {/* Upload Overlay */}
            {uploading && (
              <div className='upload-overlay'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-white'></div>
                <span className='text-body-small text-white font-medium'>
                  Đang tải...
                </span>
              </div>
            )}
          </div>

          {/* Camera Button - Outside card corner */}
          {!uploading && onAvatarChange && (
            <div
              className='camera-button'
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className='camera-icon' />
            </div>
          )}

          {/* Rank Section */}
          <div className='rank-section'>
            {(() => {
              const rankDisplay = getRankDisplay(rank);
              return (
                <div
                  className='rank-badge'
                  data-rank={rank.toUpperCase()}
                  style={{
                    background: rankDisplay.gradient,
                    color: '#ffffff',
                    border: `1px solid ${rankDisplay.borderColor}`,
                    textShadow: rankDisplay.textShadow,
                  }}
                  aria-label={`Hạng ${rankDisplay.displayText}`}
                >
                  <span className='rank-label-text'>
                    RANK : {rank.toUpperCase()}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Stats Row */}
          <div className='stats-row'>
            <div className='stat-item'>
              <Crown
                className='stat-icon'
                style={{
                  color: '#1f2937',
                  stroke: '#1f2937',
                  fill: '#1f2937',
                  width: '16px',
                  height: '16px',
                  margin: '0 auto 4px',
                }}
              />
              <div className='stat-label'>ELO</div>
              <div className='stat-value'>{elo}</div>
            </div>
            <div className='stat-item'>
              <Diamond
                className='stat-icon'
                style={{
                  color: '#1f2937',
                  stroke: '#1f2937',
                  fill: '#1f2937',
                  width: '16px',
                  height: '16px',
                  margin: '0 auto 4px',
                }}
              />
              <div className='stat-label'>SPA</div>
              <div className='stat-value'>{spa}</div>
            </div>
            <div className='stat-item'>
              <BarChart3
                className='stat-icon'
                style={{
                  color: '#1f2937',
                  stroke: '#1f2937',
                  fill: '#1f2937',
                  width: '16px',
                  height: '16px',
                  margin: '0 auto 4px',
                }}
              />
              <div className='stat-label'>XH</div>
              <div className='stat-value'>{ranking > 0 ? `#${ranking}` : 'N/A'}</div>
            </div>
            <div className='stat-item'>
              <Swords
                className='stat-icon'
                style={{
                  color: '#1f2937',
                  stroke: '#1f2937',
                  fill: '#1f2937',
                  width: '16px',
                  height: '16px',
                  margin: '0 auto 4px',
                }}
              />
              <div className='stat-label'>TRẬN</div>
              <div className='stat-value'>{matches}</div>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleFileSelect}
          className='hidden'
          disabled={uploading}
        />
      </div>
    </div>
  );
};

export default CardAvatar;
