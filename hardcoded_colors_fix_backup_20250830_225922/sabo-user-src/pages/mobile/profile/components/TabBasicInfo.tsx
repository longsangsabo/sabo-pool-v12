import React from 'react';
import { Phone, MapPin, Star, Calendar, Edit3 } from 'lucide-react';
import { ProfileData } from '../types';
import { Button } from '@/components/ui/button';

interface Props {
  profile: ProfileData;
  skillLabel: string;
  onEdit: () => void;
}

export const TabBasicInfo: React.FC<Props> = ({
  profile,
  skillLabel,
  onEdit,
}) => {
  return (
    <div className='p-4 space-y-3'>
      <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
        <Phone className='w-4 h-4 text-muted-foreground' />
        <div>
          <div className='text-body-small-medium'>Số điện thoại</div>
          <div className='text-caption text-muted-foreground'>
            {profile.phone || 'Chưa cập nhật'}
          </div>
        </div>
      </div>
      <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
        <MapPin className='w-4 h-4 text-muted-foreground' />
        <div>
          <div className='text-body-small-medium'>Địa điểm</div>
          <div className='text-caption text-muted-foreground'>
            {profile.city && profile.district
              ? `${profile.district}, ${profile.city}`
              : 'Chưa cập nhật'}
          </div>
        </div>
      </div>
      <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
        <Star className='w-4 h-4 text-muted-foreground' />
        <div>
          <div className='text-body-small-medium'>Trình độ</div>
          <div className='text-caption text-muted-foreground'>{skillLabel}</div>
        </div>
      </div>
      <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
        <Calendar className='w-4 h-4 text-muted-foreground' />
        <div>
          <div className='text-body-small-medium'>Thành viên từ</div>
          <div className='text-caption text-muted-foreground'>
            {profile.member_since
              ? new Date(profile.member_since).toLocaleDateString('vi-VN')
              : 'Không rõ'}
          </div>
        </div>
      </div>
      <Button
        variant='outline'
        size='sm'
        className='w-full mt-4'
        onClick={onEdit}
      >
        <Edit3 className='w-4 h-4 mr-2' /> Chỉnh sửa thông tin
      </Button>
    </div>
  );
};
