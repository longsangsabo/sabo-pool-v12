import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
 Menu,
 Inbox,
 Search,
 Wallet,
 User,
 Settings,
 LogOut,
 Sun,
 Moon,
 MessageCircle,
} from 'lucide-react';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
// Removed supabase import - migrated to services
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification } from "../services/notificationService";
import { uploadFile, getPublicUrl } from "../services/storageService";
import { getCurrentUser } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import { useAvatar } from '@/contexts/AvatarContext';
import { useUnifiedMessages } from '@/hooks/useUnifiedMessages';
import { UnifiedNotificationBell } from '@/components/notifications/UnifiedNotificationBell';

interface MobileHeaderProps {
 title?: string;
 showSearch?: boolean;
 showProfile?: boolean;
 showMessages?: boolean;
 showWallet?: boolean;
 onMenuClick?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
 title = 'SABO ARENA',
 showSearch = true,
 showProfile = true,
 showMessages = true,
 showWallet = false, // Bỏ tab ví theo yêu cầu
 onMenuClick,
}) => {
 const navigate = useNavigate();
 const { theme, setTheme } = useTheme();
 const { avatarUrl: contextAvatar } = useAvatar();
 const { unreadCount: messageUnreadCount } = useUnifiedMessages();

 // Get current user
 const { data: user } = useQuery({
  queryKey: ['current-user'],
  queryFn: async () => {
   const {
    data: { user },
    error,
   } = await getCurrentUser();
   if (error) throw error;
   return user;
  },
 });

 // Get user profile
 const { data: profile } = useQuery({
  queryKey: ['user-profile', user?.id],
  queryFn: async () => {
   if (!user?.id) return null;

   // TODO: Replace with service call - const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .getByUserId(user.id)
    .single();

   if (error) throw error;
   return data;
  },
  enabled: !!user?.id,
 });

 // Get wallet balance
 const { data: wallet } = useQuery({
  queryKey: ['wallet-balance', user?.id],
  queryFn: async () => {
   if (!user?.id) return null;

   // TODO: Replace with service call - const { data, error } = await supabase
    .from('wallets')
    .select('balance, points_balance')
    .getByUserId(user.id)
    .single();

   if (error && error.code !== 'PGRST116') throw error;
   return data || { balance: 0, points_balance: 0 };
  },
  enabled: !!user?.id,
 });

 const handleSignOut = async () => {
  try {
   const { error } = await userService.signOut();
   if (error) throw error;

   toast.success('Đã đăng xuất thành công');
   navigate('/');
  } catch (error) {
   console.error('Error signing out:', error);
   toast.error('Lỗi khi đăng xuất');
  }
 };

 const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
   style: 'currency',
   currency: 'VND',
  }).format(amount);
 };

 return (
  <header className='sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/40 lg:hidden mobile-safe-area-top dark:bg-slate-900/40'>
   <div className='flex h-16 items-center px-4'>
    {/* Left section */}
    <div className='flex items-center gap-3 flex-1'>
     {onMenuClick && (
      <Button
       variant='ghost'
       
       onClick={onMenuClick}
       className='hover:bg-muted transition-colors'
      >
       <Menu className='w-5 h-5' />
      </Button>
     )}

     {/* Brand Logo & Title */}
     <div className='flex items-center gap-2'>
      {/* SABO Logo */}
      <div className='relative'>
       <img
// // // //         src='https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/logo//logo-sabo-arena.png'
        alt='SABO ARENA Logo'
        className='w-9 h-9 object-cover rounded-full'
       />
      </div>

      {/* Title with gradient */}
      <div className='flex flex-col'>
       <h1 className='font-black text-body-large bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-none tracking-tight'>
        SABO
       </h1>
       <span className='text-caption font-bold text-muted-foreground leading-none tracking-wider'>
        ARENA
       </span>
      </div>
     </div>
    </div>

    {/* Right section */}
    <div className='flex items-center gap-1'>
     {/* Theme Toggle */}
     <Button
      variant='ghost'
      
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className='hover:bg-muted/50 transition-colors'
     >
      {theme === 'light' ? (
       <Moon className='w-5 h-5' />
      ) : (
       <Sun className='w-5 h-5' />
      )}
     </Button>

     {/* Messages Button */}
     {showMessages && (
      <Button
       variant='ghost'
       
       onClick={() => navigate('/messages')}
       className='hover:bg-muted/50 transition-colors'
      >
       <MessageCircle className='w-5 h-5' />
      </Button>
     )}

     {/* Challenge Notifications */}
     <UnifiedNotificationBell 
      variant="mobile"
      className="hover:bg-muted/50 transition-colors"
      onClick={() => navigate('/notifications')}
     />

     {/* Profile Menu */}
     {showProfile && user && (
      <DropdownMenu>
       <DropdownMenuTrigger asChild>
        <Button
         variant='ghost'
         
         className='p-1 hover:bg-muted/50 transition-colors'
        >
         <Avatar className='w-8 h-8 ring-2 ring-primary/20'>
          <AvatarImage
           src={contextAvatar || profile?.avatar_url || undefined}
           loading="lazy"
           className="object-cover"
           onError={(e) => {
            console.log('Avatar failed to load:', contextAvatar || profile?.avatar_url);
            e.currentTarget.style.display = 'none';
           }}
          />
          <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold'>
           {profile?.display_name?.[0] ||
            profile?.full_name?.[0] ||
            'U'}
          </AvatarFallback>
         </Avatar>
        </Button>
       </DropdownMenuTrigger>

       <DropdownMenuContent
        align='end'
        className='w-56 bg-background/80 backdrop-blur-lg border shadow-lg dark:bg-slate-900/60'
       >
        <div className='px-3 py-2'>
         <p className='text-body-small font-semibold'>
          {profile?.display_name ||
           profile?.full_name ||
           'Người dùng'}
         </p>
         <p className='text-caption text-muted-foreground'>{user.email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
         onClick={() => navigate('/standardized-profile')}
         className='hover:bg-muted/50 cursor-pointer'
        >
         <User className='w-4 h-4 mr-2' />
         Hồ sơ cá nhân
        </DropdownMenuItem>

        <DropdownMenuItem
         onClick={() => navigate('/messages')}
         className='hover:bg-muted/50 cursor-pointer relative'
        >
         <Inbox className='w-4 h-4 mr-2' />
         Tin nhắn
         <Badge
          variant='secondary'
          className='ml-auto w-5 h-5 text-caption p-0 flex items-center justify-center bg-primary-500 text-white'
         >
          {messageUnreadCount || 0}
         </Badge>
        </DropdownMenuItem>

        {/* <DropdownMenuItem
         onClick={() => navigate('/wallet')}
         className='hover:bg-muted/50 cursor-pointer'
        >
         <Wallet className='w-4 h-4 mr-2' />
         Ví của tôi
        </DropdownMenuItem> */}

        <DropdownMenuItem
         onClick={() => navigate('/settings')}
         className='hover:bg-muted/50 cursor-pointer'
        >
         <Settings className='w-4 h-4 mr-2' />
         Cài đặt
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
         onClick={handleSignOut}
         className='hover:bg-destructive/10 text-destructive cursor-pointer'
        >
         <LogOut className='w-4 h-4 mr-2' />
         Đăng xuất
        </DropdownMenuItem>
       </DropdownMenuContent>
      </DropdownMenu>
     )}
    </div>
   </div>
  </header>
 );
};
