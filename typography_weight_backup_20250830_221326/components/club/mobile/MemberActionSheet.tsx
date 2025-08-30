import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Shield, Crown, UserX, Loader2, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clubRoleUtils } from "@sabo/shared-utils"

export interface MemberActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: {
    id: string;
    name: string;
    avatar_url?: string;
    status?: string;
    rank?: string;
  } | null;
  loading?: boolean;
  onPromote?: (id: string) => Promise<any> | void;
  onDemote?: (id: string) => Promise<any> | void;
  onRemove?: (id: string) => Promise<any> | void;
  onViewProfile?: (id: string) => void;
  canManage?: boolean;
}

export const MemberActionSheet: React.FC<MemberActionSheetProps> = ({
  open,
  onOpenChange,
  member,
  loading = false,
  onPromote,
  onDemote,
  onRemove,
  onViewProfile,
  canManage = true,
}) => {
  const disabled = loading || !member;
  const queryClient = useQueryClient();
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const isOwner = (member as any)?.role === 'owner';
  const targetRole = (member as any)?.role as any;
  const canPromote = clubRoleUtils.canPromote(
    (member as any)?.currentUserRole,
    targetRole
  );
  const canDemote = clubRoleUtils.canDemote(
    (member as any)?.currentUserRole,
    targetRole
  );
  const canRemove = clubRoleUtils.canRemove(
    (member as any)?.currentUserRole,
    targetRole
  );

  const internalPromote = async () => {
    if (!member) return;
    try {
      await supabase
        .from('club_members')
        .update({ role: 'moderator' } as any)
        .eq('user_id', member.id)
        .eq('club_id', (member as any).club_id);
      toast.success('Đã thăng cấp');
      queryClient.invalidateQueries({ queryKey: ['club-members'] });
      onPromote?.(member.id);
    } catch (e: any) {
      toast.error('Không thể thăng cấp');
    }
  };

  const internalDemote = async () => {
    if (!member) return;
    try {
      await supabase
        .from('club_members')
        .update({ role: 'member' } as any)
        .eq('user_id', member.id)
        .eq('club_id', (member as any).club_id);
      toast.success('Đã giảm quyền');
      queryClient.invalidateQueries({ queryKey: ['club-members'] });
      onDemote?.(member.id);
    } catch (e: any) {
      toast.error('Không thể giảm quyền');
    }
  };

  const internalRemove = async () => {
    if (!member) return;
    if (!confirmRemove) {
      setConfirmRemove(true);
      setTimeout(() => setConfirmRemove(false), 4000);
      return;
    }
    try {
      await supabase
        .from('club_members')
        .update({ status: 'removed' })
        .eq('user_id', member.id)
        .eq('club_id', (member as any).club_id);
      toast.success('Đã gỡ khỏi CLB');
      queryClient.invalidateQueries({ queryKey: ['club-members'] });
      onRemove?.(member.id);
      setConfirmRemove(false);
    } catch (e: any) {
      toast.error('Không thể gỡ');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='bottom' className='max-h-[80vh] overflow-y-auto pt-4'>
        <SheetHeader className='mb-2'>
          <SheetTitle className='flex items-center gap-2 text-sm'>
            Tác vụ thành viên
          </SheetTitle>
          <SheetDescription className='text-xs'>
            Thao tác nhanh cho thành viên được chọn.
          </SheetDescription>
        </SheetHeader>
        {!member && (
          <div className='mobile-empty-state py-10'>
            <p className='text-caption-muted'>
              Chưa chọn thành viên.
            </p>
          </div>
        )}
        {member && (
          <div className='mobile-spacing-group'>
            <div className='flex items-center gap-3'>
              <Avatar className='w-12 h-12'>
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback>
                  {member.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <p className='font-medium truncate text-sm'>{member.name}</p>
                <p className='text-[11px] text-muted-foreground uppercase tracking-wide'>
                  Status: {member.status || 'member'}
                  {member.rank ? ` • Rank: ${member.rank}` : ''}
                </p>
              </div>
              <Button
                size='sm'
                variant='outline'
                aria-label='Xem hồ sơ'
                onClick={() => member && onViewProfile?.(member.id)}
                disabled={disabled}
                className='mobile-button-compact'
              >
                <Info className='mobile-icon-secondary' />
              </Button>
            </div>
            <div className='space-y-2'>
              <button
                disabled={disabled || !canPromote || isOwner}
                onClick={() =>
                  member && onPromote ? onPromote(member.id) : internalPromote()
                }
                className='list-action-item'
              >
                <Crown className='mobile-icon-secondary text-amber-500' /> Thăng
                cấp
              </button>
              <button
                disabled={disabled || !canDemote || isOwner}
                onClick={() =>
                  member && onDemote ? onDemote(member.id) : internalDemote()
                }
                className='list-action-item'
              >
                <Shield className='mobile-icon-secondary text-slate-500' /> Giảm
                quyền
              </button>
              <button
                disabled={disabled}
                onClick={() => member && onViewProfile?.(member.id)}
                className='list-action-item'
              >
                <User className='mobile-icon-secondary text-blue-500' /> Hồ sơ
              </button>
              <button
                disabled={disabled || !canRemove || isOwner}
                onClick={() =>
                  member && (onRemove ? onRemove(member.id) : internalRemove())
                }
                className={`list-action-item list-action-item-destructive ${confirmRemove ? 'ring-2 ring-destructive/40' : ''}`}
              >
                <UserX className='mobile-icon-secondary' />{' '}
                {confirmRemove ? 'Xác nhận gỡ?' : 'Gỡ khỏi CLB'}
              </button>
            </div>
            {loading && (
              <div className='mobile-loading-section py-2'>
                <Loader2 className='mobile-icon-secondary animate-spin' /> Đang
                xử lý...
              </div>
            )}
          </div>
        )}
        <SheetFooter className='mt-6'>
          <SheetClose asChild>
            <Button
              size='sm'
              variant='outline'
              className='mobile-button-secondary'
            >
              Đóng
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MemberActionSheet;
