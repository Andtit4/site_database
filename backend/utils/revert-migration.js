// Script pour annuler la dernière migration manuellement
require('dotenv').config();

console.log('Annulation de la dernière migration avec les paramètres suivants:');
console.log('- DATABASE_HOST:', process.env.DATABASE_HOST);
console.log('- DATABASE_PORT:', process.env.DATABASE_PORT);
console.log('- DATABASE_USERNAME:', process.env.DATABASE_USERNAME);
console.log('- DATABASE_PASSWORD défini:', !!process.env.DATABASE_PASSWORD);
console.log('- DATABASE_NAME:', process.env.DATABASE_NAME);

// Exécuter l'annulation de migration via un processus enfant
const { spawn } = require('child_process');
const migration = spawn('npx', ['typeorm-ts-node-commonjs', 'migration:revert', '-d', 'src/config/typeorm.config.ts']);

migration.stdout.on('data', (data) => {
    console.log(`${data}`);
});

migration.stderr.on('data', (data) => {
    console.error(`${data}`);
});

migration.on('close', (code) => {
    console.log(`Annulation de migration terminée avec le code: ${code}`);
});