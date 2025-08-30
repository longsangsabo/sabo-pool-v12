import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClubOwnership } from '@/hooks/useClubOwnership';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Building,
  Phone,
  MapPin,
  Clock,
  Users,
  Save,
  Loader2,
} from 'lucide-react';

interface ClubProfile {
  id: string;
  club_name: string;
  address: string;
  phone: string;
  operating_hours: any;
  number_of_tables: number;
  verification_status: string;
  verified_at: string | undefined;
  created_at: string;
  updated_at: string;
}

const ClubProfileForm = () => {
  const { user } = useAuth();
  const { clubProfile: clubData, loading: clubLoading } = useClubOwnership();
  const [clubProfile, setClubProfile] = useState<ClubProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    club_name: '',
    address: '',
    phone: '',
    number_of_tables: 1,
    opening_time: '',
    closing_time: '',
    notes: '',
  });

  useEffect(() => {
    if (clubData) {
      // Convert club_profiles data to local format
      const clubProfileData = {
        id: clubData.id,
        club_name: clubData.club_name || clubData.name || '',
        address: clubData.address || '',
        phone: clubData.phone || clubData.contact_info || '',
        operating_hours: clubData.operating_hours || {},
        number_of_tables: clubData.number_of_tables || clubData.table_count || 1,
        verification_status: clubData.verification_status || 'pending',
        verified_at: clubData.verified_at,
        created_at: clubData.created_at,
        updated_at: clubData.updated_at,
      };
      
      setClubProfile(clubProfileData);
      setFormData({
        club_name: clubData.club_name || clubData.name || '',
        address: clubData.address || '',
        phone: clubData.phone || clubData.contact_info || '',
        number_of_tables: clubData.number_of_tables || clubData.table_count || 1,
        opening_time: '',
        closing_time: '',
        notes: clubData.description || '',
      });
    }
    setLoading(clubLoading);
  }, [clubData, clubLoading]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'number_of_tables' ? parseInt(value) || 1 : value,
    }));
  };

  const handleSave = async () => {
    if (!clubProfile || !clubData) return;

    setSaving(true);
    try {
      // Try updating with both possible column names
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      // Try club_name first, fallback to name
      if ('club_name' in clubData) {
        updateData.club_name = formData.club_name;
        updateData.address = formData.address;
        updateData.phone = formData.phone;
        updateData.number_of_tables = formData.number_of_tables;
      } else {
        updateData.name = formData.club_name;
        updateData.address = formData.address;
        updateData.contact_info = formData.phone;
        updateData.table_count = formData.number_of_tables;
        updateData.description = formData.notes;
      }

      const { error } = await supabase
        .from('club_profiles')
        .update(updateData)
        .eq('id', clubData.id);

      if (error) throw error;

      toast.success('Cập nhật thông tin câu lạc bộ thành công!');
      
      // Update local state
      setClubProfile(prev => prev ? {
        ...prev,
        club_name: formData.club_name,
        address: formData.address,
        phone: formData.phone,
        number_of_tables: formData.number_of_tables,
      } : null);
      
    } catch (error) {
      console.error('Error updating club profile:', error);
      toast.error('Không thể cập nhật thông tin câu lạc bộ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải thông tin câu lạc bộ...</span>
      </div>
    );
  }

  if (!clubProfile) {
    return (
      <Card>
        <CardContent className="card-spacing">
          <div className="text-center py-8">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-body-large font-medium mb-2">
              Bạn chưa có thông tin câu lạc bộ
            </p>
            <p className="text-muted-foreground">
              Vui lòng liên hệ admin để được cấp quyền quản lý câu lạc bộ
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-success-500">Đã duyệt</Badge>;
      case 'pending':
        return <Badge variant="secondary">Chờ duyệt</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Bị từ chối</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Thông tin câu lạc bộ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-small text-muted-foreground">Trạng thái duyệt</p>
              {getStatusBadge(clubProfile.verification_status)}
            </div>
            {clubProfile.verified_at && (
              <div className="text-right">
                <p className="text-body-small text-muted-foreground">Ngày duyệt</p>
                <p className="text-body-small">
                  {new Date(clubProfile.verified_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="club_name" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Tên câu lạc bộ
              </Label>
              <Input
                id="club_name"
                name="club_name"
                value={formData.club_name}
                onChange={handleInputChange}
                placeholder="Nhập tên câu lạc bộ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Số điện thoại
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Địa chỉ
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ câu lạc bộ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number_of_tables" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Số bàn bi-a
              </Label>
              <Input
                id="number_of_tables"
                name="number_of_tables"
                type="number"
                min="1"
                value={formData.number_of_tables}
                onChange={handleInputChange}
                placeholder="Số bàn"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Giờ hoạt động
              </Label>
              <div className="flex gap-2">
                <Input
                  name="opening_time"
                  type="time"
                  value={formData.opening_time}
                  onChange={handleInputChange}
                  placeholder="Giờ mở"
                />
                <span className="self-center">-</span>
                <Input
                  name="closing_time"
                  type="time"
                  value={formData.closing_time}
                  onChange={handleInputChange}
                  placeholder="Giờ đóng"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Thông tin bổ sung về câu lạc bộ"
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubProfileForm;
