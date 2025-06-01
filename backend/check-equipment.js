const mysql = require('mysql2/promise');

async function checkEquipment() {
	const connection = await mysql.createConnection({
		host: '193.203.166.156',
		user: 'u527740812_admin',
		password: 'SiteInfo2024!',
		database: 'u527740812_site_info_db',
		port: 3306
	});

	try {
		console.log('Vérification de la table equipment...');

		// Vérifier si la table existe
		const [tableExists] = await connection.execute(
			'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?', ['u527740812_site_info_db', 'equipment']
		);

		console.log('Table equipment existe:', tableExists[0].count > 0);

		if (tableExists[0].count > 0) {
			// Compter les équipements
			const [count] = await connection.execute('SELECT COUNT(*) as total FROM equipment');
			console.log('Nombre total d\'équipements:', count[0].total);

			// Afficher quelques équipements existants
			const [equipments] = await connection.execute('SELECT id, type, model FROM equipment LIMIT 10');
			console.log('Équipements existants:');
			equipments.forEach(eq => console.log('- ID:', eq.id, '| Type:', eq.type, '| Modèle:', eq.model));

			// Vérifier spécifiquement l'ID "hkbkkhb"
			const [specific] = await connection.execute('SELECT * FROM equipment WHERE id = ?', ['hkbkkhb']);
			console.log('Équipement avec ID "hkbkkhb" trouvé:', specific.length > 0);
		} else {
			// Créer la table equipment si elle n'existe pas
			console.log('La table equipment n\'existe pas. Création...');
			await connection.execute(`
                CREATE TABLE equipment (
                    id VARCHAR(36) PRIMARY KEY,
                    type ENUM('ANTENNE', 'ROUTEUR', 'BATTERIE', 'GÉNÉRATEUR', 'REFROIDISSEMENT', 'SHELTER', 'PYLÔNE', 'SÉCURITÉ') NOT NULL,
                    model VARCHAR(255) NOT NULL,
                    manufacturer VARCHAR(255),
                    serialNumber VARCHAR(255),
                    installDate VARCHAR(255) NOT NULL,
                    lastMaintenanceDate VARCHAR(255),
                    status ENUM('ACTIF', 'INACTIF', 'MAINTENANCE', 'EN_PANNE') DEFAULT 'ACTIF',
                    specifications JSON,
                    name VARCHAR(255),
                    siteId VARCHAR(36) NOT NULL,
                    departmentId VARCHAR(36),
                    teamId VARCHAR(36),
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX (siteId),
                    INDEX (departmentId),
                    INDEX (teamId)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
			console.log('Table equipment créée avec succès!');
		}
	} catch (error) {
		console.error('Erreur:', error.message);
	} finally {
		await connection.end();
	}
}

checkEquipment();
