import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Trophy, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MilestoneCard } from './MilestoneCard';
import { toast } from 'sonner';

interface Milestone {
  milestone_id: string;
  milestone_name: string;
  milestone_type: string;
  description: string;
  icon: string;
  requirement_value: number;
  current_progress: number;
  spa_reward: number;
  is_completed: boolean;
  is_repeatable: boolean;
  completed_at?: string;
}

interface MilestoneStats {
  total_milestones: number;
  completed_milestones: number;
  total_spa_earned: number;
  completion_rate: number;
}

export function MilestonesList() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch user milestones
  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['user-milestones', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc('get_user_milestone_progress', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Error fetching milestones:', error);
        toast.error('Không thể tải milestones');
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate stats
  const stats: MilestoneStats = React.useMemo(() => {
    const total = milestones.length;
    const completed = milestones.filter((m: Milestone) => m.is_completed).length;
    const totalSpaEarned = milestones
      .filter((m: Milestone) => m.is_completed)
      .reduce((sum: number, m: Milestone) => sum + m.spa_reward, 0);
    
    return {
      total_milestones: total,
      completed_milestones: completed,
      total_spa_earned: totalSpaEarned,
      completion_rate: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [milestones]);

  // Filter milestones
  const filteredMilestones = React.useMemo(() => {
    return milestones.filter((milestone: Milestone) => {
      // Search filter
      const matchesSearch = milestone.milestone_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        milestone.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = filterType === 'all' || milestone.milestone_type === filterType;

      // Status filter
      const matchesStatus = 
        filterStatus === 'all' ||
        (filterStatus === 'completed' && milestone.is_completed) ||
        (filterStatus === 'pending' && !milestone.is_completed);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [milestones, searchTerm, filterType, filterStatus]);

  // Group milestones by type
  const groupedMilestones = React.useMemo(() => {
    const groups: { [key: string]: Milestone[] } = {};
    
    filteredMilestones.forEach((milestone: Milestone) => {
      const type = milestone.milestone_type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(milestone);
    });

    return groups;
  }, [filteredMilestones]);

  const milestoneTypes = [
    { value: 'registration', label: 'Đăng ký' },
    { value: 'rank_verification', label: 'Xác thực hạng' },
    { value: 'referral_success', label: 'Giới thiệu' },
    { value: 'daily_login', label: 'Đăng nhập hàng ngày' },
    { value: 'tournament_champion', label: 'Tournament' },
    { value: 'challenge_wins', label: 'Thách đấu' },
    { value: 'win_streak', label: 'Chuỗi thắng' },
    { value: 'rank_promotion', label: 'Thăng hạng' },
    { value: 'join_club', label: 'CLB' },
  ];

  const getTypeLabel = (type: string) => {
    const typeObj = milestoneTypes.find(t => t.value === type);
    return typeObj?.label || type;
  };

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
      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Trophy className='h-5 w-5 text-yellow-600' />
              <div>
                <p className='text-2xl font-bold'>{stats.total_milestones}</p>
                <p className='text-sm text-muted-foreground'>Tổng milestone</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-green-600' />
              <div>
                <p className='text-2xl font-bold'>{stats.completed_milestones}</p>
                <p className='text-sm text-muted-foreground'>Đã hoàn thành</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Award className='h-5 w-5 text-purple-600' />
              <div>
                <p className='text-2xl font-bold'>{stats.total_spa_earned.toLocaleString('vi-VN')}</p>
                <p className='text-sm text-muted-foreground'>SPA đã nhận</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5 text-blue-600' />
              <div>
                <p className='text-2xl font-bold'>{stats.completion_rate.toFixed(1)}%</p>
                <p className='text-sm text-muted-foreground'>Tỷ lệ hoàn thành</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Bộ lọc và tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Tìm kiếm milestone...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className='w-full md:w-48'>
                <SelectValue placeholder='Loại milestone' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả loại</SelectItem>
                {milestoneTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className='w-full md:w-48'>
                <SelectValue placeholder='Trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả</SelectItem>
                <SelectItem value='completed'>Đã hoàn thành</SelectItem>
                <SelectItem value='pending'>Chưa hoàn thành</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
              <Button
                variant='outline'
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Milestones Tabs */}
      <Tabs defaultValue='all' className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='all'>
            Tất cả ({filteredMilestones.length})
          </TabsTrigger>
          <TabsTrigger value='completed'>
            Đã hoàn thành ({filteredMilestones.filter(m => m.is_completed).length})
          </TabsTrigger>
          <TabsTrigger value='pending'>
            Đang thực hiện ({filteredMilestones.filter(m => !m.is_completed).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='space-y-6'>
          {Object.keys(groupedMilestones).length === 0 ? (
            <Card>
              <CardContent className='p-8 text-center'>
                <Clock className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                <p className='text-lg font-medium mb-2'>Không tìm thấy milestone</p>
                <p className='text-muted-foreground'>
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedMilestones).map(([type, typeMilestones]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Badge variant='outline'>{getTypeLabel(type)}</Badge>
                    <span className='text-base font-medium'>
                      ({typeMilestones.length} milestone)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                    {typeMilestones.map((milestone) => (
                      <MilestoneCard
                        key={milestone.milestone_id}
                        milestone={milestone}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value='completed' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {filteredMilestones
              .filter((m) => m.is_completed)
              .map((milestone) => (
                <MilestoneCard
                  key={milestone.milestone_id}
                  milestone={milestone}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value='pending' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {filteredMilestones
              .filter((m) => !m.is_completed)
              .map((milestone) => (
                <MilestoneCard
                  key={milestone.milestone_id}
                  milestone={milestone}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
