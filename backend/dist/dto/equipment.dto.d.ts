import { EquipmentType, EquipmentStatus } from '../entities/equipment.entity';
export declare class CreateEquipmentDto {
    id: string;
    type: EquipmentType;
    model: string;
    manufacturer?: string;
    serialNumber?: string;
    installDate: string;
    lastMaintenanceDate?: string;
    status?: EquipmentStatus;
    specifications?: Record<string, string>;
    siteId: string;
    departmentId?: string;
    teamId?: string;
}
export declare class UpdateEquipmentDto {
    type?: EquipmentType;
    model?: string;
    manufacturer?: string;
    serialNumber?: string;
    installDate?: string;
    lastMaintenanceDate?: string;
    status?: EquipmentStatus;
    specifications?: Record<string, string>;
    siteId?: string;
    departmentId?: string;
    teamId?: string;
}
export declare class EquipmentFilterDto {
    search?: string;
    type?: EquipmentType[];
    status?: EquipmentStatus[];
    siteId?: string;
    departmentId?: string;
}
