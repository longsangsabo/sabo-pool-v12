import React from 'react';
import { clsx } from 'clsx';

interface NotificationCenterProps {
  limit?: number;
  showUnreadOnly?: boolean;
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  limit = 20,
  showUnreadOnly = false,
  className
}) => {
  return (
    <div className={clsx('notification-center bg-white rounded-lg p-6', className)}>
      <h3 className="text-xl font-bold mb-4">Notification Center</h3>
      <div className="text-gray-500">
        Notification center component will be implemented here.
        <br />
        Limit: {limit}
        <br />
        Unread only: {showUnreadOnly ? 'Yes' : 'No'}
      </div>
    </div>
  );
};

export default NotificationCenter;
