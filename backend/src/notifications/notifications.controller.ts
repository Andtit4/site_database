import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UsePipes, 
  ValidationPipe, 
  UseGuards,
  Request
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { 
  CreateNotificationDto, 
  UpdateNotificationDto, 
  NotificationFilterDto, 
  MarkAsReadDto 
} from '../dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(AdminGuard) // Seuls les admins peuvent créer des notifications
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Créer une notification' })
  @ApiResponse({ status: 201, description: 'Notification créée avec succès' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Récupérer toutes les notifications' })
  @ApiResponse({ status: 200, description: 'Liste des notifications' })
  findAll(@Query() filterDto: NotificationFilterDto) {
    return this.notificationsService.findAll(filterDto);
  }

  @Get('my')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Récupérer les notifications de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Notifications de l\'utilisateur' })
  findMyNotifications(@Request() req, @Query() filterDto: NotificationFilterDto) {
    return this.notificationsService.findByUser(req.user.userId, filterDto);
  }

  @Get('my/unread-count')
  @ApiOperation({ summary: 'Compter les notifications non lues de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Nombre de notifications non lues' })
  getMyUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.userId);
  }

  @Get('unread-count')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Compter toutes les notifications non lues (admin)' })
  @ApiResponse({ status: 200, description: 'Nombre total de notifications non lues' })
  getUnreadCount(@Query('userId') userId?: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obtenir les statistiques des notifications' })
  @ApiResponse({ status: 200, description: 'Statistiques des notifications' })
  getStatistics(@Request() req, @Query('userId') userId?: string) {
    // Les admins peuvent voir les stats de tous les utilisateurs
    const targetUserId = req.user.role === 'admin' && userId ? userId : req.user.userId;
    return this.notificationsService.getStatistics(targetUserId);
  }

  @Post('mark-as-read')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Marquer des notifications comme lues' })
  @ApiResponse({ status: 200, description: 'Notifications marquées comme lues' })
  markAsRead(@Body() markAsReadDto: MarkAsReadDto) {
    return this.notificationsService.markAsRead(markAsReadDto);
  }

  @Post('mark-all-as-read')
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  @ApiResponse({ status: 200, description: 'Toutes les notifications marquées comme lues' })
  markAllAsRead(@Request() req, @Body('userId') userId?: string) {
    // Les admins peuvent marquer les notifications de tous les utilisateurs
    const targetUserId = req.user.role === 'admin' && userId ? userId : req.user.userId;
    return this.notificationsService.markAllAsRead(targetUserId);
  }

  @Delete('expired')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Supprimer les notifications expirées (admin)' })
  @ApiResponse({ status: 200, description: 'Notifications expirées supprimées' })
  removeExpired() {
    return this.notificationsService.removeExpired();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une notification par ID' })
  @ApiResponse({ status: 200, description: 'Détails de la notification' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard) // Seuls les admins peuvent modifier les notifications
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Mettre à jour une notification (admin)' })
  @ApiResponse({ status: 200, description: 'Notification mise à jour' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard) // Seuls les admins peuvent supprimer les notifications
  @ApiOperation({ summary: 'Supprimer une notification (admin)' })
  @ApiResponse({ status: 200, description: 'Notification supprimée' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  // Routes spéciales pour créer des types de notifications spécifiques
  @Post('system')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Créer une notification système (admin)' })
  @ApiResponse({ status: 201, description: 'Notification système créée' })
  createSystemNotification(
    @Body() body: { title: string; message: string; priority?: string; userId?: string }
  ) {
    return this.notificationsService.createSystemNotification(
      body.title,
      body.message,
      body.priority as any,
      body.userId
    );
  }

  @Post('maintenance')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Créer une notification de maintenance (admin)' })
  @ApiResponse({ status: 201, description: 'Notification de maintenance créée' })
  createMaintenanceNotification(
    @Body() body: { title: string; message: string; relatedEntityId?: string; relatedEntityType?: string }
  ) {
    return this.notificationsService.createMaintenanceNotification(
      body.title,
      body.message,
      body.relatedEntityId,
      body.relatedEntityType
    );
  }

  @Post('equipment-alert')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Créer une alerte équipement (admin)' })
  @ApiResponse({ status: 201, description: 'Alerte équipement créée' })
  createEquipmentAlert(
    @Body() body: { equipmentId: string; title: string; message: string; priority?: string }
  ) {
    return this.notificationsService.createEquipmentAlert(
      body.equipmentId,
      body.title,
      body.message,
      body.priority as any
    );
  }

  @Post('site-alert')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Créer une alerte site (admin)' })
  @ApiResponse({ status: 201, description: 'Alerte site créée' })
  createSiteAlert(
    @Body() body: { siteId: string; title: string; message: string; priority?: string }
  ) {
    return this.notificationsService.createSiteAlert(
      body.siteId,
      body.title,
      body.message,
      body.priority as any
    );
  }
} 
