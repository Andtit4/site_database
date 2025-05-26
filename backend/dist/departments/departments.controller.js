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
exports.DepartmentsController = void 0;
const common_1 = require("@nestjs/common");
const departments_service_1 = require("./departments.service");
const department_dto_1 = require("../dto/department.dto");
const department_entity_1 = require("../entities/department.entity");
const equipment_entity_1 = require("../entities/equipment.entity");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const department_admin_guard_1 = require("../auth/guards/department-admin.guard");
const swagger_1 = require("@nestjs/swagger");
let DepartmentsController = class DepartmentsController {
    constructor(departmentsService) {
        this.departmentsService = departmentsService;
    }
    create(createDepartmentDto) {
        return this.departmentsService.create(createDepartmentDto);
    }
    findAll(filterDto) {
        return this.departmentsService.findAll(filterDto);
    }
    getStatistics() {
        return this.departmentsService.getStatistics();
    }
    findByEquipmentType(type) {
        const filterDto = { managesEquipmentType: type };
        return this.departmentsService.findAll(filterDto);
    }
    findOne(id) {
        return this.departmentsService.findOne(id);
    }
    update(id, updateDepartmentDto) {
        return this.departmentsService.update(id, updateDepartmentDto);
    }
    remove(id) {
        return this.departmentsService.remove(id);
    }
};
exports.DepartmentsController = DepartmentsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Créer un nouveau département', description: 'Crée un département et optionnellement un compte utilisateur associé' }),
    (0, swagger_1.ApiBody)({ type: department_dto_1.CreateDepartmentDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Département créé avec succès', type: department_entity_1.Department }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Requête invalide' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [department_dto_1.CreateDepartmentDto]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer tous les départements', description: 'Retourne la liste des départements avec possibilité de filtrage' }),
    (0, swagger_1.ApiQuery)({ type: department_dto_1.DepartmentFilterDto, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des départements récupérée avec succès', type: [department_entity_1.Department] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(department_admin_guard_1.DepartmentAdminGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [department_dto_1.DepartmentFilterDto]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques des départements', description: 'Récupère les statistiques globales des départements' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques récupérées avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, common_1.Get)('statistics'),
    (0, common_1.UseGuards)(department_admin_guard_1.DepartmentAdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DepartmentsController.prototype, "getStatistics", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Départements par type d\'équipement', description: 'Retourne les départements qui gèrent un type d\'équipement spécifique' }),
    (0, swagger_1.ApiParam)({ name: 'type', description: 'Type d\'équipement', enum: equipment_entity_1.EquipmentType }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des départements récupérée avec succès', type: [department_entity_1.Department] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, common_1.Get)('equipment-type/:type'),
    (0, common_1.UseGuards)(department_admin_guard_1.DepartmentAdminGuard),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "findByEquipmentType", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer un département', description: 'Retourne les détails d\'un département spécifique' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant du département' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Département récupéré avec succès', type: department_entity_1.Department }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Département non trouvé' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(department_admin_guard_1.DepartmentAdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour un département', description: 'Met à jour les informations d\'un département existant' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant du département' }),
    (0, swagger_1.ApiBody)({ type: department_dto_1.UpdateDepartmentDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Département mis à jour avec succès', type: department_entity_1.Department }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Département non trouvé' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Requête invalide' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, department_dto_1.UpdateDepartmentDto]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un département', description: 'Supprime un département de la base de données. Cette action est réservée aux administrateurs. Les équipements associés seront supprimés et les utilisateurs liés au département seront conservés mais leur lien au département sera effacé.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant du département' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Département supprimé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Département non trouvé' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès refusé - réservé aux administrateurs' }),
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "remove", null);
exports.DepartmentsController = DepartmentsController = __decorate([
    (0, swagger_1.ApiTags)('departments'),
    (0, common_1.Controller)('departments'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [departments_service_1.DepartmentsService])
], DepartmentsController);
//# sourceMappingURL=departments.controller.js.map