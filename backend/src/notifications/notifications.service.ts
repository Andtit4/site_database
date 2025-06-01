import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, MoreThan, In } from 'typeorm';
import { Notification, NotificationType, NotificationPriority } from '../entities/notification.entity';
import { CreateNotificationDto, UpdateNotificationDto, NotificationFilterDto, MarkAsReadDto } from '../dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      expiresAt: createNotificationDto.expiresAt ? new Date(createNotificationDto.expiresAt) : null,
    });
    
    return this.notificationRepository.save(notification);
  }

  async findAll(filterDto: NotificationFilterDto = {}): Promise<Notification[]> {
    const { type, priority, isRead, category, userId, relatedEntityType, search } = filterDto;
    
    const query = this.notificationRepository.createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .orderBy('notification.createdAt', 'DESC');

    // Filtrer par type
    if (type && type.length > 0) {
      query.andWhere('notification.type IN (:...type)', { type });
    }

    // Filtrer par priorité
    if (priority && priority.length > 0) {
      query.andWhere('notification.priority IN (:...priority)', { priority });
    }

    // Filtrer par statut de lecture
    if (typeof isRead === 'boolean') {
      query.andWhere('notification.isRead = :isRead', { isRead });
    }

    // Filtrer par catégorie
    if (category) {
      query.andWhere('notification.category = :category', { category });
    }

    // Filtrer par utilisateur
    if (userId) {
      query.andWhere('notification.userId = :userId', { userId });
    }

    // Filtrer par type d'entité liée
    if (relatedEntityType) {
      query.andWhere('notification.relatedEntityType = :relatedEntityType', { relatedEntityType });
    }

    // Recherche textuelle
    if (search) {
      query.andWhere(
        '(notification.title LIKE :search OR notification.message LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Exclure les notifications expirées
    query.andWhere('(notification.expiresAt IS NULL OR notification.expiresAt > :now)', 
      { now: new Date() });

    return query.getMany();
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification avec ID ${id} non trouvée`);
    }

    return notification;
  }

  async findByUser(userId: string, filterDto: NotificationFilterDto = {}): Promise<Notification[]> {
    return this.findAll({ ...filterDto, userId });
  }

  async getUnreadCount(userId?: string): Promise<number> {
    const whereCondition: FindOptionsWhere<Notification> = {
      isRead: false,
    };

    if (userId) {
      whereCondition.userId = userId;
    }

    return this.notificationRepository.count({
      where: whereCondition,
    });
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);
    
    Object.assign(notification, {
      ...updateNotificationDto,
      expiresAt: updateNotificationDto.expiresAt ? new Date(updateNotificationDto.expiresAt) : notification.expiresAt,
    });

    return this.notificationRepository.save(notification);
  }

  async markAsRead(markAsReadDto: MarkAsReadDto): Promise<void> {
    await this.notificationRepository.update(
      { id: In(markAsReadDto.notificationIds) },
      { isRead: true }
    );
  }

  async markAllAsRead(userId?: string): Promise<void> {
    const whereCondition: FindOptionsWhere<Notification> = {
      isRead: false,
    };

    if (userId) {
      whereCondition.userId = userId;
    }

    await this.notificationRepository.update(whereCondition, { isRead: true });
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  async removeExpired(): Promise<number> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('expiresAt < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  // Méthodes utilitaires pour créer des notifications spécifiques
  async createSystemNotification(
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    userId?: string
  ): Promise<Notification> {
    return this.create({
      title,
      message,
      type: NotificationType.SYSTEM,
      priority,
      category: 'system',
      userId,
    });
  }

  async createMaintenanceNotification(
    title: string,
    message: string,
    relatedEntityId?: string,
    relatedEntityType?: string
  ): Promise<Notification> {
    return this.create({
      title,
      message,
      type: NotificationType.MAINTENANCE,
      priority: NotificationPriority.HIGH,
      category: 'maintenance',
      relatedEntityId,
      relatedEntityType,
    });
  }

  async createEquipmentAlert(
    equipmentId: string,
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.HIGH
  ): Promise<Notification> {
    return this.create({
      title,
      message,
      type: NotificationType.WARNING,
      priority,
      category: 'equipment',
      relatedEntityId: equipmentId,
      relatedEntityType: 'equipment',
      actionUrl: `/equipment/${equipmentId}`,
      actionLabel: 'Voir l\'équipement',
    });
  }

  async createSiteAlert(
    siteId: string,
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.HIGH
  ): Promise<Notification> {
    return this.create({
      title,
      message,
      type: NotificationType.WARNING,
      priority,
      category: 'site',
      relatedEntityId: siteId,
      relatedEntityType: 'site',
      actionUrl: `/sites/${siteId}`,
      actionLabel: 'Voir le site',
    });
  }

  // Statistiques
  async getStatistics(userId?: string): Promise<any> {
    const baseQuery = this.notificationRepository.createQueryBuilder('notification');
    
    if (userId) {
      baseQuery.where('notification.userId = :userId', { userId });
    }

    const total = await baseQuery.getCount();
    const unread = await baseQuery.andWhere('notification.isRead = false').getCount();
    
    // Reset la query pour les types
    const typeQuery = this.notificationRepository.createQueryBuilder('notification');
    if (userId) {
      typeQuery.where('notification.userId = :userId', { userId });
    }
    
    const byType = await typeQuery
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('notification.type')
      .getRawMany();

    // Reset la query pour les priorités
    const priorityQuery = this.notificationRepository.createQueryBuilder('notification');
    if (userId) {
      priorityQuery.where('notification.userId = :userId', { userId });
    }
    
    const byPriority = await priorityQuery
      .select('notification.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .groupBy('notification.priority')
      .getRawMany();

    return {
      total,
      unread,
      read: total - unread,
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: parseInt(item.count) }), {}),
      byPriority: byPriority.reduce((acc, item) => ({ ...acc, [item.priority]: parseInt(item.count) }), {}),
    };
  }
} 
