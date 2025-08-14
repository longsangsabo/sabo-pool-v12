// BACKUP FILE - ClubTournamentManagement.tsx 
// Chứa 3 buttons và TabsContent đã bị xóa: Tự động hóa, Bảng đấu, Kết quả
// Ngày tạo backup: 14/08/2025

// ===== BUTTONS ĐÃ XÓA TỪ ClubTournamentManagement.tsx =====

{/* Secondary action buttons - improved mobile layout */}
<div className='flex flex-wrap gap-2'>
  <Button
    variant='outline'
    size='sm'
    onClick={() => setManagementActiveTab('automation')}
    className={`text-sm h-8 px-3 ${managementActiveTab === 'automation' ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
  >
    <Zap className='w-4 h-4 mr-1.5' />
    Tự động hóa
  </Button>
  <Button
    variant='outline'
    size='sm'
    onClick={() => setManagementActiveTab('bracket-view')}
    className={`text-sm h-8 px-3 ${managementActiveTab === 'bracket-view' ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
  >
    <Workflow className='w-4 h-4 mr-1.5' />
    Bảng đấu
  </Button>
  <Button
    variant='outline'
    size='sm'
    onClick={() => setManagementActiveTab('results')}
    className={`text-sm h-8 px-3 ${managementActiveTab === 'results' ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
  >
    <Award className='w-4 h-4 mr-1.5' />
    Kết quả
  </Button>
</div>

// ===== TABSCONTENT ĐÃ XÓA =====

<TabsContent value='automation'>
  <div className='space-y-6'>
    {/* Tournament Selector */}
    <TournamentSelector />

    {/* Tournament Control Panel */}
    {selectedTournamentId && (
      <TournamentControlPanel
        tournamentId={selectedTournamentId}
        isClubOwner={true}
      />
    )}

    {/* Tournament Match Manager */}
    {selectedTournamentId && (
      <TournamentMatchManager
        tournamentId={selectedTournamentId}
        isClubOwner={true}
      />
    )}

    {!selectedTournamentId && (
      <MobileCard
        title='Chọn giải đấu để quản lý'
        icon={Zap}
        iconColor='text-amber-500'
        variant='outlined'
        className='border-dashed'
      >
        <div className='flex flex-col items-center justify-center py-6 text-center'>
          <p className='text-sm text-muted-foreground max-w-sm'>
            Vui lòng chọn một giải đấu từ danh sách để sử dụng các tính
            năng tự động hóa
          </p>
        </div>
      </MobileCard>
    )}
  </div>
</TabsContent>

<TabsContent value='bracket-view'>
  <div className='space-y-6'>
    {/* Tournament Selector */}
    <TournamentSelector />

    {/* Tournament Control Panel for selected tournament */}
    {selectedTournamentId && (
      <TournamentControlPanel
        tournamentId={selectedTournamentId}
        isClubOwner={true}
      />
    )}

    {/* Test Button for Development */}
    {process.env.NODE_ENV === 'development' && selectedTournamentId && (
      <Card className='border-dashed border-orange-200 bg-orange-50/50'>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold text-orange-800'>
                🧪 Development Test
              </h3>
              <p className='text-sm text-orange-600'>
                Test complete tournament flow: scores → advancement →
                completion
              </p>
            </div>
            <Button
              onClick={createTestTournamentFlow}
              variant='outline'
              className='border-orange-200 text-orange-700 hover:bg-orange-100'
            >
              🚀 Test Flow
            </Button>
          </div>
        </CardContent>
      </Card>
    )}

    {/* Auto Bracket Display */}
    {selectedTournamentId ? (
      <TournamentBracket
        tournamentId={selectedTournamentId}
        adminMode={true}
      />
    ) : (
      <MobileCard
        title='Chọn giải đấu để xem bảng đấu'
        icon={Workflow}
        iconColor='text-blue-500'
        variant='outlined'
        className='border-dashed'
      >
        <div className='flex flex-col items-center justify-center py-6 text-center'>
          <p className='text-sm text-muted-foreground max-w-sm'>
            Vui lòng chọn một giải đấu từ danh sách để xem và quản lý
            bảng đấu
          </p>
        </div>
      </MobileCard>
    )}
  </div>
</TabsContent>

<TabsContent value='results'>
  <div className='space-y-6'>
    {/* Tournament Selector */}
    <TournamentSelector />

    {/* Manual Results Generator for Completed Tournaments */}
    {selectedTournamentId &&
      selectedTournament?.status === 'completed' && (
        <ManualResultsGenerator
          tournamentId={selectedTournamentId}
          tournamentName={selectedTournament.name}
          onResultsGenerated={refreshAll}
        />
      )}

    {/* Tournament Results Display */}
    <TournamentResults tournamentId={selectedTournamentId} />
  </div>
</TabsContent>

// ===== IMPORTS CÓ THỂ CẦN XÓA =====
// import { Zap, Workflow, Award } from 'lucide-react'; (nếu không dùng ở chỗ khác)

// ===== HƯỚNG DẪN KHÔI PHỤC =====
// 1. Copy đoạn code trên
// 2. Paste buttons vào vị trí dòng ~105-130 trong ClubTournamentManagement.tsx
// 3. Paste TabsContent vào cuối trước tag đóng </Tabs>
// 4. Thêm lại imports nếu cần: Zap, Workflow, Award từ lucide-react
// 5. Đảm bảo managementActiveTab state vẫn hoạt động với các giá trị: 'automation', 'bracket-view', 'results'
