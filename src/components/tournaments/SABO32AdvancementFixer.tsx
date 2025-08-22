// =============================================
// SABO-32 ADVANCEMENT FIXER
// Simple button to fix missing player advancements
// =============================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, Wrench } from 'lucide-react';

interface SABO32AdvancementFixerProps {
  tournamentId: string;
  onFixed?: () => void;
}

export const SABO32AdvancementFixer: React.FC<SABO32AdvancementFixerProps> = ({ 
  tournamentId, 
  onFixed 
}) => {
  const [isFixing, setIsFixing] = useState(false);

  const handleFixAdvancement = async () => {
    if (!tournamentId) {
      toast.error('Không có tournament ID');
      return;
    }

    setIsFixing(true);
    
    try {
      console.log('🔧 Starting SABO-32 advancement fix for tournament:', tournamentId);
      
      // Call the SQL function
      const { data, error } = await supabase.rpc('fix_sabo32_advancement', {
        p_tournament_id: tournamentId
      });

      if (error) {
        console.error('❌ Fix advancement error:', error);
        toast.error(`Lỗi fix advancement: ${error.message}`);
        return;
      }

      console.log('✅ Fix advancement result:', data);
      
      toast.success('Đã fix advancement thành công!', {
        description: 'Các trận thắng đã được advance lên vòng sau'
      });
      
      // Trigger refresh if callback provided
      if (onFixed) {
        onFixed();
      }
      
    } catch (error: any) {
      console.error('❌ Unexpected error fixing advancement:', error);
      toast.error(`Lỗi không mong muốn: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Button
      onClick={handleFixAdvancement}
      disabled={isFixing}
      variant="outline"
      size="sm"
      className="text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-600 dark:hover:bg-amber-900/20"
    >
      {isFixing ? (
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Wrench className="w-4 h-4 mr-2" />
      )}
      {isFixing ? 'Đang fix...' : 'Fix Advancement'}
    </Button>
  );
};
