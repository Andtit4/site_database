import { Site } from './site.entity';
import { Department } from './department.entity';
export declare enum EquipmentType {
    ANTENNA = "ANTENNE",
    ROUTER = "ROUTEUR",
    BATTERY = "BATTERIE",
    GENERATOR = "G\u00C9N\u00C9RATEUR",
    COOLING = "REFROIDISSEMENT",
    SHELTER = "SHELTER",
    TOWER = "PYL\u00D4NE",
    SECURITY = "S\u00C9CURIT\u00C9"
}
export declare enum EquipmentStatus {
    ACTIVE = "ACTIF",
    MAINTENANCE = "MAINTENANCE",
    INACTIVE = "INACTIF",
    PLANNED = "PLANIFI\u00C9",
    UNDER_INSTALLATION = "EN_INSTALLATION"
}
export declare class Equipment {
    id: string;
    name: string;
    description: string;
    model: string;
    serialNumber: string;
    manufacturer: string;
    purchaseDate: Date;
    installDate: Date;
    lastMaintenanceDate: Date;
    status: string;
    location: string;
    purchasePrice: number;
    warrantyExpiration: Date;
    ipAddress: string;
    macAddress: string;
    isDeleted: boolean;
    site: Site;
    siteId: string;
    department: Department;
    departmentId: string;
    createdAt: Date;
    updatedAt: Date;
}
