import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Badge } from './ui/badge';
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type Notification
} from '../utils/followedReports';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Separator } from './ui/separator';

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const loadNotifications = () => {
    const notifs = getNotifications(userId);
    setNotifications(notifs);
    setUnreadCount(getUnreadNotificationsCount(userId));
  };

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead(userId);
    loadNotifications();
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification(notificationId);
    loadNotifications();
  };

  const getNotificationIcon = (type: string) => {
    if (type === 'status_change') return '🔄';
    if (type === 'new_comment') return '💬';
    return '📢';
  };

  const getNotificationMessage = (notification: Notification) => {
    if (notification.type === 'status_change') {
      return `El estado cambió de "${notification.oldStatus}" a "${notification.newStatus}"`;
    }
    if (notification.type === 'new_comment') {
      const count = notification.newCommentsCount || 1;
      return `${count} nuevo${count > 1 ? 's' : ''} comentario${count > 1 ? 's' : ''}`;
    }
    return 'Actualización en el reporte';
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return then.toLocaleDateString('es-ES');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative border-green-200 hover:bg-green-50"
        >
          <Bell className="w-5 h-5 text-green-700" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-green-100">
          <h3 className="text-green-800">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMarkAllAsRead}
              className="text-xs text-green-600 hover:text-green-700"
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 text-center">
                No tienes notificaciones
              </p>
              <p className="text-xs text-gray-400 text-center mt-1">
                Sigue reportes para recibir actualizaciones
              </p>
            </div>
          ) : (
            <div className="divide-y divide-green-100">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-3 m-2 cursor-pointer transition-colors border-2 ${
                    notification.read
                      ? 'bg-white border-gray-100'
                      : 'bg-green-50 border-green-200'
                  }`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate mb-1">
                        {notification.reportTitle}
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        {getNotificationMessage(notification)}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {formatTime(notification.timestamp)}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-500"
                onClick={() => {
                  notifications.forEach(n => handleDelete(n.id));
                  setOpen(false);
                }}
              >
                Limpiar todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
