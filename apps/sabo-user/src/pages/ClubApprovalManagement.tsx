/**
 * Club Approval Management Page
 * Central place for club admins to manage pending approvals
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Users,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import ClubApprovalCard from '@/components/challenges/ClubApprovalCard';
import EnhancedChallengeCard from '@/components/challenges/EnhancedChallengeCard';

const ClubApprovalManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');

  // Mock data for testing
  const mockPendingApprovals = [
    {
      id: 'approval-1',
      challenger_id: 'user-1',
      opponent_id: 'user-2',
      challenger_score: 9,
      opponent_score: 6,
      status: 'ongoing',
      response_message: 'Score confirmed by both players',
      bet_points: 200,
      race_to: 9,
      club_id: 'club-1',
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      scheduled_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
      id: 'approval-2',
      challenger_id: 'user-3',
      opponent_id: 'user-4',
      challenger_score: 7,
      opponent_score: 9,
      status: 'ongoing',
      response_message: 'Score confirmed by both players',
      bet_points: 300,
      race_to: 9,
      club_id: 'club-1',
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      scheduled_time: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
    }
  ];

  const mockProfiles = {
    'user-1': { id: 'user-1', display_name: 'Nguyễn Văn A', spa_rank: 'I+', spa_points: 1350 },
    'user-2': { id: 'user-2', display_name: 'Trần Thị B', spa_rank: 'H', spa_points: 980 },
    'user-3': { id: 'user-3', display_name: 'Lê Văn C', spa_rank: 'G', spa_points: 750 },
    'user-4': { id: 'user-4', display_name: 'Phạm Thị D', spa_rank: 'I', spa_points: 1200 }
  };

  const mockCompletedApprovals = [
    {
      id: 'completed-1',
      challenger_id: 'user-5',
      opponent_id: 'user-6',
      challenger_score: 9,
      opponent_score: 3,
      status: 'completed',
      response_message: 'Club approved result',
      bet_points: 150,
      race_to: 9,
      club_id: 'club-1',
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      scheduled_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ];

  const allProfiles = {
    ...mockProfiles,
    'user-5': { id: 'user-5', display_name: 'Hoàng Văn E', spa_rank: 'H+', spa_points: 1100 },
    'user-6': { id: 'user-6', display_name: 'Ngô Thị F', spa_rank: 'G+', spa_points: 820 }
  };

  const handleApprovalComplete = (challengeId: string) => {
    console.log('Approval completed for challenge:', challengeId);
    // In real implementation, this would refetch data
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">CLB Quản lý Phê duyệt</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Trung tâm quản lý phê duyệt kết quả trận đấu
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chờ phê duyệt</p>
                <p className="text-2xl font-bold text-purple-600">{mockPendingApprovals.length}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đã phê duyệt hôm nay</p>
                <p className="text-2xl font-bold text-green-600">8</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tranh chấp</p>
                <p className="text-2xl font-bold text-red-600">2</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">SPA đã chuyển</p>
                <p className="text-2xl font-bold text-blue-600">2,450</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Chờ phê duyệt ({mockPendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Đã xử lý
          </TabsTrigger>
          <TabsTrigger value="disputed" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Tranh chấp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {mockPendingApprovals.length > 0 ? (
            <div className="space-y-4">
              {mockPendingApprovals.map((challenge) => (
                <ClubApprovalCard
                  key={challenge.id}
                  challenge={challenge}
                  challengerProfile={mockProfiles[challenge.challenger_id]}
                  opponentProfile={mockProfiles[challenge.opponent_id]}
                  isClubAdmin={true}
                  onApprovalComplete={() => handleApprovalComplete(challenge.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Không có kết quả cần phê duyệt
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Tất cả các trận đấu đã được xử lý
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="space-y-4">
            {mockCompletedApprovals.map((challenge) => (
              <Card key={challenge.id} className="border-l-4 border-l-green-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">
                          {allProfiles[challenge.challenger_id]?.display_name} vs {allProfiles[challenge.opponent_id]?.display_name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Kết quả: {challenge.challenger_score}-{challenge.opponent_score}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Đã phê duyệt
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    Bet: {challenge.bet_points} SPA • Race to {challenge.race_to}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="disputed" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Không có tranh chấp
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Hiện tại không có trận đấu nào bị tranh chấp
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hành động nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <Users className="w-4 h-4 mr-2" />
              Xem tất cả trận đấu CLB
            </Button>
            <Button variant="outline" className="justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Báo cáo SPA hôm nay
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubApprovalManagement;
