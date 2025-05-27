import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { SiteSpecificationsService } from './site-specifications.service';
import { CreateSiteSpecificationDto } from './dto/create-site-specification.dto';
import { UpdateSiteSpecificationDto } from './dto/update-site-specification.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('site-specifications')
@Controller('site-specifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SiteSpecificationsController {
  constructor(private readonly siteSpecificationsService: SiteSpecificationsService) {}

  @Get()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Récupérer toutes les spécifications de sites' })
  @ApiResponse({ status: 200, description: 'Liste des spécifications de sites' })
  findAll() {
    return this.siteSpecificationsService.findAll();
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
  create(@Body() createSiteSpecificationDto: CreateSiteSpecificationDto) {
    return this.siteSpecificationsService.create(createSiteSpecificationDto);
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
} 
