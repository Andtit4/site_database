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
exports.CreateSpecificationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ColumnDefinition {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ColumnDefinition.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ColumnDefinition.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ColumnDefinition.prototype, "length", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ColumnDefinition.prototype, "nullable", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ColumnDefinition.prototype, "defaultValue", void 0);
class CreateSpecificationDto {
}
exports.CreateSpecificationDto = CreateSpecificationDto;
__decorate([
    (0, class_validator_1.IsEnum)([
        'ANTENNE',
        'ROUTEUR',
        'BATTERIE',
        'GÉNÉRATEUR',
        'REFROIDISSEMENT',
        'SHELTER',
        'PYLÔNE',
        'SÉCURITÉ'
    ]),
    __metadata("design:type", String)
], CreateSpecificationDto.prototype, "equipmentType", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ColumnDefinition),
    __metadata("design:type", Array)
], CreateSpecificationDto.prototype, "columns", void 0);
//# sourceMappingURL=create-specification.dto.js.map