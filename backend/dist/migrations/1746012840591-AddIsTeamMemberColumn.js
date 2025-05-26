"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsTeamMemberColumn1746012840591 = void 0;
class AddIsTeamMemberColumn1746012840591 {
    async up(queryRunner) {
        const hasColumn = await queryRunner.hasColumn('users', 'isTeamMember');
        if (!hasColumn) {
            await queryRunner.query(`ALTER TABLE users ADD COLUMN isTeamMember BOOLEAN DEFAULT false NOT NULL`);
        }
    }
    async down(queryRunner) {
        const hasColumn = await queryRunner.hasColumn('users', 'isTeamMember');
        if (hasColumn) {
            await queryRunner.query(`ALTER TABLE users DROP COLUMN isTeamMember`);
        }
    }
}
exports.AddIsTeamMemberColumn1746012840591 = AddIsTeamMemberColumn1746012840591;
//# sourceMappingURL=1746012840591-AddIsTeamMemberColumn.js.map