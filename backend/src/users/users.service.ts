import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto } from '../auth/dto/create-admin.dto';
import { CreateDepartmentUserDto, CreateTeamUserDto, UpdateProfileDto } from '../dto/users.dto';
import { EmailService } from '../services/email.service';
import { Logger } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../dto/users.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    private emailService: EmailService
  ) {}

  async findOneByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username, isDeleted: false } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id, isDeleted: false } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec ID ${id} non trouvé`);
    }
    return user;
  }

  async create(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ username, password: hashedPassword });
    return this.usersRepository.save(user);
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<User> {
    try {
      const { username, password, email, firstName, lastName } = createAdminDto;
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.findOneByUsername(username);
      if (existingUser) {
        throw new ConflictException(`L'utilisateur avec le nom d'utilisateur ${username} existe déjà`);
      }

      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Création de l'utilisateur administrateur
      const admin = this.usersRepository.create({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        isAdmin: true,
      });
      
      return await this.usersRepository.save(admin);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la création de l\'administrateur');
    }
  }

  async createDepartmentUser(createDepartmentUserDto: CreateDepartmentUserDto): Promise<User> {
    try {
      const { username, password, email, firstName, lastName, departmentId, hasDepartmentRights = false } = createDepartmentUserDto;
      
      const existingUser = await this.findOneByUsername(username);
      if (existingUser) {
        throw new ConflictException(`L'utilisateur avec le nom d'utilisateur ${username} existe déjà`);
      }
      
      const department = await this.departmentsRepository.findOne({ where: { id: departmentId, isDeleted: false } });
      if (!department) {
        throw new NotFoundException(`Le département avec l'ID ${departmentId} n'existe pas`);
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const departmentUser = this.usersRepository.create({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        departmentId,
        isDepartmentAdmin: true,
        isAdmin: false,
        hasDepartmentRights,
        managedEquipmentTypes: hasDepartmentRights ? department.managedEquipmentTypes : []
      });
      
      const savedUser = await this.usersRepository.save(departmentUser);
      
      // Envoyer un email avec les informations d'identification
      await this.emailService.sendCredentialsEmail(email, username, password, firstName, lastName, true);
      
      return savedUser;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la création de l\'utilisateur du département');
    }
  }

  async createTeamUser(createTeamUserDto: CreateTeamUserDto): Promise<User> {
    try {
      const { username, password, email, firstName, lastName, teamId, departmentId, hasDepartmentRights = false } = createTeamUserDto;
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.findOneByUsername(username);
      if (existingUser) {
        throw new ConflictException(`L'utilisateur avec le nom d'utilisateur ${username} existe déjà`);
      }

      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Création de l'utilisateur de l'équipe
      const userToCreate = {
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        teamId,
        isTeamMember: true,
        isDepartmentAdmin: hasDepartmentRights === true,
        isAdmin: false,
        hasDepartmentRights,
        managedEquipmentTypes: [] as string[],
        departmentId: undefined as string | undefined
      };

      // Vérifier si un département est spécifié
      if (departmentId) {
        // Récupérer le département pour hériter des droits si nécessaire
        const department = await this.departmentsRepository.findOne({ 
          where: { id: departmentId, isDeleted: false } 
        });
        
        if (department) {
          userToCreate.departmentId = departmentId;
          
          // Si l'utilisateur a les droits du département, copier les types d'équipements gérés
          if (hasDepartmentRights && department.managedEquipmentTypes) {
            userToCreate.managedEquipmentTypes = Array.isArray(department.managedEquipmentTypes) 
              ? [...department.managedEquipmentTypes] 
              : [];
          }
        }
      }
      
      const teamUser = this.usersRepository.create(userToCreate);
      const savedUser = await this.usersRepository.save(teamUser);
      
      // Envoyer un email avec les identifiants
      await this.emailService.sendCredentialsEmail(
        email, 
        username, 
        password, 
        firstName, 
        lastName,
        hasDepartmentRights === true
      );
      
      return savedUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la création de l'utilisateur d'équipe: ${error.message}`);
      throw new InternalServerErrorException('Erreur lors de la création de l\'utilisateur d\'équipe');
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);
    
    // Vérifier si username existe déjà
    if (updateProfileDto.username && updateProfileDto.username !== user.username) {
      const existingUser = await this.findOneByUsername(updateProfileDto.username);
      if (existingUser) {
        throw new ConflictException(`L'utilisateur avec le nom d'utilisateur ${updateProfileDto.username} existe déjà`);
      }
    }
    
    // Mettre à jour les propriétés
    Object.assign(user, updateProfileDto);
    
    return this.usersRepository.save(user);
  }

  /**
   * Vérifie si un nom d'utilisateur est disponible
   * @param username Le nom d'utilisateur à vérifier
   * @param currentUserId ID de l'utilisateur actuel à exclure de la vérification (optionnel)
   * @returns true si le nom d'utilisateur est disponible, false sinon
   */
  async isUsernameAvailable(username: string, currentUserId?: string): Promise<boolean> {
    const query = this.usersRepository.createQueryBuilder('user')
      .where('user.username = :username', { username });
    
    // Exclure l'utilisateur actuel de la recherche s'il est fourni
    if (currentUserId) {
      query.andWhere('user.id != :currentUserId', { currentUserId });
    }
    
    const count = await query.getCount();
    return count === 0;
  }

  async changePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      if (!newPassword || newPassword.trim() === '') {
        throw new Error('Le mot de passe ne peut pas être vide');
      }
      
      const user = await this.findById(userId);
      
      // Vérifier que le nouveau mot de passe est différent de l'ancien
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        // Ce n'est pas une erreur critique, on peut simplement indiquer que rien n'a changé
        return true;
      }
      
      // Hachage du nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Mise à jour du mot de passe
      user.password = hashedPassword;
      await this.usersRepository.save(user);
      
      // Envoyer un email de confirmation
      if (user.email) {
        try {
          await this.emailService.sendPasswordChangedEmail(
            user.email,
            user.username,
            user.firstName,
            user.lastName
          );
        } catch (emailError) {
          // On ne bloque pas la mise à jour du mot de passe si l'envoi d'email échoue
          this.logger.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
        }
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Erreur lors du changement de mot de passe: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors du changement de mot de passe');
    }
  }

  /**
   * Met à jour ou supprime la relation des utilisateurs avec un département spécifique
   * @param departmentId L'ID du département
   * @param newDepartmentId Le nouvel ID de département (ou null pour supprimer la relation)
   * @returns Le nombre d'utilisateurs mis à jour
   */
  async updateDepartmentUsers(departmentId: string, newDepartmentId: string | null): Promise<number> {
    try {
      this.logger.log(`Mise à jour des utilisateurs liés au département ${departmentId}`);
      
      // Mettre à jour tous les utilisateurs liés à ce département
      const result = await this.usersRepository
        .createQueryBuilder()
        .update(User)
        .set({ departmentId: newDepartmentId, isDepartmentAdmin: newDepartmentId ? true : false })
        .where("departmentId = :departmentId", { departmentId })
        .execute();
      
      this.logger.log(`${result.affected} utilisateurs ont été mis à jour`);
      return result.affected || 0;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour des utilisateurs du département: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la mise à jour des utilisateurs du département');
    }
  }

  /**
   * Supprime tous les utilisateurs associés à un département spécifique
   * @param departmentId L'ID du département
   * @returns Le nombre d'utilisateurs supprimés
   */
  async deleteDepartmentUsers(departmentId: string): Promise<number> {
    try {
      this.logger.log(`Suppression des utilisateurs liés au département ${departmentId}`);
      
      // Trouver tous les utilisateurs liés à ce département
      const users = await this.usersRepository.find({
        where: { departmentId, isDeleted: false }
      });
      
      if (users.length === 0) {
        this.logger.log(`Aucun utilisateur trouvé pour le département ${departmentId}`);
        return 0;
      }
      
      // Marquer les utilisateurs comme supprimés (soft delete)
      const result = await this.usersRepository
        .createQueryBuilder()
        .update(User)
        .set({ isDeleted: true })
        .where("departmentId = :departmentId", { departmentId })
        .andWhere("isDeleted = :isDeleted", { isDeleted: false })
        .execute();
      
      this.logger.log(`${result.affected} utilisateurs ont été marqués comme supprimés`);
      return result.affected || 0;
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression des utilisateurs du département: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la suppression des utilisateurs du département');
    }
  }

  /**
   * Supprime tous les utilisateurs associés à une équipe spécifique
   * @param teamId L'ID de l'équipe
   * @returns Le nombre d'utilisateurs supprimés
   */
  async deleteTeamUsers(teamId: string): Promise<number> {
    try {
      this.logger.log(`Suppression des utilisateurs liés à l'équipe ${teamId}`);
      
      // Trouver tous les utilisateurs liés à cette équipe
      const users = await this.usersRepository.find({
        where: { teamId, isDeleted: false }
      });
      
      if (users.length === 0) {
        this.logger.log(`Aucun utilisateur trouvé pour l'équipe ${teamId}`);
        return 0;
      }
      
      // Marquer les utilisateurs comme supprimés (soft delete)
      const result = await this.usersRepository
        .createQueryBuilder()
        .update(User)
        .set({ isDeleted: true })
        .where("teamId = :teamId", { teamId })
        .andWhere("isDeleted = :isDeleted", { isDeleted: false })
        .execute();
      
      this.logger.log(`${result.affected} utilisateurs de l'équipe ${teamId} ont été marqués comme supprimés`);
      return result.affected || 0;
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression des utilisateurs de l'équipe: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la suppression des utilisateurs de l\'équipe');
    }
  }

  /**
   * Récupère toutes les permissions et droits d'un utilisateur
   * @param userId L'ID de l'utilisateur
   * @returns L'objet contenant toutes les permissions et droits de l'utilisateur
   */
  async getUserPermissions(userId: string): Promise<any> {
    try {
      const user = await this.findById(userId);
      
      const permissions = {
        isAdmin: user.isAdmin,
        isDepartmentAdmin: user.isDepartmentAdmin,
        isTeamMember: user.isTeamMember,
        hasDepartmentRights: user.hasDepartmentRights,
        departmentId: user.departmentId,
        teamId: user.teamId,
        managedEquipmentTypes: [] as string[]
      };
      
      // Récupérer les types d'équipement gérés directement par l'utilisateur
      if (user.managedEquipmentTypes && Array.isArray(user.managedEquipmentTypes)) {
        permissions.managedEquipmentTypes = [...user.managedEquipmentTypes];
      }
      
      // Si l'utilisateur a les droits du département, ajouter les types d'équipement du département
      if (user.hasDepartmentRights && user.departmentId) {
        const department = await this.departmentsRepository.findOne({
          where: { id: user.departmentId, isDeleted: false }
        });
        
        if (department) {
          try {
            // Traiter les types d'équipement du département s'ils existent
            const departmentTypes = department.managedEquipmentTypes;
            
            if (departmentTypes) {
              // S'il s'agit déjà d'un tableau
              if (Array.isArray(departmentTypes)) {
                departmentTypes.forEach(type => {
                  if (type && !permissions.managedEquipmentTypes.includes(type)) {
                    permissions.managedEquipmentTypes.push(type);
                  }
                });
              } 
              // S'il s'agit d'une chaîne de caractères
              else if (typeof departmentTypes === 'string') {
                const typesArray = (departmentTypes as string).split(',');
                typesArray.forEach(type => {
                  if (type && !permissions.managedEquipmentTypes.includes(type)) {
                    permissions.managedEquipmentTypes.push(type);
                  }
                });
              }
            }
          } catch (error) {
            this.logger.error(`Erreur lors du traitement des types d'équipement du département: ${error.message}`);
            // Continuer malgré l'erreur pour ne pas bloquer l'ensemble de la récupération des permissions
          }
        }
      }
      
      return permissions;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des permissions pour l'utilisateur ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return this.usersRepository.find({ 
      where: { isDeleted: false },
      order: { createdAt: 'DESC' } 
    });
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id, isDeleted: false } 
    });
    
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }
    
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Vérifier si le nom d'utilisateur est déjà pris
      const existingUser = await this.findOneByUsername(createUserDto.username);
      if (existingUser) {
        throw new ConflictException(`Le nom d'utilisateur ${createUserDto.username} est déjà utilisé`);
      }

      // Hash du mot de passe
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Vérifier l'existence du département si spécifié
      if (createUserDto.departmentId) {
        const department = await this.departmentsRepository.findOne({ 
          where: { id: createUserDto.departmentId, isDeleted: false } 
        });
        
        if (!department) {
          throw new NotFoundException(`Département avec l'ID ${createUserDto.departmentId} non trouvé`);
        }
      }

      // Créer l'utilisateur
      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
        // Si l'utilisateur a les droits du département, copier les types d'équipement du département
        managedEquipmentTypes: createUserDto.hasDepartmentRights && createUserDto.departmentId 
          ? await this.getDepartmentEquipmentTypes(createUserDto.departmentId) 
          : createUserDto.managedEquipmentTypes || []
      });

      const savedUser = await this.usersRepository.save(user);

      // Envoyer un email de bienvenue si une adresse email est fournie
      if (savedUser.email) {
        try {
          await this.emailService.sendWelcomeEmail(
            savedUser.email,
            savedUser.username,
            createUserDto.password // Le mot de passe en clair pour l'email
          );
        } catch (error) {
          this.logger.error(`Erreur lors de l'envoi de l'email de bienvenue: ${error.message}`);
        }
      }

      return savedUser;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      // Vérifier si l'utilisateur existe
      const user = await this.getUserById(id);

      // Vérifier si le nouveau nom d'utilisateur est disponible (s'il est modifié)
      if (updateUserDto.username && updateUserDto.username !== user.username) {
        const isAvailable = await this.isUsernameAvailable(updateUserDto.username, id);
        if (!isAvailable) {
          throw new ConflictException(`Le nom d'utilisateur ${updateUserDto.username} est déjà utilisé`);
        }
      }

      // Vérifier l'existence du département si modifié
      if (updateUserDto.departmentId && updateUserDto.departmentId !== user.departmentId) {
        const department = await this.departmentsRepository.findOne({ 
          where: { id: updateUserDto.departmentId, isDeleted: false } 
        });
        
        if (!department) {
          throw new NotFoundException(`Département avec l'ID ${updateUserDto.departmentId} non trouvé`);
        }
      }

      // Traiter le mot de passe si fourni
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      } else {
        delete updateUserDto.password; // Ne pas mettre à jour le mot de passe si non fourni
      }

      // Si l'utilisateur obtient les droits du département, récupérer les types d'équipement du département
      if (updateUserDto.hasDepartmentRights !== undefined && 
          updateUserDto.hasDepartmentRights && 
          (updateUserDto.departmentId || user.departmentId)) {
        
        const departmentId = updateUserDto.departmentId || user.departmentId;
        updateUserDto.managedEquipmentTypes = await this.getDepartmentEquipmentTypes(departmentId);
      }

      // Mettre à jour l'utilisateur
      await this.usersRepository.update(id, updateUserDto);

      // Récupérer et retourner l'utilisateur mis à jour
      return this.getUserById(id);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
    }
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Vérifier si l'utilisateur existe
      const user = await this.getUserById(id);

      // Suppression logique
      await this.usersRepository.update(id, { isDeleted: true });

      return {
        success: true,
        message: `Utilisateur avec l'ID ${id} supprimé avec succès`
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
    }
  }

  private async getDepartmentEquipmentTypes(departmentId: string): Promise<string[]> {
    const department = await this.departmentsRepository.findOne({
      where: { id: departmentId, isDeleted: false }
    });
    
    if (!department) {
      return [];
    }
    
    return department.managedEquipmentTypes || [];
  }
} 