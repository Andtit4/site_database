import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAllDatabaseTables1750065541038 implements MigrationInterface {
    name = 'CreateAllDatabaseTables1750065541038';

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🚀 Création COMPLÈTE de toutes les tables de la base de données...');

        // 1. Créer tous les types ENUM nécessaires avec vérifications
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'equipment_type_enum') THEN
                    CREATE TYPE "equipment_type_enum" AS ENUM(
                        'ANTENNE', 'ROUTEUR', 'BATTERIE', 'GÉNÉRATEUR', 
                        'REFROIDISSEMENT', 'SHELTER', 'PYLÔNE', 'SÉCURITÉ'
                    );
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type_enum') THEN
                    CREATE TYPE "notification_type_enum" AS ENUM(
                        'INFO', 'SUCCESS', 'WARNING', 'ERROR', 'MAINTENANCE', 'SYSTEM'
                    );
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_priority_enum') THEN
                    CREATE TYPE "notification_priority_enum" AS ENUM(
                        'LOW', 'MEDIUM', 'HIGH', 'URGENT'
                    );
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'custom_field_type_enum') THEN
                    CREATE TYPE "custom_field_type_enum" AS ENUM(
                        'STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'SELECT', 'TEXTAREA'
                    );
                END IF;
            END $$;
        `);

        // 2. Créer toutes les tables avec IF NOT EXISTS
        console.log('📊 Création des tables...');

        // Table DEPARTMENT (table parent)
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "department" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "name" character varying NOT NULL,
                "type" character varying(255) NOT NULL,
                "description" character varying,
                "responsibleName" character varying NOT NULL,
                "contactEmail" character varying NOT NULL,
                "contactPhone" double precision,
                "isActive" boolean NOT NULL DEFAULT true,
                "managedEquipmentTypes" json,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "isDeleted" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_department" PRIMARY KEY ("id")
            )
        `);

        // Table TEAM
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "team" (
                "id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "status" character varying(255) NOT NULL DEFAULT 'ACTIVE',
                "leadName" character varying,
                "leadContact" character varying,
                "memberCount" integer NOT NULL,
                "location" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "lastActiveDate" date,
                "metadata" json,
                "equipmentType" character varying(255),
                "departmentId" uuid,
                "isDeleted" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_team" PRIMARY KEY ("id")
            )
        `);

        // Table USERS
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "username" character varying NOT NULL,
                "password" character varying NOT NULL,
                "firstName" character varying,
                "lastName" character varying,
                "email" character varying,
                "isAdmin" boolean NOT NULL DEFAULT false,
                "isDepartmentAdmin" boolean NOT NULL DEFAULT false,
                "isTeamMember" boolean NOT NULL DEFAULT false,
                "isActive" boolean NOT NULL DEFAULT true,
                "isDeleted" boolean NOT NULL DEFAULT false,
                "hasDepartmentRights" boolean NOT NULL DEFAULT false,
                "managedEquipmentTypes" json,
                "lastLogin" TIMESTAMP,
                "departmentId" uuid,
                "teamId" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_username" UNIQUE ("username"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

        // Table SITE
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "site" (
                "id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "region" character varying NOT NULL,
                "zone" character varying,
                "longitude" numeric(10,6) NOT NULL,
                "latitude" numeric(10,6) NOT NULL,
                "status" character varying(255) NOT NULL DEFAULT 'ACTIVE',
                "oldBase" character varying,
                "newBase" character varying,
                "specifications" jsonb,
                "customFieldsValues" jsonb,
                "departmentId" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_site" PRIMARY KEY ("id")
            )
        `);

        // Table EQUIPMENT
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "equipment" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "name" character varying,
                "type" "equipment_type_enum" NOT NULL,
                "description" character varying,
                "model" character varying,
                "serialNumber" character varying,
                "manufacturer" character varying,
                "purchaseDate" TIMESTAMP,
                "installDate" TIMESTAMP,
                "lastMaintenanceDate" TIMESTAMP,
                "status" character varying NOT NULL DEFAULT 'ACTIF',
                "location" character varying,
                "purchasePrice" real,
                "warrantyExpiration" TIMESTAMP,
                "ipAddress" character varying,
                "macAddress" character varying,
                "isDeleted" boolean NOT NULL DEFAULT false,
                "specifications" json,
                "siteId" character varying NOT NULL,
                "departmentId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_equipment" PRIMARY KEY ("id")
            )
        `);

        // Table NOTIFICATIONS
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "notifications" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "title" character varying(255) NOT NULL,
                "message" text NOT NULL,
                "type" "notification_type_enum" NOT NULL DEFAULT 'INFO',
                "priority" "notification_priority_enum" NOT NULL DEFAULT 'MEDIUM',
                "isRead" boolean NOT NULL DEFAULT false,
                "actionUrl" character varying(255),
                "actionLabel" character varying(100),
                "metadata" json,
                "category" character varying(100),
                "expiresAt" TIMESTAMP,
                "userId" uuid,
                "relatedEntityType" character varying(100),
                "relatedEntityId" character varying(36),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
            )
        `);

        // Table SITE_CUSTOM_FIELDS
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "site_custom_fields" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "fieldName" character varying NOT NULL,
                "fieldLabel" character varying NOT NULL,
                "fieldType" "custom_field_type_enum" NOT NULL,
                "required" boolean NOT NULL DEFAULT false,
                "defaultValue" character varying,
                "options" jsonb,
                "validation" jsonb,
                "description" character varying,
                "active" boolean NOT NULL DEFAULT true,
                "sortOrder" integer NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_site_custom_fields_fieldName" UNIQUE ("fieldName"),
                CONSTRAINT "PK_site_custom_fields" PRIMARY KEY ("id")
            )
        `);

        // Table SITE_CUSTOM_FIELD_BACKUP
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "site_custom_field_backup" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "fieldName" character varying NOT NULL,
                "fieldLabel" character varying NOT NULL,
                "fieldType" character varying NOT NULL,
                "required" boolean NOT NULL DEFAULT false,
                "defaultValue" character varying,
                "options" jsonb,
                "validation" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_site_custom_field_backup" PRIMARY KEY ("id")
            )
        `);

        // Tables de liaison Many-to-Many
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "team_sites" (
                "teamId" character varying NOT NULL,
                "siteId" character varying NOT NULL,
                CONSTRAINT "PK_team_sites" PRIMARY KEY ("teamId", "siteId")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "team_equipment" (
                "teamId" character varying NOT NULL,
                "equipmentId" uuid NOT NULL,
                CONSTRAINT "PK_team_equipment" PRIMARY KEY ("teamId", "equipmentId")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "site_custom_field_departments" (
                "customFieldId" uuid NOT NULL,
                "departmentId" uuid NOT NULL,
                CONSTRAINT "PK_site_custom_field_departments" PRIMARY KEY ("customFieldId", "departmentId")
            )
        `);

        // Ajouter toutes les contraintes de clés étrangères avec vérifications
        console.log('🔗 Ajout des contraintes de clés étrangères...');

        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_team_department') THEN
                    ALTER TABLE "team" 
                    ADD CONSTRAINT "FK_team_department" 
                    FOREIGN KEY ("departmentId") 
                    REFERENCES "department"("id") 
                    ON DELETE SET NULL ON UPDATE NO ACTION;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_users_department') THEN
                    ALTER TABLE "users" 
                    ADD CONSTRAINT "FK_users_department" 
                    FOREIGN KEY ("departmentId") 
                    REFERENCES "department"("id") 
                    ON DELETE SET NULL ON UPDATE NO ACTION;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_users_team') THEN
                    ALTER TABLE "users" 
                    ADD CONSTRAINT "FK_users_team" 
                    FOREIGN KEY ("teamId") 
                    REFERENCES "team"("id") 
                    ON DELETE SET NULL ON UPDATE NO ACTION;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_equipment_site') THEN
                    ALTER TABLE "equipment" 
                    ADD CONSTRAINT "FK_equipment_site" 
                    FOREIGN KEY ("siteId") 
                    REFERENCES "site"("id") 
                    ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_equipment_department') THEN
                    ALTER TABLE "equipment" 
                    ADD CONSTRAINT "FK_equipment_department" 
                    FOREIGN KEY ("departmentId") 
                    REFERENCES "department"("id") 
                    ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_notifications_user') THEN
                    ALTER TABLE "notifications" 
                    ADD CONSTRAINT "FK_notifications_user" 
                    FOREIGN KEY ("userId") 
                    REFERENCES "users"("id") 
                    ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_team_sites_team') THEN
                    ALTER TABLE "team_sites" 
                    ADD CONSTRAINT "FK_team_sites_team" 
                    FOREIGN KEY ("teamId") 
                    REFERENCES "team"("id") 
                    ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_team_sites_site') THEN
                    ALTER TABLE "team_sites" 
                    ADD CONSTRAINT "FK_team_sites_site" 
                    FOREIGN KEY ("siteId") 
                    REFERENCES "site"("id") 
                    ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_team_equipment_team') THEN
                    ALTER TABLE "team_equipment" 
                    ADD CONSTRAINT "FK_team_equipment_team" 
                    FOREIGN KEY ("teamId") 
                    REFERENCES "team"("id") 
                    ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_team_equipment_equipment') THEN
                    ALTER TABLE "team_equipment" 
                    ADD CONSTRAINT "FK_team_equipment_equipment" 
                    FOREIGN KEY ("equipmentId") 
                    REFERENCES "equipment"("id") 
                    ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_site_custom_field_departments_customField') THEN
                    ALTER TABLE "site_custom_field_departments" 
                    ADD CONSTRAINT "FK_site_custom_field_departments_customField" 
                    FOREIGN KEY ("customFieldId") 
                    REFERENCES "site_custom_fields"("id") 
                    ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_site_custom_field_departments_department') THEN
                    ALTER TABLE "site_custom_field_departments" 
                    ADD CONSTRAINT "FK_site_custom_field_departments_department" 
                    FOREIGN KEY ("departmentId") 
                    REFERENCES "department"("id") 
                    ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);

        // Créer des index pour les performances avec vérifications
        console.log('📊 Création des index...');

        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_team_department') THEN
                    CREATE INDEX "IDX_team_department" ON "team" ("departmentId");
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_users_department') THEN
                    CREATE INDEX "IDX_users_department" ON "users" ("departmentId");
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_users_team') THEN
                    CREATE INDEX "IDX_users_team" ON "users" ("teamId");
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_equipment_site') THEN
                    CREATE INDEX "IDX_equipment_site" ON "equipment" ("siteId");
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_equipment_department') THEN
                    CREATE INDEX "IDX_equipment_department" ON "equipment" ("departmentId");
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_notifications_user') THEN
                    CREATE INDEX "IDX_notifications_user" ON "notifications" ("userId");
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_site_region') THEN
                    CREATE INDEX "IDX_site_region" ON "site" ("region");
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_site_status') THEN
                    CREATE INDEX "IDX_site_status" ON "site" ("status");
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_equipment_type') THEN
                    CREATE INDEX "IDX_equipment_type" ON "equipment" ("type");
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_equipment_status') THEN
                    CREATE INDEX "IDX_equipment_status" ON "equipment" ("status");
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_site_custom_fields_active') THEN
                    CREATE INDEX "IDX_site_custom_fields_active" ON "site_custom_fields" ("active");
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_site_custom_fields_fieldName') THEN
                    CREATE INDEX "IDX_site_custom_fields_fieldName" ON "site_custom_fields" ("fieldName");
                END IF;
            END $$;
        `);

        console.log('✅ TOUTES les tables ont été créées avec succès !');
        console.log('📝 Tables créées:');
        console.log('   • department - Gestion des départements');
        console.log('   • team - Gestion des équipes');
        console.log('   • users - Gestion des utilisateurs');
        console.log('   • site - Gestion des sites');
        console.log('   • equipment - Gestion des équipements');
        console.log('   • notifications - Système de notifications');
        console.log('   • site_custom_fields - Champs personnalisés');
        console.log('   • site_custom_field_backup - Sauvegarde des champs');
        console.log('   • Tables de liaison: team_sites, team_equipment, site_custom_field_departments');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer toutes les contraintes de clés étrangères
        await queryRunner.query(`ALTER TABLE "site_custom_field_departments" DROP CONSTRAINT IF EXISTS "FK_site_custom_field_departments_department"`);
        await queryRunner.query(`ALTER TABLE "site_custom_field_departments" DROP CONSTRAINT IF EXISTS "FK_site_custom_field_departments_customField"`);
        await queryRunner.query(`ALTER TABLE "team_equipment" DROP CONSTRAINT IF EXISTS "FK_team_equipment_equipment"`);
        await queryRunner.query(`ALTER TABLE "team_equipment" DROP CONSTRAINT IF EXISTS "FK_team_equipment_team"`);
        await queryRunner.query(`ALTER TABLE "team_sites" DROP CONSTRAINT IF EXISTS "FK_team_sites_site"`);
        await queryRunner.query(`ALTER TABLE "team_sites" DROP CONSTRAINT IF EXISTS "FK_team_sites_team"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "FK_notifications_user"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP CONSTRAINT IF EXISTS "FK_equipment_department"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP CONSTRAINT IF EXISTS "FK_equipment_site"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_team"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_department"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT IF EXISTS "FK_team_department"`);

        // Supprimer tous les index
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_site_custom_fields_fieldName"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_site_custom_fields_active"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_equipment_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_equipment_type"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_site_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_site_region"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notifications_user"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_equipment_department"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_equipment_site"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_team"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_department"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_team_department"`);

        // Supprimer toutes les tables
        await queryRunner.query(`DROP TABLE IF EXISTS "site_custom_field_departments"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "team_equipment"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "team_sites"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "site_custom_field_backup"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "site_custom_fields"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "equipment"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "site"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "team"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "department"`);

        // Supprimer tous les types ENUM
        await queryRunner.query(`DROP TYPE IF EXISTS "custom_field_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "notification_priority_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "notification_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "equipment_type_enum"`);
    }
}
