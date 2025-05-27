import { DataSource } from 'typeorm';
import { Specification } from '../specifications/entities/specification.entity';
export interface TableDefinition {
    tableName: string;
    columns: Array<{
        name: string;
        type: string;
        length?: number;
        nullable?: boolean;
        defaultValue?: string;
    }>;
}
export declare class TableManagerService {
    private dataSource;
    constructor(dataSource: DataSource);
    createTable(tableDefinition: TableDefinition | Specification): Promise<void>;
    private checkTableExists;
    dropTable(tableName: string): Promise<void>;
}
