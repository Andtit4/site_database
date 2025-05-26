import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabase1745659466380 implements MigrationInterface {
    name = 'InitDatabase1745659466380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`firstName\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`lastName\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isAdmin\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`lastLogin\``);
        await queryRunner.query(`ALTER TABLE \`equipment\` ADD \`installDate\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`firstName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`lastName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`isAdmin\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`isDepartmentAdmin\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`lastLogin\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`departmentId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`equipment\` DROP COLUMN \`lastMaintenanceDate\``);
        await queryRunner.query(`ALTER TABLE \`equipment\` ADD \`lastMaintenanceDate\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`equipment\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`equipment\` ADD \`status\` varchar(255) NOT NULL DEFAULT 'ACTIF'`);
        await queryRunner.query(`ALTER TABLE \`department\` DROP COLUMN \`contactPhone\``);
        await queryRunner.query(`ALTER TABLE \`department\` ADD \`contactPhone\` float NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_554d853741f2083faaa5794d2ae\` FOREIGN KEY (\`departmentId\`) REFERENCES \`department\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`team_equipment\` ADD CONSTRAINT \`FK_88adeb8c2648273c2e6084f93d6\` FOREIGN KEY (\`equipmentId\`) REFERENCES \`equipment\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`team_equipment\` ADD CONSTRAINT \`FK_d79e658657450532ad5473fc281\` FOREIGN KEY (\`teamId\`) REFERENCES \`team\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`team_equipment\` DROP FOREIGN KEY \`FK_d79e658657450532ad5473fc281\``);
        await queryRunner.query(`ALTER TABLE \`team_equipment\` DROP FOREIGN KEY \`FK_88adeb8c2648273c2e6084f93d6\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_554d853741f2083faaa5794d2ae\``);
        await queryRunner.query(`ALTER TABLE \`department\` DROP COLUMN \`contactPhone\``);
        await queryRunner.query(`ALTER TABLE \`department\` ADD \`contactPhone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`equipment\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`equipment\` ADD \`status\` enum ('ACTIF', 'MAINTENANCE', 'INACTIF', 'PLANIFIÉ', 'EN_INSTALLATION') NOT NULL DEFAULT 'ACTIF'`);
        await queryRunner.query(`ALTER TABLE \`equipment\` DROP COLUMN \`lastMaintenanceDate\``);
        await queryRunner.query(`ALTER TABLE \`equipment\` ADD \`lastMaintenanceDate\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`departmentId\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`lastLogin\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isDepartmentAdmin\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isAdmin\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`lastName\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`firstName\``);
        await queryRunner.query(`ALTER TABLE \`equipment\` DROP COLUMN \`installDate\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`lastLogin\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`isAdmin\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`lastName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`firstName\` varchar(255) NULL`);
    }

}
