const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
    const config = {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT) || 3306,
        user: process.env.DATABASE_USERNAME || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'u527740812_site_info_db',
    };

    let connection;

    try {
        console.log('🔄 Connexion à la base de données...');
        connection = await mysql.createConnection(config);

        console.log('📋 Vérification des tables existantes:');
        const [tables] = await connection.query('SHOW TABLES');

        if (tables.length === 0) {
            console.log('✅ La base de données est vide (aucune table)');
        } else {
            console.log(`❌ Trouvé ${tables.length} table(s):`);
            tables.forEach(table => {
                console.log(`  - ${Object.values(table)[0]}`);
            });
        }

    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkDatabase();