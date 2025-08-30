import { useEffect, useState } from 'react';
import { milestoneService } from '@/services/milestoneService';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const MilestoneSummaryWidget: React.FC = () => {
  const { user } = useAuth();
  const [completed, setCompleted] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const progress = await milestoneService.getPlayerMilestoneProgress(user.id);
      setCompleted(progress.filter(p => p.is_completed).length);
      setTotal(progress.length);
    })();
  }, [user]);

  if (!user) return null;
  return (
    <Card className='shadow-sm'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm'>Milestones</CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='text-heading-bold'>{completed} / {total}</div>
        <p className='text-caption-neutral'>Đã hoàn thành</p>
      </CardContent>
    </Card>
  );
};
