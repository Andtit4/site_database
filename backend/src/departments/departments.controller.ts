import { Controller, Get, Post, Body, Param, Delete, Put, Query, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentFilterDto } from '../dto/department.dto';
import { Department } from '../entities/department.entity';
import { EquipmentType } from '../entities/equipment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { DepartmentAdminGuard } from '../auth/guards/department-admin.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('departments')
@Controller('departments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @ApiOperation({ summary: 'Créer un nouveau département', description: 'Crée un département et optionnellement un compte utilisateur associé' })
  @ApiBody({ type: CreateDepartmentDto })
  @ApiResponse({ status: 201, description: 'Département créé avec succès', type: Department })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Post()
  @UseGuards(AdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    return this.departmentsService.create(createDepartmentDto);
  }

  @ApiOperation({ summary: 'Récupérer tous les départements', description: 'Retourne la liste des départements avec possibilité de filtrage' })
  @ApiQuery({ type: DepartmentFilterDto, required: false })
  @ApiResponse({ status: 200, description: 'Liste des départements récupérée avec succès', type: [Department] })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Get()
  @UseGuards(DepartmentAdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() filterDto: DepartmentFilterDto): Promise<Department[]> {
    return this.departmentsService.findAll(filterDto);
  }

  @ApiOperation({ summary: 'Statistiques des départements', description: 'Récupère les statistiques globales des départements' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Get('statistics')
  @UseGuards(DepartmentAdminGuard)
  getStatistics() {
    return this.departmentsService.getStatistics();
  }

  @ApiOperation({ summary: 'Départements par type d\'équipement', description: 'Retourne les départements qui gèrent un type d\'équipement spécifique' })
  @ApiParam({ name: 'type', description: 'Type d\'équipement', enum: EquipmentType })
  @ApiResponse({ status: 200, description: 'Liste des départements récupérée avec succès', type: [Department] })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Get('equipment-type/:type')
  @UseGuards(DepartmentAdminGuard)
  findByEquipmentType(@Param('type') type: EquipmentType): Promise<Department[]> {
    const filterDto: DepartmentFilterDto = { managesEquipmentType: type };
    return this.departmentsService.findAll(filterDto);
  }

  @ApiOperation({ summary: 'Récupérer un département', description: 'Retourne les détails d\'un département spécifique' })
  @ApiParam({ name: 'id', description: 'Identifiant du département' })
  @ApiResponse({ status: 200, description: 'Département récupéré avec succès', type: Department })
  @ApiResponse({ status: 404, description: 'Département non trouvé' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Get(':id')
  @UseGuards(DepartmentAdminGuard)
  findOne(@Param('id') id: string): Promise<Department> {
    return this.departmentsService.findOne(id);
  }

  @ApiOperation({ summary: 'Mettre à jour un département', description: 'Met à jour les informations d\'un département existant' })
  @ApiParam({ name: 'id', description: 'Identifiant du département' })
  @ApiBody({ type: UpdateDepartmentDto })
  @ApiResponse({ status: 200, description: 'Département mis à jour avec succès', type: Department })
  @ApiResponse({ status: 404, description: 'Département non trouvé' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Put(':id')
  @UseGuards(AdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @ApiOperation({ summary: 'Supprimer un département', description: 'Supprime un département de la base de données. Cette action est réservée aux administrateurs. Les équipements associés seront supprimés et les utilisateurs liés au département seront conservés mais leur lien au département sera effacé.' })
  @ApiParam({ name: 'id', description: 'Identifiant du département' })
  @ApiResponse({ status: 200, description: 'Département supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Département non trouvé' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès refusé - réservé aux administrateurs' })
  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.departmentsService.remove(id);
  }
} 