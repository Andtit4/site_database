# 📊 Guide de Migration vers PostgreSQL

Ce guide vous explique comment migrer toutes vos tables existantes vers une nouvelle base de données PostgreSQL.

## 🎯 Objectif

La migration `InitialDatabaseSchema` créera toutes les tables nécessaires dans votre nouvelle base de données PostgreSQL avec :
- Toutes les entités (Site, User, Equipment, Department, etc.)
- Les relations entre les tables
- Les contraintes de clés étrangères
- Les index pour optimiser les performances

## 📋 Tables créées

### Tables principales
- **department** - Gestion des départements
- **team** - Gestion des équipes
- **users** - Gestion des utilisateurs
- **site** - Gestion des sites
- **equipment** - Gestion des équipements
- **notifications** - Système de notifications
- **site_custom_fields** - Définition des champs personnalisés
- **site_custom_field_backup** - Sauvegarde des champs personnalisés

### Tables de liaison
- **team_sites** - Relation Many-to-Many entre équipes et sites
- **team_equipment** - Relation Many-to-Many entre équipes et équipements
- **site_custom_field_departments** - Relation entre champs personnalisés et départements

## 🚀 Comment exécuter la migration

### Méthode 1: Script automatisé (Recommandé)

```bash
# Naviguer vers le dossier backend
cd backend

# Exécuter le script de migration
node migrate-to-new-database.js
```

### Méthode 2: Commandes manuelles

```bash
# Naviguer vers le dossier backend
cd backend

# Exécuter la migration
npm run migration:run
```

## ⚙️ Configuration

### Variables d'environnement

Assurez-vous que les variables suivantes sont configurées dans votre fichier `.env` :

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=votre_mot_de_passe
DATABASE_NAME=site_info_db
```

### Fichier de configuration

Vérifiez que votre fichier `data-source.ts` pointe vers la bonne base de données :

```typescript
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'root',
  database: process.env.DATABASE_NAME || 'site_info_db',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});
```

## 📦 Prérequis

### 1. PostgreSQL installé et configuré
```bash
# Vérifier que PostgreSQL fonctionne
pg_isready

# Ou sur Windows avec Laragon/XAMPP
# Vérifier que le service PostgreSQL est démarré
```

### 2. Base de données créée
```sql
-- Se connecter à PostgreSQL et créer la base de données
CREATE DATABASE site_info_db;
```

### 3. Dépendances installées
```bash
npm install
```

## 🔍 Vérification post-migration

### Vérifier les tables créées
```sql
-- Se connecter à votre base de données et lister les tables
\dt

-- Ou avec une requête SQL
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### Vérifier les contraintes
```sql
-- Lister les contraintes de clés étrangères
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

## 🐛 Résolution des problèmes

### Erreur: "database does not exist"
```bash
# Créer la base de données manuellement
createdb site_info_db
```

### Erreur: "permission denied"
```bash
# Vérifier les permissions utilisateur
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE site_info_db TO your_user;"
```

### Erreur: "relation already exists"
```bash
# La table existe déjà, vous pouvez soit :
# 1. Supprimer les tables existantes
# 2. Ou utiliser une nouvelle base de données
```

### Migration échoue
```bash
# Vérifier le statut des migrations
npm run migration:show

# Annuler la dernière migration si nécessaire
npm run migration:revert
```

## 📈 Structure de la base de données

### Relations principales

```
Department (1) ←→ (n) Team
Department (1) ←→ (n) User
Department (1) ←→ (n) Equipment

Team (1) ←→ (n) User
Team (n) ←→ (n) Site (via team_sites)
Team (n) ←→ (n) Equipment (via team_equipment)

Site (1) ←→ (n) Equipment
User (1) ←→ (n) Notification

SiteCustomField (n) ←→ (n) Department (via site_custom_field_departments)
```

### Types ENUM créés

- **equipment_type_enum**: Types d'équipements (ANTENNE, ROUTEUR, etc.)
- **notification_type_enum**: Types de notifications (INFO, SUCCESS, etc.)
- **notification_priority_enum**: Priorités de notifications (LOW, MEDIUM, etc.)
- **custom_field_type_enum**: Types de champs personnalisés (STRING, NUMBER, etc.)

## 🎉 Après la migration

Une fois la migration terminée avec succès :

1. ✅ Toutes vos tables sont créées
2. ✅ Les relations sont configurées
3. ✅ Les contraintes sont en place
4. ✅ Les index sont créés pour les performances
5. ✅ Votre application peut se connecter à la base de données

Vous pouvez maintenant démarrer votre application :

```bash
npm run start:dev
```

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs de migration
2. Consultez la documentation PostgreSQL
3. Vérifiez vos variables d'environnement
4. Assurez-vous que PostgreSQL fonctionne correctement 
