import api from './api';

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  MAINTENANCE = 'MAINTENANCE',
  SYSTEM = 'SYSTEM'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  category?: string;
  expiresAt?: Date;
  userId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  category?: string;
  expiresAt?: string;
  userId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface UpdateNotificationDto {
  title?: string;
  message?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  category?: string;
  expiresAt?: string;
}

export interface NotificationFilterDto {
  type?: NotificationType[];
  priority?: NotificationPriority[];
  isRead?: boolean;
  category?: string;
  userId?: string;
  relatedEntityType?: string;
  search?: string;
}

export interface NotificationStatistics {
  total: number;
  unread: number;
  read: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

const notificationsService = {
  // CRUD de base
  getAllNotifications: async (filters?: NotificationFilterDto): Promise<Notification[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.type && filters.type.length > 0) {
        filters.type.forEach(type => queryParams.append('type', type));
      }
      if (filters.priority && filters.priority.length > 0) {
        filters.priority.forEach(priority => queryParams.append('priority', priority));
      }
      if (typeof filters.isRead === 'boolean') {
        queryParams.append('isRead', filters.isRead.toString());
      }
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.relatedEntityType) queryParams.append('relatedEntityType', filters.relatedEntityType);
      if (filters.search) queryParams.append('search', filters.search);
    }
    
    const url = queryParams.toString() ? `/notifications?${queryParams.toString()}` : '/notifications';
    const response = await api.get(url);
    return response.data;
  },

  getMyNotifications: async (filters?: NotificationFilterDto): Promise<Notification[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.type && filters.type.length > 0) {
        filters.type.forEach(type => queryParams.append('type', type));
      }
      if (filters.priority && filters.priority.length > 0) {
        filters.priority.forEach(priority => queryParams.append('priority', priority));
      }
      if (typeof filters.isRead === 'boolean') {
        queryParams.append('isRead', filters.isRead.toString());
      }
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.relatedEntityType) queryParams.append('relatedEntityType', filters.relatedEntityType);
      if (filters.search) queryParams.append('search', filters.search);
    }
    
    const url = queryParams.toString() ? `/notifications/my?${queryParams.toString()}` : '/notifications/my';
    const response = await api.get(url);
    return response.data;
  },

  getNotificationById: async (id: string): Promise<Notification> => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  createNotification: async (notification: CreateNotificationDto): Promise<Notification> => {
    const response = await api.post('/notifications', notification);
    return response.data;
  },

  updateNotification: async (id: string, notification: UpdateNotificationDto): Promise<Notification> => {
    const response = await api.patch(`/notifications/${id}`, notification);
    return response.data;
  },

  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },

  // Actions spéciales
  markAsRead: async (notificationIds: string[]): Promise<void> => {
    await api.post('/notifications/mark-as-read', { notificationIds });
  },

  markAllAsRead: async (userId?: string): Promise<void> => {
    await api.post('/notifications/mark-all-as-read', { userId });
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/my/unread-count');
    return response.data;
  },

  getAllUnreadCount: async (userId?: string): Promise<number> => {
    const url = userId ? `/notifications/unread-count?userId=${userId}` : '/notifications/unread-count';
    const response = await api.get(url);
    return response.data;
  },

  getStatistics: async (userId?: string): Promise<NotificationStatistics> => {
    const url = userId ? `/notifications/statistics?userId=${userId}` : '/notifications/statistics';
    const response = await api.get(url);
    return response.data;
  },

  removeExpired: async (): Promise<number> => {
    const response = await api.delete('/notifications/expired');
    return response.data;
  },

  // Méthodes spécialisées pour créer des types de notifications
  createSystemNotification: async (
    title: string,
    message: string,
    priority?: NotificationPriority,
    userId?: string
  ): Promise<Notification> => {
    const response = await api.post('/notifications/system', {
      title,
      message,
      priority,
      userId
    });
    return response.data;
  },

  createMaintenanceNotification: async (
    title: string,
    message: string,
    relatedEntityId?: string,
    relatedEntityType?: string
  ): Promise<Notification> => {
    const response = await api.post('/notifications/maintenance', {
      title,
      message,
      relatedEntityId,
      relatedEntityType
    });
    return response.data;
  },

  createEquipmentAlert: async (
    equipmentId: string,
    title: string,
    message: string,
    priority?: NotificationPriority
  ): Promise<Notification> => {
    const response = await api.post('/notifications/equipment-alert', {
      equipmentId,
      title,
      message,
      priority
    });
    return response.data;
  },

  createSiteAlert: async (
    siteId: string,
    title: string,
    message: string,
    priority?: NotificationPriority
  ): Promise<Notification> => {
    const response = await api.post('/notifications/site-alert', {
      siteId,
      title,
      message,
      priority
    });
    return response.data;
  },
};

export default notificationsService; 
