import React from 'react';
import { Bell, Check } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { markAsRead, markAllAsRead } from './notificationsSlice';
import { Card, Badge, Button, EmptyState } from '../../components/ui';

export const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="h-16 w-16" />}
        title="No notifications"
        description="You'll see notifications about your plots here."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={notification.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'}
          >
            <div className="flex items-start gap-4">
              <Bell
                className={`h-5 w-5 flex-shrink-0 mt-0.5 ${notification.isRead ? 'text-gray-400' : 'text-blue-600'
                  }`}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">
                    {notification.title}
                  </h3>
                  <Badge
                    variant={
                      notification.priority === 'high'
                        ? 'error'
                        : notification.priority === 'medium'
                          ? 'warning'
                          : 'default'
                    }
                    size="sm"
                  >
                    {notification.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs text-primary-600 font-medium hover:text-primary-700"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
