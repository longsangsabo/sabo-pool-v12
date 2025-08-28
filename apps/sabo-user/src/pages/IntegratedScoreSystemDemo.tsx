/**
 * Enhanced Score Submission System Integration
 * Integrates score submission directly into ongoing challenges
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Trophy, 
  ArrowRight, 
  Shield, 
  Users,
  Star
} from 'lucide-react';
import EnhancedChallengeCard from '@/components/challenges/EnhancedChallengeCard';

const IntegratedScoreSystemDemo: React.FC = () => {
  // Mock user profiles
  const mockProfiles = {
    'user-1': { id: 'user-1', display_name: 'Nguyễn Văn A', spa_rank: 'I+', spa_points: 1350 },
    'user-2': { id: 'user-2', display_name: 'Trần Thị B', spa_rank: 'H', spa_points: 980 },
    'user-3': { id: 'user-3', display_name: 'Lê Văn C', spa_rank: 'G', spa_points: 750 },
    'user-4': { id: 'user-4', display_name: 'Phạm Thị D', spa_rank: 'I', spa_points: 1200 },
    'user-5': { id: 'user-5', display_name: 'Hoàng Văn E', spa_rank: 'H+', spa_points: 1100 },
    'user-6': { id: 'user-6', display_name: 'Ngô Thị F', spa_rank: 'G+', spa_points: 820 }
  };

  // Mock club data
  const mockClub = { 
    id: 'club-1', 
    name: 'Demo Club', 
    location: 'TP.HCM',
    address: 'Demo Address',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Mock ongoing challenge with score submission capability
  const mockOngoingChallenge = {
    id: 'live-challenge-1',
    challenger_id: 'user-1',
    opponent_id: 'user-2', 
    challenger_score: null,
    opponent_score: null,
    status: 'ongoing' as const,
    bet_points: 200,
    race_to: 9,
    club_id: 'club-1',
    created_at: new Date().toISOString(),
    scheduled_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    // Extended challenge data
    challenger: mockProfiles['user-1'],
    opponent: mockProfiles['user-2'],
    club: mockClub
  };

  // Mock challenge with submitted score waiting for confirmation
  const mockScoreSubmittedChallenge = {
    id: 'score-submitted-1',
    challenger_id: 'user-3',
    opponent_id: 'user-4',
    challenger_score: 9,
    opponent_score: 6,
    status: 'ongoing' as const,
    response_message: 'Score submitted by challenger. Waiting for opponent confirmation.',
    bet_points: 300,
    race_to: 9,
    club_id: 'club-1',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    scheduled_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    // Extended challenge data
    challenger: mockProfiles['user-3'],
    opponent: mockProfiles['user-4'],
    club: mockClub
  };

  // Mock challenge with confirmed score waiting for club approval
  const mockPendingApprovalChallenge = {
    id: 'pending-approval-1',
    challenger_id: 'user-5',
    opponent_id: 'user-6',
    challenger_score: 7,
    opponent_score: 9,
    status: 'ongoing' as const,
    response_message: 'Score confirmed by both players. Ready for club approval.',
    bet_points: 250,
    race_to: 9,
    club_id: 'club-1',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    scheduled_time: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1.5 hours ago
    // Extended challenge data
    challenger: mockProfiles['user-5'],
    opponent: mockProfiles['user-6'],
    club: mockClub
  };

  const stages = [
    {
      id: 1,
      title: 'Trận đấu diễn ra',
      description: 'Player có thể nhập tỷ số khi trận đấu kết thúc',
      challenge: mockOngoingChallenge,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 2,
      title: 'Chờ xác nhận',
      description: 'Đối thủ cần xác nhận tỷ số đã được nhập',
      challenge: mockScoreSubmittedChallenge,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      id: 3,
      title: 'Chờ CLB phê duyệt',
      description: 'CLB admin phê duyệt và xử lý chuyển SPA',
      challenge: mockPendingApprovalChallenge,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Hệ thống Score Submission Tích hợp</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Score submission được tích hợp trực tiếp vào challenge cards
        </p>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Quick Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => window.location.href = '/club-approvals'}
            >
              <Shield className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">CLB Quản lý Phê duyệt</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Trung tâm phê duyệt kết quả trận đấu
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => window.location.href = '/club-management/challenges'}
            >
              <Target className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Quản lý Thách đấu CLB</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Xem tất cả trận đấu của CLB
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3-Stage Workflow Demo */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Quy trình 3 bước</h2>
        
        {stages.map((stage, index) => {
          const IconComponent = stage.icon;
          
          return (
            <div key={stage.id} className="space-y-4">
              {/* Stage Header */}
              <div className={`${stage.bgColor} border border-opacity-20 rounded-lg p-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center ${stage.color}`}>
                    {stage.id}
                  </div>
                  <IconComponent className={`w-5 h-5 ${stage.color}`} />
                  <h3 className={`font-bold ${stage.color}`}>{stage.title}</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
                  {stage.description}
                </p>
              </div>

              {/* Challenge Card Demo */}
              <div className="ml-6">
                <EnhancedChallengeCard
                  challenge={stage.challenge as any} // Type cast for demo
                  variant="live"
                  onAction={(challengeId, action) => {
                    console.log('Challenge action:', challengeId, action);
                  }}
                  onCardClick={(challengeId) => {
                    console.log('Challenge clicked:', challengeId);
                  }}
                />
              </div>

              {/* Arrow to next stage */}
              {index < stages.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Result */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="bg-green-50 dark:bg-green-900/20">
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Trophy className="w-5 h-5" />
            Kết quả cuối cùng
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Trạng thái trận đấu:</span>
              <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">SPA đã được chuyển:</span>
              <span className="text-green-600 font-bold">Tự động</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Ranking được cập nhật:</span>
              <span className="text-green-600 font-bold">Tự động</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded">
              💡 <strong>Lưu ý:</strong> Toàn bộ quy trình được tự động hóa sau khi CLB admin phê duyệt. 
              Không cần thao tác thủ công nào khác.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Lợi ích của hệ thống tích hợp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">
                ✅ Cho người chơi:
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Nhập tỷ số trực tiếp trên challenge card</li>
                <li>• Xác nhận kết quả một cách trực quan</li>
                <li>• Theo dõi progress realtime</li>
                <li>• Không cần navigate sang trang khác</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">
                ⚡ Cho CLB admin:
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Trung tâm quản lý tại /club-approvals</li>
                <li>• Preview SPA transfer trước khi phê duyệt</li>
                <li>• Xử lý hàng loạt pending approvals</li>
                <li>• Tự động sync SPA sau approval</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegratedScoreSystemDemo;
