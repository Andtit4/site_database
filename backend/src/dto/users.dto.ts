import { IsString, IsNotEmpty, IsEmail, IsOptional, IsUUID, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentUserDto {
  @ApiProperty({
    description: 'Nom d\'utilisateur',
    example: 'john.doe'
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'mot_de_passe_securise'
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Adresse email',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Prénom',
    example: 'John'
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Nom de famille',
    example: 'Doe'
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'ID du département',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({
    description: 'A les droits du département',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  hasDepartmentRights?: boolean = false;
}

export class CreateTeamUserDto {
  @ApiProperty({
    description: 'Nom d\'utilisateur',
    example: 'team_transmission'
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'mot_de_passe_securise'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @ApiProperty({
    description: 'Adresse email',
    example: 'team@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Prénom',
    example: 'Team'
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Nom de famille',
    example: 'Transmission'
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'ID de l\'équipe',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  teamId: string;

  @ApiProperty({
    description: 'ID du département',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({
    description: 'Est membre d\'une équipe',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isTeamMember?: boolean = true;

  @ApiProperty({
    description: 'A les droits du département',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  hasDepartmentRights?: boolean = false;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Nouveau mot de passe',
    example: 'nouveau_mot_de_passe_securise'
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Nom d\'utilisateur',
    example: 'john.smith'
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: 'Adresse email',
    example: 'john.smith@example.com'
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Prénom',
    example: 'John'
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Nom de famille',
    example: 'Smith'
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Nom d\'utilisateur',
    example: 'john.doe'
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'mot_de_passe_securise'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @ApiProperty({
    description: 'Adresse email',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Prénom',
    example: 'John'
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Nom de famille',
    example: 'Doe'
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'ID du département',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Est administrateur du département',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  isDepartmentAdmin?: boolean = false;

  @ApiPropertyOptional({
    description: 'A les droits du département',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  hasDepartmentRights?: boolean = false;

  @ApiPropertyOptional({
    description: 'Types d\'équipement gérés',
    example: ['ANTENNE', 'ROUTEUR']
  })
  @IsOptional()
  managedEquipmentTypes?: string[] = [];
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nom d\'utilisateur',
    example: 'john.doe'
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: 'Mot de passe',
    example: 'nouveau_mot_de_passe_securise'
  })
  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password?: string;

  @ApiPropertyOptional({
    description: 'Adresse email',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Prénom',
    example: 'John'
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Nom de famille',
    example: 'Doe'
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'ID du département',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Est administrateur du département',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  isDepartmentAdmin?: boolean;

  @ApiPropertyOptional({
    description: 'A les droits du département',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  hasDepartmentRights?: boolean;

  @ApiPropertyOptional({
    description: 'Types d\'équipement gérés',
    example: ['ANTENNE', 'ROUTEUR']
  })
  @IsOptional()
  managedEquipmentTypes?: string[];
} 