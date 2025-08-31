import React from 'react';
import { Typography } from '@sabo/shared-ui';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, Menu, Search, Settings, Building, Home } from 'lucide-react';
import { ClubRoleSwitch } from './ClubRoleSwitch';
import { UserModeSwitch } from './UserModeSwitch';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface ClubDesktopHeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  clubProfile?: any;
}

export const ClubDesktopHeader: React.FC<ClubDesktopHeaderProps> = ({
  onToggleSidebar,
  sidebarCollapsed,
  clubProfile,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <header className='bg-card border-b border-border px-6 py-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onToggleSidebar}
            className='p-2'
          >
            <Menu className='h-5 w-5' />
          </Button>
          
          <Typography variant="heading">
            {clubProfile?.club_name || t('club.management')}
          </Typography>
          
          <Badge variant='secondary' className='hidden sm:inline-flex'>
            {t('club.admin')}
          </Badge>
        </div>
        
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate('/')}
            className='p-2'
          >
            <Home className='h-5 w-5' />
          </Button>
          
          <ClubRoleSwitch />
          <UserModeSwitch />
          
          <div className='hidden md:flex items-center gap-2'>
            <Button variant='ghost' size='sm' className='p-2'>
              <Search className='h-5 w-5' />
            </Button>
            
            <Button variant='ghost' size='sm' className='p-2'>
              <Bell className='h-5 w-5' />
            </Button>
            
            <ThemeToggle />
            
            <Button variant='ghost' size='sm' className='p-2'>
              <Settings className='h-5 w-5' />
            </Button>
          </div>
          
          <Avatar className='h-8 w-8'>
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata?.full_name?.charAt(0) ||
                user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};
