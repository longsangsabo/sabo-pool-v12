// BACKUP FILE - TournamentBracketFlow.tsx TabsList
// Chứa code TabsList gốc đã bị sửa
// Ngày backup: 14/08/2025

// ===== TABSLIST GỐC ĐÃ ĐƯỢC SỬA =====

<TabsList className={`grid w-full ${canManage ? 'grid-cols-6' : 'grid-cols-1'}`}>
  <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
  {canManage && <TabsTrigger value='generator'>Tạo bảng</TabsTrigger>}
  {canManage && <TabsTrigger value='management'>Quản lý</TabsTrigger>}
  <TabsTrigger value='automation'>Automation</TabsTrigger>
  <TabsTrigger value='bracket'>Bảng đấu</TabsTrigger>
  <TabsTrigger value='results'>Kết quả</TabsTrigger>
</TabsList>

// ===== TABSCONTENT CẦN XÓA =====
// - TabsContent value='overview' 
// - TabsContent value='generator'
// - TabsContent value='automation'

// ===== HƯỚNG DẪN KHÔI PHỤC =====
// 1. Copy code TabsList trên vào dòng 224-231
// 2. Thêm lại các TabsContent đã xóa nếu cần
// 3. Cập nhật grid-cols từ 3 về 6
