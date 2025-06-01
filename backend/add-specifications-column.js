const mysql = require('mysql2/promise');

async function addSpecificationsColumn() {
	const connection = await mysql.createConnection({
		host: '193.203.166.156',
		user: 'u527740812_admin',
		password: 'SiteInfo2024!',
		database: 'u527740812_site_info_db',
		port: 3306
	});

	try {
		console.log('Vérification de la table equipment...');

		// Vérifier si la table equipment existe
		const [tableExists] = await connection.execute(
			'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?', ['u527740812_site_info_db', 'equipment']
		);

		if (tableExists[0].count === 0) {
			console.log('Table equipment n\'existe pas. Création de la table...');
			await connection.execute(`
        CREATE TABLE equipment (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255),
          type ENUM('ANTENNE', 'ROUTEUR', 'BATTERIE', 'GÉNÉRATEUR', 'REFROIDISSEMENT', 'SHELTER', 'PYLÔNE', 'SÉCURITÉ') NOT NULL,
          description TEXT,
          model VARCHAR(255),
          serialNumber VARCHAR(255),
          manufacturer VARCHAR(255),
          purchaseDate DATE,
          installDate DATE,
          lastMaintenanceDate DATE,
          status VARCHAR(50) DEFAULT 'ACTIF',
          location VARCHAR(255),
          purchasePrice FLOAT,
          warrantyExpiration DATE,
          ipAddress VARCHAR(50),
          macAddress VARCHAR(50),
          isDeleted BOOLEAN DEFAULT FALSE,
          specifications JSON,
          siteId VARCHAR(36) NOT NULL,
          departmentId VARCHAR(36),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX (siteId),
          INDEX (departmentId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
			console.log('Table equipment créée avec succès avec la colonne specifications!');
		} else {
			console.log('Table equipment existe déjà.');

			// Vérifier si la colonne specifications existe
			const [columnExists] = await connection.execute(
				'SELECT COUNT(*) as count FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?', ['u527740812_site_info_db', 'equipment', 'specifications']
			);

			if (columnExists[0].count === 0) {
				console.log('Ajout de la colonne specifications...');
				await connection.execute('ALTER TABLE equipment ADD COLUMN specifications JSON');
				console.log('Colonne specifications ajoutée avec succès!');
			} else {
				console.log('La colonne specifications existe déjà.');
			}
		}

		// Tester la colonne en ajoutant un équipement de test avec l'ID hkbkkhb s'il n'existe pas
		const [existingEquip] = await connection.execute(
			'SELECT COUNT(*) as count FROM equipment WHERE id = ?', ['hkbkkhb']
		);

		if (existingEquip[0].count === 0) {
			// Vérifier qu'il y a au moins un site
			const [sites] = await connection.execute('SELECT id FROM site LIMIT 1');
			if (sites.length > 0) {
				const siteId = sites[0].id;

				console.log('Création de l\'équipement de test avec ID hkbkkhb...');
				await connection.execute(`
          INSERT INTO equipment (id, name, type, model, manufacturer, serialNumber, installDate, status, siteId, specifications, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
					'hkbkkhb',
					'Antenne principale',
					'ANTENNE',
					'Antenne GSM 900MHz',
					'Ericsson',
					'ANT-001-2024',
					'2024-01-15',
					'ACTIF',
					siteId,
					JSON.stringify({
						frequency: '900MHz',
						power: '20W',
						gain: '15dBi'
					})
				]);
				console.log('Équipement de test avec spécifications créé avec succès!');
			} else {
				console.log('Aucun site trouvé, impossible de créer l\'équipement de test.');
			}
		} else {
			console.log('L\'équipement avec ID hkbkkhb existe déjà.');
		}

		// Afficher le résultat
		const [result] = await connection.execute('SELECT id, name, type, specifications FROM equipment LIMIT 5');
		console.log('\n=== ÉQUIPEMENTS DANS LA BASE ===');
		result.forEach(eq => {
			console.log(`ID: ${eq.id} | Nom: ${eq.name} | Type: ${eq.type}`);
			console.log(`Spécifications: ${eq.specifications ? JSON.stringify(eq.specifications) : 'Aucune'}\n`);
		});

	} catch (error) {
		console.error('Erreur:', error.message);
	} finally {
		await connection.end();
	}
}

addSpecificationsColumn();
