import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Building,
  Eye,
  Check,
  X,
  Clock,
  MapPin,
  Phone,
  Users,
  Calendar,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface ClubRegistration {
  id: string;
  user_id: string;
  club_name: string;
  address: string;
  phone: string;
  email?: string;
  description?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  basic_hourly_rate: number;
  table_count: number;
  profiles?: {
    display_name: string;
    full_name: string;
    phone?: string;
  };
}

const AdminClubRegistrations = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<ClubRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] =
    useState<ClubRegistration | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [syncingData, setSyncingData] = useState(false);

  useEffect(() => {
    fetchRegistrations();

    // Set up real-time subscription for club registrations
    console.log('Setting up real-time subscription for club registrations');
    const channel = supabase
      .channel('admin-club-registrations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'club_registrations',
        },
        payload => {
          console.log('Real-time club registration update:', payload);
          fetchRegistrations(); // Refresh data
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up club registrations subscription');
      supabase.removeChannel(channel);
    };
  }, [statusFilter]);

  const fetchRegistrations = async () => {
    console.log(
      '🔍 Admin accessing club registrations, filtering by:',
      statusFilter
    );
    setLoading(true);

    try {
      // First, get club registrations without join
      let query = supabase
        .from('club_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: registrations, error } = await query;

      if (error) {
        console.error('Club registrations query error:', error);
        toast.error('Không thể tải danh sách đăng ký CLB: ' + error.message);
        return;
      }

      // Get user profiles separately to avoid relationship issues
      let registrationsWithProfiles: ClubRegistration[] = [];
      
      if (registrations && registrations.length > 0) {
        const userIds = registrations.map(r => r.user_id);
        
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, display_name, full_name, phone')
          .in('user_id', userIds);

        if (profileError) {
          console.warn('Warning: Could not load user profiles:', profileError);
        }

        // Combine registrations with profiles
        registrationsWithProfiles = registrations.map(reg => ({
          ...reg,
          profiles: profiles?.find(p => p.user_id === reg.user_id) || null
        }));
      } else {
        registrationsWithProfiles = registrations || [];
      }

      console.log(
        '📋 Found registrations with filter:',
        statusFilter,
        'Count:',
        registrationsWithProfiles?.length || 0
      );

      setRegistrations((registrationsWithProfiles || []) as any);
    } catch (error: any) {
      console.error('Error fetching registrations:', error);
      toast.error('Lỗi khi tải danh sách đăng ký: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const approveRegistration = async (registration: ClubRegistration) => {
    console.log('✅ Starting approval for club:', registration.club_name);
    setProcessing(true);

    try {
      // First, update the registration status to approved
      const { error: updateError } = await supabase
        .from('club_registrations')
        .update({
          status: 'approved',
          approval_date: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', registration.id);

      if (updateError) {
        console.error('❌ Registration approval error:', updateError);
        throw new Error(`Lỗi duyệt đăng ký: ${updateError.message}`);
      }

      // Create club profile and assign role using our new function
      const { data: profileResult, error: profileError } = await supabase.rpc(
        'create_club_profile_from_registration',
        {
          p_registration_id: registration.id,
          p_admin_id: user?.id,
        }
      );

      if (profileError) {
        console.error('❌ Club profile creation error:', profileError);
        throw new Error(`Lỗi tạo hồ sơ câu lạc bộ: ${profileError.message}`);
      }

      console.log('✅ Club profile created:', profileResult);

      // Send notification to club owner
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: registration.user_id,
          type: 'club_approved',
          title: 'Câu lạc bộ đã được duyệt!',
          message: `Câu lạc bộ "${registration.club_name}" của bạn đã được admin duyệt và có thể hoạt động. Chúc mừng!`,
          action_url: `/club-dashboard`,
          auto_popup: true,
        });

      if (notificationError) {
        console.warn('⚠️ Could not send notification:', notificationError);
      }

      console.log('🎉 Club approval completed successfully!');
      toast.success(
        `Đã duyệt thành công câu lạc bộ "${registration.club_name}"! Chủ CLB đã được thông báo và cấp quyền.`
      );

      // Refresh the list to show updated status
      await fetchRegistrations();
      setSelectedRegistration(null);
    } catch (error: any) {
      console.error('💥 Error during club approval:', error);
      toast.error(`Lỗi khi duyệt đăng ký: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const rejectRegistration = async (registration: ClubRegistration) => {
    if (!rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    console.log(
      '❌ Rejecting club:',
      registration.club_name,
      'Reason:',
      rejectionReason
    );
    setProcessing(true);

    try {
      // Update status with rejection reason
      const { error } = await supabase
        .from('club_registrations')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          review_date: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', registration.id);

      if (error) {
        console.error('❌ Rejection error:', error);
        throw new Error(`Lỗi từ chối đăng ký: ${error.message}`);
      }

      // Send notification to club owner about rejection
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: registration.user_id,
          type: 'club_rejected',
          title: 'Đăng ký câu lạc bộ bị từ chối',
          message: `Đăng ký câu lạc bộ "${registration.club_name}" đã bị từ chối. Lý do: ${rejectionReason}`,
          action_url: `/clubs/register`,
          auto_popup: true,
        });

      if (notificationError) {
        console.warn(
          '⚠️ Could not send rejection notification:',
          notificationError
        );
      }

      console.log('❌ Club rejected successfully:', registration.club_name);
      toast.success(
        `Đã từ chối đăng ký câu lạc bộ "${registration.club_name}" và gửi thông báo cho chủ CLB`
      );
      setRejectionReason('');
      await fetchRegistrations();
      setSelectedRegistration(null);
    } catch (error: any) {
      console.error('Error rejecting registration:', error);
      toast.error('Lỗi khi từ chối đăng ký: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const syncApprovedRegistrations = async () => {
    setSyncingData(true);
    try {
      const { data: syncResult, error } = await supabase.rpc(
        'sync_approved_club_registrations'
      );

      if (error) {
        throw new Error(error.message);
      }

      const synced = (syncResult as any)?.synced_count || 0;
      toast.success(`Đã đồng bộ ${synced} câu lạc bộ đã duyệt`);

      if (synced > 0) {
        await fetchRegistrations();
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error('Lỗi đồng bộ dữ liệu: ' + error.message);
    } finally {
      setSyncingData(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className='bg-green-100 text-green-800'>Đã duyệt</Badge>;
      case 'rejected':
        return <Badge className='bg-red-100 text-red-800'>Bị từ chối</Badge>;
      case 'pending':
        return (
          <Badge className='bg-yellow-100 text-yellow-800'>Chờ duyệt</Badge>
        );
      case 'draft':
        return <Badge className='bg-gray-100 text-gray-800'>Bản nháp</Badge>;
      default:
        return (
          <Badge className='bg-gray-100 text-gray-800'>Không xác định</Badge>
        );
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Chưa đặt';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Quản lý đăng ký câu lạc bộ</h1>
          <p className='text-muted-foreground'>
            Xét duyệt các yêu cầu đăng ký câu lạc bộ ({registrations.length}{' '}
            đăng ký)
          </p>
          {statusFilter !== 'all' && (
            <p className='text-sm text-primary'>
              Đang lọc:{' '}
              {statusFilter === 'pending'
                ? 'Chờ duyệt'
                : statusFilter === 'approved'
                  ? 'Đã duyệt'
                  : statusFilter === 'rejected'
                    ? 'Bị từ chối'
                    : 'Bản nháp'}
            </p>
          )}
        </div>
        <div className='flex gap-3 items-center'>
          <Button
            onClick={syncApprovedRegistrations}
            variant='outline'
            disabled={syncingData}
            className='flex items-center gap-2'
          >
            <RotateCcw
              className={`w-4 h-4 ${syncingData ? 'animate-spin' : ''}`}
            />
            {syncingData ? 'Đang đồng bộ...' : 'Đồng bộ dữ liệu'}
          </Button>
          <Button
            onClick={fetchRegistrations}
            variant='outline'
            disabled={loading}
          >
            🔄 Refresh
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-48'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>
                Tất cả ({registrations.length})
              </SelectItem>
              <SelectItem value='pending'>
                Chờ duyệt (
                {registrations.filter(r => r.status === 'pending').length})
              </SelectItem>
              <SelectItem value='approved'>
                Đã duyệt (
                {registrations.filter(r => r.status === 'approved').length})
              </SelectItem>
              <SelectItem value='rejected'>
                Bị từ chối (
                {registrations.filter(r => r.status === 'rejected').length})
              </SelectItem>
              <SelectItem value='draft'>
                Bản nháp (
                {registrations.filter(r => r.status === 'draft').length})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Registration List */}
      <div className='grid gap-4'>
        {registrations.length === 0 ? (
          <Card>
            <CardContent className='pt-6 text-center'>
              <Building className='w-12 h-12 mx-auto mb-4 text-muted-foreground' />
              <p className='text-muted-foreground'>Không có đăng ký nào</p>
            </CardContent>
          </Card>
        ) : (
          registrations.map(registration => (
            <Card key={registration.id}>
              <CardContent className='pt-6'>
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Building className='w-5 h-5 text-primary' />
                      <h3 className='text-lg font-semibold'>
                        {registration.club_name}
                      </h3>
                      {getStatusBadge(registration.status)}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-sm'>
                          <MapPin className='w-4 h-4 text-muted-foreground' />
                          <span>
                            {registration.address || 'Chưa có địa chỉ'}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 text-sm'>
                          <Phone className='w-4 h-4 text-muted-foreground' />
                          <span>
                            {registration.phone || 'Chưa có số điện thoại'}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 text-sm'>
                          <Users className='w-4 h-4 text-muted-foreground' />
                          <span>{registration.table_count} bàn</span>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-sm'>
                          <Calendar className='w-4 h-4 text-muted-foreground' />
                          <span>
                            {new Date(
                              registration.created_at
                            ).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className='text-sm'>
                          <span className='font-medium'>Người đăng ký:</span>{' '}
                          {registration.profiles?.display_name ||
                            registration.profiles?.full_name ||
                            'Chưa có thông tin'}
                        </div>
                        <div className='text-sm'>
                          <span className='font-medium'>Giá cơ bản:</span>{' '}
                          {formatPrice(registration.basic_hourly_rate)}
                        </div>
                      </div>
                    </div>

                    <div className='flex gap-2'>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              setSelectedRegistration(registration)
                            }
                          >
                            <Eye className='w-4 h-4 mr-2' />
                            Xem chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
                          <DialogHeader>
                            <DialogTitle className='flex items-center gap-2'>
                              <Building className='w-5 h-5' />
                              {registration.club_name}
                              {getStatusBadge(registration.status)}
                            </DialogTitle>
                          </DialogHeader>

                          {selectedRegistration && (
                            <div className='space-y-6'>
                              {/* Basic Info */}
                              <div>
                                <h4 className='font-semibold mb-3'>
                                  Thông tin cơ bản
                                </h4>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                  <div>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Tên câu lạc bộ
                                    </label>
                                    <p className='text-sm'>
                                      {selectedRegistration.club_name}
                                    </p>
                                  </div>
                                  <div>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Số điện thoại
                                    </label>
                                    <p className='text-sm'>
                                      {selectedRegistration.phone}
                                    </p>
                                  </div>
                                  <div>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Email
                                    </label>
                                    <p className='text-sm'>
                                      {selectedRegistration.email || 'Chưa có'}
                                    </p>
                                  </div>
                                  <div>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Số bàn
                                    </label>
                                    <p className='text-sm'>
                                      {selectedRegistration.table_count}
                                    </p>
                                  </div>
                                  <div className='md:col-span-2'>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Địa chỉ
                                    </label>
                                    <p className='text-sm'>
                                      {selectedRegistration.address}
                                    </p>
                                  </div>
                                  {selectedRegistration.description && (
                                    <div className='md:col-span-2'>
                                      <label className='text-sm font-medium text-muted-foreground'>
                                        Mô tả
                                      </label>
                                      <p className='text-sm'>
                                        {selectedRegistration.description}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              {selectedRegistration.status === 'pending' && (
                                <div className='space-y-4 pt-4 border-t'>
                                  <div className='flex gap-4'>
                                    <Button
                                      onClick={() =>
                                        approveRegistration(
                                          selectedRegistration
                                        )
                                      }
                                      disabled={processing}
                                      className='bg-green-600 hover:bg-green-700'
                                    >
                                      <Check className='w-4 h-4 mr-2' />
                                      {processing
                                        ? 'Đang duyệt...'
                                        : 'Duyệt đăng ký'}
                                    </Button>
                                    <Button
                                      variant='destructive'
                                      onClick={() =>
                                        rejectRegistration(selectedRegistration)
                                      }
                                      disabled={
                                        processing || !rejectionReason.trim()
                                      }
                                    >
                                      <X className='w-4 h-4 mr-2' />
                                      {processing
                                        ? 'Đang từ chối...'
                                        : 'Từ chối'}
                                    </Button>
                                  </div>
                                  <div>
                                    <label className='block text-sm font-medium text-muted-foreground mb-2'>
                                      Lý do từ chối (bắt buộc nếu từ chối)
                                    </label>
                                    <Textarea
                                      value={rejectionReason}
                                      onChange={e =>
                                        setRejectionReason(e.target.value)
                                      }
                                      placeholder='Nhập lý do từ chối...'
                                      className='min-h-[80px]'
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Rejection Reason */}
                              {selectedRegistration.status === 'rejected' &&
                                selectedRegistration.rejection_reason && (
                                  <div className='p-4 bg-destructive/10 rounded-lg'>
                                    <h4 className='font-semibold text-destructive mb-2'>
                                      Lý do từ chối:
                                    </h4>
                                    <p className='text-destructive text-sm'>
                                      {selectedRegistration.rejection_reason}
                                    </p>
                                  </div>
                                )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {registration.status === 'pending' && (
                        <>
                          <Button
                            size='sm'
                            onClick={() => approveRegistration(registration)}
                            disabled={processing}
                            className='bg-green-600 hover:bg-green-700'
                          >
                            <Check className='w-4 h-4 mr-2' />
                            Duyệt
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size='sm' variant='destructive'>
                                <X className='w-4 h-4 mr-2' />
                                Từ chối
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Từ chối đăng ký</DialogTitle>
                              </DialogHeader>
                              <div className='space-y-4'>
                                <p>
                                  Bạn có chắc chắn muốn từ chối đăng ký câu lạc
                                  bộ "{registration.club_name}"?
                                </p>
                                <div>
                                  <label className='block text-sm font-medium text-muted-foreground mb-2'>
                                    Lý do từ chối *
                                  </label>
                                  <Textarea
                                    value={rejectionReason}
                                    onChange={e =>
                                      setRejectionReason(e.target.value)
                                    }
                                    placeholder='Nhập lý do từ chối...'
                                    className='min-h-[80px]'
                                  />
                                </div>
                                <div className='flex gap-2 justify-end'>
                                  <Button
                                    variant='destructive'
                                    onClick={() =>
                                      rejectRegistration(registration)
                                    }
                                    disabled={
                                      processing || !rejectionReason.trim()
                                    }
                                  >
                                    {processing ? 'Đang từ chối...' : 'Từ chối'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminClubRegistrations;
