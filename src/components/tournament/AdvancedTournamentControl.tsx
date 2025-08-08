import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Zap,
  Clock,
  Users,
  Target,
  Wand2,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { Tournament } from '@/types/tournament-management';
import { useAdvancedTournamentActions } from '@/hooks/useAdvancedTournamentActions';

interface AdvancedTournamentControlProps {
  tournaments: Tournament[];
  selectedTournaments: string[];
  onRefresh: () => void;
}

export const AdvancedTournamentControl: React.FC<
  AdvancedTournamentControlProps
> = ({ tournaments, selectedTournaments, onRefresh }) => {
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(false);
  const [smartSeedingEnabled, setSmartSeedingEnabled] = useState(true);
  const [bulkActionTarget, setBulkActionTarget] = useState<string>('');

  const {
    bulkUpdateTournamentStatus,
    generateSmartBracket,
    autoScheduleMatches,
  } = useAdvancedTournamentActions();

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedTournaments.length === 0) {
      return;
    }

    await bulkUpdateTournamentStatus(selectedTournaments, status);
    onRefresh();
  };

  const controlActions = [
    {
      title: 'Bulk Actions',
      icon: Zap,
      actions: [
        {
          label: 'Mở đăng ký',
          action: () => handleBulkStatusUpdate('registration_open'),
          color: 'green',
        },
        {
          label: 'Đóng đăng ký',
          action: () => handleBulkStatusUpdate('registration_closed'),
          color: 'orange',
        },
        {
          label: 'Bắt đầu',
          action: () => handleBulkStatusUpdate('ongoing'),
          color: 'blue',
        },
        {
          label: 'Hoàn thành',
          action: () => handleBulkStatusUpdate('completed'),
          color: 'gray',
        },
      ],
    },
    {
      title: 'Smart Features',
      icon: Wand2,
      actions: [
        {
          label: 'Auto Schedule',
          action: () => {},
          color: 'purple',
          disabled: !autoScheduleEnabled,
        },
        {
          label: 'Smart Seeding',
          action: () => {},
          color: 'indigo',
          disabled: !smartSeedingEnabled,
        },
      ],
    },
  ];

  const stats = {
    total: tournaments.length,
    selected: selectedTournaments.length,
    active: tournaments.filter(t => t.status === 'ongoing').length,
    pending: tournaments.filter(t => t.status === 'registration_open').length,
  };

  return (
    <div className='space-y-6'>
      {/* Quick Stats */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {[
          { label: 'Tổng', value: stats.total, icon: Target, color: 'blue' },
          {
            label: 'Đã chọn',
            value: stats.selected,
            icon: Users,
            color: 'green',
          },
          {
            label: 'Đang diễn ra',
            value: stats.active,
            icon: Clock,
            color: 'orange',
          },
          {
            label: 'Chờ ĐK',
            value: stats.pending,
            icon: Calendar,
            color: 'purple',
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>{stat.label}</p>
                  <p className='text-2xl font-bold'>{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 text-${stat.color}-500`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Control Actions */}
      <div className='grid md:grid-cols-2 gap-6'>
        {controlActions.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Icon className='h-5 w-5' />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {section.actions.map((action, actionIndex) => (
                  <Button
                    key={actionIndex}
                    variant='outline'
                    size='sm'
                    onClick={action.action}
                    disabled={
                      action.disabled ||
                      (section.title === 'Bulk Actions' &&
                        selectedTournaments.length === 0)
                    }
                    className={`w-full justify-start ${
                      action.disabled ? 'opacity-50' : ''
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full bg-${action.color}-500 mr-2`}
                    />
                    {action.label}
                    {section.title === 'Bulk Actions' && (
                      <Badge variant='secondary' className='ml-auto'>
                        {selectedTournaments.length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5' />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>Auto Scheduling</Label>
              <p className='text-sm text-muted-foreground'>
                Tự động lên lịch các trận đấu
              </p>
            </div>
            <Switch
              checked={autoScheduleEnabled}
              onCheckedChange={setAutoScheduleEnabled}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>Smart Seeding</Label>
              <p className='text-sm text-muted-foreground'>
                Sử dụng thuật toán thông minh cho seeding
              </p>
            </div>
            <Switch
              checked={smartSeedingEnabled}
              onCheckedChange={setSmartSeedingEnabled}
            />
          </div>

          <div className='space-y-2'>
            <Label>Bulk Action Target</Label>
            <Input
              placeholder='Tournament IDs hoặc filter criteria'
              value={bulkActionTarget}
              onChange={e => setBulkActionTarget(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='h-5 w-5' />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div>
              <p className='text-2xl font-bold text-green-600'>98.5%</p>
              <p className='text-sm text-muted-foreground'>Uptime</p>
            </div>
            <div>
              <p className='text-2xl font-bold text-blue-600'>145ms</p>
              <p className='text-sm text-muted-foreground'>Avg Response</p>
            </div>
            <div>
              <p className='text-2xl font-bold text-purple-600'>2.3GB</p>
              <p className='text-sm text-muted-foreground'>Memory Usage</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
