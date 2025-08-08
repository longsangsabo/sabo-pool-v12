import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Zap, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActivityHighlightsProps {
  theme: 'light' | 'dark';
}

export const ActivityHighlights: React.FC<ActivityHighlightsProps> = ({ theme }) => {
  const sectionClass = theme === 'dark'
    ? 'bg-slate-900/40 border-slate-700/50 backdrop-blur-sm'
    : 'bg-white border-slate-200';

  const blockHeader = (icon: React.ReactNode, title: string) => (
    <div className='flex items-center gap-2 mb-4'>
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
        theme === 'dark' ? 'bg-slate-700/50 border border-slate-600/30':'bg-slate-100 border border-slate-200'
      }`}>
        {icon}
      </div>
      <h4 className={`text-sm font-semibold tracking-wide ${theme === 'dark' ? 'text-slate-200':'text-slate-700'}`}>{title}</h4>
    </div>
  );

  return (
    <Card className={`overflow-hidden ${sectionClass}`}>
      <CardHeader className='pb-3'>
        <CardTitle className={`text-base font-semibold ${theme === 'dark' ? 'text-slate-100':'text-slate-800'}`}>Tổng quan nhanh</CardTitle>
      </CardHeader>
      <CardContent className='space-y-8'>
        {/* Match Results */}
        <div>
          {blockHeader(<Trophy className='w-3.5 h-3.5 text-slate-400' />, 'Kết quả gần đây')}
          <div className='space-y-3'>
            {/* Win */}
            <div className={`relative overflow-hidden rounded-xl border ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-emerald-950/30 to-emerald-900/20 border-emerald-800/30'
                : 'bg-gradient-to-r from-emerald-50 to-green-50/50 border-emerald-100'
            }`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme === 'dark' ? 'bg-emerald-400':'bg-emerald-500'}`} />
              <div className='flex items-center gap-4 p-4'>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  theme === 'dark' ? 'bg-emerald-500/20 ring-1 ring-emerald-400/30':'bg-emerald-100 ring-1 ring-emerald-200'
                }`}>
                  <Trophy className={`w-5 h-5 ${theme === 'dark' ? 'text-emerald-300':'text-emerald-600'}`} />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-100':'text-slate-800'}`}>Thắng vs Nguyễn Văn A</div>
                  <div className={`text-xs flex items-center gap-2 ${theme === 'dark' ? 'text-slate-400':'text-slate-500'}`}>
                    <span className='font-medium'>10-8</span>
                    <span className='w-1 h-1 rounded-full bg-current opacity-50' />
                    <span>2 giờ trước</span>
                  </div>
                </div>
                <div className={`${theme === 'dark' ? 'text-emerald-300':'text-emerald-600'}`}>
                  <div className='text-sm font-bold'>+25</div>
                  <div className='text-xs font-medium opacity-80'>ELO</div>
                </div>
              </div>
            </div>
            {/* Loss */}
            <div className={`relative overflow-hidden rounded-xl border ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-rose-950/30 to-red-900/20 border-rose-800/30'
                : 'bg-gradient-to-r from-rose-50 to-red-50/50 border-rose-100'
            }`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme === 'dark' ? 'bg-rose-400':'bg-rose-500'}`} />
              <div className='flex items-center gap-4 p-4'>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  theme === 'dark' ? 'bg-rose-500/20 ring-1 ring-rose-400/30':'bg-rose-100 ring-1 ring-rose-200'
                }`}>
                  <Target className={`w-5 h-5 ${theme === 'dark' ? 'text-rose-300':'text-rose-600'}`} />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-100':'text-slate-800'}`}>Thua vs Trần Văn B</div>
                  <div className={`text-xs flex items-center gap-2 ${theme === 'dark' ? 'text-slate-400':'text-slate-500'}`}>
                    <span className='font-medium'>8-10</span>
                    <span className='w-1 h-1 rounded-full bg-current opacity-50' />
                    <span>1 ngày trước</span>
                  </div>
                </div>
                <div className={`${theme === 'dark' ? 'text-rose-300':'text-rose-600'}`}>
                  <div className='text-sm font-bold'>-15</div>
                  <div className='text-xs font-medium opacity-80'>ELO</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Challenges */}
        <div>
          {blockHeader(<Zap className='w-3.5 h-3.5 text-slate-400' />, 'Thách đấu đang chờ')}
          <div className={`relative overflow-hidden rounded-xl border ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-950/30 to-indigo-900/20 border-blue-800/30'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50/50 border-blue-100'
          }`}>
            <div className='flex items-center gap-4 p-4'>
              <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${
                theme === 'dark' ? 'bg-blue-500/20 ring-1 ring-blue-400/30':'bg-blue-100 ring-1 ring-blue-200'
              }`}>
                <Zap className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-300':'text-blue-600'}`} />
                <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse ${theme === 'dark' ? 'bg-amber-400':'bg-amber-500'}`} />
              </div>
              <div className='flex-1 min-w-0'>
                <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-100':'text-slate-800'}`}>Thách đấu từ Lê Văn C</div>
                <div className={`text-xs flex items-center gap-2 ${theme === 'dark' ? 'text-slate-400':'text-slate-500'}`}>
                  <span>Hạn:</span>
                  <span className='font-medium'>2 ngày nữa</span>
                </div>
              </div>
              <Button size='sm' variant='outline' className={`text-xs font-medium px-3 py-1.5 h-auto ${
                theme === 'dark'
                  ? 'bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>Xem chi tiết</Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          {blockHeader(<Activity className='w-3.5 h-3.5 text-slate-400' />, 'Hành động nhanh')}
          <div className='grid grid-cols-2 gap-3'>
            <Button variant='outline' className={`h-16 flex-col gap-2 border-dashed transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-slate-800/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/40'
                : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/70'
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'dark' ? 'bg-rose-500/20 ring-1 ring-rose-400/30':'bg-rose-100 ring-1 ring-rose-200'
              }`}>
                <Target className={`w-4 h-4 ${theme === 'dark' ? 'text-rose-300':'text-rose-600'}`} />
              </div>
              <span className='text-xs font-medium'>Tạo thách đấu</span>
            </Button>
            <Button variant='outline' className={`h-16 flex-col gap-2 border-dashed transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-slate-800/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/40'
                : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/70'
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'dark' ? 'bg-indigo-500/20 ring-1 ring-indigo-400/30':'bg-indigo-100 ring-1 ring-indigo-200'
              }`}>
                <Trophy className={`w-4 h-4 ${theme === 'dark' ? 'text-indigo-300':'text-indigo-600'}`} />
              </div>
              <span className='text-xs font-medium'>Xem bảng xếp hạng</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
