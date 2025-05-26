import { SpecificationsService } from './specifications.service';
import { CreateSpecificationDto } from './dto/create-specification.dto';
import { UpdateSpecificationDto } from './dto/update-specification.dto';
export declare class SpecificationsController {
    private readonly specificationsService;
    constructor(specificationsService: SpecificationsService);
    findAll(): Promise<import("./entities/specification.entity").Specification[]>;
    findByType(equipmentType: string): Promise<import("./entities/specification.entity").Specification[]>;
    create(createSpecificationDto: CreateSpecificationDto): Promise<import("./entities/specification.entity").Specification>;
    update(id: string, updateSpecificationDto: UpdateSpecificationDto): Promise<import("./entities/specification.entity").Specification>;
    remove(id: string): Promise<void>;
}
