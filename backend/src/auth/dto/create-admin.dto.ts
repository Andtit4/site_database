import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Nom d\'utilisateur unique pour le compte administrateur',
    example: 'admin',
    required: true
  })
  @IsNotEmpty({ message: 'Le nom d\'utilisateur est requis' })
  @IsString({ message: 'Le nom d\'utilisateur doit être une chaîne de caractères' })
  username: string;

  @ApiProperty({
    description: 'Mot de passe pour le compte administrateur (min. 8 caractères)',
    example: 'Admin123!',
    required: true,
    minLength: 8
  })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @ApiProperty({
    description: 'Adresse email valide pour le compte administrateur',
    example: 'admin@example.com',
    required: true
  })
  @IsEmail({}, { message: 'L\'email doit être valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @ApiProperty({
    description: 'Prénom de l\'administrateur',
    example: 'John',
    required: true
  })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le prénom est requis' })
  firstName: string;

  @ApiProperty({
    description: 'Nom de famille de l\'administrateur',
    example: 'Doe',
    required: true
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  lastName: string;
} 