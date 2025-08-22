import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Plus, 
  Minus, 
  Trophy, 
  Target, 
  Calendar,
  Filter,
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SpaTransaction {
  id: string;
  user_id: string;
  amount: number;
  source_type: string;
  transaction_type: string;
  description: string;
  reference_id?: string;
  status: string;
  metadata?: any;
  created_at: string;
}

interface SpaHistoryTabProps {
  theme: 'light' | 'dark';
}

interface SourceTypeConfig {
  [key: string]: {
    label: string;
    icon: any;
    color: string;
    darkColor: string;
  };
}

const SpaHistoryTab: React.FC<SpaHistoryTabProps> = ({ theme }) => {
  const { user } = useAuth();
  const [currentBalance, setCurrentBalance] = useState(0);
  const [transactions, setTransactions] = useState<SpaTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
  const [showBalance, setShowBalance] = useState(true);
  
  // Enhanced transaction details state
  const [transactionDetails, setTransactionDetails] = useState<{[key: string]: any}>({});

  // Enhanced source type configuration
    const sourceTypeConfig: SourceTypeConfig = {
    milestone_reward: {
      label: 'Thưởng Milestone',
      icon: Trophy,
      color: 'text-yellow-600',
      darkColor: 'text-yellow-400'
    },
    milestone: {
      label: 'Hoàn thành Milestone',
      icon: Trophy,
      color: 'text-yellow-600',
      darkColor: 'text-yellow-400'
    },
    challenge_win: {
      label: 'Thắng thách đấu',
      icon: Target,
      color: 'text-blue-600',
      darkColor: 'text-blue-400'
    },
    daily_bonus: {
      label: 'Thưởng hàng ngày',
      icon: Plus,
      color: 'text-green-600',
      darkColor: 'text-green-400'
    },
    weekly_bonus: {
      label: 'Thưởng hàng tuần',
      icon: Plus,
      color: 'text-green-600',
      darkColor: 'text-green-400'
    },
    rank_bonus: {
      label: 'Thưởng thăng hạng',
      icon: TrendingUp,
      color: 'text-purple-600',
      darkColor: 'text-purple-400'
    },
    tournament_reward: {
      label: 'Thưởng giải đấu',
      icon: Trophy,
      color: 'text-yellow-600',
      darkColor: 'text-yellow-400'
    },
    bonus: {
      label: 'Thưởng thêm',
      icon: Plus,
      color: 'text-green-600',
      darkColor: 'text-green-400'
    },
    special_event: {
      label: 'Sự kiện đặc biệt',
      icon: Trophy,
      color: 'text-purple-600',
      darkColor: 'text-purple-400'
    },
    penalty: {
      label: 'Phạt',
      icon: Minus,
      color: 'text-red-600',
      darkColor: 'text-red-400'
    },
    manual: {
      label: 'Thủ công',
      icon: DollarSign,
      color: 'text-gray-600',
      darkColor: 'text-gray-400'
    },
    legacy: {
      label: 'Lịch sử cũ',
      icon: Calendar,
      color: 'text-gray-600',
      darkColor: 'text-gray-400'
    },
    legacy_award: {
      label: 'Lịch sử cũ',
      icon: Calendar,
      color: 'text-gray-600',
      darkColor: 'text-gray-400'
    },
    account_creation: {
      label: 'Tạo tài khoản',
      icon: Plus,
      color: 'text-green-600',
      darkColor: 'text-green-400'
    }
  };

  // Function to get detailed transaction information
  const getTransactionDetails = async (transaction: SpaTransaction) => {
    if (!transaction.reference_id) return null;
    
    try {
      let details = null;
      
      // Get milestone details
      if (transaction.source_type === 'milestone_reward' || transaction.source_type === 'milestone') {
        const { data: milestone } = await supabase
          .from('milestones')
          .select('name, description, spa_reward, category')
          .eq('id', transaction.reference_id)
          .single();
          
        if (milestone) {
          details = {
            type: 'milestone',
            title: milestone.name,
            description: milestone.description,
            category: milestone.category,
            reward: milestone.spa_reward
          };
        }
      }
      
      // Get rank verification details
      else if (transaction.source_type === 'rank_verification') {
        const { data: rankRequest } = await supabase
          .from('rank_requests')
          .select('requested_rank, status, verification_notes')
          .eq('id', transaction.reference_id)
          .single();
          
        if (rankRequest) {
          details = {
            type: 'rank_verification',
            title: `Xác thực hạng ${rankRequest.requested_rank}`,
            description: `Thưởng xác thực hạng ${rankRequest.requested_rank}`,
            status: rankRequest.status,
            notes: rankRequest.verification_notes
          };
        }
      }
      
      // Get tournament details
      else if (transaction.source_type === 'tournament_prize') {
        const { data: tournament } = await supabase
          .from('tournaments')
          .select('name, description, prizes')
          .eq('id', transaction.reference_id)
          .single();
          
        if (tournament) {
          details = {
            type: 'tournament',
            title: tournament.name,
            description: `Giải thưởng từ giải đấu ${tournament.name}`,
            prizes: tournament.prizes
          };
        }
      }
      
      // Get challenge details
      else if (transaction.source_type === 'challenge_reward') {
        const { data: challenge } = await supabase
          .from('challenges')
          .select(`
            id,
            challenger_id,
            challenged_id,
            challenger_spa_reward,
            challenged_spa_reward,
            status,
            profiles_challenger:profiles!challenges_challenger_id_fkey(display_name),
            profiles_challenged:profiles!challenges_challenged_id_fkey(display_name)
          `)
          .eq('id', transaction.reference_id)
          .single();
          
        if (challenge) {
          const isChallenger = challenge.challenger_id === transaction.user_id;
          const opponent = isChallenger 
            ? challenge.profiles_challenged?.display_name 
            : challenge.profiles_challenger?.display_name;
            
          details = {
            type: 'challenge',
            title: `Thắng thách đấu vs ${opponent || 'Đối thủ'}`,
            description: `Thưởng ${transaction.amount} SPA từ thách đấu`,
            opponent: opponent,
            isChallenger: isChallenger
          };
        }
      }
      
      return details;
    } catch (error) {
      console.error('Error getting transaction details:', error);
      return null;
    }
  };

  const fetchSpaData = async (showRefreshIndicator = false) => {
    if (!user?.id) return;
    
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch current SPA balance
      const { data: rankingData } = await supabase
        .from('player_rankings')
        .select('spa_points')
        .eq('user_id', user.id)
        .single();

      setCurrentBalance(rankingData?.spa_points || 0);

      // Fetch transaction history from multiple sources

      // 1. Fetch from spa_points_log (most detailed)
      const { data: pointsLogData, error: pointsLogError } = await supabase
        .from('spa_points_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // 2. Fetch from spa_transactions (legacy/fallback)
      const { data: transactionData, error } = await supabase
        .from('spa_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error || pointsLogError) {
        console.error('Error fetching SPA data:', { error, pointsLogError });
        return;
      }

      // Convert and merge data sources into unified format
      const allTransactions: SpaTransaction[] = [];

      // 1. Process spa_points_log (primary source - most detailed)
      if (pointsLogData && pointsLogData.length > 0) {
        pointsLogData.forEach(log => {
          allTransactions.push({
            id: `log_${log.id}`,
            user_id: log.user_id,
            amount: log.points,
            source_type: log.category || 'milestone',
            transaction_type: 'credit',
            description: log.description || `+${log.points} SPA`,
            reference_id: log.reference_id,
            status: 'completed',
            metadata: { source: 'spa_points_log', original: log },
            created_at: log.created_at
          });
        });
      }

      // 2. Process spa_transactions (only if no detailed records found)
      if (transactionData && allTransactions.length === 0) {
        transactionData.forEach(tx => {
          allTransactions.push({
            id: tx.id,
            user_id: tx.user_id,
            amount: tx.amount,
            source_type: tx.source_type || 'legacy',
            transaction_type: tx.transaction_type || 'credit',
            description: tx.description,
            reference_id: tx.reference_id,
            status: tx.status,
            metadata: { source: 'spa_transactions', original: tx },
            created_at: tx.created_at
          });
        });
      }

      // Sort by created_at desc
      allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(allTransactions);
      
      // Fetch detailed information for transactions with reference_id
      const detailsMap: {[key: string]: any} = {};
      for (const transaction of transactionData || []) {
        if (transaction.reference_id) {
          const details = await getTransactionDetails(transaction);
          if (details) {
            detailsMap[transaction.id] = details;
          }
        }
      }
      setTransactionDetails(detailsMap);
    } catch (error) {
      console.error('Error fetching SPA data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSpaData();
  }, [user?.id]);

  const filteredTransactions = transactions.filter(transaction => {
    if (filterType !== 'all' && transaction.source_type !== filterType) return false;
    if (transactionTypeFilter !== 'all') {
      // Dựa vào amount và transaction_type để filter
      if (transactionTypeFilter === 'credit' && transaction.amount <= 0) return false;
      if (transactionTypeFilter === 'debit' && transaction.amount >= 0) return false;
    }
    return true;
  });

  const totalIncome = transactions
    .filter(t => t.amount > 0 && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.amount < 0 && t.status === 'completed')  
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const getSourceConfig = (sourceType: string) => {
    return sourceTypeConfig[sourceType] || {
      label: 'Giao dịch khác',
      icon: DollarSign,
      color: 'text-gray-600',
      darkColor: 'text-gray-400'
    };
  };

  // Get enhanced transaction description
  const getTransactionDescription = (transaction: SpaTransaction) => {
    const details = transactionDetails[transaction.id];
    
    if (details) {
      return details.title || details.description;
    }
    
    // Fallback to original description or enhanced description based on source_type
    if (transaction.description) {
      return transaction.description;
    }
    
    // Generate description based on source_type and metadata
    const config = getSourceConfig(transaction.source_type);
    return `${config.label} (+${transaction.amount} SPA)`;
  };

  // Get transaction subtitle/additional info
  const getTransactionSubtitle = (transaction: SpaTransaction) => {
    const details = transactionDetails[transaction.id];
    
    if (details) {
      switch (details.type) {
        case 'milestone':
          return `${details.category || 'Milestone'} • ${details.description || ''}`;
        case 'rank_verification':
          return `Hạng được xác thực • ${details.status || ''}`;
        case 'tournament':
          return `Giải đấu • ${details.description || ''}`;
        case 'challenge':
          return `Thách đấu • ${details.opponent ? `vs ${details.opponent}` : ''}`;
        default:
          return details.description || '';
      }
    }
    
    // Fallback for transactions without detailed info
    if (transaction.metadata) {
      if (transaction.metadata.milestone_type) {
        return `Loại: ${transaction.metadata.milestone_type}`;
      }
      if (transaction.metadata.created_reason) {
        return transaction.metadata.created_reason;
      }
    }
    
    return `Giao dịch ${transaction.source_type || 'SPA'}`;
  };

  const handleRefresh = () => {
    fetchSpaData(true);
  };

  const formatAmount = (amount: number) => {
    const isPositive = amount > 0;
    const prefix = isPositive ? '+' : '';
    const color = isPositive 
      ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600')
      : (theme === 'dark' ? 'text-red-400' : 'text-red-600');
    
    return (
      <span className={`font-semibold ${color}`}>
        {prefix}{amount} SPA
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Đang tải lịch sử SPA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Current Balance Card */}
      <Card className={
        theme === 'dark'
          ? 'bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border-amber-700/50'
          : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
      }>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Số dư SPA hiện tại</div>
              <div className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-amber-300' : 'text-amber-600'
              }`}>
                {showBalance ? `${currentBalance.toLocaleString()} SPA` : '••••••'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="p-2"
              >
                {showBalance ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
              <div className={`p-3 rounded-full ${
                theme === 'dark' ? 'bg-amber-800/30' : 'bg-amber-100'
              }`}>
                <DollarSign className={`w-6 h-6 ${
                  theme === 'dark' ? 'text-amber-300' : 'text-amber-600'
                }`} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={
          theme === 'dark'
            ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-700/50'
            : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
        }>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Tổng thu</div>
                <div className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-green-300' : 'text-green-600'
                }`}>
                  +{totalIncome.toLocaleString()}
                </div>
              </div>
              <TrendingUp className={`w-5 h-5 ${
                theme === 'dark' ? 'text-green-300' : 'text-green-600'
              }`} />
            </div>
          </CardContent>
        </Card>

        <Card className={
          theme === 'dark'
            ? 'bg-gradient-to-r from-red-900/20 to-pink-900/20 border-red-700/50'
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
        }>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Tổng chi</div>
                <div className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-red-300' : 'text-red-600'
                }`}>
                  -{totalExpense.toLocaleString()}
                </div>
              </div>
              <TrendingDown className={`w-5 h-5 ${
                theme === 'dark' ? 'text-red-300' : 'text-red-600'
              }`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm outline-none transition ${
              theme === 'dark'
                ? 'bg-slate-800/70 border-slate-600/60 text-slate-100 focus:border-amber-400'
                : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
            }`}
          >
            <option value="all">Tất cả nguồn</option>
            {Object.entries(sourceTypeConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          <select
            value={transactionTypeFilter}
            onChange={(e) => setTransactionTypeFilter(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm outline-none transition ${
              theme === 'dark'
                ? 'bg-slate-800/70 border-slate-600/60 text-slate-100 focus:border-amber-400'
                : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
            }`}
          >
            <option value="all">Tất cả loại</option>
            <option value="credit">Thu nhập</option>
            <option value="debit">Chi tiêu</option>
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <Card className={
            theme === 'dark'
              ? 'bg-slate-900/40 border-slate-700/50'
              : 'bg-white border-slate-200'
          }>
            <CardContent className="p-6 text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <div className="text-muted-foreground">
                {filterType === 'all' 
                  ? 'Chưa có giao dịch SPA nào'
                  : `Chưa có giao dịch ${getSourceConfig(filterType).label}`
                }
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => {
            const sourceConfig = getSourceConfig(transaction.source_type);
            const SourceIcon = sourceConfig.icon;
            const sourceColor = theme === 'dark' ? sourceConfig.darkColor : sourceConfig.color;
            
            return (
              <Card key={transaction.id} className={
                theme === 'dark'
                  ? 'bg-slate-900/40 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/40 transition-colors'
                  : 'bg-white border-slate-200 hover:bg-slate-50 transition-colors'
              }>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'
                      }`}>
                        <SourceIcon className={`w-4 h-4 ${sourceColor}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {getTransactionDescription(transaction)}
                          </span>
                          {transaction.status === 'pending' && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              theme === 'dark' 
                                ? 'bg-yellow-900/30 text-yellow-300' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              Đang xử lý
                            </span>
                          )}
                          {transaction.status === 'failed' && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              theme === 'dark' 
                                ? 'bg-red-900/30 text-red-300' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              Thất bại
                            </span>
                          )}
                          {transaction.status === 'completed' && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              theme === 'dark' 
                                ? 'bg-green-900/30 text-green-300' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              Hoàn thành
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground mb-2">
                          {getTransactionSubtitle(transaction)}
                        </div>

                        {transaction.reference_id && (
                          <div className="text-xs text-muted-foreground mb-1">
                            ID: {transaction.reference_id.slice(0, 12)}...
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(transaction.created_at), {
                            addSuffix: true,
                            locale: vi
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {formatAmount(transaction.amount)}
                    </div>
                  </div>

                  {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                    <div className={`mt-3 p-2 rounded text-xs ${
                      theme === 'dark' 
                        ? 'bg-slate-800/30 text-slate-300' 
                        : 'bg-slate-50 text-slate-600'
                    }`}>
                      <details>
                        <summary className="cursor-pointer">Chi tiết giao dịch</summary>
                        <pre className="mt-2 whitespace-pre-wrap text-xs">
                          {JSON.stringify(transaction.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SpaHistoryTab;
