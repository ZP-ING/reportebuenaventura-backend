// Sistema de seguimiento de reportes con notificaciones

export interface FollowedReport {
  reportId: string;
  reportTitle: string;
  lastStatus: string;
  lastCommentCount: number; // Nuevo campo para rastrear comentarios
  followedAt: string;
  userId: string;
}

export interface Notification {
  id: string;
  reportId: string;
  reportTitle: string;
  type: 'status_change' | 'new_comment';
  oldStatus?: string;
  newStatus?: string;
  newCommentsCount?: number;
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY = 'followed_reports';
const NOTIFICATIONS_KEY = 'report_notifications';

// Obtener reportes seguidos por un usuario
export function getFollowedReports(userId: string): FollowedReport[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const allFollowed: FollowedReport[] = JSON.parse(stored);
    return allFollowed.filter(fr => fr.userId === userId);
  } catch (error) {
    console.error('Error loading followed reports:', error);
    return [];
  }
}

// Verificar si un reporte está siendo seguido
export function isReportFollowed(reportId: string, userId: string): boolean {
  const followed = getFollowedReports(userId);
  return followed.some(fr => fr.reportId === reportId);
}

// Seguir un reporte
export function followReport(
  reportId: string,
  reportTitle: string,
  currentStatus: string,
  userId: string,
  currentCommentCount: number = 0
): boolean {
  try {
    if (isReportFollowed(reportId, userId)) {
      return false; // Ya está siendo seguido
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    const allFollowed: FollowedReport[] = stored ? JSON.parse(stored) : [];
    
    const newFollowed: FollowedReport = {
      reportId,
      reportTitle,
      lastStatus: currentStatus,
      lastCommentCount: currentCommentCount,
      followedAt: new Date().toISOString(),
      userId
    };
    
    allFollowed.push(newFollowed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allFollowed));
    
    return true;
  } catch (error) {
    console.error('Error following report:', error);
    return false;
  }
}

// Dejar de seguir un reporte
export function unfollowReport(reportId: string, userId: string): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    
    const allFollowed: FollowedReport[] = JSON.parse(stored);
    const filtered = allFollowed.filter(
      fr => !(fr.reportId === reportId && fr.userId === userId)
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error unfollowing report:', error);
    return false;
  }
}

// Verificar cambios de estado y generar notificaciones
export interface StatusChangeNotification {
  reportId: string;
  reportTitle: string;
  oldStatus: string;
  newStatus: string;
  timestamp: string;
}

export function checkForStatusChanges(
  reports: Array<{ id: string; title: string; status: string }>,
  userId: string
): StatusChangeNotification[] {
  try {
    const followed = getFollowedReports(userId);
    const notifications: StatusChangeNotification[] = [];
    
    for (const report of reports) {
      const followedReport = followed.find(fr => fr.reportId === report.id);
      
      if (followedReport && followedReport.lastStatus !== report.status) {
        notifications.push({
          reportId: report.id,
          reportTitle: report.title,
          oldStatus: followedReport.lastStatus,
          newStatus: report.status,
          timestamp: new Date().toISOString()
        });
        
        // Actualizar el estado en el storage
        updateFollowedReportStatus(report.id, report.status, userId);
      }
    }
    
    return notifications;
  } catch (error) {
    console.error('Error checking status changes:', error);
    return [];
  }
}

// Actualizar el estado de un reporte seguido
function updateFollowedReportStatus(
  reportId: string,
  newStatus: string,
  userId: string
): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const allFollowed: FollowedReport[] = JSON.parse(stored);
    const updated = allFollowed.map(fr => {
      if (fr.reportId === reportId && fr.userId === userId) {
        return { ...fr, lastStatus: newStatus };
      }
      return fr;
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating followed report status:', error);
  }
}

// Obtener contador de reportes seguidos
export function getFollowedReportsCount(userId: string): number {
  return getFollowedReports(userId).length;
}

// Limpiar reportes antiguos (más de 90 días)
export function cleanOldFollowedReports(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const allFollowed: FollowedReport[] = JSON.parse(stored);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const filtered = allFollowed.filter(fr => {
      const followedDate = new Date(fr.followedAt);
      return followedDate > ninetyDaysAgo;
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error cleaning old followed reports:', error);
  }
}

// ============== SISTEMA DE NOTIFICACIONES ==============

// Obtener notificaciones de un usuario
export function getNotifications(userId: string): Notification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!stored) return [];
    
    const allNotifications: Notification[] = JSON.parse(stored);
    return allNotifications.filter(n => {
      // Verificar que el reporte esté siendo seguido
      return isReportFollowed(n.reportId, userId);
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error loading notifications:', error);
    return [];
  }
}

// Obtener notificaciones no leídas
export function getUnreadNotificationsCount(userId: string): number {
  const notifications = getNotifications(userId);
  return notifications.filter(n => !n.read).length;
}

// Marcar notificación como leída
export function markNotificationAsRead(notificationId: string): void {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!stored) return;
    
    const allNotifications: Notification[] = JSON.parse(stored);
    const updated = allNotifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Marcar todas las notificaciones como leídas
export function markAllNotificationsAsRead(userId: string): void {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!stored) return;
    
    const allNotifications: Notification[] = JSON.parse(stored);
    const updated = allNotifications.map(n => {
      if (isReportFollowed(n.reportId, userId)) {
        return { ...n, read: true };
      }
      return n;
    });
    
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

// Verificar cambios en reportes (estado y comentarios)
export function checkForReportUpdates(
  reports: Array<{ id: string; title: string; status: string; comments?: any[] }>,
  userId: string
): Notification[] {
  try {
    const followed = getFollowedReports(userId);
    const newNotifications: Notification[] = [];
    
    for (const report of reports) {
      const followedReport = followed.find(fr => fr.reportId === report.id);
      
      if (!followedReport) continue;
      
      // Verificar cambio de estado
      if (followedReport.lastStatus !== report.status) {
        const notification: Notification = {
          id: `${report.id}-status-${Date.now()}`,
          reportId: report.id,
          reportTitle: report.title,
          type: 'status_change',
          oldStatus: followedReport.lastStatus,
          newStatus: report.status,
          timestamp: new Date().toISOString(),
          read: false
        };
        newNotifications.push(notification);
        
        // Actualizar estado guardado
        updateFollowedReportStatus(report.id, report.status, userId);
      }
      
      // Verificar nuevos comentarios
      const currentCommentCount = report.comments?.length || 0;
      if (currentCommentCount > followedReport.lastCommentCount) {
        const newCommentsCount = currentCommentCount - followedReport.lastCommentCount;
        const notification: Notification = {
          id: `${report.id}-comment-${Date.now()}`,
          reportId: report.id,
          reportTitle: report.title,
          type: 'new_comment',
          newCommentsCount,
          timestamp: new Date().toISOString(),
          read: false
        };
        newNotifications.push(notification);
        
        // Actualizar contador de comentarios
        updateFollowedReportComments(report.id, currentCommentCount, userId);
      }
    }
    
    // Guardar nuevas notificaciones
    if (newNotifications.length > 0) {
      saveNotifications(newNotifications);
    }
    
    return newNotifications;
  } catch (error) {
    console.error('Error checking for report updates:', error);
    return [];
  }
}

// Actualizar contador de comentarios de un reporte seguido
function updateFollowedReportComments(
  reportId: string,
  commentCount: number,
  userId: string
): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const allFollowed: FollowedReport[] = JSON.parse(stored);
    const updated = allFollowed.map(fr => {
      if (fr.reportId === reportId && fr.userId === userId) {
        return { ...fr, lastCommentCount: commentCount };
      }
      return fr;
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating followed report comments:', error);
  }
}

// Guardar nuevas notificaciones
function saveNotifications(notifications: Notification[]): void {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const existing: Notification[] = stored ? JSON.parse(stored) : [];
    
    const combined = [...existing, ...notifications];
    
    // Mantener solo las últimas 100 notificaciones
    const limited = combined.slice(-100);
    
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(limited));
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
}

// Eliminar notificación
export function deleteNotification(notificationId: string): void {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!stored) return;
    
    const allNotifications: Notification[] = JSON.parse(stored);
    const filtered = allNotifications.filter(n => n.id !== notificationId);
    
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
}

// Limpiar notificaciones antiguas (más de 30 días)
export function cleanOldNotifications(): void {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!stored) return;
    
    const allNotifications: Notification[] = JSON.parse(stored);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filtered = allNotifications.filter(n => {
      const notificationDate = new Date(n.timestamp);
      return notificationDate > thirtyDaysAgo;
    });
    
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error cleaning old notifications:', error);
  }
}