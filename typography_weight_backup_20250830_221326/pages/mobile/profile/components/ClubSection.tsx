import React from 'react';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';

interface ClubSectionProps {
  theme: 'light' | 'dark';
  role: string;
}

export const ClubSection: React.FC<ClubSectionProps> = ({ theme, role }) => {
  return (
    <div className='p-4 space-y-3'>
      <div className='text-center py-6'>
        <Building className='w-12 h-12 mx-auto text-muted-foreground mb-3' />
        <h4 className='text-body-small font-medium mb-2'>Đăng ký câu lạc bộ</h4>
        <p className='text-caption-muted mb-4'>
          Tạo và đăng ký câu lạc bộ bida của riêng bạn
        </p>
        {role === 'club_owner' || role === 'both' ? (
          <div className='space-y-2'>
            <div
              className={`bg-primary-50 border border-primary-200 rounded-lg p-3 ${
                theme === 'dark'
                  ? 'bg-blue-900/20 border-blue-800/50 backdrop-blur-sm'
                  : 'bg-primary-50 border-primary-200'
              }`}
            >
              <div
                className={`text-body-small font-medium ${
                  theme === 'dark' ? 'text-blue-200' : 'text-primary-800'
                }`}
              >
                Bạn đã là chủ CLB
              </div>
              <div
                className={`text-caption mt-1 ${
                  theme === 'dark' ? 'text-blue-300' : 'text-primary-600'
                }`}
              >
                Quản lý câu lạc bộ hiện tại của bạn
              </div>
            </div>
            <Button 
              variant='outline' 
              size='sm' 
              className='w-full'
              onClick={() => (window.location.href = '/club-management')}
            >
              <Building className='w-4 h-4 mr-2' />
              Quản lý CLB hiện tại
            </Button>
          </div>
        ) : (
          <Button
            variant='outline'
            size='sm'
            onClick={() => (window.location.href = '/club-registration')}
          >
            <Building className='w-4 h-4 mr-2' />
            Đăng ký CLB mới
          </Button>
        )}
      </div>
    </div>
  );
};
