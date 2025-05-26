"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecificDepartmentGuard = exports.DepartmentAdminGuard = void 0;
const common_1 = require("@nestjs/common");
let DepartmentAdminGuard = class DepartmentAdminGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        return user && (user.isAdmin || user.isDepartmentAdmin);
    }
};
exports.DepartmentAdminGuard = DepartmentAdminGuard;
exports.DepartmentAdminGuard = DepartmentAdminGuard = __decorate([
    (0, common_1.Injectable)()
], DepartmentAdminGuard);
let SpecificDepartmentGuard = class SpecificDepartmentGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const departmentId = request.params.departmentId || request.body.departmentId;
        if (user && user.isAdmin) {
            return true;
        }
        return user && user.isDepartmentAdmin && user.departmentId === departmentId;
    }
};
exports.SpecificDepartmentGuard = SpecificDepartmentGuard;
exports.SpecificDepartmentGuard = SpecificDepartmentGuard = __decorate([
    (0, common_1.Injectable)()
], SpecificDepartmentGuard);
//# sourceMappingURL=department-admin.guard.js.map