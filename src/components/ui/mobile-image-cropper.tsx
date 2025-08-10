import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Crop, Move, RotateCw, Check, X, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MobileImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalImage: string;
  onCropComplete: (croppedFile: File) => void;
  aspectRatio?: number; // 1 for square, 16/9 for landscape, etc.
}

export const MobileImageCropper: React.FC<MobileImageCropperProps> = ({
  open,
  onOpenChange,
  originalImage,
  onCropComplete,
  aspectRatio = 1, // Default to square
}) => {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize crop area when image loads
  const handleImageLoad = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return;
    
    const img = imageRef.current;
    const container = containerRef.current;
    
    // Calculate initial crop area (centered square)
    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    
    const minSize = Math.min(imgRect.width, imgRect.height) * 0.8;
    const centerX = (imgRect.width - minSize) / 2;
    const centerY = (imgRect.height - minSize) / 2;
    
    setCropArea({
      x: centerX,
      y: centerY,
      width: minSize,
      height: minSize / aspectRatio,
    });
  }, [aspectRatio]);

  // Handle touch/mouse events for dragging
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropArea.x,
      y: e.clientY - cropArea.y,
    });
  }, [cropArea]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !imageRef.current) return;
    
    e.preventDefault();
    const imgRect = imageRef.current.getBoundingClientRect();
    
    const newX = Math.max(0, Math.min(e.clientX - dragStart.x, imgRect.width - cropArea.width));
    const newY = Math.max(0, Math.min(e.clientY - dragStart.y, imgRect.height - cropArea.height));
    
    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  }, [isDragging, dragStart, cropArea.width, cropArea.height]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Handle crop area resize
  const handleResize = useCallback((direction: string, deltaX: number, deltaY: number) => {
    if (!imageRef.current) return;
    
    const imgRect = imageRef.current.getBoundingClientRect();
    setCropArea(prev => {
      let newArea = { ...prev };
      
      if (direction.includes('right')) {
        newArea.width = Math.max(50, Math.min(prev.width + deltaX, imgRect.width - prev.x));
      }
      if (direction.includes('bottom')) {
        newArea.height = Math.max(50, Math.min(prev.height + deltaY, imgRect.height - prev.y));
      }
      if (direction.includes('left')) {
        const newWidth = Math.max(50, prev.width - deltaX);
        const maxX = prev.x + prev.width - newWidth;
        newArea.x = Math.max(0, maxX);
        newArea.width = newWidth;
      }
      if (direction.includes('top')) {
        const newHeight = Math.max(50, prev.height - deltaY);
        const maxY = prev.y + prev.height - newHeight;
        newArea.y = Math.max(0, maxY);
        newArea.height = newHeight;
      }
      
      // Maintain aspect ratio if needed
      if (aspectRatio !== 1) {
        newArea.height = newArea.width / aspectRatio;
      }
      
      return newArea;
    });
  }, [aspectRatio]);

  // Crop and return the result
  const handleCrop = useCallback(async () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = imageRef.current;
    const imgRect = img.getBoundingClientRect();
    
    // Calculate scale factors
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;
    
    // Set canvas dimensions
    canvas.width = 400;
    canvas.height = 400;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transformations
    ctx.save();
    
    // Rotate if needed
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }
    
    // Draw cropped area
    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    ctx.restore();
    
    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'cropped-avatar.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          onCropComplete(file);
          onOpenChange(false);
          toast.success('Đã cắt ảnh thành công!');
        }
      },
      'image/jpeg',
      0.9
    );
  }, [cropArea, rotation, scale, onCropComplete, onOpenChange]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
    setScale(1);
    setRotation(0);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md mx-auto p-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Crop className="w-5 h-5" />
            Chỉnh sửa ảnh đại diện
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-4">
          {/* Image Editor */}
          <div
            ref={containerRef}
            className="relative bg-black rounded-lg overflow-hidden aspect-square"
            style={{ touchAction: 'none' }}
          >
            <img
              ref={imageRef}
              src={originalImage}
              alt="Original"
              className="w-full h-full object-contain"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: 'center',
              }}
              onLoad={handleImageLoad}
              draggable={false}
            />
            
            {/* Crop Overlay */}
            <div
              className="absolute border-2 border-blue-500 bg-blue-500/10"
              style={{
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height,
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* Corner handles for resizing */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize" />
              
              {/* Move icon */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                <Move className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between py-3 gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                disabled={scale <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale(Math.min(3, scale + 0.1))}
                disabled={scale >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation((rotation + 90) % 360)}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <DialogFooter className="p-4 pt-2">
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>
          <Button onClick={handleCrop} className="flex-1">
            <Check className="w-4 h-4 mr-2" />
            Cắt ảnh
          </Button>
        </DialogFooter>
        
        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};
