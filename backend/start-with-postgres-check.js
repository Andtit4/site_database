const { Client } = require('pg');
const { spawn } = require('child_process');
require('dotenv').config();

async function checkPostgresConnection() {
    const client = new Client({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        user: process.env.DATABASE_USERNAME || 'postgres',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'site_database',
    });

    try {
        console.log('🔍 Vérification de la connexion PostgreSQL...');
        await client.connect();

        // Test simple de requête
        const result = await client.query('SELECT version()');
        console.log('✅ Connexion PostgreSQL réussie!');
        console.log(`📊 Version PostgreSQL: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);

        // Vérifier si les tables existent
        const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        if (tablesResult.rows.length > 0) {
            console.log(`📋 Tables trouvées: ${tablesResult.rows.length}`);
            tablesResult.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
        } else {
            console.log('⚠️  Aucune table trouvée. Elles seront créées au démarrage de NestJS.');
        }

        await client.end();
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion PostgreSQL:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Solution: Vérifiez que PostgreSQL est démarré');
            console.error('   Windows: Vérifiez les services Windows');
            console.error('   macOS: brew services start postgresql');
            console.error('   Linux: sudo systemctl start postgresql');
        } else if (error.code === '3D000') {
            console.error('💡 Solution: La base de données n\'existe pas');
            console.error('   Créez-la avec: psql -U postgres -c "CREATE DATABASE site_database;"');
        } else if (error.code === '28P01') {
            console.error('💡 Solution: Erreur d\'authentification');
            console.error('   Vérifiez le nom d\'utilisateur et mot de passe dans le fichier .env');
        }

        console.error('\n📖 Consultez backend/POSTGRESQL_SETUP.md pour plus d\'aide');
        return false;
    }
}

async function startApplication() {
    console.log('🚀 Démarrage de Site Database Backend...\n');

    const isConnected = await checkPostgresConnection();

    if (!isConnected) {
        console.error('\n❌ Impossible de démarrer l\'application sans connexion à la base de données');
        process.exit(1);
    }

    console.log('\n🎯 Démarrage de NestJS...');

    // Démarrer l'application NestJS
    const nestProcess = spawn('npm', ['run', 'start:dev'], {
        stdio: 'inherit',
        shell: true
    });

    nestProcess.on('error', (error) => {
        console.error('Erreur lors du démarrage:', error);
        process.exit(1);
    });

    nestProcess.on('exit', (code) => {
        console.log(`Application fermée avec le code: ${code}`);
        process.exit(code);
    });

    // Gérer l'arrêt propre
    process.on('SIGINT', () => {
        console.log('\n🛑 Arrêt en cours...');
        nestProcess.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Arrêt demandé...');
        nestProcess.kill('SIGTERM');
    });
}

startApplication().catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
});