declare class ColumnDefinition {
    name: string;
    type: string;
    length?: number;
    nullable?: boolean;
    defaultValue?: string;
}
export declare class CreateSpecificationDto {
    equipmentType: string;
    columns: ColumnDefinition[];
}
export {};
