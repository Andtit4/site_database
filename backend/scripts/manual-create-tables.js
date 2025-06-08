const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTables() {
    const config = {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT) || 3306,
        user: process.env.DATABASE_USERNAME || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'u527740812_site_info_db',
    };

    let connection;

    try {
        console.log('🔄 Connexion à MySQL...');
        connection = await mysql.createConnection(config);

        // Tables de base pour l'application
        const tables = [{
                name: 'department',
                sql: `CREATE TABLE IF NOT EXISTS department (
          id int AUTO_INCREMENT PRIMARY KEY,
          name varchar(100) NOT NULL,
          description text,
          isDeleted boolean DEFAULT false,
          createdAt datetime DEFAULT CURRENT_TIMESTAMP,
          updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
            },
            {
                name: 'users',
                sql: `CREATE TABLE IF NOT EXISTS users (
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
          updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (departmentId) REFERENCES department(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
            },
            {
                name: 'team',
                sql: `CREATE TABLE IF NOT EXISTS team (
          id int AUTO_INCREMENT PRIMARY KEY,
          name varchar(100) NOT NULL,
          description text,
          departmentId int,
          isDeleted boolean DEFAULT false,
          createdAt datetime DEFAULT CURRENT_TIMESTAMP,
          updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (departmentId) REFERENCES department(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
            },
            {
                name: 'equipment',
                sql: `CREATE TABLE IF NOT EXISTS equipment (
          id int AUTO_INCREMENT PRIMARY KEY,
          name varchar(100) NOT NULL,
          type varchar(50),
          description text,
          departmentId int,
          isDeleted boolean DEFAULT false,
          createdAt datetime DEFAULT CURRENT_TIMESTAMP,
          updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (departmentId) REFERENCES department(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
            },
            {
                name: 'site',
                sql: `CREATE TABLE IF NOT EXISTS site (
          id int AUTO_INCREMENT PRIMARY KEY,
          name varchar(100) NOT NULL,
          location varchar(200),
          type varchar(50),
          departmentId int,
          isDeleted boolean DEFAULT false,
          createdAt datetime DEFAULT CURRENT_TIMESTAMP,
          updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (departmentId) REFERENCES department(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
            },
            {
                name: 'notifications',
                sql: `CREATE TABLE IF NOT EXISTS notifications (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
            },
            {
                name: 'specifications',
                sql: `CREATE TABLE IF NOT EXISTS specifications (
          id int AUTO_INCREMENT PRIMARY KEY,
          equipmentType varchar(50) NOT NULL,
          specifications json,
          isDeleted boolean DEFAULT false,
          createdAt datetime DEFAULT CURRENT_TIMESTAMP,
          updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
            },
            {
                name: 'site_specifications',
                sql: `CREATE TABLE IF NOT EXISTS site_specifications (
          id int AUTO_INCREMENT PRIMARY KEY,
          siteType varchar(50) NOT NULL,
          specifications json,
          isDeleted boolean DEFAULT false,
          createdAt datetime DEFAULT CURRENT_TIMESTAMP,
          updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
            },
            {
                name: 'team_equipment',
                sql: `CREATE TABLE IF NOT EXISTS team_equipment (
          teamId int,
          equipmentId int,
          PRIMARY KEY (teamId, equipmentId),
          FOREIGN KEY (teamId) REFERENCES team(id),
          FOREIGN KEY (equipmentId) REFERENCES equipment(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
            },
            {
                name: 'team_sites',
                sql: `CREATE TABLE IF NOT EXISTS team_sites (
          teamId int,
          siteId int,
          PRIMARY KEY (teamId, siteId),
          FOREIGN KEY (teamId) REFERENCES team(id),
          FOREIGN KEY (siteId) REFERENCES site(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
            }
        ];

        console.log('🏗️ Création des tables...');
        for (const [index, table] of tables.entries()) {
            console.log(`   Création: ${table.name} (${index + 1}/${tables.length})`);
            await connection.query(table.sql);
        }

        console.log('✅ Toutes les tables ont été créées avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de la création des tables:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }

    console.log('🎉 Processus terminé avec succès !');
}

createTables();