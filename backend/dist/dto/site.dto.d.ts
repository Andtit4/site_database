import { SiteStatus } from '../entities/site.entity';
import { CreateEquipmentDto } from './equipment.dto';
export declare class CreateSiteDto {
    id: string;
    name: string;
    region: string;
    longitude: number;
    latitude: number;
    status?: SiteStatus;
    oldBase?: string;
    newBase?: string;
    equipment?: CreateEquipmentDto[];
}
export declare class UpdateSiteDto {
    name?: string;
    region?: string;
    longitude?: number;
    latitude?: number;
    status?: SiteStatus;
    oldBase?: string;
    newBase?: string;
}
export declare class SiteFilterDto {
    search?: string;
    region?: string;
    status?: SiteStatus[];
}
