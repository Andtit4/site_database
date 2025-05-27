import { NotificationsType } from '@/components/layout/shared/NotificationsDropdown';

// Type pour les différentes actions qui peuvent générer des notifications
export enum NotificationAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ASSIGN = 'ASSIGN',
  MAINTENANCE = 'MAINTENANCE',
  INFO = 'INFO'
}

// Type pour les différentes entités concernées par les notifications
export enum NotificationEntity {
  TEAM = 'TEAM',
  EQUIPMENT = 'EQUIPMENT',
  SITE = 'SITE',
  USER = 'USER',
  DEPARTMENT = 'DEPARTMENT',
  SYSTEM = 'SYSTEM'
}

// Interface pour stocker une notification dans le localStorage
export interface StoredNotification extends NotificationsType {
  id: string;
  entityId?: string;
  entityType: NotificationEntity;
  actionType: NotificationAction;
  timestamp: number;
  userId?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private listeners: ((notifications: NotificationsType[]) => void)[] = [];
  private storageKey = 'app_notifications';
  
  // Singleton pattern
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  // Charger les notifications du localStorage
  private getStoredNotifications(): StoredNotification[] {
    // Vérifier si window est défini (côté client uniquement)
    if (typeof window === 'undefined') return [];
    
    try {
      const storedData = localStorage.getItem(this.storageKey);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
    return [];
  }
  
  // Sauvegarder les notifications dans le localStorage
  private saveNotifications(notifications: StoredNotification[]): void {
    // Vérifier si window est défini (côté client uniquement)
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications:', error);
    }
  }
  
  // Convertir les notifications stockées en format pour l'UI
  public getNotifications(): NotificationsType[] {
    return this.getStoredNotifications().map(notification => ({
      title: notification.title,
      subtitle: notification.subtitle,
      time: notification.time,
      read: notification.read,
      avatarIcon: this.getIconForEntity(notification.entityType),
      avatarColor: this.getColorForAction(notification.actionType),
      avatarSkin: 'light-static'
    }));
  }
  
  // Ajouter une notification
  public addNotification(
    entityType: NotificationEntity,
    actionType: NotificationAction,
    title: string,
    subtitle: string,
    entityId?: string,
    userId?: string
  ): void {
    const notifications = this.getStoredNotifications();
    
    const newNotification: StoredNotification = {
      id: crypto.randomUUID(),
      entityType,
      actionType,
      title,
      subtitle,
      time: this.formatTime(new Date()),
      read: false,
      timestamp: Date.now(),
      entityId,
      userId,
      avatarIcon: this.getIconForEntity(entityType),
      avatarColor: this.getColorForAction(actionType),
      avatarSkin: 'light-static'
    };
    
    notifications.unshift(newNotification); // Ajouter au début du tableau
    
    // Limiter le nombre de notifications stockées (garder les 50 plus récentes)
    if (notifications.length > 50) {
      notifications.splice(50);
    }
    
    this.saveNotifications(notifications);
    this.notifyListeners();
  }
  
  // Marquer une notification comme lue
  public markAsRead(notificationId: string): void {
    const notifications = this.getStoredNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    
    if (index !== -1) {
      notifications[index].read = true;
      this.saveNotifications(notifications);
      this.notifyListeners();
    }
  }
  
  // Marquer toutes les notifications comme lues
  public markAllAsRead(): void {
    const notifications = this.getStoredNotifications();
    
    notifications.forEach(notification => {
      notification.read = true;
    });
    
    this.saveNotifications(notifications);
    this.notifyListeners();
  }
  
  // Supprimer une notification
  public removeNotification(notificationId: string): void {
    const notifications = this.getStoredNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    
    if (index !== -1) {
      notifications.splice(index, 1);
      this.saveNotifications(notifications);
      this.notifyListeners();
    }
  }
  
  // Ajouter un écouteur pour les changements de notifications
  public addListener(callback: (notifications: NotificationsType[]) => void): void {
    this.listeners.push(callback);
  }
  
  // Supprimer un écouteur
  public removeListener(callback: (notifications: NotificationsType[]) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  // Notifier tous les écouteurs
  private notifyListeners(): void {
    const notifications = this.getNotifications();
    this.listeners.forEach(listener => {
      listener(notifications);
    });
  }
  
  // Obtenir l'icône correspondant au type d'entité
  private getIconForEntity(entityType: NotificationEntity): string {
    switch (entityType) {
      case NotificationEntity.TEAM:
        return 'tabler-users';
      case NotificationEntity.EQUIPMENT:
        return 'tabler-device-mobile';
      case NotificationEntity.SITE:
        return 'tabler-building';
      case NotificationEntity.USER:
        return 'tabler-user';
      case NotificationEntity.DEPARTMENT:
        return 'tabler-building-community';
      case NotificationEntity.SYSTEM:
        return 'tabler-bell';
      default:
        return 'tabler-info-circle';
    }
  }
  
  // Obtenir la couleur correspondant au type d'action
  private getColorForAction(actionType: NotificationAction): any {
    switch (actionType) {
      case NotificationAction.CREATE:
        return 'success';
      case NotificationAction.UPDATE:
        return 'info';
      case NotificationAction.DELETE:
        return 'error';
      case NotificationAction.ASSIGN:
        return 'primary';
      case NotificationAction.MAINTENANCE:
        return 'warning';
      case NotificationAction.INFO:
        return 'secondary';
      default:
        return 'primary';
    }
  }
  
  // Formater l'heure pour l'affichage
  private formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Si moins d'une minute
    if (diff < 60 * 1000) {
      return "À l'instant";
    }
    
    // Si moins d'une heure
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    
    // Si moins d'un jour
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    }
    
    // Si moins d'une semaine
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
    
    // Sinon, afficher la date complète
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  // Méthodes spécifiques pour les différentes actions sur les entités
  
  // Équipes
  public notifyTeamCreated(teamName: string, departmentName: string, userId?: string): void {
    this.addNotification(
      NotificationEntity.TEAM,
      NotificationAction.CREATE,
      `Équipe créée : ${teamName}`,
      `Une nouvelle équipe a été créée dans le département ${departmentName}.`,
      undefined,
      userId
    );
  }
  
  public notifyTeamUpdated(teamName: string, departmentName: string, userId?: string): void {
    this.addNotification(
      NotificationEntity.TEAM,
      NotificationAction.UPDATE,
      `Équipe modifiée : ${teamName}`,
      `L'équipe a été mise à jour dans le département ${departmentName}.`,
      undefined,
      userId
    );
  }
  
  public notifyTeamDeleted(teamName: string, departmentName: string, userId?: string): void {
    this.addNotification(
      NotificationEntity.TEAM,
      NotificationAction.DELETE,
      `Équipe supprimée : ${teamName}`,
      `L'équipe a été supprimée du département ${departmentName}.`,
      undefined,
      userId
    );
  }
  
  // Méthodes spécifiques pour les départements
  public notifyDepartmentCreated(departmentName: string, userId?: string): void {
    this.addNotification(
      NotificationEntity.DEPARTMENT,
      NotificationAction.CREATE,
      `Département créé : ${departmentName}`,
      `Un nouveau département a été créé.`,
      undefined,
      userId
    );
  }
  
  public notifyDepartmentUpdated(departmentName: string, userId?: string): void {
    this.addNotification(
      NotificationEntity.DEPARTMENT,
      NotificationAction.UPDATE,
      `Département modifié : ${departmentName}`,
      `Le département a été mis à jour.`,
      undefined,
      userId
    );
  }
  
  public notifyDepartmentDeleted(departmentName: string, userId?: string): void {
    this.addNotification(
      NotificationEntity.DEPARTMENT,
      NotificationAction.DELETE,
      `Département supprimé : ${departmentName}`,
      `Le département a été supprimé.`,
      undefined,
      userId
    );
  }
}

const notificationService = NotificationService.getInstance();

export default notificationService; 
