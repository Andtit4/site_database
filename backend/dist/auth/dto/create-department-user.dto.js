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
exports.CreateDepartmentUserDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateDepartmentUserDto {
}
exports.CreateDepartmentUserDto = CreateDepartmentUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nom d\'utilisateur unique pour le compte du département',
        example: 'dept_transmission',
        required: true
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le nom d\'utilisateur est requis' }),
    (0, class_validator_1.IsString)({ message: 'Le nom d\'utilisateur doit être une chaîne de caractères' }),
    __metadata("design:type", String)
], CreateDepartmentUserDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mot de passe pour le compte du département (min. 8 caractères)',
        example: 'Dept123!',
        required: true,
        minLength: 8
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le mot de passe est requis' }),
    (0, class_validator_1.IsString)({ message: 'Le mot de passe doit être une chaîne de caractères' }),
    (0, class_validator_1.MinLength)(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
    __metadata("design:type", String)
], CreateDepartmentUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Adresse email valide pour le compte du département',
        example: 'transmission@example.com',
        required: true
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'L\'email doit être valide' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'L\'email est requis' }),
    __metadata("design:type", String)
], CreateDepartmentUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Prénom du responsable du département',
        example: 'John',
        required: true
    }),
    (0, class_validator_1.IsString)({ message: 'Le prénom doit être une chaîne de caractères' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le prénom est requis' }),
    __metadata("design:type", String)
], CreateDepartmentUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nom de famille du responsable du département',
        example: 'Doe',
        required: true
    }),
    (0, class_validator_1.IsString)({ message: 'Le nom doit être une chaîne de caractères' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le nom est requis' }),
    __metadata("design:type", String)
], CreateDepartmentUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID du département',
        example: 'uuid-du-département',
        required: true
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'L\'ID du département est requis' }),
    (0, class_validator_1.IsUUID)('4', { message: 'L\'ID du département doit être un UUID valide' }),
    __metadata("design:type", String)
], CreateDepartmentUserDto.prototype, "departmentId", void 0);
//# sourceMappingURL=create-department-user.dto.js.map