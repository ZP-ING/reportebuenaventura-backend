// Sistema de seguimiento de reportes con notificaciones

export interface FollowedReport {
  reportId: string;
  reportTitle: string;
  lastStatus: string;
  followedAt: string;
  userId: string;
}

const STORAGE_KEY = 'followed_reports';

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
  userId: string
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
