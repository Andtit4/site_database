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
exports.Team = exports.TeamStatus = void 0;
const typeorm_1 = require("typeorm");
const department_entity_1 = require("../../entities/department.entity");
const site_entity_1 = require("../../entities/site.entity");
const equipment_entity_1 = require("../../entities/equipment.entity");
const user_entity_1 = require("../../entities/user.entity");
var TeamStatus;
(function (TeamStatus) {
    TeamStatus["ACTIVE"] = "ACTIVE";
    TeamStatus["STANDBY"] = "STANDBY";
    TeamStatus["INACTIVE"] = "INACTIVE";
})(TeamStatus || (exports.TeamStatus = TeamStatus = {}));
let Team = class Team {
};
exports.Team = Team;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Team.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Team.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        default: TeamStatus.ACTIVE
    }),
    __metadata("design:type", String)
], Team.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "leadName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "leadContact", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Team.prototype, "memberCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Team.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Team.prototype, "lastActiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], Team.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: true
    }),
    __metadata("design:type", String)
], Team.prototype, "equipmentType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => department_entity_1.Department, department => department.teams, {
        onDelete: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({ name: 'departmentId' }),
    __metadata("design:type", department_entity_1.Department)
], Team.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Team.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, user => user.team),
    __metadata("design:type", Array)
], Team.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => site_entity_1.Site, site => site.teams),
    (0, typeorm_1.JoinTable)({
        name: 'team_sites',
        joinColumn: {
            name: 'teamId',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'siteId',
            referencedColumnName: 'id',
        },
    }),
    __metadata("design:type", Array)
], Team.prototype, "sites", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => equipment_entity_1.Equipment),
    (0, typeorm_1.JoinTable)({
        name: 'team_equipment',
        joinColumn: {
            name: 'teamId',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'equipmentId',
            referencedColumnName: 'id',
        },
    }),
    __metadata("design:type", Array)
], Team.prototype, "equipment", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Team.prototype, "isDeleted", void 0);
exports.Team = Team = __decorate([
    (0, typeorm_1.Entity)()
], Team);
//# sourceMappingURL=team.entity.js.map