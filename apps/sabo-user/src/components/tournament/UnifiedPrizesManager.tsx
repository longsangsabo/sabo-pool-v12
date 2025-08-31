/**
 * Unified Prizes Manager Component
 * Tích hợp OptimizedRewardsSection và TournamentPrizesManager thành một component duy nhất
 * Clean, đơn giản, dễ maintain
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
 Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { 
 Trophy, Medal, Award, Crown, Star, Gift, Coins, Target, 
 Plus, Edit2, Save, X, Trash2, DollarSign, Info, RefreshCw, Zap 
} from 'lucide-react';
import { toast } from 'sonner';

// Simplified prize structure - không cần phức tạp
interface SimplePrize {
 id: string;
 position: number;
 name: string;
 cashAmount: number;
 eloPoints: number;
 spaPoints: number;
 items?: string[];
 theme?: string;
 description?: string;
 isVisible?: boolean;
}

interface UnifiedPrizesManagerProps {
 // Mode: 'create' cho preview, 'edit' cho database
 mode?: 'create' | 'edit';
 tournamentId?: string;
 initialPrizePool?: number;
 onPrizesChange?: (prizes: SimplePrize[]) => void;
 isEditable?: boolean;
}

// Templates đơn giản - bỏ qua tính toán phức tạp
const SIMPLE_TEMPLATES = {
 standard: {
  name: 'Tiêu chuẩn - 16 vị trí',
  description: 'Phân bổ chuẩn cho 16 vị trí',
  positions: [
   { position: 1, name: 'Vô địch', cashPercent: 40, elo: 100, spa: 1000, theme: 'gold' },
   { position: 2, name: 'Á quân', cashPercent: 24, elo: 75, spa: 800, theme: 'silver' },
   { position: 3, name: 'Hạng 3', cashPercent: 16, elo: 50, spa: 600, theme: 'bronze' },
   { position: 4, name: 'Hạng 4', cashPercent: 8, elo: 40, spa: 400, theme: 'blue' },
   // Còn lại sẽ được generate tự động
  ]
 },
 winner_takes_all: {
  name: 'Winner Takes All',
  description: '100% cho vô địch',
  positions: [
   { position: 1, name: 'Vô địch', cashPercent: 100, elo: 100, spa: 1000, theme: 'gold' },
   { position: 2, name: 'Á quân', cashPercent: 0, elo: 75, spa: 800, theme: 'silver' },
   { position: 3, name: 'Hạng 3', cashPercent: 0, elo: 50, spa: 600, theme: 'bronze' },
  ]
 },
 top_heavy: {
  name: 'Top Heavy',
  description: '60-30-10% cho top 3',
  positions: [
   { position: 1, name: 'Vô địch', cashPercent: 60, elo: 100, spa: 1000, theme: 'gold' },
   { position: 2, name: 'Á quân', cashPercent: 30, elo: 75, spa: 800, theme: 'silver' },
   { position: 3, name: 'Hạng 3', cashPercent: 10, elo: 50, spa: 600, theme: 'bronze' },
  ]
 }
};

const COLOR_THEMES = [
 { value: 'gold', label: '🥇 Vàng', className: 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300 text-yellow-900' },
 { value: 'silver', label: '🥈 Bạc', className: 'bg-gradient-to-r from-gray-100 to-gray-50 border-neutral-300 text-neutral-900' },
 { value: 'bronze', label: '🥉 Đồng', className: 'bg-gradient-to-r from-orange-100 to-orange-50 border-orange-300 text-orange-900' },
 { value: 'blue', label: '🔵 Xanh', className: 'bg-gradient-to-r from-blue-100 to-blue-50 border-primary-300 text-blue-900' },
 { value: 'green', label: '🟢 Lục', className: 'bg-gradient-to-r from-green-100 to-green-50 border-success-300 text-green-900' },
 { value: 'purple', label: '🟣 Tím', className: 'bg-gradient-to-r from-purple-100 to-purple-50 border-purple-300 text-purple-900' },
 { value: 'gray', label: '⚪ Xám', className: 'bg-gradient-to-r from-slate-100 to-slate-50 border-slate-300 text-slate-900' },
];

export const UnifiedPrizesManager: React.FC<UnifiedPrizesManagerProps> = ({
 mode = 'create',
 tournamentId,
 initialPrizePool = 0,
 onPrizesChange,
 isEditable = true,
}) => {
 const [prizes, setPrizes] = useState<SimplePrize[]>([]);
 const [editingPrize, setEditingPrize] = useState<SimplePrize | null>(null);
 const [loading, setLoading] = useState(false);
 const [totalPrizePool, setTotalPrizePool] = useState(0);
 const [showQuickAllocation, setShowQuickAllocation] = useState(false);
 const [isInitialized, setIsInitialized] = useState(false); // Thêm flag để track initialization
 const [lastCallbackTime, setLastCallbackTime] = useState(0); // Prevent rapid callbacks

 // Initialize với template mặc định - LUÔN LUÔN khởi tạo default prizes
 useEffect(() => {
  if (!isInitialized && prizes.length === 0) {
   loadDefaultTemplate();
   setIsInitialized(true); // Đánh dấu đã initialize
  }
 }, [isInitialized, prizes.length]); // BỎ điều kiện initialPrizePool > 0

 // Tính tổng khi prizes thay đổi - với throttling để tránh infinite loop
 useEffect(() => {
  if (prizes.length > 0) {
   const now = Date.now();
   // Throttle callbacks to prevent infinite loops (maximum 1 call per 100ms)
   if (now - lastCallbackTime > 100) {
    const total = prizes.reduce((sum, prize) => sum + prize.cashAmount, 0);
    setTotalPrizePool(total);
    onPrizesChange?.(prizes);
    setLastCallbackTime(now);
   }
  }
 }, [prizes, onPrizesChange, lastCallbackTime]);

 // Cập nhật cash amounts khi initialPrizePool thay đổi - với safeguards
 useEffect(() => {
  if (prizes.length > 0 && initialPrizePool !== totalPrizePool && initialPrizePool > 0) {
   // Chỉ update nếu sự khác biệt đáng kể (> 1% hoặc > 10000 VND)
   const diff = Math.abs(initialPrizePool - totalPrizePool);
   if (diff > Math.max(initialPrizePool * 0.01, 10000)) {
    updateCashAmounts(initialPrizePool);
   }
  }
 }, [initialPrizePool]);

 const updateCashAmounts = (newPrizePool: number) => {
  const template = SIMPLE_TEMPLATES.standard;
  const updatedPrizes = prizes.map(prize => {
   // Tìm percentage từ template
   let cashPercent = 0;
   const templatePos = template.positions.find(p => p.position === prize.position);
   if (templatePos) {
    cashPercent = templatePos.cashPercent;
   } else {
    // Cho positions 5-16
    if (prize.position <= 6) cashPercent = 4;
    else if (prize.position <= 8) cashPercent = 2;
    else if (prize.position <= 12) cashPercent = 1.125;
    else cashPercent = 0.5625;
   }
   
   return {
    ...prize,
    cashAmount: Math.floor((newPrizePool * cashPercent) / 100)
   };
  });
  
  setPrizes(updatedPrizes);
 };

 const loadDefaultTemplate = () => {
  const template = SIMPLE_TEMPLATES.standard;
  const prizePool = initialPrizePool || 0; // Dùng 0 nếu chưa có prize pool
  const generatedPrizes: SimplePrize[] = template.positions.map(pos => ({
   id: `prize-${pos.position}`,
   position: pos.position,
   name: pos.name,
   cashAmount: Math.floor((prizePool * pos.cashPercent) / 100), // Sẽ = 0 nếu prizePool = 0
   eloPoints: pos.elo,
   spaPoints: pos.spa,
   theme: pos.theme,
   isVisible: true,
   items: pos.position <= 3 ? [`${pos.name} trophy`] : []
  }));

  // Generate remaining positions for standard template
  if (template === SIMPLE_TEMPLATES.standard) {
   for (let i = 5; i <= 16; i++) {
    let cashPercent = 0;
    let name = '';
    let elo = 15;
    let spa = 150;

    if (i <= 6) {
     cashPercent = 4;
     name = `Hạng 5-6`;
     elo = 30;
     spa = 300;
    } else if (i <= 8) {
     cashPercent = 2;
     name = `Hạng 7-8`;
     elo = 25;
     spa = 250;
    } else if (i <= 12) {
     cashPercent = 1.125;
     name = `Hạng 9-12`;
     elo = 20;
     spa = 200;
    } else {
     cashPercent = 0.5625;
     name = `Hạng 13-16`;
     elo = 15;
     spa = 150;
    }

    generatedPrizes.push({
     id: `prize-${i}`,
     position: i,
     name,
     cashAmount: Math.floor((prizePool * cashPercent) / 100), // Dùng prizePool thay vì initialPrizePool
     eloPoints: elo,
     spaPoints: spa,
     theme: i <= 8 ? 'blue' : 'gray',
     isVisible: true
    });
   }
  }

  setPrizes(generatedPrizes);
  
  // FORCE IMMEDIATE CALLBACK - không đợi useEffect với throttling
  setTimeout(() => {
   onPrizesChange?.(generatedPrizes);
  }, 50); // Small delay để đảm bảo state đã được set
 };

 const applyTemplate = (templateKey: keyof typeof SIMPLE_TEMPLATES) => {
  const template = SIMPLE_TEMPLATES[templateKey];
  const newPrizes: SimplePrize[] = template.positions.map(pos => ({
   id: `prize-${pos.position}`,
   position: pos.position,
   name: pos.name,
   cashAmount: Math.floor((initialPrizePool * pos.cashPercent) / 100),
   eloPoints: pos.elo,
   spaPoints: pos.spa,
   theme: pos.theme,
   isVisible: true,
   items: pos.position <= 3 ? [`${pos.name} trophy`] : []
  }));

  setPrizes(newPrizes);
  toast.success(`Đã áp dụng template: ${template.name}`);
 };

 const handleCreatePrize = () => {
  const nextPosition = Math.max(...prizes.map(p => p.position), 0) + 1;
  setEditingPrize({
   id: `new-${Date.now()}`,
   position: nextPosition,
   name: '',
   cashAmount: 0,
   eloPoints: 0,
   spaPoints: 0,
   theme: 'blue',
   isVisible: true
  });
 };

 const handleEditPrize = (prize: SimplePrize) => {
  setEditingPrize({ ...prize });
 };

 const handleSavePrize = () => {
  if (!editingPrize) return;

  if (prizes.find(p => p.id === editingPrize.id)) {
   // Update existing
   setPrizes(prev => prev.map(p => p.id === editingPrize.id ? editingPrize : p));
  } else {
   // Create new
   setPrizes(prev => [...prev, editingPrize].sort((a, b) => a.position - b.position));
  }

  setEditingPrize(null);
  toast.success('Giải thưởng đã được lưu');
 };

 const handleDeletePrize = (prizeId: string) => {
  if (!confirm('Bạn có chắc chắn muốn xóa giải thưởng này?')) return;
  setPrizes(prev => prev.filter(p => p.id !== prizeId));
  toast.success('Giải thưởng đã được xóa');
 };

 // Quick allocation templates
 const QUICK_TEMPLATES = {
  '50-30-20': { name: '50-30-20 (Top 3)', positions: { 1: 50, 2: 30, 3: 20 } },
  '40-30-20-10': { name: '40-30-20-10 (Top 4)', positions: { 1: 40, 2: 30, 3: 20, 4: 10 } },
  '40-25-15-10-5-5': { name: '40-25-15-10-5-5 (Top 6)', positions: { 1: 40, 2: 25, 3: 15, 4: 10, 5: 5, 6: 5 } },
 };

 const handleQuickAllocation = (templateKey: keyof typeof QUICK_TEMPLATES) => {
  const template = QUICK_TEMPLATES[templateKey];
  const newPrizes: SimplePrize[] = [];

  // Tạo các vị trí được phân bổ tiền thưởng
  Object.entries(template.positions).forEach(([position, percentage]) => {
   const pos = parseInt(position);
   const cashAmount = Math.floor((initialPrizePool * percentage) / 100);
   
   let name = '';
   let elo = 15;
   let spa = 150;
   let theme = 'gray';

   switch (pos) {
    case 1:
     name = 'Vô địch';
     elo = 100;
     spa = 1000;
     theme = 'gold';
     break;
    case 2:
     name = 'Á quân';
     elo = 75;
     spa = 800;
     theme = 'silver';
     break;
    case 3:
     name = 'Hạng 3';
     elo = 50;
     spa = 600;
     theme = 'bronze';
     break;
    case 4:
     name = 'Hạng 4';
     elo = 40;
     spa = 400;
     theme = 'blue';
     break;
    case 5:
     name = 'Hạng 5';
     elo = 35;
     spa = 350;
     theme = 'blue';
     break;
    case 6:
     name = 'Hạng 6';
     elo = 30;
     spa = 300;
     theme = 'blue';
     break;
    default:
     name = `Hạng ${pos}`;
     elo = Math.max(15, 50 - (pos * 5));
     spa = Math.max(150, 500 - (pos * 50));
     theme = pos <= 8 ? 'blue' : 'gray';
   }

   newPrizes.push({
    id: `quick-${pos}`,
    position: pos,
    name,
    cashAmount,
    eloPoints: elo,
    spaPoints: spa,
    theme,
    isVisible: true,
    items: pos <= 3 ? [`${name} trophy`] : []
   });
  });

  // Thêm các vị trí còn lại (không có tiền thưởng nhưng có ELO/SPA)
  const maxPosition = Math.max(...Object.keys(template.positions).map(Number));
  for (let pos = maxPosition + 1; pos <= 16; pos++) {
   let name = '';
   let elo = 15;
   let spa = 150;
   let theme = 'gray';

   if (pos <= 8) {
    name = `Hạng ${pos}`;
    elo = Math.max(20, 45 - (pos * 3));
    spa = Math.max(200, 400 - (pos * 25));
    theme = 'blue';
   } else if (pos <= 12) {
    name = `Hạng ${pos}`;
    elo = Math.max(15, 35 - (pos * 2));
    spa = Math.max(150, 300 - (pos * 15));
    theme = 'gray';
   } else {
    name = `Hạng ${pos}`;
    elo = 15;
    spa = 150;
    theme = 'gray';
   }

   newPrizes.push({
    id: `quick-${pos}`,
    position: pos,
    name,
    cashAmount: 0, // Không có tiền thưởng
    eloPoints: elo,
    spaPoints: spa,
    theme,
    isVisible: true,
    items: []
   });
  }

  // Sắp xếp theo vị trí
  newPrizes.sort((a, b) => a.position - b.position);

  setPrizes(newPrizes);
  setShowQuickAllocation(false);
  toast.success(`Đã áp dụng phân bổ nhanh: ${template.name} (${maxPosition} vị trí có thưởng + ${16 - maxPosition} vị trí ELO/SPA)`);
 };

 const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
   style: 'currency',
   currency: 'VND',
  }).format(amount);
 };

 const getPositionIcon = (position: number) => {
  switch (position) {
   case 1: return <Crown className='h-5 w-5 text-yellow-500' />;
   case 2: return <Medal className='h-5 w-5 text-gray-400' />;
   case 3: return <Award className='h-5 w-5 text-amber-600' />;
   default: return <Trophy className='h-5 w-5 text-muted-foreground' />;
  }
 };

 const getThemeClass = (theme?: string) => {
  return COLOR_THEMES.find(t => t.value === theme)?.className || COLOR_THEMES[3].className;
 };

 if (loading) {
  return (
   <Card>
    <CardContent className='p-6'>
     <div className='flex items-center justify-center space-x-2'>
      <RefreshCw className='h-4 w-4 animate-spin' />
      <span>Đang tải...</span>
     </div>
    </CardContent>
   </Card>
  );
 }

 return (
  <div className="space-y-6">
   {/* Header với Templates */}
   <Card>
    <CardHeader>
     <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
       <Trophy className="h-5 w-5 text-primary" />
       <CardTitle>Phần thưởng giải đấu</CardTitle>
       <Badge variant="outline" className="text-caption">
        {mode === 'create' ? 'Preview Mode' : 'Edit Mode'}
       </Badge>
      </div>
      {isEditable && (
       <div className="flex items-center gap-2">
        <Select onValueChange={(value) => applyTemplate(value as keyof typeof SIMPLE_TEMPLATES)}>
         <SelectTrigger className="w-48">
          <SelectValue placeholder="Chọn template..." />
         </SelectTrigger>
         <SelectContent>
          {Object.entries(SIMPLE_TEMPLATES).map(([key, template]) => (
           <SelectItem key={key} value={key}>
            {template.name}
           </SelectItem>
          ))}
         </SelectContent>
        </Select>
        <Button
         type="button"
         variant="outline"
         
         onClick={() => setShowQuickAllocation(true)}
         className="flex items-center gap-2"
        >
         <Zap className="w-4 h-4" />
         Phân bổ nhanh
        </Button>
        <Button onClick={handleCreatePrize} >
         <Plus className="w-4 h-4 mr-1" />
         Thêm giải
        </Button>
       </div>
      )}
     </div>
    </CardHeader>
    <CardContent>
     <div className="flex items-center justify-between text-body-small">
      <div className="flex items-center gap-4">
       <span className="text-muted-foreground">
        Tổng giải thưởng: <span className="text-title-success">{formatCurrency(totalPrizePool)}</span>
       </span>
       <span className="text-muted-foreground">
        {prizes.length} vị trí
       </span>
      </div>
      {initialPrizePool > 0 && (
       <span className="text-caption text-muted-foreground">
        Pool: {formatCurrency(initialPrizePool)}
       </span>
      )}
     </div>
    </CardContent>
   </Card>

   {/* Danh sách giải thưởng */}
   <div className="space-y-3 max-h-[500px] overflow-y-auto">
    {prizes.map((prize) => (
     <Card key={prize.id} className={`${getThemeClass(prize.theme)} shadow-sm hover:shadow-md transition-all`}>
      <CardContent className="pt-4 pb-4">
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
         {getPositionIcon(prize.position)}
         <Badge variant="secondary" className="font-mono text-body-small px-3 py-1 bg-white/70">
          #{prize.position}
         </Badge>
         <div>
          <h4 className="font-bold text-body-large">{prize.name}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-body-small mt-1">
           <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-success-600" />
            <span className="font-semibold">{formatCurrency(prize.cashAmount)}</span>
           </div>
           <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-info-600" />
            <span>{prize.eloPoints} ELO</span>
           </div>
           <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-primary-600" />
            <span>{prize.spaPoints} SPA</span>
           </div>
          </div>
          {prize.items && prize.items.length > 0 && (
           <div className="flex items-center gap-1 mt-1 text-body-small">
            <Gift className="h-3 w-3 text-warning-600" />
            <span className="text-neutral-700">{prize.items.join(', ')}</span>
           </div>
          )}
         </div>
        </div>
        
        {isEditable && (
         <div className="flex gap-2">
          <Button
           
           variant="outline"
           onClick={() => handleEditPrize(prize)}
           className="bg-white/50 hover:bg-white/80"
          >
           <Edit2 className="w-4 h-4" />
          </Button>
          <Button
           
           variant="outline"
           onClick={() => handleDeletePrize(prize.id)}
           className="bg-white/50 hover:bg-error-50 hover:text-error-600"
          >
           <Trash2 className="w-4 h-4" />
          </Button>
         </div>
        )}
       </div>
      </CardContent>
     </Card>
    ))}
   </div>

   {/* Form chỉnh sửa */}
   {editingPrize && (
    <Card className="border-2 border-primary">
     <CardHeader>
      <CardTitle>
       {prizes.find(p => p.id === editingPrize.id) ? 'Chỉnh sửa giải thưởng' : 'Thêm giải thưởng mới'}
      </CardTitle>
     </CardHeader>
     <CardContent className="form-spacing">
      <div className="grid grid-cols-2 gap-4">
       <div>
        <Label htmlFor="position">Vị trí</Label>
        <Input
         id="position"
         type="number"
         value={editingPrize.position}
         onChange={(e) => setEditingPrize({
          ...editingPrize,
          position: parseInt(e.target.value) || 1
         })}
        />
       </div>
       <div>
        <Label htmlFor="name">Tên giải</Label>
        <Input
         id="name"
         value={editingPrize.name}
         onChange={(e) => setEditingPrize({
          ...editingPrize,
          name: e.target.value
         })}
         placeholder="Vô địch, Á quân..."
        />
       </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
       <div>
        <Label htmlFor="cashAmount">Tiền thưởng (VND)</Label>
        <Input
         id="cashAmount"
         type="number"
         value={editingPrize.cashAmount}
         onChange={(e) => setEditingPrize({
          ...editingPrize,
          cashAmount: parseFloat(e.target.value) || 0
         })}
        />
       </div>
       <div>
        <Label htmlFor="eloPoints">ELO Points</Label>
        <Input
         id="eloPoints"
         type="number"
         value={editingPrize.eloPoints}
         onChange={(e) => setEditingPrize({
          ...editingPrize,
          eloPoints: parseInt(e.target.value) || 0
         })}
        />
       </div>
       <div>
        <Label htmlFor="spaPoints">SPA Points</Label>
        <Input
         id="spaPoints"
         type="number"
         value={editingPrize.spaPoints}
         onChange={(e) => setEditingPrize({
          ...editingPrize,
          spaPoints: parseInt(e.target.value) || 0
         })}
        />
       </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
       <div>
        <Label htmlFor="theme">Màu chủ đề</Label>
        <Select 
         value={editingPrize.theme} 
         onValueChange={(value) => setEditingPrize({
          ...editingPrize,
          theme: value
         })}
        >
         <SelectTrigger>
          <SelectValue />
         </SelectTrigger>
         <SelectContent>
          {COLOR_THEMES.map(theme => (
           <SelectItem key={theme.value} value={theme.value}>
            {theme.label}
           </SelectItem>
          ))}
         </SelectContent>
        </Select>
       </div>
       <div>
        <Label htmlFor="items">Phần thưởng vật chất (phân cách bằng dấu phẩy)</Label>
        <Input
         id="items"
         value={editingPrize.items?.join(', ') || ''}
         onChange={(e) => setEditingPrize({
          ...editingPrize,
          items: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
         })}
         placeholder="Cúp vàng, Giấy chứng nhận..."
        />
       </div>
      </div>

      <div>
       <Label htmlFor="description">Mô tả (tùy chọn)</Label>
       <Textarea
        id="description"
        value={editingPrize.description || ''}
        onChange={(e) => setEditingPrize({
         ...editingPrize,
         description: e.target.value
        })}
        placeholder="Mô tả thêm về giải thưởng..."
        rows={2}
       />
      </div>

      <div className="flex gap-2 pt-4">
       <Button onClick={handleSavePrize}>
        <Save className="w-4 h-4 mr-2" />
        Lưu
       </Button>
       <Button variant="outline" onClick={() => setEditingPrize(null)}>
        <X className="w-4 h-4 mr-2" />
        Hủy
       </Button>
      </div>
     </CardContent>
    </Card>
   )}

   {/* Tóm tắt financial */}
   {initialPrizePool > 0 && (
    <Card>
     <CardContent className="pt-4">
      <div className="flex items-center gap-2 mb-3">
       <Info className="h-4 w-4 text-muted-foreground" />
       <span className="text-body-small-medium">Tóm tắt tài chính</span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-body-small">
       <div className="text-center">
        <div className="text-muted-foreground">Pool dự kiến</div>
        <div className="font-semibold">{formatCurrency(initialPrizePool)}</div>
       </div>
       <div className="text-center">
        <div className="text-muted-foreground">Đã phân bổ</div>
        <div className="font-semibold text-error-600">{formatCurrency(totalPrizePool)}</div>
       </div>
       <div className="text-center">
        <div className="text-muted-foreground">Còn lại</div>
        <div className={`font-semibold ${initialPrizePool - totalPrizePool >= 0 ? 'text-success-600' : 'text-error-600'}`}>
         {formatCurrency(initialPrizePool - totalPrizePool)}
        </div>
       </div>
      </div>
     </CardContent>
    </Card>
   )}

   {/* Quick Allocation Dialog */}
   <Dialog open={showQuickAllocation} onOpenChange={setShowQuickAllocation}>
    <DialogContent className="sm:max-w-[425px]">
     <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
       <Zap className="w-5 h-5" />
       Phân bổ giải thưởng nhanh
      </DialogTitle>
      <DialogDescription>
       Chọn một template phân bổ để tự động tạo giải thưởng với tỷ lệ cân bằng.
       Pool hiện tại: <span className="font-semibold">{formatCurrency(initialPrizePool)}</span>
      </DialogDescription>
     </DialogHeader>
     
     <div className="form-spacing">
      {Object.entries(QUICK_TEMPLATES).map(([key, template]) => (
       <div
        key={key}
        className="p-4 border rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
        onClick={() => handleQuickAllocation(key as keyof typeof QUICK_TEMPLATES)}
       >
        <div className="flex justify-between items-start">
         <div>
          <h4 className="font-medium">{template.name}</h4>
          <div className="text-body-small text-muted-foreground mt-1">
           {Object.entries(template.positions).map(([pos, pct]) => 
            `#${pos}: ${pct}%`
           ).join(' • ')}
          </div>
         </div>
         <div className="text-body-small font-mono">
          {Object.keys(template.positions).length} vị trí
         </div>
        </div>
        
        <div className="mt-2 text-caption text-muted-foreground">
         <div>💰 Preview: {Object.entries(template.positions).map(([pos, pct]) => 
          `#${pos}: ${formatCurrency(Math.floor((initialPrizePool * pct) / 100))}`
         ).join(' • ')}</div>
         <div className="mt-1">🎯 Các vị trí còn lại (#7-16): Chỉ có ELO & SPA points</div>
        </div>
       </div>
      ))}
     </div>
    </DialogContent>
   </Dialog>
  </div>
 );
};

export default UnifiedPrizesManager;
