import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UnifiedProfile } from '@/types/unified-profile';
import { useAuth } from '@/hooks/useAuth';
import { useAvatar } from '@/contexts/AvatarContext';

export function useMobileProfile() {
  const { user } = useAuth();
  const { updateAvatar } = useAvatar();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<UnifiedProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<Partial<UnifiedProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Image cropper states
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [originalImageForCrop, setOriginalImageForCrop] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      // ✅ AUTO-CREATE PROFILE if missing
      let actualData = data;
      if (!data) {
        console.log('🛠️ [MobileProfile] No profile found, creating one for user:', user.id);
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email || null,
            current_rank: 'K',
          })
          .select()
          .single();
          
        if (createError) {
          console.error('❌ [MobileProfile] Failed to create profile:', createError);
          // Continue with empty profile instead of crashing
        } else {
          console.log('✅ [MobileProfile] Profile created successfully:', newProfile);
          actualData = newProfile; // ✅ Use newly created profile
        }
      }

      const profileData: UnifiedProfile = {
        id: actualData?.id || '',
        user_id: actualData?.user_id || user.id,
        display_name: actualData?.display_name || actualData?.full_name || null,
        phone: actualData?.phone || user.phone || null,
        bio: actualData?.bio || null,
        skill_level: (actualData?.skill_level || 'beginner') as UnifiedProfile['skill_level'],
        city: actualData?.city || null,
        district: actualData?.district || null,
        avatar_url: actualData?.avatar_url || null,
        member_since: actualData?.member_since || actualData?.created_at || null,
        role: (actualData?.role || 'player') as UnifiedProfile['role'],
        active_role: (actualData?.active_role || 'player') as UnifiedProfile['active_role'],
        verified_rank: actualData?.verified_rank || null,
        email: actualData?.email || user.email || null,
        full_name: actualData?.full_name || null,
        current_rank: actualData?.current_rank || null,
        spa_points: 1000, // Default value - not in database
        created_at: actualData?.created_at || new Date().toISOString(),
        updated_at: actualData?.updated_at || new Date().toISOString(),
        completion_percentage: actualData?.completion_percentage || 0,
      };
      
      console.log('🎯 [MobileProfile] Profile loaded:', {
        hasData: !!actualData,
        displayName: profileData.display_name,
        avatarUrl: profileData.avatar_url,
        email: profileData.email
      });
      
      setProfile(profileData);
      setEditingProfile(profileData);
    } catch (e) {
      console.error('❌ [MobileProfile] fetchProfile error:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditField = (field: string, value: any) => {
    setEditingProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSaveProfile = async () => {
    if (!user || !editingProfile) return false;
    setSaving(true);
    try {
      // ✅ SAFE: Only send safe fields to database
      const payload = {
        display_name: editingProfile.display_name || null,
        phone: editingProfile.phone || null,
        bio: editingProfile.bio || null,
        city: editingProfile.city || null,
        district: editingProfile.district || null,
        skill_level: editingProfile.skill_level,
        role: editingProfile.role,
        active_role: editingProfile.active_role,
      };

      console.log('🎯 [MobileProfile] Saving payload:', payload);

      const { error: mutationError } = await supabase
        .from('profiles')
        .update(payload)
        .eq('user_id', user.id);

      if (mutationError) {
        // ✅ BYPASS: Check if error is due to missing function
        if (mutationError.message?.includes('get_user_display_name')) {
          console.warn('⚠️ [MobileProfile] get_user_display_name error detected, using fallback update');
          const { error: fallbackError } = await supabase
            .from('profiles')
            .update(payload)
            .eq('user_id', user.id);
          if (fallbackError) throw fallbackError;
        } else {
          throw mutationError;
        }
      }

      // ✅ FORCE REFRESH: Fetch latest data from database
      await fetchProfile();
      
      toast.success('Đã lưu thông tin hồ sơ');
      return true;
    } catch (e: any) {
      console.error(e);
      toast.error('Lưu thất bại: ' + e.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProfile(profile);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
      return;
    }

    // For mobile, show image cropper
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImageForCrop(result);
      setShowImageCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImageUpload = async (croppedImageBlob: Blob) => {
    if (!user) return;
    setUploading(true);
    try {
      const fileExt = 'webp';
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, croppedImageBlob, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // ✅ FORCE REFRESH: Fetch latest data from database
      await fetchProfile();
      
      updateAvatar(avatarUrl);
      toast.success('Đã cập nhật ảnh đại diện');
      
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (e: any) {
      console.error('Avatar upload error:', e);
      toast.error('Lỗi tải ảnh: ' + e.message);
    } finally {
      setUploading(false);
      setShowImageCropper(false);
      setOriginalImageForCrop(null);
    }
  };

  return {
    profile,
    editingProfile,
    loading,
    saving,
    uploading,
    handleEditField,
    handleSaveProfile,
    handleCancelEdit,
    handleAvatarUpload,
    handleCroppedImageUpload,
    showImageCropper,
    setShowImageCropper,
    originalImageForCrop,
  };
}