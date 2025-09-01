import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Gift, TrendingUp, Calendar, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { spaService, type SPAMilestone, type UserMilestoneProgress, type SPATransaction } from '@/services/spaService';

const SPADashboard: React.FC = () => {
 const { user } = useAuth();
 const [milestones, setMilestones] = useState<SPAMilestone[]>([]);
 const [userProgress, setUserProgress] = useState<UserMilestoneProgress[]>([]);
 const [transactions, setTransactions] = useState<SPATransaction[]>([]);
 const [currentPoints, setCurrentPoints] = useState(0);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  const loadSPAData = async () => {
   if (!user?.id) return;

   try {
    const [milestonesData, progressData, transactionsData, points] = await Promise.all([
     spaService.getMilestones(),
     spaService.getUserMilestoneProgress(user.id),
     spaService.getUserTransactions(user.id, 10),
     spaService.getCurrentSPAPoints(user.id),
    ]);

    setMilestones(milestonesData);
    setUserProgress(progressData);
    setTransactions(transactionsData);
    setCurrentPoints(points);
   } catch (error) {
    console.error('Error loading SPA data:', error);
   } finally {
    setLoading(false);
   }
  };

  loadSPAData();
 }, [user?.id]);

 const getMilestoneIcon = (type: string) => {
  switch (type) {
   case 'games_played':
    return <Trophy className="h-6 w-6 text-primary-500" />;
   case 'wins':
    return <Star className="h-6 w-6 text-yellow-500" />;
   case 'spa_earned':
    return <TrendingUp className="h-6 w-6 text-success-500" />;
   case 'tournaments_joined':
    return <Users className="h-6 w-6 text-purple-500" />;
   default:
    return <Gift className="h-6 w-6 text-neutral-500" />;
  }
 };

 const getProgressPercentage = (milestone: SPAMilestone, progress?: UserMilestoneProgress) => {
  if (!progress) return 0;
  return Math.min((progress.current_progress / milestone.target_value) * 100, 100);
 };

 const isCompleted = (milestone: SPAMilestone, progress?: UserMilestoneProgress) => {
  return progress?.is_completed || false;
 };

 if (loading) {
  return (
   <div className="container mx-auto p-6">
    <div className="animate-pulse space-y-6">
     <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
       <div key={i} className="h-32 bg-neutral-200 rounded"></div>
      ))}
     </div>
    </div>
   </div>
  );
 }

 return (
  <div className="container mx-auto p-6 space-y-6">
   <div className="flex items-center justify-between">
    <div>
     <h1 className="text-3xl font-bold text-neutral-900">SPA Dashboard</h1>
     <p className="text-neutral-600">Theo dõi điểm SPA và hoàn thành milestone</p>
    </div>
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-var(--color-background)">
     <CardContent className="content-spacing">
      <div className="text-center">
       <div className="text-heading-bold">{currentPoints.toLocaleString()}</div>
       <div className="text-body-small opacity-90">Điểm SPA</div>
      </div>
     </CardContent>
    </Card>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
     <Card>
      <CardHeader>
       <CardTitle>Milestone Progress</CardTitle>
       <CardDescription>
        Hoàn thành các milestone để nhận thưởng điểm SPA
       </CardDescription>
      </CardHeader>
      <CardContent>
       <div className="form-spacing">
        {milestones.map((milestone) => {
         const progress = userProgress.find(p => p.milestone_id === milestone.id);
         const percentage = getProgressPercentage(milestone, progress);
         const completed = isCompleted(milestone, progress);

         return (
          <div key={milestone.id} className="border rounded-lg p-4">
           <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
             {getMilestoneIcon(milestone.milestone_type)}
             <div>
              <h3 className="font-semibold">{milestone.title}</h3>
              <p className="text-body-small-neutral">{milestone.description}</p>
             </div>
            </div>
            <div className="flex items-center space-x-2">
             <Badge 
              variant={completed ? "default" : "secondary"}
              className={completed ? "bg-success-500" : ""}
             >
              {completed ? "Hoàn thành" : "Đang thực hiện"}
             </Badge>
             <span className="text-body-small font-semibold text-amber-600">
              +{milestone.reward_points} SPA
             </span>
            </div>
           </div>
           
           <div className="space-y-2">
            <div className="flex justify-between text-body-small">
             <span>Tiến độ: {progress?.current_progress || 0} / {milestone.target_value}</span>
             <span>{percentage.toFixed(0)}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
           </div>
          </div>
         );
        })}
       </div>
      </CardContent>
     </Card>
    </div>

    <div className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle className="flex items-center space-x-2">
        <Calendar className="h-5 w-5" />
        <span>Lịch sử giao dịch</span>
       </CardTitle>
      </CardHeader>
      <CardContent>
       <div className="space-y-3">
        {transactions.slice(0, 5).map((transaction) => (
         <div key={transaction.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
          <div>
           <p className="font-medium text-body-small">{transaction.description}</p>
           <p className="text-caption-neutral">
            {new Date(transaction.created_at).toLocaleDateString('vi-VN')}
           </p>
          </div>
          <span className={`font-bold ${
           transaction.points_change > 0 ? 'text-success-600' : 'text-error-600'
          }`}>
           {transaction.points_change > 0 ? '+' : ''}{transaction.points_change}
          </span>
         </div>
        ))}
        {transactions.length === 0 && (
         <p className="text-neutral-500 text-center py-4">Chưa có giao dịch nào</p>
        )}
       </div>
      </CardContent>
     </Card>

     <Card>
      <CardHeader>
       <CardTitle className="flex items-center space-x-2">
        <Gift className="h-5 w-5" />
        <span>Cách kiếm SPA</span>
       </CardTitle>
      </CardHeader>
      <CardContent>
       <div className="space-y-3 text-body-small">
        <div className="flex justify-between">
         <span>Tài khoản mới</span>
         <span className="text-title-success">+100 SPA</span>
        </div>
        <div className="flex justify-between">
         <span>Đăng ký hạng</span>
         <span className="text-title-success">+200 SPA</span>
        </div>
        <div className="flex justify-between">
         <span>Giới thiệu bạn bè</span>
         <span className="text-title-success">+150 SPA</span>
        </div>
        <div className="flex justify-between">
         <span>Thắng giải đấu đầu tiên</span>
         <span className="text-title-success">+300 SPA</span>
        </div>
        <div className="flex justify-between">
         <span>Hoàn thiện profile</span>
         <span className="text-title-success">+75 SPA</span>
        </div>
        <div className="flex justify-between">
         <span>Nạp tiền lần đầu</span>
         <span className="text-title-success">+500 SPA</span>
        </div>
       </div>
      </CardContent>
     </Card>
    </div>
   </div>
  </div>
 );
};

export default SPADashboard;
