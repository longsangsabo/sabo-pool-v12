// BACKUP FILE - 3 tabs đã được xóa từ TournamentBracketFlow.tsx
// Date: August 14, 2025
// Tabs: Tự động hóa, Bảng đấu, Kết quả

// =============================================================
// TAB TRIGGERS (TRONG TabsList)
// =============================================================
/*
<TabsTrigger value='automation'>Automation</TabsTrigger>
<TabsTrigger value='bracket'>Bảng đấu</TabsTrigger>
<TabsTrigger value='results'>Kết quả</TabsTrigger>
*/

// =============================================================
// TAB CONTENTS
// =============================================================

// 1. TAB TỰ ĐỘNG HÓA (automation)
/*
<TabsContent value='automation'>
  <div className='space-y-6'>
    <TournamentAutomationStatus
      tournamentId={tournamentId}
      tournament={tournament}
    />

    {canManage && (
      <TournamentAutomationTest
        tournamentId={tournamentId}
        tournament={tournament}
      />
    )}
  </div>
</TabsContent>
*/

// 2. TAB BẢNG ĐẤU (bracket)
/*
<TabsContent value='bracket'>
  <TournamentBracket tournamentId={tournamentId} />
</TabsContent>
*/

// 3. TAB KẾT QUẢ (results)
/*
<TabsContent value='results'>
  <TournamentResults tournamentId={tournamentId} />
</TabsContent>
*/

// =============================================================
// IMPORTS CẦN THIẾT CHO CÁC TAB ĐÃ XÓA
// =============================================================
/*
import { TournamentAutomationStatus } from '@/components/tournament/TournamentAutomationStatus';
import { TournamentAutomationTest } from '@/components/tournament/TournamentAutomationTest';
import { TournamentBracket } from '@/components/tournament/TournamentBracket';
import { TournamentResults } from '@/components/tournament/TournamentResults';
*/

// =============================================================
// HƯỚNG DẪN KHÔI PHỤC
// =============================================================
/*
Để khôi phục các tabs này:

1. Thêm lại imports vào đầu file TournamentBracketFlow.tsx
2. Thêm lại TabsTrigger vào TabsList (thay đổi grid-cols từ 3 thành 6)
3. Thêm lại TabsContent vào cuối Tabs component
4. Kiểm tra logic activeTab nếu cần

Lưu ý: Có thể cần cập nhật grid-cols của TabsList tùy vào số lượng tabs
*/

export const BACKUP_TABS_INFO = {
  removedDate: "2025-08-14",
  tabsRemoved: ["automation", "bracket", "results"],
  reason: "User requested to reduce tabs complexity",
  components: [
    "TournamentAutomationStatus",
    "TournamentAutomationTest", 
    "TournamentBracket",
    "TournamentResults"
  ]
};
