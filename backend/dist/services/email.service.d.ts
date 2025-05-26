import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    private initializeTransporter;
    sendCredentialsEmail(to: string, username: string, password: string, firstName: string, lastName: string, isDepartment: boolean): Promise<boolean>;
    sendPasswordChangedEmail(to: string, username: string, firstName?: string, lastName?: string): Promise<boolean>;
    sendWelcomeEmail(to: string, username: string, password: string, firstName?: string, lastName?: string): Promise<boolean>;
}
