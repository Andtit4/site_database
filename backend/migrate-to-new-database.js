const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execPromise = promisify(exec);

/**
 * Script pour migrer vers une nouvelle base de données PostgreSQL
 * Ce script va exécuter la migration complète pour créer toutes les tables
 */

async function runMigration() {
    console.log('🚀 Démarrage de la migration vers la nouvelle base de données PostgreSQL...\n');

    try {
        // Étape 1: Vérifier la configuration de la base de données
        console.log('📋 Vérification de la configuration...');

        const dbConfig = {
            host: process.env.DATABASE_HOST || 'localhost',
            port: process.env.DATABASE_PORT || '5432',
            username: process.env.DATABASE_USERNAME || 'postgres',
            password: process.env.DATABASE_PASSWORD || 'root',
            database: process.env.DATABASE_NAME || 'AndTit',
        };

        console.log(`   - Hôte: ${dbConfig.host}:${dbConfig.port}`);
        console.log(`   - Base de données: ${dbConfig.database}`);
        console.log(`   - Utilisateur: ${dbConfig.username}\n`);

        // Étape 2: Exécuter la migration
        console.log('🔄 Exécution de la migration initiale...');
        const { stdout, stderr } = await execPromise('npm run migration:run');

        if (stderr && !stderr.includes('WARNING')) {
            console.error('❌ Erreur lors de la migration:', stderr);

            return;
        }

        console.log('✅ Migration exécutée avec succès !');
        console.log(stdout);

        // Étape 3: Vérification
        console.log('\n📊 Vérification des tables créées...');
        await verifyTables();

        console.log('\n🎉 Migration terminée avec succès !');
        console.log('\n📝 Tables créées:');
        console.log('   • department - Gestion des départements');
        console.log('   • team - Gestion des équipes');
        console.log('   • users - Gestion des utilisateurs');
        console.log('   • site - Gestion des sites');
        console.log('   • equipment - Gestion des équipements');
        console.log('   • notifications - Système de notifications');
        console.log('   • site_custom_fields - Champs personnalisés pour les sites');
        console.log('   • site_custom_field_backup - Sauvegarde des champs personnalisés');
        console.log('   • team_sites - Relation équipes/sites');
        console.log('   • team_equipment - Relation équipes/équipements');
        console.log('   • site_custom_field_departments - Relation champs/départements');

        console.log('\n✨ Votre base de données est prête à être utilisée !');

    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error.message);
        process.exit(1);
    }
}

async function verifyTables() {
    try {
        const { Client } = require('pg');

        const client = new Client({
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '5432', 10),
            user: process.env.DATABASE_USERNAME || 'postgres',
            password: process.env.DATABASE_PASSWORD || 'root',
            database: process.env.DATABASE_NAME || 'site_info_db',
        });

        await client.connect();

        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        console.log(`   ✅ ${result.rows.length} tables trouvées`);
        result.rows.forEach(row => {
            console.log(`      - ${row.table_name}`);
        });

        await client.end();
    } catch (error) {
        console.log('   ⚠️  Impossible de vérifier les tables (normal si pg n\'est pas installé)');
    }
}

// Fonction pour afficher l'aide
function showHelp() {
    console.log(`
🗄️  Migration vers nouvelle base de données PostgreSQL

USAGE:
    node migrate-to-new-database.js

VARIABLES D'ENVIRONNEMENT:
    DATABASE_HOST       Hôte de la base de données (défaut: localhost)
    DATABASE_PORT       Port de la base de données (défaut: 5432)
    DATABASE_USERNAME   Nom d'utilisateur (défaut: postgres)
    DATABASE_PASSWORD   Mot de passe (défaut: root)
    DATABASE_NAME       Nom de la base de données (défaut: site_info_db)

EXEMPLE:
    # Avec variables d'environnement
    DATABASE_HOST=localhost DATABASE_NAME=ma_nouvelle_db node migrate-to-new-database.js

PRÉREQUIS:
    ✅ PostgreSQL installé et démarré
    ✅ Base de données créée
    ✅ Variables d'environnement configurées
    ✅ Dépendances npm installées
    `);
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

// Exécution du script
runMigration();
