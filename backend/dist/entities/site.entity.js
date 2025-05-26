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
exports.Site = exports.SiteStatus = void 0;
const typeorm_1 = require("typeorm");
const equipment_entity_1 = require("./equipment.entity");
const team_entity_1 = require("../teams/entities/team.entity");
var SiteStatus;
(function (SiteStatus) {
    SiteStatus["ACTIVE"] = "ACTIVE";
    SiteStatus["MAINTENANCE"] = "MAINTENANCE";
    SiteStatus["INACTIVE"] = "INACTIVE";
    SiteStatus["UNDER_CONSTRUCTION"] = "UNDER_CONSTRUCTION";
})(SiteStatus || (exports.SiteStatus = SiteStatus = {}));
let Site = class Site {
};
exports.Site = Site;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Site.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Site.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Site.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Site.prototype, "zone", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 6 }),
    __metadata("design:type", Number)
], Site.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 6 }),
    __metadata("design:type", Number)
], Site.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        default: SiteStatus.ACTIVE
    }),
    __metadata("design:type", String)
], Site.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Site.prototype, "oldBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Site.prototype, "newBase", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => equipment_entity_1.Equipment, equipment => equipment.site),
    __metadata("design:type", Array)
], Site.prototype, "equipment", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => team_entity_1.Team, team => team.sites),
    __metadata("design:type", Array)
], Site.prototype, "teams", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Site.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Site.prototype, "updatedAt", void 0);
exports.Site = Site = __decorate([
    (0, typeorm_1.Entity)()
], Site);
//# sourceMappingURL=site.entity.js.map