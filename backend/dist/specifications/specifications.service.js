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
exports.SpecificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const specification_entity_1 = require("./entities/specification.entity");
const table_manager_service_1 = require("../table-manager/table-manager.service");
let SpecificationsService = class SpecificationsService {
    constructor(specificationRepository, tableManagerService) {
        this.specificationRepository = specificationRepository;
        this.tableManagerService = tableManagerService;
    }
    async findAll() {
        return this.specificationRepository.find();
    }
    async findByType(equipmentType) {
        return this.specificationRepository.find({
            where: { equipmentType }
        });
    }
    async findOne(id) {
        const specification = await this.specificationRepository.findOne({ where: { id } });
        if (!specification) {
            throw new common_1.NotFoundException(`Spécification avec l'ID ${id} non trouvée`);
        }
        return specification;
    }
    async create(createSpecificationDto) {
        const specification = this.specificationRepository.create({
            equipmentType: createSpecificationDto.equipmentType,
            columns: createSpecificationDto.columns
        });
        const savedSpecification = await this.specificationRepository.save(specification);
        await this.tableManagerService.createTable(savedSpecification);
        return savedSpecification;
    }
    async update(id, updateSpecificationDto) {
        const specification = await this.findOne(id);
        const updatedSpecification = this.specificationRepository.merge(specification, {
            equipmentType: updateSpecificationDto.equipmentType,
            columns: updateSpecificationDto.columns
        });
        const savedSpecification = await this.specificationRepository.save(updatedSpecification);
        await this.tableManagerService.createTable(savedSpecification);
        return savedSpecification;
    }
    async remove(id) {
        const specification = await this.findOne(id);
        await this.tableManagerService.dropTable(specification.equipmentType);
        await this.specificationRepository.remove(specification);
    }
};
exports.SpecificationsService = SpecificationsService;
exports.SpecificationsService = SpecificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(specification_entity_1.Specification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        table_manager_service_1.TableManagerService])
], SpecificationsService);
//# sourceMappingURL=specifications.service.js.map