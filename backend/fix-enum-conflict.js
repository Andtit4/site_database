const { Client } = require('pg');

/**
 * Script pour résoudre le conflit des types ENUM
 */

async function fixEnumConflict() {
    console.log('🔧 Résolution du conflit des types ENUM...\n');

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

        // 1. Supprimer les entrées de migration en conflit
        console.log('\n🗑️ Suppression des entrées de migration en conflit...');
        try {
            await client.query(`
                DELETE FROM migrations 
                WHERE name LIKE '%InitialDatabaseSchema%' 
                OR name LIKE '%CreateAllTables%'
            `);
            console.log('   ✓ Entrées de migration en conflit supprimées');
        } catch (error) {
            console.log('   ⚠️  Pas d\'entrées de migration en conflit trouvées');
        }

        // 2. Supprimer les types ENUM s'ils existent
        console.log('\n🔤 Suppression des types ENUM existants...');
        const enumsToDelete = [
            'equipment_type_enum',
            'notification_type_enum',
            'notification_priority_enum',
            'custom_field_type_enum'
        ];

        for (const enumType of enumsToDelete) {
            try {
                // D'abord, vérifier si le type existe
                const typeCheck = await client.query(`
                    SELECT 1 FROM pg_type WHERE typname = $1
                `, [enumType]);

                if (typeCheck.rows.length > 0) {
                    // Supprimer toutes les colonnes qui utilisent ce type ENUM
                    const columnsUsingEnum = await client.query(`
                        SELECT 
                            t.table_name, 
                            c.column_name
                        FROM information_schema.columns c
                        JOIN information_schema.tables t ON c.table_name = t.table_name
                        WHERE c.udt_name = $1
                        AND t.table_schema = 'public'
                    `, [enumType]);

                    // Modifier les colonnes pour utiliser VARCHAR au lieu de l'ENUM
                    for (const col of columnsUsingEnum.rows) {
                        await client.query(`
                            ALTER TABLE "${col.table_name}" 
                            ALTER COLUMN "${col.column_name}" TYPE character varying USING "${col.column_name}"::text
                        `);
                        console.log(`   ✓ Colonne ${col.table_name}.${col.column_name} convertie en VARCHAR`);
                    }

                    // Maintenant supprimer le type ENUM
                    await client.query(`DROP TYPE IF EXISTS "${enumType}" CASCADE`);
                    console.log(`   ✓ Type ENUM ${enumType} supprimé`);
                } else {
                    console.log(`   ⚠️  Type ENUM ${enumType} n'existe pas`);
                }
            } catch (error) {
                console.log(`   ❌ Erreur avec le type ${enumType}:`, error.message);
            }
        }

        // 3. Vérifier l'état actuel
        console.log('\n📊 Vérification de l\'état actuel...');
        const remainingEnums = await client.query(`
            SELECT typname FROM pg_type 
            WHERE typname LIKE '%_enum'
        `);

        if (remainingEnums.rows.length === 0) {
            console.log('   ✅ Aucun type ENUM en conflit trouvé');
        } else {
            console.log('   ⚠️  Types ENUM restants:');
            remainingEnums.rows.forEach(row => {
                console.log(`      - ${row.typname}`);
            });
        }

        await client.end();

        console.log('\n🎉 Conflit des types ENUM résolu !');
        console.log('\n🚀 Vous pouvez maintenant exécuter la migration:');
        console.log('   npm run migration:run');

    } catch (error) {
        console.error('❌ Erreur lors de la résolution du conflit:', error.message);
        process.exit(1);
    }
}

fixEnumConflict();
