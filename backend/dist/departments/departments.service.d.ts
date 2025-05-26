import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentFilterDto } from '../dto/department.dto';
import { EmailService } from '../services/email.service';
import { UsersService } from '../users/users.service';
export declare class DepartmentsService {
    private departmentsRepository;
    private usersService;
    private emailService;
    private readonly logger;
    constructor(departmentsRepository: Repository<Department>, usersService: UsersService, emailService: EmailService);
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
