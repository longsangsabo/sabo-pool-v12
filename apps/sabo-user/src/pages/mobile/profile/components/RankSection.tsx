import React from 'react';
import { Button } from '@/components/ui/button';
import RankRegistrationForm from '@/components/RankRegistrationForm';
import { Award } from 'lucide-react';

interface RankSectionProps {
  onOpenRequest: () => void;
  theme: 'light' | 'dark';
}

export const RankSection: React.FC<RankSectionProps> = ({
  onOpenRequest,
  theme,
}) => {
  return (
    <div className='space-y-4'>
      <RankRegistrationForm />
      <Button
        variant='outline'
        size='sm'
        onClick={onOpenRequest}
        className='w-full max-w-xs'
      >
        <Award className='w-4 h-4 mr-2' /> Gửi yêu cầu thay đổi hạng
      </Button>
      <p
        className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
      >
        Bạn có thể gửi yêu cầu nếu thứ hạng thực tế đã thay đổi hoặc cần xác
        thực lại.
      </p>
    </div>
  );
};
