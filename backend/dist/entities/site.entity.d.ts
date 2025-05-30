import { Equipment } from './equipment.entity';
import { Team } from '../teams/entities/team.entity';
export declare enum SiteStatus {
    ACTIVE = "ACTIVE",
    MAINTENANCE = "MAINTENANCE",
    INACTIVE = "INACTIVE",
    UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION",
    DELETED = "DELETED"
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
    equipment: Equipment[];
    teams: Team[];
    specifications: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
