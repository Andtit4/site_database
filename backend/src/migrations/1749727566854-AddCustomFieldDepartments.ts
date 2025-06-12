import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomFieldDepartments1749727566854 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Créer la table de jointure pour la relation Many-to-Many
        await queryRunner.query(`
            CREATE TABLE "site_custom_field_departments" (
                "customFieldId" uuid NOT NULL,
                "departmentId" character varying NOT NULL,
                CONSTRAINT "PK_site_custom_field_departments" PRIMARY KEY ("customFieldId", "departmentId")
            )
        `);

        // Ajouter les index
        await queryRunner.query(`
            CREATE INDEX "IDX_site_custom_field_departments_customFieldId" 
            ON "site_custom_field_departments" ("customFieldId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_site_custom_field_departments_departmentId" 
            ON "site_custom_field_departments" ("departmentId")
        `);

        // Ajouter les contraintes de clé étrangère
        await queryRunner.query(`
            ALTER TABLE "site_custom_field_departments" 
            ADD CONSTRAINT "FK_site_custom_field_departments_customFieldId" 
            FOREIGN KEY ("customFieldId") REFERENCES "site_custom_fields"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "site_custom_field_departments" 
            ADD CONSTRAINT "FK_site_custom_field_departments_departmentId" 
            FOREIGN KEY ("departmentId") REFERENCES "department"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer les contraintes de clé étrangère
        await queryRunner.query(`
            ALTER TABLE "site_custom_field_departments" 
            DROP CONSTRAINT "FK_site_custom_field_departments_departmentId"
        `);

        await queryRunner.query(`
            ALTER TABLE "site_custom_field_departments" 
            DROP CONSTRAINT "FK_site_custom_field_departments_customFieldId"
        `);

        // Supprimer les index
        await queryRunner.query(`DROP INDEX "IDX_site_custom_field_departments_departmentId"`);
        await queryRunner.query(`DROP INDEX "IDX_site_custom_field_departments_customFieldId"`);

        // Supprimer la table
        await queryRunner.query(`DROP TABLE "site_custom_field_departments"`);
    }

}
