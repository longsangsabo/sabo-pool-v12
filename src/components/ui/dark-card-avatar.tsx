import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, X, Crop, Trophy, Star, TrendingUp, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import './dark-card-avatar.css';

interface DarkCardAvatarProps {
  userAvatar?: string | null;
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
}

const DarkCardAvatar: React.FC<DarkCardAvatarProps> = ({
  userAvatar,
  onAvatarChange,
  uploading = false,
  nickname = 'NICK NAME',
  rank = 'G',
  elo = 1200,
  spa = 250,
  ranking = 156,
  matches = 24,
  className = '',
  size = 'md'
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
    lg: { width: 'w-[320px]', height: 'h-[460px]' }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
      return;
    }

    if (onAvatarChange) {
      onAvatarChange(file);
    }
  };

  const currentAvatar = croppedImage || userAvatar;

  return (
    <div className={`dark-card-avatar-container ${className}`}>
      <div className={`dark-card-avatar-frame ${sizeConfig[size].width} ${sizeConfig[size].height}`}>
        {/* Dark Card Border */}
        <div className="dark-card-border">
          {/* Main Image Area with Nickname Overlay */}
          <div 
            className="dark-image-area"
            onClick={() => fileInputRef.current?.click()}
          >
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt='Avatar'
                className='dark-avatar-image'
              />
            ) : (
              <div className='dark-avatar-placeholder'>
                <div className="dark-placeholder-content">
                  <Camera className="w-8 h-8 text-gray-400 mb-2" />
                  <p className='text-sm text-gray-400 font-medium'>Đổi ảnh</p>
                </div>
              </div>
            )}

            {/* Nickname Overlay */}
            {currentAvatar && (
              <div className="dark-nickname-overlay">
                <div className="dark-nickname-text-overlay">
                  {nickname}
                </div>
              </div>
            )}

                        {/* Upload Overlay */}
            {uploading && (
              <div className="dark-upload-overlay">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className='text-sm text-white font-medium'>Đang tải...</span>
              </div>
            )}
          </div>

          {/* Camera Button - Outside card corner */}
          {!uploading && (
            <div 
              className="dark-camera-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="camera-icon" />
            </div>
          )}

          {/* Rank Section */}
          <div className="dark-rank-section">
            <div className="dark-rank-text">
              RANK : {rank.toUpperCase()}
            </div>
          </div>

          {/* Stats Row */}
          <div className="dark-stats-row">
            <div className="dark-stat-item">
              <Trophy className="dark-stat-icon" />
              <div className="dark-stat-label">ELO</div>
              <div className="dark-stat-value">{elo}</div>
            </div>
            <div className="dark-stat-item">
              <Star className="dark-stat-icon" />
              <div className="dark-stat-label">SPA</div>
              <div className="dark-stat-value">{spa}</div>
            </div>
            <div className="dark-stat-item">
              <TrendingUp className="dark-stat-icon" />
              <div className="dark-stat-label">XH</div>
              <div className="dark-stat-value">#{ranking}</div>
            </div>
            <div className="dark-stat-item">
              <Target className="dark-stat-icon" />
              <div className="dark-stat-label">TRẬN</div>
              <div className="dark-stat-value">{matches}</div>
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

export default DarkCardAvatar;
