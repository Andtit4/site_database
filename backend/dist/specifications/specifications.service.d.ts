import { Repository } from 'typeorm';
import { Specification } from './entities/specification.entity';
import { CreateSpecificationDto } from './dto/create-specification.dto';
import { UpdateSpecificationDto } from './dto/update-specification.dto';
import { TableManagerService } from '../table-manager/table-manager.service';
export declare class SpecificationsService {
    private specificationRepository;
    private tableManagerService;
    constructor(specificationRepository: Repository<Specification>, tableManagerService: TableManagerService);
    findAll(): Promise<Specification[]>;
    findByType(equipmentType: string): Promise<Specification[]>;
    findOne(id: string): Promise<Specification>;
    create(createSpecificationDto: CreateSpecificationDto): Promise<Specification>;
    update(id: string, updateSpecificationDto: UpdateSpecificationDto): Promise<Specification>;
    remove(id: string): Promise<void>;
}
