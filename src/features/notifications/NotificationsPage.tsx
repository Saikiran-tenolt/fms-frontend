import React from 'react';
import { 
  Bell, Check, CheckCircle2, MoreVertical, ArrowRight 
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { markAsRead, markAllAsRead } from './notificationsSlice';
import { EmptyState } from '../../components/ui';
import { toast } from 'sonner';

export const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications);

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    dispatch(markAsRead(id));
    toast.success('Notification marked as read');
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    toast.info('All notifications marked as read');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Inbox</h2>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            {unreadCount > 0 ? `${unreadCount} unread activities` : 'All system alerts are current.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all border border-slate-200/60 shadow-sm active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-16 w-16" />}
          title="No notifications"
          description="You'll see recent activity and system alerts here."
        />
      ) : (
        /* Premium List Card */
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_4px_24px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={!notification.isRead ? (e) => handleMarkAsRead(notification.id, e) : undefined}
                className={`p-5 sm:p-6 transition-all relative group flex gap-5 cursor-pointer ${
                  notification.isRead ? 'bg-white' : 'hover:bg-slate-50/50'
                }`}
              >
                {!notification.isRead && (
                  <>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.3)]" />
                    <div className="mt-2 shrink-0">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse" />
                    </div>
                  </>
                )}
                {notification.isRead && <div className="mt-2 shrink-0 w-2.5" />}

                <div className={`flex-1 min-w-0 transition-opacity duration-300 ${notification.isRead ? 'opacity-60' : 'opacity-100'}`}>
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <p className={`text-[15px] font-bold tracking-tight ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notification.title}
                    </p>
                    <div className="flex items-center gap-2">
                      {notification.isRead && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                          <Check className="w-3 h-3" />
                          Read
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm leading-relaxed ${notification.isRead ? 'text-slate-500' : 'text-slate-600'} truncate`}>
                    {notification.message}
                  </p>
                </div>

                <div className="flex items-center shrink-0">
                  {!notification.isRead ? (
                    <button 
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 -mr-2"
                      title="Mark as read"
                    >
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  ) : (
                    <button className="p-2.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-slate-50/50 border-t border-slate-100 p-4 text-center">
            <button className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center gap-2 w-full uppercase tracking-[0.1em]">
              View all history <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

