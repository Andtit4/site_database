const { Client } = require('pg');
const path = require('path');

/**
 * Script pour nettoyer complètement la base de données PostgreSQL
 * Ce script supprime toutes les tables, types, contraintes, etc.
 */

async function cleanDatabase() {
    console.log('🧹 Nettoyage de la base de données PostgreSQL...\n');

    try {
        const client = new Client({
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '5432', 10),
            user: process.env.DATABASE_USERNAME || 'postgres',
            password: process.env.DATABASE_PASSWORD || 'root',
            database: process.env.DATABASE_NAME || 'AndTit',
        });

        await client.connect();
        console.log('✅ Connexion à la base de données établie');

        // 1. Supprimer toutes les contraintes de clés étrangères
        console.log('\n🔗 Suppression des contraintes de clés étrangères...');
        const constraintsResult = await client.query(`
            SELECT 
                tc.table_name, 
                tc.constraint_name
            FROM information_schema.table_constraints AS tc 
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
        `);

        for (const constraint of constraintsResult.rows) {
            try {
                await client.query(`ALTER TABLE "${constraint.table_name}" DROP CONSTRAINT IF EXISTS "${constraint.constraint_name}"`);
                console.log(`   ✓ Contrainte ${constraint.constraint_name} supprimée`);
            } catch (error) {
                console.log(`   ⚠️  Erreur lors de la suppression de la contrainte ${constraint.constraint_name}`);
            }
        }

        // 2. Supprimer toutes les tables
        console.log('\n📋 Suppression des tables...');
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name != 'migrations'
        `);

        for (const table of tablesResult.rows) {
            try {
                await client.query(`DROP TABLE IF EXISTS "${table.table_name}" CASCADE`);
                console.log(`   ✓ Table ${table.table_name} supprimée`);
            } catch (error) {
                console.log(`   ⚠️  Erreur lors de la suppression de la table ${table.table_name}`);
            }
        }

        // 3. Supprimer tous les types ENUM personnalisés
        console.log('\n🔤 Suppression des types ENUM...');
        const enumsToDelete = [
            'equipment_type_enum',
            'notification_type_enum',
            'notification_priority_enum',
            'custom_field_type_enum'
        ];

        for (const enumType of enumsToDelete) {
            try {
                await client.query(`DROP TYPE IF EXISTS "${enumType}" CASCADE`);
                console.log(`   ✓ Type ENUM ${enumType} supprimé`);
            } catch (error) {
                console.log(`   ⚠️  Type ENUM ${enumType} n'existait pas ou erreur`);
            }
        }

        // 4. Supprimer tous les index personnalisés
        console.log('\n📊 Suppression des index...');
        const indexesResult = await client.query(`
            SELECT indexname 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname LIKE 'IDX_%'
        `);

        for (const index of indexesResult.rows) {
            try {
                await client.query(`DROP INDEX IF EXISTS "${index.indexname}"`);
                console.log(`   ✓ Index ${index.indexname} supprimé`);
            } catch (error) {
                console.log(`   ⚠️  Erreur lors de la suppression de l'index ${index.indexname}`);
            }
        }

        // 5. Nettoyer la table des migrations TypeORM
        console.log('\n🔄 Nettoyage de la table des migrations...');
        try {
            await client.query(`DELETE FROM migrations WHERE name LIKE '%Initial%'`);
            console.log('   ✓ Migrations initiales supprimées de la table des migrations');
        } catch (error) {
            console.log('   ⚠️  Table des migrations n\'existe pas encore (normal)');
        }

        await client.end();

        console.log('\n🎉 Nettoyage terminé avec succès !');
        console.log('\n📝 Actions effectuées:');
        console.log('   ✅ Contraintes de clés étrangères supprimées');
        console.log('   ✅ Tables supprimées (sauf migrations)');
        console.log('   ✅ Types ENUM supprimés');
        console.log('   ✅ Index personnalisés supprimés');
        console.log('   ✅ Entrées de migration nettoyées');

        console.log('\n🚀 Vous pouvez maintenant exécuter la migration:');
        console.log('   npm run migration:run');
        console.log('   ou');
        console.log('   npm run migrate:new-db');

    } catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error.message);
        process.exit(1);
    }
}

// Fonction pour afficher l'aide
function showHelp() {
    console.log(`
🧹 Nettoyage complet de la base de données PostgreSQL

USAGE:
    node reset-database-clean.js

VARIABLES D'ENVIRONNEMENT:
    DATABASE_HOST       Hôte de la base de données (défaut: localhost)
    DATABASE_PORT       Port de la base de données (défaut: 5432)
    DATABASE_USERNAME   Nom d'utilisateur (défaut: postgres)
    DATABASE_PASSWORD   Mot de passe (défaut: root)
    DATABASE_NAME       Nom de la base de données (défaut: AndTit)

⚠️  ATTENTION: Ce script supprime TOUTES les données !

EXEMPLE:
    DATABASE_NAME=ma_db node reset-database-clean.js

APRÈS LE NETTOYAGE:
    npm run migration:run
    `);
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

// Demander confirmation
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('⚠️  ATTENTION: Ce script va supprimer TOUTES les tables et données de la base de données !');
console.log(`Base de données cible: ${process.env.DATABASE_NAME || 'AndTit'}`);

rl.question('\n❓ Êtes-vous sûr de vouloir continuer? (oui/non): ', (answer) => {
    if (answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        rl.close();
        cleanDatabase();
    } else {
        console.log('❌ Opération annulée');
        rl.close();
        process.exit(0);
    }
});
