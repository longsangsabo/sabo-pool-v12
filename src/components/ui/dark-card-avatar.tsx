import React, { useState, useRef } from 'react';
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
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getRankDisplay } from '@/utils/rank-colors';
import { processAvatarImage, handleDropFiles, formatFileSize } from '@/utils/imageUtils';
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
  size = 'md',
}) => {
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Size configurations
  const sizeConfig = {
    sm: { width: 'w-[200px]', height: 'h-[320px]' },
    md: { width: 'w-[280px]', height: 'h-[400px]' },
    lg: { width: 'w-[320px]', height: 'h-[460px]' },
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processImageFile(file);
  };

  const processImageFile = async (file: File) => {
    try {
      setProcessing(true);
      const originalSize = formatFileSize(file.size);
      
      // Process and resize image
      const processedFile = await processAvatarImage(file);
      const newSize = formatFileSize(processedFile.size);
      
      // Show success message with size info
      if (file.size !== processedFile.size) {
        toast.success(`Ảnh đã được tối ưu: ${originalSize} → ${newSize}`);
      } else {
        toast.success('Ảnh đã được tải lên thành công!');
      }

      if (onAvatarChange) {
        onAvatarChange(processedFile);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý ảnh');
    } finally {
      setProcessing(false);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    try {
      const files = await handleDropFiles(e.dataTransfer);
      if (files.length === 0) {
        toast.error('Vui lòng kéo thả file hình ảnh');
        return;
      }

      if (files.length > 1) {
        toast.error('Chỉ có thể tải lên một ảnh đại diện');
        return;
      }

      await processImageFile(files[0]);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xử lý file');
    }
  };

  const currentAvatar = croppedImage || userAvatar;

  return (
    <div className={`dark-card-avatar-container ${className}`}>
      <div
        className={`dark-card-avatar-frame ${sizeConfig[size].width} ${sizeConfig[size].height}`}
      >
        {/* Dark Card Border */}
        <div className='dark-card-border'>
          {/* Main Image Area with Nickname Overlay - Enhanced with Drag & Drop */}
          <div
            className={`dark-image-area ${dragActive ? 'drag-active' : ''} ${
              processing ? 'processing' : ''
            }`}
            onClick={() => !processing && fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt='Avatar'
                className='dark-avatar-image'
              />
            ) : (
              <div className='dark-avatar-placeholder'>
                <div className='dark-placeholder-content'>
                  {processing ? (
                    <div className='processing-indicator'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-2'></div>
                      <p className='text-sm text-gray-300 font-medium'>Đang xử lý...</p>
                    </div>
                  ) : dragActive ? (
                    <div className='drop-indicator'>
                      <ImageIcon className='w-8 h-8 text-blue-400 mb-2' />
                      <p className='text-sm text-blue-400 font-medium'>Thả ảnh vào đây</p>
                    </div>
                  ) : (
                    <div className='upload-indicator'>
                      <Camera className='w-8 h-8 text-gray-400 mb-2' />
                      <p className='text-sm text-gray-400 font-medium'>Đổi ảnh</p>
                      <p className='text-xs text-gray-500 mt-1'>Hoặc kéo thả ảnh</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Drag Overlay */}
            {dragActive && (
              <div className='drag-overlay dark-drag-overlay'>
                <div className='drag-content'>
                  <Upload className='w-12 h-12 text-blue-400 mb-2' />
                  <p className='text-lg font-semibold text-blue-400'>Thả ảnh vào đây</p>
                  <p className='text-sm text-gray-300'>Ảnh sẽ được tự động tối ưu</p>
                </div>
              </div>
            )}

            {/* Processing Overlay */}
            {processing && (
              <div className='processing-overlay dark-processing-overlay'>
                <div className='processing-content'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-2'></div>
                  <p className='text-sm text-blue-400 font-medium'>Đang tối ưu ảnh...</p>
                </div>
              </div>
            )}

            {/* Nickname Overlay */}
            {currentAvatar && (
              <div className='dark-nickname-overlay'>
                <div
                  className='dark-nickname-text-overlay'
                  style={{
                    fontFamily:
                      "'Khand', 'Oswald', 'Bebas Neue', 'Antonio', 'Fjalla One', 'Roboto Condensed', condensed, sans-serif",
                    fontWeight: 900, // font-black equivalent
                    fontSize: '1.125rem', // 1.5x từ 0.75rem
                    fontStretch: 'condensed', // Nén font
                    lineHeight: 0.9, // Cao hơn, compact hơn
                    background:
                      'linear-gradient(to right, #60a5fa, #c084fc, #3b82f6, #ffffff, #fbbf24)', // Bright colors cho dark mode
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '0.05em', // Spacing nhỏ cho condensed look
                    textTransform: 'uppercase',
                    filter: 'brightness(1.1)', // Giảm xuống +10%
                    fontVariant: 'small-caps', // Thêm small-caps cho cứng cáp
                  }}
                >
                  {nickname}
                </div>
              </div>
            )}

            {/* Upload Overlay */}
            {uploading && (
              <div className='dark-upload-overlay'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-white'></div>
                <span className='text-sm text-white font-medium'>
                  Đang tải...
                </span>
              </div>
            )}
          </div>

          {/* Camera Button - Outside card corner */}
          {!uploading && (
            <div
              className='dark-camera-button'
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className='camera-icon' />
            </div>
          )}

          {/* Rank Section */}
          <div className='dark-rank-section'>
            <div
              className='dark-rank-text'
              style={{
                background: getRankDisplay(rank).gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: getRankDisplay(rank).textShadow,
                fontFamily: "'Orbitron', 'Exo 2', 'Rajdhani', monospace",
                fontWeight: 700,
                letterSpacing: '4px',
                border: `2px solid ${getRankDisplay(rank).borderColor}`,
                borderRadius: '8px',
                padding: '8px 16px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {(() => {
                const RankIcon = getRankDisplay(rank).icon;
                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <RankIcon
                      style={{
                        color: getRankDisplay(rank).color,
                        width: '20px',
                        height: '20px',
                        filter: `drop-shadow(${getRankDisplay(rank).textShadow})`,
                      }}
                    />
                    RANK : {rank.toUpperCase()}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Stats Row */}
          <div className='dark-stats-row'>
            <div className='dark-stat-item'>
              <Crown
                className='dark-stat-icon'
                style={{
                  color: '#f1f1f1',
                  stroke: '#f1f1f1',
                  fill: '#f1f1f1',
                  width: '16px',
                  height: '16px',
                  margin: '0 auto 4px',
                }}
              />
              <div className='dark-stat-label'>ELO</div>
              <div className='dark-stat-value'>{elo}</div>
            </div>
            <div className='dark-stat-item'>
              <Diamond
                className='dark-stat-icon'
                style={{
                  color: '#f1f1f1',
                  stroke: '#f1f1f1',
                  fill: '#f1f1f1',
                  width: '16px',
                  height: '16px',
                  margin: '0 auto 4px',
                }}
              />
              <div className='dark-stat-label'>SPA</div>
              <div className='dark-stat-value'>{spa}</div>
            </div>
            <div className='dark-stat-item'>
              <BarChart3
                className='dark-stat-icon'
                style={{
                  color: '#f1f1f1',
                  stroke: '#f1f1f1',
                  fill: '#f1f1f1',
                  width: '16px',
                  height: '16px',
                  margin: '0 auto 4px',
                }}
              />
              <div className='dark-stat-label'>XH</div>
              <div className='dark-stat-value'>#{ranking}</div>
            </div>
            <div className='dark-stat-item'>
              <Swords
                className='dark-stat-icon'
                style={{
                  color: '#f1f1f1',
                  stroke: '#f1f1f1',
                  fill: '#f1f1f1',
                  width: '16px',
                  height: '16px',
                  margin: '0 auto 4px',
                }}
              />
              <div className='dark-stat-label'>TRẬN</div>
              <div className='dark-stat-value'>{matches}</div>
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
