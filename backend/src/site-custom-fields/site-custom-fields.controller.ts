import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SiteCustomFieldsService, CreateCustomFieldDto, UpdateCustomFieldDto, CreateBackupDto, FieldAnalysisResult } from './site-custom-fields.service';
import { SiteCustomField } from '../entities/site-custom-field.entity';
import { SiteCustomFieldBackup } from '../entities/site-custom-field-backup.entity';
import { Department } from '../entities/department.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Sites - Champs Personnalisés')
@Controller('site-custom-fields')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SiteCustomFieldsController {
  constructor(private readonly customFieldsService: SiteCustomFieldsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les champs personnalisés' })
  @ApiResponse({
    status: 200,
    description: 'Liste des champs personnalisés récupérée avec succès'
  })
  findAll(): Promise<SiteCustomField[]> {
    return this.customFieldsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Récupérer les champs personnalisés actifs' })
  @ApiResponse({
    status: 200,
    description: 'Liste des champs personnalisés actifs récupérée avec succès'
  })
  findActive(
    @Query('departmentId') departmentId?: string,
    @Query('isAdmin') isAdmin?: boolean
  ): Promise<SiteCustomField[]> {
    if (departmentId) {
      return this.customFieldsService.findActiveForDepartment(departmentId, isAdmin || false);
    }
    return this.customFieldsService.findActive();
  }

  @Get('departments')
  @ApiOperation({ summary: 'Récupérer tous les départements actifs' })
  @ApiResponse({
    status: 200,
    description: 'Liste des départements récupérée avec succès'
  })
  getAllDepartments(): Promise<Department[]> {
    return this.customFieldsService.getAllDepartments();
  }

  // ===== ENDPOINTS POUR LA GESTION DES SAUVEGARDES (ADMIN UNIQUEMENT) =====

  @Get('backups')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Récupérer toutes les sauvegardes (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des sauvegardes récupérée avec succès'
  })
  getAllBackups(): Promise<SiteCustomFieldBackup[]> {
    return this.customFieldsService.getAllBackups();
  }

  @Get('backups/:backupId')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Récupérer une sauvegarde par ID (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Sauvegarde récupérée avec succès'
  })
  getBackupById(@Param('backupId') backupId: string): Promise<SiteCustomFieldBackup> {
    return this.customFieldsService.getBackupById(backupId);
  }

  @Post('backups')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Créer une sauvegarde d\'un champ personnalisé (Admin uniquement)' })
  @ApiResponse({
    status: 201,
    description: 'Sauvegarde créée avec succès'
  })
  createBackup(@Body() createBackupDto: CreateBackupDto): Promise<SiteCustomFieldBackup> {
    return this.customFieldsService.createBackup(createBackupDto);
  }

  @Post('backups/:backupId/restore')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Restaurer un champ depuis une sauvegarde (Admin uniquement)' })
  @ApiResponse({
    status: 201,
    description: 'Champ restauré avec succès'
  })
  restoreFromBackup(@Param('backupId') backupId: string): Promise<SiteCustomField> {
    return this.customFieldsService.restoreFromBackup(backupId);
  }

  @Delete('backups/:backupId')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Supprimer une sauvegarde (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Sauvegarde supprimée avec succès'
  })
  deleteBackup(@Param('backupId') backupId: string): Promise<void> {
    return this.customFieldsService.deleteBackup(backupId);
  }

  @Delete('backups/cleanup')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Nettoyer les anciennes sauvegardes (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Nettoyage des sauvegardes effectué avec succès'
  })
  cleanOldBackups(
    @Body() data: { olderThanDays?: number }
  ): Promise<{ deletedCount: number }> {
    return this.customFieldsService.cleanOldBackups(data.olderThanDays);
  }

  // ===== AUTRES ENDPOINTS =====

  // Routes spécifiques AVANT les routes avec paramètres dynamiques

  @Put('sort-order')
  @ApiOperation({ summary: 'Mettre à jour l\'ordre des champs personnalisés' })
  @ApiResponse({
    status: 200,
    description: 'Ordre des champs personnalisés mis à jour avec succès'
  })
  updateSortOrder(@Body() data: { fieldIds: string[] }): Promise<void> {
    return this.customFieldsService.updateSortOrder(data.fieldIds);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Valider les valeurs des champs personnalisés' })
  @ApiResponse({
    status: 200,
    description: 'Validation effectuée avec succès'
  })
  validateCustomValues(
    @Body() data: { values: Record<string, any> }
  ): Promise<{ isValid: boolean; errors: string[] }> {
    return this.customFieldsService.validateCustomValues(data.values);
  }

  @Post('clean')
  @ApiOperation({ summary: 'Nettoyer les valeurs personnalisées' })
  @ApiResponse({
    status: 200,
    description: 'Valeurs nettoyées avec succès'
  })
  cleanCustomValues(
    @Body() data: { values: Record<string, any> }
  ): Promise<Record<string, any>> {
    return this.customFieldsService.cleanCustomValues(data.values);
  }

  @Post('apply-defaults')
  @ApiOperation({ summary: 'Appliquer les valeurs par défaut' })
  @ApiResponse({
    status: 200,
    description: 'Valeurs par défaut appliquées avec succès'
  })
  applyDefaultValues(
    @Body() data: { values?: Record<string, any> }
  ): Promise<Record<string, any>> {
    return this.customFieldsService.applyDefaultValues(data.values);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau champ personnalisé' })
  @ApiResponse({
    status: 201,
    description: 'Champ personnalisé créé avec succès'
  })
  create(@Body() createDto: CreateCustomFieldDto): Promise<SiteCustomField> {
    return this.customFieldsService.create(createDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un champ personnalisé par ID' })
  @ApiResponse({
    status: 200,
    description: 'Champ personnalisé récupéré avec succès'
  })
  findOne(@Param('id') id: string): Promise<SiteCustomField> {
    return this.customFieldsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un champ personnalisé' })
  @ApiResponse({
    status: 200,
    description: 'Champ personnalisé mis à jour avec succès'
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateCustomFieldDto): Promise<SiteCustomField> {
    return this.customFieldsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un champ personnalisé' })
  @ApiResponse({
    status: 200,
    description: 'Champ personnalisé supprimé avec succès'
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.customFieldsService.remove(id);
  }

  @Put(':id/toggle-active')
  @ApiOperation({ summary: 'Activer/désactiver un champ personnalisé' })
  @ApiResponse({
    status: 200,
    description: 'Statut du champ personnalisé modifié avec succès'
  })
  toggleActive(@Param('id') id: string): Promise<SiteCustomField> {
    return this.customFieldsService.toggleActive(id);
  }

  // ===== NOUVEAUX ENDPOINTS POUR L'ANALYSE ET LA SÉCURITÉ =====

  @Post(':id/analyze-deletion')
  @ApiOperation({ summary: 'Analyser l\'impact de la suppression d\'un champ personnalisé' })
  @ApiResponse({
    status: 200,
    description: 'Analyse d\'impact effectuée avec succès'
  })
  analyzeFieldDeletion(@Param('id') id: string): Promise<FieldAnalysisResult> {
    return this.customFieldsService.analyzeFieldDeletion(id);
  }

  @Post(':id/analyze-modification')
  @ApiOperation({ summary: 'Analyser l\'impact de la modification d\'un champ personnalisé' })
  @ApiResponse({
    status: 200,
    description: 'Analyse d\'impact effectuée avec succès'
  })
  analyzeFieldModification(
    @Param('id') id: string, 
    @Body() updateDto: UpdateCustomFieldDto
  ): Promise<FieldAnalysisResult> {
    return this.customFieldsService.analyzeFieldModification(id, updateDto);
  }
} 
