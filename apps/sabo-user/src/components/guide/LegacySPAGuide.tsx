import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
 Info, 
 User, 
 CheckCircle, 
 Clock, 
 AlertTriangle,
 Facebook,
 Trophy,
 ArrowRight
} from 'lucide-react';

export const LegacySPAGuide: React.FC = () => {
 const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');

 const UserGuide = () => (
  <div className='space-y-6'>
   <Alert>
    <Info className='h-4 w-4' />
    <AlertDescription>
     <strong>Quan trọng:</strong> Chỉ 45 người chơi từ BXH SPA cũ có thể claim points. 
     Mỗi người chỉ được claim 1 lần duy nhất!
    </AlertDescription>
   </Alert>

   <div className='grid md:grid-cols-2 gap-6'>
    <Card>
     <CardHeader>
      <CardTitle className='flex items-center gap-2'>
       <User className='w-5 h-5' />
       Bước 1: Tạo Tài Khoản
      </CardTitle>
     </CardHeader>
     <CardContent className='space-y-3'>
      <div className='flex items-center gap-2'>
       <CheckCircle className='w-4 h-4 text-green-500' />
       <span>Đăng ký tài khoản mới trên SABO Arena</span>
      </div>
      <div className='flex items-center gap-2'>
       <CheckCircle className='w-4 h-4 text-green-500' />
       <span>Xác nhận email (nếu cần)</span>
      </div>
      <div className='flex items-center gap-2'>
       <CheckCircle className='w-4 h-4 text-green-500' />
       <span>Hoàn tất thông tin profile</span>
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardHeader>
      <CardTitle className='flex items-center gap-2'>
       <Trophy className='w-5 h-5' />
       Bước 2: Kiểm Tra BXH
      </CardTitle>
     </CardHeader>
     <CardContent className='space-y-3'>
      <div className='flex items-center gap-2'>
       <ArrowRight className='w-4 h-4 text-blue-500' />
       <span>Vào trang <code>/leaderboard</code></span>
      </div>
      <div className='flex items-center gap-2'>
       <ArrowRight className='w-4 h-4 text-blue-500' />
       <span>Chọn tab "SPA Leaderboard"</span>
      </div>
      <div className='flex items-center gap-2'>
       <ArrowRight className='w-4 h-4 text-blue-500' />
       <span>Tìm tên của bạn trong 45 players</span>
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardHeader>
      <CardTitle className='flex items-center gap-2'>
       <Facebook className='w-5 h-5' />
       Bước 3: Claim SPA Points
      </CardTitle>
     </CardHeader>
     <CardContent className='space-y-3'>
      <div className='flex items-center gap-2'>
       <ArrowRight className='w-4 h-4 text-purple-500' />
       <span>Vào Profile → Tab "Legacy SPA Claim"</span>
      </div>
      <div className='flex items-center gap-2'>
       <ArrowRight className='w-4 h-4 text-purple-500' />
       <span>Nhập tên chính xác (VD: "ĐĂNG RT")</span>
      </div>
      <div className='flex items-center gap-2'>
       <ArrowRight className='w-4 h-4 text-purple-500' />
       <span>Nhập Facebook URL của bạn</span>
      </div>
      <div className='flex items-center gap-2'>
       <ArrowRight className='w-4 h-4 text-purple-500' />
       <span>Submit và đợi admin duyệt</span>
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardHeader>
      <CardTitle className='flex items-center gap-2'>
       <Clock className='w-5 h-5' />
       Bước 4: Theo Dõi
      </CardTitle>
     </CardHeader>
     <CardContent className='space-y-3'>
      <div className='flex items-center gap-2'>
       <Badge variant='outline' className='bg-warning-50'>Pending</Badge>
       <span>Đợi admin kiểm tra (24-48h)</span>
      </div>
      <div className='flex items-center gap-2'>
       <Badge variant='outline' className='bg-success-50'>Approved</Badge>
       <span>SPA points được cộng vào tài khoản</span>
      </div>
      <div className='flex items-center gap-2'>
       <Badge variant='outline' className='bg-error-50'>Rejected</Badge>
       <span>Có thể claim lại với thông tin đúng</span>
      </div>
     </CardContent>
    </Card>
   </div>

   <Card className='bg-primary-50 border-primary-200'>
    <CardHeader>
     <CardTitle className='text-primary-800'>Top Legacy Players</CardTitle>
    </CardHeader>
    <CardContent>
     <div className='grid grid-cols-2 md:grid-cols-3 gap-2 text-sm'>
      <div>1. ĐĂNG RT - <strong>3,600 SPA</strong></div>
      <div>2. KHÁNH HOÀNG - <strong>3,500 SPA</strong></div>
      <div>3. THÙY LINH - <strong>3,450 SPA</strong></div>
      <div>4. BEN HUYNH - <strong>2,300 SPA</strong></div>
      <div>5. TRƯỜNG PHÚC - <strong>2,300 SPA</strong></div>
      <div>... và 40 players khác</div>
     </div>
    </CardContent>
   </Card>
  </div>
 );

 const AdminGuide = () => (
  <div className='space-y-6'>
   <Alert>
    <AlertTriangle className='h-4 w-4' />
    <AlertDescription>
     <strong>Admin Note:</strong> Kiểm tra kỹ thông tin trước khi approve. 
     Không thể hoàn tác sau khi đã approve!
    </AlertDescription>
   </Alert>

   <div className='grid md:grid-cols-2 gap-6'>
    <Card>
     <CardHeader>
      <CardTitle>Admin Dashboard Access</CardTitle>
     </CardHeader>
     <CardContent className='space-y-3'>
      <div><strong>URL:</strong> <code>/admin</code></div>
      <div><strong>Tab:</strong> "Legacy SPA Management"</div>
      <div><strong>Quyền:</strong> Chỉ admin có thể truy cập</div>
     </CardContent>
    </Card>

    <Card>
     <CardHeader>
      <CardTitle>Approval Checklist</CardTitle>
     </CardHeader>
     <CardContent className='space-y-2'>
      <div className='flex items-center gap-2'>
       <CheckCircle className='w-4 h-4 text-green-500' />
       <span>Tên có trong legacy database?</span>
      </div>
      <div className='flex items-center gap-2'>
       <CheckCircle className='w-4 h-4 text-green-500' />
       <span>Facebook URL hợp lệ?</span>
      </div>
      <div className='flex items-center gap-2'>
       <CheckCircle className='w-4 h-4 text-green-500' />
       <span>Chưa bị claim bởi ai khác?</span>
      </div>
      <div className='flex items-center gap-2'>
       <CheckCircle className='w-4 h-4 text-green-500' />
       <span>User đã đăng ký tài khoản?</span>
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
     </CardHeader>
     <CardContent className='space-y-3'>
      <Button variant="default">
       ✅ Approve Claim
      </Button>
      <Button variant='destructive' className='w-full'>
       ❌ Reject Claim
      </Button>
      <Button variant='outline' className='w-full'>
       📊 View Reports
      </Button>
     </CardContent>
    </Card>

    <Card>
     <CardHeader>
      <CardTitle>Database Commands</CardTitle>
     </CardHeader>
     <CardContent className='space-y-2'>
      <div className='text-caption bg-neutral-100 p-2 rounded'>
       <code>SELECT COUNT(*) FROM legacy_spa_points;</code>
      </div>
      <div className='text-caption text-neutral-600'>Check total legacy players (should be 45)</div>
      
      <div className='text-caption bg-neutral-100 p-2 rounded mt-2'>
       <code>SELECT * FROM legacy_spa_points WHERE claimed = false;</code>
      </div>
      <div className='text-caption text-neutral-600'>See unclaimed legacy players</div>
     </CardContent>
    </Card>
   </div>

   <Card className='bg-error-50 border-error-200'>
    <CardHeader>
     <CardTitle className='text-error-800'>⚠️ Important Notes</CardTitle>
    </CardHeader>
    <CardContent className='text-error-700'>
     <ul className='space-y-1 text-sm'>
      <li>• <strong>Không thể hoàn tác</strong> sau khi approve</li>
      <li>• <strong>Backup dữ liệu</strong> thường xuyên</li>
      <li>• <strong>Kiểm tra Facebook</strong> profile có thể truy cập</li>
      <li>• <strong>Ghi log</strong> mọi thao tác quan trọng</li>
     </ul>
    </CardContent>
   </Card>
  </div>
 );

 return (
  <div className='max-w-6xl mx-auto p-6'>
   <div className='mb-6'>
    <h1 className='text-3xl font-bold mb-2'>🏆 Hướng Dẫn Legacy SPA System</h1>
    <p className='text-neutral-600'>
     Claim lại SPA points từ BXH cũ cho 45 legacy players
    </p>
   </div>

   <div className='flex space-x-1 mb-6'>
    <Button
     variant={activeTab === 'user' ? 'default' : 'outline'}
     onClick={() => setActiveTab('user')}
     className='flex items-center gap-2'
    >
     <User className='w-4 h-4' />
     Hướng Dẫn User
    </Button>
    <Button
     variant={activeTab === 'admin' ? 'default' : 'outline'}
     onClick={() => setActiveTab('admin')}
     className='flex items-center gap-2'
    >
     <Info className='w-4 h-4' />
     Hướng Dẫn Admin
    </Button>
   </div>

   {activeTab === 'user' ? <UserGuide /> : <AdminGuide />}

   <div className='mt-8 text-center text-body-small text-neutral-500'>
    💡 Để biết thêm chi tiết, xem file <code>LEGACY_SPA_USER_GUIDE.md</code> và <code>ADMIN_QUICK_GUIDE.md</code>
   </div>
  </div>
 );
};

export default LegacySPAGuide;
