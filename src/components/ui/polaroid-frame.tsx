import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, X, Crop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import './polaroid-frame.css';

interface PolaroidFrameProps {
  userAvatar?: string | null;
  onAvatarChange?: (file: File, croppedDataUrl?: string) => void;
  uploading?: boolean;
  fallbackName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PolaroidFrame: React.FC<PolaroidFrameProps> = ({
  userAvatar,
  onAvatarChange,
  uploading = false,
  fallbackName = 'U',
  className = '',
  size = 'md',
}) => {
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Size configurations
  const sizeConfig = {
    sm: { width: 'w-[240px]', maxWidth: 'max-w-[240px]' },
    md: { width: 'w-[90vw]', maxWidth: 'max-w-[320px]' },
    lg: { width: 'w-[90vw]', maxWidth: 'max-w-[380px]' },
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

    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCrop = () => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const size = Math.min(img.naturalWidth, img.naturalHeight);
    const offsetX = (img.naturalWidth - size) / 2;
    const offsetY = (img.naturalHeight - size) / 2;

    canvas.width = 400;
    canvas.height = 400;

    // Set white background to prevent transparency/black issues
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, 400, 400);

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCroppedImage(croppedDataUrl);
    setShowCropper(false);

    // Convert to File for upload
    canvas.toBlob(
      blob => {
        if (blob && onAvatarChange) {
          const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
          onAvatarChange(file, croppedDataUrl);
        }
      },
      'image/jpeg',
      0.8
    );

    toast.success('Đã cắt ảnh thành công!');
  };

  const cancelCrop = () => {
    setShowCropper(false);
    setOriginalImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentAvatar = croppedImage || userAvatar;

  if (showCropper && originalImage) {
    return (
      <div className={`polaroid-cropper-container ${className}`}>
        <div className='bg-background border rounded-lg p-4 space-y-4 shadow-lg'>
          <div className='flex items-center justify-center gap-2 mb-4'>
            <Crop className='w-5 h-5 text-primary' />
            <h3 className='text-lg font-medium'>Cắt ảnh đại diện</h3>
          </div>

          <div className='crop-area bg-muted rounded-lg overflow-hidden p-2'>
            <div className='text-center mb-2'>
              <p className='text-sm text-muted-foreground'>
                Ảnh sẽ được cắt thành hình vuông tự động
              </p>
            </div>
            <img
              ref={imageRef}
              src={originalImage}
              alt='Crop preview'
              className='w-full h-auto max-h-[300px] object-contain mx-auto rounded'
              onLoad={() => {
                // Auto-crop to center square
                if (imageRef.current && canvasRef.current) {
                  const img = imageRef.current;
                  const canvas = canvasRef.current;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    const size = Math.min(img.naturalWidth, img.naturalHeight);
                    const offsetX = (img.naturalWidth - size) / 2;
                    const offsetY = (img.naturalHeight - size) / 2;

                    canvas.width = 150;
                    canvas.height = 150;

                    // Set white background to prevent transparency/black issues
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    ctx.drawImage(
                      img,
                      offsetX,
                      offsetY,
                      size,
                      size,
                      0,
                      0,
                      150,
                      150
                    );
                  }
                }
              }}
            />
          </div>

          <div className='preview-area text-center'>
            <p className='text-sm font-medium text-muted-foreground mb-3'>
              Xem trước kết quả:
            </p>
            <canvas
              ref={canvasRef}
              className='w-24 h-24 rounded-lg border-2 border-primary mx-auto shadow-sm'
              style={{ imageRendering: 'auto' }}
            />
          </div>

          <div className='flex gap-3 justify-center pt-2'>
            <Button
              onClick={handleCrop}
              size='sm'
              className='flex items-center gap-2 px-6'
            >
              <Check className='w-4 h-4' />
              Lưu ảnh
            </Button>
            <Button
              onClick={cancelCrop}
              variant='outline'
              size='sm'
              className='flex items-center gap-2 px-6'
            >
              <X className='w-4 h-4' />
              Hủy bỏ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`polaroid-frame-container ${className}`}>
      <div
        className={`relative ${sizeConfig[size].width} ${sizeConfig[size].maxWidth} mx-auto`}
      >
        {/* Polaroid Background PNG - Updated Layout */}
        <img
          src='https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/logo/layout1.png'
          alt='Polaroid Frame Background'
          className='w-full h-auto select-none pointer-events-none z-0 drop-shadow-lg'
          draggable={false}
          style={{ aspectRatio: '1/1.2', objectFit: 'contain' }}
        />

        {/* Avatar positioned in the frame - Updated for layout1.png */}
        <div className='absolute top-[6%] left-1/2 transform -translate-x-1/2 z-10'>
          <div
            className='relative flex items-center justify-center pointer-events-auto group'
            style={{
              width: '72%',
              height: '58%',
              aspectRatio: '4/3',
            }}
          >
            <div
              className='w-full h-full rounded-[6px] overflow-hidden shadow-lg border border-white/50 bg-white cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl'
              onClick={() => fileInputRef.current?.click()}
              style={{ transform: 'translateY(6%)' }}
            >
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt='Avatar'
                  className='w-full h-full object-cover transition-transform duration-200'
                />
              ) : (
                <div
                  className='w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-purple-600 flex items-center justify-center text-white font-bold'
                  style={{
                    fontSize: 'min(3.5vw, 28px)',
                  }}
                >
                  {fallbackName[0]?.toUpperCase() || 'U'}
                </div>
              )}

              {uploading && (
                <div className='absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-3 border-white mb-2'></div>
                  <p className='text-white text-xs font-medium'>Đang tải...</p>
                </div>
              )}

              {/* Upload icon overlay - Enhanced */}
              <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-[6px]'>
                <div className='flex flex-col items-center justify-center text-white'>
                  <Camera className='w-6 h-6 mb-1' />
                  <span className='text-xs font-medium'>Đổi ảnh</span>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type='file'
              accept='image/jpeg,image/png,image/webp'
              onChange={handleFileSelect}
              className='hidden'
            />
          </div>
        </div>

        {/* Polaroid caption area - Updated for layout1.png */}
        {currentAvatar && (
          <div className='absolute bottom-[10%] left-1/2 transform -translate-x-1/2 z-10 w-[72%]'>
            <div className='text-center'>
              <p className='text-gray-600 text-xs font-handwriting italic'>
                {fallbackName}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolaroidFrame;
