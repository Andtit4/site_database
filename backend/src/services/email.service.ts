import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import { emailConfig } from '../config/email.config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter<SentMessageInfo>;

  constructor(private configService: ConfigService) {
    // Initialiser le transporteur d'emails
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const config = emailConfig(this.configService);
    
    // Si les variables d'environnement ne sont pas configurées, utiliser un compte de test
    if (!config.user || !config.password) {
      this.logger.warn('Configuration email absente. Utilisation d\'un compte de test pour l\'envoi d\'emails.');
      
      // Créer un compte de test Ethereal
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
    } else {
      // Utiliser la configuration fournie
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465, // true pour le port 465, false pour les autres ports
        auth: {
          user: config.user,
          pass: config.password,
        },
      });
      
      this.logger.log('Transporteur email configuré avec les variables d\'environnement.');
    }
  }

  /**
   * Envoie un email avec les identifiants de connexion
   */
  async sendCredentialsEmail(to: string, username: string, password: string, firstName: string, lastName: string, isDepartment: boolean): Promise<boolean> {
    try {
      // Vérifier si le transporteur est initialisé
      if (!this.transporter) {
        await this.initializeTransporter();
      }
      
      const subject = 'Vos identifiants de connexion - Site Info';
      
      // Détermine le type d'utilisateur pour l'affichage
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
      
      // Texte brut (version alternative pour les clients email qui ne supportent pas le HTML)
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
      
      const config = emailConfig(this.configService);
      
      // Envoyer l'email
      const info = await this.transporter.sendMail({
        from: `"Site Info" <${config.from}>`,
        to,
        subject,
        text,
        html,
      });
      
      // Loguer l'ID du message et l'URL de prévisualisation (pour Ethereal)
      this.logger.log(`Email envoyé: ${info.messageId}`);
      
      // Si c'est un compte de test Ethereal, afficher l'URL de prévisualisation
      if (info.messageId && info.envelope && (info as any).ethereal) {
        this.logger.log(`URL de prévisualisation: ${nodemailer.getTestMessageUrl(info)}`);
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Envoie un email de confirmation de changement de mot de passe
   */
  async sendPasswordChangedEmail(to: string, username: string, firstName?: string, lastName?: string): Promise<boolean> {
    try {
      // Vérifier si le transporteur est initialisé
      if (!this.transporter) {
        await this.initializeTransporter();
      }
      
      // Sujet de l'email
      const subject = 'Confirmation de changement de mot de passe - Site Info';
      
      // Corps de l'email en HTML
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
      
      // Texte brut (version alternative pour les clients email qui ne supportent pas le HTML)
      const text = `
        Site Info - Changement de mot de passe
        
        Bonjour ${firstName || ''} ${lastName || ''},
        
        Votre mot de passe a été modifié avec succès.
        
        Nom d'utilisateur: ${username}
        
        Si vous n'êtes pas à l'origine de cette modification, veuillez contacter immédiatement l'administrateur du système.
        
        Cordialement,
        L'équipe Site Info
      `;
      
      const config = emailConfig(this.configService);
      
      // Envoyer l'email
      const info = await this.transporter.sendMail({
        from: `"Site Info" <${config.from}>`,
        to,
        subject,
        text,
        html,
      });
      
      // Loguer l'ID du message et l'URL de prévisualisation (pour Ethereal)
      this.logger.log(`Email envoyé: ${info.messageId}`);
      
      // Si c'est un compte de test Ethereal, afficher l'URL de prévisualisation
      if (info.messageId && info.envelope && (info as any).ethereal) {
        this.logger.log(`URL de prévisualisation: ${nodemailer.getTestMessageUrl(info)}`);
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Envoie un email de bienvenue aux nouveaux utilisateurs
   */
  async sendWelcomeEmail(to: string, username: string, password: string, firstName?: string, lastName?: string): Promise<boolean> {
    try {
      // Vérifier si le transporteur est initialisé
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
      
      // Texte brut (version alternative pour les clients email qui ne supportent pas le HTML)
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
      
      const config = emailConfig(this.configService);
      
      // Envoyer l'email
      const info = await this.transporter.sendMail({
        from: `"Site Info" <${config.from}>`,
        to,
        subject,
        text,
        html,
      });
      
      // Loguer l'ID du message et l'URL de prévisualisation (pour Ethereal)
      this.logger.log(`Email envoyé: ${info.messageId}`);
      
      // Si c'est un compte de test Ethereal, afficher l'URL de prévisualisation
      if (info.messageId && info.envelope && (info as any).ethereal) {
        this.logger.log(`URL de prévisualisation: ${nodemailer.getTestMessageUrl(info)}`);
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email: ${error.message}`, error.stack);
      return false;
    }
  }
} 