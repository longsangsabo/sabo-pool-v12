import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  Users,
  Award,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface SPAMilestone {
  id: string;
  milestone_name: string;
  milestone_type: string;
  requirement_value: number;
  spa_reward: number;
  description: string;
  icon: string;
  is_active: boolean;
  is_repeatable: boolean;
  max_per_day?: number;
}

interface SPAStats {
  total_users: number;
  total_spa_awarded: number;
  active_milestones: number;
  completed_milestones_today: number;
}

export function SPAAdminPanel() {
  const [selectedMilestone, setSelectedMilestone] = useState<SPAMilestone | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch milestones
  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['admin-spa-milestones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spa_milestones')
        .select('*')
        .order('milestone_type', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch SPA stats
  const { data: stats } = useQuery({
    queryKey: ['admin-spa-stats'],
    queryFn: async () => {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total SPA awarded
      const { data: spaData } = await supabase
        .from('spa_reward_history')
        .select('spa_amount');

      const totalSpaAwarded = spaData?.reduce((sum, record) => sum + record.spa_amount, 0) || 0;

      // Get active milestones count
      const { count: activeMilestones } = await supabase
        .from('spa_milestones')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get milestones completed today
      const today = new Date().toISOString().split('T')[0];
      const { count: completedToday } = await supabase
        .from('spa_reward_history')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      return {
        total_users: totalUsers || 0,
        total_spa_awarded: totalSpaAwarded,
        active_milestones: activeMilestones || 0,
        completed_milestones_today: completedToday || 0,
      };
    },
  });

  // Create milestone mutation
  const createMilestoneMutation = useMutation({
    mutationFn: async (data: Omit<SPAMilestone, 'id'>) => {
      const { error } = await supabase
        .from('spa_milestones')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Milestone đã được tạo thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-spa-milestones'] });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast.error('Có lỗi khi tạo milestone');
    },
  });

  // Update milestone mutation
  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ id, ...data }: SPAMilestone) => {
      const { error } = await supabase
        .from('spa_milestones')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Milestone đã được cập nhật');
      queryClient.invalidateQueries({ queryKey: ['admin-spa-milestones'] });
      setIsEditDialogOpen(false);
      setSelectedMilestone(null);
    },
  });

  // Delete milestone mutation
  const deleteMilestoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('spa_milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Milestone đã được xóa');
      queryClient.invalidateQueries({ queryKey: ['admin-spa-milestones'] });
    },
  });

  // Reset all SPA points mutation
  const resetAllSPAMutation = useMutation({
    mutationFn: async () => {
      // Execute the reset query
      const { error } = await supabase.rpc('reset_all_spa_points');
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Đã reset tất cả điểm SPA về 0');
      queryClient.invalidateQueries({ queryKey: ['admin-spa-stats'] });
    },
    onError: () => {
      toast.error('Có lỗi khi reset điểm SPA');
    },
  });

  const milestoneTypes = [
    'registration',
    'rank_verification',
    'referral_success',
    'referred_user',
    'daily_login',
    'login_streak_7',
    'login_streak_30',
    'first_tournament',
    'tournament_champion',
    'tournament_top3',
    'first_challenge',
    'challenge_wins_10',
    'challenge_wins_50',
    'challenge_wins_100',
    'win_streak_5',
    'win_streak_10',
    'rank_promotion',
    'join_club',
    'create_club',
    'profile_completion',
    'share_achievement',
    'app_review',
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>SPA System Admin</h1>
          <p className='text-muted-foreground'>
            Quản lý hệ thống điểm SPA và milestones
          </p>
        </div>
        
        <div className='flex gap-2'>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='h-4 w-4 mr-2' />
                Tạo Milestone
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Tạo Milestone Mới</DialogTitle>
                <DialogDescription>
                  Tạo milestone mới cho hệ thống SPA
                </DialogDescription>
              </DialogHeader>
              <MilestoneForm
                onSubmit={(data) => createMilestoneMutation.mutate(data)}
                isLoading={createMilestoneMutation.isPending}
                milestoneTypes={milestoneTypes}
              />
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive'>
                <RotateCcw className='h-4 w-4 mr-2' />
                Reset SPA
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận reset SPA</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này sẽ reset tất cả điểm SPA của tất cả user về 0. 
                  Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => resetAllSPAMutation.mutate()}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                >
                  Xác nhận Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-2'>
                <Users className='h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-2xl font-bold'>{stats.total_users.toLocaleString('vi-VN')}</p>
                  <p className='text-sm text-muted-foreground'>Tổng người dùng</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-2'>
                <Award className='h-5 w-5 text-yellow-600' />
                <div>
                  <p className='text-2xl font-bold'>{stats.total_spa_awarded.toLocaleString('vi-VN')}</p>
                  <p className='text-sm text-muted-foreground'>Tổng SPA đã tặng</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-2'>
                <Settings className='h-5 w-5 text-green-600' />
                <div>
                  <p className='text-2xl font-bold'>{stats.active_milestones}</p>
                  <p className='text-sm text-muted-foreground'>Milestone đang hoạt động</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5 text-purple-600' />
                <div>
                  <p className='text-2xl font-bold'>{stats.completed_milestones_today}</p>
                  <p className='text-sm text-muted-foreground'>Milestone hoàn thành hôm nay</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Milestones Management */}
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className='flex items-center justify-between p-4 border rounded-lg'
              >
                <div className='flex items-center gap-4'>
                  <span className='text-2xl'>{milestone.icon}</span>
                  <div>
                    <h3 className='font-semibold'>{milestone.milestone_name}</h3>
                    <p className='text-sm text-muted-foreground'>
                      {milestone.description}
                    </p>
                    <div className='flex items-center gap-2 mt-1'>
                      <Badge variant='outline'>
                        {milestone.milestone_type}
                      </Badge>
                      <Badge variant={milestone.is_active ? 'default' : 'secondary'}>
                        {milestone.is_active ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                      {milestone.is_repeatable && (
                        <Badge variant='outline'>Lặp lại</Badge>
                      )}
                      <Badge className='bg-yellow-100 text-yellow-800'>
                        +{milestone.spa_reward} SPA
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setSelectedMilestone(milestone);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant='outline' size='sm'>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xóa milestone</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn xóa milestone "{milestone.milestone_name}"?
                          Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMilestoneMutation.mutate(milestone.id)}
                          className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        >
                          Xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Milestone</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin milestone
            </DialogDescription>
          </DialogHeader>
          {selectedMilestone && (
            <MilestoneForm
              milestone={selectedMilestone}
              onSubmit={(data) => updateMilestoneMutation.mutate({ ...data, id: selectedMilestone.id })}
              isLoading={updateMilestoneMutation.isPending}
              milestoneTypes={milestoneTypes}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Milestone Form Component
interface MilestoneFormProps {
  milestone?: SPAMilestone;
  onSubmit: (data: Omit<SPAMilestone, 'id'>) => void;
  isLoading: boolean;
  milestoneTypes: string[];
}

function MilestoneForm({ milestone, onSubmit, isLoading, milestoneTypes }: MilestoneFormProps) {
  const [formData, setFormData] = useState<Omit<SPAMilestone, 'id'>>({
    milestone_name: milestone?.milestone_name || '',
    milestone_type: milestone?.milestone_type || '',
    requirement_value: milestone?.requirement_value || 1,
    spa_reward: milestone?.spa_reward || 100,
    description: milestone?.description || '',
    icon: milestone?.icon || '🏆',
    is_active: milestone?.is_active ?? true,
    is_repeatable: milestone?.is_repeatable ?? false,
    max_per_day: milestone?.max_per_day || undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='milestone_name'>Tên Milestone</Label>
          <Input
            id='milestone_name'
            value={formData.milestone_name}
            onChange={(e) => setFormData({ ...formData, milestone_name: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor='milestone_type'>Loại Milestone</Label>
          <Select
            value={formData.milestone_type}
            onValueChange={(value) => setFormData({ ...formData, milestone_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder='Chọn loại milestone' />
            </SelectTrigger>
            <SelectContent>
              {milestoneTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor='description'>Mô tả</Label>
        <Textarea
          id='description'
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div>
          <Label htmlFor='spa_reward'>SPA Reward</Label>
          <Input
            id='spa_reward'
            type='number'
            value={formData.spa_reward}
            onChange={(e) => setFormData({ ...formData, spa_reward: parseInt(e.target.value) })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor='requirement_value'>Yêu cầu</Label>
          <Input
            id='requirement_value'
            type='number'
            value={formData.requirement_value}
            onChange={(e) => setFormData({ ...formData, requirement_value: parseInt(e.target.value) })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor='icon'>Icon</Label>
          <Input
            id='icon'
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          />
        </div>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div>
          <Label htmlFor='max_per_day'>Giới hạn/ngày</Label>
          <Input
            id='max_per_day'
            type='number'
            value={formData.max_per_day || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              max_per_day: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            placeholder='Không giới hạn'
          />
        </div>
        
        <div className='flex items-center space-x-2 pt-6'>
          <input
            type='checkbox'
            id='is_active'
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
          <Label htmlFor='is_active'>Hoạt động</Label>
        </div>
        
        <div className='flex items-center space-x-2 pt-6'>
          <input
            type='checkbox'
            id='is_repeatable'
            checked={formData.is_repeatable}
            onChange={(e) => setFormData({ ...formData, is_repeatable: e.target.checked })}
          />
          <Label htmlFor='is_repeatable'>Lặp lại</Label>
        </div>
      </div>

      <DialogFooter>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : milestone ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </DialogFooter>
    </form>
  );
}
