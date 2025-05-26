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
const typeorm_2 = require("typeorm");
const department_entity_1 = require("../entities/department.entity");
const equipment_entity_1 = require("../entities/equipment.entity");
const email_service_1 = require("../services/email.service");
const users_service_1 = require("../users/users.service");
let DepartmentsService = DepartmentsService_1 = class DepartmentsService {
    constructor(departmentsRepository, usersService, emailService) {
        this.departmentsRepository = departmentsRepository;
        this.usersService = usersService;
        this.emailService = emailService;
        this.logger = new common_1.Logger(DepartmentsService_1.name);
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
            const user = await this.usersService.createDepartmentUser(createUserDto);
            await this.emailService.sendCredentialsEmail(department.contactEmail, username, password, createUserDto.firstName, createUserDto.lastName, true);
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
                .andWhere('department.isDeleted = :isDeleted', { isDeleted: false })
                .leftJoinAndSelect('department.equipment', 'equipment', 'equipment.isDeleted = :equipDeleted', { equipDeleted: false })
                .leftJoinAndSelect('department.teams', 'teams', 'teams.isDeleted = :teamsDeleted', { teamsDeleted: false });
            const department = await departmentQuery.getOne();
            if (!department) {
                throw new common_1.NotFoundException(`Département avec ID "${id}" non trouvé`);
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
                    where: { name: updateDepartmentDto.name },
                });
                if (existingDepartment) {
                    throw new common_1.ConflictException(`Un département avec le nom '${updateDepartmentDto.name}' existe déjà`);
                }
            }
            if (updateDepartmentDto.managedEquipmentTypes && Array.isArray(updateDepartmentDto.managedEquipmentTypes)) {
                updateDepartmentDto.managedEquipmentTypes = updateDepartmentDto.managedEquipmentTypes.join(',');
            }
            const teamsBefore = department.teams;
            Object.assign(department, updateDepartmentDto);
            department.teams = teamsBefore;
            this.logger.log(`Mise à jour du département: ${department.name}`);
            const savedDepartment = await this.departmentsRepository.save(department);
            if (savedDepartment.managedEquipmentTypes && typeof savedDepartment.managedEquipmentTypes === 'string') {
                savedDepartment.managedEquipmentTypes = savedDepartment.managedEquipmentTypes
                    .split(',')
                    .filter(type => type)
                    .map(type => type);
            }
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
            const totalDepartments = await this.departmentsRepository.count();
            const activeDepartments = await this.departmentsRepository.count({ where: { isActive: true } });
            const inactiveDepartments = await this.departmentsRepository.count({ where: { isActive: false } });
            const departmentsByType = {};
            for (const type of Object.values(equipment_entity_1.EquipmentType)) {
                departmentsByType[type] = await this.departmentsRepository.count({
                    where: {
                        type: type
                    }
                });
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
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        email_service_1.EmailService])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map