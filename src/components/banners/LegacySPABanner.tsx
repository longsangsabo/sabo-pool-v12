import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, ArrowRight, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LegacySPABanner: React.FC = () => {
  return (
    <Card className='bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-xl'>
      <CardContent className='p-6'>
        <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-white/20 rounded-full'>
              <Trophy className='w-8 h-8' />
            </div>
            <div>
              <h3 className='text-xl font-bold mb-1'>
                🏆 Claim SPA Legacy Points
              </h3>
              <p className='text-purple-100 text-sm'>
                45 người chơi từ BXH SPA cũ có thể claim lại điểm số của mình!
              </p>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row items-center gap-3'>
            <div className='flex items-center gap-2 text-sm'>
              <Users className='w-4 h-4' />
              <span>45 Legacy Players</span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <Clock className='w-4 h-4' />
              <span>Chỉ claim 1 lần</span>
            </div>
            <Link to='/guide'>
              <Button 
                variant='secondary' 
                className='bg-white text-purple-600 hover:bg-gray-100 font-semibold'
              >
                Xem Hướng Dẫn
                <ArrowRight className='w-4 h-4 ml-2' />
              </Button>
            </Link>
          </div>
        </div>

        <div className='mt-4 pt-4 border-t border-white/20'>
          <div className='flex flex-wrap gap-2 text-xs'>
            <Badge variant='secondary' className='bg-white/20 text-white border-0'>
              Top 1: ĐĂNG RT - 3,600 SPA
            </Badge>
            <Badge variant='secondary' className='bg-white/20 text-white border-0'>
              Top 2: KHÁNH HOÀNG - 3,500 SPA
            </Badge>
            <Badge variant='secondary' className='bg-white/20 text-white border-0'>
              Top 3: THÙY LINH - 3,450 SPA
            </Badge>
            <Badge variant='secondary' className='bg-white/20 text-white border-0'>
              +42 players khác...
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LegacySPABanner;
