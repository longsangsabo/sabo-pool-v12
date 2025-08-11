// CLEAN MINIMAL SPA ADMIN PANEL (legacy milestone logic removed)
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SPAUser { id: string; spa_points: number; }

const SPAAdminPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<SPAUser | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState('');

  // Fetch a single user ranking entry by exact user id (simplified admin lookup)
  const userQuery = useQuery({
    queryKey: ['spa-admin-user', search],
    queryFn: async () => {
      if (!search) return null;
      const { data, error } = await supabase
        .from('player_rankings')
        .select('user_id, spa_points')
        .eq('user_id', search)
        .single();
      if (error) return null;
      return { id: data.user_id, spa_points: data.spa_points } as SPAUser;
    },
    enabled: !!search && search.length > 0,
  });

  // Fetch fresh balance when user selected (player_rankings assumed authoritative)
  const balanceQuery = useQuery({
    queryKey: ['spa-admin-balance', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return 0;
      const { data } = await supabase
        .from('player_rankings')
        .select('spa_points')
        .eq('user_id', selectedUser.id)
        .single();
      return data?.spa_points || 0;
    },
    enabled: !!selectedUser?.id,
  });

  const adjustMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error('No user selected');
      if (amount === 0) throw new Error('Amount is zero');
      // Fetch current balance
      const { data: currentData, error: fetchError } = await supabase
        .from('player_rankings')
        .select('spa_points')
        .eq('user_id', selectedUser.id)
        .single();
      if (fetchError) throw fetchError;
      const current = currentData?.spa_points || 0;
      const newBalance = current + amount;
      const { error: updError } = await supabase
        .from('player_rankings')
        .update({ spa_points: newBalance })
        .eq('user_id', selectedUser.id);
      if (updError) throw updError;
    },
    onSuccess: () => {
      toast.success('Cập nhật SPA thành công');
      setAmount(0); setReason('');
      queryClient.invalidateQueries({ queryKey: ['spa-admin-balance'] });
      if (selectedUser) {
        // Refresh local selected user balance
        balanceQuery.refetch();
      }
    },
    onError: (e: any) => toast.error(e.message || 'Lỗi cập nhật SPA'),
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Tìm kiếm người dùng theo User ID</h2>
          <div className="flex gap-2 items-center">
            <Input placeholder="Nhập user_id" value={search} onChange={e => setSearch(e.target.value.trim())} className="max-w-xs" />
            <Button variant="outline" disabled={!userQuery.data} onClick={() => userQuery.data && setSelectedUser(userQuery.data)}>Chọn</Button>
          </div>
          {search && userQuery.isFetching && <p className="text-sm text-muted-foreground">Đang tìm...</p>}
          {search && !userQuery.isFetching && !userQuery.data && <p className="text-sm text-muted-foreground">Không tìm thấy</p>}
          {userQuery.data && <p className="text-sm">Found: <span className="font-mono">{userQuery.data.id}</span> ({userQuery.data.spa_points} SPA)</p>}
        </CardContent>
      </Card>

      {selectedUser && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Quản lý SPA: {selectedUser.id}</h2>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">SPA hiện tại</p>
                <p className="text-2xl font-bold text-blue-600">{balanceQuery.data as number}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-end">
              <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-32" placeholder="± SPA" />
              <Input value={reason} onChange={e => setReason(e.target.value)} className="w-72" placeholder="Lý do (tùy chọn)" />
              <Button disabled={amount===0 || adjustMutation.isPending} onClick={() => adjustMutation.mutate()}>
                {adjustMutation.isPending ? 'Đang cập nhật...' : amount > 0 ? `+${amount} SPA` : `${amount} SPA`}
              </Button>
              {amount !== 0 && <Button variant="ghost" size="sm" onClick={()=>{setAmount(0);setReason('');}}>Reset</Button>}
            </div>
            {/* Transaction history intentionally omitted; add later if audit log table introduced */}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SPAAdminPanel;
