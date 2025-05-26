"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const department_entity_1 = require("../entities/department.entity");
const bcrypt = require("bcrypt");
const email_service_1 = require("../services/email.service");
const common_2 = require("@nestjs/common");
let UsersService = UsersService_1 = class UsersService {
    constructor(usersRepository, departmentsRepository, emailService) {
        this.usersRepository = usersRepository;
        this.departmentsRepository = departmentsRepository;
        this.emailService = emailService;
        this.logger = new common_2.Logger(UsersService_1.name);
    }
    async findOneByUsername(username) {
        return this.usersRepository.findOne({ where: { username, isDeleted: false } });
    }
    async findById(id) {
        const user = await this.usersRepository.findOne({ where: { id, isDeleted: false } });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec ID ${id} non trouvé`);
        }
        return user;
    }
    async create(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({ username, password: hashedPassword });
        return this.usersRepository.save(user);
    }
    async createAdmin(createAdminDto) {
        try {
            const { username, password, email, firstName, lastName } = createAdminDto;
            const existingUser = await this.findOneByUsername(username);
            if (existingUser) {
                throw new common_1.ConflictException(`L'utilisateur avec le nom d'utilisateur ${username} existe déjà`);
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const admin = this.usersRepository.create({
                username,
                password: hashedPassword,
                email,
                firstName,
                lastName,
                isAdmin: true,
            });
            return await this.usersRepository.save(admin);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Erreur lors de la création de l\'administrateur');
        }
    }
    async createDepartmentUser(createDepartmentUserDto) {
        try {
            const { username, password, email, firstName, lastName, departmentId, hasDepartmentRights = false } = createDepartmentUserDto;
            const existingUser = await this.findOneByUsername(username);
            if (existingUser) {
                throw new common_1.ConflictException(`L'utilisateur avec le nom d'utilisateur ${username} existe déjà`);
            }
            const department = await this.departmentsRepository.findOne({ where: { id: departmentId, isDeleted: false } });
            if (!department) {
                throw new common_1.NotFoundException(`Le département avec l'ID ${departmentId} n'existe pas`);
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
            await this.emailService.sendCredentialsEmail(email, username, password, firstName, lastName, true);
            return savedUser;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Erreur lors de la création de l\'utilisateur du département');
        }
    }
    async createTeamUser(createTeamUserDto) {
        try {
            const { username, password, email, firstName, lastName, teamId, departmentId, hasDepartmentRights = false } = createTeamUserDto;
            const existingUser = await this.findOneByUsername(username);
            if (existingUser) {
                throw new common_1.ConflictException(`L'utilisateur avec le nom d'utilisateur ${username} existe déjà`);
            }
            const hashedPassword = await bcrypt.hash(password, 10);
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
                managedEquipmentTypes: [],
                departmentId: undefined
            };
            if (departmentId) {
                const department = await this.departmentsRepository.findOne({
                    where: { id: departmentId, isDeleted: false }
                });
                if (department) {
                    userToCreate.departmentId = departmentId;
                    if (hasDepartmentRights && department.managedEquipmentTypes) {
                        userToCreate.managedEquipmentTypes = Array.isArray(department.managedEquipmentTypes)
                            ? [...department.managedEquipmentTypes]
                            : [];
                    }
                }
            }
            const teamUser = this.usersRepository.create(userToCreate);
            const savedUser = await this.usersRepository.save(teamUser);
            await this.emailService.sendCredentialsEmail(email, username, password, firstName, lastName, hasDepartmentRights === true);
            return savedUser;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            this.logger.error(`Erreur lors de la création de l'utilisateur d'équipe: ${error.message}`);
            throw new common_1.InternalServerErrorException('Erreur lors de la création de l\'utilisateur d\'équipe');
        }
    }
    async updateProfile(userId, updateProfileDto) {
        const user = await this.findById(userId);
        if (updateProfileDto.username && updateProfileDto.username !== user.username) {
            const existingUser = await this.findOneByUsername(updateProfileDto.username);
            if (existingUser) {
                throw new common_1.ConflictException(`L'utilisateur avec le nom d'utilisateur ${updateProfileDto.username} existe déjà`);
            }
        }
        Object.assign(user, updateProfileDto);
        return this.usersRepository.save(user);
    }
    async isUsernameAvailable(username, currentUserId) {
        const query = this.usersRepository.createQueryBuilder('user')
            .where('user.username = :username', { username });
        if (currentUserId) {
            query.andWhere('user.id != :currentUserId', { currentUserId });
        }
        const count = await query.getCount();
        return count === 0;
    }
    async changePassword(userId, newPassword) {
        try {
            if (!newPassword || newPassword.trim() === '') {
                throw new Error('Le mot de passe ne peut pas être vide');
            }
            const user = await this.findById(userId);
            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                return true;
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await this.usersRepository.save(user);
            if (user.email) {
                try {
                    await this.emailService.sendPasswordChangedEmail(user.email, user.username, user.firstName, user.lastName);
                }
                catch (emailError) {
                    this.logger.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
                }
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Erreur lors du changement de mot de passe: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Erreur lors du changement de mot de passe');
        }
    }
    async updateDepartmentUsers(departmentId, newDepartmentId) {
        try {
            this.logger.log(`Mise à jour des utilisateurs liés au département ${departmentId}`);
            const result = await this.usersRepository
                .createQueryBuilder()
                .update(user_entity_1.User)
                .set({ departmentId: newDepartmentId, isDepartmentAdmin: newDepartmentId ? true : false })
                .where("departmentId = :departmentId", { departmentId })
                .execute();
            this.logger.log(`${result.affected} utilisateurs ont été mis à jour`);
            return result.affected || 0;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la mise à jour des utilisateurs du département: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Erreur lors de la mise à jour des utilisateurs du département');
        }
    }
    async deleteDepartmentUsers(departmentId) {
        try {
            this.logger.log(`Suppression des utilisateurs liés au département ${departmentId}`);
            const users = await this.usersRepository.find({
                where: { departmentId, isDeleted: false }
            });
            if (users.length === 0) {
                this.logger.log(`Aucun utilisateur trouvé pour le département ${departmentId}`);
                return 0;
            }
            const result = await this.usersRepository
                .createQueryBuilder()
                .update(user_entity_1.User)
                .set({ isDeleted: true })
                .where("departmentId = :departmentId", { departmentId })
                .andWhere("isDeleted = :isDeleted", { isDeleted: false })
                .execute();
            this.logger.log(`${result.affected} utilisateurs ont été marqués comme supprimés`);
            return result.affected || 0;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la suppression des utilisateurs du département: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Erreur lors de la suppression des utilisateurs du département');
        }
    }
    async deleteTeamUsers(teamId) {
        try {
            this.logger.log(`Suppression des utilisateurs liés à l'équipe ${teamId}`);
            const users = await this.usersRepository.find({
                where: { teamId, isDeleted: false }
            });
            if (users.length === 0) {
                this.logger.log(`Aucun utilisateur trouvé pour l'équipe ${teamId}`);
                return 0;
            }
            const result = await this.usersRepository
                .createQueryBuilder()
                .update(user_entity_1.User)
                .set({ isDeleted: true })
                .where("teamId = :teamId", { teamId })
                .andWhere("isDeleted = :isDeleted", { isDeleted: false })
                .execute();
            this.logger.log(`${result.affected} utilisateurs de l'équipe ${teamId} ont été marqués comme supprimés`);
            return result.affected || 0;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la suppression des utilisateurs de l'équipe: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Erreur lors de la suppression des utilisateurs de l\'équipe');
        }
    }
    async getUserPermissions(userId) {
        try {
            const user = await this.findById(userId);
            const permissions = {
                isAdmin: user.isAdmin,
                isDepartmentAdmin: user.isDepartmentAdmin,
                isTeamMember: user.isTeamMember,
                hasDepartmentRights: user.hasDepartmentRights,
                departmentId: user.departmentId,
                teamId: user.teamId,
                managedEquipmentTypes: []
            };
            if (user.managedEquipmentTypes && Array.isArray(user.managedEquipmentTypes)) {
                permissions.managedEquipmentTypes = [...user.managedEquipmentTypes];
            }
            if (user.hasDepartmentRights && user.departmentId) {
                const department = await this.departmentsRepository.findOne({
                    where: { id: user.departmentId, isDeleted: false }
                });
                if (department) {
                    try {
                        const departmentTypes = department.managedEquipmentTypes;
                        if (departmentTypes) {
                            if (Array.isArray(departmentTypes)) {
                                departmentTypes.forEach(type => {
                                    if (type && !permissions.managedEquipmentTypes.includes(type)) {
                                        permissions.managedEquipmentTypes.push(type);
                                    }
                                });
                            }
                            else if (typeof departmentTypes === 'string') {
                                const typesArray = departmentTypes.split(',');
                                typesArray.forEach(type => {
                                    if (type && !permissions.managedEquipmentTypes.includes(type)) {
                                        permissions.managedEquipmentTypes.push(type);
                                    }
                                });
                            }
                        }
                    }
                    catch (error) {
                        this.logger.error(`Erreur lors du traitement des types d'équipement du département: ${error.message}`);
                    }
                }
            }
            return permissions;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la récupération des permissions pour l'utilisateur ${userId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getAllUsers() {
        return this.usersRepository.find({
            where: { isDeleted: false },
            order: { createdAt: 'DESC' }
        });
    }
    async getUserById(id) {
        const user = await this.usersRepository.findOne({
            where: { id, isDeleted: false }
        });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
        }
        return user;
    }
    async createUser(createUserDto) {
        try {
            const existingUser = await this.findOneByUsername(createUserDto.username);
            if (existingUser) {
                throw new common_1.ConflictException(`Le nom d'utilisateur ${createUserDto.username} est déjà utilisé`);
            }
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            if (createUserDto.departmentId) {
                const department = await this.departmentsRepository.findOne({
                    where: { id: createUserDto.departmentId, isDeleted: false }
                });
                if (!department) {
                    throw new common_1.NotFoundException(`Département avec l'ID ${createUserDto.departmentId} non trouvé`);
                }
            }
            const user = this.usersRepository.create({
                ...createUserDto,
                password: hashedPassword,
                managedEquipmentTypes: createUserDto.hasDepartmentRights && createUserDto.departmentId
                    ? await this.getDepartmentEquipmentTypes(createUserDto.departmentId)
                    : createUserDto.managedEquipmentTypes || []
            });
            const savedUser = await this.usersRepository.save(user);
            if (savedUser.email) {
                try {
                    await this.emailService.sendWelcomeEmail(savedUser.email, savedUser.username, createUserDto.password);
                }
                catch (error) {
                    this.logger.error(`Erreur lors de l'envoi de l'email de bienvenue: ${error.message}`);
                }
            }
            return savedUser;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`Erreur lors de la création de l'utilisateur: ${error.message}`);
        }
    }
    async updateUser(id, updateUserDto) {
        try {
            const user = await this.getUserById(id);
            if (updateUserDto.username && updateUserDto.username !== user.username) {
                const isAvailable = await this.isUsernameAvailable(updateUserDto.username, id);
                if (!isAvailable) {
                    throw new common_1.ConflictException(`Le nom d'utilisateur ${updateUserDto.username} est déjà utilisé`);
                }
            }
            if (updateUserDto.departmentId && updateUserDto.departmentId !== user.departmentId) {
                const department = await this.departmentsRepository.findOne({
                    where: { id: updateUserDto.departmentId, isDeleted: false }
                });
                if (!department) {
                    throw new common_1.NotFoundException(`Département avec l'ID ${updateUserDto.departmentId} non trouvé`);
                }
            }
            if (updateUserDto.password) {
                updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
            }
            else {
                delete updateUserDto.password;
            }
            if (updateUserDto.hasDepartmentRights !== undefined &&
                updateUserDto.hasDepartmentRights &&
                (updateUserDto.departmentId || user.departmentId)) {
                const departmentId = updateUserDto.departmentId || user.departmentId;
                updateUserDto.managedEquipmentTypes = await this.getDepartmentEquipmentTypes(departmentId);
            }
            await this.usersRepository.update(id, updateUserDto);
            return this.getUserById(id);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
        }
    }
    async deleteUser(id) {
        try {
            const user = await this.getUserById(id);
            await this.usersRepository.update(id, { isDeleted: true });
            return {
                success: true,
                message: `Utilisateur avec l'ID ${id} supprimé avec succès`
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
        }
    }
    async getDepartmentEquipmentTypes(departmentId) {
        const department = await this.departmentsRepository.findOne({
            where: { id: departmentId, isDeleted: false }
        });
        if (!department) {
            return [];
        }
        return department.managedEquipmentTypes || [];
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService])
], UsersService);
//# sourceMappingURL=users.service.js.map