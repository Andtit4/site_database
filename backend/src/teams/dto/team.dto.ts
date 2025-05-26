import { IsEnum, IsString, IsOptional, IsNumber, IsObject, IsNotEmpty, IsUUID, IsBoolean, IsEmail, MinLength, IsArray } from 'class-validator';
import { TeamStatus } from '../entities/team.entity';
import { EquipmentType } from '../../entities/equipment.entity';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TeamStatus)
  @IsOptional()
  status?: TeamStatus;

  @IsString()
  @IsOptional()
  leadName?: string;

  @IsString()
  @IsOptional()
  leadContact?: string;

  @IsNumber()
  @IsOptional()
  memberCount?: number = 0;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  lastActiveDate?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsEnum(EquipmentType)
  @IsOptional()
  equipmentType?: EquipmentType;

  @IsArray()
  @IsEnum(EquipmentType, { each: true })
  @IsOptional()
  equipmentTypes?: EquipmentType[];

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsBoolean()
  @IsOptional()
  createAccount?: boolean = false;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password?: string;

  @IsEmail()
  @IsOptional()
  userEmail?: string;

  @IsBoolean()
  @IsOptional()
  hasDepartmentRights?: boolean = false;
}

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TeamStatus)
  @IsOptional()
  status?: TeamStatus;

  @IsString()
  @IsOptional()
  leadName?: string;

  @IsString()
  @IsOptional()
  leadContact?: string;

  @IsNumber()
  @IsOptional()
  memberCount?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  lastActiveDate?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsEnum(EquipmentType)
  @IsOptional()
  equipmentType?: EquipmentType;

  @IsArray()
  @IsEnum(EquipmentType, { each: true })
  @IsOptional()
  equipmentTypes?: EquipmentType[];

  @IsUUID()
  @IsOptional()
  departmentId?: string;
}

export class TeamFilterDto {
  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsEnum(EquipmentType)
  equipmentType?: EquipmentType;

  @IsOptional()
  @IsString()
  search?: string;
} 