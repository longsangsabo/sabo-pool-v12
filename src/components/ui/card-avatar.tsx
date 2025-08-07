import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, X, Crop, Crown, Diamond, BarChart3, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getRankDisplay } from '@/utils/rank-colors';
import './card-avatar.css';

interface CardAvatarProps {
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

const CardAvatar: React.FC<CardAvatarProps> = ({
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
    <div className={`card-avatar-container ${className}`}>
      <div className={`card-avatar-frame ${sizeConfig[size].width} ${sizeConfig[size].height}`}>
        {/* Dark Card Border */}
        <div className="card-border">
          {/* Main Image Area with Nickname Overlay */}
          <div 
            className="image-area"
            onClick={() => fileInputRef.current?.click()}
          >
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt='Avatar'
                className='avatar-image'
              />
            ) : (
              <div className='avatar-placeholder'>
                <div className="placeholder-content">
                  <Camera className="w-8 h-8 text-gray-400 mb-2" />
                  <p className='text-sm text-gray-400 font-medium'>Đổi ảnh</p>
                </div>
              </div>
            )}

            {/* Nickname Overlay */}
            {currentAvatar && (
              <div className="nickname-overlay">
                <div 
                  className="nickname-text-overlay"
                  style={{
                    fontFamily: "'Khand', 'Oswald', 'Bebas Neue', 'Antonio', 'Fjalla One', 'Roboto Condensed', condensed, sans-serif",
                    fontWeight: 900, // font-black equivalent
                    fontSize: '1.125rem', // 1.5x từ 0.75rem
                    fontStretch: 'condensed', // Nén font
                    lineHeight: 0.9, // Cao hơn, compact hơn
                    background: 'linear-gradient(to right, #1d4ed8, #7c3aed, #1e40af, #ffffff)', // Thêm white để sáng hơn
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '0.05em', // Spacing nhỏ cho condensed look
                    textTransform: 'uppercase',
                    filter: 'brightness(1.1)', // Giảm xuống +10%
                    fontVariant: 'small-caps' // Thêm small-caps cho cứng cáp
                  }}
                >
                  {nickname}
                </div>
              </div>
            )}

                        {/* Upload Overlay */}
            {uploading && (
              <div className="upload-overlay">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className='text-sm text-white font-medium'>Đang tải...</span>
              </div>
            )}
          </div>

          {/* Camera Button - Outside card corner */}
          {!uploading && (
            <div 
              className="camera-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="camera-icon" />
            </div>
          )}

          {/* Rank Section */}
          <div className="rank-section">
            <div 
              className="rank-text"
              style={{
                background: getRankDisplay(rank).gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: getRankDisplay(rank).textShadow,
                fontFamily: "'Orbitron', 'Exo 2', 'Rajdhani', monospace",
                fontWeight: 700,
                letterSpacing: '4px',
                // border: `2px solid ${getRankDisplay(rank).borderColor}`,
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {(() => {
                const RankIcon = getRankDisplay(rank).icon;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <RankIcon 
                      style={{ 
                        color: getRankDisplay(rank).color,
                        width: '20px', 
                        height: '20px',
                        filter: `drop-shadow(${getRankDisplay(rank).textShadow})`
                      }} 
                    />
                    RANK : {rank.toUpperCase()}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-item">
              <Crown 
                className="stat-icon" 
                style={{ 
                  color: '#1f2937', 
                  stroke: '#1f2937',
                  fill: '#1f2937',
                  width: '16px', 
                  height: '16px', 
                  margin: '0 auto 4px' 
                }}
              />
              <div className="stat-label">ELO</div>
              <div className="stat-value">{elo}</div>
            </div>
            <div className="stat-item">
              <Diamond 
                className="stat-icon" 
                style={{ 
                  color: '#1f2937', 
                  stroke: '#1f2937',
                  fill: '#1f2937',
                  width: '16px', 
                  height: '16px', 
                  margin: '0 auto 4px' 
                }}
              />
              <div className="stat-label">SPA</div>
              <div className="stat-value">{spa}</div>
            </div>
            <div className="stat-item">
              <BarChart3 
                className="stat-icon" 
                style={{ 
                  color: '#1f2937', 
                  stroke: '#1f2937',
                  fill: '#1f2937',
                  width: '16px', 
                  height: '16px', 
                  margin: '0 auto 4px' 
                }}
              />
              <div className="stat-label">XH</div>
              <div className="stat-value">#{ranking}</div>
            </div>
            <div className="stat-item">
              <Swords 
                className="stat-icon" 
                style={{ 
                  color: '#1f2937', 
                  stroke: '#1f2937',
                  fill: '#1f2937',
                  width: '16px', 
                  height: '16px', 
                  margin: '0 auto 4px' 
                }}
              />
              <div className="stat-label">TRẬN</div>
              <div className="stat-value">{matches}</div>
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
