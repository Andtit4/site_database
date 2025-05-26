"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET || 'votre_secret_jwt_super_securise',
    signOptions: {
        expiresIn: '24h',
    },
}));
//# sourceMappingURL=jwt.config.js.map