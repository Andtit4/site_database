const { Client } = require('pg');
require('dotenv').config();

async function fixDatabaseSchema() {
    console.log('🔧 Correction du schéma de la base de données...');

    const client = new Client({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        user: process.env.DATABASE_USERNAME || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'root',
        database: process.env.DATABASE_NAME || 'site_info_db',
    });

    try {
        await client.connect();
        console.log('✅ Connexion à PostgreSQL établie');

        // Vérifier si la colonne isDepartmentAdmin existe
        const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='isDepartmentAdmin'
    `);

        if (checkColumn.rows.length === 0) {
            console.log('🔨 Ajout de la colonne isDepartmentAdmin...');
            await client.query(`
        ALTER TABLE "users" 
        ADD COLUMN "isDepartmentAdmin" boolean NOT NULL DEFAULT false
      `);
            console.log('✅ Colonne isDepartmentAdmin ajoutée avec succès');
        } else {
            console.log('✅ Colonne isDepartmentAdmin déjà présente');
        }

        // Vérifier d'autres colonnes potentiellement manquantes
        const columns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users'
      ORDER BY column_name
    `);

        console.log('📋 Colonnes présentes dans la table users:');
        columns.rows.forEach(row => {
            console.log(`   - ${row.column_name}`);
        });

        console.log('\n🎉 Correction du schéma terminée avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de la correction:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

fixDatabaseSchema();