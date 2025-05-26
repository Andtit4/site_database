import { UsersService } from './users.service';
import { CreateDepartmentUserDto, ChangePasswordDto, UpdateProfileDto, CreateUserDto, UpdateUserDto } from '../dto/users.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createUser(createUserDto: CreateUserDto): Promise<{
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        departmentId: string;
        isDepartmentAdmin: boolean;
        hasDepartmentRights: boolean;
        managedEquipmentTypes: string[];
        createdAt: Date;
    }>;
    getAllUsers(): Promise<import("../entities/user.entity").User[]>;
    getUserById(id: string): Promise<import("../entities/user.entity").User>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<import("../entities/user.entity").User>;
    deleteUser(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createDepartmentUser(createDepartmentUserDto: CreateDepartmentUserDto): Promise<{
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        departmentId: string;
        isDepartmentAdmin: boolean;
        hasDepartmentRights: boolean;
        createdAt: Date;
    }>;
    checkUsernameAvailability(username: string, req: any): Promise<{
        available: boolean;
    }>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<{
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        isAdmin: boolean;
        departmentId: string;
        isDepartmentAdmin: boolean;
        hasDepartmentRights: boolean;
        managedEquipmentTypes: string[];
        updatedAt: Date;
    }>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
