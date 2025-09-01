import { useState, useEffect, useCallback } from 'react';
// Removed supabase import - migrated to services
import { getDisplayName } from '@/types/unified-profile';

interface ProfileData {
  user_id: string;
  full_name: string;
  display_name: string;
  nickname?: string;
  email?: string;
  avatar_url: string | undefined;
  verified_rank: string | undefined;
}

interface ProfileCache {
  [userId: string]: ProfileData;
}

const profileCache: ProfileCache = {};
const pendingRequests = new Map<string, Promise<ProfileData | null>>();

export const useProfileCache = () => {
  const [cachedProfiles, setCachedProfiles] =
    useState<ProfileCache>(profileCache);

  const getProfile = useCallback(
    async (userId: string): Promise<ProfileData | null> => {
      // Return cached profile if available
      if (profileCache[userId]) {
        return profileCache[userId];
      }

      // Return pending request if already in progress
      if (pendingRequests.has(userId)) {
        return pendingRequests.get(userId)!;
      }

      // Create new request
      const request = fetchProfile(userId);
      pendingRequests.set(userId, request);

      try {
        const profile = await request;
        if (profile) {
          profileCache[userId] = profile;
          setCachedProfiles({ ...profileCache });
        }
        return profile;
      } finally {
        pendingRequests.delete(userId);
      }
    },
    []
  );

  const fetchProfile = async (userId: string): Promise<ProfileData | null> => {
    try {
      // TODO: Replace with service call - const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, display_name, nickname, email, avatar_url, verified_rank')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.warn('⚠️ Error fetching profile from profiles table, trying player_rankings fallback:', error);
        
        // Try player_rankings as fallback
//         const { data: rankingData, error: rankingError } = await supabase
          .from('player_rankings')
          .select('user_id, user_name, current_rank, verified_rank')
          .eq('user_id', userId)
          .single();

        if (rankingError) {
          console.error('❌ Error fetching from player_rankings fallback:', rankingError);
          return null;
        }

        if (rankingData) {
          const fallbackProfile = {
            user_id: rankingData.user_id,
            full_name: rankingData.user_name || 'Unknown User',
            display_name: rankingData.user_name || 'Unknown User',
            nickname: null,
            email: null,
            avatar_url: null,
            verified_rank: rankingData.verified_rank
          };
          console.log(`🔄 Using fallback profile for ${userId}:`, fallbackProfile);
          return fallbackProfile;
        }
        
        return null;
      }

      // Use unified display name logic
      if (data) {
        const profile = {
          ...data,
          display_name: getDisplayName(data)
        };
        console.log(`🔧 Profile cache unified for ${userId}:`, {
          unified_display_name: profile.display_name
        });
        return profile;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const getMultipleProfiles = useCallback(
    async (userIds: string[]): Promise<ProfileData[]> => {
      const profiles = await Promise.all(
        userIds.map(async userId => {
          if (!userId) return null;
          return await getProfile(userId);
        })
      );

      return profiles.filter(Boolean) as ProfileData[];
    },
    [getProfile]
  );

  const clearCache = useCallback(() => {
    Object.keys(profileCache).forEach(key => delete profileCache[key]);
    setCachedProfiles({});
  }, []);

  return {
    getProfile,
    getMultipleProfiles,
    clearCache,
    cachedProfiles,
  };
};
