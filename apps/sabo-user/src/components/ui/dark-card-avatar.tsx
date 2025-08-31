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
import './dark-card-avatar.css';

interface DarkCardAvatarProps {
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

const DarkCardAvatar: React.FC<DarkCardAvatarProps> = ({
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

 return (
  <div 
   className={`dark-card-avatar-container ${className} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
   onClick={onClick}
  >
   <div
    className={`dark-card-avatar-frame ${sizeConfig[size].width} ${sizeConfig[size].height}`}
   >
    {/* Dark Card Border */}
    <div className='dark-card-border'>
     {/* Main Image Area with Nickname Overlay */}
     <div
      className={`dark-image-area ${onAvatarChange ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={onAvatarChange ? () => fileInputRef.current?.click() : undefined}
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
         <Camera className='w-8 h-8 text-gray-400 mb-2' />
         <p className='text-body-small text-gray-400 font-medium'>Đổi ảnh</p>
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
           "'Inter', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
          fontWeight: 700, // font-bold
          fontSize: '2rem', // Tăng để text rõ hơn
          lineHeight: 1, // Cân bằng cho tiếng Việt
          background:
           'linear-gradient(to right, rgb(96_165_250), rgb(192_132_252), var(--color-primary-500), var(--color-white), rgb(251_191_36))', // Bright colors cho dark mode
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '0.025em', // Giảm để tiếng Việt đọc dễ hơn
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
       <div className='dark-upload-overlay'>
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
       className='dark-camera-button'
       onClick={() => fileInputRef.current?.click()}
      >
       <Camera className='camera-icon' />
      </div>
     )}

     {/* Rank Section */}
     <div className='dark-rank-section'>
      <div
       className='dark-rank-text font-bold relative overflow-hidden rounded-lg px-4 py-2'
       style={{
        background: getRankDisplay(rank).gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: getRankDisplay(rank).textShadow,
        fontFamily: "'Orbitron', 'Exo 2', 'Rajdhani', monospace",
        letterSpacing: '4px',
        border: `2px solid ${getRankDisplay(rank).borderColor}`,
       }}
      >
       {(() => {
        const RankIcon = getRankDisplay(rank).icon;
        return (
         <div className="flex items-center justify-center gap-2"
         >
          <RankIcon
           className="w-5 h-5"
           style={{
            color: getRankDisplay(rank).color,
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
        className='dark-stat-icon w-4 h-4 mx-auto mb-1 text-gray-100 stroke-gray-100 fill-gray-100'
       />
       <div className='dark-stat-label'>ELO</div>
       <div className='dark-stat-value'>{elo}</div>
      </div>
      <div className='dark-stat-item'>
       <Diamond
        className='dark-stat-icon w-4 h-4 mx-auto mb-1 text-gray-100 stroke-gray-100 fill-gray-100'
       />
       <div className='dark-stat-label'>SPA</div>
       <div className='dark-stat-value'>{spa}</div>
      </div>
      <div className='dark-stat-item'>
       <BarChart3
        className='dark-stat-icon w-4 h-4 mx-auto mb-1 text-gray-100 stroke-gray-100 fill-gray-100'
       />
       <div className='dark-stat-label'>XH</div>
       <div className='dark-stat-value'>{ranking > 0 ? `#${ranking}` : 'N/A'}</div>
      </div>
      <div className='dark-stat-item'>
       <Swords
        className='dark-stat-icon w-4 h-4 mx-auto mb-1 text-gray-100 stroke-gray-100 fill-gray-100'
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
