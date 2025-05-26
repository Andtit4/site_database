# Site Info - Backend API

API Backend pour l'application de gestion des sites de télécommunication.

## Technologies utilisées

- NestJS - Framework backend
- TypeORM - ORM pour la base de données
- MySQL - Base de données relationnelle
- Class Validator - Validation des DTO

## Installation

```bash
# Installation des dépendances
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=root
DATABASE_NAME=site_info_db

API_PORT=3000
API_PREFIX=api
```

## Lancement de l'application

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Initialisation des données

Une fois l'application lancée, vous pouvez initialiser la base de données avec des données de test en exécutant :

```
POST http://localhost:3000/api/seed
```

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