const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
    console.log('Démarrage de la mise à jour des colonnes pour la compatibilité MySQL...');

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '3306', 10),
        user: process.env.DATABASE_USERNAME || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'site_info_db',
        multipleStatements: true
    });

    try {
        console.log('Connexion à la base de données établie');

        // Vérification et correction des noms de colonnes dans la table users
        console.log('Vérification des colonnes de la table users...');
        try {
            const [userColumns] = await connection.query(`SHOW COLUMNS FROM users;`);

            // Vérification de la colonne isAdmin
            let hasIsAdmin = false;
            let hasIsadmin = false;
            for (const col of userColumns) {
                if (col.Field === 'isAdmin') hasIsAdmin = true;
                if (col.Field === 'isadmin') hasIsadmin = true;
            }

            // Correction si nécessaire
            if (!hasIsAdmin && hasIsadmin) {
                console.log('Correction de la colonne isadmin vers isAdmin...');
                await connection.query(`
                    ALTER TABLE users 
                    CHANGE COLUMN isadmin isAdmin TINYINT NOT NULL DEFAULT 0;
                `);
            } else if (!hasIsAdmin && !hasIsadmin) {
                console.log('Ajout de la colonne isAdmin...');
                await connection.query(`
                    ALTER TABLE users 
                    ADD COLUMN isAdmin TINYINT NOT NULL DEFAULT 0;
                `);
            }

            // Vérification de la colonne isActive
            let hasIsActive = false;
            let hasIsactive = false;
            for (const col of userColumns) {
                if (col.Field === 'isActive') hasIsActive = true;
                if (col.Field === 'isactive') hasIsactive = true;
            }

            // Correction si nécessaire
            if (!hasIsActive && hasIsactive) {
                console.log('Correction de la colonne isactive vers isActive...');
                await connection.query(`
                    ALTER TABLE users 
                    CHANGE COLUMN isactive isActive TINYINT NOT NULL DEFAULT 1;
                `);
            } else if (!hasIsActive && !hasIsactive) {
                console.log('Ajout de la colonne isActive...');
                await connection.query(`
                    ALTER TABLE users 
                    ADD COLUMN isActive TINYINT NOT NULL DEFAULT 1;
                `);
            }

        } catch (err) {
            console.log('Erreur lors de la vérification des colonnes users:', err.message);
        }

        // Création de la table migrations si elle n'existe pas
        console.log('Création de la table migrations si nécessaire...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id int NOT NULL AUTO_INCREMENT,
        timestamp bigint NOT NULL,
        name varchar(255) NOT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        // Création de la table users si elle n'existe pas
        console.log('Création de la table users si nécessaire...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id varchar(36) NOT NULL,
        username varchar(255) NOT NULL,
        password varchar(255) NOT NULL,
        firstName varchar(255) NULL,
        lastName varchar(255) NULL,
        email varchar(255) NULL,
        isAdmin tinyint NOT NULL DEFAULT 0,
        isActive tinyint NOT NULL DEFAULT 1,
        lastLogin timestamp NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE INDEX UQ_username (username),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        // Création de la table department si elle n'existe pas
        console.log('Création de la table department si nécessaire...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS department (
        id varchar(36) NOT NULL,
        name varchar(255) NOT NULL,
        type varchar(255) NOT NULL,
        description varchar(255) NULL,
        responsibleName varchar(255) NOT NULL,
        contactEmail varchar(255) NOT NULL,
        contactPhone varchar(255) NULL,
        isActive tinyint NOT NULL DEFAULT 1,
        managedEquipmentTypes json NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        // Création de la table site si elle n'existe pas
        console.log('Création de la table site si nécessaire...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS site (
        id varchar(36) NOT NULL,
        name varchar(255) NOT NULL,
        region varchar(255) NOT NULL,
        zone varchar(255) NULL,
        longitude decimal(10,6) NOT NULL,
        latitude decimal(10,6) NOT NULL,
        status varchar(255) NOT NULL DEFAULT 'ACTIVE',
        oldBase varchar(255) NULL,
        newBase varchar(255) NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        // Création de la table team si elle n'existe pas
        console.log('Création de la table team si nécessaire...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS team (
        id varchar(36) NOT NULL,
        name varchar(255) NOT NULL,
        description varchar(255) NULL,
        status varchar(255) NOT NULL DEFAULT 'ACTIVE',
        leadName varchar(255) NULL,
        leadContact varchar(255) NULL,
        memberCount int NOT NULL,
        location varchar(255) NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        lastActiveDate date NULL,
        metadata json NULL,
        equipmentType varchar(255) NULL,
        departmentId varchar(36) NOT NULL,
        PRIMARY KEY (id),
        CONSTRAINT FK_team_department FOREIGN KEY (departmentId) REFERENCES department (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        // Création de la table equipment si elle n'existe pas
        console.log('Création de la table equipment si nécessaire...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id varchar(36) NOT NULL,
        type varchar(255) NOT NULL,
        model varchar(255) NOT NULL,
        manufacturer varchar(255) NULL,
        serialNumber varchar(255) NULL,
        installDate date NULL,
        lastMaintenanceDate date NULL,
        status varchar(255) NOT NULL DEFAULT 'ACTIF',
        specifications json NULL,
        siteId varchar(36) NOT NULL,
        departmentId varchar(36) NULL,
        PRIMARY KEY (id),
        CONSTRAINT FK_equipment_site FOREIGN KEY (siteId) REFERENCES site (id) ON DELETE CASCADE,
        CONSTRAINT FK_equipment_department FOREIGN KEY (departmentId) REFERENCES department (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        // Création de la table specifications si elle n'existe pas
        console.log('Création de la table specifications si nécessaire...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS specifications (
        id varchar(36) NOT NULL,
        equipmentType ENUM('ANTENNE', 'ROUTEUR', 'BATTERIE', 'GÉNÉRATEUR', 'REFROIDISSEMENT', 'SHELTER', 'PYLÔNE', 'SÉCURITÉ') NOT NULL,
        columns json NOT NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        // Création de la table team_sites si elle n'existe pas
        console.log('Création de la table team_sites si nécessaire...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS team_sites (
        teamId varchar(36) NOT NULL,
        siteId varchar(36) NOT NULL,
        PRIMARY KEY (teamId, siteId),
        CONSTRAINT FK_team_sites_team FOREIGN KEY (teamId) REFERENCES team (id) ON DELETE CASCADE,
        CONSTRAINT FK_team_sites_site FOREIGN KEY (siteId) REFERENCES site (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        // Création de la table team_equipment si elle n'existe pas
        console.log('Création de la table team_equipment si nécessaire...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS team_equipment (
        equipmentId varchar(36) NOT NULL,
        teamId varchar(36) NOT NULL,
        PRIMARY KEY (equipmentId, teamId),
        CONSTRAINT FK_team_equipment_equipment FOREIGN KEY (equipmentId) REFERENCES equipment (id) ON DELETE CASCADE,
        CONSTRAINT FK_team_equipment_team FOREIGN KEY (teamId) REFERENCES team (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        // Mise à jour de la table migrations pour éviter les conflits futurs
        console.log('Mise à jour de la table migrations...');
        await connection.query(`
      INSERT IGNORE INTO migrations (timestamp, name) 
      VALUES (1744898980864, 'InitialMigration1744898980864'),
             (1745338908523, 'JsonbToJson1745338908523');
    `).catch(err => {
            console.log('Table migrations déjà mise à jour ou erreur:', err.message);
        });

        console.log('Mise à jour des colonnes terminée avec succès!');
    } catch (error) {
        console.error('Erreur lors de la mise à jour des colonnes:', error);
    } finally {
        await connection.end();
        console.log('Connexion à la base de données fermée');
    }
}

main();