import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Nom d\'utilisateur pour la connexion',
    example: 'admin',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Mot de passe pour la connexion',
    example: 'Admin123!',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  password: string;
} 