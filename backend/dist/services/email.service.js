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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const email_config_1 = require("../config/email.config");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.initializeTransporter();
    }
    async initializeTransporter() {
        const config = (0, email_config_1.emailConfig)(this.configService);
        if (!config.user || !config.password) {
            this.logger.warn('Configuration email absente. Utilisation d\'un compte de test pour l\'envoi d\'emails.');
            const testAccount = await nodemailer.createTestAccount();
            this.transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            this.logger.log(`Compte de test Ethereal créé: ${testAccount.user}`);
        }
        else {
            this.transporter = nodemailer.createTransport({
                host: config.host,
                port: config.port,
                secure: config.port === 465,
                auth: {
                    user: config.user,
                    pass: config.password,
                },
            });
            this.logger.log('Transporteur email configuré avec les variables d\'environnement.');
        }
    }
    async sendCredentialsEmail(to, username, password, firstName, lastName, isDepartment) {
        try {
            if (!this.transporter) {
                await this.initializeTransporter();
            }
            const subject = 'Vos identifiants de connexion - Site Info';
            let userType = 'utilisateur';
            if (isDepartment) {
                userType = 'département avec droits d\'administration';
            }
            const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3f51b5;">Site Info - Identifiants de connexion</h2>
          
          <p>Bonjour ${firstName} ${lastName},</p>
          
          <p>Voici vos identifiants de connexion pour accéder à l'application Site Info en tant que <strong>${userType}</strong> :</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Nom d'utilisateur:</strong> ${username}</p>
            <p><strong>Mot de passe:</strong> ${password}</p>
          </div>
          
          <p>Pour des raisons de sécurité, veuillez changer votre mot de passe lors de votre première connexion.</p>
          
          <p>Pour vous connecter, veuillez accéder à l'application Site Info et utiliser ces identifiants sur la page de connexion.</p>
          
          <p style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
            Cordialement,<br>
            L'équipe Site Info
          </p>
        </div>
      `;
            const text = `
        Site Info - Identifiants de connexion
        
        Bonjour ${firstName} ${lastName},
        
        Voici vos identifiants de connexion pour accéder à l'application Site Info en tant que ${userType} :
        
        Nom d'utilisateur: ${username}
        Mot de passe: ${password}
        
        Pour des raisons de sécurité, veuillez changer votre mot de passe lors de votre première connexion.
        
        Pour vous connecter, veuillez accéder à l'application Site Info et utiliser ces identifiants sur la page de connexion.
        
        Cordialement,
        L'équipe Site Info
      `;
            const config = (0, email_config_1.emailConfig)(this.configService);
            const info = await this.transporter.sendMail({
                from: `"Site Info" <${config.from}>`,
                to,
                subject,
                text,
                html,
            });
            this.logger.log(`Email envoyé: ${info.messageId}`);
            if (info.messageId && info.envelope && info.ethereal) {
                this.logger.log(`URL de prévisualisation: ${nodemailer.getTestMessageUrl(info)}`);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Erreur lors de l'envoi de l'email: ${error.message}`, error.stack);
            return false;
        }
    }
    async sendPasswordChangedEmail(to, username, firstName, lastName) {
        try {
            if (!this.transporter) {
                await this.initializeTransporter();
            }
            const subject = 'Confirmation de changement de mot de passe - Site Info';
            const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3f51b5;">Site Info - Changement de mot de passe</h2>
          
          <p>Bonjour ${firstName || ''} ${lastName || ''},</p>
          
          <p>Votre mot de passe a été modifié avec succès.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Nom d'utilisateur:</strong> ${username}</p>
          </div>
          
          <p>Si vous n'êtes pas à l'origine de cette modification, veuillez contacter immédiatement l'administrateur du système.</p>
          
          <p style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
            Cordialement,<br>
            L'équipe Site Info
          </p>
        </div>
      `;
            const text = `
        Site Info - Changement de mot de passe
        
        Bonjour ${firstName || ''} ${lastName || ''},
        
        Votre mot de passe a été modifié avec succès.
        
        Nom d'utilisateur: ${username}
        
        Si vous n'êtes pas à l'origine de cette modification, veuillez contacter immédiatement l'administrateur du système.
        
        Cordialement,
        L'équipe Site Info
      `;
            const config = (0, email_config_1.emailConfig)(this.configService);
            const info = await this.transporter.sendMail({
                from: `"Site Info" <${config.from}>`,
                to,
                subject,
                text,
                html,
            });
            this.logger.log(`Email envoyé: ${info.messageId}`);
            if (info.messageId && info.envelope && info.ethereal) {
                this.logger.log(`URL de prévisualisation: ${nodemailer.getTestMessageUrl(info)}`);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Erreur lors de l'envoi de l'email: ${error.message}`, error.stack);
            return false;
        }
    }
    async sendWelcomeEmail(to, username, password, firstName, lastName) {
        try {
            if (!this.transporter) {
                await this.initializeTransporter();
            }
            const subject = 'Bienvenue sur Site Info - Vos identifiants de connexion';
            const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3f51b5;">Bienvenue sur Site Info</h2>
          
          <p>Bonjour ${firstName || ''} ${lastName || ''},</p>
          
          <p>Votre compte a été créé sur l'application Site Info. Voici vos identifiants de connexion :</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Nom d'utilisateur:</strong> ${username}</p>
            <p><strong>Mot de passe:</strong> ${password}</p>
          </div>
          
          <p>Pour des raisons de sécurité, veuillez changer votre mot de passe lors de votre première connexion.</p>
          
          <p>Pour vous connecter, veuillez accéder à l'application Site Info et utiliser ces identifiants sur la page de connexion.</p>
          
          <p style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
            Cordialement,<br>
            L'équipe Site Info
          </p>
        </div>
      `;
            const text = `
        Bienvenue sur Site Info
        
        Bonjour ${firstName || ''} ${lastName || ''},
        
        Votre compte a été créé sur l'application Site Info. Voici vos identifiants de connexion :
        
        Nom d'utilisateur: ${username}
        Mot de passe: ${password}
        
        Pour des raisons de sécurité, veuillez changer votre mot de passe lors de votre première connexion.
        
        Pour vous connecter, veuillez accéder à l'application Site Info et utiliser ces identifiants sur la page de connexion.
        
        Cordialement,
        L'équipe Site Info
      `;
            const config = (0, email_config_1.emailConfig)(this.configService);
            const info = await this.transporter.sendMail({
                from: `"Site Info" <${config.from}>`,
                to,
                subject,
                text,
                html,
            });
            this.logger.log(`Email envoyé: ${info.messageId}`);
            if (info.messageId && info.envelope && info.ethereal) {
                this.logger.log(`URL de prévisualisation: ${nodemailer.getTestMessageUrl(info)}`);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Erreur lors de l'envoi de l'email: ${error.message}`, error.stack);
            return false;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map