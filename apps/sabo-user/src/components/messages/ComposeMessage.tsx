import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select';
import {
 Command,
 CommandEmpty,
 CommandGroup,
 CommandInput,
 CommandItem,
} from '@/components/ui/command';
import {
 Popover,
 PopoverContent,
 PopoverTrigger,
} from '@/components/ui/popover';
import { 
 Send, 
 X, 
 User, 
 Search,
 Check,
 AlertCircle,
 Loader2
} from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { MessageService } from '@/services/messageService';
import { SendMessageData } from '@/types/message';

interface ComposeMessageProps {
 isOpen: boolean;
 onClose: () => void;
 onSent?: () => void;
 prefilledRecipient?: string;
 prefilledSubject?: string;
 prefilledContent?: string;
}

interface User {
 user_id: string;
 full_name: string;
 display_name?: string;
 avatar_url?: string;
}

export const ComposeMessage: React.FC<ComposeMessageProps> = ({
 isOpen,
 onClose,
 onSent,
 prefilledRecipient,
 prefilledSubject,
 prefilledContent
}) => {
 const [formData, setFormData] = useState<SendMessageData>({
  recipient_id: prefilledRecipient || '',
  subject: prefilledSubject || '',
  content: prefilledContent || '',
  message_type: 'direct',
  priority: 'normal'
 });
 
 const [recipientSearch, setRecipientSearch] = useState('');
 const [searchResults, setSearchResults] = useState<User[]>([]);
 const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
 const [isSearching, setIsSearching] = useState(false);
 const [isSending, setIsSending] = useState(false);
 const [showRecipientSearch, setShowRecipientSearch] = useState(false);
 const [errors, setErrors] = useState<Record<string, string>>({});

 const { sendMessage } = useMessages();

 // Search for users
 const searchUsers = async (query: string) => {
  if (query.length < 2) {
   setSearchResults([]);
   return;
  }

  setIsSearching(true);
  try {
   const users = await MessageService.searchUsers(query, 10);
   setSearchResults(users);
  } catch (error) {
   console.error('Error searching users:', error);
   setSearchResults([]);
  } finally {
   setIsSearching(false);
  }
 };

 // Handle recipient search
 useEffect(() => {
  const timeoutId = setTimeout(() => {
   if (recipientSearch) {
    searchUsers(recipientSearch);
   }
  }, 300);

  return () => clearTimeout(timeoutId);
 }, [recipientSearch]);

 // Handle recipient selection
 const handleRecipientSelect = (user: User) => {
  setSelectedRecipient(user);
  setFormData(prev => ({ ...prev, recipient_id: user.user_id }));
  setShowRecipientSearch(false);
  setRecipientSearch('');
  setErrors(prev => ({ ...prev, recipient_id: '' }));
 };

 // Remove selected recipient
 const handleRemoveRecipient = () => {
  setSelectedRecipient(null);
  setFormData(prev => ({ ...prev, recipient_id: '' }));
 };

 // Form validation
 const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.recipient_id) {
   newErrors.recipient_id = 'Vui lòng chọn người nhận';
  }

  if (!formData.content.trim()) {
   newErrors.content = 'Vui lòng nhập nội dung tin nhắn';
  }

  if (formData.content.length > 2000) {
   newErrors.content = 'Nội dung tin nhắn không được quá 2000 ký tự';
  }

  if (formData.subject && formData.subject.length > 200) {
   newErrors.subject = 'Tiêu đề không được quá 200 ký tự';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
 };

 // Handle form submission
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
   return;
  }

  setIsSending(true);
  
  try {
   const success = await sendMessage(formData);
   
   if (success) {
    onSent?.();
    onClose();
    // Reset form
    setFormData({
     recipient_id: '',
     subject: '',
     content: '',
     message_type: 'direct',
     priority: 'normal'
    });
    setSelectedRecipient(null);
   }
  } catch (error) {
   console.error('Error sending message:', error);
  } finally {
   setIsSending(false);
  }
 };

 // Handle input changes
 const handleInputChange = (field: keyof SendMessageData, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  if (errors[field]) {
   setErrors(prev => ({ ...prev, [field]: '' }));
  }
 };

 // Get priority label
 const getPriorityLabel = (priority: string) => {
  switch (priority) {
   case 'urgent': return 'Khẩn cấp';
   case 'high': return 'Cao';
   case 'low': return 'Thấp';
   default: return 'Bình thường';
  }
 };

 // Get message type label
 const getMessageTypeLabel = (type: string) => {
  switch (type) {
   case 'tournament': return 'Giải đấu';
   case 'announcement': return 'Thông báo';
   default: return 'Tin nhắn thường';
  }
 };

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
     <DialogTitle className="flex items-center gap-2">
      <Send className="h-5 w-5" />
      Soạn tin nhắn mới
     </DialogTitle>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-6">
     {/* Recipient Selection */}
     <div className="space-y-2">
      <Label>Người nhận *</Label>
      
      {selectedRecipient ? (
       <div className="flex items-center gap-2 p-3 bg-primary-50 border border-primary-200 rounded-lg">
        <Avatar className="h-8 w-8">
         <AvatarImage src={selectedRecipient.avatar_url} />
         <AvatarFallback>
          {selectedRecipient.full_name.charAt(0).toUpperCase()}
         </AvatarFallback>
        </Avatar>
        <div className="flex-1">
         <p className="text-body-small-medium">
          {selectedRecipient.display_name || selectedRecipient.full_name}
         </p>
         <p className="text-caption text-muted-foreground">
          {selectedRecipient.full_name}
         </p>
        </div>
        <Button
         type="button"
         variant="ghost"
         
         onClick={handleRemoveRecipient}
         className="h-6 w-6"
        >
         <X className="h-4 w-4" />
        </Button>
       </div>
      ) : (
       <Popover open={showRecipientSearch} onOpenChange={setShowRecipientSearch}>
        <PopoverTrigger asChild>
         <Button
          type="button"
          variant="outline"
          className="w-full justify-start text-left font-normal"
         >
          <User className="h-4 w-4 mr-2" />
          Chọn người nhận...
         </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
         <Command>
          <CommandInput
           placeholder="Tìm kiếm người dùng..."
           value={recipientSearch}
           onValueChange={setRecipientSearch}
          />
          <CommandEmpty>
           {isSearching ? (
            <div className="flex items-center justify-center py-6">
             <Loader2 className="h-4 w-4 animate-spin mr-2" />
             Đang tìm kiếm...
            </div>
           ) : (
            'Không tìm thấy người dùng nào'
           )}
          </CommandEmpty>
          <CommandGroup>
           {searchResults.map((user) => (
            <CommandItem
             key={user.user_id}
             onSelect={() => handleRecipientSelect(user)}
             className="flex items-center gap-2"
            >
             <Avatar className="h-6 w-6">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="text-caption">
               {user.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
             </Avatar>
             <div className="flex-1">
              <p className="text-body-small-medium">
               {user.display_name || user.full_name}
              </p>
              {user.display_name && (
               <p className="text-caption text-muted-foreground">
                {user.full_name}
               </p>
              )}
             </div>
             <Check className="h-4 w-4" />
            </CommandItem>
           ))}
          </CommandGroup>
         </Command>
        </PopoverContent>
       </Popover>
      )}
      
      {errors.recipient_id && (
       <p className="text-body-small text-destructive flex items-center gap-1">
        <AlertCircle className="h-4 w-4" />
        {errors.recipient_id}
       </p>
      )}
     </div>

     {/* Message Type and Priority */}
     <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
       <Label>Loại tin nhắn</Label>
       <Select
        value={formData.message_type}
        onValueChange={(value: any) => handleInputChange('message_type', value)}
       >
        <SelectTrigger>
         <SelectValue />
        </SelectTrigger>
        <SelectContent>
         <SelectItem value="direct">Tin nhắn thường</SelectItem>
         <SelectItem value="tournament">Giải đấu</SelectItem>
         <SelectItem value="announcement">Thông báo</SelectItem>
        </SelectContent>
       </Select>
      </div>

      <div className="space-y-2">
       <Label>Độ ưu tiên</Label>
       <Select
        value={formData.priority}
        onValueChange={(value: any) => handleInputChange('priority', value)}
       >
        <SelectTrigger>
         <SelectValue />
        </SelectTrigger>
        <SelectContent>
         <SelectItem value="low">Thấp</SelectItem>
         <SelectItem value="normal">Bình thường</SelectItem>
         <SelectItem value="high">Cao</SelectItem>
         <SelectItem value="urgent">Khẩn cấp</SelectItem>
        </SelectContent>
       </Select>
      </div>
     </div>

     {/* Subject */}
     <div className="space-y-2">
      <Label>Tiêu đề</Label>
      <Input
       placeholder="Tiêu đề tin nhắn (tùy chọn)"
       value={formData.subject || ''}
       onChange={(e) => handleInputChange('subject', e.target.value)}
       maxLength={200}
      />
      {errors.subject && (
       <p className="text-body-small text-destructive flex items-center gap-1">
        <AlertCircle className="h-4 w-4" />
        {errors.subject}
       </p>
      )}
     </div>

     {/* Content */}
     <div className="space-y-2">
      <Label>Nội dung *</Label>
      <Textarea
       placeholder="Nhập nội dung tin nhắn..."
       value={formData.content}
       onChange={(e) => handleInputChange('content', e.target.value)}
       rows={6}
       maxLength={2000}
       className="resize-none"
      />
      <div className="flex justify-between items-center">
       <div>
        {errors.content && (
         <p className="text-body-small text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {errors.content}
         </p>
        )}
       </div>
       <p className="text-caption text-muted-foreground">
        {formData.content.length}/2000
       </p>
      </div>
     </div>

     {/* Message Preview */}
     {(formData.message_type !== 'direct' || formData.priority !== 'normal') && (
      <div className="p-4 bg-muted rounded-lg">
       <p className="text-body-small-medium mb-2">Xem trước:</p>
       <div className="flex gap-2">
        <Badge variant="outline">
         {getMessageTypeLabel(formData.message_type)}
        </Badge>
        {formData.priority !== 'normal' && (
         <Badge variant={formData.priority === 'urgent' ? 'destructive' : 'secondary'}>
          {getPriorityLabel(formData.priority)}
         </Badge>
        )}
       </div>
      </div>
     )}

     {/* Action Buttons */}
     <div className="flex justify-end gap-3 pt-4 border-t">
      <Button
       type="button"
       variant="outline"
       onClick={onClose}
       disabled={isSending}
      >
       Hủy
      </Button>
      <Button
       type="submit"
       disabled={isSending || !formData.recipient_id || !formData.content.trim()}
      >
       {isSending ? (
        <>
         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
         Đang gửi...
        </>
       ) : (
        <>
         <Send className="h-4 w-4 mr-2" />
         Gửi tin nhắn
        </>
       )}
      </Button>
     </div>
    </form>
   </DialogContent>
  </Dialog>
 );
};

export default ComposeMessage;
