// Script pour créer la table site_specifications
require('dotenv').config();
const mysql = require('mysql2/promise');

async function createSiteSpecificationsTable() {
    console.log('Tentative de connexion à la base de données...');

    try {
        // Créer la connexion à la DB
        const connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '3306', 10),
            user: process.env.DATABASE_USERNAME || 'root',
            password: process.env.DATABASE_PASSWORD || '',
            database: process.env.DATABASE_NAME || 'site_info_db',
            connectionLimit: 10
        });

        console.log('Connexion établie avec succès.');

        // Vérifier si la table existe déjà
        const [tables] = await connection.execute(
            'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?', [process.env.DATABASE_NAME || 'site_info_db', 'site_specifications']
        );

        if (tables.length > 0) {
            console.log('La table site_specifications existe déjà.');
        } else {
            console.log('Création de la table site_specifications...');

            // Créer la table site_specifications
            await connection.execute(`
        CREATE TABLE site_specifications (
          id VARCHAR(36) NOT NULL,
          siteType ENUM('TOUR', 'SHELTER', 'PYLONE', 'BATIMENT', 'TOIT_BATIMENT', 'ROOFTOP', 'TERRAIN_BAILLE', 'TERRAIN_PROPRIETAIRE', 'AUTRE') NOT NULL,
          columns JSON NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

            console.log('Table site_specifications créée avec succès.');

            // Ajouter des données d'exemple
            console.log('Ajout de données d\'exemple...');
            await connection.execute(`
        INSERT INTO site_specifications (id, siteType, columns) VALUES
        (UUID(), 'TOUR', '[
          {"name": "hauteur", "type": "float", "nullable": true, "defaultValue": null},
          {"name": "nombreAntennes", "type": "int", "nullable": true, "defaultValue": "0"},
          {"name": "materiaux", "type": "varchar", "length": 100, "nullable": true, "defaultValue": null}
        ]'),
        (UUID(), 'SHELTER', '[
          {"name": "surface", "type": "float", "nullable": true, "defaultValue": null},
          {"name": "capacite", "type": "int", "nullable": true, "defaultValue": "0"},
          {"name": "climatisation", "type": "boolean", "nullable": true, "defaultValue": "false"}
        ]'),
        (UUID(), 'PYLONE', '[
          {"name": "hauteur", "type": "float", "nullable": true, "defaultValue": null},
          {"name": "charge", "type": "float", "nullable": true, "defaultValue": null},
          {"name": "modele", "type": "varchar", "length": 100, "nullable": true, "defaultValue": null}
        ]'),
        (UUID(), 'BATIMENT', '[
          {"name": "etages", "type": "int", "nullable": true, "defaultValue": "1"},
          {"name": "surface", "type": "float", "nullable": true, "defaultValue": null},
          {"name": "accessToit", "type": "boolean", "nullable": true, "defaultValue": "false"}
        ]')
      `);

            console.log('Données d\'exemple ajoutées avec succès.');
        }

        // Vérifier que les tables de spécifications de site existent pour chaque type
        console.log('Création des tables de spécifications pour chaque type de site...');

        const siteTypes = ['tour', 'shelter', 'pylone', 'batiment', 'toit_batiment', 'rooftop', 'terrain_baille', 'terrain_proprietaire', 'autre'];

        for (const type of siteTypes) {
            const tableName = `site_spec_${type}`;
            const [tableExists] = await connection.execute(
                'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?', [process.env.DATABASE_NAME || 'site_info_db', tableName]
            );

            if (tableExists.length === 0) {
                console.log(`Création de la table ${tableName}...`);

                // Créer une table basique pour chaque type de site
                await connection.execute(`
          CREATE TABLE ${tableName} (
            id VARCHAR(36) NOT NULL,
            siteId VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY siteId (siteId),
            CONSTRAINT fk_${tableName}_site
              FOREIGN KEY (siteId) REFERENCES site(id)
              ON DELETE CASCADE
              ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

                // Ajouter des colonnes spécifiques selon le type
                if (type === 'tour') {
                    await connection.execute(`
            ALTER TABLE ${tableName}
            ADD COLUMN hauteur FLOAT DEFAULT NULL,
            ADD COLUMN nombreAntennes INT DEFAULT 0,
            ADD COLUMN materiaux VARCHAR(100) DEFAULT NULL;
          `);
                } else if (type === 'shelter') {
                    await connection.execute(`
            ALTER TABLE ${tableName}
            ADD COLUMN surface FLOAT DEFAULT NULL,
            ADD COLUMN capacite INT DEFAULT 0,
            ADD COLUMN climatisation BOOLEAN DEFAULT FALSE;
          `);
                } else if (type === 'pylone') {
                    await connection.execute(`
            ALTER TABLE ${tableName}
            ADD COLUMN hauteur FLOAT DEFAULT NULL,
            ADD COLUMN charge FLOAT DEFAULT NULL,
            ADD COLUMN modele VARCHAR(100) DEFAULT NULL;
          `);
                } else if (type === 'batiment') {
                    await connection.execute(`
            ALTER TABLE ${tableName}
            ADD COLUMN etages INT DEFAULT 1,
            ADD COLUMN surface FLOAT DEFAULT NULL,
            ADD COLUMN accessToit BOOLEAN DEFAULT FALSE;
          `);
                } else if (type === 'toit_batiment') {
                    await connection.execute(`
            ALTER TABLE ${tableName}
            ADD COLUMN surface FLOAT DEFAULT NULL,
            ADD COLUMN resistance FLOAT DEFAULT NULL,
            ADD COLUMN accessibilite VARCHAR(100) DEFAULT NULL;
          `);
                } else if (type === 'rooftop') {
                    await connection.execute(`
            ALTER TABLE ${tableName}
            ADD COLUMN surface FLOAT DEFAULT NULL,
            ADD COLUMN accessibilite VARCHAR(100) DEFAULT NULL;
          `);
                } else if (type === 'terrain_baille') {
                    await connection.execute(`
            ALTER TABLE ${tableName}
            ADD COLUMN surface FLOAT DEFAULT NULL,
            ADD COLUMN topographie VARCHAR(100) DEFAULT NULL,
            ADD COLUMN accessibilite VARCHAR(100) DEFAULT NULL;
          `);
                } else if (type === 'terrain_proprietaire') {
                    await connection.execute(`
            ALTER TABLE ${tableName}
            ADD COLUMN surface FLOAT DEFAULT NULL,
            ADD COLUMN description TEXT DEFAULT NULL;
          `);
                } else if (type === 'autre') {
                    await connection.execute(`
            ALTER TABLE ${tableName}
            ADD COLUMN description TEXT DEFAULT NULL;
          `);
                }

                console.log(`Table ${tableName} créée avec succès.`);
            } else {
                console.log(`La table ${tableName} existe déjà.`);
            }
        }

        // Fermer la connexion
        await connection.end();
        console.log('Connexion fermée.');
        console.log('Terminé.');
    } catch (error) {
        console.error('Erreur lors de la création de la table:', error.message);
    }
}

createSiteSpecificationsTable();