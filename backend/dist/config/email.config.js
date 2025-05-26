"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailConfig = void 0;
const emailConfig = (configService) => ({
    host: configService.get('EMAIL_HOST', 'smtp.ethereal.email'),
    port: configService.get('EMAIL_PORT', 587),
    user: configService.get('EMAIL_USER'),
    password: configService.get('EMAIL_PASSWORD'),
    from: configService.get('EMAIL_FROM', 'noreply@site-info.com'),
});
exports.emailConfig = emailConfig;
//# sourceMappingURL=email.config.js.map