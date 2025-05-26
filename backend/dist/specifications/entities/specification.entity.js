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
exports.Specification = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
let Specification = class Specification {
    generateId() {
        if (!this.id) {
            this.id = (0, uuid_1.v4)();
        }
    }
};
exports.Specification = Specification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Specification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Specification.prototype, "generateId", null);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [
            'ANTENNE',
            'ROUTEUR',
            'BATTERIE',
            'GÉNÉRATEUR',
            'REFROIDISSEMENT',
            'SHELTER',
            'PYLÔNE',
            'SÉCURITÉ'
        ],
        nullable: false
    }),
    __metadata("design:type", String)
], Specification.prototype, "equipmentType", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: false }),
    __metadata("design:type", Array)
], Specification.prototype, "columns", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Specification.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Specification.prototype, "updatedAt", void 0);
exports.Specification = Specification = __decorate([
    (0, typeorm_1.Entity)('specifications')
], Specification);
//# sourceMappingURL=specification.entity.js.map