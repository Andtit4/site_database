const mysql = require('mysql2/promise');
const { spawn } = require('child_process');

// Configuration de la base de données
const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    user: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'u527740812_site_info_db',
    connectTimeout: 10000,
    acquireTimeout: 10000,
};

async function checkDatabaseConnection() {
    console.log('🔍 Vérification de la connexion à la base de données...');
    console.log(`📍 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`📍 Database: ${dbConfig.database}`);

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.ping();
        console.log('✅ Connexion à la base de données réussie');
        await connection.end();
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion à la base de données:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Suggestion: Vérifiez que MySQL/MariaDB est démarré');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 Suggestion: Vérifiez les identifiants de connexion');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('💡 Suggestion: La base de données n\'existe pas');
        }

        return false;
    }
}

async function checkDatabaseExists() {
    console.log('🔍 Vérification de l\'existence de la base de données...');

    try {
        const tempConfig = {...dbConfig };
        delete tempConfig.database; // Se connecter sans spécifier la base

        const connection = await mysql.createConnection(tempConfig);
        const [rows] = await connection.execute(
            'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?', [dbConfig.database]
        );

        await connection.end();

        if (rows.length > 0) {
            console.log('✅ La base de données existe');
            return true;
        } else {
            console.log('⚠️ La base de données n\'existe pas');
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur lors de la vérification de la base de données:', error.message);
        return false;
    }
}

async function createDatabase() {
    console.log('🔨 Tentative de création de la base de données...');

    try {
        const tempConfig = {...dbConfig };
        delete tempConfig.database;

        const connection = await mysql.createConnection(tempConfig);
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log('✅ Base de données créée avec succès');
        await connection.end();
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la création de la base de données:', error.message);
        return false;
    }
}

async function startApplication() {
    console.log('🚀 Démarrage de l\'application NestJS...');

    const npmProcess = spawn('npm', ['run', 'start:dev'], {
        stdio: 'inherit',
        shell: true
    });

    npmProcess.on('close', (code) => {
        console.log(`Application fermée avec le code ${code}`);
    });

    process.on('SIGINT', () => {
        console.log('\n👋 Arrêt de l\'application...');
        npmProcess.kill('SIGINT');
        process.exit(0);
    });
}

async function main() {
    console.log('🔄 Initialisation du serveur...\n');

    // Vérifier si la base de données existe
    const dbExists = await checkDatabaseExists();

    if (!dbExists) {
        console.log('📝 Base de données manquante, tentative de création...');
        const created = await createDatabase();
        if (!created) {
            console.error('❌ Impossible de créer la base de données. Arrêt du processus.');
            process.exit(1);
        }
    }

    // Vérifier la connexion
    const isConnected = await checkDatabaseConnection();

    if (isConnected) {
        console.log('\n✨ Tout est prêt ! Démarrage de l\'application...\n');
        await startApplication();
    } else {
        console.error('\n❌ Impossible de se connecter à la base de données.');
        console.error('🔧 Vérifiez votre configuration et réessayez.');
        process.exit(1);
    }
}

// Démarrer le processus
main().catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
});
