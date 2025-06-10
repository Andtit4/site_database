import { MigrationInterface, QueryRunner } from "typeorm";

export class CompleteMyQLToPostgreSQL1702310000000 implements MigrationInterface {
    name = 'CompleteMyQLToPostgreSQL1702310000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Migration COMPLÈTE MySQL vers PostgreSQL - TOUTES les tables et colonnes');

        // Créer l'extension UUID
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Supprimer toutes les tables existantes pour repartir à zéro
        await this.dropAllExistingTables(queryRunner);

        // Créer TOUTES les tables avec la structure complète
        await this.createCompleteStructure(queryRunner);

        console.log('✅ Migration COMPLÈTE terminée - TOUTES les tables créées');
    }

    private async dropAllExistingTables(queryRunner: QueryRunner): Promise<void> {
        console.log('🗑️ Suppression de toutes les tables existantes...');
        
        const tables = [
            'team_sites', 'team_equipment', 'site_specifications', 'notifications', 
            'equipment', 'specifications', 'spec_générateur', 'team', 'site', 
            'department', 'users', 'sites', 'teams', 'departments'
        ];

        for (const table of tables) {
            await queryRunner.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        }
    }

    private async createCompleteStructure(queryRunner: QueryRunner): Promise<void> {
        // 1. TABLE USERS (structure complète du dump MySQL)
        console.log('📝 Création table users...');
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" character varying(36) NOT NULL,
                "username" character varying(255) NOT NULL,
                "firstName" character varying(255),
                "lastName" character varying(255),
                "email" character varying(255),
                "password" character varying(255) NOT NULL,
                "isAdmin" boolean NOT NULL DEFAULT false,
                "isDepartmentAdmin" boolean NOT NULL DEFAULT false,
                "isTeamMember" boolean NOT NULL DEFAULT false,
                "isDeleted" boolean NOT NULL DEFAULT false,
                "hasDepartmentRights" boolean NOT NULL DEFAULT false,
                "isActive" boolean NOT NULL DEFAULT true,
                "managedEquipmentTypes" json,
                "lastLogin" TIMESTAMP,
                "departmentId" character varying(255),
                "teamId" character varying(255),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_username" UNIQUE ("username"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

        // 2. TABLE DEPARTMENT (structure complète du dump MySQL)
        console.log('📝 Création table department...');
        await queryRunner.query(`
            CREATE TABLE "department" (
                "id" character varying(36) NOT NULL,
                "name" character varying(255) NOT NULL,
                "description" character varying(255),
                "type" character varying(255) NOT NULL,
                "responsibleName" character varying(255) NOT NULL,
                "contactEmail" character varying(255) NOT NULL,
                "contactPhone" float,
                "isActive" boolean NOT NULL DEFAULT true,
                "isDeleted" boolean NOT NULL DEFAULT false,
                "managedEquipmentTypes" json,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_department" PRIMARY KEY ("id")
            )
        `);

        // 3. TABLE SITE (structure complète du dump MySQL)
        console.log('📝 Création table site...');
        await queryRunner.query(`
            CREATE TABLE "site" (
                "id" character varying(255) NOT NULL,
                "name" character varying(255) NOT NULL,
                "region" character varying(255) NOT NULL,
                "zone" character varying(255),
                "longitude" decimal(10,6) NOT NULL,
                "latitude" decimal(10,6) NOT NULL,
                "status" character varying(255) NOT NULL DEFAULT 'ACTIVE',
                "oldBase" character varying(255),
                "newBase" character varying(255),
                "specifications" json,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_site" PRIMARY KEY ("id")
            )
        `);

        // 4. TABLE TEAM (structure complète du dump MySQL)
        console.log('📝 Création table team...');
        await queryRunner.query(`
            CREATE TABLE "team" (
                "id" character varying(255) NOT NULL,
                "name" character varying(255) NOT NULL,
                "description" character varying(255),
                "status" character varying(255) NOT NULL DEFAULT 'ACTIVE',
                "leadName" character varying(255),
                "leadContact" character varying(255),
                "memberCount" integer NOT NULL,
                "location" character varying(255),
                "lastActiveDate" date,
                "equipmentType" character varying(255),
                "departmentId" character varying(255),
                "metadata" json,
                "isDeleted" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_team" PRIMARY KEY ("id")
            )
        `);

        // 5. TABLE EQUIPMENT (structure complète du dump MySQL)
        console.log('📝 Création table equipment...');
        await queryRunner.query(`
            CREATE TABLE "equipment" (
                "id" character varying(36) NOT NULL,
                "name" character varying(255),
                "type" character varying(255) NOT NULL,
                "description" character varying(255),
                "model" character varying(255),
                "serialNumber" character varying(255),
                "manufacturer" character varying(255),
                "purchaseDate" TIMESTAMP,
                "installDate" TIMESTAMP,
                "lastMaintenanceDate" TIMESTAMP,
                "status" character varying(255) NOT NULL DEFAULT 'ACTIF',
                "location" character varying(255),
                "purchasePrice" float,
                "warrantyExpiration" TIMESTAMP,
                "ipAddress" character varying(255),
                "macAddress" character varying(255),
                "siteId" character varying(255) NOT NULL,
                "departmentId" character varying(255),
                "specifications" json,
                "isDeleted" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_equipment" PRIMARY KEY ("id")
            )
        `);

        // 6. TABLE SPECIFICATIONS (structure complète du dump MySQL)
        console.log('📝 Création table specifications...');
        await queryRunner.query(`
            CREATE TABLE "specifications" (
                "id" character varying(36) NOT NULL,
                "equipmentType" character varying(255) NOT NULL,
                "columns" json NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_specifications" PRIMARY KEY ("id")
            )
        `);

        // 7. TABLE SITE_SPECIFICATIONS (structure complète du dump MySQL)
        console.log('📝 Création table site_specifications...');
        await queryRunner.query(`
            CREATE TABLE "site_specifications" (
                "id" character varying(36) NOT NULL,
                "siteType" character varying(255) NOT NULL,
                "columns" json NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_site_specifications" PRIMARY KEY ("id")
            )
        `);

        // 8. TABLE NOTIFICATIONS (structure complète du dump MySQL)
        console.log('📝 Création table notifications...');
        await queryRunner.query(`
            CREATE TABLE "notifications" (
                "id" character varying(36) NOT NULL,
                "title" character varying(255) NOT NULL,
                "message" text NOT NULL,
                "type" character varying(255) NOT NULL DEFAULT 'INFO',
                "priority" character varying(255) NOT NULL DEFAULT 'MEDIUM',
                "isRead" boolean NOT NULL DEFAULT false,
                "actionUrl" character varying(255),
                "actionLabel" character varying(100),
                "category" character varying(100),
                "expiresAt" TIMESTAMP,
                "relatedEntityType" character varying(100),
                "relatedEntityId" character varying(36),
                "userId" character varying(255),
                "metadata" json,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
            )
        `);

        // 9. TABLE SPEC_GÉNÉRATEUR (structure complète du dump MySQL)
        console.log('📝 Création table spec_générateur...');
        await queryRunner.query(`
            CREATE TABLE "spec_générateur" (
                "id" character varying(36) NOT NULL,
                "site_id" character varying(36) NOT NULL,
                "TYPE" character varying(255),
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                CONSTRAINT "PK_spec_générateur" PRIMARY KEY ("id")
            )
        `);

        // 10. TABLE TEAM_EQUIPMENT (relation many-to-many)
        console.log('📝 Création table team_equipment...');
        await queryRunner.query(`
            CREATE TABLE "team_equipment" (
                "teamId" character varying(255) NOT NULL,
                "equipmentId" character varying(36) NOT NULL,
                CONSTRAINT "PK_team_equipment" PRIMARY KEY ("teamId", "equipmentId")
            )
        `);

        // 11. TABLE TEAM_SITES (relation many-to-many)
        console.log('📝 Création table team_sites...');
        await queryRunner.query(`
            CREATE TABLE "team_sites" (
                "teamId" character varying(255) NOT NULL,
                "siteId" character varying(255) NOT NULL,
                CONSTRAINT "PK_team_sites" PRIMARY KEY ("teamId", "siteId")
            )
        `);

        // Ajouter toutes les contraintes de clé étrangère
        await this.addAllForeignKeys(queryRunner);

        // Créer tous les index
        await this.createAllIndexes(queryRunner);
    }

    private async addAllForeignKeys(queryRunner: QueryRunner): Promise<void> {
        console.log('🔗 Ajout de TOUTES les contraintes de clé étrangère...');

        const constraints = [
            // Users contraintes
            'ALTER TABLE "users" ADD CONSTRAINT "FK_users_department" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL',
            'ALTER TABLE "users" ADD CONSTRAINT "FK_users_team" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL',
            
            // Equipment contraintes
            'ALTER TABLE "equipment" ADD CONSTRAINT "FK_equipment_site" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE CASCADE',
            'ALTER TABLE "equipment" ADD CONSTRAINT "FK_equipment_department" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE',
            
            // Team contraintes
            'ALTER TABLE "team" ADD CONSTRAINT "FK_team_department" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL',
            
            // Notifications contraintes
            'ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE',
            
            // Spec générateur contraintes
            'ALTER TABLE "spec_générateur" ADD CONSTRAINT "FK_spec_générateur_site" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE',
            
            // Relations many-to-many
            'ALTER TABLE "team_equipment" ADD CONSTRAINT "FK_team_equipment_team" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE',
            'ALTER TABLE "team_equipment" ADD CONSTRAINT "FK_team_equipment_equipment" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE CASCADE',
            'ALTER TABLE "team_sites" ADD CONSTRAINT "FK_team_sites_team" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE',
            'ALTER TABLE "team_sites" ADD CONSTRAINT "FK_team_sites_site" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION'
        ];

        for (const constraint of constraints) {
            try {
                await queryRunner.query(constraint);
                console.log(`✅ Contrainte ajoutée: ${constraint.split('CONSTRAINT ')[1]?.split(' ')[0]}`);
            } catch (error) {
                console.log(`⚠️ Erreur contrainte: ${error.message}`);
            }
        }
    }

    private async createAllIndexes(queryRunner: QueryRunner): Promise<void> {
        console.log('📊 Création de tous les index...');

        const indexes = [
            // Index pour users
            'CREATE INDEX "IDX_users_department" ON "users" ("departmentId")',
            'CREATE INDEX "IDX_users_team" ON "users" ("teamId")',
            
            // Index pour equipment
            'CREATE INDEX "IDX_equipment_site" ON "equipment" ("siteId")',
            'CREATE INDEX "IDX_equipment_department" ON "equipment" ("departmentId")',
            
            // Index pour team
            'CREATE INDEX "IDX_team_department" ON "team" ("departmentId")',
            
            // Index pour notifications
            'CREATE INDEX "IDX_notifications_user" ON "notifications" ("userId")',
            
            // Index pour spec_générateur
            'CREATE INDEX "IDX_spec_générateur_site" ON "spec_générateur" ("site_id")',
            
            // Index pour relations many-to-many
            'CREATE INDEX "IDX_team_equipment_team" ON "team_equipment" ("teamId")',
            'CREATE INDEX "IDX_team_equipment_equipment" ON "team_equipment" ("equipmentId")',
            'CREATE INDEX "IDX_team_sites_team" ON "team_sites" ("teamId")',
            'CREATE INDEX "IDX_team_sites_site" ON "team_sites" ("siteId")'
        ];

        for (const index of indexes) {
            try {
                await queryRunner.query(index);
                console.log(`✅ Index créé: ${index.split('INDEX ')[1]?.split(' ')[0]}`);
            } catch (error) {
                console.log(`⚠️ Erreur index: ${error.message}`);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Rollback COMPLET de la migration...');
        
        const tables = [
            'team_sites', 'team_equipment', 'spec_générateur', 'notifications', 
            'site_specifications', 'specifications', 'equipment', 'team', 
            'site', 'department', 'users'
        ];

        for (const table of tables) {
            await queryRunner.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        }

        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }
} 
