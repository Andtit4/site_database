const { DataSource } = require('typeorm');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function safeCreateTables() {
    // Configuration pour générer le SQL
    const tempDataSource = new DataSource({
        type: 'mysql',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '3306', 10),
        username: process.env.DATABASE_USERNAME || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'u527740812_site_info_db',
        entities: ['../src/**/*.entity{.ts,.js}'],
        synchronize: false, // Important : pas de sync auto
        logging: false,
    });

    // Configuration MySQL directe
    const config = {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT) || 3306,
        user: process.env.DATABASE_USERNAME || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'u527740812_site_info_db',
    };

    let connection;

    try {
        console.log('🔄 Initialisation de TypeORM pour générer le schéma...');
        await tempDataSource.initialize();

        console.log('📋 Génération du SQL pour créer les tables...');
        const sqlInMemory = await tempDataSource.driver.createSchemaBuilder().build();

        await tempDataSource.destroy();

        if (sqlInMemory.length === 0) {
            console.log('⚠️ Aucun SQL généré. Création manuelle des tables de base...');

            // Tables de base minimales pour que l'application fonctionne
            const basicTables = [
                `CREATE TABLE IF NOT EXISTS users (
          id int AUTO_INCREMENT PRIMARY KEY,
          username varchar(50) UNIQUE NOT NULL,
          email varchar(100) UNIQUE NOT NULL,
          password varchar(255) NOT NULL,
          firstName varchar(50),
          lastName varchar(50),
          isAdmin boolean DEFAULT false,
          isDepartmentAdmin boolean DEFAULT false,
          isTeamMember boolean DEFAULT false,
          departmentId int NULL,
          isDeleted boolean DEFAULT false,
          createdAt datetime DEFAULT CURRENT_TIMESTAMP,
          updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

                `CREATE TABLE IF NOT EXISTS department (
          id int AUTO_INCREMENT PRIMARY KEY,
          name varchar(100) NOT NULL,
          description text,
          isDeleted boolean DEFAULT false,
          createdAt datetime DEFAULT CURRENT_TIMESTAMP,
          updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

                `CREATE TABLE IF NOT EXISTS team (
          id int AUTO_INCREMENT PRIMARY KEY,
          name varchar(100) NOT NULL,
          description text,
          departmentId int,
          isDeleted boolean DEFAULT false,
          createdAt datetime DEFAULT CURRENT_TIMESTAMP,
          updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (departmentId) REFERENCES department(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

                `CREATE TABLE IF NOT EXISTS equipment (
          id int AUTO_INCREMENT PRIMARY KEY,
          name varchar(100) NOT NULL,
          type varchar(50),
          description text,
          departmentId int,
          isDeleted boolean DEFAULT false,
          createdAt datetime DEFAULT CURRENT_TIMESTAMP,
          updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (departmentId) REFERENCES department(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

                `CREATE TABLE IF NOT EXISTS site (
          id int AUTO_INCREMENT PRIMARY KEY,
          name varchar(100) NOT NULL,
          location varchar(200),
          type varchar(50),
          departmentId int,
          isDeleted boolean DEFAULT false,
          createdAt datetime DEFAULT CURRENT_TIMESTAMP,
          updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (departmentId) REFERENCES department(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

                `CREATE TABLE IF NOT EXISTS notifications (
          id int AUTO_INCREMENT PRIMARY KEY,
          title varchar(200) NOT NULL,
          message text,
          type varchar(50),
          userId int,
          isRead boolean DEFAULT false,
          isDeleted boolean DEFAULT false,
          createdAt datetime DEFAULT CURRENT_TIMESTAMP,
          updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

                `CREATE TABLE IF NOT EXISTS specifications (
          id int AUTO_INCREMENT PRIMARY KEY,
          equipmentType varchar(50) NOT NULL,
          specifications json,
          isDeleted boolean DEFAULT false,
          createdAt datetime DEFAULT CURRENT_TIMESTAMP,
          updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

                `CREATE TABLE IF NOT EXISTS site_specifications (
          id int AUTO_INCREMENT PRIMARY KEY,
          siteType varchar(50) NOT NULL,
          specifications json,
          isDeleted boolean DEFAULT false,
          createdAt datetime DEFAULT CURRENT_TIMESTAMP,
          updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

                `CREATE TABLE IF NOT EXISTS team_equipment (
          teamId int,
          equipmentId int,
          PRIMARY KEY (teamId, equipmentId),
          FOREIGN KEY (teamId) REFERENCES team(id),
          FOREIGN KEY (equipmentId) REFERENCES equipment(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

                `CREATE TABLE IF NOT EXISTS team_sites (
          teamId int,
          siteId int,
          PRIMARY KEY (teamId, siteId),
          FOREIGN KEY (teamId) REFERENCES team(id),
          FOREIGN KEY (siteId) REFERENCES site(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
            ];

            console.log('🔄 Connexion à MySQL...');
            connection = await mysql.createConnection(config);

            console.log('🏗️ Création des tables de base...');
            for (const [index, sql] of basicTables.entries()) {
                console.log(`   Création table ${index + 1}/${basicTables.length}...`);
                await connection.query(sql);
            }

            console.log('✅ Tables créées avec succès !');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la création des tables:', error.message);
        if (error.query) {
            console.error('SQL:', error.query);
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }

    console.log('🎉 Processus terminé avec succès !');
}

safeCreateTables();