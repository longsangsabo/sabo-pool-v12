import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRankRequests } from '@/hooks/useRankRequests';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, XCircle, Clock, User, Trophy, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface AdminRankApprovalProps {
  className?: string;
}

export const AdminRankApproval: React.FC<AdminRankApprovalProps> = ({ className }) => {
  const { user } = useAuth();
  const {
    requests,
    loading,
    error,
    approveRankRequest,
    rejectRankRequest,
    fetchRankRequests
  } = useRankRequests();
  
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [bonusSPA, setBonusSPA] = useState<number>(0);
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    fetchRankRequests();
  }, []);

  const handleApprove = async (requestId: string) => {
    if (!user?.id) {
      toast.error('Authentication required');
      return;
    }

    setProcessing(true);
    try {
      const result = await approveRankRequest(requestId, user.id, {
        addBonusSPA: bonusSPA > 0 ? bonusSPA : undefined,
        notes: approvalNotes.trim() || undefined
      });

      if (result.success) {
        toast.success(`✅ Rank ${result.data?.newRank} approved successfully!`);
        setSelectedRequest(null);
        setBonusSPA(0);
        setApprovalNotes('');
        await fetchRankRequests();
      }
    } catch (error) {
      console.error('Approval failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve rank request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    if (!user?.id) {
      toast.error('Authentication required');
      return;
    }

    setProcessing(true);
    try {
      await rejectRankRequest(requestId, reason, user.id);
      toast.success('Rank request rejected');
      setSelectedRequest(null);
      await fetchRankRequests();
    } catch (error) {
      console.error('Rejection failed:', error);
      toast.error('Failed to reject rank request');
    } finally {
      setProcessing(false);
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const recentApprovals = requests.filter(req => req.status === 'approved').slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-600">
          Error loading rank requests: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Rank Requests ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending rank requests
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {request.user?.profiles?.display_name || 
                           request.user?.profiles?.full_name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.user?.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      <Badge variant="outline" className="bg-amber-50">
                        Rank {request.requested_rank}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={() => setSelectedRequest(request.id)}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    
                    <Button
                      onClick={() => handleReject(request.id, 'Manual rejection by admin')}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      disabled={processing}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>

                  {/* Approval Form */}
                  {selectedRequest === request.id && (
                    <div className="border-t pt-3 mt-3 space-y-3 bg-gray-50 p-3 rounded">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Bonus SPA Points (optional)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="1000"
                          value={bonusSPA}
                          onChange={(e) => setBonusSPA(Number(e.target.value))}
                          placeholder="0"
                          className="w-32"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Approval Notes (optional)
                        </label>
                        <Textarea
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                          placeholder="Optional notes for this approval..."
                          className="resize-none h-20"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(request.id)}
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processing ? 'Processing...' : 'Confirm Approval'}
                        </Button>
                        
                        <Button
                          onClick={() => setSelectedRequest(null)}
                          variant="outline"
                          disabled={processing}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Recent Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentApprovals.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No recent approvals
            </div>
          ) : (
            <div className="space-y-3">
              {recentApprovals.map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">
                        {request.user?.profiles?.full_name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Approved: {request.approved_at ? new Date(request.approved_at).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    Rank {request.requested_rank}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
