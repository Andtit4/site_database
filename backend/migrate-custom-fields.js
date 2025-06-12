const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'site_info_db',
    user: 'postgres',
    password: 'postgres123'
});

async function migrateCustomFields() {
    try {
        await client.connect();
        console.log('Connexion à PostgreSQL établie');

        // Créer l'enum pour les types de champs
        console.log('Création de l\'enum custom_field_type_enum...');
        await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'custom_field_type_enum') THEN
              CREATE TYPE custom_field_type_enum AS ENUM (
                  'string',
                  'number',
                  'boolean',
                  'date',
                  'select',
                  'textarea'
              );
          END IF;
      END $$;
    `);

        // Créer la table site_custom_fields
        console.log('Création de la table site_custom_fields...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS site_custom_fields (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "fieldName" VARCHAR NOT NULL UNIQUE,
          "fieldLabel" VARCHAR NOT NULL,
          "fieldType" custom_field_type_enum NOT NULL,
          required BOOLEAN DEFAULT false,
          "defaultValue" VARCHAR NULL,
          options JSONB NULL,
          validation JSONB NULL,
          description TEXT NULL,
          active BOOLEAN DEFAULT true,
          "sortOrder" INTEGER DEFAULT 0,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Ajouter la colonne customFieldsValues à la table sites
        console.log('Ajout de la colonne customFieldsValues à la table site...');
        await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'site' 
              AND column_name = 'customFieldsValues'
          ) THEN
              ALTER TABLE site ADD COLUMN "customFieldsValues" JSONB NULL;
          END IF;
      END $$;
    `);

        // Créer des index pour améliorer les performances
        console.log('Création des index de performance...');
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_site_custom_fields_active ON site_custom_fields (active);
    `);

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_site_custom_fields_sort_order ON site_custom_fields ("sortOrder");
    `);

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_site_custom_fields_field_name ON site_custom_fields ("fieldName");
    `);

        // Index sur customFieldsValues pour PostgreSQL JSONB
        try {
            await client.query(`
        CREATE INDEX IF NOT EXISTS idx_site_custom_fields_values ON site USING GIN ("customFieldsValues");
      `);
        } catch (ginError) {
            console.log('⚠️  Index GIN non créé (optionnel):', ginError.message);
        }

        // Fonction pour mettre à jour la colonne updatedAt automatiquement
        console.log('Création de la fonction update_updated_at_column...');
        await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW."updatedAt" = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

        // Trigger pour la table site_custom_fields
        console.log('Création du trigger pour site_custom_fields...');
        await client.query(`
      DROP TRIGGER IF EXISTS update_site_custom_fields_updated_at ON site_custom_fields;
    `);

        await client.query(`
      CREATE TRIGGER update_site_custom_fields_updated_at
          BEFORE UPDATE ON site_custom_fields
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);

        console.log('✅ Migration des champs personnalisés terminée avec succès !');

        // Afficher un résumé
        const result = await client.query('SELECT COUNT(*) as count FROM site_custom_fields');
        console.log(`📊 Nombre de champs personnalisés: ${result.rows[0].count}`);

        // Vérifier que la colonne a été ajoutée
        const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'site' 
      AND column_name = 'customFieldsValues'
    `);

        if (columnCheck.rows.length > 0) {
            console.log('✅ Colonne customFieldsValues ajoutée à la table site');
        } else {
            console.log('❌ Erreur: Colonne customFieldsValues non trouvée');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        throw error;
    } finally {
        await client.end();
        console.log('Connexion fermée');
    }
}

// Exécuter la migration
migrateCustomFields()
    .then(() => {
        console.log('Migration terminée');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Erreur:', error);
        process.exit(1);
    });