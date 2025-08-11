import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Phone, 
  User, 
  Gift,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface ClaimRequest {
  id: string;
  requester_full_name: string;
  requester_display_name: string;
  requester_phone: string;
  legacy_full_name: string;
  legacy_nick_name: string;
  legacy_spa_points: number;
  verification_phone: string;
  verification_notes: string;
  created_at: string;
  days_pending: number;
}

export const LegacyClaimAdminPanel: React.FC = () => {
  console.log('🚀 LegacyClaimAdminPanel component mounting...');
  
  const { user } = useAuth();
  const [claimRequests, setClaimRequests] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    console.log('🔄 useEffect [user] triggered. User:', user?.id);
    checkAuthorization();
  }, [user]);

  useEffect(() => {
    console.log('🔄 useEffect [isAuthorized] triggered. isAuthorized:', isAuthorized);
    if (isAuthorized) {
      loadClaimRequests();
    }
  }, [isAuthorized]);

    const checkAuthorization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔐 Current user:', user?.id);
      
      if (!user) {
        setIsAuthorized(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, full_name, display_name')
        .eq('user_id', user.id)
        .single();

      console.log('👤 User profile:', profile);

      const { data: clubProfiles } = await supabase
        .from('club_profiles')
        .select('club_name, verification_status')
        .eq('user_id', user.id)
        .eq('verification_status', 'approved');

      console.log('🏢 Club profiles:', clubProfiles);

      const isSaboClubOwner = clubProfiles?.some(club => 
        club.club_name.toLowerCase().includes('sabo') ||
        club.club_name.toLowerCase().includes('sbo') ||
        club.club_name.toLowerCase().includes('pool arena')
      );

      console.log('🔑 Authorization check:', {
        isAdmin: profile?.is_admin,
        isSaboClubOwner,
        finalAuth: profile?.is_admin || isSaboClubOwner
      });

      setIsAuthorized(profile?.is_admin || isSaboClubOwner || false);
    } catch (error) {
      console.error('Authorization check error:', error);
      setIsAuthorized(false);
    }
  };

  const loadClaimRequests = async () => {
    setLoading(true);
    try {
      console.log('🔍 Calling get_pending_claim_requests...');
      // @ts-ignore - Database function not in types yet
      const { data, error } = await supabase.rpc('get_pending_claim_requests');
      
      console.log('📊 RPC Response:', { data, error });
      
      if (error) {
        console.error('Error loading claim requests:', error);
        return;
      }

      console.log('✅ Claim requests loaded:', data);
      // @ts-ignore - Database function return type
      setClaimRequests(data || []);
    } catch (error) {
      console.error('Error loading claim requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClaim = async (
    claimId: string, 
    action: 'approve' | 'reject',
    adminNotes?: string,
    rejectionReason?: string
  ) => {
    setProcessing(claimId);
    try {
      // @ts-ignore - Database function not in types yet
      const { data, error } = await supabase.rpc('review_legacy_spa_claim_request', {
        p_claim_request_id: claimId,
        p_action: action,
        p_admin_notes: adminNotes,
        p_rejection_reason: rejectionReason
      });

      if (error) {
        console.error('Review error:', error);
        alert(`Có lỗi xảy ra: ${error.message}`);
        return;
      }

      // @ts-ignore - Database function return type
      if (data?.success) {
        // @ts-ignore - Database function return type
        alert(`✅ ${data.message}`);
        loadClaimRequests(); // Refresh list
      } else {
        // @ts-ignore - Database function return type
        alert(`❌ ${data?.error || 'Không thể xử lý yêu cầu'}`);
      }
    } catch (error) {
      console.error('Review error:', error);
      alert('Có lỗi xảy ra khi xử lý yêu cầu');
    } finally {
      setProcessing(null);
    }
  };

  const handleApprove = (request: ClaimRequest) => {
    const notes = window.prompt(
      `Xác nhận chuyển ${request.legacy_spa_points.toLocaleString()} SPA Points cho ${request.requester_full_name}?\n\nGhi chú (tùy chọn):`,
      `Đã xác thực danh tính qua điện thoại ${request.verification_phone}`
    );

    if (notes !== null) { // User didn't cancel
      handleReviewClaim(request.id, 'approve', notes || undefined);
    }
  };

  const handleReject = (request: ClaimRequest) => {
    const reason = window.prompt(
      `Từ chối claim request từ ${request.requester_full_name}?\n\nLý do từ chối:`,
      ''
    );

    if (reason && reason.trim()) {
      handleReviewClaim(request.id, 'reject', undefined, reason.trim());
    }
  };

  if (!isAuthorized) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Không có quyền truy cập
        </h3>
        <p className="text-gray-600">
          Chỉ SABO admin và club owners có thể xem panel này.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải danh sách claim requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            🛡️ SABO Admin - Legacy Claim Management
          </h2>
          <p className="text-gray-600 mt-1">
            Xử lý yêu cầu claim SPA Points từ hệ thống legacy
          </p>
        </div>
        <Button 
          onClick={loadClaimRequests}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {claimRequests.length}
                </p>
                <p className="text-sm text-gray-600">Pending Claims</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {claimRequests.reduce((sum, req) => sum + req.legacy_spa_points, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total SPA Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {claimRequests.filter(req => req.days_pending >= 3).length}
                </p>
                <p className="text-sm text-gray-600">Overdue (3+ days)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claim Requests List */}
      {claimRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Không có claim requests pending
            </h3>
            <p className="text-gray-600">
              Tất cả yêu cầu claim đã được xử lý.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {claimRequests.map((request) => (
            <Card key={request.id} className={`${
              request.days_pending >= 3 ? 'border-red-200 bg-red-50' : 
              request.days_pending >= 1 ? 'border-yellow-200 bg-yellow-50' : 
              'border-gray-200'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Claim Request #{request.id.slice(0, 8)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      request.days_pending >= 3 ? 'destructive' : 
                      request.days_pending >= 1 ? 'secondary' : 
                      'default'
                    }>
                      {request.days_pending} ngày
                    </Badge>
                    <Badge variant="outline">
                      {request.legacy_spa_points.toLocaleString()} SPA
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Người yêu cầu
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Tên:</strong> {request.requester_full_name}</p>
                      <p><strong>Display:</strong> {request.requester_display_name}</p>
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <strong>SĐT:</strong> {request.verification_phone}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Legacy Account
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Tên:</strong> {request.legacy_full_name}</p>
                      <p><strong>Nickname:</strong> {request.legacy_nick_name}</p>
                      <p><strong>SPA Points:</strong> {request.legacy_spa_points.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-3">
                    <strong>Ngày tạo:</strong> {new Date(request.created_at).toLocaleString('vi-VN')}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleApprove(request)}
                      disabled={processing === request.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {processing === request.id ? 'Đang xử lý...' : 'Xác nhận'}
                    </Button>
                    
                    <Button
                      onClick={() => handleReject(request)}
                      disabled={processing === request.id}
                      variant="destructive"
                      size="sm"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Từ chối
                    </Button>

                    <a 
                      href={`tel:${request.verification_phone}`}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Phone className="w-3 h-3" />
                      Gọi {request.verification_phone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
