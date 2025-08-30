import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Shield, ArrowRight, User } from 'lucide-react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useClubOwnership } from '@/hooks/useClubOwnership';
import { useLanguage } from '@/contexts/LanguageContext';

export const ClubRoleSwitch: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAdminCheck();
  const { isClubOwner } = useClubOwnership();
  const { t } = useLanguage();

  const isInClubManagement = location.pathname.startsWith('/club-management');
  const isInAdmin = location.pathname.startsWith('/admin');

  const handleSwitchToAdmin = () => {
    navigate('/admin');
  };

  const handleSwitchToClubManagement = () => {
    navigate('/club-management');
  };

  const handleSwitchToPlayer = () => {
    navigate('/dashboard');
  };

  return (
    <div className='flex items-center gap-2'>
      {/* Club Owner Role Switch */}
      {isClubOwner && !isInClubManagement && (
        <>
          <Button
            variant='outline'
            size='sm'
            onClick={handleSwitchToClubManagement}
            className='flex items-center gap-2 hover:bg-muted'
          >
            <Building className='h-4 w-4' />
            <span>Quản lý CLB</span>
            <ArrowRight className='h-3 w-3' />
          </Button>
          <Badge variant='secondary' className='text-xs bg-blue-100 text-blue-700'>
            Player Mode
          </Badge>
        </>
      )}

      {/* Switch back to Player from Club Management */}
      {isClubOwner && isInClubManagement && (
        <>
          <Button
            variant='outline'
            size='sm'
            onClick={handleSwitchToPlayer}
            className='flex items-center gap-2 hover:bg-muted'
          >
            <User className='h-4 w-4' />
            <span>Chế độ người chơi</span>
            <ArrowRight className='h-3 w-3' />
          </Button>
          <Badge variant='secondary' className='text-xs bg-green-100 text-green-700'>
            Club Mode
          </Badge>
        </>
      )}

      {/* Admin Role Switch */}
      {isAdmin && !isInAdmin && (
        <>
          <Button
            variant='outline'
            size='sm'
            onClick={handleSwitchToAdmin}
            className='flex items-center gap-2 hover:bg-muted'
          >
            <Shield className='h-4 w-4' />
            <span>Chuyển sang Admin</span>
            <ArrowRight className='h-3 w-3' />
          </Button>
          <Badge variant='secondary' className='text-xs bg-red-100 text-red-700'>
            Admin Available
          </Badge>
        </>
      )}
    </div>
  );
};
