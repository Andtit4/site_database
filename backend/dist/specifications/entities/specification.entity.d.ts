export declare class Specification {
    id: string;
    generateId(): void;
    equipmentType: string;
    columns: Array<{
        name: string;
        type: string;
        length?: number;
        nullable?: boolean;
        defaultValue?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
