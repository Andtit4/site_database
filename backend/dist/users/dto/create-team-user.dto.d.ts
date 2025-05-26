export declare class CreateTeamUserDto {
    username: string;
    password: string;
    email: string;
    firstName?: string;
    lastName?: string;
    teamId: string;
    departmentId?: string;
    isTeamMember?: boolean;
    hasDepartmentRights: boolean;
}
