import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Message, MessageFilters } from '@/types/message';
import { useMessages } from '@/hooks/useMessages';
import { MessageList } from './MessageList';

export const MessageSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<MessageFilters>({
    type: undefined,
    status: undefined,
    priority: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  });

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const { searchMessages } = useMessages();

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    setSearchPerformed(true);

    try {
      // Prepare filters with date range
      const searchFilters: MessageFilters = {
        ...filters,
        dateFrom: dateRange.from?.toISOString(),
        dateTo: dateRange.to?.toISOString(),
      };

      const results = await searchMessages(searchQuery, searchFilters);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (key: keyof MessageFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: undefined,
      status: undefined,
      priority: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
    setDateRange({ from: undefined, to: undefined });
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchPerformed(false);
    clearFilters();
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.type) count++;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (dateRange.from || dateRange.to) count++;
    return count;
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tìm kiếm tin nhắn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tiêu đề, nội dung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
            {(searchQuery || searchPerformed) && (
              <Button variant="outline" onClick={clearSearch}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filters Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Bộ lọc
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
            
            {getActiveFiltersCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              {/* Message Type Filter */}
              <div className="space-y-2">
                <Label>Loại tin nhắn</Label>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="direct">Tin nhắn thường</SelectItem>
                    <SelectItem value="system">Hệ thống</SelectItem>
                    <SelectItem value="tournament">Giải đấu</SelectItem>
                    <SelectItem value="announcement">Thông báo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="unread">Chưa đọc</SelectItem>
                    <SelectItem value="read">Đã đọc</SelectItem>
                    <SelectItem value="archived">Đã lưu trữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <Label>Độ ưu tiên</Label>
                <Select
                  value={filters.priority || 'all'}
                  onValueChange={(value) => handleFilterChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="normal">Bình thường</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="urgent">Khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label>Khoảng thời gian</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                            {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy", { locale: vi })
                        )
                      ) : (
                        "Chọn ngày"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchPerformed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Kết quả tìm kiếm</span>
              {searchResults.length > 0 && (
                <Badge variant="secondary">
                  {searchResults.length} kết quả
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Đang tìm kiếm...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <MessageList 
                messages={searchResults} 
                type="inbox"
              />
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-body-large font-medium mb-2">Không tìm thấy kết quả</h3>
                <p className="text-muted-foreground mb-4">
                  Không có tin nhắn nào khớp với từ khóa "{searchQuery}"
                </p>
                <div className="space-y-2 text-body-small text-muted-foreground">
                  <p>Gợi ý:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Kiểm tra lại chính tả</li>
                    <li>Sử dụng từ khóa khác</li>
                    <li>Thử bỏ một số bộ lọc</li>
                    <li>Tìm kiếm theo nội dung thay vì tiêu đề</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Instructions */}
      {!searchPerformed && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-body-large font-medium mb-2">Tìm kiếm tin nhắn</h3>
            <p className="text-muted-foreground mb-6">
              Nhập từ khóa để tìm kiếm trong tiêu đề và nội dung tin nhắn
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              <div className="space-y-2">
                <h4 className="font-medium">Bạn có thể tìm kiếm:</h4>
                <ul className="text-body-small text-muted-foreground space-y-1">
                  <li>• Theo tiêu đề tin nhắn</li>
                  <li>• Theo nội dung tin nhắn</li>
                  <li>• Theo tên người gửi</li>
                  <li>• Theo loại tin nhắn</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Sử dụng bộ lọc để:</h4>
                <ul className="text-body-small text-muted-foreground space-y-1">
                  <li>• Lọc theo trạng thái đã đọc/chưa đọc</li>
                  <li>• Lọc theo độ ưu tiên</li>
                  <li>• Lọc theo khoảng thời gian</li>
                  <li>• Lọc theo loại tin nhắn</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MessageSearch;
