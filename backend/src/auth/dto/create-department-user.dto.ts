import { IsEmail, IsNotEmpty, IsString, MinLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentUserDto {
  @ApiProperty({
    description: 'Nom d\'utilisateur unique pour le compte du département',
    example: 'dept_transmission',
    required: true
  })
  @IsNotEmpty({ message: 'Le nom d\'utilisateur est requis' })
  @IsString({ message: 'Le nom d\'utilisateur doit être une chaîne de caractères' })
  username: string;

  @ApiProperty({
    description: 'Mot de passe pour le compte du département (min. 8 caractères)',
    example: 'Dept123!',
    required: true,
    minLength: 8
  })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @ApiProperty({
    description: 'Adresse email valide pour le compte du département',
    example: 'transmission@example.com',
    required: true
  })
  @IsEmail({}, { message: 'L\'email doit être valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @ApiProperty({
    description: 'Prénom du responsable du département',
    example: 'John',
    required: true
  })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le prénom est requis' })
  firstName: string;

  @ApiProperty({
    description: 'Nom de famille du responsable du département',
    example: 'Doe',
    required: true
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  lastName: string;

  @ApiProperty({
    description: 'ID du département',
    example: 'uuid-du-département',
    required: true
  })
  @IsNotEmpty({ message: 'L\'ID du département est requis' })
  @IsUUID('4', { message: 'L\'ID du département doit être un UUID valide' })
  departmentId: string;
} 