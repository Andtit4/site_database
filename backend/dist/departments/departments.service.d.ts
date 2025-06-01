import type { Repository } from 'typeorm';
import type { Request } from 'express';
import { Department } from '../entities/department.entity';
import type { CreateDepartmentDto, UpdateDepartmentDto, DepartmentFilterDto } from '../dto/department.dto';
import { UsersService } from '../users/users.service';
export declare class DepartmentsService {
    private departmentsRepository;
    private usersService;
    private request;
    private readonly logger;
    constructor(departmentsRepository: Repository<Department>, usersService: UsersService, request: Request);
    private getCurrentUser;
    create(createDepartmentDto: CreateDepartmentDto): Promise<Department>;
    private createDepartmentUser;
    private generateRandomPassword;
    findAll(filterDto?: DepartmentFilterDto): Promise<Department[]>;
    findOne(id: string): Promise<Department>;
    update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department>;
    remove(id: string): Promise<void>;
    getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byType: {};
    }>;
}
