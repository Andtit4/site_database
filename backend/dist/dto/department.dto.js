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
exports.DepartmentFilterDto = exports.UpdateDepartmentDto = exports.CreateDepartmentDto = void 0;
const class_validator_1 = require("class-validator");
const department_entity_1 = require("../entities/department.entity");
const equipment_entity_1 = require("../entities/equipment.entity");
const swagger_1 = require("@nestjs/swagger");
class CreateDepartmentDto {
    constructor() {
        this.isActive = true;
        this.createAccount = true;
    }
}
exports.CreateDepartmentDto = CreateDepartmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nom du département',
        example: 'Département Transmission'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDepartmentDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type du département',
        enum: department_entity_1.DepartmentType,
        example: department_entity_1.DepartmentType.TRANSMISSION
    }),
    (0, class_validator_1.IsEnum)(department_entity_1.DepartmentType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDepartmentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description du département',
        example: 'Département responsable des équipements de transmission',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDepartmentDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nom du responsable du département',
        example: 'Jean Dupont'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDepartmentDto.prototype, "responsibleName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email de contact du département',
        example: 'transmission@example.com'
    }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDepartmentDto.prototype, "contactEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Numéro de téléphone du département',
        example: 661234567,
        required: false
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateDepartmentDto.prototype, "contactPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Statut actif du département',
        example: true,
        default: true,
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateDepartmentDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Types d\'équipements gérés par le département',
        type: [String],
        enum: equipment_entity_1.EquipmentType,
        example: [equipment_entity_1.EquipmentType.ANTENNA, equipment_entity_1.EquipmentType.ROUTER],
        required: false
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(equipment_entity_1.EquipmentType, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDepartmentDto.prototype, "managedEquipmentTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mot de passe pour le compte utilisateur du département (min. 8 caractères)',
        example: 'Dept123!',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
    __metadata("design:type", String)
], CreateDepartmentDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Créer un compte utilisateur pour ce département',
        example: true,
        default: true,
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateDepartmentDto.prototype, "createAccount", void 0);
class UpdateDepartmentDto {
}
exports.UpdateDepartmentDto = UpdateDepartmentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDepartmentDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(department_entity_1.DepartmentType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDepartmentDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDepartmentDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDepartmentDto.prototype, "responsibleName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDepartmentDto.prototype, "contactEmail", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateDepartmentDto.prototype, "contactPhone", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateDepartmentDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(equipment_entity_1.EquipmentType, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateDepartmentDto.prototype, "managedEquipmentTypes", void 0);
class DepartmentFilterDto {
}
exports.DepartmentFilterDto = DepartmentFilterDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DepartmentFilterDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(department_entity_1.DepartmentType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DepartmentFilterDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], DepartmentFilterDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(equipment_entity_1.EquipmentType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DepartmentFilterDto.prototype, "managesEquipmentType", void 0);
//# sourceMappingURL=department.dto.js.map