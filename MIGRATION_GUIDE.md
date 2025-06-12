# Guide de Migration - Système de Champs Dynamiques pour Sites (PostgreSQL)

## Vue d'ensemble

Ce guide explique la migration du système de spécifications de sites vers un nouveau système de champs dynamiques intégrés directement dans la table `site`. **Ce guide est spécifiquement conçu pour PostgreSQL**.

## Changements Apportés

### 🔄 Remplacement du Système de Spécifications

**Ancien système** :
- Table `site_specifications` séparée
- Tables spécifiques par type (`site_spec_tour`, `site_spec_shelter`, etc.)
- Gestion complexe des spécifications

**Nouveau système** :
- Champs dynamiques intégrés dans la table `site`
- Définitions de champs par type de site
- Validation et gestion centralisées
- **Utilise JSONB et types ENUM PostgreSQL pour les performances**

### 📁 Nouveaux Fichiers Backend

1. **`backend/src/entities/site.entity.ts`** - Mise à jour
   - Ajout de l'enum `SiteTypes`
   - Nouveau champ `type` avec type ENUM PostgreSQL (`site_type_enum`)
   - Nouveau champ `dynamicFieldsDefinition` en JSONB
   - Nouveau champ `departmentId`
   - Utilisation de JSONB pour `specifications`

2. **`backend/src/sites/dynamic-fields.service.ts`** - Nouveau
   - Service pour gérer les champs dynamiques
   - Définitions par défaut pour chaque type de site
   - Validation et nettoyage des valeurs

3. **`backend/src/sites/site-dynamic-fields.controller.ts`** - Nouveau
   - Contrôleur API pour les champs dynamiques
   - Endpoints pour récupérer les définitions
   - Validation et manipulation des valeurs

4. **`backend/src/sites/sites.service.ts`** - Mise à jour
   - Intégration du service de champs dynamiques
   - Validation automatique lors de la création/modification

5. **`backend/src/sites/sites.module.ts`** - Mise à jour
   - Ajout des nouveaux services et contrôleurs

6. **`backend/src/dto/site.dto.ts`** - Mise à jour
   - Utilisation des nouveaux `SiteTypes`
   - Ajout du champ `departmentId`

### 📁 Nouveaux Fichiers Frontend

1. **`src/services/siteDynamicFieldsService.ts`** - Nouveau
   - Service frontend pour les champs dynamiques
   - Utilitaires de formatage et validation

2. **`src/components/DynamicFieldsForm.tsx`** - Nouveau
   - Composant React pour l'édition des champs dynamiques
   - Support de tous les types de champs (string, number, boolean, date, select)

3. **`src/services/index.ts`** - Mise à jour
   - Export du nouveau service

### 🔧 Scripts de Migration PostgreSQL

1. **`backend/migrate-dynamic-fields-postgres.js`** - Nouveau
   - Script Node.js pour PostgreSQL avec driver `pg`
   - Gestion des erreurs spécifiques PostgreSQL

2. **`backend/utils/add-dynamic-fields-to-sites-postgres.sql`** - Nouveau
   - Script SQL direct pour PostgreSQL
   - Utilise `DO $$` blocks et `IF NOT EXISTS`

### ⚠️ Modules Désactivés

**`backend/src/site-specifications/`** - Désactivé
- Module commenté dans `app.module.ts`
- Remplacé par le nouveau système

## Spécificités PostgreSQL

### 🐘 Types de Données

- **ENUM** : Utilise `CREATE TYPE site_type_enum AS ENUM (...)`
- **JSON** : Utilise `JSONB` pour de meilleures performances
- **Index** : Index automatiques sur les colonnes JSONB et ENUM

### 🐘 Avantages PostgreSQL

- **JSONB** : Plus rapide que JSON pour les requêtes et index
- **ENUM** : Validation au niveau base de données
- **Index** : Support natif des index sur JSONB
- **Contraintes** : Validation forte des types

## Types de Sites Supportés

Le nouveau système supporte les types suivants avec leurs champs spécifiques :

### 🗼 TOUR
- **hauteur** (number) : Hauteur en mètres
- **nombreAntennes** (number) : Nombre d'antennes
- **materiaux** (select) : Acier, Béton, Composite, Autre
- **dateInstallation** (date) : Date d'installation

### 🏠 SHELTER  
- **surface** (number) : Surface en m²
- **capacite** (number) : Capacité équipements
- **climatisation** (boolean) : Présence de climatisation
- **securite** (select) : Niveau de sécurité

### 📡 PYLONE
- **hauteur** (number) : Hauteur en mètres
- **charge** (number) : Charge maximale en kg
- **modele** (string) : Modèle
- **foundation** (select) : Type de fondation

### 🏢 BATIMENT
- **etages** (number) : Nombre d'étages
- **surface** (number) : Surface totale en m²
- **accessToit** (boolean) : Accès au toit
- **typeConstruction** (select) : Type de construction

### 🏠 TOIT_BATIMENT
- **surface** (number) : Surface disponible en m²
- **resistance** (number) : Résistance en kg/m²
- **accessibilite** (select) : Niveau d'accessibilité
- **protection** (boolean) : Protection météorologique

### 🏗️ ROOFTOP
- **surface** (number) : Surface en m²
- **accessibilite** (select) : Niveau d'accessibilité
- **hauteurBatiment** (number) : Hauteur du bâtiment

### 🌍 TERRAIN_BAILLE
- **surface** (number) : Surface en m²
- **topographie** (select) : Type de topographie
- **accessibilite** (select) : Niveau d'accessibilité
- **dureeBail** (number) : Durée du bail en années

### 🌍 TERRAIN_PROPRIETAIRE
- **surface** (number) : Surface en m²
- **description** (string) : Description
- **usage** (select) : Usage autorisé

### ❓ AUTRE
- **description** (string) : Description
- **caracteristiques** (string) : Caractéristiques spéciales

## Instructions de Migration PostgreSQL

### 1. Prérequis

Assurez-vous d'avoir le driver PostgreSQL installé :

```bash
cd backend
npm install pg
npm install --save-dev @types/pg
```

### 2. Migration Base de Données

**Option A : Script Node.js (Recommandé)**

```bash
cd backend
node migrate-dynamic-fields-postgres.js
```

**Option B : Script SQL direct**

```bash
psql -h localhost -U postgres -d site_info_db -f utils/add-dynamic-fields-to-sites-postgres.sql
```

Cette migration ajoute :
- **Type ENUM** : `site_type_enum` pour les types de sites
- **Colonne** `type` : Type ENUM pour le type de site
- **Colonne** `dynamicFieldsDefinition` : JSONB pour les définitions
- **Colonne** `departmentId` : VARCHAR(36) pour l'ID du département
- **Colonne** `specifications` : JSONB pour les valeurs (si pas déjà présente)
- **Index** : Performance sur `type` et `departmentId`

### 3. Mise à Jour du Backend

Le backend est déjà configuré avec les nouveaux services PostgreSQL. Redémarrez simplement l'application :

```bash
npm run start:dev
```

### 4. Utilisation Frontend

Le nouveau composant `DynamicFieldsForm` peut être utilisé comme suit :

```jsx
import DynamicFieldsForm from '../components/DynamicFieldsForm';
import { siteDynamicFieldsService, SiteTypes } from '../services/siteDynamicFieldsService';

// Dans votre composant
const [fieldDefinitions, setFieldDefinitions] = useState([]);
const [dynamicValues, setDynamicValues] = useState({});

// Charger les définitions de champs
useEffect(() => {
  if (siteType) {
    siteDynamicFieldsService.getFieldDefinitions(siteType)
      .then(setFieldDefinitions);
  }
}, [siteType]);

// Rendu du formulaire
<DynamicFieldsForm
  siteType={siteType}
  fieldDefinitions={fieldDefinitions}
  values={dynamicValues}
  onChange={setDynamicValues}
/>
```

## API Endpoints

### Nouveaux Endpoints

- `GET /sites/dynamic-fields/definitions/:siteType` - Définitions pour un type
- `GET /sites/dynamic-fields/definitions` - Toutes les définitions
- `POST /sites/dynamic-fields/validate` - Validation des valeurs
- `POST /sites/dynamic-fields/apply-defaults` - Application des valeurs par défaut
- `POST /sites/dynamic-fields/clean` - Nettoyage des valeurs
- `GET /sites/dynamic-fields/types` - Liste des types de sites

### Endpoints Sites Mis à Jour

- `POST /sites` - Maintenant avec validation des champs dynamiques
- `PUT /sites/:id` - Maintenant avec validation des champs dynamiques

## Requêtes PostgreSQL Utiles

### Rechercher dans les spécifications JSONB

```sql
-- Sites avec une hauteur > 50m
SELECT * FROM site 
WHERE specifications->>'hauteur' IS NOT NULL 
AND CAST(specifications->>'hauteur' AS NUMERIC) > 50;

-- Sites avec climatisation
SELECT * FROM site 
WHERE specifications->>'climatisation' = 'true';

-- Sites par type avec leurs spécifications
SELECT type, specifications 
FROM site 
WHERE type IS NOT NULL;
```

### Index JSONB pour les performances

```sql
-- Index GIN pour recherches dans JSONB
CREATE INDEX IF NOT EXISTS idx_site_specifications_gin 
ON site USING GIN (specifications);

-- Index sur un champ spécifique du JSONB
CREATE INDEX IF NOT EXISTS idx_site_hauteur 
ON site ((specifications->>'hauteur'));
```

## Avantages du Nouveau Système PostgreSQL

✅ **Performance JSONB** : Index et requêtes rapides sur les champs dynamiques
✅ **Types ENUM** : Validation forte au niveau base de données
✅ **Simplicité** : Un seul modèle de données au lieu de multiples tables
✅ **Flexibilité** : Facile d'ajouter de nouveaux types et champs
✅ **Validation** : Validation automatique des types et contraintes
✅ **Index Avancés** : Support natif des index JSONB PostgreSQL
✅ **Maintenance** : Code plus centralisé et maintenable

## Compatibilité

Le nouveau système est conçu pour être rétrocompatible :
- Les sites existants gardent leurs spécifications dans le champ JSONB
- Migration progressive possible
- Ancien système désactivé mais code conservé
- Support complet des fonctionnalités PostgreSQL

## Dépannage PostgreSQL

### Erreurs Communes

1. **Type ENUM existe déjà** : Normal, ignoré automatiquement
2. **Colonne existe déjà** : Normal, ignoré automatiquement
3. **Erreur de connexion** : Vérifiez les variables d'environnement PostgreSQL

### Variables d'Environnement

```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=site_info_db
```

## Support

Pour toute question ou problème lors de la migration PostgreSQL, consultez :
1. Ce guide de migration
2. Les commentaires dans le code
3. La documentation PostgreSQL officielle
4. Les logs de migration détaillés 
