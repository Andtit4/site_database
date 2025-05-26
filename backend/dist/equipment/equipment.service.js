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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const equipment_entity_1 = require("../entities/equipment.entity");
const sites_service_1 = require("../sites/sites.service");
const departments_service_1 = require("../departments/departments.service");
const teams_service_1 = require("../teams/teams.service");
let EquipmentService = class EquipmentService {
    constructor(equipmentRepository, sitesService, departmentsService, teamsService) {
        this.equipmentRepository = equipmentRepository;
        this.sitesService = sitesService;
        this.departmentsService = departmentsService;
        this.teamsService = teamsService;
    }
    async findAll(filterDto = {}) {
        const { search, type, status, siteId, departmentId } = filterDto;
        const query = this.equipmentRepository.createQueryBuilder('equipment')
            .leftJoinAndSelect('equipment.site', 'site')
            .leftJoinAndSelect('equipment.department', 'department')
            .where('equipment.isDeleted = :isDeleted', { isDeleted: false });
        if (search) {
            query.andWhere('(equipment.model LIKE :search OR equipment.manufacturer LIKE :search OR equipment.serialNumber LIKE :search)', { search: `%${search}%` });
        }
        if (type && type.length > 0) {
            query.andWhere('equipment.name IN (:...type)', { type });
        }
        if (status && status.length > 0) {
            query.andWhere('equipment.status IN (:...status)', { status });
        }
        if (siteId) {
            query.andWhere('equipment.siteId = :siteId', { siteId });
        }
        if (departmentId) {
            query.andWhere('equipment.departmentId = :departmentId', { departmentId });
        }
        return query.getMany();
    }
    async findOne(id) {
        const equipment = await this.equipmentRepository.findOne({
            where: { id, isDeleted: false }
        });
        if (!equipment) {
            throw new common_1.NotFoundException(`equipement avec ID ${id} non trouve`);
        }
        return equipment;
    }
    async create(createEquipmentDto) {
        await this.sitesService.findOne(createEquipmentDto.siteId);
        if (createEquipmentDto.departmentId) {
            await this.departmentsService.findOne(createEquipmentDto.departmentId);
        }
        if (createEquipmentDto.teamId) {
            await this.teamsService.findOne(createEquipmentDto.teamId);
        }
        const existingEquipment = await this.equipmentRepository.findOne({
            where: { id: createEquipmentDto.id, isDeleted: false },
        });
        if (existingEquipment) {
            throw new common_1.ConflictException(`Un equipement avec l'ID ${createEquipmentDto.id} existe dejà`);
        }
        const equipment = this.equipmentRepository.create(createEquipmentDto);
        return this.equipmentRepository.save(equipment);
    }
    async update(id, updateEquipmentDto) {
        const equipment = await this.findOne(id);
        if (updateEquipmentDto.siteId) {
            await this.sitesService.findOne(updateEquipmentDto.siteId);
        }
        if (updateEquipmentDto.departmentId) {
            await this.departmentsService.findOne(updateEquipmentDto.departmentId);
        }
        if (updateEquipmentDto.teamId) {
            await this.teamsService.findOne(updateEquipmentDto.teamId);
        }
        Object.assign(equipment, updateEquipmentDto);
        return this.equipmentRepository.save(equipment);
    }
    async remove(id) {
        const equipment = await this.findOne(id);
        equipment.isDeleted = true;
        await this.equipmentRepository.save(equipment);
    }
    async removeBySiteId(siteId) {
        const result = await this.equipmentRepository
            .createQueryBuilder()
            .update(equipment_entity_1.Equipment)
            .set({ isDeleted: true })
            .where("siteId = :siteId", { siteId })
            .andWhere("isDeleted = :isDeleted", { isDeleted: false })
            .execute();
        return result.affected || 0;
    }
    async removeByDepartmentId(departmentId) {
        const result = await this.equipmentRepository
            .createQueryBuilder()
            .update(equipment_entity_1.Equipment)
            .set({ isDeleted: true })
            .where("departmentId = :departmentId", { departmentId })
            .andWhere("isDeleted = :isDeleted", { isDeleted: false })
            .execute();
        return result.affected || 0;
    }
    async getStatistics() {
        const totalEquipment = await this.equipmentRepository.count({
            where: { isDeleted: false }
        });
        const typeCounts = {};
        for (const type in equipment_entity_1.EquipmentType) {
            const count = await this.equipmentRepository.count({
                where: { name: equipment_entity_1.EquipmentType[type], isDeleted: false },
            });
            typeCounts[equipment_entity_1.EquipmentType[type]] = count;
        }
        const statusCounts = {};
        for (const status in equipment_entity_1.EquipmentStatus) {
            const count = await this.equipmentRepository.count({
                where: { status: equipment_entity_1.EquipmentStatus[status], isDeleted: false },
            });
            statusCounts[equipment_entity_1.EquipmentStatus[status]] = count;
        }
        return {
            totalEquipment,
            byType: typeCounts,
            byStatus: statusCounts,
        };
    }
    async findAllByType(type) {
        if (!Object.keys(equipment_entity_1.EquipmentType).includes(type)) {
            throw new common_1.NotFoundException(`Type d'équipement ${type} invalide`);
        }
        return this.equipmentRepository.find({
            where: { name: equipment_entity_1.EquipmentType[type], isDeleted: false },
            relations: ['site', 'department'],
        });
    }
};
exports.EquipmentService = EquipmentService;
exports.EquipmentService = EquipmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(equipment_entity_1.Equipment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        sites_service_1.SitesService,
        departments_service_1.DepartmentsService,
        teams_service_1.TeamsService])
], EquipmentService);
//# sourceMappingURL=equipment.service.js.map