import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// Removed supabase import - migrated to services
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification } from "../services/notificationService";
import { uploadFile, getPublicUrl } from "../services/storageService";
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import {
 Search,
 Filter,
 Download,
 Calendar,
 ArrowUpRight,
 ArrowDownRight,
 Plus,
 Minus,
 Clock,
 CheckCircle,
 XCircle,
 AlertCircle,
 Trophy,
 Swords,
 CalendarCheck,
 Video,
 TrendingDown,
 Gift,
} from 'lucide-react';

interface SPATransaction {
 id: string;
 user_id: string;
 points_earned: number;
 source_type: string;
 source_id?: string;
 description: string;
 created_at: string;
}

interface TransactionHistoryProps {
 userId: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
 userId,
}) => {
 const { user } = useAuth();
 const queryClient = useQueryClient();
 const [transactions, setTransactions] = useState<SPATransaction[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedFilter, setSelectedFilter] = useState<string>('all');

 useEffect(() => {
  if (!user?.id) return;

  const fetchTransactions = async () => {
   setIsLoading(true);
   try {
    // TODO: Replace with service call - const { data, error } = await supabase
     .from('spa_transactions')
     .select('*')
     .eq('user_id', user.id)
     .order('created_at', { ascending: false })
     .limit(50);

    if (error) throw error;
    // Map spa_transactions to SPATransaction format
    const mappedData = (data || []).map(tx => ({
     id: tx.id,
     user_id: tx.user_id,
     points_earned: tx.amount,
     source_type: tx.source_type || 'other',
     source_id: tx.reference_id,
     description: tx.description,
     created_at: tx.created_at
    }));
    setTransactions(mappedData);
   } catch (error) {
    console.error('Failed to fetch SPA transactions:', error);
   } finally {
    setIsLoading(false);
   }
  };

  fetchTransactions();

  // Set up real-time subscription
//   const subscription = supabase
   .channel('spa-transactions-history')
   .on(
    'postgres_changes',
    {
     event: 'INSERT',
     schema: 'public',
     table: 'spa_transactions',
     filter: `user_id=eq.${user.id}`,
    },
    payload => {
     const newTransaction = payload.new as any;
     const mappedTransaction = {
      id: newTransaction.id,
      user_id: newTransaction.user_id,
      points_earned: newTransaction.amount,
      source_type: newTransaction.source_type || 'other',
      source_id: newTransaction.reference_id,
      description: newTransaction.description,
      created_at: newTransaction.created_at
     };
     setTransactions(prev => [mappedTransaction, ...prev.slice(0, 49)]);
     // Invalidate user profile to refresh SPA balance
     queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    }
   )
   .subscribe();

  return () => {
   subscription.unsubscribe();
  };
 }, [user?.id, queryClient]);

 const filters = [
  { id: 'all', name: 'Tất cả', icon: <Filter className='h-4 w-4' /> },
  {
   id: 'tournament',
   name: 'Giải đấu',
   icon: <Trophy className='h-4 w-4' />,
  },
  {
   id: 'challenge',
   name: 'Thách đấu',
   icon: <Swords className='h-4 w-4' />,
  },
  {
   id: 'checkin',
   name: 'Check-in',
   icon: <CalendarCheck className='h-4 w-4' />,
  },
  { id: 'video', name: 'Video', icon: <Video className='h-4 w-4' /> },
  { id: 'registration', name: 'Đăng ký', icon: <Gift className='h-4 w-4' /> },
  {
   id: 'decay',
   name: 'Giảm điểm',
   icon: <TrendingDown className='h-4 w-4' />,
  },
 ];

 // Remove status filters since SPA transactions are always completed

 const getTransactionIcon = (type: string) => {
  switch (type) {
   case 'tournament':
    return <Trophy className='h-4 w-4 text-warning-600' />;
   case 'challenge':
    return <Swords className='h-4 w-4 text-error-600' />;
   case 'checkin':
    return <CalendarCheck className='h-4 w-4 text-success-600' />;
   case 'video':
    return <Video className='h-4 w-4 text-primary-600' />;
   case 'registration':
    return <Gift className='h-4 w-4 text-info-600' />;
   case 'decay':
    return <TrendingDown className='h-4 w-4 text-neutral-600' />;
   default:
    return <Plus className='h-4 w-4 text-neutral-600' />;
  }
 };

 const getTransactionTypeName = (type: string) => {
  switch (type) {
   case 'tournament':
    return 'Giải đấu';
   case 'challenge':
    return 'Thách đấu';
   case 'checkin':
    return 'Check-in';
   case 'video':
    return 'Video';
   case 'registration':
    return 'Đăng ký';
   case 'decay':
    return 'Giảm điểm';
   default:
    return type;
  }
 };

 const getSourceColor = (type: string) => {
  switch (type) {
   case 'tournament':
    return 'text-warning-600 bg-warning-100';
   case 'challenge':
    return 'text-error-600 bg-error-100';
   case 'checkin':
    return 'text-success-600 bg-success-100';
   case 'video':
    return 'text-primary-600 bg-primary-100';
   case 'registration':
    return 'text-info-600 bg-info-100';
   case 'decay':
    return 'text-neutral-600 bg-neutral-100';
   default:
    return 'text-neutral-600 bg-neutral-100';
  }
 };

 const formatPoints = (points: number) => {
  return `${points >= 0 ? '+' : ''}${points.toLocaleString('vi-VN')} SPA`;
 };

 const filteredTransactions = transactions
  .filter(transaction => {
   const matchesSearch =
    transaction.description
     .toLowerCase()
     .includes(searchTerm.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase());

   const matchesTypeFilter =
    selectedFilter === 'all' || transaction.source_type === selectedFilter;

   return matchesSearch && matchesTypeFilter;
  })
  .sort(
   (a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

 const exportTransactions = () => {
  const csvContent =
   'data:text/csv;charset=utf-8,' +
   'Thời gian,Loại,Mô tả,Điểm\n' +
   filteredTransactions
    .map(
     t =>
      `${new Date(t.created_at).toLocaleString('vi-VN')},${getTransactionTypeName(t.source_type)},${t.description},${t.points_earned}`
    )
    .join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'spa_transactions.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
 };

 if (isLoading) {
  return (
   <div className='flex items-center justify-center py-8'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
   </div>
  );
 }

 return (
  <div className='space-y-6'>
   {/* Filters and Search */}
   <Card>
    <CardContent className='pt-6'>
     <div className='flex flex-col md:flex-row gap-4'>
      <div className='flex-1'>
       <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
        <Input
         placeholder='Tìm kiếm giao dịch...'
         value={searchTerm}
         onChange={e => setSearchTerm(e.target.value)}
         className='pl-12'
        />
       </div>
      </div>

      <Button variant='outline' onClick={exportTransactions}>
       <Download className='h-4 w-4 mr-2' />
       Xuất báo cáo
      </Button>
     </div>

     <div className='flex flex-wrap gap-2 mt-4'>
      {filters.map(filter => (
       <Button
        key={filter.id}
        onClick={() => setSelectedFilter(filter.id)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-body-small-medium transition-colors ${
         selectedFilter === filter.id
          ? 'bg-primary-100 text-primary-800'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
        }`}
       >
        {filter.icon}
        {filter.name}
       </Button>
      ))}
     </div>
    </CardContent>
   </Card>

   {/* SPA Transactions List */}
   <Card>
    <CardHeader>
     <CardTitle>
      Lịch sử SPA Points ({filteredTransactions.length})
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className='space-y-4'>
      {filteredTransactions.map(transaction => (
       <div
        key={transaction.id}
        className='flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow'
       >
        {/* Transaction Icon */}
        <div
         className={`p-2 rounded-full ${getSourceColor(transaction.source_type)}`}
        >
         {getTransactionIcon(transaction.source_type)}
        </div>

        {/* Transaction Details */}
        <div className='flex-1 min-w-0'>
         <div className='flex items-center gap-2 mb-1'>
          <span className='font-medium'>
           {getTransactionTypeName(transaction.source_type)}
          </span>
          {transaction.points_earned > 0 ? (
           <Badge className='bg-success-100 text-success-800 text-xs'>
            🏆 Nhận điểm
           </Badge>
          ) : (
           <Badge className='bg-error-100 text-error-800 text-xs'>
            📉 Mất điểm
           </Badge>
          )}
         </div>

         <p className='text-body-small-neutral mb-1'>
          {transaction.description}
         </p>

         <div className='flex items-center gap-4 text-caption-neutral'>
          <div className='flex items-center gap-1'>
           <Calendar className='h-3 w-3' />
           <span>
            {new Date(transaction.created_at).toLocaleDateString(
             'vi-VN'
            )}{' '}
            {new Date(transaction.created_at).toLocaleTimeString(
             'vi-VN',
             { hour: '2-digit', minute: '2-digit' }
            )}
           </span>
          </div>
          {transaction.source_id && (
           <span>ID: {transaction.source_id.slice(0, 8)}...</span>
          )}
         </div>
        </div>

        {/* Points */}
        <div className='text-right'>
         <div
          className={`text-body-large font-bold ${
           transaction.points_earned >= 0
            ? 'text-success-600'
            : 'text-error-600'
          }`}
         >
          {formatPoints(transaction.points_earned)}
         </div>
        </div>
       </div>
      ))}

      {filteredTransactions.length === 0 && !isLoading && (
       <div className='text-center py-8 text-neutral-500'>
        <Trophy className='h-12 w-12 mx-auto mb-3 opacity-50' />
        <p>Chưa có giao dịch SPA nào</p>
        <p className='text-sm'>
         Tham gia thách đấu hoặc giải đấu để bắt đầu kiếm SPA points!
        </p>
       </div>
      )}
     </div>
    </CardContent>
   </Card>
  </div>
 );
};
