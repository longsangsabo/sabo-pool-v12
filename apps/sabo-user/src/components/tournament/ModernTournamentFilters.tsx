import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Calendar,
  MapPin,
  Trophy,
  DollarSign,
  Users,
  Zap,
} from 'lucide-react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';

interface FilterPill {
  id: string;
  label: string;
  value: string;
  type: 'status' | 'tier' | 'format' | 'date';
  color: string;
}

interface ModernTournamentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  // Additional filter props can be added here
  className?: string;
}

const ModernTournamentFilters: React.FC<ModernTournamentFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  className = '',
}) => {
  const { isMobile } = useOptimizedResponsive();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activePills, setActivePills] = useState<FilterPill[]>([]);

  // Quick filter options
  const quickFilters = [
    {
      id: 'hot',
      label: '🔥 HOT',
      value: 'registration_open',
      color: 'bg-red-500',
    },
    {
      id: 'premium',
      label: '⭐ Premium',
      value: 'premium',
      color: 'bg-purple-500',
    },
    { id: 'today', label: '📅 Hôm nay', value: 'today', color: 'bg-blue-500' },
    { id: 'free', label: '💫 Miễn phí', value: 'free', color: 'bg-green-500' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái', icon: '🎯' },
    { value: 'registration_open', label: 'Đang mở đăng ký', icon: '🟢' },
    { value: 'ongoing', label: 'Đang diễn ra', icon: '🔴' },
    { value: 'registration_closed', label: 'Đóng đăng ký', icon: '🟡' },
    { value: 'completed', label: 'Hoàn thành', icon: '✅' },
  ];

  const addFilterPill = (filter: Omit<FilterPill, 'id'>) => {
    const pill: FilterPill = {
      ...filter,
      id: `${filter.type}-${filter.value}`,
    };
    if (!activePills.find(p => p.id === pill.id)) {
      setActivePills(prev => [...prev, pill]);
    }
  };

  const removeFilterPill = (id: string) => {
    setActivePills(prev => prev.filter(p => p.id !== id));
  };

  const clearAllFilters = () => {
    setActivePills([]);
    onSearchChange('');
    onStatusFilterChange('all');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className='relative'>
        <div
          className={`
          flex items-center gap-3 p-3 bg-white dark:bg-gray-800 
          rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700
          ${isMobile ? 'flex-col space-y-3' : ''}
        `}
        >
          {/* Search Input */}
          <div className={`relative flex-1 ${isMobile ? 'w-full' : ''}`}>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <Input
              placeholder='Tìm kiếm giải đấu...'
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className={`
                pl-10 border-0 bg-gray-50 dark:bg-gray-700 
                focus-visible:ring-2 focus-visible:ring-primary/20
                ${isMobile ? 'h-12' : 'h-10'}
              `}
            />
            {searchTerm && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onSearchChange('')}
                className='absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0'
              >
                <X className='w-3 h-3' />
              </Button>
            )}
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger
              className={`
              ${isMobile ? 'w-full h-12' : 'w-48 h-10'} 
              border-0 bg-gray-50 dark:bg-gray-700
            `}
            >
              <SelectValue placeholder='Trạng thái' />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className='flex items-center gap-2'>
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Advanced Filters Toggle */}
          <Button
            variant='outline'
            size={isMobile ? 'default' : 'sm'}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`
              border-gray-300 hover:border-primary hover:bg-primary/5
              ${isMobile ? 'w-full h-12' : 'h-10'}
              ${showAdvancedFilters ? 'bg-primary/10 border-primary' : ''}
            `}
          >
            <SlidersHorizontal className='w-4 h-4 mr-2' />
            Bộ lọc
            {activePills.length > 0 && (
              <Badge className='ml-2 bg-primary text-white text-xs'>
                {activePills.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Filter Pills */}
      <div className='flex flex-wrap gap-2'>
        {quickFilters.map(filter => (
          <Button
            key={filter.id}
            variant='outline'
            size='sm'
            onClick={() =>
              addFilterPill({
                label: filter.label,
                value: filter.value,
                type: 'status',
                color: filter.color,
              })
            }
            className={`
              rounded-full border-gray-300 hover:border-primary 
              hover:bg-primary/5 transition-all duration-200
              ${isMobile ? 'text-xs px-3 py-1.5' : 'text-sm'}
            `}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Active Filter Pills */}
      {activePills.length > 0 && (
        <div className='flex flex-wrap gap-2 items-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400 font-medium'>
            Đang lọc:
          </span>
          {activePills.map(pill => (
            <Badge
              key={pill.id}
              className={`
                ${pill.color} text-white border-0 px-3 py-1.5 
                flex items-center gap-2 rounded-full shadow-sm
              `}
            >
              <span className='text-xs font-medium'>{pill.label}</span>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => removeFilterPill(pill.id)}
                className='h-4 w-4 p-0 hover:bg-white/20 rounded-full'
              >
                <X className='w-3 h-3' />
              </Button>
            </Badge>
          ))}
          <Button
            variant='ghost'
            size='sm'
            onClick={clearAllFilters}
            className='text-gray-500 hover:text-gray-700 text-xs'
          >
            Xóa tất cả
          </Button>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <Card className='border-gray-200 dark:border-gray-700 shadow-lg'>
          <CardContent className='p-4'>
            <div
              className={`
              grid gap-4 
              ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}
            `}
            >
              {/* Entry Fee Range */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                  <DollarSign className='w-4 h-4' />
                  Phí tham gia
                </label>
                <Select>
                  <SelectTrigger className='h-9'>
                    <SelectValue placeholder='Chọn mức phí' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='free'>Miễn phí</SelectItem>
                    <SelectItem value='low'>Dưới 100k</SelectItem>
                    <SelectItem value='medium'>100k - 500k</SelectItem>
                    <SelectItem value='high'>Trên 500k</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Game Format */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                  <Trophy className='w-4 h-4' />
                  Thể thức
                </label>
                <Select>
                  <SelectTrigger className='h-9'>
                    <SelectValue placeholder='Loại bi-a' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='8_ball'>8-Ball</SelectItem>
                    <SelectItem value='9_ball'>9-Ball</SelectItem>
                    <SelectItem value='10_ball'>10-Ball</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Participants */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                  <Users className='w-4 h-4' />
                  Quy mô
                </label>
                <Select>
                  <SelectTrigger className='h-9'>
                    <SelectValue placeholder='Số người tham gia' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='small'>8-16 người</SelectItem>
                    <SelectItem value='medium'>17-32 người</SelectItem>
                    <SelectItem value='large'>33-64 người</SelectItem>
                    <SelectItem value='xlarge'>65+ người</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                  <Calendar className='w-4 h-4' />
                  Thời gian
                </label>
                <Select>
                  <SelectTrigger className='h-9'>
                    <SelectValue placeholder='Khoảng thời gian' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='today'>Hôm nay</SelectItem>
                    <SelectItem value='week'>Tuần này</SelectItem>
                    <SelectItem value='month'>Tháng này</SelectItem>
                    <SelectItem value='quarter'>3 tháng tới</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Apply Filters */}
            <div className='flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
              <Button
                size='sm'
                className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
              >
                <Zap className='w-4 h-4 mr-2' />
                Áp dụng bộ lọc
              </Button>
              <Button variant='outline' size='sm' onClick={clearAllFilters}>
                Đặt lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModernTournamentFilters;
