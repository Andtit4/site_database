import { IsString, IsArray, IsEnum, IsNotEmpty, ValidateNested, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// Énumération des types de sites
export enum SiteTypes {
  TOUR = 'TOUR',
  SHELTER = 'SHELTER',
  PYLONE = 'PYLONE',
  BATIMENT = 'BATIMENT',
  TOIT_BATIMENT = 'TOIT_BATIMENT',
  ROOFTOP = 'ROOFTOP',
  TERRAIN_BAILLE = 'TERRAIN_BAILLE',
  TERRAIN_PROPRIETAIRE = 'TERRAIN_PROPRIETAIRE',
  AUTRE = 'AUTRE'
}

// Énumération des types de colonnes supportés
export enum ColumnTypes {
  VARCHAR = 'varchar',
  INTEGER = 'int',
  FLOAT = 'float',
  DECIMAL = 'decimal',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  TEXT = 'text'
}

export class ColumnDefinitionDto {
  @ApiProperty({
    description: 'Nom de la colonne',
    example: 'hauteur'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Type de la colonne',
    enum: ColumnTypes,
    example: ColumnTypes.FLOAT
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Longueur de la colonne (pour les types varchar)',
    example: 255,
    required: false
  })
  @IsNumber()
  @IsOptional()
  length?: number;

  @ApiProperty({
    description: 'Si la colonne peut être nulle',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  nullable?: boolean;

  @ApiProperty({
    description: 'Valeur par défaut',
    example: '0',
    required: false
  })
  @IsString()
  @IsOptional()
  defaultValue?: string;
}

export class CreateSiteSpecificationDto {
  @ApiProperty({
    description: 'Type de site',
    enum: SiteTypes,
    example: SiteTypes.TOUR
  })
  @IsEnum(SiteTypes)
  @IsNotEmpty()
  siteType: string;

  @ApiProperty({
    description: 'Définitions des colonnes pour la table de spécifications',
    type: [ColumnDefinitionDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnDefinitionDto)
  columns: ColumnDefinitionDto[];
} 
