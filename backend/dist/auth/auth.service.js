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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcrypt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
let AuthService = class AuthService {
    constructor(usersService, jwtService, usersRepository) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.usersRepository = usersRepository;
    }
    async validateUser(username, password) {
        const user = await this.usersService.findOneByUsername(username);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(username, password) {
        const user = await this.validateUser(username, password);
        if (!user) {
            throw new common_1.UnauthorizedException('Identifiants incorrects');
        }
        user.lastLogin = new Date();
        await this.usersRepository.save(user);
        const permissions = await this.usersService.getUserPermissions(user.id);
        const payload = {
            sub: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
            isDepartmentAdmin: user.isDepartmentAdmin,
            isTeamMember: user.isTeamMember,
            departmentId: user.departmentId,
            teamId: user.teamId,
            hasDepartmentRights: user.hasDepartmentRights
        };
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin,
            isDepartmentAdmin: user.isDepartmentAdmin,
            isTeamMember: user.isTeamMember,
            departmentId: user.departmentId,
            teamId: user.teamId,
            hasDepartmentRights: user.hasDepartmentRights,
            managedEquipmentTypes: permissions.managedEquipmentTypes,
            accessToken: this.jwtService.sign(payload),
        };
    }
    async countAdmins() {
        return this.usersRepository.count({
            where: {
                isAdmin: true
            }
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map