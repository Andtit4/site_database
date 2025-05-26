import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateDepartmentUserDto } from './dto/create-department-user.dto';
import { UsersService } from '../users/users.service';
import { AdminGuard } from './guards/admin.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @ApiOperation({ summary: 'Connexion utilisateur', description: 'Permet à un utilisateur de se connecter et obtenir un token JWT' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Connexion réussie, retourne un token JWT' })
  @ApiResponse({ status: 401, description: 'Identifiants incorrects' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  @ApiOperation({ summary: 'Profil utilisateur', description: 'Récupère les informations de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur récupéré avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé - Token JWT manquant ou invalide' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return req.user;
  }

  @ApiOperation({ summary: 'Créer un administrateur', description: 'Permet à un administrateur existant de créer un nouvel administrateur' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 201, description: 'Administrateur créé avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé - Token JWT manquant ou invalide' })
  @ApiResponse({ status: 403, description: 'Interdit - L\'utilisateur n\'est pas administrateur' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    const admin = await this.usersService.createAdmin(createAdminDto);
    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      isAdmin: admin.isAdmin,
      createdAt: admin.createdAt
    };
  }

  @ApiOperation({ summary: 'Créer un utilisateur de département', description: 'Permet à un administrateur de créer un utilisateur lié à un département' })
  @ApiBody({ type: CreateDepartmentUserDto })
  @ApiResponse({ status: 201, description: 'Utilisateur de département créé avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé - Token JWT manquant ou invalide' })
  @ApiResponse({ status: 403, description: 'Interdit - L\'utilisateur n\'est pas administrateur' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('department/create')
  @HttpCode(HttpStatus.CREATED)
  async createDepartmentUser(@Body() createDepartmentUserDto: CreateDepartmentUserDto) {
    const departmentUser = await this.usersService.createDepartmentUser(createDepartmentUserDto);
    return {
      id: departmentUser.id,
      username: departmentUser.username,
      email: departmentUser.email,
      firstName: departmentUser.firstName,
      lastName: departmentUser.lastName,
      isDepartmentAdmin: departmentUser.isDepartmentAdmin,
      departmentId: departmentUser.departmentId,
      createdAt: departmentUser.createdAt
    };
  }

  @ApiOperation({ summary: 'Configuration initiale administrateur', description: 'Permet de créer le premier administrateur avec une clé de configuration' })
  @ApiBody({ type: CreateAdminDto })
  @ApiQuery({ name: 'setupKey', description: 'Clé de configuration sécurisée définie dans les variables d\'environnement', required: true })
  @ApiResponse({ status: 201, description: 'Administrateur initial créé avec succès' })
  @ApiResponse({ status: 400, description: 'Erreur - Clé de configuration invalide ou administrateur déjà existant' })
  @Post('setup/admin')
  @HttpCode(HttpStatus.CREATED)
  async setupInitialAdmin(
    @Body() createAdminDto: CreateAdminDto,
    @Query('setupKey') setupKey: string
  ) {
    // Vérifier la clé de configuration
    const expectedSetupKey = process.env.ADMIN_SETUP_KEY;
    if (!expectedSetupKey || setupKey !== expectedSetupKey) {
      throw new Error('Clé de configuration invalide ou manquante');
    }

    // Vérifier si des administrateurs existent déjà
    const adminsCount = await this.authService.countAdmins();
    if (adminsCount > 0) {
      throw new Error('Un administrateur existe déjà. Utilisez la route protégée pour créer des administrateurs supplémentaires.');
    }

    // Créer le premier administrateur
    const admin = await this.usersService.createAdmin(createAdminDto);
    return {
      message: 'Administrateur initial créé avec succès',
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        isAdmin: admin.isAdmin,
        createdAt: admin.createdAt
      }
    };
  }
} 