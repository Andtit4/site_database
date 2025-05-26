import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto, UpdateEquipmentDto, EquipmentFilterDto } from '../dto/equipment.dto';
export declare class EquipmentController {
    private readonly equipmentService;
    constructor(equipmentService: EquipmentService);
    create(createEquipmentDto: CreateEquipmentDto): Promise<import("../entities/equipment.entity").Equipment>;
    findAll(filterDto: EquipmentFilterDto): Promise<import("../entities/equipment.entity").Equipment[]>;
    getStatistics(): Promise<{
        totalEquipment: number;
        byType: {};
        byStatus: {};
    }>;
    findOne(id: string): Promise<import("../entities/equipment.entity").Equipment>;
    update(id: string, updateEquipmentDto: UpdateEquipmentDto): Promise<import("../entities/equipment.entity").Equipment>;
    remove(id: string): Promise<void>;
}
