import { Department } from './department.entity';
import { Team } from '../teams/entities/team.entity';
export declare class User {
    id: string;
    generateId(): void;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    isAdmin: boolean;
    isDepartmentAdmin: boolean;
    isTeamMember: boolean;
    isActive: boolean;
    isDeleted: boolean;
    hasDepartmentRights: boolean;
    managedEquipmentTypes: string[] | null;
    lastLogin: Date;
    department: Department;
    departmentId: string;
    team: Team;
    teamId: string;
    createdAt: Date;
    updatedAt: Date;
}
