/**
 * CLUB MANAGEMENT BUSINESS LOGIC
 * Consolidated from ClubManagementPage.tsx, ClubSettings.tsx, and related components
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ===== TYPES =====
export interface Club {
  id: string;
  club_name: string;
  display_name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  user_id: string; // Owner ID
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  verification_status: 'unverified' | 'pending' | 'verified';
  avatar_url?: string;
  cover_image_url?: string;
  founded_date?: string;
  operating_hours?: {
    [key: string]: {
      open: string;
      close: string;
      is_closed: boolean;
    };
  };
  amenities?: string[];
  social_media?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  settings?: {
    allow_public_booking: boolean;
    require_membership: boolean;
    auto_approve_members: boolean;
    member_capacity: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface ClubMember {
  id: string;
  user_id: string;
  club_id: string;
  membership_type: 'basic' | 'premium' | 'vip' | 'trial';
  membership_number?: string;
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  join_date: string;
  expiry_date?: string;
  total_visits: number;
  last_visit?: string;
  total_hours_played: number;
  membership_fee: number;
  outstanding_balance: number;
  notes?: string;
  profiles: {
    full_name: string;
    phone?: string;
    verified_rank?: string;
  };
}

export interface ClubStats {
  total_members: number;
  active_members: number;
  total_revenue: number;
  monthly_revenue: number;
  total_tournaments: number;
  active_tournaments: number;
  total_tables: number;
  occupied_tables: number;
  average_rating: number;
  total_reviews: number;
}

export interface ClubSettings {
  club_id: string;
  general: {
    timezone: string;
    currency: string;
    default_language: 'vi' | 'en';
    business_hours: {
      [key: string]: {
        open: string;
        close: string;
        is_closed: boolean;
      };
    };
  };
  membership: {
    auto_approve: boolean;
    require_verification: boolean;
    member_capacity: number;
    default_membership_type: 'basic' | 'premium' | 'vip';
    trial_period_days: number;
  };
  booking: {
    allow_public_booking: boolean;
    advance_booking_days: number;
    cancellation_policy: string;
    require_deposit: boolean;
    deposit_amount: number;
  };
  notifications: {
    member_join: boolean;
    booking_confirmed: boolean;
    payment_received: boolean;
    tournament_updates: boolean;
    system_alerts: boolean;
  };
  features: {
    tournament_enabled: boolean;
    ranking_system: boolean;
    payment_integration: boolean;
    loyalty_program: boolean;
    analytics_dashboard: boolean;
  };
}

export interface MembershipData {
  user_id: string;
  membership_type: 'basic' | 'premium' | 'vip' | 'trial';
  membership_fee: number;
  notes?: string;
}

// ===== CLUB MANAGEMENT SERVICE =====
export class ClubManagementService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get club profile by owner ID
   */
  async getClubByOwner(ownerId: string): Promise<Club | null> {
    try {
      const { data, error } = await this.supabase
        .from('clubs')
        .select('*')
        .eq('user_id', ownerId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? this.formatClub(data) : null;
    } catch (error) {
      console.error('Error getting club by owner:', error);
      return null;
    }
  }

  /**
   * Get club profile by ID
   */
  async getClubById(clubId: string): Promise<Club | null> {
    try {
      const { data, error } = await this.supabase
        .from('clubs')
        .select('*')
        .eq('id', clubId)
        .single();

      if (error) throw error;

      return this.formatClub(data);
    } catch (error) {
      console.error('Error getting club by ID:', error);
      return null;
    }
  }

  /**
   * Create new club
   */
  async createClub(clubData: Partial<Club>): Promise<Club> {
    try {
      const { data, error } = await this.supabase
        .from('clubs')
        .insert({
          ...clubData,
          status: 'pending',
          verification_status: 'unverified',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return this.formatClub(data);
    } catch (error) {
      console.error('Error creating club:', error);
      throw error;
    }
  }

  /**
   * Update club profile
   */
  async updateClub(clubId: string, updates: Partial<Club>): Promise<Club> {
    try {
      const { data, error } = await this.supabase
        .from('clubs')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clubId)
        .select()
        .single();

      if (error) throw error;

      return this.formatClub(data);
    } catch (error) {
      console.error('Error updating club:', error);
      throw error;
    }
  }

  /**
   * Get club statistics
   */
  async getClubStats(clubId: string): Promise<ClubStats> {
    try {
      // Get member statistics
      const { data: memberStats, error: memberError } = await this.supabase
        .from('club_members')
        .select('status, membership_fee, outstanding_balance')
        .eq('club_id', clubId);

      if (memberError) throw memberError;

      const totalMembers = memberStats?.length || 0;
      const activeMembers = memberStats?.filter(m => m.status === 'active').length || 0;
      const totalRevenue = memberStats?.reduce((sum, m) => sum + (m.membership_fee || 0), 0) || 0;

      // Get tournament statistics
      const { data: tournamentStats, error: tournamentError } = await this.supabase
        .from('tournaments')
        .select('status')
        .eq('club_id', clubId);

      if (tournamentError) throw tournamentError;

      const totalTournaments = tournamentStats?.length || 0;
      const activeTournaments = tournamentStats?.filter(t => t.status === 'active').length || 0;

      return {
        total_members: totalMembers,
        active_members: activeMembers,
        total_revenue: totalRevenue,
        monthly_revenue: 0, // TODO: Calculate monthly revenue
        total_tournaments: totalTournaments,
        active_tournaments: activeTournaments,
        total_tables: 0, // TODO: Get from club settings
        occupied_tables: 0, // TODO: Get from real-time data
        average_rating: 0, // TODO: Calculate from reviews
        total_reviews: 0, // TODO: Get from reviews table
      };
    } catch (error) {
      console.error('Error getting club stats:', error);
      throw error;
    }
  }

  /**
   * Get club members with pagination
   */
  async getClubMembers(
    clubId: string,
    page: number = 1,
    limit: number = 20,
    searchTerm?: string
  ): Promise<{
    members: ClubMember[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      let query = this.supabase
        .from('club_members')
        .select(`
          *,
          profiles (
            full_name,
            phone,
            verified_rank
          )
        `)
        .eq('club_id', clubId);

      // Apply search filter
      if (searchTerm) {
        query = query.or(
          `profiles.full_name.ilike.%${searchTerm}%,profiles.phone.ilike.%${searchTerm}%,membership_number.ilike.%${searchTerm}%`
        );
      }

      // Get total count
      const { count } = await this.supabase
        .from('club_members')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId);

      // Apply pagination
      const offset = (page - 1) * limit;
      const { data, error } = await query
        .order('join_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const members = (data || []).map(this.formatClubMember);
      const total = count || 0;
      const hasMore = offset + limit < total;

      return { members, total, hasMore };
    } catch (error) {
      console.error('Error getting club members:', error);
      throw error;
    }
  }

  /**
   * Add member to club
   */
  async addMember(clubId: string, memberData: MembershipData): Promise<ClubMember> {
    try {
      const membershipNumber = await this.generateMembershipNumber(clubId);

      const { data, error } = await this.supabase
        .from('club_members')
        .insert({
          user_id: memberData.user_id,
          club_id: clubId,
          membership_type: memberData.membership_type,
          membership_number: membershipNumber,
          membership_fee: memberData.membership_fee,
          status: 'active',
          join_date: new Date().toISOString(),
          total_visits: 0,
          total_hours_played: 0,
          outstanding_balance: 0,
          notes: memberData.notes,
        })
        .select(`
          *,
          profiles (
            full_name,
            phone,
            verified_rank
          )
        `)
        .single();

      if (error) throw error;

      return this.formatClubMember(data);
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  /**
   * Update member status
   */
  async updateMemberStatus(
    memberId: string,
    status: 'active' | 'inactive' | 'suspended' | 'expired'
  ): Promise<ClubMember> {
    try {
      const { data, error } = await this.supabase
        .from('club_members')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberId)
        .select(`
          *,
          profiles (
            full_name,
            phone,
            verified_rank
          )
        `)
        .single();

      if (error) throw error;

      return this.formatClubMember(data);
    } catch (error) {
      console.error('Error updating member status:', error);
      throw error;
    }
  }

  /**
   * Remove member from club
   */
  async removeMember(memberId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('club_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  /**
   * Get club settings
   */
  async getClubSettings(clubId: string): Promise<ClubSettings> {
    try {
      const { data, error } = await this.supabase
        .from('club_settings')
        .select('*')
        .eq('club_id', clubId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? this.formatClubSettings(data) : this.getDefaultClubSettings(clubId);
    } catch (error) {
      console.error('Error getting club settings:', error);
      return this.getDefaultClubSettings(clubId);
    }
  }

  /**
   * Update club settings
   */
  async updateClubSettings(
    clubId: string,
    updates: Partial<ClubSettings>
  ): Promise<ClubSettings> {
    try {
      const existingSettings = await this.getClubSettings(clubId);
      const updatedSettings = {
        ...existingSettings,
        ...updates,
        club_id: clubId,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('club_settings')
        .upsert(updatedSettings)
        .select()
        .single();

      if (error) throw error;

      return this.formatClubSettings(data);
    } catch (error) {
      console.error('Error updating club settings:', error);
      throw error;
    }
  }

  /**
   * Check if user is club owner
   */
  async isClubOwner(userId: string, clubId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('clubs')
        .select('user_id')
        .eq('id', clubId)
        .eq('user_id', userId)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Error checking club ownership:', error);
      return false;
    }
  }

  /**
   * Search available users for membership
   */
  async searchAvailableUsers(
    clubId: string,
    searchTerm: string,
    limit: number = 20
  ): Promise<any[]> {
    try {
      // Get current club members to exclude them
      const { data: existingMembers } = await this.supabase
        .from('club_members')
        .select('user_id')
        .eq('club_id', clubId);

      const excludeUserIds = existingMembers?.map(m => m.user_id) || [];

      let query = this.supabase
        .from('profiles')
        .select('user_id, full_name, phone, verified_rank')
        .or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(limit);

      if (excludeUserIds.length > 0) {
        query = query.not('user_id', 'in', `(${excludeUserIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching available users:', error);
      return [];
    }
  }

  /**
   * Generate unique membership number
   */
  private async generateMembershipNumber(clubId: string): Promise<string> {
    try {
      const { count } = await this.supabase
        .from('club_members')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId);

      const memberCount = (count || 0) + 1;
      const clubCode = clubId.substring(0, 4).toUpperCase();
      
      return `${clubCode}${memberCount.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating membership number:', error);
      return `CLUB${Date.now().toString().slice(-4)}`;
    }
  }

  /**
   * Format club data
   */
  private formatClub(data: any): Club {
    return {
      id: data.id,
      club_name: data.club_name,
      display_name: data.display_name,
      description: data.description,
      address: data.address,
      phone: data.phone,
      email: data.email,
      website: data.website,
      user_id: data.user_id,
      status: data.status || 'pending',
      verification_status: data.verification_status || 'unverified',
      avatar_url: data.avatar_url,
      cover_image_url: data.cover_image_url,
      founded_date: data.founded_date,
      operating_hours: data.operating_hours,
      amenities: data.amenities,
      social_media: data.social_media,
      settings: data.settings,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  /**
   * Format club member data
   */
  private formatClubMember(data: any): ClubMember {
    return {
      id: data.id,
      user_id: data.user_id,
      club_id: data.club_id,
      membership_type: data.membership_type,
      membership_number: data.membership_number,
      status: data.status,
      join_date: data.join_date,
      expiry_date: data.expiry_date,
      total_visits: data.total_visits || 0,
      last_visit: data.last_visit,
      total_hours_played: data.total_hours_played || 0,
      membership_fee: data.membership_fee || 0,
      outstanding_balance: data.outstanding_balance || 0,
      notes: data.notes,
      profiles: {
        full_name: data.profiles?.full_name || 'Unknown User',
        phone: data.profiles?.phone,
        verified_rank: data.profiles?.verified_rank,
      },
    };
  }

  /**
   * Format club settings data
   */
  private formatClubSettings(data: any): ClubSettings {
    return {
      club_id: data.club_id,
      general: data.general || this.getDefaultClubSettings(data.club_id).general,
      membership: data.membership || this.getDefaultClubSettings(data.club_id).membership,
      booking: data.booking || this.getDefaultClubSettings(data.club_id).booking,
      notifications: data.notifications || this.getDefaultClubSettings(data.club_id).notifications,
      features: data.features || this.getDefaultClubSettings(data.club_id).features,
    };
  }

  /**
   * Get default club settings
   */
  private getDefaultClubSettings(clubId: string): ClubSettings {
    return {
      club_id: clubId,
      general: {
        timezone: 'Asia/Ho_Chi_Minh',
        currency: 'VND',
        default_language: 'vi',
        business_hours: {
          monday: { open: '09:00', close: '22:00', is_closed: false },
          tuesday: { open: '09:00', close: '22:00', is_closed: false },
          wednesday: { open: '09:00', close: '22:00', is_closed: false },
          thursday: { open: '09:00', close: '22:00', is_closed: false },
          friday: { open: '09:00', close: '22:00', is_closed: false },
          saturday: { open: '09:00', close: '23:00', is_closed: false },
          sunday: { open: '10:00', close: '21:00', is_closed: false },
        },
      },
      membership: {
        auto_approve: false,
        require_verification: true,
        member_capacity: 100,
        default_membership_type: 'basic',
        trial_period_days: 7,
      },
      booking: {
        allow_public_booking: true,
        advance_booking_days: 7,
        cancellation_policy: '24 hours before',
        require_deposit: false,
        deposit_amount: 0,
      },
      notifications: {
        member_join: true,
        booking_confirmed: true,
        payment_received: true,
        tournament_updates: true,
        system_alerts: true,
      },
      features: {
        tournament_enabled: true,
        ranking_system: true,
        payment_integration: false,
        loyalty_program: false,
        analytics_dashboard: true,
      },
    };
  }
}
