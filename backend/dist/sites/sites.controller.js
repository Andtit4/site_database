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
exports.SitesController = void 0;
const common_1 = require("@nestjs/common");
const sites_service_1 = require("./sites.service");
const site_dto_1 = require("../dto/site.dto");
const site_entity_1 = require("../entities/site.entity");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const department_admin_guard_1 = require("../auth/guards/department-admin.guard");
let SitesController = class SitesController {
    constructor(sitesService) {
        this.sitesService = sitesService;
    }
    create(createSiteDto) {
        return this.sitesService.create(createSiteDto);
    }
    findAll(filterDto) {
        return this.sitesService.findAll(filterDto);
    }
    getStatistics() {
        return this.sitesService.getStatistics();
    }
    findOne(id) {
        return this.sitesService.findOne(id);
    }
    update(id, updateSiteDto) {
        return this.sitesService.update(id, updateSiteDto);
    }
    remove(id) {
        return this.sitesService.remove(id);
    }
    async assignTeams(id, body) {
        return this.sitesService.assignTeams(id, body.teamIds);
    }
    async removeTeams(id, body) {
        return this.sitesService.removeTeams(id, body.teamIds);
    }
    async getSiteTeams(id) {
        return this.sitesService.getSiteTeams(id);
    }
};
exports.SitesController = SitesController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Créer un nouveau site', description: 'Ajoute un nouveau site dans la base de données' }),
    (0, swagger_1.ApiBody)({ type: site_dto_1.CreateSiteDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Site créé avec succès', type: site_entity_1.Site }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Requête invalide' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [site_dto_1.CreateSiteDto]),
    __metadata("design:returntype", void 0)
], SitesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer tous les sites', description: 'Retourne la liste des sites avec possibilité de filtrage' }),
    (0, swagger_1.ApiQuery)({ type: site_dto_1.SiteFilterDto, required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des sites récupérée avec succès', type: [site_entity_1.Site] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(department_admin_guard_1.DepartmentAdminGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [site_dto_1.SiteFilterDto]),
    __metadata("design:returntype", void 0)
], SitesController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques des sites', description: 'Récupère les statistiques globales des sites' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques récupérées avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, common_1.Get)('statistics'),
    (0, common_1.UseGuards)(department_admin_guard_1.DepartmentAdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SitesController.prototype, "getStatistics", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer un site', description: 'Retourne les détails d\'un site spécifique' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant du site', example: 'SITE001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Site récupéré avec succès', type: site_entity_1.Site }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Site non trouvé' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(department_admin_guard_1.DepartmentAdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SitesController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour un site', description: 'Met à jour les informations d\'un site existant' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant du site', example: 'SITE001' }),
    (0, swagger_1.ApiBody)({ type: site_dto_1.UpdateSiteDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Site mis à jour avec succès', type: site_entity_1.Site }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Site non trouvé' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Requête invalide' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, site_dto_1.UpdateSiteDto]),
    __metadata("design:returntype", void 0)
], SitesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un site', description: 'Supprime un site de la base de données' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant du site', example: 'SITE001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Site supprimé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Site non trouvé' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SitesController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Assigner des équipes à un site', description: 'Associe des équipes existantes à un site' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant du site', example: 'SITE001' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                teamIds: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    example: ['TEAM001', 'TEAM002']
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Équipes assignées avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Site ou équipe non trouvé' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, common_1.Put)(':id/teams'),
    (0, common_1.UseGuards)(department_admin_guard_1.DepartmentAdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SitesController.prototype, "assignTeams", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Retirer des équipes d\'un site', description: 'Supprime l\'association entre des équipes et un site' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant du site', example: 'SITE001' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                teamIds: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    example: ['TEAM001', 'TEAM002']
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Équipes retirées avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Site non trouvé' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, common_1.Delete)(':id/teams'),
    (0, common_1.UseGuards)(department_admin_guard_1.DepartmentAdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SitesController.prototype, "removeTeams", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les équipes d\'un site', description: 'Récupère la liste des équipes associées à un site' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant du site', example: 'SITE001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des équipes du site récupérée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Site non trouvé' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, common_1.Get)(':id/teams'),
    (0, common_1.UseGuards)(department_admin_guard_1.DepartmentAdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SitesController.prototype, "getSiteTeams", null);
exports.SitesController = SitesController = __decorate([
    (0, swagger_1.ApiTags)('sites'),
    (0, common_1.Controller)('sites'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [sites_service_1.SitesService])
], SitesController);
//# sourceMappingURL=sites.controller.js.map