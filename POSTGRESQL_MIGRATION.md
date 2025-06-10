# Migration vers PostgreSQL - Site Database

## 🎯 Changements effectués

L'application **Site Database** a été configurée pour utiliser **PostgreSQL** au lieu de MySQL.

### ✅ Modifications apportées

1. **Configuration TypeORM** (`backend/src/config/typeorm.config.ts`)
   - Type de base changé de `mysql` vers `postgres`
   - Port par défaut changé de `3306` vers `5432`
   - Utilisateur par défaut changé de `root` vers `postgres`
   - Nom de base par défaut : `site_database`
   - Ajout du support SSL pour la production

2. **Package.json** (`backend/package.json`)
   - Ajout de `@types/pg` pour TypeScript
   - Suppression des dépendances MySQL inutiles
   - `mysql2` gardé en devDependencies pour la migration
   - Nouveau script : `npm run start:postgres`
   - Nouveau script : `npm run migrate:mysql-to-postgres`

3. **Scripts de migration créés**
   - `backend/reset-database-postgres.sql` : Reset de la base PostgreSQL
   - `backend/start-with-postgres-check.js` : Vérification de connexion avant démarrage
   - `backend/migrate-mysql-to-postgres.js` : Migration des données MySQL vers PostgreSQL

4. **Documentation**
   - `backend/POSTGRESQL_SETUP.md` : Guide complet d'installation et configuration

## 🚀 Pour démarrer avec PostgreSQL

### 1. Installer PostgreSQL
```bash
# Windows : Télécharger depuis postgresql.org
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Créer la base de données
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base
CREATE DATABASE site_database;
\q
```

### 3. Configurer l'application
Créer un fichier `backend/.env` :
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=votre_mot_de_passe
DATABASE_NAME=site_database
API_PORT=5001
NODE_ENV=development
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

### 4. Installer les dépendances
```bash
cd backend
npm install
```

### 5. Démarrer l'application
```bash
# Avec vérification PostgreSQL
npm run start:postgres

# Ou démarrage normal
npm run start:dev
```

## 🔄 Migration depuis MySQL (optionnel)

Si vous avez des données existantes dans MySQL :

### 1. Configurer les variables d'environnement MySQL
Ajouter dans `backend/.env` :
```env
# Configuration MySQL (source)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=votre_mot_de_passe_mysql
MYSQL_DATABASE=u527740812_site_info_db
```

### 2. Lancer la migration
```bash
cd backend

# D'abord démarrer l'app pour créer les tables PostgreSQL
npm run start:dev

# Puis dans un autre terminal, migrer les données
npm run migrate:mysql-to-postgres
```

## 🛠️ Outils recommandés

- **pgAdmin** : Interface graphique PostgreSQL officielle
- **DBeaver** : Client SQL universel gratuit
- **TablePlus** : Client moderne (macOS/Windows)
- **VS Code + PostgreSQL Extension** : Pour développement

## 📊 Avantages de PostgreSQL

- **Performance** : Meilleur pour les requêtes complexes
- **Fonctionnalités avancées** : JSON, arrays, types personnalisés
- **Standards SQL** : Respect strict des standards
- **Extensibilité** : Nombreuses extensions disponibles
- **Open Source** : Licence libre et communauté active

## ❓ Troubleshooting

Consultez `backend/POSTGRESQL_SETUP.md` pour les solutions aux problèmes courants.

## 🔧 Scripts disponibles

```bash
# Backend
npm run start:postgres      # Démarrage avec vérification PostgreSQL
npm run start:dev          # Démarrage normal
npm run migrate:mysql-to-postgres  # Migration MySQL → PostgreSQL

# Frontend (inchangé)
npm run dev               # Démarrage du frontend
```

---

La migration est maintenant terminée ! 🎉 
