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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentFilterDto = exports.UpdateEquipmentDto = exports.CreateEquipmentDto = void 0;
const class_validator_1 = require("class-validator");
const equipment_entity_1 = require("../entities/equipment.entity");
class CreateEquipmentDto {
}
exports.CreateEquipmentDto = CreateEquipmentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEquipmentDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(equipment_entity_1.EquipmentType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEquipmentDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEquipmentDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEquipmentDto.prototype, "manufacturer", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEquipmentDto.prototype, "serialNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEquipmentDto.prototype, "installDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEquipmentDto.prototype, "lastMaintenanceDate", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(equipment_entity_1.EquipmentStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEquipmentDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateEquipmentDto.prototype, "specifications", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEquipmentDto.prototype, "siteId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEquipmentDto.prototype, "departmentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEquipmentDto.prototype, "teamId", void 0);
class UpdateEquipmentDto {
}
exports.UpdateEquipmentDto = UpdateEquipmentDto;
__decorate([
    (0, class_validator_1.IsEnum)(equipment_entity_1.EquipmentType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEquipmentDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEquipmentDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEquipmentDto.prototype, "manufacturer", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEquipmentDto.prototype, "serialNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEquipmentDto.prototype, "installDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEquipmentDto.prototype, "lastMaintenanceDate", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(equipment_entity_1.EquipmentStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEquipmentDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateEquipmentDto.prototype, "specifications", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEquipmentDto.prototype, "siteId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEquipmentDto.prototype, "departmentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEquipmentDto.prototype, "teamId", void 0);
class EquipmentFilterDto {
}
exports.EquipmentFilterDto = EquipmentFilterDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EquipmentFilterDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(equipment_entity_1.EquipmentType, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], EquipmentFilterDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(equipment_entity_1.EquipmentStatus, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], EquipmentFilterDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EquipmentFilterDto.prototype, "siteId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EquipmentFilterDto.prototype, "departmentId", void 0);
//# sourceMappingURL=equipment.dto.js.map