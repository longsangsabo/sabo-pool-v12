/**
 * Tournament Prizes Manager Componentconst PRIZE_TEMPLATES = [
  { key: 'standard', label: 'Tiêu chuẩn - 16 vị trí (Phân bổ đầy đủ)' },
  { key: 'winner-takes-all', label: 'Winner Takes All (100% cho vô địch)' },
  { key: 'top-heavy', label: 'Top Heavy (60-30-10% cho top 3)' },
  { key: 'distributed', label: 'Phân phối đầy đủ (16 vị trí có tiền)' },
];nages prize structure for tournaments with separate table
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit2, Save, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { 
  TournamentPrizesService, 
  type TournamentPrize, 
  type CreateTournamentPrizeInput 
} from '@/services/tournament-prizes.service';

interface TournamentPrizesManagerProps {
  tournamentId: string;
  initialPrizePool?: number;
  isPreviewMode?: boolean; // New prop for preview mode
  onPrizesChange?: (prizes: TournamentPrize[]) => void;
}

interface PrizeEditForm extends CreateTournamentPrizeInput {
  id?: string;
}

const COLOR_THEMES = [
  { value: 'gold', label: '🥇 Vàng', className: 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300 text-yellow-900' },
  { value: 'silver', label: '🥈 Bạc', className: 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300 text-gray-900' },
  { value: 'bronze', label: '🥉 Đồng', className: 'bg-gradient-to-r from-orange-100 to-orange-50 border-orange-300 text-orange-900' },
  { value: 'blue', label: '🔵 Xanh', className: 'bg-gradient-to-r from-blue-100 to-blue-50 border-blue-300 text-blue-900' },
  { value: 'green', label: '🟢 Lục', className: 'bg-gradient-to-r from-green-100 to-green-50 border-green-300 text-green-900' },
  { value: 'purple', label: '🟣 Tím', className: 'bg-gradient-to-r from-purple-100 to-purple-50 border-purple-300 text-purple-900' },
  { value: 'gray', label: '⚪ Xám', className: 'bg-gradient-to-r from-slate-100 to-slate-50 border-slate-300 text-slate-900' },
];

const PRIZE_TEMPLATES = [
  { key: 'standard', label: 'Tiêu chuẩn - 16 vị trí + giải tham gia' },
  { key: 'winner-takes-all', label: 'Winner Takes All (100% cho vô địch)' },
  { key: 'top-heavy', label: 'Top Heavy (60-30-10% cho top 3)' },
  { key: 'distributed', label: 'Phân phối đầy đủ (16 vị trí có tiền)' },
];

export const TournamentPrizesManager: React.FC<TournamentPrizesManagerProps> = ({
  tournamentId,
  initialPrizePool = 10000000,
  isPreviewMode = false,
  onPrizesChange,
}) => {
  const [prizes, setPrizes] = useState<TournamentPrize[]>([]);
  const [editingPrize, setEditingPrize] = useState<PrizeEditForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPrizePool, setTotalPrizePool] = useState(0);

  // Load existing prizes
  useEffect(() => {
    console.log('🔍 [TournamentPrizesManager] useEffect triggered');
    console.log('🔍 [TournamentPrizesManager] isPreviewMode:', isPreviewMode);
    console.log('🔍 [TournamentPrizesManager] tournamentId:', tournamentId);
    
    if (!isPreviewMode) {
      console.log('🔍 [TournamentPrizesManager] Loading existing prizes...');
      loadPrizes();
    } else {
      console.log('🔍 [TournamentPrizesManager] Loading preview template...');
      // In preview mode, load default template
      loadPreviewTemplate();
    }
  }, [tournamentId, isPreviewMode]);

  // Calculate total when prizes change
  useEffect(() => {
    console.log('🏆 [TournamentPrizesManager] useEffect triggered, prizes.length:', prizes.length);
    const total = prizes.reduce((sum, prize) => sum + (prize.cash_amount || 0), 0);
    setTotalPrizePool(total);
    
    if (prizes.length > 0) {
      console.log('🏆 [TournamentPrizesManager] Calling onPrizesChange with', prizes.length, 'prizes');
      onPrizesChange?.(prizes);
    } else {
      console.log('🏆 [TournamentPrizesManager] No prizes to send, skipping onPrizesChange');
    }
  }, [prizes, onPrizesChange]);

  const loadPrizes = async () => {
    try {
      setLoading(true);
      const data = await TournamentPrizesService.getTournamentPrizes(tournamentId);
      setPrizes(data);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách giải thưởng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPreviewTemplate = () => {
    console.log('🔍 [TournamentPrizesManager] Loading preview template...');
    console.log('🔍 [TournamentPrizesManager] tournamentId:', tournamentId);
    console.log('🔍 [TournamentPrizesManager] initialPrizePool:', initialPrizePool);
    
    try {
      // Create default template for preview
      const template = TournamentPrizesService.createDefaultPrizeTemplate(
        'preview-mode',
        'standard',
        initialPrizePool
      );
      
      console.log('🔍 Template generated:', template.length, 'positions');
      console.log('🔍 First template item:', template[0]);
      console.log('🔍 Last template item:', template[template.length - 1]);
      
      // Convert to TournamentPrize format for display
      const previewPrizes: TournamentPrize[] = template.map((prize, index) => ({
        id: `preview-${index}`,
        tournament_id: 'preview-mode',
        prize_position: prize.prize_position,
        position_name: prize.position_name,
        position_description: prize.position_description,
        cash_amount: prize.cash_amount || 0,
        cash_currency: prize.cash_currency || 'VND',
        elo_points: prize.elo_points || 0,
        spa_points: prize.spa_points || 0,
        physical_items: prize.physical_items || [],
        is_visible: prize.is_visible ?? true,
        is_guaranteed: prize.is_guaranteed ?? true,
        special_conditions: prize.special_conditions,
        display_order: prize.display_order,
        color_theme: prize.color_theme,
        icon_name: prize.icon_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: undefined,
      }));

      console.log('🎯 Preview prizes created:', previewPrizes.length, 'items');
      console.log('🎯 First preview prize:', previewPrizes[0]);
      setPrizes(previewPrizes);
      
      // Immediately notify parent about the new prizes
      setTimeout(() => {
        console.log('🏆 [TournamentPrizesManager] Calling onPrizesChange with:', previewPrizes.length, 'prizes');
        onPrizesChange?.(previewPrizes);
      }, 100);
    } catch (error) {
      console.error('Error loading preview template:', error);
    }
  };

  const handleCreatePrize = () => {
    setEditingPrize({
      tournament_id: tournamentId,
      prize_position: prizes.length + 1,
      position_name: '',
      cash_amount: 0,
      elo_points: 0,
      spa_points: 0,
      physical_items: [],
      color_theme: 'blue',
      cash_currency: 'VND',
    });
  };

  const handleEditPrize = (prize: TournamentPrize) => {
    setEditingPrize({
      ...prize,
    });
  };

  const handleSavePrize = async () => {
    if (!editingPrize) return;

    if (isPreviewMode) {
      // In preview mode, just update the local state
      handlePreviewSave();
      return;
    }

    try {
      setLoading(true);
      if (editingPrize.id && !editingPrize.id.startsWith('preview-')) {
        // Update existing prize
        const updated = await TournamentPrizesService.updateTournamentPrize(
          editingPrize.id,
          editingPrize
        );
        setPrizes(prev => prev.map(p => p.id === updated.id ? updated : p));
      } else {
        // Create new prize
        const created = await TournamentPrizesService.createTournamentPrize(editingPrize);
        setPrizes(prev => [...prev, created].sort((a, b) => a.prize_position - b.prize_position));
      }
      setEditingPrize(null);
      toast({
        title: 'Thành công',
        description: 'Giải thưởng đã được lưu',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu giải thưởng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewSave = () => {
    if (!editingPrize) return;
    
    if (editingPrize.id && editingPrize.id.startsWith('preview-')) {
      // Update existing preview prize
      setPrizes(prev => prev.map(p => p.id === editingPrize.id ? {
        ...p,
        ...editingPrize,
        updated_at: new Date().toISOString(),
      } : p));
    } else {
      // Create new preview prize
      const newPreviewPrize: TournamentPrize = {
        id: `preview-${Date.now()}`,
        tournament_id: 'preview-mode',
        prize_position: editingPrize.prize_position,
        position_name: editingPrize.position_name,
        position_description: editingPrize.position_description,
        cash_amount: editingPrize.cash_amount || 0,
        cash_currency: editingPrize.cash_currency || 'VND',
        elo_points: editingPrize.elo_points || 0,
        spa_points: editingPrize.spa_points || 0,
        physical_items: editingPrize.physical_items || [],
        is_visible: editingPrize.is_visible ?? true,
        is_guaranteed: editingPrize.is_guaranteed ?? true,
        special_conditions: editingPrize.special_conditions,
        display_order: editingPrize.display_order,
        color_theme: editingPrize.color_theme,
        icon_name: editingPrize.icon_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: undefined,
      };
      
      setPrizes(prev => [...prev, newPreviewPrize].sort((a, b) => a.prize_position - b.prize_position));
    }
    
    setEditingPrize(null);
    toast({
      title: 'Cập nhật preview',
      description: 'Thay đổi giải thưởng đã được áp dụng',
    });
  };

  const handleDeletePrize = async (prizeId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giải thưởng này?')) return;

    try {
      setLoading(true);
      await TournamentPrizesService.deleteTournamentPrize(prizeId);
      setPrizes(prev => prev.filter(p => p.id !== prizeId));
      toast({
        title: 'Thành công',
        description: 'Giải thưởng đã được xóa',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa giải thưởng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async (templateKey: string) => {
    if (isPreviewMode) {
      handlePreviewTemplate(templateKey);
      return;
    }

    try {
      setLoading(true);
      
      // Clear existing prizes
      await Promise.all(prizes.map(prize => 
        TournamentPrizesService.deleteTournamentPrize(prize.id)
      ));

      // Create template prizes
      const template = TournamentPrizesService.createDefaultPrizeTemplate(
        tournamentId,
        templateKey as any,
        initialPrizePool
      );
      
      const newPrizes = await TournamentPrizesService.createBulkTournamentPrizes(template);
      setPrizes(newPrizes);
      
      toast({
        title: 'Thành công',
        description: 'Template giải thưởng đã được áp dụng',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể áp dụng template',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTemplate = (templateKey: string) => {
    try {
      const template = TournamentPrizesService.createDefaultPrizeTemplate(
        'preview-mode',
        templateKey as any,
        initialPrizePool
      );
      
      // Convert to TournamentPrize format for preview
      const previewPrizes: TournamentPrize[] = template.map((prize, index) => ({
        id: `preview-${index}`,
        tournament_id: 'preview-mode',
        prize_position: prize.prize_position,
        position_name: prize.position_name,
        position_description: prize.position_description,
        cash_amount: prize.cash_amount || 0,
        cash_currency: prize.cash_currency || 'VND',
        elo_points: prize.elo_points || 0,
        spa_points: prize.spa_points || 0,
        physical_items: prize.physical_items || [],
        is_visible: prize.is_visible ?? true,
        is_guaranteed: prize.is_guaranteed ?? true,
        special_conditions: prize.special_conditions,
        display_order: prize.display_order,
        color_theme: prize.color_theme,
        icon_name: prize.icon_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: undefined,
      }));

      setPrizes(previewPrizes);
      
      toast({
        title: 'Template preview',
        description: `Đã áp dụng template "${templateKey}" cho preview`,
      });
    } catch (error) {
      console.error('Error applying preview template:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể áp dụng template preview',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getColorTheme = (theme?: string) => {
    return COLOR_THEMES.find(t => t.value === theme) || COLOR_THEMES[3];
  };

  return (
    <div className="space-y-6">
      {/* Header with Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Cấu trúc giải thưởng</CardTitle>
              {isPreviewMode && (
                <Badge variant="outline" className="text-xs">
                  Preview Mode
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Select onValueChange={handleApplyTemplate}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn template..." />
                </SelectTrigger>
                <SelectContent>
                  {PRIZE_TEMPLATES.map(template => (
                    <SelectItem key={template.key} value={template.key}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleCreatePrize} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Thêm giải
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Tổng giải thưởng: {formatCurrency(totalPrizePool)}</span>
            <span>{prizes.length} vị trí</span>
          </div>
        </CardContent>
      </Card>

      {/* Prizes List - Fixed Display */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {prizes.map((prize) => {
          const theme = getColorTheme(prize.color_theme);
          return (
            <Card key={prize.id} className={`${theme.className} shadow-sm hover:shadow-md transition-shadow`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="font-mono text-sm px-3 py-1 bg-white/50">
                      #{prize.prize_position}
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">{prize.position_name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-green-600 font-semibold">💰</span>
                          <span className="font-semibold">{formatCurrency(prize.cash_amount)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600 font-semibold">⚡</span>
                          <span>{prize.elo_points} ELO</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-purple-600 font-semibold">🎯</span>
                          <span>{prize.spa_points} SPA</span>
                        </div>
                      </div>
                      {prize.physical_items.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-sm">
                          <span className="text-orange-600 font-semibold">🏆</span>
                          <span className="text-gray-700">{prize.physical_items.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPrize(prize)}
                      className="bg-white/50 hover:bg-white/80"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePrize(prize.id)}
                      className="bg-white/50 hover:bg-white/80 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Form Modal */}
      {editingPrize && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>
              {editingPrize.id ? 'Chỉnh sửa giải thưởng' : 'Thêm giải thưởng mới'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prize_position">Vị trí</Label>
                <Input
                  id="prize_position"
                  type="number"
                  value={editingPrize.prize_position}
                  onChange={(e) => setEditingPrize({
                    ...editingPrize,
                    prize_position: parseInt(e.target.value) || 1
                  })}
                />
              </div>
              <div>
                <Label htmlFor="position_name">Tên giải</Label>
                <Input
                  id="position_name"
                  value={editingPrize.position_name}
                  onChange={(e) => setEditingPrize({
                    ...editingPrize,
                    position_name: e.target.value
                  })}
                  placeholder="Vô địch, Á quân..."
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cash_amount">Tiền thưởng (VND)</Label>
                <Input
                  id="cash_amount"
                  type="number"
                  value={editingPrize.cash_amount}
                  onChange={(e) => setEditingPrize({
                    ...editingPrize,
                    cash_amount: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
              <div>
                <Label htmlFor="elo_points">ELO Points</Label>
                <Input
                  id="elo_points"
                  type="number"
                  value={editingPrize.elo_points}
                  onChange={(e) => setEditingPrize({
                    ...editingPrize,
                    elo_points: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              <div>
                <Label htmlFor="spa_points">SPA Points</Label>
                <Input
                  id="spa_points"
                  type="number"
                  value={editingPrize.spa_points}
                  onChange={(e) => setEditingPrize({
                    ...editingPrize,
                    spa_points: parseInt(e.target.value) || 0
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color_theme">Màu chủ đề</Label>
                <Select 
                  value={editingPrize.color_theme} 
                  onValueChange={(value) => setEditingPrize({
                    ...editingPrize,
                    color_theme: value
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
                <Label htmlFor="display_order">Thứ tự hiển thị</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={editingPrize.display_order || ''}
                  onChange={(e) => setEditingPrize({
                    ...editingPrize,
                    display_order: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="physical_items">Phần thưởng vật chất (phân cách bằng dấu phẩy)</Label>
              <Input
                id="physical_items"
                value={editingPrize.physical_items?.join(', ') || ''}
                onChange={(e) => setEditingPrize({
                  ...editingPrize,
                  physical_items: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="Cúp vàng, Giấy chứng nhận, Huy chương..."
              />
            </div>

            <div>
              <Label htmlFor="position_description">Mô tả (tùy chọn)</Label>
              <Textarea
                id="position_description"
                value={editingPrize.position_description || ''}
                onChange={(e) => setEditingPrize({
                  ...editingPrize,
                  position_description: e.target.value
                })}
                placeholder="Mô tả thêm về giải thưởng..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSavePrize} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Lưu
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingPrize(null)}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
