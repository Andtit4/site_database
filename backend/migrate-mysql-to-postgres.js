const mysql = require('mysql2/promise');
const { Client } = require('pg');
require('dotenv').config();

// Configuration pour MySQL (source)
const mysqlConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USERNAME || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'u527740812_site_info_db'
};

// Configuration pour PostgreSQL (destination)
const postgresConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'site_database'
};

async function migrateData() {
    let mysqlConnection;
    let postgresClient;

    try {
        console.log('🔄 Démarrage de la migration MySQL → PostgreSQL...\n');

        // Connexion à MySQL
        console.log('📥 Connexion à MySQL...');
        mysqlConnection = await mysql.createConnection(mysqlConfig);
        console.log('✅ Connexion MySQL établie');

        // Connexion à PostgreSQL
        console.log('📤 Connexion à PostgreSQL...');
        postgresClient = new Client(postgresConfig);
        await postgresClient.connect();
        console.log('✅ Connexion PostgreSQL établie\n');

        // Lister les tables MySQL
        const [tables] = await mysqlConnection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [mysqlConfig.database]);

        console.log(`📋 Tables trouvées dans MySQL: ${tables.length}`);
        tables.forEach(table => console.log(`   - ${table.table_name}`));
        console.log();

        // Migrer chaque table
        for (const table of tables) {
            const tableName = table.table_name;
            console.log(`🔄 Migration de la table: ${tableName}`);

            try {
                // Récupérer les données de MySQL
                const [rows] = await mysqlConnection.execute(`SELECT * FROM ${tableName}`);

                if (rows.length === 0) {
                    console.log(`   ⚠️  Table ${tableName} vide, ignorée`);
                    continue;
                }

                console.log(`   📊 ${rows.length} enregistrements trouvés`);

                // Récupérer la structure de la table
                const [columns] = await mysqlConnection.execute(`SHOW COLUMNS FROM ${tableName}`);
                const columnNames = columns.map(col => col.Field);

                // Construire la requête d'insertion pour PostgreSQL
                const placeholders = columnNames.map((_, index) => `$${index + 1}`).join(', ');
                const insertQuery = `
          INSERT INTO ${tableName} (${columnNames.join(', ')}) 
          VALUES (${placeholders})
        `;

                // Insérer les données dans PostgreSQL
                let insertedCount = 0;
                for (const row of rows) {
                    try {
                        const values = columnNames.map(col => {
                            let value = row[col];

                            // Conversion des types spéciaux
                            if (value instanceof Date) {
                                value = value.toISOString();
                            } else if (typeof value === 'boolean') {
                                value = value ? 1 : 0; // MySQL stocke les booléens comme 0/1
                            }

                            return value;
                        });

                        await postgresClient.query(insertQuery, values);
                        insertedCount++;
                    } catch (error) {
                        console.error(`     ❌ Erreur pour un enregistrement:`, error.message);
                    }
                }

                console.log(`   ✅ ${insertedCount}/${rows.length} enregistrements migrés`);

            } catch (error) {
                console.error(`   ❌ Erreur lors de la migration de ${tableName}:`, error.message);
            }
        }

        console.log('\n🎉 Migration terminée!');

    } catch (error) {
        console.error('❌ Erreur fatale:', error.message);

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 Vérifiez les paramètres de connexion MySQL');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('💡 Vérifiez que les bases de données sont démarrées');
        }

    } finally {
        // Fermer les connexions
        if (mysqlConnection) {
            await mysqlConnection.end();
            console.log('📥 Connexion MySQL fermée');
        }

        if (postgresClient) {
            await postgresClient.end();
            console.log('📤 Connexion PostgreSQL fermée');
        }
    }
}

// Afficher l'aide si aucun argument
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
📖 Script de migration MySQL → PostgreSQL

Usage:
  node migrate-mysql-to-postgres.js

Variables d'environnement requises:
  
  MySQL (source):
  - MYSQL_HOST (défaut: localhost)
  - MYSQL_PORT (défaut: 3306)
  - MYSQL_USERNAME (défaut: root)
  - MYSQL_PASSWORD
  - MYSQL_DATABASE (défaut: u527740812_site_info_db)
  
  PostgreSQL (destination):
  - DATABASE_HOST (défaut: localhost)
  - DATABASE_PORT (défaut: 5432)
  - DATABASE_USERNAME (défaut: postgres)
  - DATABASE_PASSWORD
  - DATABASE_NAME (défaut: site_database)

Note: Assurez-vous que les tables existent déjà dans PostgreSQL
      (lancez d'abord l'application NestJS pour créer les tables)
`);
    process.exit(0);
}

// Démarrer la migration
migrateData().catch(error => {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
});