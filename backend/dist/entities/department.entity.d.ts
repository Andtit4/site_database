import { Equipment } from './equipment.entity';
import { Team } from '../teams/entities/team.entity';
export declare enum DepartmentType {
    TRANSMISSION = "TRANSMISSION",
    ENERGIE = "ENERGIE",
    INFRASTRUCTURE = "INFRASTRUCTURE",
    INFORMATIQUE = "INFORMATIQUE",
    SECURITE = "SECURITE"
}
export declare class Department {
    id: string;
    generateId(): void;
    name: string;
    type: string;
    description: string;
    responsibleName: string;
    contactEmail: string;
    contactPhone: number;
    isActive: boolean;
    teams: Team[];
    equipment: Equipment[];
    managedEquipmentTypes: string[];
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}
