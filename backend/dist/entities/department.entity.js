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
exports.Department = exports.DepartmentType = void 0;
const typeorm_1 = require("typeorm");
const equipment_entity_1 = require("./equipment.entity");
const team_entity_1 = require("../teams/entities/team.entity");
const uuid_1 = require("uuid");
var DepartmentType;
(function (DepartmentType) {
    DepartmentType["TRANSMISSION"] = "TRANSMISSION";
    DepartmentType["ENERGIE"] = "ENERGIE";
    DepartmentType["INFRASTRUCTURE"] = "INFRASTRUCTURE";
    DepartmentType["INFORMATIQUE"] = "INFORMATIQUE";
    DepartmentType["SECURITE"] = "SECURITE";
})(DepartmentType || (exports.DepartmentType = DepartmentType = {}));
let Department = class Department {
    generateId() {
        if (!this.id) {
            this.id = (0, uuid_1.v4)();
        }
    }
};
exports.Department = Department;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Department.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Department.prototype, "generateId", null);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Department.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255
    }),
    __metadata("design:type", String)
], Department.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Department.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Department.prototype, "responsibleName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Department.prototype, "contactEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'float' }),
    __metadata("design:type", Number)
], Department.prototype, "contactPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Department.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => team_entity_1.Team, team => team.department),
    __metadata("design:type", Array)
], Department.prototype, "teams", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => equipment_entity_1.Equipment, equipment => equipment.department),
    __metadata("design:type", Array)
], Department.prototype, "equipment", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Array)
], Department.prototype, "managedEquipmentTypes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Department.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Department.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Department.prototype, "isDeleted", void 0);
exports.Department = Department = __decorate([
    (0, typeorm_1.Entity)()
], Department);
//# sourceMappingURL=department.entity.js.map