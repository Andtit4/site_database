import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'votre_secret_jwt_super_securise',
  signOptions: {
    expiresIn: '24h',
  },
})); 