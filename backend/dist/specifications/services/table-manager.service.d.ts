import { DataSource } from 'typeorm';
interface TableDefinition {
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
    createTable(tableDefinition: TableDefinition): Promise<void>;
    private checkTableExists;
    private dropTable;
}
export {};
