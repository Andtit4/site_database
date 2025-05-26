import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject, IsUUID, IsIn, IsDateString } from 'class-validator';
import { EquipmentType, EquipmentStatus } from '../entities/equipment.entity';

export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(EquipmentType)
  @IsNotEmpty()
  type: EquipmentType;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsString()
  @IsNotEmpty()
  installDate: string;

  @IsString()
  @IsOptional()
  lastMaintenanceDate?: string;

  @IsEnum(EquipmentStatus)
  @IsOptional()
  status?: EquipmentStatus;

  @IsObject()
  @IsOptional()
  specifications?: Record<string, string>;

  @IsString()
  @IsNotEmpty()
  siteId: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  teamId?: string;
}

export class UpdateEquipmentDto {
  @IsEnum(EquipmentType)
  @IsOptional()
  type?: EquipmentType;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsString()
  @IsOptional()
  installDate?: string;

  @IsString()
  @IsOptional()
  lastMaintenanceDate?: string;

  @IsEnum(EquipmentStatus)
  @IsOptional()
  status?: EquipmentStatus;

  @IsObject()
  @IsOptional()
  specifications?: Record<string, string>;

  @IsString()
  @IsOptional()
  siteId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  teamId?: string;
}

export class EquipmentFilterDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(EquipmentType, { each: true })
  @IsOptional()
  type?: EquipmentType[];

  @IsEnum(EquipmentStatus, { each: true })
  @IsOptional()
  status?: EquipmentStatus[];

  @IsString()
  @IsOptional()
  siteId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;
} 