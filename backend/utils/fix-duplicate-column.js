// Script pour supprimer la colonne type dupliquée de la table site
require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixDuplicateColumn() {
    console.log('Tentative de connexion à la base de données...');

    try {
        // Créer la connexion à la DB
        const connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '3306', 10),
            user: process.env.DATABASE_USERNAME || 'root',
            password: process.env.DATABASE_PASSWORD || '',
            database: process.env.DATABASE_NAME || 'site_info_db',
            connectionLimit: 10
        });

        console.log('Connexion établie avec succès.');

        // Vérifier si la colonne type existe dans la table site
        const [columns] = await connection.execute(
            'SHOW COLUMNS FROM site WHERE Field = ?', ['type']
        );

        if (columns.length > 0) {
            console.log('La colonne type existe dans la table site. Suppression...');

            try {
                await connection.execute('ALTER TABLE site DROP COLUMN type');
                console.log('Colonne type supprimée avec succès.');
            } catch (error) {
                if (error.message.includes('Can\'t DROP')) {
                    console.log('Impossible de supprimer la colonne type. Essai de renommage...');
                    await connection.execute('ALTER TABLE site CHANGE COLUMN type type_old VARCHAR(255)');
                    console.log('Colonne type renommée en type_old.');
                } else {
                    throw error;
                }
            }
        } else {
            console.log('La colonne type n\'existe pas dans la table site.');
        }

        // Fermer la connexion
        await connection.end();
        console.log('Connexion fermée.');
        console.log('Terminé.');
    } catch (error) {
        console.error('Erreur lors de la correction de la colonne dupliquée:', error.message);
    }
}

fixDuplicateColumn();