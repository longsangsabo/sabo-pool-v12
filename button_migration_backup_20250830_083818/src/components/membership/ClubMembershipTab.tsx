import React from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClubRegistration {
  id: string;
  user_id?: string;
  club_name: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  opening_time: string;
  closing_time: string;
  table_count: number;
  table_types: string[];
  basic_price: number;
  normal_hour_price?: number;
  peak_hour_price?: number;
  weekend_price?: number;
  vip_table_price?: number;
  amenities?: any;
  photos?: string[];
  facebook_url?: string;
  google_maps_url?: string;
  business_license_url?: string;
  manager_name?: string;
  manager_phone?: string;
  email?: string;
  status: string;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
  approved_at?: string;
  approved_by?: string;
}

interface ClubMembershipTabProps {
  clubRegistration: ClubRegistration | null;
  onUpgrade: (planType: string, planPrice: number) => void;
  onVerification: () => void;
}

export const ClubMembershipTab: React.FC<ClubMembershipTabProps> = ({
  clubRegistration,
  onUpgrade,
  onVerification,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-800';
      case 'pending':
        return 'bg-warning-100 text-warning-800';
      case 'rejected':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã xác minh';
      case 'pending':
        return 'Chờ xác minh';
      case 'rejected':
        return 'Bị từ chối';
      default:
        return 'Chưa đăng ký';
    }
  };

  return (
    <div className='space-y-8'>
      {/* Club Verification Status */}
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <h2 className='text-xl font-semibold text-neutral-900 mb-4'>
          Trạng thái xác minh CLB
        </h2>

        {clubRegistration ? (
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-medium text-neutral-900'>
                  {clubRegistration.club_name}
                </h3>
                <p className='text-sm text-neutral-600'>
                  {clubRegistration.address}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(clubRegistration.status)}`}
              >
                {getStatusText(clubRegistration.status)}
              </span>
            </div>

            {clubRegistration.status === 'rejected' &&
              clubRegistration.rejection_reason && (
                <div className='p-3 bg-error-50 rounded-md'>
                  <p className='text-sm text-error-800'>
                    <strong>Lý do từ chối:</strong>{' '}
                    {clubRegistration.rejection_reason}
                  </p>
                </div>
              )}

            {clubRegistration.status !== 'approved' && (
              <Button onClick={onVerification}>
                {clubRegistration.status === 'rejected'
                  ? 'Đăng ký lại'
                  : 'Cập nhật thông tin'}
              </Button>
            )}
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center'>
                <AlertCircle className='w-5 h-5 text-warning-600' />
              </div>
              <div>
                <p className='font-medium text-neutral-900'>Chưa xác minh</p>
                <p className='text-sm text-neutral-600'>
                  Đăng ký xác minh để trở thành CLB chính thức
                </p>
              </div>
            </div>
            <Button onClick={onVerification}>Đăng ký xác minh CLB</Button>
          </div>
        )}
      </div>

      {/* Club Plans */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Basic Club Plan */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <div className='text-center mb-6'>
            <h3 className='text-xl font-semibold text-neutral-900'>CLB Cơ bản</h3>
            <div className='mt-4'>
              <span className='text-3xl font-bold text-neutral-900'>500,000</span>
              <span className='text-neutral-600'> VNĐ/tháng</span>
            </div>
          </div>

          <ul className='space-y-3 mb-6'>
            <li className='flex items-center'>
              <Check className='w-4 h-4 text-green-500 mr-3' />
              <span className='text-sm text-neutral-600'>
                Trang CLB chính thức
              </span>
            </li>
            <li className='flex items-center'>
              <Check className='w-4 h-4 text-green-500 mr-3' />
              <span className='text-sm text-neutral-600'>Quản lý thành viên</span>
            </li>
            <li className='flex items-center'>
              <Check className='w-4 h-4 text-green-500 mr-3' />
              <span className='text-sm text-neutral-600'>Tổ chức giải đấu</span>
            </li>
            <li className='flex items-center'>
              <Check className='w-4 h-4 text-green-500 mr-3' />
              <span className='text-sm text-neutral-600'>Thống kê cơ bản</span>
            </li>
            <li className='flex items-center'>
              <X className='w-4 h-4 text-red-500 mr-3' />
              <span className='text-sm text-gray-400'>Hệ thống đặt bàn</span>
            </li>
          </ul>

          <Button
            onClick={() => onUpgrade('club_basic', 500000)}
            disabled={
              !clubRegistration || clubRegistration.status !== 'approved'
            }
            className='w-full'
          >
            {!clubRegistration || clubRegistration.status !== 'approved'
              ? 'Cần xác minh CLB'
              : 'Chọn gói CLB Cơ bản'}
          </Button>
        </div>

        {/* Premium Club Plan */}
        <div className='bg-white rounded-lg shadow-sm border-2 border-purple-500 p-6 relative'>
          <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
            <span className='bg-info-500 text-white px-3 py-1 rounded-full text-xs font-medium'>
              Khuyến nghị
            </span>
          </div>

          <div className='text-center mb-6'>
            <h3 className='text-xl font-semibold text-neutral-900'>CLB Premium</h3>
            <div className='mt-4'>
              <span className='text-3xl font-bold text-neutral-900'>
                1,200,000
              </span>
              <span className='text-neutral-600'> VNĐ/tháng</span>
            </div>
          </div>

          <ul className='space-y-3 mb-6'>
            <li className='flex items-center'>
              <Check className='w-4 h-4 text-green-500 mr-3' />
              <span className='text-sm text-neutral-600'>
                Tất cả tính năng Cơ bản
              </span>
            </li>
            <li className='flex items-center'>
              <Check className='w-4 h-4 text-green-500 mr-3' />
              <span className='text-sm text-neutral-600'>Hệ thống đặt bàn</span>
            </li>
            <li className='flex items-center'>
              <Check className='w-4 h-4 text-green-500 mr-3' />
              <span className='text-sm text-neutral-600'>Thống kê nâng cao</span>
            </li>
            <li className='flex items-center'>
              <Check className='w-4 h-4 text-green-500 mr-3' />
              <span className='text-sm text-neutral-600'>Marketing tools</span>
            </li>
            <li className='flex items-center'>
              <Check className='w-4 h-4 text-green-500 mr-3' />
              <span className='text-sm text-neutral-600'>Hỗ trợ ưu tiên</span>
            </li>
          </ul>

          <Button
            onClick={() => onUpgrade('club_premium', 1200000)}
            disabled={
              !clubRegistration || clubRegistration.status !== 'approved'
            }
            className='w-full bg-purple-600 hover:bg-purple-700'
          >
            {!clubRegistration || clubRegistration.status !== 'approved'
              ? 'Cần xác minh CLB'
              : 'Chọn gói CLB Premium'}
          </Button>
        </div>
      </div>

      {/* Additional Info */}
      <div className='bg-primary-50 border border-primary-200 rounded-lg p-6'>
        <div className='flex items-start space-x-3'>
          <Info className='w-5 h-5 text-primary-600 mt-0.5' />
          <div>
            <h3 className='font-medium text-blue-900 mb-2'>Lưu ý quan trọng</h3>
            <ul className='text-sm text-primary-800 space-y-1'>
              <li>
                • CLB cần được xác minh trước khi có thể đăng ký gói trả phí
              </li>
              <li>• Quá trình xác minh thường mất 1-3 ngày làm việc</li>
              <li>• Sau khi được xác minh, bạn sẽ nhận được email thông báo</li>
              <li>• Gói CLB bao gồm tất cả tính năng quản lý chuyên nghiệp</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
