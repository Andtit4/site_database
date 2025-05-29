// Script personnalisé pour exécuter les migrations
require('dotenv').config();

console.log('L\'exécution automatique des migrations au démarrage a été désactivée.');
console.log('Pour exécuter les migrations manuellement, utilisez la commande:');
console.log('npm run migration:run');

// Ne pas exécuter la migration automatiquement
// const { spawn } = require('child_process');
// const migration = spawn('npx', ['typeorm-ts-node-commonjs', 'migration:run', '-d', 'src/config/typeorm.config.ts']);

// migration.stdout.on('data', (data) => {
//   console.log(`${data}`);
// });

// migration.stderr.on('data', (data) => {
//   console.error(`${data}`);
// });

// migration.on('close', (code) => {
//   console.log(`Migration terminée avec le code: ${code}`);
// });
