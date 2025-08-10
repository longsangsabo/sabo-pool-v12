/**
 * Image processing utilities for avatar upload
 * Includes auto-resize and quality optimization
 */

export interface ImageResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Resize image file while maintaining aspect ratio
 * @param file - Original image file
 * @param options - Resize options
 * @returns Promise<File> - Resized image file
 */
export const resizeImage = (
  file: File,
  options: ImageResizeOptions = {}
): Promise<File> => {
  const {
    maxWidth = 512,
    maxHeight = 512,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob failed'));
              return;
            }

            // Create new file with original name but potentially different extension
            const fileName = file.name.replace(/\.[^/.]+$/, `.${format === 'jpeg' ? 'jpg' : format}`);
            const resizedFile = new File([blob], fileName, {
              type: `image/${format}`,
              lastModified: Date.now(),
            });

            resolve(resizedFile);
          },
          `image/${format}`,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate and auto-resize image for avatar upload
 * @param file - Original file
 * @returns Promise<File> - Processed file ready for upload
 */
export const processAvatarImage = async (file: File): Promise<File> => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Vui lòng chọn file hình ảnh');
  }

  // If file is already small enough, just return it
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size <= maxSize) {
    // Still resize for consistency and optimization
    return await resizeImage(file, {
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.85,
      format: 'jpeg'
    });
  }

  // Auto-resize large images
  return await resizeImage(file, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.8,
    format: 'jpeg'
  });
};

/**
 * Handle drag and drop files
 * @param dataTransfer - DataTransfer from drag event
 * @returns Promise<File[]> - Array of valid image files
 */
export const handleDropFiles = async (dataTransfer: DataTransfer): Promise<File[]> => {
  const files: File[] = [];
  
  if (dataTransfer.items) {
    // Use DataTransferItemList interface
    for (let i = 0; i < dataTransfer.items.length; i++) {
      if (dataTransfer.items[i].kind === 'file') {
        const file = dataTransfer.items[i].getAsFile();
        if (file && file.type.startsWith('image/')) {
          files.push(file);
        }
      }
    }
  } else {
    // Fallback to DataTransfer.files
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files[i];
      if (file.type.startsWith('image/')) {
        files.push(file);
      }
    }
  }

  return files;
};

/**
 * Get human readable file size
 * @param bytes - File size in bytes
 * @returns string - Formatted file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
