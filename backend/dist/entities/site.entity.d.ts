import { Equipment } from './equipment.entity';
import { Team } from '../teams/entities/team.entity';
export declare enum SiteStatus {
    ACTIVE = "ACTIVE",
    MAINTENANCE = "MAINTENANCE",
    INACTIVE = "INACTIVE",
    UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION",
    DELETED = "DELETED"
}
export declare enum SiteType {
    TOUR = "TOUR",
    SHELTER = "SHELTER",
    PYLONE = "PYLONE",
    BATIMENT = "BATIMENT",
    TOIT = "TOIT",
    TERRAIN = "TERRAIN",
    AUTRE = "AUTRE"
}
export declare class Site {
    id: string;
    name: string;
    region: string;
    zone: string;
    longitude: number;
    latitude: number;
    status: string;
    oldBase: string;
    newBase: string;
    type: string;
    specifications: Record<string, any>;
    equipment: Equipment[];
    teams: Team[];
    createdAt: Date;
    updatedAt: Date;
}
