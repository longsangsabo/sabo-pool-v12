import React from 'react';
import {
 Heart,
 MessageCircle,
 Share2,
 Trophy,
 Target,
 Flame,
 Users,
 Clock,
 Trash2,
 MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MobileReactionBar } from './MobileReactionBar';
import { MobileLiveIndicator } from '../common/MobileLiveIndicator';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useProtectedTheme } from '@/hooks/useProtectedTheme';

interface FeedPost {
 id: string;
 type: 'match_result' | 'achievement' | 'challenge' | 'tournament_update';
 user: {
  id: string;
  name: string;
  avatar: string;
  rank: string;
 };
 content: string;
 timestamp: string;
 stats?: {
  likes: number;
  comments: number;
  shares: number;
  score?: string;
  opponent?: string;
  achievement?: string;
  challenge_type?: string;
  tournament_name?: string;
 };
 isLiked?: boolean;
}

interface MobileFeedCardProps {
 post: FeedPost;
 onLike?: (postId: string) => void;
 onComment?: (postId: string) => void;
 onShare?: (postId: string) => void;
 onAction?: (postId: string, action: string) => void;
 onDelete?: (postId: string) => void;
}

export const MobileFeedCard: React.FC<MobileFeedCardProps> = ({
 post,
 onLike,
 onComment,
 onShare,
 onAction,
 onDelete,
}) => {
 const { isAdmin } = useAdminCheck();
 const { 
  getComponentClasses, 
  getClasses,
  conditionalClasses,
  isDark 
 } = useProtectedTheme();
 const getPostIcon = () => {
  switch (post.type) {
   case 'match_result':
    return <Trophy className='w-4 h-4 text-yellow-500' />;
   case 'achievement':
    return <Target className='w-4 h-4 text-green-500' />;
   case 'challenge':
    return <Flame className='w-4 h-4 text-orange-500' />;
   case 'tournament_update':
    return <Users className='w-4 h-4 text-purple-500' />;
   default:
    return null;
  }
 };

 const getPostTypeLabel = () => {
  switch (post.type) {
   case 'match_result':
    return 'Kết quả trận đấu';
   case 'achievement':
    return 'Thành tích mới';
   case 'challenge':
    return 'Thách đấu';
   case 'tournament_update':
    return 'Cập nhật giải đấu';
   default:
    return 'Hoạt động';
  }
 };

 const getActionButton = () => {
  switch (post.type) {
   case 'challenge':
    return (
     <Button
      
      className='bg-warning-500 hover:bg-orange-600 text-white'
      onClick={() => onAction?.(post.id, 'accept_challenge')}
     >
      Nhận thách đấu
     </Button>
    );
   case 'tournament_update':
    return (
     <Button
      
      variant='outline'
      onClick={() => onAction?.(post.id, 'join_tournament')}
     >
      Tham gia
     </Button>
    );
   default:
    return null;
  }
 };

 const isLiveContent = post.type === 'match_result' && Math.random() > 0.7; // Mock live status

 return (
  <Card className={`mobile-feed-card w-full ${getComponentClasses('feedCard')} shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]`}>
   <CardContent className='p-4 space-y-3'>
    {/* User Header */}
    <div className='flex items-center justify-between'>
     <div className='flex items-center gap-3 flex-1'>
      <Avatar className='h-12 w-12 ring-2 ring-border ring-offset-2 ring-offset-background'>
       <AvatarImage src={post.user.avatar} />
       <AvatarFallback className='text-body-small font-semibold'>
        {post.user.name.charAt(0).toUpperCase()}
       </AvatarFallback>
      </Avatar>
      <div className='flex-1'>
       <div className='flex items-center gap-2'>
        <span className={`font-semibold text-body-small ${getClasses('textPrimary')}`}>
         {post.user.name}
        </span>
        <Badge
         variant='secondary'
         className={`text-caption px-2 py-0.5 font-medium ${getClasses('badge')}`}
        >
         {post.user.rank}
        </Badge>
        {getPostIcon()}
       </div>
       <div className={`flex items-center gap-2 text-caption ${getClasses('textSecondary')}`}>
        <span>{getPostTypeLabel()}</span>
        <span>•</span>
        <div className='flex items-center gap-1'>
         <Clock className='w-3 h-3' />
         <span>{post.timestamp}</span>
        </div>
       </div>
      </div>
     </div>

     <div className='flex items-center gap-2'>
      {/* Live Indicator */}
      {isLiveContent && (
       <MobileLiveIndicator
        type='live_match'
        viewers={Math.floor(Math.random() * 500) + 50}
        status='LIVE'
       />
      )}

      {/* Admin Actions */}
      {isAdmin && onDelete && (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
         <Button
          variant='ghost'
          
          className='h-8 w-8 p-0 text-slate-400 hover:text-slate-200'
         >
          <MoreVertical className='h-4 w-4' />
         </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-40'>
         <DropdownMenuItem
          onClick={() => onDelete(post.id)}
          className='text-destructive focus:text-destructive'
         >
          <Trash2 className='mr-2 h-4 w-4' />
          Xóa bài viết
         </DropdownMenuItem>
        </DropdownMenuContent>
       </DropdownMenu>
      )}
     </div>
    </div>

    {/* Post Content */}
    <div className='space-y-3'>
     <p className='text-body-small leading-relaxed text-slate-100'>{post.content}</p>

     {/* Post Stats */}
     {post.stats && (
      <div className='p-3 bg-slate-700/40 dark:bg-slate-700/50 rounded-lg space-y-2'>
       {post.stats.score && (
        <div className='flex justify-between text-sm'>
         <span className='text-slate-300'>Tỷ số:</span>
         <span className='font-semibold text-slate-100'>{post.stats.score}</span>
        </div>
       )}
       {post.stats.opponent && (
        <div className='flex justify-between text-sm'>
         <span className='text-slate-300'>Đối thủ:</span>
         <span className='text-slate-100'>{post.stats.opponent}</span>
        </div>
       )}
       {post.stats.achievement && (
        <div className='flex justify-between text-sm'>
         <span className='text-slate-300'>Thành tích:</span>
         <span className='font-semibold text-green-400'>
          {post.stats.achievement}
         </span>
        </div>
       )}
       {post.stats.challenge_type && (
        <div className='flex justify-between text-sm'>
         <span className='text-slate-300'>Loại thách đấu:</span>
         <span className='text-slate-100'>{post.stats.challenge_type}</span>
        </div>
       )}
       {post.stats.tournament_name && (
        <div className='flex justify-between text-sm'>
         <span className='text-slate-300'>Giải đấu:</span>
         <span className='font-semibold text-purple-400'>
          {post.stats.tournament_name}
         </span>
        </div>
       )}
      </div>
     )}
    </div>

    {/* Enhanced Reaction Bar */}
    <div className='flex items-center justify-between pt-3 border-t border-slate-600/30'>
     <MobileReactionBar
      likes={post.stats?.likes || 0}
      comments={post.stats?.comments || 0}
      shares={post.stats?.shares || 0}
      isLiked={post.isLiked || false}
      onLike={() => onLike?.(post.id)}
      onComment={() => onComment?.(post.id)}
      onShare={() => onShare?.(post.id)}
      timeAgo={post.timestamp}
     />

     {/* Action Button */}
     {getActionButton()}
    </div>
   </CardContent>
  </Card>
 );
};

export default MobileFeedCard;
