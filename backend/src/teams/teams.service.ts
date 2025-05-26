import { Injectable, NotFoundException, ConflictException, Inject, Scope, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Team, TeamStatus } from './entities/team.entity';
import { CreateTeamDto, UpdateTeamDto, TeamFilterDto } from './dto/team.dto';
import { DepartmentsService } from '../departments/departments.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../services/email.service';
import { EquipmentType } from '../entities/equipment.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    private departmentsService: DepartmentsService,
    private usersService: UsersService,
    private emailService: EmailService,
    @Inject(REQUEST) private request: Request,
  ) {}

  private getCurrentUser() {
    return this.request.user as any;
  }

  private applyDepartmentFilter(query: any) {
    const user = this.getCurrentUser();
    if (user && user.isDepartmentAdmin && !user.isAdmin && user.departmentId) {
      // Si c'est un admin de département, filtrer par son département
      if (query.where && typeof query.where === 'object') {
        query.where.departmentId = user.departmentId;
      } else {
        query.where = { departmentId: user.departmentId };
      }
    }
    return query;
  }

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const user = this.getCurrentUser();

    // Si c'est un admin de département, forcer l'utilisation de son propre département
    if (user && user.isDepartmentAdmin && !user.isAdmin && user.departmentId) {
      createTeamDto.departmentId = user.departmentId;
    }
    
    // Vérifier si le département existe si un ID est fourni
    if (createTeamDto.departmentId) {
      const department = await this.departmentsService.findOne(createTeamDto.departmentId);
      if (!department) {
        throw new NotFoundException(`Département avec l'ID ${createTeamDto.departmentId} introuvable`);
      }
    }

    // Traitement du tableau equipmentTypes s'il est fourni
    if (createTeamDto.equipmentTypes && createTeamDto.equipmentTypes.length > 0) {
      // Si equipmentType n'est pas défini mais que equipmentTypes contient des éléments,
      // prendre le premier élément du tableau
      if (!createTeamDto.equipmentType) {
        createTeamDto.equipmentType = createTeamDto.equipmentTypes[0];
      }
    }

    const team = this.teamsRepository.create({
      id: uuidv4(),
      ...createTeamDto,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    try {
      const savedTeam = await this.teamsRepository.save(team);
      
      // Créer un compte utilisateur pour l'équipe si demandé
      if (createTeamDto.createAccount === true) {
        await this.createTeamUser(savedTeam, createTeamDto);
      }
      
      return savedTeam;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Une équipe avec ce nom existe déjà');
      }
      throw error;
    }
  }

  // Méthode pour créer un compte utilisateur associé à l'équipe
  private async createTeamUser(team: Team, createTeamDto: CreateTeamDto): Promise<void> {
    try {
      // Utiliser l'email fourni ou celui du responsable d'équipe
      const email = createTeamDto.userEmail || createTeamDto.leadContact;
      
      if (!email) {
        this.logger.warn(`Impossible de créer un compte utilisateur pour l'équipe ${team.id}: aucun email fourni`);
        return;
      }
      
      // Générer un nom d'utilisateur basé sur le nom de l'équipe
      const username = `team_${team.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      
      // Utiliser le mot de passe fourni ou en générer un aléatoire
      const password = createTeamDto.password || this.generateRandomPassword();
      
      // Créer le DTO pour l'utilisateur de l'équipe
      const createUserDto = {
        username,
        password,
        email,
        firstName: team.leadName?.split(' ')[0] || 'Team',
        lastName: team.leadName?.split(' ').slice(1).join(' ') || team.name,
        departmentId: team.departmentId,
        teamId: team.id,
        isTeamMember: true,
        hasDepartmentRights: createTeamDto.hasDepartmentRights || false
      };
      
      // Créer l'utilisateur
      const user = await this.usersService.createTeamUser(createUserDto);
      
      // Envoyer un email avec les identifiants
      await this.emailService.sendCredentialsEmail(
        email,
        username,
        password,
        createUserDto.firstName,
        createUserDto.lastName,
        createUserDto.hasDepartmentRights // Indiquer si l'utilisateur a des droits de département
      );
      
      this.logger.log(`Compte utilisateur créé pour l'équipe: ${team.name}`);
    } catch (error) {
      this.logger.error(`Erreur lors de la création du compte pour l'équipe ${team.id}: ${error.message}`);
      // Ne pas bloquer la création de l'équipe si la création du compte échoue
    }
  }
  
  private generateRandomPassword(): string {
    // Générer un mot de passe aléatoire (12 caractères)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async findAll(filterDto?: TeamFilterDto): Promise<Team[]> {
    const { status, departmentId, equipmentType, search } = filterDto || {};
    const where: FindOptionsWhere<Team> = { isDeleted: false };

    // Appliquer les filtres standard
    if (status) {
      where.status = status;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (equipmentType) {
      where.equipmentType = equipmentType;
    }

    // Appliquer le filtre de département basé sur l'utilisateur
    const user = this.getCurrentUser();
    if (user && user.isDepartmentAdmin && !user.isAdmin && user.departmentId) {
      where.departmentId = user.departmentId;
    }

    if (search) {
      const searchQuery = [
        { name: Like(`%${search}%`), isDeleted: false },
        { description: Like(`%${search}%`), isDeleted: false },
        { leadName: Like(`%${search}%`), isDeleted: false },
        { location: Like(`%${search}%`), isDeleted: false }
      ];

      // Appliquer le filtre de département à chaque condition de recherche si nécessaire
      if (user && user.isDepartmentAdmin && !user.isAdmin && user.departmentId) {
        for (const condition of searchQuery) {
          condition['departmentId'] = user.departmentId;
        }
      }

      return this.teamsRepository.find({
        where: searchQuery,
        relations: ['department', 'sites'],
      });
    }

    return this.teamsRepository.find({
      where,
      relations: ['department', 'sites'],
    });
  }

  async findByDepartment(departmentId: string): Promise<Team[]> {
    const user = this.getCurrentUser();
    
    // Si c'est un admin de département, vérifier qu'il a accès à ce département
    if (user && user.isDepartmentAdmin && !user.isAdmin && user.departmentId && user.departmentId !== departmentId) {
      throw new NotFoundException(`Département avec l'ID ${departmentId} introuvable ou accès non autorisé`);
    }

    return this.teamsRepository.find({
      where: { departmentId, isDeleted: false },
      relations: ['department', 'sites'],
    });
  }

  async findByEquipmentType(equipmentType: EquipmentType): Promise<Team[]> {
    const query = {
      where: { equipmentType, isDeleted: false },
      relations: ['department', 'sites'],
    };
    
    return this.teamsRepository.find(this.applyDepartmentFilter(query));
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamsRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['department', 'sites'],
    });

    if (!team) {
      throw new NotFoundException(`Équipe avec l'ID ${id} introuvable`);
    }

    // Vérifier si l'utilisateur a accès à cette équipe
    const user = this.getCurrentUser();
    if (user && user.isDepartmentAdmin && !user.isAdmin && user.departmentId && team.departmentId !== user.departmentId) {
      throw new NotFoundException(`Équipe avec l'ID ${id} introuvable ou accès non autorisé`);
    }

    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOne(id);
    const user = this.getCurrentUser();

    // Si c'est un admin de département, vérifier qu'il a accès à cette équipe
    if (user && user.isDepartmentAdmin && !user.isAdmin && user.departmentId) {
      if (team.departmentId !== user.departmentId) {
        throw new NotFoundException(`Équipe avec l'ID ${id} introuvable ou accès non autorisé`);
      }
      
      // Forcer l'utilisation du même département
      if (updateTeamDto.departmentId && updateTeamDto.departmentId !== user.departmentId) {
        throw new ConflictException(`Vous ne pouvez pas changer le département de cette équipe`);
      }
      
      // S'assurer que le département reste le même
      updateTeamDto.departmentId = user.departmentId;
    }

    // Vérifier si le département existe si un ID est fourni
    if (updateTeamDto.departmentId) {
      const department = await this.departmentsService.findOne(updateTeamDto.departmentId);
      if (!department) {
        throw new NotFoundException(`Département avec l'ID ${updateTeamDto.departmentId} introuvable`);
      }
    }

    Object.assign(team, updateTeamDto);
    return this.teamsRepository.save(team);
  }

  async remove(id: string): Promise<void> {
    const team = await this.findOne(id);
    
    // Vérifier que l'utilisateur a les droits de suppression 
    const user = this.getCurrentUser();
    if (user && user.isDepartmentAdmin && !user.isAdmin && user.departmentId) {
      if (team.departmentId !== user.departmentId) {
        throw new NotFoundException(`Équipe avec l'ID ${id} introuvable ou accès non autorisé`);
      }
    }
    
    // Marquer les utilisateurs associés comme supprimés
    await this.usersService.deleteTeamUsers(id);
    
    // Marquer cette équipe comme supprimée
    team.isDeleted = true;
    await this.teamsRepository.save(team);
  }

  async getStatistics(): Promise<any> {
    const user = this.getCurrentUser();
    let queryBuilder = this.teamsRepository.createQueryBuilder('team');
    
    // Filtrer par département si c'est un admin de département
    if (user && user.isDepartmentAdmin && !user.isAdmin && user.departmentId) {
      queryBuilder = queryBuilder.where('team.departmentId = :departmentId', { departmentId: user.departmentId });
    }
    
    const totalTeams = await queryBuilder.getCount();
    
    // Réinitialiser le queryBuilder pour chaque requête
    queryBuilder = this.teamsRepository.createQueryBuilder('team');
    if (user && user.isDepartmentAdmin && !user.isAdmin && user.departmentId) {
      queryBuilder = queryBuilder.where('team.departmentId = :departmentId', { departmentId: user.departmentId });
    }
    const activeTeams = await queryBuilder.andWhere('team.status = :status', { status: TeamStatus.ACTIVE }).getCount();
    
    queryBuilder = this.teamsRepository.createQueryBuilder('team');
    if (user && user.isDepartmentAdmin && !user.isAdmin && user.departmentId) {
      queryBuilder = queryBuilder.where('team.departmentId = :departmentId', { departmentId: user.departmentId });
    }
    const standbyTeams = await queryBuilder.andWhere('team.status = :status', { status: TeamStatus.STANDBY }).getCount();
    
    queryBuilder = this.teamsRepository.createQueryBuilder('team');
    if (user && user.isDepartmentAdmin && !user.isAdmin && user.departmentId) {
      queryBuilder = queryBuilder.where('team.departmentId = :departmentId', { departmentId: user.departmentId });
    }
    const inactiveTeams = await queryBuilder.andWhere('team.status = :status', { status: TeamStatus.INACTIVE }).getCount();
    
    // Pour les statistiques par département, si c'est un admin de département, montrer uniquement son département
    let teamsByDepartment = [];
    if (user && user.isDepartmentAdmin && !user.isAdmin && user.departmentId) {
      const department = await this.departmentsService.findOne(user.departmentId);
      teamsByDepartment = [{
        departmentName: department.name,
        count: totalTeams
      }];
    } else {
      teamsByDepartment = await this.teamsRepository
      .createQueryBuilder('team')
      .select('department.name', 'departmentName')
      .addSelect('COUNT(team.id)', 'count')
      .leftJoin('team.department', 'department')
      .groupBy('department.name')
      .getRawMany();
    }
    
    // Pour les statistiques par type d'équipement
    let queryBuilderByType = this.teamsRepository.createQueryBuilder('team');
    if (user && user.isDepartmentAdmin && !user.isAdmin && user.departmentId) {
      queryBuilderByType = queryBuilderByType.where('team.departmentId = :departmentId', { departmentId: user.departmentId });
    }
    const teamsByEquipmentType = await queryBuilderByType
      .select('team.equipmentType', 'equipmentType')
      .addSelect('COUNT(team.id)', 'count')
      .groupBy('team.equipmentType')
      .getRawMany();

    return {
      total: totalTeams,
      byStatus: {
        active: activeTeams,
        standby: standbyTeams,
        inactive: inactiveTeams
      },
      byDepartment: teamsByDepartment,
      byEquipmentType: teamsByEquipmentType
    };
  }
} 