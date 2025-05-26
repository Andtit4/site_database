import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateDepartmentUserDto } from './dto/create-department-user.dto';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(loginDto: LoginDto): Promise<any>;
    getProfile(req: any): Promise<any>;
    createAdmin(createAdminDto: CreateAdminDto): Promise<{
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        isAdmin: boolean;
        createdAt: Date;
    }>;
    createDepartmentUser(createDepartmentUserDto: CreateDepartmentUserDto): Promise<{
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        isDepartmentAdmin: boolean;
        departmentId: string;
        createdAt: Date;
    }>;
    setupInitialAdmin(createAdminDto: CreateAdminDto, setupKey: string): Promise<{
        message: string;
        admin: {
            id: string;
            username: string;
            email: string;
            firstName: string;
            lastName: string;
            isAdmin: boolean;
            createdAt: Date;
        };
    }>;
}
