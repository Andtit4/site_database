export declare class CreateDepartmentUserDto {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    departmentId: string;
    hasDepartmentRights?: boolean;
}
export declare class CreateTeamUserDto {
    username: string;
    password: string;
    email: string;
    firstName?: string;
    lastName?: string;
    teamId: string;
    departmentId?: string;
    isTeamMember?: boolean;
    hasDepartmentRights?: boolean;
}
export declare class ChangePasswordDto {
    password: string;
}
export declare class UpdateProfileDto {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}
export declare class CreateUserDto {
    username: string;
    password: string;
    email: string;
    firstName?: string;
    lastName?: string;
    departmentId?: string;
    isDepartmentAdmin?: boolean;
    hasDepartmentRights?: boolean;
    managedEquipmentTypes?: string[];
}
export declare class UpdateUserDto {
    username?: string;
    password?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    departmentId?: string;
    isDepartmentAdmin?: boolean;
    hasDepartmentRights?: boolean;
    managedEquipmentTypes?: string[];
}
