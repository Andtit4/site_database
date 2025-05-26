import { ConfigService } from '@nestjs/config';

export const emailConfig = (configService: ConfigService) => ({
  host: configService.get<string>('EMAIL_HOST', 'smtp.ethereal.email'),
  port: configService.get<number>('EMAIL_PORT', 587),
  user: configService.get<string>('EMAIL_USER'),
  password: configService.get<string>('EMAIL_PASSWORD'),
  from: configService.get<string>('EMAIL_FROM', 'noreply@site-info.com'),
}); 