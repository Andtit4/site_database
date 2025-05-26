import { ConfigService } from '@nestjs/config';
export declare const emailConfig: (configService: ConfigService) => {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
};
