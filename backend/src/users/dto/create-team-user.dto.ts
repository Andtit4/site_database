import { IsString, IsNotEmpty, IsEmail, IsOptional, IsUUID, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  hasDepartmentRights: boolean = false;
} 