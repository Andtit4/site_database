import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe, Put, UseGuards } from '@nestjs/common';
import { SitesService } from './sites.service';
import { CreateSiteDto, UpdateSiteDto, SiteFilterDto } from '../dto/site.dto';
import { Site } from '../entities/site.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { DepartmentAdminGuard } from '../auth/guards/department-admin.guard';

@ApiTags('sites')
@Controller('sites')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @ApiOperation({ summary: 'Créer un nouveau site', description: 'Ajoute un nouveau site dans la base de données' })
  @ApiBody({ type: CreateSiteDto })
  @ApiResponse({ status: 201, description: 'Site créé avec succès', type: Site })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Post()
  @UseGuards(AdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createSiteDto: CreateSiteDto) {
    return this.sitesService.create(createSiteDto);
  }

  @ApiOperation({ summary: 'Récupérer tous les sites', description: 'Retourne la liste des sites avec possibilité de filtrage' })
  @ApiQuery({ type: SiteFilterDto, required: false })
  @ApiResponse({ status: 200, description: 'Liste des sites récupérée avec succès', type: [Site] })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Get()
  @UseGuards(DepartmentAdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() filterDto: SiteFilterDto) {
    return this.sitesService.findAll(filterDto);
  }

  @ApiOperation({ summary: 'Statistiques des sites', description: 'Récupère les statistiques globales des sites' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Get('statistics')
  @UseGuards(DepartmentAdminGuard)
  getStatistics() {
    return this.sitesService.getStatistics();
  }

  @ApiOperation({ summary: 'Récupérer un site', description: 'Retourne les détails d\'un site spécifique' })
  @ApiParam({ name: 'id', description: 'Identifiant du site', example: 'SITE001' })
  @ApiResponse({ status: 200, description: 'Site récupéré avec succès', type: Site })
  @ApiResponse({ status: 404, description: 'Site non trouvé' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Get(':id')
  @UseGuards(DepartmentAdminGuard)
  findOne(@Param('id') id: string) {
    return this.sitesService.findOne(id);
  }

  @ApiOperation({ summary: 'Mettre à jour un site', description: 'Met à jour les informations d\'un site existant' })
  @ApiParam({ name: 'id', description: 'Identifiant du site', example: 'SITE001' })
  @ApiBody({ type: UpdateSiteDto })
  @ApiResponse({ status: 200, description: 'Site mis à jour avec succès', type: Site })
  @ApiResponse({ status: 404, description: 'Site non trouvé' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Patch(':id')
  @UseGuards(AdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateSiteDto: UpdateSiteDto) {
    return this.sitesService.update(id, updateSiteDto);
  }

  @ApiOperation({ summary: 'Supprimer un site', description: 'Supprime un site de la base de données' })
  @ApiParam({ name: 'id', description: 'Identifiant du site', example: 'SITE001' })
  @ApiResponse({ status: 200, description: 'Site supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Site non trouvé' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.sitesService.remove(id);
  }

  @ApiOperation({ summary: 'Assigner des équipes à un site', description: 'Associe des équipes existantes à un site' })
  @ApiParam({ name: 'id', description: 'Identifiant du site', example: 'SITE001' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        teamIds: {
          type: 'array',
          items: {
            type: 'string'
          },
          example: ['TEAM001', 'TEAM002']
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Équipes assignées avec succès' })
  @ApiResponse({ status: 404, description: 'Site ou équipe non trouvé' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Put(':id/teams')
  @UseGuards(DepartmentAdminGuard)
  async assignTeams(
    @Param('id') id: string,
    @Body() body: { teamIds: string[] }
  ) {
    return this.sitesService.assignTeams(id, body.teamIds);
  }

  @ApiOperation({ summary: 'Retirer des équipes d\'un site', description: 'Supprime l\'association entre des équipes et un site' })
  @ApiParam({ name: 'id', description: 'Identifiant du site', example: 'SITE001' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        teamIds: {
          type: 'array',
          items: {
            type: 'string'
          },
          example: ['TEAM001', 'TEAM002']
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Équipes retirées avec succès' })
  @ApiResponse({ status: 404, description: 'Site non trouvé' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Delete(':id/teams')
  @UseGuards(DepartmentAdminGuard)
  async removeTeams(
    @Param('id') id: string,
    @Body() body: { teamIds: string[] }
  ) {
    return this.sitesService.removeTeams(id, body.teamIds);
  }

  @ApiOperation({ summary: 'Obtenir les équipes d\'un site', description: 'Récupère la liste des équipes associées à un site' })
  @ApiParam({ name: 'id', description: 'Identifiant du site', example: 'SITE001' })
  @ApiResponse({ status: 200, description: 'Liste des équipes du site récupérée avec succès' })
  @ApiResponse({ status: 404, description: 'Site non trouvé' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Get(':id/teams')
  @UseGuards(DepartmentAdminGuard)
  async getSiteTeams(@Param('id') id: string) {
    return this.sitesService.getSiteTeams(id);
  }
} 