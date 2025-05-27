import { MigrationInterface, QueryRunner } from "typeorm";

export class AllowNullDepartmentId1746100000000 implements MigrationInterface {
    name = 'AllowNullDepartmentId1746100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Supprimer d'abord la contrainte de clé étrangère existante
        await queryRunner.query(`ALTER TABLE \`team\` DROP FOREIGN KEY \`FK_bd5ee5dab94afcc03153c9c6cc2\``);
        
        // Modifier la colonne pour permettre les valeurs NULL
        await queryRunner.query(`ALTER TABLE \`team\` MODIFY \`departmentId\` varchar(255) NULL`);
        
        // Recréer la contrainte de clé étrangère avec ON DELETE SET NULL
        await queryRunner.query(`ALTER TABLE \`team\` ADD CONSTRAINT \`FK_bd5ee5dab94afcc03153c9c6cc2\` FOREIGN KEY (\`departmentId\`) REFERENCES \`department\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer d'abord la contrainte de clé étrangère existante
        await queryRunner.query(`ALTER TABLE \`team\` DROP FOREIGN KEY \`FK_bd5ee5dab94afcc03153c9c6cc2\``);
        
        // Mettre à jour toutes les valeurs NULL (si nécessaire avant de rendre la colonne NOT NULL)
        await queryRunner.query(`UPDATE \`team\` SET \`departmentId\` = (SELECT \`id\` FROM \`department\` LIMIT 1) WHERE \`departmentId\` IS NULL`);
        
        // Modifier la colonne pour ne pas permettre les valeurs NULL
        await queryRunner.query(`ALTER TABLE \`team\` MODIFY \`departmentId\` varchar(255) NOT NULL`);
        
        // Recréer la contrainte de clé étrangère avec ON DELETE CASCADE
        await queryRunner.query(`ALTER TABLE \`team\` ADD CONSTRAINT \`FK_bd5ee5dab94afcc03153c9c6cc2\` FOREIGN KEY (\`departmentId\`) REFERENCES \`department\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
} 
