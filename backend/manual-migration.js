// Script personnalisé pour exécuter les migrations
require('dotenv').config();

// Forcer le type string pour le mot de passe
const originalPassword = process.env.DATABASE_PASSWORD;
process.env.DATABASE_PASSWORD = 'motdepasse';

console.log('Démarrage des migrations avec les paramètres suivants:');
console.log('- DATABASE_HOST:', process.env.DATABASE_HOST);
console.log('- DATABASE_PORT:', process.env.DATABASE_PORT);
console.log('- DATABASE_USERNAME:', process.env.DATABASE_USERNAME);
console.log('- DATABASE_PASSWORD défini:', !!process.env.DATABASE_PASSWORD);
console.log('- DATABASE_NAME:', process.env.DATABASE_NAME);

// Exécuter les migrations via un processus enfant
const { spawn } = require('child_process');
const migration = spawn('npx', ['typeorm-ts-node-commonjs', 'migration:run', '-d', 'src/config/typeorm.config.ts']);

migration.stdout.on('data', (data) => {
  console.log(`${data}`);
});

migration.stderr.on('data', (data) => {
  console.error(`${data}`);
});

migration.on('close', (code) => {
  // Restaurer le mot de passe original dans l'environnement
  process.env.DATABASE_PASSWORD = originalPassword;
  console.log(`Migration terminée avec le code: ${code}`);
}); 