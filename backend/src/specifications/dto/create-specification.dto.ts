import { IsEnum, IsArray, ValidateNested, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class ColumnDefinition {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsNumber()
  length?: number;

  @IsOptional()
  @IsBoolean()
  nullable?: boolean;

  @IsOptional()
  @IsString()
  defaultValue?: string;
}

export class CreateSpecificationDto {
  @IsEnum([
    'ANTENNE',
    'ROUTEUR',
    'BATTERIE',
    'GÉNÉRATEUR',
    'REFROIDISSEMENT',
    'SHELTER',
    'PYLÔNE',
    'SÉCURITÉ'
  ])
  equipmentType: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnDefinition)
  columns: ColumnDefinition[];
} 