import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClubOwnerFallbackProps {
  title?: string;
  message?: string;
  showRegisterButton?: boolean;
}

export const ClubOwnerFallback: React.FC<ClubOwnerFallbackProps> = ({
  title = 'Quyền truy cập bị hạn chế',
  message = 'Bạn cần là chủ câu lạc bộ để truy cập trang này.',
  showRegisterButton = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex items-center justify-center bg-background p-4'>
      <Card className='max-w-md mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center text-warning-600'>
            <AlertCircle className='w-5 h-5 mr-2' />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground'>{message}</p>

          {showRegisterButton && (
            <div className='space-y-2'>
              <p className='text-body-small text-muted-foreground'>
                Vui lòng đăng ký câu lạc bộ hoặc liên hệ quản trị viên để được
                hỗ trợ.
              </p>
              <div className='flex gap-2'>
                <Button
                  onClick={() => navigate('/club-registration')}
                  className='flex items-center gap-2'
                >
                  <Building className='w-4 h-4' />
                  Đăng ký CLB
                </Button>
                <Button variant='outline' onClick={() => navigate('/standardized-profile')}>
                  Về trang cá nhân
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
