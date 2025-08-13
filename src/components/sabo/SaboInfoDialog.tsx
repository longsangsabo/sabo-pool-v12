import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Info, Trophy, Calculator, Target, Star, BarChart3, Gamepad2, BookOpen, Shield } from 'lucide-react';
import {
  getAllRanks,
  getRankDisplayName,
  type SaboRank,
} from '@/utils/saboHandicap';
import { useTheme } from '@/hooks/useTheme';

interface SaboInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaboInfoDialog: React.FC<SaboInfoDialogProps> = ({ isOpen, onClose }) => {
  const ranks = getAllRanks();
  const { isDark } = useTheme();

  // ELO mapping từ tài liệu reference
  const rankEloMapping: Record<SaboRank, { elo: number; skill: string }> = {
    'K': { elo: 1000, skill: '2-4 bi khi hình dễ; mới tập' },
    'K+': { elo: 1100, skill: 'Sát ngưỡng lên I' },
    'I': { elo: 1200, skill: '3-5 bi; chưa điều được chấm' },
    'I+': { elo: 1300, skill: 'Sát ngưỡng lên H' },
    'H': { elo: 1400, skill: '5-8 bi; có thể "rùa" 1 chấm hình dễ' },
    'H+': { elo: 1500, skill: 'Chuẩn bị lên G' },
    'G': { elo: 1600, skill: 'Clear 1 chấm + 3-7 bi kế; bắt đầu điều bi 3 băng' },
    'G+': { elo: 1700, skill: 'Trình phong trào "ngon"; sát ngưỡng lên F' },
    'F': { elo: 1800, skill: '60-80% clear 1 chấm, đôi khi phá 2 chấm' },
    'F+': { elo: 1900, skill: 'Safety & spin control khá chắc; sát ngưỡng lên E' },
    'E': { elo: 2000, skill: '90-100% clear 1 chấm, 70% phá 2 chấm' },
    'E+': { elo: 2100, skill: 'Điều bi phức tạp, safety chủ động; sát ngưỡng lên D' },
  };

  // Bet configurations từ tài liệu reference
  const betConfigurations = [
    { points: 100, raceTo: 8, handicap1: 1.0, handicap05: 0.5, desc: 'Thách đấu sơ cấp' },
    { points: 200, raceTo: 12, handicap1: 1.5, handicap05: 1.0, desc: 'Thách đấu cơ bản' },
    { points: 300, raceTo: 14, handicap1: 2.0, handicap05: 1.5, desc: 'Thách đấu trung bình' },
    { points: 400, raceTo: 16, handicap1: 2.5, handicap05: 1.5, desc: 'Thách đấu trung cấp' },
    { points: 500, raceTo: 18, handicap1: 3.0, handicap05: 2.0, desc: 'Thách đấu trung cao' },
    { points: 600, raceTo: 22, handicap1: 3.5, handicap05: 2.5, desc: 'Thách đấu cao cấp' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-5xl max-h-[90vh] overflow-y-auto ${
        isDark 
          ? 'bg-slate-900/95 border-slate-700 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            <Trophy className='w-5 h-5 text-blue-500' />
            Hệ thống Handicap SABO - Tài Liệu Tham Chiếu
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Tổng Quan */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Info className='w-4 h-4 text-blue-500' />
              <h3 className={`font-semibold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>🎯 Tổng Quan</h3>
            </div>
            <div className={`text-sm leading-relaxed p-4 rounded-lg border ${
              isDark 
                ? 'bg-blue-900/20 border-blue-800/50 text-slate-300' 
                : 'bg-blue-50 border-blue-200 text-muted-foreground'
            }`}>
              <strong>Hệ thống Handicap SABO</strong> được thiết kế để tạo ra trận đấu công bằng giữa các người chơi có trình độ khác nhau. 
              Handicap được tính toán dựa trên:
              <div className='mt-2 space-y-1'>
                <div>• <strong>Chênh lệch hạng</strong> (Rank Difference)</div>
                <div>• <strong>Mức cược</strong> (Bet Points/Stakes)</div>
                <div>• <strong>Độ dài trận đấu</strong> (Race To)</div>
              </div>
            </div>
          </div>

          <Separator className={isDark ? 'bg-slate-700' : 'bg-slate-200'} />

          {/* Bảng Mapping Hạng-ELO */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Star className='w-4 h-4 text-amber-500' />
              <h3 className={`font-semibold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>🏆 Bảng Mapping Hạng - ELO</h3>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto'>
              {ranks.map(rank => (
                <div
                  key={rank}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isDark 
                      ? 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600' 
                      : 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <Badge variant='outline' className={`font-mono font-bold text-sm ${
                      isDark 
                        ? 'border-slate-600 text-slate-200' 
                        : 'border-slate-300 text-slate-700'
                    }`}>
                      {rank}
                    </Badge>
                    <span className='font-medium text-blue-500'>
                      {rankEloMapping[rank]?.elo} ELO
                    </span>
                  </div>
                  <div className={`text-xs max-w-48 text-right ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {rankEloMapping[rank]?.skill}
                  </div>
                </div>
              ))}
            </div>
            <div className={`text-xs p-2 rounded border ${
              isDark 
                ? 'bg-amber-900/20 border-amber-800/50 text-amber-300' 
                : 'bg-amber-50 border-amber-200 text-muted-foreground'
            }`}>
              <strong>Progression:</strong> K (2-4 bi) → E+ (90-100% clear chấm, điều bi phức tạp)
            </div>
          </div>

          <Separator className={isDark ? 'bg-slate-700' : 'bg-slate-200'} />

          {/* Cấu Hình Handicap */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <BarChart3 className='w-4 h-4 text-green-500' />
              <h3 className={`font-semibold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>⚖️ Cấu Hình Handicap Theo Mức Cược</h3>
            </div>
            <div className='overflow-x-auto'>
              <table className={`w-full text-sm border-collapse border ${
                isDark ? 'border-slate-600' : 'border-slate-300'
              }`}>
                <thead className={isDark ? 'bg-slate-800/50' : 'bg-slate-100'}>
                  <tr>
                    <th className={`border p-2 text-left font-medium ${
                      isDark ? 'border-slate-600 text-slate-200' : 'border-slate-300 text-slate-700'
                    }`}>Bet Points</th>
                    <th className={`border p-2 text-left font-medium ${
                      isDark ? 'border-slate-600 text-slate-200' : 'border-slate-300 text-slate-700'
                    }`}>Race To</th>
                    <th className={`border p-2 text-left font-medium ${
                      isDark ? 'border-slate-600 text-slate-200' : 'border-slate-300 text-slate-700'
                    }`}>Handicap 1-Rank</th>
                    <th className={`border p-2 text-left font-medium ${
                      isDark ? 'border-slate-600 text-slate-200' : 'border-slate-300 text-slate-700'
                    }`}>Handicap Sub-Rank</th>
                    <th className={`border p-2 text-left font-medium ${
                      isDark ? 'border-slate-600 text-slate-200' : 'border-slate-300 text-slate-700'
                    }`}>Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  {betConfigurations.map((config, index) => (
                    <tr key={config.points} className={
                      index % 2 === 0 
                        ? (isDark ? 'bg-slate-800/20' : 'bg-white')
                        : (isDark ? 'bg-slate-700/20' : 'bg-slate-50')
                    }>
                      <td className={`border p-2 font-medium text-blue-500 ${
                        isDark ? 'border-slate-600' : 'border-slate-300'
                      }`}>{config.points}</td>
                      <td className={`border p-2 ${
                        isDark ? 'border-slate-600 text-slate-300' : 'border-slate-300 text-slate-700'
                      }`}>{config.raceTo}</td>
                      <td className={`border p-2 font-medium text-green-500 ${
                        isDark ? 'border-slate-600' : 'border-slate-300'
                      }`}>{config.handicap1}</td>
                      <td className={`border p-2 font-medium text-green-500 ${
                        isDark ? 'border-slate-600' : 'border-slate-300'
                      }`}>{config.handicap05}</td>
                      <td className={`border p-2 ${
                        isDark ? 'border-slate-600 text-slate-400' : 'border-slate-300 text-slate-600'
                      }`}>{config.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator className={isDark ? 'bg-slate-700' : 'bg-slate-200'} />

          {/* Ý Nghĩa Thành Phần */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Calculator className='w-4 h-4 text-purple-500' />
              <h3 className={`font-semibold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>🎯 Ý Nghĩa Từng Thành Phần</h3>
            </div>
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='space-y-3'>
                <div className={`p-3 rounded-lg border ${
                  isDark 
                    ? 'bg-blue-900/20 border-blue-800/50' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className={`font-medium mb-2 ${
                    isDark ? 'text-blue-400' : 'text-blue-800'
                  }`}>handicap_1_rank</div>
                  <div className={`text-sm ${
                    isDark ? 'text-slate-300' : 'text-blue-700'
                  }`}>
                    <strong>Áp dụng khi chênh lệch 1 hạng chính</strong><br/>
                    Ví dụ: I vs H, H vs G, G vs F<br/>
                    Người yếu hơn được cộng điểm này ban đầu
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg border ${
                  isDark 
                    ? 'bg-green-900/20 border-green-800/50' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className={`font-medium mb-2 ${
                    isDark ? 'text-green-400' : 'text-green-800'
                  }`}>Bet Points</div>
                  <div className={`text-sm ${
                    isDark ? 'text-slate-300' : 'text-green-700'
                  }`}>
                    <strong>Mức độ nghiêm trọng của trận đấu</strong><br/>
                    Cao hơn = Quan trọng hơn = Handicap lớn hơn<br/>
                    Range: 100-600 điểm (6 levels)
                  </div>
                </div>
              </div>
              
              <div className='space-y-3'>
                <div className={`p-3 rounded-lg border ${
                  isDark 
                    ? 'bg-purple-900/20 border-purple-800/50' 
                    : 'bg-purple-50 border-purple-200'
                }`}>
                  <div className={`font-medium mb-2 ${
                    isDark ? 'text-purple-400' : 'text-purple-800'
                  }`}>handicap_05_rank</div>
                  <div className={`text-sm ${
                    isDark ? 'text-slate-300' : 'text-purple-700'
                  }`}>
                    <strong>Áp dụng khi chênh lệch sub-rank</strong><br/>
                    Ví dụ: I vs I+, H vs H+, G vs G+<br/>
                    Handicap nhỏ hơn vì chênh lệch ít hơn
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg border ${
                  isDark 
                    ? 'bg-orange-900/20 border-orange-800/50' 
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className={`font-medium mb-2 ${
                    isDark ? 'text-orange-400' : 'text-orange-800'
                  }`}>Race To</div>
                  <div className={`text-sm ${
                    isDark ? 'text-slate-300' : 'text-orange-700'
                  }`}>
                    <strong>Số ván cần thắng để thắng trận</strong><br/>
                    Bet cao → Race to cao = Trận đấu dài hơn<br/>
                    Range: 8-22 ván
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className={isDark ? 'bg-slate-700' : 'bg-slate-200'} />

          {/* Scenarios Thực Tế */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Gamepad2 className='w-4 h-4 text-red-500' />
              <h3 className={`font-semibold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>🎮 Các Scenario Thực Tế</h3>
            </div>
            <div className='grid gap-3'>
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-800/50' 
                  : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
              }`}>
                <div className={`font-medium mb-2 ${
                  isDark ? 'text-red-400' : 'text-red-800'
                }`}>
                  🔥 Scenario 1: Chênh lệch 1 hạng chính
                </div>
                <div className={`text-sm space-y-1 ${
                  isDark ? 'text-slate-300' : 'text-red-700'
                }`}>
                  <div><strong>Player H (1400 ELO) vs Player G (1600 ELO)</strong></div>
                  <div>📊 Bet: 300 điểm → Race to 14</div>
                  <div>⚖️ Handicap: Player H được +2 ván ban đầu</div>
                  <div>🎯 Tỷ số bắt đầu: H=2, G=0</div>
                  <div>🏁 Để thắng: H cần 12 ván nữa (2+12=14), G cần 14 ván (0+14=14)</div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-800/50' 
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
              }`}>
                <div className={`font-medium mb-2 ${
                  isDark ? 'text-blue-400' : 'text-blue-800'
                }`}>
                  🔥 Scenario 2: Chênh lệch sub-rank
                </div>
                <div className={`text-sm space-y-1 ${
                  isDark ? 'text-slate-300' : 'text-blue-700'
                }`}>
                  <div><strong>Player F (1800 ELO) vs Player F+ (1900 ELO)</strong></div>
                  <div>📊 Bet: 200 điểm → Race to 12</div>
                  <div>⚖️ Handicap: Player F được +1 ván ban đầu</div>
                  <div>🎯 Tỷ số bắt đầu: F=1, F+=0</div>
                  <div>🏁 Để thắng: F cần 11 ván nữa (1+11=12), F+ cần 12 ván (0+12=12)</div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-800/50' 
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
              }`}>
                <div className={`font-medium mb-2 ${
                  isDark ? 'text-green-400' : 'text-green-800'
                }`}>
                  🔥 Scenario 3: Bet cao - Handicap lớn
                </div>
                <div className={`text-sm space-y-1 ${
                  isDark ? 'text-slate-300' : 'text-green-700'
                }`}>
                  <div><strong>Player I (1200 ELO) vs Player H (1400 ELO)</strong></div>
                  <div>📊 Bet: 600 điểm → Race to 22</div>
                  <div>⚖️ Handicap: Player I được +3.5 ván ban đầu</div>
                  <div>🎯 Tỷ số bắt đầu: I=3.5, H=0</div>
                  <div>🏁 Để thắng: I cần 18.5 ván nữa (3.5+18.5=22), H cần 22 ván</div>
                </div>
              </div>
            </div>
          </div>

          <Separator className={isDark ? 'bg-slate-700' : 'bg-slate-200'} />

          {/* Design Principles */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Target className='w-4 h-4 text-indigo-500' />
              <h3 className={`font-semibold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>🎯 Nguyên Tắc Thiết Kế</h3>
            </div>
            <div className='grid md:grid-cols-2 gap-4 text-sm'>
              <div className='space-y-3'>
                <div className={`p-3 rounded-lg border ${
                  isDark 
                    ? 'bg-indigo-900/20 border-indigo-800/50' 
                    : 'bg-indigo-50 border-indigo-200'
                }`}>
                  <div className={`font-medium mb-1 ${
                    isDark ? 'text-indigo-400' : 'text-indigo-800'
                  }`}>1. Fairness (Công Bằng)</div>
                  <div className={isDark ? 'text-slate-300' : 'text-indigo-700'}>
                    • Người yếu hơn được lợi thế ban đầu<br/>
                    • Chênh lệch càng lớn → handicap càng nhiều<br/>
                    • Cân bằng cơ hội thắng cho cả hai bên
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  isDark 
                    ? 'bg-emerald-900/20 border-emerald-800/50' 
                    : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className={`font-medium mb-1 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-800'
                  }`}>2. Stakes Matter</div>
                  <div className={isDark ? 'text-slate-300' : 'text-emerald-700'}>
                    • Bet cao → handicap cao → cân bằng hơn<br/>
                    • Bet thấp → có thể chấp nhận bất công nhẹ<br/>
                    • Risk vs Reward tương ứng
                  </div>
                </div>
              </div>
              
              <div className='space-y-3'>
                <div className={`p-3 rounded-lg border ${
                  isDark 
                    ? 'bg-amber-900/20 border-amber-800/50' 
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className={`font-medium mb-1 ${
                    isDark ? 'text-amber-400' : 'text-amber-800'
                  }`}>3. Game Length Balance</div>
                  <div className={isDark ? 'text-slate-300' : 'text-amber-700'}>
                    • Trận ngắn → handicap nhỏ → ít ảnh hưởng<br/>
                    • Trận dài → handicap lớn → ảnh hưởng đáng kể<br/>
                    • Sample size đủ lớn để skill thể hiện
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  isDark 
                    ? 'bg-red-900/20 border-red-800/50' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className={`font-medium mb-1 ${
                    isDark ? 'text-red-400' : 'text-red-800'
                  }`}>4. Rank Restrictions</div>
                  <div className={isDark ? 'text-slate-300' : 'text-red-700'}>
                    • Chỉ cho phép ±2 hạng chính<br/>
                    • Tối đa 4 sub-ranks difference<br/>
                    • Ngăn chặn mismatching quá lớn
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className={isDark ? 'bg-slate-700' : 'bg-slate-200'} />

          {/* Core Philosophy */}
          <div className='space-y-3'>
            <h3 className={`font-semibold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>🎯 Core Philosophy</h3>
            <div className={`p-4 rounded-lg border-2 text-center ${
              isDark 
                ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-700' 
                : 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-300'
            }`}>
              <div className={`text-lg font-bold mb-2 ${
                isDark ? 'text-blue-300' : 'text-blue-800'
              }`}>
                "Every match should be winnable by both players,<br/>regardless of initial skill difference."
              </div>
              <div className={`text-sm ${
                isDark ? 'text-slate-400' : 'text-blue-700'
              }`}>
                <em>"Mọi trận đấu đều có thể thắng được bởi cả hai người chơi,<br/>bất kể chênh lệch skill ban đầu."</em>
              </div>
            </div>
          </div>
        </div>

        <div className={`flex justify-end pt-4 border-t ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <Button 
            onClick={onClose}
            className={isDark 
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
            }
            variant='outline'
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaboInfoDialog;
