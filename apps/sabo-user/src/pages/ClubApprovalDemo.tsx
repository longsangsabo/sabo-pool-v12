/**
 * Club Approval Demo Page
 * Demonstrates the club approval system for match results
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ClubApprovalCard from '@/components/challenges/ClubApprovalCard';
import { Shield, RefreshCw, Users } from 'lucide-react';

const ClubApprovalDemo: React.FC = () => {
  const [demoState, setDemoState] = useState<'score_confirmed' | 'disputed' | 'completed'>('score_confirmed');

  // Mock challenge data with confirmed score
  const mockChallenge = {
    id: 'demo-club-approval-1',
    challenger_id: 'user-1',
    opponent_id: 'user-2',
    challenger_score: 9,
    opponent_score: 6,
    status: demoState,
    response_message: 'Score confirmed by both players. Ready for club approval.',
    bet_points: 200,
    race_to: 9,
    club_id: 'club-1',
    created_at: new Date().toISOString(),
    scheduled_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  };

  const mockChallenger = {
    id: 'user-1',
    display_name: 'Nguyễn Văn A',
    spa_rank: 'I+',
    spa_points: 1350
  };

  const mockOpponent = {
    id: 'user-2',
    display_name: 'Trần Thị B', 
    spa_rank: 'H',
    spa_points: 980
  };

  const resetDemo = () => {
    setDemoState('score_confirmed');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Club Approval System Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Hệ thống CLB phê duyệt kết quả trận đấu và xử lý điểm SPA
        </p>
      </div>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Club Admin Demo Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <strong>Current State:</strong>{' '}
              <Badge variant={
                demoState === 'score_confirmed' ? 'secondary' : 
                demoState === 'disputed' ? 'destructive' : 'default'
              }>
                {demoState === 'score_confirmed' ? 'Chờ CLB phê duyệt' :
                 demoState === 'disputed' ? 'Tranh chấp' : 'Đã hoàn thành'}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setDemoState('score_confirmed')} 
              size="sm"
              variant={demoState === 'score_confirmed' ? 'default' : 'outline'}
            >
              Score Confirmed
            </Button>
            <Button 
              onClick={() => setDemoState('disputed')} 
              size="sm"
              variant={demoState === 'disputed' ? 'destructive' : 'outline'}
            >
              Disputed
            </Button>
            <Button 
              onClick={() => setDemoState('completed')} 
              size="sm"
              variant={demoState === 'completed' ? 'default' : 'outline'}
            >
              Completed
            </Button>
            <Button onClick={resetDemo} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="text-xs text-gray-600 dark:text-gray-400">
            <p><strong>CLB Admin Workflow:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Hai người chơi đã xác nhận tỷ số</li>
              <li>CLB admin nhận thông báo cần phê duyệt</li>
              <li>Admin kiểm tra kết quả và phê duyệt/báo cáo sai sót</li>
              <li>Hệ thống tự động chuyển SPA và hoàn thành trận đấu</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Club Approval Component Demo */}
      {demoState === 'score_confirmed' && (
        <ClubApprovalCard
          challenge={mockChallenge}
          challengerProfile={mockChallenger}
          opponentProfile={mockOpponent}
          isClubAdmin={true}
          onApprovalComplete={() => {
            console.log('Club approval completed in demo!');
            setDemoState('completed');
          }}
        />
      )}

      {demoState === 'disputed' && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="bg-red-50 dark:bg-red-900/20">
            <CardTitle className="text-red-800 dark:text-red-200">
              ⚠️ Trận đấu bị tranh chấp
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              CLB admin đã báo cáo vấn đề với kết quả này. Trận đấu cần được xử lý thủ công.
            </p>
          </CardContent>
        </Card>
      )}

      {demoState === 'completed' && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <CardTitle className="text-green-800 dark:text-green-200">
              ✅ Trận đấu đã hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm text-green-700 dark:text-green-300">
              CLB đã phê duyệt kết quả và xử lý điểm SPA thành công.
            </p>
            <div className="bg-white dark:bg-gray-800 p-3 rounded border">
              <div className="text-xs text-gray-500 mb-2">Chuyển điểm SPA:</div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{mockChallenger.display_name} (+200 SPA)</span>
                <Badge className="bg-green-100 text-green-800">Người thắng</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Features */}
      <Card>
        <CardHeader>
          <CardTitle>Club Admin Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Phê duyệt kết quả:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Xem chi tiết trận đấu và tỷ số</li>
                <li>• Preview chuyển điểm SPA</li>
                <li>• Phê duyệt với ghi chú (tùy chọn)</li>
                <li>• Tự động xử lý điểm và hoàn thành</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Xử lý tranh chấp:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Báo cáo kết quả sai sót</li>
                <li>• Đánh dấu trận đấu tranh chấp</li>
                <li>• Thêm ghi chú lý do tranh chấp</li>
                <li>• Chuyển cho admin cấp cao xử lý</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubApprovalDemo;
