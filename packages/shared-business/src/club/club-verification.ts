/**
 * CLUB VERIFICATION BUSINESS LOGIC
 * Consolidated from club verification and approval components
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ===== TYPES =====
export interface ClubVerificationRequest {
  id: string;
  club_id: string;
  requested_by: string;
  verification_type: 'initial' | 'renewal' | 'update';
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  documents: {
    business_license?: string;
    insurance_certificate?: string;
    venue_photos?: string[];
    owner_identification?: string;
    tax_registration?: string;
  };
  verification_data: {
    club_name: string;
    address: string;
    phone: string;
    email: string;
    operating_hours: any;
    table_count: number;
    amenities: string[];
  };
  admin_notes?: string;
  rejection_reason?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationDocument {
  id: string;
  club_id: string;
  document_type: 'business_license' | 'insurance' | 'venue_photos' | 'identification' | 'tax_registration';
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_by: string;
  verified: boolean;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  created_at: string;
}

export interface VerificationCriteria {
  required_documents: string[];
  minimum_table_count: number;
  required_amenities: string[];
  verification_steps: string[];
}

export interface VerificationProgress {
  total_steps: number;
  completed_steps: number;
  current_step: string;
  progress_percentage: number;
  missing_requirements: string[];
}

// ===== CLUB VERIFICATION SERVICE =====
export class ClubVerificationService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Submit verification request
   */
  async submitVerificationRequest(
    clubId: string,
    userId: string,
    verificationData: any,
    documents: any
  ): Promise<ClubVerificationRequest> {
    try {
      const { data, error } = await this.supabase
        .from('club_verification_requests')
        .insert({
          club_id: clubId,
          requested_by: userId,
          verification_type: 'initial',
          status: 'pending',
          documents,
          verification_data: verificationData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update club verification status
      await this.supabase
        .from('clubs')
        .update({ verification_status: 'pending' })
        .eq('id', clubId);

      return this.formatVerificationRequest(data);
    } catch (error) {
      console.error('Error submitting verification request:', error);
      throw error;
    }
  }

  /**
   * Get verification request by club ID
   */
  async getVerificationRequest(clubId: string): Promise<ClubVerificationRequest | null> {
    try {
      const { data, error } = await this.supabase
        .from('club_verification_requests')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? this.formatVerificationRequest(data) : null;
    } catch (error) {
      console.error('Error getting verification request:', error);
      return null;
    }
  }

  /**
   * Update verification request status (Admin only)
   */
  async updateVerificationStatus(
    requestId: string,
    status: 'approved' | 'rejected' | 'under_review',
    adminId: string,
    notes?: string,
    rejectionReason?: string
  ): Promise<ClubVerificationRequest> {
    try {
      const updateData: any = {
        status,
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      };

      if (status === 'approved') {
        updateData.verified_by = adminId;
        updateData.verified_at = new Date().toISOString();
      } else if (status === 'rejected') {
        updateData.rejection_reason = rejectionReason;
      }

      const { data, error } = await this.supabase
        .from('club_verification_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      // Update club verification status
      const clubVerificationStatus = status === 'approved' ? 'verified' : 'unverified';
      await this.supabase
        .from('clubs')
        .update({ verification_status: clubVerificationStatus })
        .eq('id', data.club_id);

      return this.formatVerificationRequest(data);
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw error;
    }
  }

  /**
   * Upload verification document
   */
  async uploadVerificationDocument(
    clubId: string,
    userId: string,
    documentType: string,
    file: File
  ): Promise<VerificationDocument> {
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${clubId}-${documentType}-${Date.now()}.${fileExt}`;
      const filePath = `verification-documents/${fileName}`;

      const { error: uploadError } = await this.supabase.storage
        .from('club-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('club-documents')
        .getPublicUrl(filePath);

      // Save document record
      const { data, error } = await this.supabase
        .from('club_verification_documents')
        .insert({
          club_id: clubId,
          document_type: documentType,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          uploaded_by: userId,
          verified: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return this.formatVerificationDocument(data);
    } catch (error) {
      console.error('Error uploading verification document:', error);
      throw error;
    }
  }

  /**
   * Get verification documents for club
   */
  async getVerificationDocuments(clubId: string): Promise<VerificationDocument[]> {
    try {
      const { data, error } = await this.supabase
        .from('club_verification_documents')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.formatVerificationDocument);
    } catch (error) {
      console.error('Error getting verification documents:', error);
      return [];
    }
  }

  /**
   * Verify document (Admin only)
   */
  async verifyDocument(
    documentId: string,
    adminId: string,
    verified: boolean,
    notes?: string
  ): Promise<VerificationDocument> {
    try {
      const updateData: any = {
        verified,
        notes,
        updated_at: new Date().toISOString(),
      };

      if (verified) {
        updateData.verified_by = adminId;
        updateData.verified_at = new Date().toISOString();
      }

      const { data, error } = await this.supabase
        .from('club_verification_documents')
        .update(updateData)
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;

      return this.formatVerificationDocument(data);
    } catch (error) {
      console.error('Error verifying document:', error);
      throw error;
    }
  }

  /**
   * Get verification criteria
   */
  getVerificationCriteria(): VerificationCriteria {
    return {
      required_documents: [
        'business_license',
        'insurance_certificate',
        'venue_photos',
        'owner_identification',
      ],
      minimum_table_count: 2,
      required_amenities: ['billiard_tables', 'seating_area'],
      verification_steps: [
        'Submit club information',
        'Upload required documents',
        'Venue verification',
        'Admin review',
        'Approval/Rejection',
      ],
    };
  }

  /**
   * Calculate verification progress
   */
  async calculateVerificationProgress(clubId: string): Promise<VerificationProgress> {
    try {
      const criteria = this.getVerificationCriteria();
      const documents = await this.getVerificationDocuments(clubId);
      const verificationRequest = await this.getVerificationRequest(clubId);

      let completedSteps = 0;
      const totalSteps = criteria.verification_steps.length;
      const missingRequirements: string[] = [];

      // Step 1: Club information submitted
      if (verificationRequest) {
        completedSteps++;
      } else {
        missingRequirements.push('Submit club information');
      }

      // Step 2: Required documents uploaded
      const uploadedDocTypes = documents.map(doc => doc.document_type);
      const missingDocs = criteria.required_documents.filter(
        docType => !uploadedDocTypes.includes(docType as any)
      );

      if (missingDocs.length === 0) {
        completedSteps++;
      } else {
        missingRequirements.push(`Upload missing documents: ${missingDocs.join(', ')}`);
      }

      // Step 3: Documents verified
      const verifiedDocs = documents.filter(doc => doc.verified);
      if (verifiedDocs.length >= criteria.required_documents.length) {
        completedSteps++;
      } else {
        missingRequirements.push('Documents pending verification');
      }

      // Step 4: Admin review
      if (verificationRequest?.status === 'under_review') {
        completedSteps++;
      } else if (verificationRequest?.status === 'pending') {
        missingRequirements.push('Waiting for admin review');
      }

      // Step 5: Final approval
      if (verificationRequest?.status === 'approved') {
        completedSteps++;
      }

      const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
      const currentStep = criteria.verification_steps[completedSteps] || 'Completed';

      return {
        total_steps: totalSteps,
        completed_steps: completedSteps,
        current_step: currentStep,
        progress_percentage: progressPercentage,
        missing_requirements: missingRequirements,
      };
    } catch (error) {
      console.error('Error calculating verification progress:', error);
      return {
        total_steps: 5,
        completed_steps: 0,
        current_step: 'Submit club information',
        progress_percentage: 0,
        missing_requirements: ['Submit club information'],
      };
    }
  }

  /**
   * Get all pending verification requests (Admin only)
   */
  async getPendingVerificationRequests(): Promise<ClubVerificationRequest[]> {
    try {
      const { data, error } = await this.supabase
        .from('club_verification_requests')
        .select(`
          *,
          clubs (
            club_name,
            address
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.formatVerificationRequest);
    } catch (error) {
      console.error('Error getting pending verification requests:', error);
      return [];
    }
  }

  /**
   * Check if club can submit verification request
   */
  async canSubmitVerificationRequest(clubId: string): Promise<{
    canSubmit: boolean;
    reason?: string;
  }> {
    try {
      const existingRequest = await this.getVerificationRequest(clubId);

      if (existingRequest && existingRequest.status === 'pending') {
        return {
          canSubmit: false,
          reason: 'Đã có yêu cầu xác minh đang chờ xử lý',
        };
      }

      if (existingRequest && existingRequest.status === 'under_review') {
        return {
          canSubmit: false,
          reason: 'Yêu cầu xác minh đang được xem xét',
        };
      }

      return { canSubmit: true };
    } catch (error) {
      console.error('Error checking verification request eligibility:', error);
      return {
        canSubmit: false,
        reason: 'Có lỗi xảy ra khi kiểm tra',
      };
    }
  }

  /**
   * Format verification request data
   */
  private formatVerificationRequest(data: any): ClubVerificationRequest {
    return {
      id: data.id,
      club_id: data.club_id,
      requested_by: data.requested_by,
      verification_type: data.verification_type,
      status: data.status,
      documents: data.documents || {},
      verification_data: data.verification_data || {},
      admin_notes: data.admin_notes,
      rejection_reason: data.rejection_reason,
      verified_by: data.verified_by,
      verified_at: data.verified_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  /**
   * Format verification document data
   */
  private formatVerificationDocument(data: any): VerificationDocument {
    return {
      id: data.id,
      club_id: data.club_id,
      document_type: data.document_type,
      file_name: data.file_name,
      file_url: data.file_url,
      file_size: data.file_size || 0,
      uploaded_by: data.uploaded_by,
      verified: data.verified || false,
      verified_by: data.verified_by,
      verified_at: data.verified_at,
      notes: data.notes,
      created_at: data.created_at,
    };
  }
}
