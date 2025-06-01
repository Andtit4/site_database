import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Inject, Req } from '@nestjs/common';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { SiteSpecificationsService } from './site-specifications.service';

// import type { CreateSiteSpecificationDto } from './dto/create-site-specification.dto';
import type { UpdateSiteSpecificationDto } from './dto/update-site-specification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('site-specifications')
@Controller('site-specifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SiteSpecificationsController {
  constructor(
    @Inject(SiteSpecificationsService)
    private readonly siteSpecificationsService: SiteSpecificationsService
  ) {}

  @Get()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Récupérer toutes les spécifications de sites' })
  @ApiResponse({ status: 200, description: 'Liste des spécifications de sites' })
  async findAll() {
    try {
      const result = await this.siteSpecificationsService.findAll();

      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des spécifications:', error);
      throw error;
    }
  }

  @Get('type/:siteType')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Récupérer les spécifications par type de site' })
  @ApiResponse({ status: 200, description: 'Spécifications trouvées' })
  @ApiResponse({ status: 404, description: 'Aucune spécification trouvée pour ce type de site' })
  findByType(@Param('siteType') siteType: string) {
    return this.siteSpecificationsService.findByType(siteType);
  }

  @Get(':id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Récupérer une spécification par ID' })
  @ApiResponse({ status: 200, description: 'Spécification trouvée' })
  @ApiResponse({ status: 404, description: 'Spécification non trouvée' })
  findOne(@Param('id') id: string) {
    return this.siteSpecificationsService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Créer une nouvelle spécification de site' })
  @ApiResponse({ status: 201, description: 'Spécification créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Req() req) {
    // Récupérer les données brutes du corps de la requête
    const rawData = req.body;
    
    // Vérifier manuellement les données
    if (!rawData || !rawData.siteType || !rawData.columns) {
      const error = 'Les propriétés siteType et columns sont requises';

      throw new Error(error);
    }
    
    // Construire manuellement un objet DTO
    const dto = {
      siteType: rawData.siteType,
      columns: rawData.columns
    };
    
    try {
      const result = await this.siteSpecificationsService.create(dto);

      return result;
    } catch (error) {
      console.error('Erreur lors de la création de la spécification:', error);
      throw error;
    }
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Mettre à jour une spécification de site' })
  @ApiResponse({ status: 200, description: 'Spécification mise à jour' })
  @ApiResponse({ status: 404, description: 'Spécification non trouvée' })
  update(@Param('id') id: string, @Body() updateSiteSpecificationDto: UpdateSiteSpecificationDto) {
    return this.siteSpecificationsService.update(id, updateSiteSpecificationDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer une spécification de site' })
  @ApiResponse({ status: 200, description: 'Spécification supprimée' })
  @ApiResponse({ status: 404, description: 'Spécification non trouvée' })
  remove(@Param('id') id: string) {
    return this.siteSpecificationsService.remove(id);
  }

  @Get('check-table')
  @Roles('admin')
  @ApiOperation({ summary: 'Vérifier la structure de la table site_specifications' })
  @ApiResponse({ status: 200, description: 'Structure de la table' })
  async checkTable() {
    return this.siteSpecificationsService.checkTableStructure();
  }

  @Get('debug/raw-data')
  @Roles('admin')
  @ApiOperation({ summary: 'Debug: Examiner les données brutes de la base' })
  async debugRawData() {
    return this.siteSpecificationsService.debugRawData();
  }
} 
