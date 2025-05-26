import { DataSource } from 'typeorm';
import { Specification } from '../specifications/entities/specification.entity';
export declare class TableManagerService {
    private dataSource;
    constructor(dataSource: DataSource);
    createTable(specification: Specification): Promise<void>;
    dropTable(equipmentType: string): Promise<void>;
}
