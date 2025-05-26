"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsDeletedColumns1746013054039 = void 0;
class AddIsDeletedColumns1746013054039 {
    async up(queryRunner) {
        const hasUsersColumn = await queryRunner.hasColumn('users', 'isDeleted');
        if (!hasUsersColumn) {
            await queryRunner.query(`ALTER TABLE users ADD COLUMN isDeleted BOOLEAN DEFAULT false NOT NULL`);
        }
        const teamsTableExists = await queryRunner.hasTable('teams');
        if (teamsTableExists) {
            const hasTeamsColumn = await queryRunner.hasColumn('teams', 'isDeleted');
            if (!hasTeamsColumn) {
                await queryRunner.query(`ALTER TABLE teams ADD COLUMN isDeleted BOOLEAN DEFAULT false NOT NULL`);
            }
        }
        const departmentsTableExists = await queryRunner.hasTable('departments');
        if (departmentsTableExists) {
            const hasDepartmentsColumn = await queryRunner.hasColumn('departments', 'isDeleted');
            if (!hasDepartmentsColumn) {
                await queryRunner.query(`ALTER TABLE departments ADD COLUMN isDeleted BOOLEAN DEFAULT false NOT NULL`);
            }
        }
        const hasTeamMemberColumn = await queryRunner.hasColumn('users', 'isTeamMember');
        if (!hasTeamMemberColumn) {
            await queryRunner.query(`ALTER TABLE users ADD COLUMN isTeamMember BOOLEAN DEFAULT false NOT NULL`);
        }
    }
    async down(queryRunner) {
        const hasUsersColumn = await queryRunner.hasColumn('users', 'isDeleted');
        if (hasUsersColumn) {
            await queryRunner.query(`ALTER TABLE users DROP COLUMN isDeleted`);
        }
        const teamsTableExists = await queryRunner.hasTable('teams');
        if (teamsTableExists) {
            const hasTeamsColumn = await queryRunner.hasColumn('teams', 'isDeleted');
            if (hasTeamsColumn) {
                await queryRunner.query(`ALTER TABLE teams DROP COLUMN isDeleted`);
            }
        }
        const departmentsTableExists = await queryRunner.hasTable('departments');
        if (departmentsTableExists) {
            const hasDepartmentsColumn = await queryRunner.hasColumn('departments', 'isDeleted');
            if (hasDepartmentsColumn) {
                await queryRunner.query(`ALTER TABLE departments DROP COLUMN isDeleted`);
            }
        }
        const hasTeamMemberColumn = await queryRunner.hasColumn('users', 'isTeamMember');
        if (hasTeamMemberColumn) {
            await queryRunner.query(`ALTER TABLE users DROP COLUMN isTeamMember`);
        }
    }
}
exports.AddIsDeletedColumns1746013054039 = AddIsDeletedColumns1746013054039;
//# sourceMappingURL=1746013054039-AddIsDeletedColumns.js.map