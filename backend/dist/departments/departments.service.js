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
var DepartmentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const department_entity_1 = require("../entities/department.entity");
const users_service_1 = require("../users/users.service");
const team_entity_1 = require("../teams/entities/team.entity");
let DepartmentsService = DepartmentsService_1 = class DepartmentsService {
    constructor(departmentsRepository, usersService, request) {
        this.departmentsRepository = departmentsRepository;
        this.usersService = usersService;
        this.request = request;
        this.logger = new common_1.Logger(DepartmentsService_1.name);
    }
    getCurrentUser() {
        return this.request.user;
    }
    async create(createDepartmentDto) {
        try {
            const existingDepartment = await this.departmentsRepository.findOne({
                where: { name: createDepartmentDto.name },
            });
            if (existingDepartment) {
                throw new common_1.ConflictException(`Un département avec le nom '${createDepartmentDto.name}' existe déjà`);
            }
            if (createDepartmentDto.managedEquipmentTypes && Array.isArray(createDepartmentDto.managedEquipmentTypes)) {
                createDepartmentDto.managedEquipmentTypes = createDepartmentDto.managedEquipmentTypes.join(',');
            }
            const department = this.departmentsRepository.create(createDepartmentDto);
            this.logger.log(`Création d'un nouveau département: ${department.name}`);
            const savedDepartment = await this.departmentsRepository.save(department);
            if (createDepartmentDto.createAccount !== false) {
                await this.createDepartmentUser(savedDepartment, createDepartmentDto.password);
            }
            if (savedDepartment.managedEquipmentTypes && typeof savedDepartment.managedEquipmentTypes === 'string') {
                savedDepartment.managedEquipmentTypes = savedDepartment.managedEquipmentTypes
                    .split(',')
                    .filter(type => type)
                    .map(type => type);
            }
            return savedDepartment;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la création du département: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createDepartmentUser(department, providedPassword) {
        try {
            const username = `dept_${department.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            const password = providedPassword || this.generateRandomPassword();
            const createUserDto = {
                username,
                password,
                email: department.contactEmail,
                firstName: department.responsibleName.split(' ')[0] || 'Admin',
                lastName: department.responsibleName.split(' ').slice(1).join(' ') || department.name,
                departmentId: department.id
            };
            await this.usersService.createDepartmentUser(createUserDto);
            this.logger.log(`Compte utilisateur créé pour le département: ${department.name}`);
        }
        catch (error) {
            this.logger.error(`Erreur lors de la création du compte pour le département ${department.id}: ${error.message}`);
        }
    }
    generateRandomPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
    async findAll(filterDto = {}) {
        try {
            const { type, isActive, search, managesEquipmentType } = filterDto;
            const query = this.departmentsRepository.createQueryBuilder('department')
                .where('department.isDeleted = :isDeleted', { isDeleted: false });
            const user = this.getCurrentUser();
            if (user && (user.isDepartmentAdmin || user.isTeamMember) && !user.isAdmin && user.departmentId) {
                query.andWhere('department.id = :userDepartmentId', { userDepartmentId: user.departmentId });
            }
            if (type) {
                query.andWhere('department.type = :type', { type });
            }
            if (isActive !== undefined) {
                query.andWhere('department.isActive = :isActive', { isActive });
            }
            if (search) {
                query.andWhere('(department.name LIKE :search OR department.description LIKE :search OR department.responsibleName LIKE :search)', { search: `%${search}%` });
            }
            if (managesEquipmentType) {
                query.andWhere('department.managedEquipmentTypes LIKE :equipType', { equipType: `%${managesEquipmentType}%` });
            }
            query
                .select([
                'department.id',
                'department.name',
                'department.type',
                'department.description',
                'department.responsibleName',
                'department.contactEmail',
                'department.contactPhone',
                'department.isActive',
                'department.managedEquipmentTypes',
                'department.createdAt',
                'department.updatedAt'
            ])
                .leftJoinAndSelect('department.equipment', 'equipment', 'equipment.isDeleted = :equipDeleted', { equipDeleted: false })
                .leftJoinAndSelect('department.teams', 'teams', 'teams.isDeleted = :teamsDeleted', { teamsDeleted: false });
            const departments = await query.getMany();
            departments.forEach(department => {
                if (department.managedEquipmentTypes && typeof department.managedEquipmentTypes === 'string') {
                    department.managedEquipmentTypes = department.managedEquipmentTypes
                        .split(',')
                        .filter(type => type)
                        .map(type => type);
                }
            });
            this.logger.log(`Récupération de ${departments.length} départements`);
            return departments;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la récupération des départements: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findOne(id) {
        try {
            const departmentQuery = this.departmentsRepository.createQueryBuilder('department')
                .where('department.id = :id', { id })
                .andWhere('department.isDeleted = :isDeleted', { isDeleted: false });
            departmentQuery.leftJoinAndSelect('department.equipment', 'equipment', 'equipment.isDeleted = :equipDeleted', { equipDeleted: false });
            departmentQuery.leftJoinAndSelect('department.teams', 'teams', 'teams.departmentId = :deptId AND teams.isDeleted = :teamsDeleted', { deptId: id, teamsDeleted: false });
            const department = await departmentQuery.getOne();
            if (!department) {
                throw new common_1.NotFoundException(`Département avec ID "${id}" non trouvé`);
            }
            const user = this.getCurrentUser();
            if (user && (user.isDepartmentAdmin || user.isTeamMember) && !user.isAdmin && user.departmentId) {
                if (department.id !== user.departmentId) {
                    throw new common_1.NotFoundException(`Département avec ID "${id}" non trouvé ou accès non autorisé`);
                }
            }
            if (department.managedEquipmentTypes && typeof department.managedEquipmentTypes === 'string') {
                department.managedEquipmentTypes = department.managedEquipmentTypes
                    .split(',')
                    .filter(type => type)
                    .map(type => type);
            }
            return department;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la récupération du département ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async update(id, updateDepartmentDto) {
        try {
            const department = await this.findOne(id);
            if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
                const existingDepartment = await this.departmentsRepository.findOne({
                    where: { name: updateDepartmentDto.name, isDeleted: false },
                });
                if (existingDepartment && existingDepartment.id !== id) {
                    throw new common_1.ConflictException(`Un département avec le nom '${updateDepartmentDto.name}' existe déjà`);
                }
            }
            if (updateDepartmentDto.managedEquipmentTypes && Array.isArray(updateDepartmentDto.managedEquipmentTypes)) {
                updateDepartmentDto.managedEquipmentTypes = updateDepartmentDto.managedEquipmentTypes.join(',');
            }
            const teamsBefore = department.teams ? [...department.teams] : [];
            const updateData = { ...updateDepartmentDto };
            delete updateData['teams'];
            Object.assign(department, updateData);
            this.logger.log(`Mise à jour du département: ${department.name}`);
            const savedDepartment = await this.departmentsRepository.save({
                ...department,
                teams: undefined
            });
            if (savedDepartment.managedEquipmentTypes && typeof savedDepartment.managedEquipmentTypes === 'string') {
                savedDepartment.managedEquipmentTypes = savedDepartment.managedEquipmentTypes
                    .split(',')
                    .filter(type => type)
                    .map(type => type);
            }
            savedDepartment.teams = teamsBefore;
            return savedDepartment;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la mise à jour du département ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async remove(id) {
        try {
            const department = await this.findOne(id);
            if (!department) {
                throw new common_1.NotFoundException(`Département avec ID "${id}" non trouvé`);
            }
            if (department.teams && department.teams.length > 0) {
                this.logger.log(`Marquage de ${department.teams.length} équipes comme supprimées`);
                const teamRepository = this.departmentsRepository.manager.getRepository(team_entity_1.Team);
                for (const team of department.teams) {
                    try {
                        await teamRepository.update({ id: team.id }, { isDeleted: true });
                    }
                    catch (err) {
                        this.logger.error(`Erreur lors du marquage de l'équipe ${team.id} comme supprimée: ${err.message}`);
                    }
                }
            }
            await this.usersService.deleteDepartmentUsers(id);
            department.isDeleted = true;
            await this.departmentsRepository.save(department);
            this.logger.log(`Département supprimé: ${department.name}`);
        }
        catch (error) {
            this.logger.error(`Erreur lors de la suppression du département ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getStatistics() {
        try {
            const user = this.getCurrentUser();
            let queryBuilder = this.departmentsRepository.createQueryBuilder('department')
                .where('department.isDeleted = :isDeleted', { isDeleted: false });
            if (user && (user.isDepartmentAdmin || user.isTeamMember) && !user.isAdmin && user.departmentId) {
                queryBuilder = queryBuilder.andWhere('department.id = :userDepartmentId', { userDepartmentId: user.departmentId });
            }
            const totalDepartments = await queryBuilder.getCount();
            queryBuilder = this.departmentsRepository.createQueryBuilder('department')
                .where('department.isDeleted = :isDeleted', { isDeleted: false })
                .andWhere('department.isActive = :isActive', { isActive: true });
            if (user && (user.isDepartmentAdmin || user.isTeamMember) && !user.isAdmin && user.departmentId) {
                queryBuilder = queryBuilder.andWhere('department.id = :userDepartmentId', { userDepartmentId: user.departmentId });
            }
            const activeDepartments = await queryBuilder.getCount();
            queryBuilder = this.departmentsRepository.createQueryBuilder('department')
                .where('department.isDeleted = :isDeleted', { isDeleted: false })
                .andWhere('department.isActive = :isActive', { isActive: false });
            if (user && (user.isDepartmentAdmin || user.isTeamMember) && !user.isAdmin && user.departmentId) {
                queryBuilder = queryBuilder.andWhere('department.id = :userDepartmentId', { userDepartmentId: user.departmentId });
            }
            const inactiveDepartments = await queryBuilder.getCount();
            const departmentsByType = {};
            for (const type of Object.values(department_entity_1.DepartmentType)) {
                let typeQueryBuilder = this.departmentsRepository.createQueryBuilder('department')
                    .where('department.isDeleted = :isDeleted', { isDeleted: false })
                    .andWhere('department.type = :type', { type });
                if (user && (user.isDepartmentAdmin || user.isTeamMember) && !user.isAdmin && user.departmentId) {
                    typeQueryBuilder = typeQueryBuilder.andWhere('department.id = :userDepartmentId', { userDepartmentId: user.departmentId });
                }
                departmentsByType[type] = await typeQueryBuilder.getCount();
            }
            return {
                total: totalDepartments,
                active: activeDepartments,
                inactive: inactiveDepartments,
                byType: departmentsByType
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors de la récupération des statistiques: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = DepartmentsService_1 = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __param(2, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [Function, users_service_1.UsersService, Object])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map