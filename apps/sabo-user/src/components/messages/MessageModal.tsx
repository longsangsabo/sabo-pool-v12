import React from 'react';
import { StandardCard, StandardButton, Heading, Text } from "@sabo/shared-ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
 Clock, 
 User, 
 Calendar,
 AlertCircle,
 CheckCircle2,
 Reply,
 Archive,
 Trash2,
 Star,
 ArrowLeft,
 MoreHorizontal
} from 'lucide-react';
import { Message } from '@/types/message';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface MessageModalProps {
 message: Message | null;
 isOpen: boolean;
 onClose: () => void;
 onReply?: (message: Message) => void;
 onArchive?: (messageId: string) => void;
 onDelete?: (messageId: string) => void;
 onMarkAsRead?: (messageId: string) => void;
 onToggleImportant?: (messageId: string) => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({
 message,
 isOpen,
 onClose,
 onReply,
 onArchive,
 onDelete,
 onMarkAsRead,
 onToggleImportant
}) => {
 if (!message) return null;

 const formatDate = (date: string) => {
  return formatDistanceToNow(new Date(date), { 
   addSuffix: true, 
   locale: vi 
  });
 };

 const getPriorityColor = (priority: string) => {
  switch (priority) {
   case 'high':
    return 'destructive';
   case 'medium':
    return 'default';
   case 'low':
    return 'secondary';
   default:
    return 'secondary';
  }
 };

 const getPriorityLabel = (priority: string) => {
  switch (priority) {
   case 'high':
    return 'Cao';
   case 'medium':
    return 'Trung bình';
   case 'low':
    return 'Thấp';
   default:
    return 'Thường';
  }
 };

 const getTypeLabel = (type: string) => {
  switch (type) {
   case 'personal':
    return 'Cá nhân';
   case 'system':
    return 'Hệ thống';
   case 'notification':
    return 'Thông báo';
   default:
    return 'Khác';
  }
 };

 const handleAction = (action: () => void) => {
  action();
  onClose();
 };

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
    <DialogHeader className="flex-shrink-0">
     <div className="flex items-center justify-between">
      <Button
       variant="ghost"
       
       onClick={onClose}
       className="w-auto px-2"
      >
       <ArrowLeft className="h-4 w-4 mr-2" />
       Quay lại
      </Button>
      <Button variant="ghost" >
       <MoreHorizontal className="h-4 w-4" />
      </Button>
     </div>
     
     <div className="space-y-4 text-left">
      <DialogTitle className="text-title">{message.subject}</DialogTitle>
      
      {/* Message Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-body-small text-muted-foreground">
       <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span>{message.sender_name || 'Người gửi ẩn danh'}</span>
       </div>
       
       <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span>{formatDate(message.created_at)}</span>
       </div>
       
       <Badge variant={getPriorityColor(message.priority)}>
        <AlertCircle className="h-3 w-3 mr-1" />
        {getPriorityLabel(message.priority)}
       </Badge>
       
       <Badge variant="outline">
        {getTypeLabel(message.type)}
       </Badge>
       
       {!message.is_read && (
        <Badge variant="destructive">
         <Clock className="h-3 w-3 mr-1" />
         Chưa đọc
        </Badge>
       )}
       
       {message.is_important && (
        <Badge variant="default" className="bg-warning-500 text-var(--color-background)">
         <Star className="h-3 w-3 mr-1" />
         Quan trọng
        </Badge>
       )}
       
       {message.is_archived && (
        <Badge variant="outline">
         <Archive className="h-3 w-3 mr-1" />
         Đã lưu trữ
        </Badge>
       )}
      </div>
     </div>
    </DialogHeader>

    <Separator />

    {/* Message Content */}
    <ScrollArea className="flex-1 py-4">
     <div className="form-spacing">
      {/* Sender Info Card */}
      <div className="bg-muted/50 p-4 rounded-lg">
       <div className="flex items-center justify-between">
        <div>
         <p className="font-medium">{message.sender_name || 'Người gửi ẩn danh'}</p>
         <p className="text-body-small text-muted-foreground">
          Gửi lúc: {new Date(message.created_at).toLocaleString('vi-VN')}
         </p>
        </div>
        {message.is_read && (
         <CheckCircle2 className="h-5 w-5 text-success-500" />
        )}
       </div>
      </div>

      {/* Message Body */}
      <div className="prose prose-sm max-w-none">
       <div 
        className="var(--color-background)space-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: message.content }}
       />
      </div>

      {/* Attachments (if any) */}
      {message.attachments && message.attachments.length > 0 && (
       <div className="space-y-2">
        <h4 className="font-medium text-body-small">Tệp đính kèm:</h4>
        <div className="space-y-2">
         {message.attachments.map((attachment, index) => (
          <div 
           key={index}
           className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
          >
           <div className="flex-1">
            <p className="text-body-small-medium">{attachment.name}</p>
            <p className="text-caption text-muted-foreground">
             {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Không xác định kích thước'}
            </p>
           </div>
           <Button variant="outline" >
            Tải xuống
           </Button>
          </div>
         ))}
        </div>
       </div>
      )}

      {/* Thread Info */}
      {message.thread_id && (
       <div className="bg-primary-50 p-3 rounded-lg border border-primary-200">
        <p className="text-body-small text-primary-700">
         Tin nhắn này thuộc chuỗi hội thoại. 
         <Button variant="link" className="p-0 h-auto text-primary-700 underline ml-1">
          Xem toàn bộ hội thoại
         </Button>
        </p>
       </div>
      )}
     </div>
    </ScrollArea>

    <Separator />

    {/* Action Buttons */}
    <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-2 pt-4">
     <div className="flex items-center gap-2">
      {onReply && (
       <Button onClick={() => handleAction(() => onReply(message))}>
        <Reply className="h-4 w-4 mr-2" />
        Trả lời
       </Button>
      )}
      
      {!message.is_read && onMarkAsRead && (
       <Button 
        variant="outline" 
        onClick={() => handleAction(() => onMarkAsRead(message.id))}
       >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Đánh dấu đã đọc
       </Button>
      )}
     </div>

     <div className="flex items-center gap-2">
      {onToggleImportant && (
       <Button 
        variant="outline" 
        
        onClick={() => onToggleImportant(message.id)}
        className={message.is_important ? 'bg-warning-100 border-yellow-300' : ''}
       >
        <Star className={`h-4 w-4 ${message.is_important ? 'fill-yellow-500 text-yellow-500' : ''}`} />
       </Button>
      )}
      
      {onArchive && !message.is_archived && (
       <Button 
        variant="outline" 
        
        onClick={() => handleAction(() => onArchive(message.id))}
       >
        <Archive className="h-4 w-4" />
       </Button>
      )}
      
      {onDelete && (
       <Button 
        variant="outline" 
        
        onClick={() => handleAction(() => onDelete(message.id))}
        className="text-destructive hover:text-destructive"
       >
        <Trash2 className="h-4 w-4" />
       </Button>
      )}
     </div>
    </div>
   </DialogContent>
  </Dialog>
 );
};

export default MessageModal;
