import { Repository } from 'typeorm';
import { Equipment } from '../entities/equipment.entity';
import { CreateEquipmentDto, UpdateEquipmentDto, EquipmentFilterDto } from '../dto/equipment.dto';
import { SitesService } from '../sites/sites.service';
import { DepartmentsService } from '../departments/departments.service';
import { TeamsService } from '../teams/teams.service';
export declare class EquipmentService {
    private equipmentRepository;
    private sitesService;
    private departmentsService;
    private teamsService;
    constructor(equipmentRepository: Repository<Equipment>, sitesService: SitesService, departmentsService: DepartmentsService, teamsService: TeamsService);
    findAll(filterDto?: EquipmentFilterDto): Promise<Equipment[]>;
    findOne(id: string): Promise<Equipment>;
    create(createEquipmentDto: CreateEquipmentDto): Promise<Equipment>;
    update(id: string, updateEquipmentDto: UpdateEquipmentDto): Promise<Equipment>;
    remove(id: string): Promise<void>;
    removeBySiteId(siteId: string): Promise<number>;
    removeByDepartmentId(departmentId: string): Promise<number>;
    getStatistics(): Promise<{
        totalEquipment: number;
        byType: {};
        byStatus: {};
    }>;
    findAllByType(type: string): Promise<Equipment[]>;
}
