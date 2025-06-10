# Backend API - Site Database

## Description

API Backend pour l'application Site Database, construite avec NestJS et TypeScript.

## Technologies utilisées

- NestJS - Framework Node.js robuste
- TypeScript - Langage typé
- PostgreSQL - Base de données relationnelle
- TypeORM - ORM pour TypeScript
- JWT - Authentification
- Bcrypt - Hachage des mots de passe
- Class Validator - Validation des données

## Installation

```bash
# Installation des dépendances
npm install

# Configuration de l'environnement
cp .env.example .env
# Éditer le fichier .env avec vos paramètres PostgreSQL
```

## Configuration de la base de données

Consultez `POSTGRESQL_SETUP.md` pour la configuration complète de PostgreSQL.

Exemple de configuration dans `.env` :
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=site_database
```

## Scripts disponibles

```bash
# Démarrage avec vérification PostgreSQL
npm run start:postgres

# Démarrage en développement
npm run start:dev

# Démarrage en production
npm run start:prod

# Migration MySQL vers PostgreSQL
npm run migrate:mysql-to-postgres

# Tests
npm run test
```

## API Documentation

Une fois l'application démarrée, la documentation Swagger est disponible à :
[http://localhost:5001/docs](http://localhost:5001/docs)

## Structure du projet

```
src/
├── config/         # Configuration (database, jwt, etc.)
├── entities/       # Entités TypeORM
├── dto/           # Data Transfer Objects
├── controllers/   # Contrôleurs REST
├── services/      # Services métier
├── auth/          # Module d'authentification
└── main.ts        # Point d'entrée
```

## Migrations de base de données

L'application utilise TypeORM en mode `synchronize: false` pour éviter les conflits.
Les tables sont créées automatiquement au premier démarrage.

## Support

- Pour la configuration PostgreSQL : voir `POSTGRESQL_SETUP.md`
- Pour les problèmes de migration : voir `../POSTGRESQL_MIGRATION.md`

## Structure de l'API

### Sites

- `GET /api/sites` - Liste tous les sites
- `GET /api/sites/:id` - Récupère un site par son ID
- `POST /api/sites` - Crée un nouveau site
- `PATCH /api/sites/:id` - Met à jour un site
- `DELETE /api/sites/:id` - Supprime un site
- `GET /api/sites/statistics` - Statistiques des sites

### Équipements

- `GET /api/equipment` - Liste tous les équipements
- `GET /api/equipment/:id` - Récupère un équipement par son ID
- `POST /api/equipment` - Crée un nouvel équipement
- `PATCH /api/equipment/:id` - Met à jour un équipement
- `DELETE /api/equipment/:id` - Supprime un équipement
- `GET /api/equipment/statistics` - Statistiques des équipements 
