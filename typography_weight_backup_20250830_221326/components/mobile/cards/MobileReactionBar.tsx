import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileReactionBarProps {
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  timeAgo: string;
}

export const MobileReactionBar: React.FC<MobileReactionBarProps> = ({
  likes,
  comments,
  shares,
  isLiked,
  onLike,
  onComment,
  onShare,
  timeAgo,
}) => {
  return (
    <div className='mobile-reaction-bar'>
      <div className='reaction-buttons'>
        <Button
          variant='ghost'
          size='sm'
          onClick={onLike}
          className={`reaction-btn ${isLiked ? 'liked' : ''}`}
        >
          <Heart
            className={`w-5 h-5 ${isLiked ? 'fill-current heart-animation' : ''}`}
          />
          <span className='text-body-small font-medium'>{likes}</span>
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={onComment}
          className='reaction-btn'
        >
          <MessageCircle className='w-5 h-5' />
          <span className='text-body-small font-medium'>{comments}</span>
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={onShare}
          className='reaction-btn'
        >
          <Share2 className='w-5 h-5' />
          <span className='text-body-small font-medium'>{shares}</span>
        </Button>
      </div>

      <div className='reaction-timestamp'>
        <span className='text-caption-muted'>{timeAgo}</span>
      </div>
    </div>
  );
};

export default MobileReactionBar;
