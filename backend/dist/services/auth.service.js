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
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../entities/user.entity");
let AuthService = class AuthService {
    constructor(usersRepository, jwtService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
    }
    async login(loginDto) {
        const user = await this.usersRepository.findOne({
            where: { username: loginDto.username }
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        user.lastLogin = new Date();
        await this.usersRepository.save(user);
        const token = this.generateToken(user);
        return this.createAuthResponse(user, token);
    }
    async register(registerDto) {
        const existingUser = await this.usersRepository.findOne({
            where: { username: registerDto.username }
        });
        if (existingUser) {
            throw new common_1.ConflictException('Ce nom d\'utilisateur est déjà utilisé');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = this.usersRepository.create({
            ...registerDto,
            password: hashedPassword,
        });
        await this.usersRepository.save(user);
        const token = this.generateToken(user);
        return this.createAuthResponse(user, token);
    }
    async validateUser(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        return user;
    }
    generateToken(user) {
        const payload = {
            sub: user.id,
            username: user.username,
            isAdmin: user.isAdmin
        };
        return this.jwtService.sign(payload);
    }
    createAuthResponse(user, token) {
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isAdmin: user.isAdmin,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map