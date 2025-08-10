import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProfileData } from '../types';
import { useAuth } from '@/hooks/useAuth';
import { useAvatar } from '@/contexts/AvatarContext';

export function useMobileProfile() {
  const { user } = useAuth();
  const { updateAvatar } = useAvatar();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editingProfile, setEditingProfile] = useState<ProfileData | null>(
    null
  );
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

      const profileData: ProfileData = {
        user_id: data?.user_id || user.id,
        display_name: data?.display_name || data?.full_name || '',
        phone: data?.phone || user.phone || '',
        bio: data?.bio || '',
        skill_level: (data?.skill_level ||
          'beginner') as ProfileData['skill_level'],
        city: data?.city || '',
        district: data?.district || '',
        avatar_url: data?.avatar_url || '',
        member_since: data?.member_since || data?.created_at || '',
        role: (data?.role || 'player') as ProfileData['role'],
        active_role: (data?.active_role ||
          'player') as ProfileData['active_role'],
        verified_rank: data?.verified_rank || null,
        completion_percentage: data?.completion_percentage || 0,
      };
      setProfile(profileData);
      setEditingProfile(profileData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditField = <K extends keyof ProfileData>(
    field: K,
    value: ProfileData[K]
  ) => {
    setEditingProfile(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveProfile = async () => {
    if (!user || !editingProfile) return;
    setSaving(true);
    try {
      // Check if profile already exists to avoid duplicate key violation on unique user_id
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      const payload = {
        user_id: user.id,
        display_name: editingProfile.display_name || '',
        phone: editingProfile.phone || '',
        bio: editingProfile.bio || '',
        skill_level: editingProfile.skill_level,
        city: editingProfile.city || '',
        district: editingProfile.district || '',
        role: editingProfile.role,
        active_role: editingProfile.active_role,
        avatar_url: editingProfile.avatar_url || '',
      };

      let mutationError;
      if (existing) {
        const { error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('user_id', user.id);
        mutationError = error || undefined;
      } else {
        const { error } = await supabase.from('profiles').insert(payload);
        mutationError = error || undefined;
      }

      if (mutationError) {
        // Fallback: if duplicate key still occurs, try update directly
        if (mutationError.message?.includes('duplicate key value')) {
          const { error: fallbackError } = await supabase
            .from('profiles')
            .update(payload)
            .eq('user_id', user.id);
          if (fallbackError) throw fallbackError;
        } else {
          throw mutationError;
        }
      }

      setProfile(editingProfile);
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

  const handleAvatarUpload = async (file: File) => {
    if (!file || !user) return;
    
    // Show image cropper instead of direct upload
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      setOriginalImageForCrop(imageDataUrl);
      setShowImageCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImageUpload = async (croppedFile: File) => {
    if (!croppedFile || !user) return;
    setUploading(true);
    try {
      const fileExt = 'jpg';
      const fileName = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedFile, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      const avatarUrl = urlData.publicUrl + '?t=' + Date.now();
      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);
      updateAvatar(avatarUrl);
      setProfile(p => (p ? { ...p, avatar_url: avatarUrl } : p));
      setEditingProfile(p => (p ? { ...p, avatar_url: avatarUrl } : p));
      // Invalidate any cached profile queries so header avatar refreshes
      queryClient.invalidateQueries({ queryKey: ['user-profile', user.id] });
      queryClient.invalidateQueries({ queryKey: ['current-user-profile'] });
      toast.success('Đã cập nhật ảnh đại diện!');
    } catch (e: any) {
      console.error(e);
      toast.error('Lỗi tải ảnh: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  return {
    profile,
    editingProfile,
    setEditingProfile,
    loading,
    saving,
    uploading,
    handleEditField,
    handleSaveProfile,
    handleCancelEdit,
    handleAvatarUpload,
    handleCroppedImageUpload,
    fetchProfile,
    // Image cropper states
    showImageCropper,
    setShowImageCropper,
    originalImageForCrop,
  };
}
