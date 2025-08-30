import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AvatarState {
  url: string | undefined;
  isLoading: boolean;
  isUploading: boolean;
  error: string | undefined;
  frameType:
    | 'octagon'
    | 'tech-edge'
    | 'hexagon'
    | 'crystal'
    | 'blade'
    | 'neon-circuit'
    | 'plasma-ring'
    | 'premium-octagon'; // Thêm premium-octagon
  variant:
    | 'default'
    | 'rainbow'
    | 'glow'
    | 'pulse'
    | 'shimmer'
    | 'platinum-elite'
    | 'diamond-silver'
    | 'chrome-metal'
    | 'frost-silver'
    | 'white-gold'
    | 'silver-holographic'
    | 'base'
    | 'neon'
    | 'fire'
    | 'water'
    | 'earth'
    | 'cosmic'
    | 'matrix'
    | 'royal'
    | 'shadow'
    | 'ice'
    | 'lightning';
  intensity: 'subtle' | 'normal' | 'intense';
  speed: 'slow' | 'normal' | 'fast';
}

export interface AvatarActions {
  uploadAvatar: (file: File) => Promise<void>;
  updateAvatarFrameType: (frameType: AvatarState['frameType']) => void;
  updateAvatarVariant: (variant: AvatarState['variant']) => void;
  updateAvatarIntensity: (intensity: AvatarState['intensity']) => void;
  updateAvatarSpeed: (speed: AvatarState['speed']) => void;
  resetAvatar: () => void;
  refreshAvatar: () => Promise<void>;
}

export interface UseRainbowAvatarReturn {
  avatar: AvatarState;
  actions: AvatarActions;
  fallbackUrl: string;
  isVerified: boolean;
}

export const useRainbowAvatar = (): UseRainbowAvatarReturn => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [avatar, setAvatar] = useState<AvatarState>({
    url: null,
    isLoading: true,
    isUploading: false,
    error: null,
    variant: 'default', // Dùng default effect
    frameType: 'premium-octagon', // Set premium-octagon làm default
    intensity: 'normal',
    speed: 'normal',
  });

  const [isVerified, setIsVerified] = useState(false);

  // Tạo fallback URL dựa trên thông tin user
  const fallbackUrl = user?.email
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=random&size=400`
    : `https://ui-avatars.com/api/?name=User&background=random&size=400`;

  // Load avatar từ database
  const loadAvatar = useCallback(async () => {
    if (!user?.id) {
      setAvatar(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setAvatar(prev => ({ ...prev, isLoading: true, error: null }));

      // Load profile với avatar URL
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url, verified_rank, display_name')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Cập nhật state với thông tin từ database
      setAvatar(prev => ({
        ...prev,
        url: profile?.avatar_url || null,
        variant:
          (localStorage.getItem(
            `avatar_variant_${user.id}`
          ) as AvatarState['variant']) || 'default',
        frameType:
          (localStorage.getItem(
            `avatar_frameType_${user.id}`
          ) as AvatarState['frameType']) || 'premium-octagon',
        intensity:
          (localStorage.getItem(
            `avatar_intensity_${user.id}`
          ) as AvatarState['intensity']) || 'normal',
        speed:
          (localStorage.getItem(
            `avatar_speed_${user.id}`
          ) as AvatarState['speed']) || 'normal',
        isLoading: false,
      }));

      setIsVerified(!!profile?.verified_rank);
    } catch (error) {
      console.error('Error loading avatar:', error);
      setAvatar(prev => ({
        ...prev,
        error: 'Không thể tải avatar',
        isLoading: false,
      }));
    }
  }, [user?.id]);

  // Upload avatar mới
  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user?.id) {
        toast.error('Bạn cần đăng nhập để tải avatar');
        return;
      }

      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File không được vượt quá 5MB');
        return;
      }

      try {
        setAvatar(prev => ({ ...prev, isUploading: true, error: null }));

        // Tạo tên file unique
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

        // Upload file lên Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        // Lấy public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        const avatarUrl = urlData.publicUrl + '?t=' + new Date().getTime();

        // Cập nhật profile trong database
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        // Cập nhật state
        setAvatar(prev => ({
          ...prev,
          url: avatarUrl,
          isUploading: false,
        }));

        toast.success('Avatar đã được cập nhật thành công!');
      } catch (error) {
        console.error('Error uploading avatar:', error);
        setAvatar(prev => ({
          ...prev,
          error: 'Không thể tải avatar',
          isUploading: false,
        }));
        toast.error('Lỗi khi tải avatar');
      }
    },
    [user?.id]
  );

  // Cập nhật variant avatar (lưu trong localStorage)
  const updateAvatarVariant = useCallback(
    async (variant: AvatarState['variant']) => {
      try {
        localStorage.setItem(`avatar_variant_${user?.id}`, variant);
        setAvatar(prev => ({ ...prev, variant }));
        toast.success('Hiệu ứng avatar đã được cập nhật!');
      } catch (error) {
        console.error('Error updating avatar variant:', error);
        toast.error('Không thể cập nhật hiệu ứng avatar');
      }
    },
    [user?.id]
  );

  // Cập nhật intensity (lưu trong localStorage)
  const updateAvatarIntensity = useCallback(
    async (intensity: AvatarState['intensity']) => {
      try {
        localStorage.setItem(`avatar_intensity_${user?.id}`, intensity);
        setAvatar(prev => ({ ...prev, intensity }));
      } catch (error) {
        console.error('Error updating avatar intensity:', error);
        toast.error('Không thể cập nhật cường độ hiệu ứng');
      }
    },
    [user?.id]
  );

  // Cập nhật speed (lưu trong localStorage)
  const updateAvatarSpeed = useCallback(
    async (speed: AvatarState['speed']) => {
      try {
        localStorage.setItem(`avatar_speed_${user?.id}`, speed);
        setAvatar(prev => ({ ...prev, speed }));
      } catch (error) {
        console.error('Error updating avatar speed:', error);
        toast.error('Không thể cập nhật tốc độ hiệu ứng');
      }
    },
    [user?.id]
  );

  // Reset về avatar mặc định
  const resetAvatar = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      if (error) throw error;

      // Xóa các settings khỏi localStorage
      localStorage.removeItem(`avatar_variant_${user.id}`);
      localStorage.removeItem(`avatar_frameType_${user.id}`);
      localStorage.removeItem(`avatar_intensity_${user.id}`);
      localStorage.removeItem(`avatar_speed_${user.id}`);

      setAvatar(prev => ({
        ...prev,
        url: null,
        variant: 'default',
        frameType: 'octagon',
        intensity: 'normal',
        speed: 'normal',
      }));

      toast.success('Avatar đã được reset về mặc định!');
    } catch (error) {
      console.error('Error resetting avatar:', error);
      toast.error('Không thể reset avatar');
    }
  }, [user?.id]);

  // Update frame type
  const updateAvatarFrameType = useCallback(
    async (frameType: AvatarState['frameType']) => {
      if (!user?.id) return;

      try {
        localStorage.setItem(`avatar_frameType_${user.id}`, frameType);

        setAvatar(prev => ({
          ...prev,
          frameType,
        }));

        toast.success('Đã cập nhật kiểu khung avatar!');
      } catch (error) {
        console.error('Error updating frame type:', error);
        toast.error('Không thể cập nhật kiểu khung');
      }
    },
    [user?.id]
  );

  // Refresh avatar
  const refreshAvatar = useCallback(async () => {
    await loadAvatar();
  }, [loadAvatar]);

  // Load avatar khi component mount hoặc user thay đổi
  useEffect(() => {
    loadAvatar();
  }, [loadAvatar]);

  // Tự động set default variant cho user mới
  useEffect(() => {
    if (user?.id && !avatar.isLoading) {
      const hasVariantSet = localStorage.getItem(`avatar_variant_${user.id}`);
      const hasFrameTypeSet = localStorage.getItem(
        `avatar_frameType_${user.id}`
      );

      if (!hasVariantSet) {
        // User mới, tự động set default variant (no effect) with Premium Octagon
        localStorage.setItem(`avatar_variant_${user.id}`, 'default');
        setAvatar(prev => ({ ...prev, variant: 'default' }));
      }

      if (!hasFrameTypeSet) {
        // User mới, tự động set Premium Octagon frame
        localStorage.setItem(`avatar_frameType_${user.id}`, 'premium-octagon');
        setAvatar(prev => ({ ...prev, frameType: 'premium-octagon' }));
      }
    }
  }, [user?.id, avatar.isLoading]);

  return {
    avatar,
    actions: {
      uploadAvatar,
      updateAvatarFrameType,
      updateAvatarVariant,
      updateAvatarIntensity,
      updateAvatarSpeed,
      resetAvatar,
      refreshAvatar,
    },
    fallbackUrl,
    isVerified,
  };
};
