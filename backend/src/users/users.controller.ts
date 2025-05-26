import { Controller, Post, Body, Patch, Param, Get, UseGuards, Request, HttpStatus, HttpCode, Query, BadRequestException, InternalServerErrorException, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CreateDepartmentUserDto, ChangePasswordDto, UpdateProfileDto, CreateUserDto, UpdateUserDto } from '../dto/users.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'L\'utilisateur a été créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiBearerAuth('JWT-auth')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      departmentId: user.departmentId,
      isDepartmentAdmin: user.isDepartmentAdmin,
      hasDepartmentRights: user.hasDepartmentRights,
      managedEquipmentTypes: user.managedEquipmentTypes,
      createdAt: user.createdAt
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs récupérée avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiBearerAuth('JWT-auth')
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Récupérer un utilisateur par son ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur récupéré avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiBearerAuth('JWT-auth')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiBearerAuth('JWT-auth')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiBearerAuth('JWT-auth')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Post('department')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Créer un utilisateur de département' })
  @ApiResponse({ status: 201, description: 'L\'utilisateur a été créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiBearerAuth('JWT-auth')
  async createDepartmentUser(@Body() createDepartmentUserDto: CreateDepartmentUserDto) {
    const user = await this.usersService.createDepartmentUser(createDepartmentUserDto);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      departmentId: user.departmentId,
      isDepartmentAdmin: user.isDepartmentAdmin,
      hasDepartmentRights: user.hasDepartmentRights,
      createdAt: user.createdAt
    };
  }

  @Get('check-username')
  @ApiOperation({ summary: 'Vérifier la disponibilité d\'un nom d\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Disponibilité vérifiée' })
  @ApiQuery({ name: 'username', required: true, description: 'Nom d\'utilisateur à vérifier' })
  async checkUsernameAvailability(@Query('username') username: string, @Request() req) {
    const currentUser = req.user ? req.user.id : null;
    const available = await this.usersService.isUsernameAvailable(username, currentUser);
    return { available };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour le profil utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil mis à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiBearerAuth('JWT-auth')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(req.user.id, updateProfileDto);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      departmentId: user.departmentId,
      isDepartmentAdmin: user.isDepartmentAdmin,
      hasDepartmentRights: user.hasDepartmentRights,
      managedEquipmentTypes: user.managedEquipmentTypes,
      updatedAt: user.updatedAt
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Changer le mot de passe de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Mot de passe changé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiBearerAuth('JWT-auth')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    try {
      const success = await this.usersService.changePassword(req.user.id, changePasswordDto.password);
      if (success) {
        return { message: 'Mot de passe changé avec succès' };
      } else {
        throw new InternalServerErrorException('Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      throw new BadRequestException('Erreur lors du changement de mot de passe: ' + error.message);
    }
  }
} 