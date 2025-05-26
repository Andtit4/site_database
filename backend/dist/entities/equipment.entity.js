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
exports.Equipment = exports.EquipmentStatus = exports.EquipmentType = void 0;
const typeorm_1 = require("typeorm");
const site_entity_1 = require("./site.entity");
const department_entity_1 = require("./department.entity");
var EquipmentType;
(function (EquipmentType) {
    EquipmentType["ANTENNA"] = "ANTENNE";
    EquipmentType["ROUTER"] = "ROUTEUR";
    EquipmentType["BATTERY"] = "BATTERIE";
    EquipmentType["GENERATOR"] = "G\u00C9N\u00C9RATEUR";
    EquipmentType["COOLING"] = "REFROIDISSEMENT";
    EquipmentType["SHELTER"] = "SHELTER";
    EquipmentType["TOWER"] = "PYL\u00D4NE";
    EquipmentType["SECURITY"] = "S\u00C9CURIT\u00C9";
})(EquipmentType || (exports.EquipmentType = EquipmentType = {}));
var EquipmentStatus;
(function (EquipmentStatus) {
    EquipmentStatus["ACTIVE"] = "ACTIF";
    EquipmentStatus["MAINTENANCE"] = "MAINTENANCE";
    EquipmentStatus["INACTIVE"] = "INACTIF";
    EquipmentStatus["PLANNED"] = "PLANIFI\u00C9";
    EquipmentStatus["UNDER_INSTALLATION"] = "EN_INSTALLATION";
})(EquipmentStatus || (exports.EquipmentStatus = EquipmentStatus = {}));
let Equipment = class Equipment {
};
exports.Equipment = Equipment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Equipment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Equipment.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Equipment.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Equipment.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Equipment.prototype, "serialNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Equipment.prototype, "manufacturer", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Equipment.prototype, "purchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Equipment.prototype, "installDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Equipment.prototype, "lastMaintenanceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        default: 'ACTIF'
    }),
    __metadata("design:type", String)
], Equipment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Equipment.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Equipment.prototype, "purchasePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Equipment.prototype, "warrantyExpiration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Equipment.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Equipment.prototype, "macAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'isDeleted', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Equipment.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => site_entity_1.Site, site => site.equipment, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'siteId' }),
    __metadata("design:type", site_entity_1.Site)
], Equipment.prototype, "site", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Equipment.prototype, "siteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => department_entity_1.Department, department => department.equipment, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'departmentId' }),
    __metadata("design:type", department_entity_1.Department)
], Equipment.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Equipment.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Equipment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Equipment.prototype, "updatedAt", void 0);
exports.Equipment = Equipment = __decorate([
    (0, typeorm_1.Entity)('equipment')
], Equipment);
//# sourceMappingURL=equipment.entity.js.map