import React from "react";
/**
 * Score Submission Demo Page
 * Demonstrates the score submission system
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ScoreSubmissionCard from '@/components/challenges/ScoreSubmissionCard';
import { Trophy, RefreshCw } from 'lucide-react';

const ScoreSubmissionDemo: React.FC = () => {
  const [demoState, setDemoState] = useState<'active' | 'score_submitted' | 'completed'>('active');

  // Mock challenge data
  const mockChallenge = {
    id: 'demo-challenge-1',
    challenger_id: 'user-1',
    opponent_id: 'user-2',
    challenger_score: demoState === 'active' ? null : 8,
    opponent_score: demoState === 'active' ? null : 5,
    status: demoState,
    response_message: demoState === 'score_submitted' ? 
      'Score submitted: 8-5 (Great match!)' : 
      demoState === 'completed' ? 'Score confirmed by opponent' : null,
    bet_points: 100,
    race_to: 9,
    handicap_data: { handicap_challenger: 0, handicap_opponent: 0.5 }
  };

  const mockChallenger = {
    id: 'user-1',
    display_name: 'Nguyễn Văn A',
    spa_rank: 'K+',
    spa_points: 1200
  };

  const mockOpponent = {
    id: 'user-2',
    display_name: 'Trần Thị B',
    spa_rank: 'I',
    spa_points: 1450
  };

  const resetDemo = () => {
    setDemoState('active');
  };

  const nextState = () => {
    switch (demoState) {
      case 'active':
        setDemoState('score_submitted');
        break;
      case 'score_submitted':
        setDemoState('completed');
        break;
      case 'completed':
        setDemoState('active');
        break;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Score Submission System Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Hệ thống nhập và xác nhận tỷ số trận đấu
        </p>
      </div>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Demo Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <strong>Current State:</strong>{' '}
              <Badge variant={demoState === 'active' ? 'destructive' : 
                             demoState === 'score_submitted' ? 'secondary' : 'default'}>
                {demoState === 'active' ? 'Trận đấu đang diễn ra' :
                 demoState === 'score_submitted' ? 'Chờ xác nhận tỷ số' : 'Trận đấu hoàn thành'}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={nextState} size="sm">
              Next State
            </Button>
            <Button onClick={resetDemo} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="text-xs text-gray-600 dark:text-gray-400">
            <p><strong>Flow:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Trận đấu đang diễn ra → Hiển thị nút "Nhập Tỷ Số"</li>
              <li>Sau khi nhập → Chờ đối thủ xác nhận</li>
              <li>Xác nhận thành công → Chuyển cho club phê duyệt</li>
              <li>Club phê duyệt → Hoàn thành và chuyển SPA</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Score Submission Component Demo */}
      <ScoreSubmissionCard
        challenge={mockChallenge}
        challengerProfile={mockChallenger}
        opponentProfile={mockOpponent}
        onScoreSubmitted={() => {
          console.log('Score submitted in demo!');
          // In real app, this would refetch data
        }}
      />

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Player Features:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Nhập tỷ số khi trận đấu đang diễn ra</li>
                <li>• Thêm ghi chú về trận đấu</li>
                <li>• Xác nhận hoặc từ chối tỷ số của đối thủ</li>
                <li>• Xem lịch sử tỷ số đã nhập</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Club Admin Features:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Phê duyệt kết quả trận đấu</li>
                <li>• Xử lý các trường hợp tranh chấp</li>
                <li>• Tự động chuyển SPA sau khi phê duyệt</li>
                <li>• Thêm ghi chú admin</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreSubmissionDemo;
