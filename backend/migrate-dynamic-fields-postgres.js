const { Client } = require('pg');
require('dotenv').config();

async function migrateDynamicFields() {
    console.log('Démarrage de la migration des champs dynamiques (PostgreSQL)...');

    const client = new Client({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        user: process.env.DATABASE_USERNAME || 'postgres',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'site_info_db'
    });

    try {
        await client.connect();
        console.log('Connexion à PostgreSQL établie.');

        // Créer le type ENUM pour les types de sites s'il n'existe pas
        try {
            await client.query(`
        CREATE TYPE site_type_enum AS ENUM (
          'TOUR', 
          'SHELTER', 
          'PYLONE', 
          'BATIMENT', 
          'TOIT_BATIMENT', 
          'ROOFTOP', 
          'TERRAIN_BAILLE', 
          'TERRAIN_PROPRIETAIRE', 
          'AUTRE'
        );
      `);
            console.log('✓ Type ENUM site_type_enum créé');
        } catch (error) {
            if (error.code === '42710') { // Type already exists
                console.log('✓ Type ENUM site_type_enum existe déjà');
            } else {
                throw error;
            }
        }

        // Ajouter la colonne type
        try {
            await client.query(`
        ALTER TABLE site 
        ADD COLUMN type site_type_enum DEFAULT NULL;
      `);
            console.log('✓ Colonne type ajoutée');
        } catch (error) {
            if (error.code === '42701') { // Column already exists
                console.log('✓ Colonne type existe déjà');
            } else {
                throw error;
            }
        }

        // Ajouter la colonne dynamicFieldsDefinition
        try {
            await client.query(`
        ALTER TABLE site 
        ADD COLUMN "dynamicFieldsDefinition" JSONB DEFAULT NULL;
      `);
            console.log('✓ Colonne dynamicFieldsDefinition ajoutée');
        } catch (error) {
            if (error.code === '42701') { // Column already exists
                console.log('✓ Colonne dynamicFieldsDefinition existe déjà');
            } else {
                throw error;
            }
        }

        // Ajouter la colonne departmentId
        try {
            await client.query(`
        ALTER TABLE site 
        ADD COLUMN "departmentId" VARCHAR(36) DEFAULT NULL;
      `);
            console.log('✓ Colonne departmentId ajoutée');
        } catch (error) {
            if (error.code === '42701') { // Column already exists
                console.log('✓ Colonne departmentId existe déjà');
            } else {
                throw error;
            }
        }

        // Vérifier/Ajouter la colonne specifications
        try {
            await client.query(`
        ALTER TABLE site 
        ADD COLUMN specifications JSONB DEFAULT NULL;
      `);
            console.log('✓ Colonne specifications ajoutée');
        } catch (error) {
            if (error.code === '42701') { // Column already exists
                console.log('✓ Colonne specifications existe déjà');
            } else {
                throw error;
            }
        }

        // Afficher la structure de la table
        const result = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'site' 
      ORDER BY ordinal_position;
    `);

        console.log('\nStructure de la table site:');
        console.table(result.rows);

        // Créer un index sur le type pour les performances
        try {
            await client.query(`
        CREATE INDEX IF NOT EXISTS idx_site_type ON site(type);
      `);
            console.log('✓ Index sur la colonne type créé');
        } catch (error) {
            console.log('⚠️  Erreur lors de la création de l\'index:', error.message);
        }

        // Créer un index sur departmentId pour les performances
        try {
            await client.query(`
        CREATE INDEX IF NOT EXISTS idx_site_department ON site("departmentId");
      `);
            console.log('✓ Index sur la colonne departmentId créé');
        } catch (error) {
            console.log('⚠️  Erreur lors de la création de l\'index:', error.message);
        }

        console.log('\n✅ Migration PostgreSQL terminée avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors de la migration PostgreSQL:', error);
        console.error('Code d\'erreur:', error.code);
        console.error('Détails:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrateDynamicFields();