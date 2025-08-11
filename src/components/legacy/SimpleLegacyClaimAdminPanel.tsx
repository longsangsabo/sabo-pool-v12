import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Phone, User, Gift, RotateCcw } from 'lucide-react';

interface SimpleClaimRequest {
  id: string;
  requester_full_name: string;
  requester_display_name: string;
  requester_phone: string;
  legacy_full_name: string;
  legacy_nick_name: string;
  legacy_spa_points: number;
  verification_phone: string;
  created_at: string;
  status: string;
}

export const SimpleLegacyClaimAdminPanel: React.FC = () => {
  console.log('🚀 SimpleLegacyClaimAdminPanel component mounting...');
  
  const [claimRequests, setClaimRequests] = useState<SimpleClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // Tải tất cả claim requests (đơn giản, không kiểm tra admin)
  const loadClaimRequests = async () => {
    console.log('🔍 SimpleLegacyClaimAdminPanel: Loading claim requests...');
    setLoading(true);
    try {
      // First try with RLS bypass for admin
      console.log('🔓 Trying to bypass RLS...');
      try {
        const { data: adminData, error: adminError } = await supabase
          .rpc('get_all_claim_requests_admin'); // Custom function if exists

        if (!adminError && adminData) {
          console.log('✅ Admin RPC success:', adminData);
          setClaimRequests(adminData || []);
          return;
        }
      } catch (rpcError) {
        console.log('⚠️ RPC function not found, falling back...');
      }

      // Fallback to direct table access
      console.log('📋 Falling back to direct table access...');
      const { data, error } = await supabase
        .from('legacy_spa_claim_requests')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Supabase Response:', { data, error });

      if (error) {
        console.error('❌ Error loading claim requests:', error);
        return;
      }

      console.log('✅ Loaded claim requests:', data);
      console.log('📈 Total requests:', data?.length || 0);
      
      // Debug: Also check legacy_spa_points table
      console.log('🔍 Checking legacy_spa_points table...');
      const { data: legacyData, error: legacyError } = await supabase
        .from('legacy_spa_points')
        .select('*')
        .ilike('full_name', '%ANH LONG%')
        .limit(5);
      
      console.log('📊 Legacy SPA Points matching "ANH LONG":', legacyData);
      
      setClaimRequests(data || []);
    } catch (error) {
      console.error('Error loading claim requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Đơn giản: Approve/Reject trực tiếp
  const handleAction = async (claimId: string, action: 'approved' | 'rejected') => {
    setProcessing(claimId);
    try {
      const { error } = await supabase
        .from('legacy_spa_claim_requests')
        .update({ 
          status: action,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', claimId);

      if (error) {
        console.error('Error updating claim:', error);
        alert(`Lỗi: ${error.message}`);
        return;
      }

      alert(action === 'approved' ? '✅ Đã approve claim!' : '❌ Đã reject claim!');
      loadClaimRequests();
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra!');
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    loadClaimRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  const pendingRequests = claimRequests.filter(req => req.status === 'pending');
  const processedRequests = claimRequests.filter(req => req.status !== 'pending');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="w-6 h-6" />
          Legacy Claims - Admin Panel (Simple)
        </h1>
        <Button onClick={loadClaimRequests} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button 
          onClick={async () => {
            console.log('🧪 Creating test claim request...');
            const { data, error } = await supabase
              .from('legacy_spa_claim_requests')
              .insert({
                requester_user_id: (await supabase.auth.getUser()).data.user?.id,
                requester_full_name: 'Test User',
                requester_display_name: 'Test Display',
                requester_phone: '0123456789',
                legacy_entry_id: '00000000-0000-0000-0000-000000000000', // Dummy ID
                legacy_full_name: 'ANH LONG MAGIC TEST',
                legacy_nick_name: 'ANH LONG MAGIC',
                legacy_spa_points: 100,
                verification_phone: '0961167717',
                status: 'pending'
              });
            console.log('🧪 Test insert result:', { data, error });
            if (!error) loadClaimRequests();
          }}
          variant="secondary" 
          size="sm"
        >
          🧪 Test Insert
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-yellow-500">{pendingRequests.length}</div>
                <div className="text-sm text-gray-500">Pending Claims</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {processedRequests.filter(r => r.status === 'approved').length}
                </div>
                <div className="text-sm text-gray-500">Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-500">
                  {processedRequests.filter(r => r.status === 'rejected').length}
                </div>
                <div className="text-sm text-gray-500">Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Claims Section */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pending Claims ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 bg-yellow-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{request.requester_full_name}</span>
                        {request.requester_display_name && (
                          <span className="text-gray-500">({request.requester_display_name})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{request.verification_phone}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        <span className="font-medium">{request.legacy_full_name}</span>
                        {request.legacy_nick_name && (
                          <span className="text-gray-500">({request.legacy_nick_name})</span>
                        )}
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {request.legacy_spa_points} SPA Points
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleAction(request.id, 'approved')}
                      disabled={processing === request.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleAction(request.id, 'rejected')}
                      disabled={processing === request.id}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processed Claims Section */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processed Claims ({processedRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {processedRequests.map((request) => (
                <div key={request.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <span className="font-medium">{request.requester_full_name}</span>
                    <span className="ml-2 text-gray-500">→ {request.legacy_spa_points} SPA</span>
                  </div>
                  <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                    {request.status === 'approved' ? 'Approved' : 'Rejected'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {claimRequests.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg text-gray-600">Chưa có claim request nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
