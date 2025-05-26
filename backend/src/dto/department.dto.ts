import { IsString, IsOptional, IsBoolean, IsEmail, IsNotEmpty, IsEnum, IsArray, IsNumber, MinLength } from 'class-validator';
import { DepartmentType } from '../entities/department.entity';
import { EquipmentType } from '../entities/equipment.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Nom du département',
    example: 'Département Transmission'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Type du département',
    enum: DepartmentType,
    example: DepartmentType.TRANSMISSION
  })
  @IsEnum(DepartmentType)
  @IsNotEmpty()
  type: DepartmentType;

  @ApiProperty({
    description: 'Description du département',
    example: 'Département responsable des équipements de transmission',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Nom du responsable du département',
    example: 'Jean Dupont'
  })
  @IsString()
  @IsNotEmpty()
  responsibleName: string;

  @ApiProperty({
    description: 'Email de contact du département',
    example: 'transmission@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @ApiProperty({
    description: 'Numéro de téléphone du département',
    example: 661234567,
    required: false
  })
  @IsNumber()
  @IsOptional()
  contactPhone?: number;

  @ApiProperty({
    description: 'Statut actif du département',
    example: true,
    default: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
  
  @ApiProperty({
    description: 'Types d\'équipements gérés par le département',
    type: [String],
    enum: EquipmentType,
    example: [EquipmentType.ANTENNA, EquipmentType.ROUTER],
    required: false
  })
  @IsArray()
  @IsEnum(EquipmentType, { each: true })
  @IsOptional()
  managedEquipmentTypes?: EquipmentType[];

  @ApiProperty({
    description: 'Mot de passe pour le compte utilisateur du département (min. 8 caractères)',
    example: 'Dept123!',
    required: false
  })
  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password?: string;

  @ApiProperty({
    description: 'Créer un compte utilisateur pour ce département',
    example: true,
    default: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  createAccount?: boolean = true;
}

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(DepartmentType)
  @IsOptional()
  type?: DepartmentType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  responsibleName?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsNumber()
  @IsOptional()
  contactPhone?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
  
  @IsArray()
  @IsEnum(EquipmentType, { each: true })
  @IsOptional()
  managedEquipmentTypes?: EquipmentType[];
}

export class DepartmentFilterDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(DepartmentType)
  @IsOptional()
  type?: DepartmentType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
  
  @IsEnum(EquipmentType)
  @IsOptional()
  managesEquipmentType?: EquipmentType;
} 