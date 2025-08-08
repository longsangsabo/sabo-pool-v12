import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Building,
  Eye,
  MapPin,
  Phone,
  Users,
  Calendar,
  Mail,
  Clock,
  DollarSign,
} from 'lucide-react';

interface ApprovedClub {
  id: string;
  user_id: string;
  club_name: string;
  address: string;
  phone: string;
  description?: string;
  verification_status: string;
  hourly_rate: number;
  available_tables: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string;
    full_name: string;
    phone?: string;
    role?: string;
  };
}

const AdminApprovedClubs = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<ApprovedClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<ApprovedClub | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApprovedClubs();

    // Set up real-time subscription for club profiles
    const channel = supabase
      .channel('admin-approved-clubs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'club_profiles',
        },
        payload => {
          console.log('Club profile updated:', payload);
          fetchApprovedClubs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchApprovedClubs = async () => {
    setLoading(true);
    try {
      const { data: clubs, error } = await supabase
        .from('club_profiles')
        .select(
          `
          *,
          profiles!club_profiles_user_id_fkey (
            display_name,
            full_name,
            phone,
            role
          )
        `
        )
        .eq('verification_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching approved clubs:', error);
        toast.error('Không thể tải danh sách câu lạc bộ đã duyệt');
        return;
      }

      setClubs(clubs || []);
    } catch (error: any) {
      console.error('Error fetching approved clubs:', error);
      toast.error('Lỗi khi tải danh sách câu lạc bộ');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Chưa đặt';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getOwnerRoleBadge = (role?: string) => {
    switch (role) {
      case 'club_owner':
        return <Badge variant='secondary'>Chủ CLB</Badge>;
      case 'both':
        return <Badge variant='secondary'>Player & Chủ CLB</Badge>;
      case 'admin':
        return <Badge variant='default'>Admin & Chủ CLB</Badge>;
      default:
        return <Badge variant='outline'>Chưa cập nhật role</Badge>;
    }
  };

  const filteredClubs = clubs.filter(
    club =>
      club.club_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.profiles?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      club.profiles?.display_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

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
          <h1 className='text-2xl font-bold'>Câu lạc bộ đã duyệt</h1>
          <p className='text-muted-foreground'>
            Quản lý các câu lạc bộ đã được duyệt ({clubs.length} câu lạc bộ)
          </p>
        </div>
        <div className='flex gap-3 items-center'>
          <Input
            placeholder='Tìm kiếm câu lạc bộ...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-64'
          />
          <Button
            onClick={fetchApprovedClubs}
            variant='outline'
            disabled={loading}
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Clubs List */}
      <div className='grid gap-4'>
        {filteredClubs.length === 0 ? (
          <Card>
            <CardContent className='pt-6 text-center'>
              <Building className='w-12 h-12 mx-auto mb-4 text-muted-foreground' />
              <p className='text-muted-foreground'>
                {searchTerm
                  ? 'Không tìm thấy câu lạc bộ nào'
                  : 'Chưa có câu lạc bộ nào được duyệt'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClubs.map(club => (
            <Card key={club.id}>
              <CardContent className='pt-6'>
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Building className='w-5 h-5 text-primary' />
                      <h3 className='text-lg font-semibold'>
                        {club.club_name}
                      </h3>
                      <Badge className='bg-green-100 text-green-800'>
                        Đã duyệt
                      </Badge>
                      {getOwnerRoleBadge(club.profiles?.role)}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-sm'>
                          <MapPin className='w-4 h-4 text-muted-foreground' />
                          <span>{club.address}</span>
                        </div>
                        <div className='flex items-center gap-2 text-sm'>
                          <Phone className='w-4 h-4 text-muted-foreground' />
                          <span>{club.phone}</span>
                        </div>
                        <div className='flex items-center gap-2 text-sm'>
                          <Users className='w-4 h-4 text-muted-foreground' />
                          <span>{club.available_tables} bàn</span>
                        </div>
                        <div className='flex items-center gap-2 text-sm'>
                          <DollarSign className='w-4 h-4 text-muted-foreground' />
                          <span>{formatPrice(club.hourly_rate)}/giờ</span>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-sm'>
                          <Calendar className='w-4 h-4 text-muted-foreground' />
                          <span>
                            Tạo:{' '}
                            {new Date(club.created_at).toLocaleDateString(
                              'vi-VN'
                            )}
                          </span>
                        </div>
                        <div className='text-sm'>
                          <span className='font-medium'>Chủ sở hữu:</span>{' '}
                          {club.profiles?.display_name ||
                            club.profiles?.full_name ||
                            'Chưa có thông tin'}
                        </div>
                        {club.profiles?.phone && (
                          <div className='text-sm'>
                            <span className='font-medium'>SĐT chủ:</span>{' '}
                            {club.profiles.phone}
                          </div>
                        )}
                        {club.description && (
                          <div className='text-sm'>
                            <span className='font-medium'>Mô tả:</span>{' '}
                            {club.description.length > 50
                              ? club.description.substring(0, 50) + '...'
                              : club.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='flex gap-2'>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setSelectedClub(club)}
                          >
                            <Eye className='w-4 h-4 mr-2' />
                            Xem chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
                          <DialogHeader>
                            <DialogTitle className='flex items-center gap-2'>
                              <Building className='w-5 h-5' />
                              {club.club_name}
                              <Badge className='bg-green-100 text-green-800'>
                                Đã duyệt
                              </Badge>
                            </DialogTitle>
                          </DialogHeader>

                          {selectedClub && (
                            <div className='space-y-6'>
                              {/* Club Info */}
                              <div>
                                <h4 className='font-semibold mb-3'>
                                  Thông tin câu lạc bộ
                                </h4>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                  <div>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Tên câu lạc bộ
                                    </label>
                                    <p className='text-sm'>
                                      {selectedClub.club_name}
                                    </p>
                                  </div>
                                  <div>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Số điện thoại
                                    </label>
                                    <p className='text-sm'>
                                      {selectedClub.phone}
                                    </p>
                                  </div>
                                  <div>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Số bàn có sẵn
                                    </label>
                                    <p className='text-sm'>
                                      {selectedClub.available_tables}
                                    </p>
                                  </div>
                                  <div>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Giá theo giờ
                                    </label>
                                    <p className='text-sm'>
                                      {formatPrice(selectedClub.hourly_rate)}
                                    </p>
                                  </div>
                                  <div className='md:col-span-2'>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Địa chỉ
                                    </label>
                                    <p className='text-sm'>
                                      {selectedClub.address}
                                    </p>
                                  </div>
                                  {selectedClub.description && (
                                    <div className='md:col-span-2'>
                                      <label className='text-sm font-medium text-muted-foreground'>
                                        Mô tả
                                      </label>
                                      <p className='text-sm'>
                                        {selectedClub.description}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Owner Info */}
                              <div>
                                <h4 className='font-semibold mb-3'>
                                  Thông tin chủ sở hữu
                                </h4>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                  <div>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Tên hiển thị
                                    </label>
                                    <p className='text-sm'>
                                      {selectedClub.profiles?.display_name ||
                                        'Chưa có'}
                                    </p>
                                  </div>
                                  <div>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Họ tên đầy đủ
                                    </label>
                                    <p className='text-sm'>
                                      {selectedClub.profiles?.full_name ||
                                        'Chưa có'}
                                    </p>
                                  </div>
                                  <div>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Số điện thoại cá nhân
                                    </label>
                                    <p className='text-sm'>
                                      {selectedClub.profiles?.phone ||
                                        'Chưa có'}
                                    </p>
                                  </div>
                                  <div>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Vai trò hệ thống
                                    </label>
                                    <div className='mt-1'>
                                      {getOwnerRoleBadge(
                                        selectedClub.profiles?.role
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Timestamps */}
                              <div>
                                <h4 className='font-semibold mb-3'>
                                  Thông tin hệ thống
                                </h4>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                  <div>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Ngày tạo
                                    </label>
                                    <p className='text-sm'>
                                      {new Date(
                                        selectedClub.created_at
                                      ).toLocaleString('vi-VN')}
                                    </p>
                                  </div>
                                  <div>
                                    <label className='text-sm font-medium text-muted-foreground'>
                                      Cập nhật lần cuối
                                    </label>
                                    <p className='text-sm'>
                                      {new Date(
                                        selectedClub.updated_at
                                      ).toLocaleString('vi-VN')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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

export default AdminApprovedClubs;
