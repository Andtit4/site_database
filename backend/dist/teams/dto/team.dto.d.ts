import { TeamStatus } from '../entities/team.entity';
import { EquipmentType } from '../../entities/equipment.entity';
export declare class CreateTeamDto {
    name: string;
    description?: string;
    status?: TeamStatus;
    leadName?: string;
    leadContact?: string;
    memberCount?: number;
    location?: string;
    lastActiveDate?: string;
    metadata?: Record<string, any>;
    equipmentType?: EquipmentType;
    equipmentTypes?: EquipmentType[];
    departmentId?: string;
    createAccount?: boolean;
    password?: string;
    userEmail?: string;
    hasDepartmentRights?: boolean;
}
export declare class UpdateTeamDto {
    name?: string;
    description?: string;
    status?: TeamStatus;
    leadName?: string;
    leadContact?: string;
    memberCount?: number;
    location?: string;
    lastActiveDate?: string;
    metadata?: Record<string, any>;
    equipmentType?: EquipmentType;
    equipmentTypes?: EquipmentType[];
    departmentId?: string;
}
export declare class TeamFilterDto {
    status?: TeamStatus;
    departmentId?: string;
    equipmentType?: EquipmentType;
    search?: string;
}
