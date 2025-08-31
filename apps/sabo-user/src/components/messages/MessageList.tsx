import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
 Mail, 
 MailOpen, 
 Archive, 
 Trash2, 
 Star,
 Clock,
 AlertCircle,
 User,
 Settings,
 Trophy,
 Megaphone,
 MoreVertical
} from 'lucide-react';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Message } from '@/types/message';
import { useMessages } from '@/hooks/useMessages';
import MessageModal from './MessageModal';

interface MessageListProps {
 messages: Message[];
 isLoading?: boolean;
 onRefresh?: () => void;
 type?: 'inbox' | 'sent' | 'archive' | 'trash';
}

export const MessageList: React.FC<MessageListProps> = ({
 messages,
 isLoading = false,
 onRefresh,
 type = 'inbox'
}) => {
 const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
 const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
 const [showMessageModal, setShowMessageModal] = useState(false);
 
 const { 
  markAsRead, 
  markMultipleAsRead, 
  archiveMessage, 
  deleteMessage 
 } = useMessages();

 // Get message type icon
 const getMessageTypeIcon = (messageType: string) => {
  switch (messageType) {
   case 'system':
    return <Settings className="h-4 w-4 text-blue-500" />;
   case 'tournament':
    return <Trophy className="h-4 w-4 text-yellow-500" />;
   case 'announcement':
    return <Megaphone className="h-4 w-4 text-purple-500" />;
   default:
    return <User className="h-4 w-4 text-neutral-500" />;
  }
 };

 // Get priority badge
 const getPriorityBadge = (priority: string) => {
  switch (priority) {
   case 'urgent':
    return <Badge variant="destructive">Khẩn cấp</Badge>;
   case 'high':
    return <Badge variant="secondary">Cao</Badge>;
   case 'low':
    return <Badge variant="outline">Thấp</Badge>;
   default:
    return null;
  }
 };

 // Handle message selection
 const handleSelectMessage = (messageId: string, checked: boolean) => {
  if (checked) {
   setSelectedMessages(prev => [...prev, messageId]);
  } else {
   setSelectedMessages(prev => prev.filter(id => id !== messageId));
  }
 };

 // Handle select all
 const handleSelectAll = (checked: boolean) => {
  if (checked) {
   setSelectedMessages(messages.map(msg => msg.id));
  } else {
   setSelectedMessages([]);
  }
 };

 // Handle message click
 const handleMessageClick = async (message: Message) => {
  setSelectedMessage(message);
  setShowMessageModal(true);
  
  // Mark as read if unread
  if (message.status === 'unread' && type === 'inbox') {
   await markAsRead(message.id);
  }
 };

 // Handle bulk actions
 const handleMarkSelectedAsRead = async () => {
  if (selectedMessages.length > 0) {
   await markMultipleAsRead(selectedMessages);
   setSelectedMessages([]);
  }
 };

 const handleArchiveSelected = async () => {
  for (const messageId of selectedMessages) {
   await archiveMessage(messageId);
  }
  setSelectedMessages([]);
  onRefresh?.();
 };

 const handleDeleteSelected = async () => {
  for (const messageId of selectedMessages) {
   await deleteMessage(messageId);
  }
  setSelectedMessages([]);
  onRefresh?.();
 };

 // Loading state
 if (isLoading && messages.length === 0) {
  return (
   <div className="form-spacing">
    {[1, 2, 3].map((i) => (
     <Card key={i} className="animate-pulse">
      <CardContent className="content-spacing">
       <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-neutral-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
         <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
         <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
        </div>
       </div>
      </CardContent>
     </Card>
    ))}
   </div>
  );
 }

 // Empty state
 if (messages.length === 0) {
  return (
   <div className="text-center py-12">
    <Mail className="h-16 w-16 mx-auto mb-4 text-gray-400" />
    <h3 className="text-body-large font-medium text-neutral-900 mb-2">
     {type === 'inbox' && 'Không có tin nhắn mới'}
     {type === 'sent' && 'Chưa gửi tin nhắn nào'}
     {type === 'archive' && 'Chưa có tin nhắn lưu trữ'}
     {type === 'trash' && 'Thùng rác trống'}
    </h3>
    <p className="text-neutral-500">
     {type === 'inbox' && 'Tin nhắn mới sẽ xuất hiện ở đây'}
     {type === 'sent' && 'Các tin nhắn bạn gửi sẽ xuất hiện ở đây'}
     {type === 'archive' && 'Tin nhắn đã lưu trữ sẽ xuất hiện ở đây'}
     {type === 'trash' && 'Tin nhắn đã xóa sẽ xuất hiện ở đây'}
    </p>
   </div>
  );
 }

 return (
  <div className="form-spacing">
   {/* Bulk Actions */}
   {selectedMessages.length > 0 && (
    <div className="flex items-center gap-2 p-4 bg-primary-50 border border-primary-200 rounded-lg">
     <span className="text-body-small-medium">
      Đã chọn {selectedMessages.length} tin nhắn
     </span>
     
     {type === 'inbox' && (
      <>
       <Button 
         
        variant="outline"
        onClick={handleMarkSelectedAsRead}
       >
        <MailOpen className="h-4 w-4 mr-1" />
        Đánh dấu đã đọc
       </Button>
       
       <Button 
         
        variant="outline"
        onClick={handleArchiveSelected}
       >
        <Archive className="h-4 w-4 mr-1" />
        Lưu trữ
       </Button>
      </>
     )}
     
     <Button 
       
      variant="outline"
      onClick={handleDeleteSelected}
     >
      <Trash2 className="h-4 w-4 mr-1" />
      Xóa
     </Button>
     
     <Button 
       
      variant="ghost"
      onClick={() => setSelectedMessages([])}
     >
      Hủy chọn
     </Button>
    </div>
   )}

   {/* Select All */}
   <div className="flex items-center gap-2 pb-2 border-b">
    <Checkbox
     checked={selectedMessages.length === messages.length && messages.length > 0}
     onCheckedChange={handleSelectAll}
    />
    <span className="text-body-small text-muted-foreground">
     Chọn tất cả ({messages.length})
    </span>
   </div>

   {/* Message List */}
   <div className="space-y-2">
    {messages.map((message) => (
     <Card 
      key={message.id} 
      className={`cursor-pointer transition-all hover:shadow-md ${
       message.status === 'unread' ? 'bg-primary-50/50 border-primary-200' : ''
      } ${
       selectedMessages.includes(message.id) ? 'ring-2 ring-blue-500' : ''
      }`}
     >
      <CardContent className="content-spacing">
       <div className="flex items-start gap-3">
        {/* Selection Checkbox */}
        <Checkbox
         checked={selectedMessages.includes(message.id)}
         onCheckedChange={(checked) => handleSelectMessage(message.id, checked as boolean)}
         onClick={(e) => e.stopPropagation()}
        />

        {/* Sender Avatar */}
        <Avatar className="h-10 w-10">
         <AvatarImage 
          src={type === 'sent' ? message.recipient?.avatar_url : message.sender?.avatar_url} 
         />
         <AvatarFallback>
          {type === 'sent' 
           ? (message.recipient?.full_name || 'U').charAt(0).toUpperCase()
           : message.sender 
            ? (message.sender.full_name || 'U').charAt(0).toUpperCase()
            : 'S' // System message
          }
         </AvatarFallback>
        </Avatar>

        {/* Message Content */}
        <div 
         className="flex-1 min-w-0"
         onClick={() => handleMessageClick(message)}
        >
         <div className="flex items-center gap-2 mb-1">
          {/* Message Type Icon */}
          {getMessageTypeIcon(message.message_type)}
          
          {/* Sender/Recipient Name */}
          <span className={`text-body-small-medium truncate ${
           message.status === 'unread' ? 'text-neutral-900' : 'text-neutral-600'
          }`}>
           {type === 'sent' 
            ? `Đến: ${message.recipient?.display_name || message.recipient?.full_name || 'Người dùng'}`
            : message.sender 
             ? (message.sender.display_name || message.sender.full_name)
             : 'Hệ thống'
           }
          </span>

          {/* Status Icons */}
          <div className="flex items-center gap-1">
           {message.status === 'unread' && type === 'inbox' && (
            <Mail className="h-4 w-4 text-blue-500" />
           )}
           {message.priority !== 'normal' && getPriorityBadge(message.priority)}
          </div>

          {/* Timestamp */}
          <span className="text-caption text-muted-foreground ml-auto whitespace-nowrap">
           <Clock className="h-3 w-3 inline mr-1" />
           {format(new Date(message.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </span>
         </div>

         {/* Subject */}
         {message.subject && (
          <h4 className={`text-body-small-medium mb-1 truncate ${
           message.status === 'unread' ? 'text-neutral-900' : 'text-neutral-700'
          }`}>
           {message.subject}
          </h4>
         )}

         {/* Content Preview */}
         <p className="text-body-small-neutral line-clamp-2">
          {message.content}
         </p>

         {/* Message Metadata */}
         {message.metadata && Object.keys(message.metadata).length > 0 && (
          <div className="flex items-center gap-2 mt-2">
           {message.metadata.tournament_id && (
            <Badge variant="outline" className="text-caption">
             <Trophy className="h-3 w-3 mr-1" />
             Giải đấu
            </Badge>
           )}
           {message.metadata.match_id && (
            <Badge variant="outline" className="text-caption">
             Trận đấu
            </Badge>
           )}
          </div>
         )}
        </div>

        {/* Action Menu */}
        <DropdownMenu>
         <DropdownMenuTrigger asChild>
          <Button 
           variant="ghost" 
           
           className="h-8 w-8"
           onClick={(e) => e.stopPropagation()}
          >
           <MoreVertical className="h-4 w-4" />
          </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end">
          {message.status === 'unread' && type === 'inbox' && (
           <DropdownMenuItem onClick={() => markAsRead(message.id)}>
            <MailOpen className="h-4 w-4 mr-2" />
            Đánh dấu đã đọc
           </DropdownMenuItem>
          )}
          
          {type === 'inbox' && (
           <DropdownMenuItem onClick={() => archiveMessage(message.id)}>
            <Archive className="h-4 w-4 mr-2" />
            Lưu trữ
           </DropdownMenuItem>
          )}
          
          <DropdownMenuItem 
           onClick={() => deleteMessage(message.id)}
           className="text-error-600"
          >
           <Trash2 className="h-4 w-4 mr-2" />
           Xóa
          </DropdownMenuItem>
         </DropdownMenuContent>
        </DropdownMenu>
       </div>
      </CardContent>
     </Card>
    ))}
   </div>

   {/* Message Detail Modal */}
   {selectedMessage && (
    <MessageModal
     message={selectedMessage}
     isOpen={showMessageModal}
     onClose={() => {
      setShowMessageModal(false);
      setSelectedMessage(null);
     }}
     type={type}
    />
   )}
  </div>
 );
};

export default MessageList;
