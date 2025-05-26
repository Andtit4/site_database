import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsDeletedColumns1746013054039 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajouter la colonne isDeleted à la table users
        const hasUsersColumn = await queryRunner.hasColumn('users', 'isDeleted');
        if (!hasUsersColumn) {
            await queryRunner.query(`ALTER TABLE users ADD COLUMN isDeleted BOOLEAN DEFAULT false NOT NULL`);
        }

        // Ajouter la colonne isDeleted à la table teams (si elle existe)
        const teamsTableExists = await queryRunner.hasTable('teams');
        if (teamsTableExists) {
            const hasTeamsColumn = await queryRunner.hasColumn('teams', 'isDeleted');
            if (!hasTeamsColumn) {
                await queryRunner.query(`ALTER TABLE teams ADD COLUMN isDeleted BOOLEAN DEFAULT false NOT NULL`);
            }
        }

        // Ajouter la colonne isDeleted à la table departments (si elle existe)
        const departmentsTableExists = await queryRunner.hasTable('departments');
        if (departmentsTableExists) {
            const hasDepartmentsColumn = await queryRunner.hasColumn('departments', 'isDeleted');
            if (!hasDepartmentsColumn) {
                await queryRunner.query(`ALTER TABLE departments ADD COLUMN isDeleted BOOLEAN DEFAULT false NOT NULL`);
            }
        }

        // Ajouter la colonne isTeamMember à la table users si elle n'existe pas encore
        const hasTeamMemberColumn = await queryRunner.hasColumn('users', 'isTeamMember');
        if (!hasTeamMemberColumn) {
            await queryRunner.query(`ALTER TABLE users ADD COLUMN isTeamMember BOOLEAN DEFAULT false NOT NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer la colonne isDeleted de la table users
        const hasUsersColumn = await queryRunner.hasColumn('users', 'isDeleted');
        if (hasUsersColumn) {
            await queryRunner.query(`ALTER TABLE users DROP COLUMN isDeleted`);
        }

        // Supprimer la colonne isDeleted de la table teams
        const teamsTableExists = await queryRunner.hasTable('teams');
        if (teamsTableExists) {
            const hasTeamsColumn = await queryRunner.hasColumn('teams', 'isDeleted');
            if (hasTeamsColumn) {
                await queryRunner.query(`ALTER TABLE teams DROP COLUMN isDeleted`);
            }
        }

        // Supprimer la colonne isDeleted de la table departments
        const departmentsTableExists = await queryRunner.hasTable('departments');
        if (departmentsTableExists) {
            const hasDepartmentsColumn = await queryRunner.hasColumn('departments', 'isDeleted');
            if (hasDepartmentsColumn) {
                await queryRunner.query(`ALTER TABLE departments DROP COLUMN isDeleted`);
            }
        }

        // Supprimer la colonne isTeamMember de la table users
        const hasTeamMemberColumn = await queryRunner.hasColumn('users', 'isTeamMember');
        if (hasTeamMemberColumn) {
            await queryRunner.query(`ALTER TABLE users DROP COLUMN isTeamMember`);
        }
    }
}
