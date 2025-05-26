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
exports.SpecificationsController = void 0;
const common_1 = require("@nestjs/common");
const specifications_service_1 = require("./specifications.service");
const create_specification_dto_1 = require("./dto/create-specification.dto");
const update_specification_dto_1 = require("./dto/update-specification.dto");
let SpecificationsController = class SpecificationsController {
    constructor(specificationsService) {
        this.specificationsService = specificationsService;
    }
    async findAll() {
        return this.specificationsService.findAll();
    }
    async findByType(equipmentType) {
        return this.specificationsService.findByType(equipmentType);
    }
    async create(createSpecificationDto) {
        return this.specificationsService.create(createSpecificationDto);
    }
    async update(id, updateSpecificationDto) {
        return this.specificationsService.update(id, updateSpecificationDto);
    }
    async remove(id) {
        return this.specificationsService.remove(id);
    }
};
exports.SpecificationsController = SpecificationsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SpecificationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('type/:equipmentType'),
    __param(0, (0, common_1.Param)('equipmentType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpecificationsController.prototype, "findByType", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_specification_dto_1.CreateSpecificationDto]),
    __metadata("design:returntype", Promise)
], SpecificationsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_specification_dto_1.UpdateSpecificationDto]),
    __metadata("design:returntype", Promise)
], SpecificationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpecificationsController.prototype, "remove", null);
exports.SpecificationsController = SpecificationsController = __decorate([
    (0, common_1.Controller)('specifications'),
    __metadata("design:paramtypes", [specifications_service_1.SpecificationsService])
], SpecificationsController);
//# sourceMappingURL=specifications.controller.js.map