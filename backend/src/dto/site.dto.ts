import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, ValidateNested, IsArray, IsLatitude, IsLongitude, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { SiteStatus } from '../entities/site.entity';
import { CreateEquipmentDto } from './equipment.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSiteDto {
  @ApiProperty({
    description: 'Identifiant unique du site',
    example: 'SITE001',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Nom du site',
    example: 'Site de Douala',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Région géographique du site',
    example: 'Littoral',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({
    description: 'Longitude (coordonnées GPS)',
    example: 9.707237,
    required: true
  })
  @IsNumber()
  @IsLongitude()
  longitude: number;

  @ApiProperty({
    description: 'Latitude (coordonnées GPS)',
    example: 4.049946,
    required: true
  })
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiPropertyOptional({
    description: 'Statut du site',
    enum: SiteStatus,
    default: SiteStatus.ACTIVE,
    example: SiteStatus.ACTIVE
  })
  @IsEnum(SiteStatus)
  @IsOptional()
  status?: SiteStatus = SiteStatus.ACTIVE;

  @ApiPropertyOptional({
    description: 'Identifiant de la base précédente',
    example: 'OLD-BASE-123'
  })
  @IsString()
  @IsOptional()
  oldBase?: string;

  @ApiPropertyOptional({
    description: 'Identifiant de la nouvelle base',
    example: 'NEW-BASE-456'
  })
  @IsString()
  @IsOptional()
  newBase?: string;

  @ApiPropertyOptional({
    description: 'Zone géographique du site',
    example: 'Zone Nord'
  })
  @IsString()
  @IsOptional()
  zone?: string;

  @ApiPropertyOptional({
    description: 'Spécifications statiques du site',
    type: 'object',
    example: { description: 'Site principal' }
  })
  @IsObject()
  @IsOptional()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Valeurs des champs personnalisés du site',
    type: 'object',
    example: { hauteur: 50, surface_totale: 120.5 }
  })
  @IsObject()
  @IsOptional()
  customFieldsValues?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'ID du département propriétaire du site',
    example: 'dept-001'
  })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Équipements à ajouter au site lors de la création',
    type: [CreateEquipmentDto]
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateEquipmentDto)
  equipment?: CreateEquipmentDto[];
}

export class UpdateSiteDto {
  @ApiPropertyOptional({
    description: 'Nom du site',
    example: 'Site de Douala'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Région géographique du site',
    example: 'Littoral'
  })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({
    description: 'Zone géographique du site',
    example: 'Zone Nord'
  })
  @IsString()
  @IsOptional()
  zone?: string;

  @ApiPropertyOptional({
    description: 'Longitude (coordonnées GPS)',
    example: 9.707237
  })
  @IsNumber()
  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Latitude (coordonnées GPS)',
    example: 4.049946
  })
  @IsNumber()
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Statut du site',
    enum: SiteStatus,
    example: SiteStatus.ACTIVE
  })
  @IsEnum(SiteStatus)
  @IsOptional()
  status?: SiteStatus;

  @ApiPropertyOptional({
    description: 'Identifiant de la base précédente',
    example: 'OLD-BASE-123'
  })
  @IsString()
  @IsOptional()
  oldBase?: string;

  @ApiPropertyOptional({
    description: 'Identifiant de la nouvelle base',
    example: 'NEW-BASE-456'
  })
  @IsString()
  @IsOptional()
  newBase?: string;

  @ApiPropertyOptional({
    description: 'Spécifications statiques du site',
    type: 'object',
    example: { description: 'Site principal' }
  })
  @IsObject()
  @IsOptional()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Valeurs des champs personnalisés du site',
    type: 'object',
    example: { hauteur: 50, surface_totale: 120.5 }
  })
  @IsObject()
  @IsOptional()
  customFieldsValues?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'ID du département propriétaire du site',
    example: 'dept-001'
  })
  @IsString()
  @IsOptional()
  departmentId?: string;
}

export class SiteFilterDto {
  @ApiPropertyOptional({
    description: 'Terme de recherche pour le nom ou la description du site',
    example: 'Douala'
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtre par région',
    example: 'Littoral'
  })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({
    description: 'Filtre par statut',
    enum: SiteStatus,
    isArray: true,
    example: [SiteStatus.ACTIVE, SiteStatus.MAINTENANCE]
  })
  @IsEnum(SiteStatus, { each: true })
  @IsOptional()
  status?: SiteStatus[];

  @ApiPropertyOptional({
    description: 'Inclure les sites marqués comme supprimés',
    default: false,
    example: false
  })
  @IsOptional()
  includeDeleted?: boolean;
} 
