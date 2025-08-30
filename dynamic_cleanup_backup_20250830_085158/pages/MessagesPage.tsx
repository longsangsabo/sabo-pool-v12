import React from 'react';
import MessageCenter from '@/components/messages/MessageCenter';

const MessagesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-neutral-900">Hộp thư</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi tất cả tin nhắn của bạn
          </p>
        </div>

        {/* Message Center */}
        <MessageCenter />
      </div>
    </div>
  );
};

export default MessagesPage;
