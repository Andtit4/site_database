const mysql = require('mysql2/promise');

async function setupEquipmentTable() {
	const connection = await mysql.createConnection({
		host: '193.203.166.156',
		user: 'u527740812_admin',
		password: 'SiteInfo2024!',
		database: 'u527740812_site_info_db',
		port: 3306
	});

	try {
		console.log('Configuration de la table equipment...');

		// Vérifier si la table existe
		const [tableExists] = await connection.execute(
			'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?', ['u527740812_site_info_db', 'equipment']
		);

		console.log('Table equipment existe:', tableExists[0].count > 0);

		if (tableExists[0].count === 0) {
			// Créer la table equipment
			console.log('Création de la table equipment...');
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

		// Vérifier s'il y a des sites pour associer les équipements
		const [sites] = await connection.execute('SELECT id, name FROM site LIMIT 5');
		console.log('Sites disponibles:', sites.length);

		if (sites.length === 0) {
			console.log('Aucun site trouvé. Création d\'un site de test...');
			await connection.execute(`
        INSERT INTO site (id, name, region, longitude, latitude, status, createdAt, updatedAt)
        VALUES ('TEST-SITE-001', 'Site de Test', 'Région Test', 2.3522, 48.8566, 'ACTIF', NOW(), NOW())
      `);
			console.log('Site de test créé avec ID: TEST-SITE-001');
			sites.push({ id: 'TEST-SITE-001', name: 'Site de Test' });
		}

		// Vérifier le nombre d'équipements existants
		const [count] = await connection.execute('SELECT COUNT(*) as total FROM equipment');
		console.log('Nombre d\'équipements existants:', count[0].total);

		if (count[0].total === 0) {
			console.log('Ajout d\'équipements de test...');

			const testEquipments = [{
				id: 'hkbkkhb',
				type: 'ANTENNE',
				model: 'Antenne GSM 900MHz',
				manufacturer: 'Ericsson',
				serialNumber: 'ANT-001-2024',
				installDate: '2024-01-15',
				status: 'ACTIF',
				siteId: sites[0].id,
				name: 'Antenne principale'
			},
			{
				id: 'eq-' + Math.random().toString(36).substr(2, 9),
				type: 'ROUTEUR',
				model: 'Router Cisco 2900',
				manufacturer: 'Cisco',
				serialNumber: 'RTR-002-2024',
				installDate: '2024-02-01',
				status: 'ACTIF',
				siteId: sites[0].id,
				name: 'Routeur principal'
			},
			{
				id: 'eq-' + Math.random().toString(36).substr(2, 9),
				type: 'BATTERIE',
				model: 'Batterie 48V 100Ah',
				manufacturer: 'Samsung SDI',
				serialNumber: 'BAT-003-2024',
				installDate: '2024-01-20',
				status: 'ACTIF',
				siteId: sites[0].id,
				name: 'Batterie de secours'
			}
			];

			for (const equipment of testEquipments) {
				await connection.execute(`
          INSERT INTO equipment (id, type, model, manufacturer, serialNumber, installDate, status, siteId, name, specifications, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '{}', NOW(), NOW())
        `, [
					equipment.id,
					equipment.type,
					equipment.model,
					equipment.manufacturer,
					equipment.serialNumber,
					equipment.installDate,
					equipment.status,
					equipment.siteId,
					equipment.name
				]);
			}

			console.log(`${testEquipments.length} équipements de test ajoutés!`);
		}

		// Vérifier le résultat final
		const [finalCount] = await connection.execute('SELECT COUNT(*) as total FROM equipment');
		const [equipments] = await connection.execute('SELECT id, type, model, siteId FROM equipment LIMIT 10');

		console.log('\n=== RÉSUMÉ ===');
		console.log('Nombre total d\'équipements:', finalCount[0].total);
		console.log('Équipements:');
		equipments.forEach(eq => console.log(`- ID: ${eq.id} | Type: ${eq.type} | Modèle: ${eq.model} | Site: ${eq.siteId}`));

	} catch (error) {
		console.error('Erreur:', error.message);
	} finally {
		await connection.end();
	}
}

setupEquipmentTable();
