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
  const [transactions, setTransactions] = useState<SpaTransaction[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all');
  const [showBalance, setShowBalance] = useState(true);

  const sourceTypeConfig: SourceTypeConfig = {
    milestone: {
      label: 'Mốc thành tích',
      icon: Trophy,
      color: 'text-purple-600',
      darkColor: 'text-purple-400'
    },
    rank_verification: {
      label: 'Xác thực hạng',
      icon: Target,
      color: 'text-blue-600',
      darkColor: 'text-blue-400'
    },
    challenge: {
      label: 'Thách đấu',
      icon: Target,
      color: 'text-orange-600',
      darkColor: 'text-orange-400'
    },
    tournament: {
      label: 'Giải đấu',
      icon: Trophy,
      color: 'text-green-600',
      darkColor: 'text-green-400'
    },
    bonus: {
      label: 'Thưởng',
      icon: Plus,
      color: 'text-emerald-600',
      darkColor: 'text-emerald-400'
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
    other: {
      label: 'Khác',
      icon: DollarSign,
      color: 'text-gray-600',
      darkColor: 'text-gray-400'
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

      // Fetch transaction history
      const { data: transactionData, error } = await supabase
        .from('spa_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching SPA transactions:', error);
        return;
      }

      setTransactions(transactionData || []);
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
    return sourceTypeConfig[sourceType] || sourceTypeConfig.other;
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
                            {sourceConfig.label}
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
                          {transaction.description || 'Giao dịch SPA'}
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
