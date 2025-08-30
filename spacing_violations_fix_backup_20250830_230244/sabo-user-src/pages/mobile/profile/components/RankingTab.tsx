import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Trophy, Users, Target } from 'lucide-react';

interface RankingTabProps {
  theme: 'light' | 'dark';
}

const RankingTab: React.FC<RankingTabProps> = ({ theme }) => {
  return (
    <div className="p-6 space-y-6">
      <Card className={theme === 'dark' 
        ? 'bg-slate-800/50 border-slate-700/50' 
        : 'bg-white border-slate-200'
      }>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${
            theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
          }`}>
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Bảng Xếp Hạng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="form-spacing">
            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-warning-500 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className={`font-semibold ${
                      theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                    }`}>
                      Hạng hiện tại
                    </div>
                    <div className={`text-body-small ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Vị trí trong bảng xếp hạng
                    </div>
                  </div>
                </div>
                <div className={`text-title font-bold ${
                  theme === 'dark' ? 'text-orange-400' : 'text-warning-600'
                }`}>
                  #15
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className={`font-semibold ${
                      theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                    }`}>
                      Tổng người chơi
                    </div>
                    <div className={`text-body-small ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Trong bảng xếp hạng
                    </div>
                  </div>
                </div>
                <div className={`text-title font-bold ${
                  theme === 'dark' ? 'text-blue-400' : 'text-primary-600'
                }`}>
                  234
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success-500 flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className={`font-semibold ${
                      theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                    }`}>
                      Điểm số
                    </div>
                    <div className={`text-body-small ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Tổng điểm xếp hạng
                    </div>
                  </div>
                </div>
                <div className={`text-title font-bold ${
                  theme === 'dark' ? 'text-green-400' : 'text-success-600'
                }`}>
                  1,250
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingTab;
