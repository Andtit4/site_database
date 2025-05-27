import { IsString, IsArray, IsEnum, IsNotEmpty, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SiteTypes, ColumnDefinitionDto } from './create-site-specification.dto';

export class UpdateSiteSpecificationDto {
  @ApiProperty({
    description: 'Type de site',
    enum: SiteTypes,
    example: SiteTypes.TOUR,
    required: false
  })
  @IsEnum(SiteTypes)
  @IsOptional()
  siteType?: string;

  @ApiProperty({
    description: 'Définitions des colonnes pour la table de spécifications',
    type: [ColumnDefinitionDto],
    required: false
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnDefinitionDto)
  @IsOptional()
  columns?: ColumnDefinitionDto[];
} 
