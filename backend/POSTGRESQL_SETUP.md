# Configuration PostgreSQL pour Site Database

Ce guide vous aide à configurer PostgreSQL pour l'application Site Database.

## 1. Installation de PostgreSQL

### Windows
1. Téléchargez PostgreSQL depuis [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Installez avec les options par défaut
3. Notez le mot de passe administrateur choisi pendant l'installation

### macOS
```bash
# Avec Homebrew
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 2. Configuration de la base de données

### Créer un utilisateur et la base de données

1. Connectez-vous à PostgreSQL :
```bash
# Windows (depuis l'invite de commande)
psql -U postgres

# macOS/Linux
sudo -u postgres psql
```

2. Créez la base de données :
```sql
-- Créer la base de données
CREATE DATABASE site_database
  WITH 
  OWNER = postgres
  ENCODING = 'UTF8'
  LC_COLLATE = 'en_US.UTF-8'
  LC_CTYPE = 'en_US.UTF-8'
  CONNECTION LIMIT = -1;

-- Optionnel : créer un utilisateur dédié
CREATE USER site_db_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE site_database TO site_db_user;

-- Quitter psql
\q
```

## 3. Configuration de l'application

### Créer le fichier .env

Créez un fichier `.env` dans le dossier `backend/` avec :

```env
# Configuration de la base de données PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=votre_mot_de_passe_postgres
DATABASE_NAME=site_database

# Configuration de l'API
API_PORT=5001
NODE_ENV=development

# Configuration JWT
JWT_SECRET=your-super-secret-jwt-key-for-development
JWT_EXPIRES_IN=30d

# Configuration CORS
FRONTEND_URL=http://localhost:3000
```

### Installation des dépendances

```bash
cd backend
npm install
```

## 4. Initialisation de la base de données

### Réinitialiser la base (optionnel)
```bash
# Depuis le dossier backend/
psql -U postgres -f reset-database-postgres.sql
```

### Lancer l'application
```bash
npm run start:dev
```

L'application créera automatiquement les tables nécessaires au premier démarrage.

## 5. Vérification

1. Démarrez le backend : `npm run start:dev`
2. Vérifiez les logs pour vous assurer que la connexion PostgreSQL fonctionne
3. Testez l'API à l'adresse : [http://localhost:5001/docs](http://localhost:5001/docs)

## 6. Outils recommandés

- **pgAdmin** : Interface graphique pour PostgreSQL
- **DBeaver** : Client SQL universel
- **TablePlus** : Client élégant pour macOS

## Troubleshooting

### Erreur de connexion
- Vérifiez que PostgreSQL est démarré
- Vérifiez les paramètres de connexion dans le fichier `.env`
- Assurez-vous que le port 5432 n'est pas bloqué

### Erreur d'authentification
- Vérifiez le nom d'utilisateur et mot de passe
- Assurez-vous que l'utilisateur a les droits sur la base de données

### Base de données non trouvée
- Créez la base de données avec les commandes SQL ci-dessus
- Vérifiez le nom de la base dans le fichier `.env` 
