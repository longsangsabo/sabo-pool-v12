import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
// NOTE: "Broom" icon not available in installed lucide-react version; replaced with Sparkles
import {
  Loader2,
  Activity,
  ShieldCheck,
  RefreshCw,
  Play,
  Sparkles,
  Settings2,
} from 'lucide-react';
import TournamentAutomationService, {
  TournamentState,
} from '@/services/TournamentAutomationService';

const stateOptions: TournamentState[] = [
  'registration_open',
  'registration_closed',
  'ongoing',
  'completed',
  'cancelled',
];

const labelMap: Record<TournamentState, string> = {
  registration_open: 'Registration Open',
  registration_closed: 'Registration Closed',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const StatusPill: React.FC<{ status?: string }> = ({ status }) => {
  const colorMap: Record<string, string> = {
    healthy: 'success',
    active: 'success',
    completed: 'success',
    processing: 'secondary',
    pending: 'secondary',
    failed: 'destructive',
    error: 'destructive',
  };
  const variant = status ? colorMap[status] || 'outline' : 'outline';
  return <Badge variant={variant as any}>{status || 'unknown'}</Badge>;
};

const AutomationConsole: React.FC = () => {
  const [tournamentId, setTournamentId] = useState('');
  const [daysToKeep, setDaysToKeep] = useState(30);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<any | null>(null);
  const [newState, setNewState] = useState<TournamentState>('ongoing');

  const run = async (key: string, fn: () => Promise<any>) => {
    try {
      setLoadingAction(key);
      const res = await fn();
      if (!res?.success) throw new Error(res?.error || 'Unknown error');
      toast.success('Thành công');
      return res?.data ?? res;
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Có lỗi xảy ra');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleHealthCheck = () =>
    run('health', () => TournamentAutomationService.healthCheck());
  const handleRecoverAll = async () => {
    const data = await run('recover_all', () =>
      TournamentAutomationService.recoverAll()
    );
    if (data) setStatusData(data);
  };
  const handleRecoverOne = async () => {
    if (!tournamentId) return toast.warning('Nhập tournament_id');
    const data = await run('recover_one', () =>
      TournamentAutomationService.recoverOne(tournamentId)
    );
    if (data) setStatusData(data);
  };
  const handleStatus = async () => {
    if (!tournamentId) return toast.warning('Nhập tournament_id');
    const data = await run('status', () =>
      TournamentAutomationService.status(tournamentId)
    );
    if (data) setStatusData(data);
  };
  const handleForceStart = async () => {
    if (!tournamentId) return toast.warning('Nhập tournament_id');
    await run('force_start', () =>
      TournamentAutomationService.forceStart(tournamentId)
    );
  };
  const handleManageState = async () => {
    if (!tournamentId) return toast.warning('Nhập tournament_id');
    await run('manage_state', () =>
      TournamentAutomationService.manageState(tournamentId, newState)
    );
  };
  const handleCleanup = async () => {
    await run('cleanup', () =>
      TournamentAutomationService.cleanupLogs(daysToKeep)
    );
  };
  const handleCreateSabo = async () => {
    if (!tournamentId) return toast.warning('Nhập tournament_id');
    await run('create_sabo', () =>
      TournamentAutomationService.createSaboStructure(tournamentId)
    );
  };

  return (
    <>
      {/* SEO */}
      <Helmet>
        <title>Automation Console | Tournament Automation</title>
        <meta
          name='description'
          content='Admin console to manage tournament automation health, recovery, and state.'
        />
        <link rel='canonical' href='/admin/automation' />
      </Helmet>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings2 className='h-5 w-5 text-primary' />
            <h1>Automation Console</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
            {/* Left column */}
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='tournamentId'>Tournament ID</Label>
                <Input
                  id='tournamentId'
                  placeholder='e.g. 7a6f...'
                  value={tournamentId}
                  onChange={e => setTournamentId(e.target.value)}
                />
                <div className='flex flex-wrap gap-2'>
                  <Button
                    size='sm'
                    onClick={handleStatus}
                    disabled={loadingAction === 'status'}
                  >
                    {loadingAction === 'status' ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Activity className='h-4 w-4' />
                    )}
                    <span>Check Status</span>
                  </Button>
                  <Button
                    size='sm'
                    onClick={handleRecoverOne}
                    variant='outline'
                    disabled={loadingAction === 'recover_one'}
                  >
                    {loadingAction === 'recover_one' ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <RefreshCw className='h-4 w-4' />
                    )}
                    <span>Recover This</span>
                  </Button>
                  <Button
                    size='sm'
                    onClick={handleForceStart}
                    variant='outline'
                    disabled={loadingAction === 'force_start'}
                  >
                    {loadingAction === 'force_start' ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Play className='h-4 w-4' />
                    )}
                    <span>Force Start</span>
                  </Button>
                </div>
              </div>

              <Separator />

              <div className='space-y-2'>
                <Label>Manage State</Label>
                <div className='flex gap-2'>
                  <Select
                    value={newState}
                    onValueChange={v => setNewState(v as TournamentState)}
                  >
                    <SelectTrigger className='w-[220px]'>
                      <SelectValue placeholder='Select state' />
                    </SelectTrigger>
                    <SelectContent>
                      {stateOptions.map(s => (
                        <SelectItem key={s} value={s}>
                          {labelMap[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleManageState}
                    disabled={loadingAction === 'manage_state'}
                  >
                    {loadingAction === 'manage_state' ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <ShieldCheck className='h-4 w-4' />
                    )}
                    <span>Apply</span>
                  </Button>
                </div>
              </div>

              <Separator />

              <div className='space-y-2'>
                <Label>System Actions</Label>
                <div className='flex flex-wrap gap-2'>
                  <Button
                    onClick={handleHealthCheck}
                    variant='secondary'
                    disabled={loadingAction === 'health'}
                  >
                    {loadingAction === 'health' ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Activity className='h-4 w-4' />
                    )}
                    <span>Health Check</span>
                  </Button>
                  <Button
                    onClick={handleRecoverAll}
                    variant='outline'
                    disabled={loadingAction === 'recover_all'}
                  >
                    {loadingAction === 'recover_all' ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <RefreshCw className='h-4 w-4' />
                    )}
                    <span>Recover All</span>
                  </Button>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Cleanup Logs</Label>
                <div className='flex gap-2 items-center'>
                  <Input
                    type='number'
                    min={1}
                    value={daysToKeep}
                    onChange={e =>
                      setDaysToKeep(parseInt(e.target.value || '0', 10))
                    }
                    className='w-28'
                  />
                  <span className='text-sm text-muted-foreground'>
                    days to keep
                  </span>
                  <Button
                    onClick={handleCleanup}
                    variant='outline'
                    disabled={loadingAction === 'cleanup'}
                  >
                    {loadingAction === 'cleanup' ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Sparkles className='h-4 w-4' />
                    )}
                    <span>Cleanup</span>
                  </Button>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Structure Tools</Label>
                <div className='flex flex-wrap gap-2'>
                  <Button
                    onClick={handleCreateSabo}
                    variant='outline'
                    disabled={loadingAction === 'create_sabo'}
                  >
                    {loadingAction === 'create_sabo' ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <RefreshCw className='h-4 w-4' />
                    )}
                    <span>Create SABO Structure</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right columns */}
            <div className='xl:col-span-2'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-base font-semibold'>Automation Status</h2>
                  <StatusPill
                    status={
                      statusData?.automation_status?.tournament_status ||
                      statusData?.status
                    }
                  />
                </div>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                  <StatCard
                    label='Total Matches'
                    value={statusData?.automation_status?.total_matches}
                  />
                  <StatCard
                    label='Completed'
                    value={statusData?.automation_status?.completed_matches}
                  />
                  <StatCard
                    label='Progress'
                    value={
                      statusData?.automation_status?.progress_percentage
                        ? `${statusData.automation_status.progress_percentage}%`
                        : '-'
                    }
                  />
                  <StatCard
                    label='Rounds'
                    value={
                      statusData?.automation_status
                        ? `${statusData.automation_status.current_round}/${statusData.automation_status.max_rounds}`
                        : '-'
                    }
                  />
                </div>

                {Array.isArray(statusData?.recent_logs) &&
                  statusData.recent_logs.length > 0 && (
                    <div className='space-y-2'>
                      <h3 className='text-sm font-medium'>
                        Recent Automation Logs
                      </h3>
                      <div className='bg-muted rounded-md p-3 max-h-64 overflow-auto text-sm'>
                        {statusData.recent_logs.map((log: any, idx: number) => (
                          <div
                            key={idx}
                            className='flex items-center justify-between py-1 border-b last:border-0'
                          >
                            <div className='truncate'>
                              <span className='font-semibold'>
                                {log.automation_type}
                              </span>
                              <span className='mx-2 text-muted-foreground'>
                                •
                              </span>
                              <span className='text-muted-foreground'>
                                {new Date(log.created_at).toLocaleString()}
                              </span>
                            </div>
                            <StatusPill status={log.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const StatCard: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className='rounded-lg border bg-card p-3'>
    <div className='text-xs text-muted-foreground mb-1'>{label}</div>
    <div className='text-lg font-semibold'>{value ?? '-'}</div>
  </div>
);

export default AutomationConsole;
