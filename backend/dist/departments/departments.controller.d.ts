import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentFilterDto } from '../dto/department.dto';
import { Department } from '../entities/department.entity';
import { EquipmentType } from '../entities/equipment.entity';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    create(createDepartmentDto: CreateDepartmentDto): Promise<Department>;
    findAll(filterDto: DepartmentFilterDto): Promise<Department[]>;
    getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byType: {};
    }>;
    findByEquipmentType(type: EquipmentType): Promise<Department[]>;
    findOne(id: string): Promise<Department>;
    update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department>;
    remove(id: string): Promise<void>;
}
