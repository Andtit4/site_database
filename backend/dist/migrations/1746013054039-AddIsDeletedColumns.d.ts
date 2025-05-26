import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddIsDeletedColumns1746013054039 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
