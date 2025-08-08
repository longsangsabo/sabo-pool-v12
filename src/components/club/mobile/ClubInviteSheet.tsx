import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPlus, Loader2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClubInviteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId: string;
}

export const ClubInviteSheet: React.FC<ClubInviteSheetProps> = ({
  open,
  onOpenChange,
  clubId,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (debounced) {
      handleSearch(debounced);
    } else setResults([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const handleSearch = async (q: string) => {
    if (!q) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, full_name, avatar_url')
        .ilike('display_name', `%${q}%`)
        .limit(10);
      if (error) throw error;
      setResults(data || []);
    } catch (e: any) {
      toast.error('Lỗi tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (userId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('club_members')
        .insert({ club_id: clubId, user_id: userId, status: 'pending' });
      if (error) throw error;
      toast.success('Đã gửi lời mời');
    } catch (e: any) {
      toast.error('Không thể mời');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='bottom' className='max-h-[80vh] overflow-y-auto pt-4'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2 text-sm'>
            <UserPlus className='mobile-icon-secondary' /> Mời thành viên
          </SheetTitle>
          <SheetDescription className='text-xs'>
            Tìm và gửi lời mời tham gia CLB.
          </SheetDescription>
        </SheetHeader>
        <div className='mt-4 mobile-spacing-group'>
          <div className='form-field'>
            <label className='form-label'>Tìm thành viên</label>
            <div className='relative'>
              <Search className='mobile-icon-secondary absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='Tên hiển thị...'
                className='pl-8 input-mobile'
              />
              {loading && (
                <Loader2 className='mobile-icon-secondary animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground' />
              )}
            </div>
            <p className='mobile-caption'>Gõ để tìm (tự động sau 350ms)</p>
          </div>
          <div className='space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar'>
            {results.map(r => (
              <div
                key={r.user_id}
                className='mobile-list-item mobile-list-item-hover justify-between'
              >
                <div className='text-sm font-medium truncate'>
                  {r.display_name || r.full_name || 'Người chơi'}
                </div>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleInvite(r.user_id)}
                  disabled={loading}
                  className='btn-mobile-sm'
                >
                  Mời
                </Button>
              </div>
            ))}
            {!loading && debounced && results.length === 0 && (
              <div className='mobile-empty-state py-6'>
                <p className='text-xs text-muted-foreground'>
                  Không tìm thấy người dùng phù hợp.
                </p>
              </div>
            )}
            {loading && results.length === 0 && (
              <div className='mobile-loading-section py-4'>
                <Loader2 className='mobile-icon-secondary animate-spin' /> Đang
                tìm...
              </div>
            )}
          </div>
        </div>
        <SheetFooter className='mt-4'>
          <SheetClose asChild>
            <Button variant='outline' size='sm' className='btn-mobile-sm'>
              Đóng
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ClubInviteSheet;
