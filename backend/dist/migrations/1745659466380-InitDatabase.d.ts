import { MigrationInterface, QueryRunner } from "typeorm";
export declare class InitDatabase1745659466380 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
