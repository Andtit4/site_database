# Guide de Résolution des Problèmes de Base de Données

## Erreur ECONNRESET

### Symptômes
```
QueryFailedError: read ECONNRESET
```

### Causes possibles
1. **Connexion réseau instable**
2. **Timeout de connexion MySQL**
3. **Trop de connexions simultanées**
4. **Configuration de pool de connexions inadéquate**

### Solutions

#### 1. Vérification de la connexion
```bash
# Tester la connexion avec le script de vérification
npm run start:safe
```

#### 2. Vérification de MySQL/MariaDB
```bash
# Vérifier que MySQL est démarré
mysqladmin ping -h localhost -u root -p

# Ou pour MariaDB
mariadb-admin ping -h localhost -u root -p
```

#### 3. Configuration de la base de données
Créez un fichier `.env` dans le dossier `backend/` :
```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=u527740812_site_info_db
NODE_ENV=development
```

#### 4. Test de santé de l'API
```bash
# Une fois l'application démarrée
curl http://localhost:3001/health
curl http://localhost:3001/api/health
```

## Configuration MySQL recommandée

### Variables système recommandées
```sql
SET GLOBAL max_connections = 200;
SET GLOBAL wait_timeout = 600;
SET GLOBAL interactive_timeout = 600;
SET GLOBAL connect_timeout = 20;
```

### Configuration my.cnf/my.ini
```ini
[mysqld]
max_connections = 200
wait_timeout = 600
interactive_timeout = 600
connect_timeout = 20
max_connect_errors = 999999
```

## Scripts disponibles

- `npm run start:safe` - Démarrage avec vérification de DB
- `npm run start:dev` - Démarrage normal en mode développement
- `npm run db:init` - Initialisation de la base de données

## Monitoring des connexions

### Vérifier les connexions actives
```sql
SHOW PROCESSLIST;
```

### Vérifier les variables de connexion
```sql
SHOW VARIABLES LIKE '%connect%';
SHOW VARIABLES LIKE '%timeout%';
```

## Logs utiles

Les logs de l'application indiquent :
- ✅ Connexion réussie
- ❌ Erreurs de connexion
- 🔄 Tentatives de reconnexion
- 📊 État de santé de la DB 
