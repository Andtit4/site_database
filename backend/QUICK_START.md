# 🚀 Démarrage rapide - PostgreSQL

## Étapes pour migrer de MySQL vers PostgreSQL

### 1. Installer PostgreSQL (si pas déjà fait)

**Windows :**
- Télécharger depuis : https://www.postgresql.org/download/windows/
- Installer avec les options par défaut
- Noter le mot de passe administrateur

**macOS :**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian) :**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Créer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Dans psql, créer la base :
CREATE DATABASE site_database;

# Quitter
\q
```

### 3. Configurer l'application

Créer le fichier `.env` dans le dossier `backend/` :

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_postgres_password
DATABASE_NAME=site_database
API_PORT=5001
NODE_ENV=development
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
```

### 4. Installer les dépendances

```bash
cd backend
npm install
```

### 5. Démarrer l'application

```bash
# Option 1 : Avec vérification PostgreSQL (recommandé)
npm run start:postgres

# Option 2 : Démarrage normal
npm run start:dev
```

### 6. Vérifier que ça fonctionne

- Backend : http://localhost:5001/docs
- L'API créera automatiquement les tables au premier démarrage

## 🔄 Migration des données (optionnel)

Si vous avez des données MySQL existantes :

1. **Configurer MySQL dans .env :**
```env
# Ajouter ces lignes au .env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=u527740812_site_info_db
```

2. **Lancer la migration :**
```bash
# D'abord démarrer l'app pour créer les tables PostgreSQL
npm run start:dev

# Dans un autre terminal
npm run migrate:mysql-to-postgres
```

## ✅ Résultat attendu

Si tout fonctionne, vous devriez voir :
```
🚀 Démarrage de Site Database Backend...
✅ Connexion PostgreSQL réussie!
📊 Version PostgreSQL: PostgreSQL 15.x
⚠️ Aucune table trouvée. Elles seront créées par NestJS au démarrage.
🎯 Démarrage de NestJS...
```

## ❌ Problèmes courants

**Erreur de connexion :**
- Vérifiez que PostgreSQL est démarré
- Vérifiez le mot de passe dans le fichier `.env`

**Base de données n'existe pas :**
```bash
psql -U postgres -c "CREATE DATABASE site_database;"
```

**Port déjà utilisé :**
- Changez `API_PORT` dans le `.env`
- Ou arrêtez l'autre service sur le port 5001

## 📞 Support

- Guide complet : `POSTGRESQL_SETUP.md`
- Migration complète : `../POSTGRESQL_MIGRATION.md` 
