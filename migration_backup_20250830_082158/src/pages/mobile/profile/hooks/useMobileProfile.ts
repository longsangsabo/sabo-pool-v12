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

      // ✅ AUTO-CREATE PROFILE if missing using upsert with ignoreDuplicates
      let actualData = data;
      if (!data) {

        try {
          // Use upsert with ignoreDuplicates to handle the ON CONFLICT issue
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert([{
              user_id: user.id,
              email: user.email || null,
              current_rank: 'K',
              spa_points: 0,
              elo: 1000,
              is_admin: false,
              skill_level: 'beginner',
              ban_status: 'active'
            }], {
              ignoreDuplicates: true
            })
            .select()
            .maybeSingle();
            
          if (createError) {
            console.error('❌ [MobileProfile] Failed to create profile via upsert:', createError);
            
            // Final fallback: Just continue without profile (for read-only access)

          } else if (newProfile) {

            actualData = newProfile;
          } else {
            // ignoreDuplicates=true returns null when duplicate exists, so fetch again

            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', user.id)
              .single();
            actualData = existingProfile;
          }
        } catch (e) {
          console.error('❌ [MobileProfile] Exception creating profile:', e);
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

  const handleAvatarUpload = (file: File, croppedDataUrl?: string) => {
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
      return;
    }

    // Skip cropping and upload directly for better reliability
    handleDirectImageUpload(file);
  };

  const handleDirectImageUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    
    try {

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        console.error('❌ [Avatar Upload] Primary bucket failed:', error);
        
        // Try with different bucket names as fallback
        const alternativeBuckets = ['logo', 'evidence', 'public'];
        
        for (const bucketName of alternativeBuckets) {
          try {

            const altFilePath = bucketName === 'logo' ? fileName : filePath;
            
            const { error: altError } = await supabase.storage
              .from(bucketName)
              .upload(altFilePath, file, {
                contentType: file.type,
                upsert: true,
              });
            
            if (!altError) {

              const { data: urlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(altFilePath);
              
              const avatarUrl = urlData.publicUrl;

              await updateProfileAvatar(avatarUrl);
              return;
            }
          } catch (e) {

          }
        }
        
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      await updateProfileAvatar(avatarUrl);
      
    } catch (error) {
      console.error('❌ [Avatar Upload] Failed:', error);
      toast.error('Upload avatar thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      setShowImageCropper(false);
      setOriginalImageForCrop(null);
    }
  };

  const handleCroppedImageUpload = async (croppedImageBlob: Blob) => {
    if (!user) return;
    setUploading(true);
    try {

      const fileExt = 'webp';
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`; // ✅ Fixed: Use user_id folder structure

      // Check if bucket exists by listing first
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('❌ [Avatar Upload] Error listing buckets:', bucketsError);
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedImageBlob, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadError) {
        console.error('❌ [Avatar Upload] Upload error:', uploadError);
        
        // Try alternative bucket names if 'avatars' fails
        if (uploadError.message?.includes('Bucket not found')) {

          // Try with different bucket names
          const alternativeBuckets = ['logo', 'evidence', 'public'];
          
          for (const bucketName of alternativeBuckets) {
            try {

              // For alternative buckets, try different path structures
              const altFilePath = bucketName === 'logo' ? fileName : filePath;
              
              const { error: altError } = await supabase.storage
                .from(bucketName)
                .upload(altFilePath, croppedImageBlob, {
                  contentType: 'image/webp',
                  upsert: true,
                });
              
              if (!altError) {

                const { data: urlData } = supabase.storage
                  .from(bucketName)
                  .getPublicUrl(altFilePath);
                
                const avatarUrl = urlData.publicUrl;
                
                // Validate alternative URL
                if (avatarUrl && avatarUrl !== 'undefined' && avatarUrl.includes('supabase')) {
                  const urlWithCache = `${avatarUrl}?t=${Date.now()}`;

                  await updateProfileAvatar(urlWithCache);
                  return;
                }
              }
            } catch (e) {

            }
          }
        }
        
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Validate URL format
      if (!avatarUrl || avatarUrl === 'undefined' || !avatarUrl.includes('supabase')) {
        console.error('❌ [Avatar Upload] Invalid URL generated:', avatarUrl);
        throw new Error('Invalid avatar URL generated');
      }
      
      // Add cache busting parameter to force refresh
      const urlWithCache = `${avatarUrl}?t=${Date.now()}`;

      await updateProfileAvatar(urlWithCache);
      
    } catch (e: any) {
      console.error('❌ [Avatar Upload] Final error:', e);
      toast.error('Lỗi tải ảnh: ' + e.message);
    } finally {
      setUploading(false);
      setShowImageCropper(false);
      setOriginalImageForCrop(null);
    }
  };

  const updateProfileAvatar = async (avatarUrl: string) => {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('user_id', user!.id);

    if (updateError) throw updateError;

    // ✅ FORCE REFRESH: Fetch latest data from database
    await fetchProfile();
    
    updateAvatar(avatarUrl);
    toast.success('Đã cập nhật ảnh đại diện');
    
    await queryClient.invalidateQueries({ queryKey: ['profile'] });
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