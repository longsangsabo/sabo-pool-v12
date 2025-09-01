import { useState, useRef, useCallback, useEffect } from 'react';
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
 const [isCropping, setIsCropping] = useState(false);
 const [imageLoaded, setImageLoaded] = useState(false);
 
 const imageRef = useRef<HTMLImageElement>(null);
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const containerRef = useRef<HTMLDivElement>(null);

 // Add global event listeners for better pointer handling
 useEffect(() => {
  const handleGlobalPointerMove = (e: PointerEvent) => {
   if (isDragging && containerRef.current && imageRef.current) {
    e.preventDefault();
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const img = imageRef.current;
    
    // Calculate displayed image bounds
    const imageAspectRatio = img.naturalWidth / img.naturalHeight;
    const containerAspectRatio = containerRect.width / containerRect.height;
    
    let displayedWidth, displayedHeight, offsetX, offsetY;
    
    if (imageAspectRatio > containerAspectRatio) {
     displayedWidth = containerRect.width;
     displayedHeight = containerRect.width / imageAspectRatio;
     offsetX = 0;
     offsetY = (containerRect.height - displayedHeight) / 2;
    } else {
     displayedHeight = containerRect.height;
     displayedWidth = containerRect.height * imageAspectRatio;
     offsetX = (containerRect.width - displayedWidth) / 2;
     offsetY = 0;
    }
    
    // Calculate new position constrained to displayed image bounds
    const newX = Math.max(offsetX, Math.min(
     e.clientX - containerRect.left - dragStart.x, 
     offsetX + displayedWidth - cropArea.width
    ));
    const newY = Math.max(offsetY, Math.min(
     e.clientY - containerRect.top - dragStart.y, 
     offsetY + displayedHeight - cropArea.height
    ));
    
    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
   }
  };

  const handleGlobalPointerUp = () => {
   setIsDragging(false);
   setIsResizing(false);
  };

  if (isDragging) {
   document.addEventListener('pointermove', handleGlobalPointerMove);
   document.addEventListener('pointerup', handleGlobalPointerUp);
  }

  return () => {
   document.removeEventListener('pointermove', handleGlobalPointerMove);
   document.removeEventListener('pointerup', handleGlobalPointerUp);
  };
 }, [isDragging, dragStart, cropArea.width, cropArea.height]);

 // Initialize crop area when image loads
 const handleImageLoad = useCallback(() => {
  if (!imageRef.current || !containerRef.current) return;
  
  const img = imageRef.current;
  const container = containerRef.current;
  const containerRect = container.getBoundingClientRect();
  
  // Calculate the actual displayed image dimensions (with object-contain)
  const imageAspectRatio = img.naturalWidth / img.naturalHeight;
  const containerAspectRatio = containerRect.width / containerRect.height;
  
  let displayedWidth, displayedHeight, offsetX, offsetY;
  
  if (imageAspectRatio > containerAspectRatio) {
   // Image is wider than container - fits by width
   displayedWidth = containerRect.width;
   displayedHeight = containerRect.width / imageAspectRatio;
   offsetX = 0;
   offsetY = (containerRect.height - displayedHeight) / 2;
  } else {
   // Image is taller than container - fits by height
   displayedHeight = containerRect.height;
   displayedWidth = containerRect.height * imageAspectRatio;
   offsetX = (containerRect.width - displayedWidth) / 2;
   offsetY = 0;
  }
  
  // Create initial crop area (80% of displayed image, centered)
  const cropSize = Math.min(displayedWidth, displayedHeight) * 0.8;
  const centerX = offsetX + (displayedWidth - cropSize) / 2;
  const centerY = offsetY + (displayedHeight - cropSize) / 2;
  
  setCropArea({
   x: centerX,
   y: centerY,
   width: cropSize,
   height: cropSize / aspectRatio,
  });
  
  setImageLoaded(true);
  
  console.log('Image loaded:', {
   natural: { width: img.naturalWidth, height: img.naturalHeight },
   container: { width: containerRect.width, height: containerRect.height },
   displayed: { width: displayedWidth, height: displayedHeight, offsetX, offsetY },
   cropArea: { x: centerX, y: centerY, width: cropSize, height: cropSize / aspectRatio }
  });
 }, [aspectRatio]);

 // Handle touch/mouse events for dragging
 const handlePointerDown = useCallback((e: React.PointerEvent) => {
  if (!containerRef.current) return;
  
  e.preventDefault();
  setIsDragging(true);
  
  const containerRect = containerRef.current.getBoundingClientRect();
  setDragStart({
   x: e.clientX - containerRect.left - cropArea.x,
   y: e.clientY - containerRect.top - cropArea.y,
  });
 }, [cropArea]);

 const handlePointerMove = useCallback((e: React.PointerEvent) => {
  // This is now handled by global event listeners
  e.preventDefault();
 }, []);

 const handlePointerUp = useCallback(() => {
  // This is now handled by global event listeners
 }, []);

 // Handle crop area resize
 const handleResize = useCallback((direction: string, deltaX: number, deltaY: number) => {
  if (!containerRef.current || !imageRef.current) return;
  
  const containerRect = containerRef.current.getBoundingClientRect();
  const img = imageRef.current;
  
  // Calculate displayed image bounds
  const imageAspectRatio = img.naturalWidth / img.naturalHeight;
  const containerAspectRatio = containerRect.width / containerRect.height;
  
  let displayedWidth, displayedHeight, offsetX, offsetY;
  
  if (imageAspectRatio > containerAspectRatio) {
   displayedWidth = containerRect.width;
   displayedHeight = containerRect.width / imageAspectRatio;
   offsetX = 0;
   offsetY = (containerRect.height - displayedHeight) / 2;
  } else {
   displayedHeight = containerRect.height;
   displayedWidth = containerRect.height * imageAspectRatio;
   offsetX = (containerRect.width - displayedWidth) / 2;
   offsetY = 0;
  }
  
  setCropArea(prev => {
   let newArea = { ...prev };
   
   if (direction.includes('right')) {
    newArea.width = Math.max(50, Math.min(prev.width + deltaX, offsetX + displayedWidth - prev.x));
   }
   if (direction.includes('bottom')) {
    newArea.height = Math.max(50, Math.min(prev.height + deltaY, offsetY + displayedHeight - prev.y));
   }
   if (direction.includes('left')) {
    const newWidth = Math.max(50, prev.width - deltaX);
    const maxX = prev.x + prev.width - newWidth;
    newArea.x = Math.max(offsetX, maxX);
    newArea.width = newWidth;
   }
   if (direction.includes('top')) {
    const newHeight = Math.max(50, prev.height - deltaY);
    const maxY = prev.y + prev.height - newHeight;
    newArea.y = Math.max(offsetY, maxY);
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
  if (!imageRef.current || !canvasRef.current || !containerRef.current) return;
  
  setIsCropping(true);
  
  try {
   const canvas = canvasRef.current;
   const ctx = canvas.getContext('2d');
   if (!ctx) throw new Error('Cannot get canvas context');
   
   const img = imageRef.current;
   const containerRect = containerRef.current.getBoundingClientRect();
   
   // Calculate the actual displayed image dimensions (with object-contain)
   const imageAspectRatio = img.naturalWidth / img.naturalHeight;
   const containerAspectRatio = containerRect.width / containerRect.height;
   
   let displayedWidth, displayedHeight, offsetX, offsetY;
   
   if (imageAspectRatio > containerAspectRatio) {
    // Image is wider than container - fits by width
    displayedWidth = containerRect.width;
    displayedHeight = containerRect.width / imageAspectRatio;
    offsetX = 0;
    offsetY = (containerRect.height - displayedHeight) / 2;
   } else {
    // Image is taller than container - fits by height
    displayedHeight = containerRect.height;
    displayedWidth = containerRect.height * imageAspectRatio;
    offsetX = (containerRect.width - displayedWidth) / 2;
    offsetY = 0;
   }
   
   // Calculate scale factors from displayed image to natural size
   const scaleX = img.naturalWidth / displayedWidth;
   const scaleY = img.naturalHeight / displayedHeight;
   
   // Adjust crop area coordinates to account for image offset and scale
   const adjustedX = (cropArea.x - offsetX) * scaleX / scale;
   const adjustedY = (cropArea.y - offsetY) * scaleY / scale;
   const adjustedWidth = cropArea.width * scaleX / scale;
   const adjustedHeight = cropArea.height * scaleY / scale;
   
   // Ensure we don't go outside image bounds
   const sourceX = Math.max(0, Math.min(adjustedX, img.naturalWidth - adjustedWidth));
   const sourceY = Math.max(0, Math.min(adjustedY, img.naturalHeight - adjustedHeight));
   const sourceWidth = Math.min(adjustedWidth, img.naturalWidth - sourceX);
   const sourceHeight = Math.min(adjustedHeight, img.naturalHeight - sourceY);
   
   // Set canvas dimensions
   canvas.width = 400;
   canvas.height = 400;
   
   // Set var(--color-background) background to prevent transparency issues
   ctx.fillStyle = 'var(--color-var(--color-background))';
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   
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
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height
   );
   
   ctx.restore();
   
   console.log('Crop calculation:', {
    container: { width: containerRect.width, height: containerRect.height },
    displayed: { width: displayedWidth, height: displayedHeight, offsetX, offsetY },
    cropArea: cropArea,
    natural: { width: img.naturalWidth, height: img.naturalHeight },
    source: { x: sourceX, y: sourceY, width: sourceWidth, height: sourceHeight },
    scale: scale
   });
   
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
     } else {
      toast.error('Lỗi khi tạo file ảnh');
     }
     setIsCropping(false);
    },
    'image/jpeg',
    0.9
   );
  } catch (error) {
   console.error('Crop error:', error);
   toast.error('Lỗi khi cắt ảnh: ' + (error instanceof Error ? error.message : 'Không xác định'));
   setIsCropping(false);
  }
 }, [cropArea, rotation, scale, onCropComplete, onOpenChange]);

 const handleCancel = useCallback(() => {
  onOpenChange(false);
  setScale(1);
  setRotation(0);
  setCropArea({ x: 0, y: 0, width: 100, height: 100 });
  setImageLoaded(false);
  setIsCropping(false);
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
     {/* Loading state */}
     {!imageLoaded && (
      <div className="relative bg-var(--color-foreground) rounded-lg overflow-hidden aspect-square flex items-center justify-center">
       <div className="animate-spin rounded-full h-8 w-8 border-2 border-var(--color-background) border-t-transparent" />
      </div>
     )}
     
     {/* Image Editor */}
     <div
      ref={containerRef}
      className={`relative bg-var(--color-foreground) rounded-lg overflow-hidden aspect-square touch-none ${!imageLoaded ? 'hidden' : ''}`}
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
      {imageLoaded && (
       <div
        className="absolute border-2 border-blue-500 bg-primary-500/10"
        style={{ left: cropArea.x,
         top: cropArea.y,
         width: cropArea.width,
         height: cropArea.height,
         cursor: isDragging ? 'grabbing' : 'grab', }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
       >
        {/* Corner handles for resizing */}
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary-500 border border-var(--color-background) rounded-full cursor-nw-resize" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 border border-var(--color-background) rounded-full cursor-ne-resize" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary-500 border border-var(--color-background) rounded-full cursor-sw-resize" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary-500 border border-var(--color-background) rounded-full cursor-se-resize" />
        
        {/* Move icon */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-var(--color-background)">
         <Move className="w-4 h-4" />
        </div>
       </div>
      )}
     </div>
     
     {/* Controls */}
     {imageLoaded && (
      <div className="flex items-center justify-between py-3 gap-2">
       <div className="flex items-center gap-1">
        <Button
         variant="outline"
         
         onClick={() => setScale(Math.max(0.5, scale - 0.1))}
         disabled={scale <= 0.5 || isCropping}
        >
         <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
         variant="outline"
         
         onClick={() => setScale(Math.min(3, scale + 0.1))}
         disabled={scale >= 3 || isCropping}
        >
         <ZoomIn className="w-4 h-4" />
        </Button>
       </div>
       
       <Button
        variant="outline"
        
        onClick={() => setRotation((rotation + 90) % 360)}
        disabled={isCropping}
       >
        <RotateCw className="w-4 h-4" />
       </Button>
      </div>
     )}
    </div>
    
    <DialogFooter className="p-4 pt-2">
     <Button variant="outline" onClick={handleCancel} className="flex-1" disabled={isCropping}>
      <X className="w-4 h-4 mr-2" />
      Hủy
     </Button>
     <Button onClick={handleCrop} className="flex-1" disabled={!imageLoaded || isCropping}>
      {isCropping ? (
       <>
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-var(--color-background) border-t-transparent mr-2" />
        Đang xử lý...
       </>
      ) : (
       <>
        <Check className="w-4 h-4 mr-2" />
        Cắt ảnh
       </>
      )}
     </Button>
    </DialogFooter>
    
    {/* Hidden canvas for processing */}
    <canvas ref={canvasRef} className="hidden" />
   </DialogContent>
  </Dialog>
 );
};
