import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Gift, Users, Award, Search, User, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SimpleClaim {
  id: number;
  user_id?: string; // Optional for backward compatibility
  user_email: string;
  user_name: string;
  user_phone: string;
  legacy_name: string;
  spa_points: number;
  status: string;
  admin_notes: string;
  created_at: string;
  processed_at: string;
}

export const UltraSimpleClaimPanel: React.FC = () => {
  const [claims, setClaims] = useState<SimpleClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const { user } = useAuth();

  const loadClaims = async () => {
    console.log('🔍 Loading simple claims...');
    try {
      const { data, error } = await supabase
        .from('simple_legacy_claims' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading claims:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách claims",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Loaded claims:', data);
      setClaims(data || []);
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast({
        title: "Lỗi",
        description: "Lỗi không mong muốn khi tải claims",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const findUserProfile = async (userId: string | undefined, email: string, phone: string) => {
    let userProfile = null;
    let searchMethod = '';
    let searchDetails = '';

    // Bước 1: ⚡ Ưu tiên tìm theo user_id (nhanh nhất và chính xác nhất)
    if (userId) {
      console.log(`🎯 [PRIORITY] Searching user profile by user_id: ${userId}`);
      const { data: userById, error: idError } = await supabase
        .from('user_profiles')
        .select('id, current_spa_points, email, phone, full_name')
        .eq('id', userId)
        .single();

      if (!idError && userById) {
        userProfile = userById;
        searchMethod = 'user_id';
        searchDetails = `user_id: ${userId} (email: ${userById.email})`;
        console.log(`✅ [FAST] Found user by user_id: ${userId} (email: ${userById.email})`);
        return { userProfile, searchMethod, searchDetails };
      } else {
        console.log(`❌ No user found by user_id: ${userId}, fallback to email/phone search`);
      }
    }

    // Bước 2: Tìm user_profile theo email (fallback)
    console.log(`�� [FALLBACK] Searching user profile by email: ${email}`);
    const { data: userByEmail, error: emailError } = await supabase
      .from('user_profiles')
      .select('id, current_spa_points, email, phone, full_name')
      .eq('email', email)
      .single();

    if (!emailError && userByEmail) {
      userProfile = userByEmail;
      searchMethod = 'email';
      searchDetails = `email: ${email}`;
      console.log(`✅ Found user by email: ${email}`);
    } else {
      console.log(`❌ No user found by email: ${email}`);
      
      // Bước 3: Nếu không tìm thấy bằng email, thử tìm bằng số điện thoại
      if (phone && phone.trim()) {
        console.log(`🔍 Searching user profile by phone: ${phone}`);
        const { data: userByPhone, error: phoneError } = await supabase
          .from('user_profiles')
          .select('id, current_spa_points, email, phone, full_name')
          .eq('phone', phone)
          .single();

        if (!phoneError && userByPhone) {
          userProfile = userByPhone;
          searchMethod = 'phone';
          searchDetails = `số điện thoại: ${phone} (email tài khoản: ${userByPhone.email})`;
          console.log(`✅ Found user by phone: ${phone} (email: ${userByPhone.email})`);
        } else {
          console.log(`❌ No user found by phone: ${phone}`);
          
          // Bước 4: Thử tìm bằng phone với format khác (loại bỏ ký tự đặc biệt)
          const cleanPhone = phone.replace(/[^\d]/g, '');
          if (cleanPhone.length >= 9) {
            console.log(`🔍 Searching user profile by clean phone: ${cleanPhone}`);
            const { data: userByCleanPhone, error: cleanPhoneError } = await supabase
              .from('user_profiles')
              .select('id, current_spa_points, email, phone, full_name')
              .or(`phone.eq.${cleanPhone},phone.like.%${cleanPhone}%`)
              .single();

            if (!cleanPhoneError && userByCleanPhone) {
              userProfile = userByCleanPhone;
              searchMethod = 'clean_phone';
              searchDetails = `số điện thoại (cleaned): ${cleanPhone} → ${userByCleanPhone.phone} (email: ${userByCleanPhone.email})`;
              console.log(`✅ Found user by clean phone: ${cleanPhone} → ${userByCleanPhone.phone}`);
            }
          }
        }
      }
    }

    return { userProfile, searchMethod, searchDetails };
  };

  const createUserProfile = async (email: string, name: string, phone: string, spaPoints: number) => {
    console.log(`🚀 [ADMIN FORCE] Creating new user profile for: ${email}`);
    
    // Tạo user profile mới với SPA points
    const { data: newUser, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        email: email,
        full_name: name,
        phone: phone,
        current_spa_points: spaPoints,
        display_name: name,
        created_at: new Date().toISOString()
      })
      .select('id, email, full_name, current_spa_points')
      .single();

    if (createError) {
      console.error('❌ Error creating user profile:', createError);
      throw new Error(`Failed to create user profile: ${createError.message}`);
    }

    console.log(`✅ [ADMIN FORCE] Created new user profile:`, newUser);
    return newUser;
  };

  const handleClaim = async (claimId: number, action: 'approve' | 'reject' | 'force_approve', claim: SimpleClaim) => {
    if (!user) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để thực hiện hành động này",
        variant: "destructive"
      });
      return;
    }

    setProcessing(claimId);
    console.log(`🎯 ${action} claim ${claimId}`);
    
    try {
      let adminNotes = `${action === 'approve' ? 'Approved' : action === 'force_approve' ? 'Force Approved (Admin Override)' : 'Rejected'} by admin ${user.email} on ${new Date().toLocaleString()}`;

      // Nếu approve hoặc force_approve, thêm SPA points vào user_profiles
      if (action === 'approve' || action === 'force_approve') {
        let userProfile = null;
        let searchMethod = '';
        let searchDetails = '';

        if (action === 'force_approve') {
          // Force Approve: Tạo user mới nếu không tìm thấy
          try {
            const result = await findUserProfile(claim.user_id, claim.user_email, claim.user_phone);
            userProfile = result.userProfile;
            searchMethod = result.searchMethod;
            searchDetails = result.searchDetails;

            if (!userProfile) {
              // Tạo user profile mới
              userProfile = await createUserProfile(claim.user_email, claim.user_name, claim.user_phone, claim.spa_points);
              searchMethod = 'force_created';
              searchDetails = `tạo mới user profile với email: ${claim.user_email}`;
              adminNotes += `. ✅ [ADMIN FORCE] User profile created and SPA points added: +${claim.spa_points} (total: ${claim.spa_points})`;
            } else {
              // User đã tồn tại, cập nhật SPA points
              const newSpaPoints = (userProfile.current_spa_points || 0) + claim.spa_points;
              const { error: updateSpaError } = await supabase
                .from('user_profiles')
                .update({ current_spa_points: newSpaPoints })
                .eq('id', userProfile.id);

              if (updateSpaError) {
                throw new Error(`Failed to update SPA points: ${updateSpaError.message}`);
              }

              searchDetails += ` → SPA points updated`;
              adminNotes += `. ✅ [ADMIN FORCE] User found by ${searchDetails}. SPA points added: +${claim.spa_points} (total: ${newSpaPoints})`;
            }

            toast({
              title: "🔥 Force Approved!",
              description: `Admin override successful! +${claim.spa_points} SPA points processed (${searchMethod === 'force_created' ? 'user created' : 'user found'})`,
              variant: "default"
            });

          } catch (error) {
            console.error('❌ Force approve error:', error);
            adminNotes += `. ❌ [ADMIN FORCE] ERROR: ${error.message}`;
            toast({
              title: "Lỗi Force Approve",
              description: `Không thể force approve: ${error.message}`,
              variant: "destructive"
            });
          }

        } else {
          // Normal Approve: Chỉ cập nhật nếu tìm thấy user
          const result = await findUserProfile(claim.user_id, claim.user_email, claim.user_phone);
          userProfile = result.userProfile;
          searchMethod = result.searchMethod;
          searchDetails = result.searchDetails;

          if (!userProfile) {
            console.error('❌ User not found by any method');
            
            // Vẫn approve claim nhưng ghi chú rằng không tìm thấy user
            const searchAttempted = claim.user_id 
              ? `user_id (${claim.user_id}), email (${claim.user_email})${claim.user_phone ? `, phone (${claim.user_phone})` : ''}`
              : `email (${claim.user_email})${claim.user_phone ? ` or phone (${claim.user_phone})` : ''}`;
            
            adminNotes += `. ⚠️ WARNING: User profile not found by ${searchAttempted}. SPA points not added. Use Force Approve to create user.`;
            
            toast({
              title: "Cảnh báo",
              description: `Claim approved nhưng không tìm thấy user. Dùng "Force Approve" để tạo user mới.`,
              variant: "destructive"
            });
          } else {
            // Cập nhật SPA points
            const newSpaPoints = (userProfile.current_spa_points || 0) + claim.spa_points;
            const { error: updateSpaError } = await supabase
              .from('user_profiles')
              .update({ current_spa_points: newSpaPoints })
              .eq('id', userProfile.id);

            if (updateSpaError) {
              console.error('❌ Error updating SPA points:', updateSpaError);
              adminNotes += `. ❌ ERROR: Failed to update SPA points.`;
              toast({
                title: "Cảnh báo",
                description: `Claim approved nhưng không thể cập nhật SPA points`,
                variant: "destructive"
              });
            } else {
              console.log(`✅ Updated SPA points for user found by ${searchMethod}: +${claim.spa_points} (total: ${newSpaPoints})`);
              adminNotes += `. ✅ User found by ${searchDetails}. SPA points added: +${claim.spa_points} (total: ${newSpaPoints})`;
              
              const searchDisplayText = searchMethod === 'user_id' ? 'user ID (nhanh)' : searchMethod;
              
              toast({
                title: "Thành công",
                description: `Claim approved! +${claim.spa_points} SPA points đã được cộng (tìm thấy qua ${searchDisplayText})`,
                variant: "default"
              });
            }
          }
        }
      }

      // Cập nhật status và admin notes trong simple_legacy_claims
      const { error: updateError } = await supabase
        .from('simple_legacy_claims' as any)
        .update({ 
          status: (action === 'approve' || action === 'force_approve') ? 'approved' : 'rejected',
          admin_notes: adminNotes,
          processed_at: new Date().toISOString()
        })
        .eq('id', claimId);

      if (updateError) {
        console.error(`❌ Error ${action}ing claim:`, updateError);
        toast({
          title: "Lỗi",
          description: `Không thể ${action} claim`,
          variant: "destructive"
        });
        return;
      }

      if (action === 'reject') {
        toast({
          title: "Thành công",
          description: `Claim đã được reject!`,
          variant: "default"
        });
      }

      console.log(`✅ Claim ${action}d successfully`);
      loadClaims(); // Reload claims
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast({
        title: "Lỗi",
        description: "Lỗi không mong muốn",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Gift className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const pendingClaims = claims.filter(claim => claim.status === 'pending');
  const processedClaims = claims.filter(claim => claim.status !== 'pending');
  const totalSpaPoints = claims.reduce((sum, claim) => claim.status === 'approved' ? sum + claim.spa_points : sum, 0);

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-lg text-gray-600">Đang tải danh sách claims...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Legacy Claims Management</h1>
          <p className="text-gray-600">Quản lý và phê duyệt các yêu cầu claim SPA points từ legacy system</p>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center text-blue-800">
              <Search className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                ⚡ Tự động tìm user theo: <strong>User ID (ưu tiên)</strong> → Email → Số điện thoại → Số điện thoại (cleaned)
              </span>
            </div>
          </div>
          <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center text-orange-800">
              <Shield className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                🔥 <strong>Force Approve</strong>: Admin có thể tạo user mới và cấp SPA points ngay cả khi không tìm thấy user profile
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingClaims.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {claims.filter(c => c.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {claims.filter(c => c.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total SPA Approved</p>
                  <p className="text-2xl font-bold text-blue-600">{totalSpaPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Claims */}
        {pendingClaims.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 text-yellow-500 mr-2" />
              Pending Claims ({pendingClaims.length})
            </h2>
            <div className="space-y-4">
              {pendingClaims.map((claim) => (
                <Card key={claim.id} className="border-l-4 border-l-yellow-400">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        Claim #{claim.id}
                        {claim.user_id && (
                          <Badge variant="outline" className="text-green-600 border-green-300">
                            ⚡ Has User ID
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(claim.status)}
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">User Info</div>
                        <div className="space-y-1">
                          {claim.user_id && (
                            <div className="text-xs font-mono bg-green-50 text-green-700 px-2 py-1 rounded">
                              ID: {claim.user_id}
                            </div>
                          )}
                          <div className="font-medium">{claim.user_name}</div>
                          <div className="text-sm text-gray-600">{claim.user_email}</div>
                          {claim.user_phone && (
                            <div className="text-sm text-gray-600">📱 {claim.user_phone}</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Legacy Name</div>
                        <div className="font-medium text-blue-600">{claim.legacy_name}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">SPA Points</div>
                        <div className="font-bold text-xl text-green-600">{claim.spa_points}</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-500 mb-1">Created</div>
                      <div className="text-sm">{new Date(claim.created_at).toLocaleString()}</div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => handleClaim(claim.id, 'approve', claim)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={processing === claim.id}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {processing === claim.id ? 'Processing...' : 'Approve & Add SPA'}
                      </Button>
                      <Button
                        onClick={() => handleClaim(claim.id, 'force_approve', claim)}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={processing === claim.id}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        {processing === claim.id ? 'Processing...' : 'Force Approve (Admin)'}
                      </Button>
                      <Button
                        onClick={() => handleClaim(claim.id, 'reject', claim)}
                        variant="destructive"
                        disabled={processing === claim.id}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {processing === claim.id ? 'Processing...' : 'Reject'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Processed Claims */}
        {processedClaims.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 text-gray-500 mr-2" />
              Processed Claims ({processedClaims.length})
            </h2>
            <div className="space-y-4">
              {processedClaims.map((claim) => (
                <Card key={claim.id} className={`${claim.status === 'approved' ? 'border-l-4 border-l-green-400' : 'border-l-4 border-l-red-400'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        Claim #{claim.id}
                        {claim.user_id && (
                          <Badge variant="outline" className="text-green-600 border-green-300">
                            ⚡ User ID
                          </Badge>
                        )}
                        {claim.admin_notes?.includes('Force Approved') && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            🔥 Force Approved
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(claim.status)}
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">User Info</div>
                        <div className="space-y-1">
                          {claim.user_id && (
                            <div className="text-xs font-mono bg-green-50 text-green-700 px-2 py-1 rounded">
                              ID: {claim.user_id}
                            </div>
                          )}
                          <div className="font-medium">{claim.user_name}</div>
                          <div className="text-sm text-gray-600">{claim.user_email}</div>
                          {claim.user_phone && (
                            <div className="text-sm text-gray-600">📱 {claim.user_phone}</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Legacy Name</div>
                        <div className="font-medium text-blue-600">{claim.legacy_name}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">SPA Points</div>
                        <div className={`font-bold text-xl ${claim.status === 'approved' ? 'text-green-600' : 'text-gray-400'}`}>
                          {claim.spa_points}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Processed</div>
                        <div className="text-sm">{claim.processed_at ? new Date(claim.processed_at).toLocaleString() : 'N/A'}</div>
                      </div>
                    </div>
                    
                    {claim.admin_notes && (
                      <div className="mb-2">
                        <div className="text-sm font-medium text-gray-500 mb-1">Admin Notes</div>
                        <div className={`text-sm p-3 rounded border-l-4 ${
                          claim.admin_notes.includes('Force Approved') 
                            ? 'bg-orange-50 border-l-orange-300 text-orange-800'
                            : claim.admin_notes.includes('WARNING')
                            ? 'bg-red-50 border-l-red-300 text-red-800'
                            : 'bg-gray-50 border-l-blue-300 text-gray-800'
                        }`}>
                          {claim.admin_notes}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {claims.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Claims Found</h3>
              <p className="text-gray-600">Hiện tại chưa có legacy claims nào để xử lý.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UltraSimpleClaimPanel;
