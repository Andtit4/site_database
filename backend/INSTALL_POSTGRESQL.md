# 🚨 PostgreSQL requis !

## L'erreur que vous voyez

```
❌ Erreur de connexion PostgreSQL: la base de données « site_database » n'existe pas
```

Cela signifie que **PostgreSQL n'est pas installé** sur votre système.

## 🔧 Solutions rapides

### Option 1 : Installation automatique (Windows)

Exécutez cette commande dans le terminal **en tant qu'administrateur** :

```bash
npm run install:postgresql
```

Cette commande va :
- ✅ Installer Chocolatey (gestionnaire de paquets)
- ✅ Installer PostgreSQL automatiquement
- ✅ Créer la base de données `site_database`
- ✅ Démarrer les services

### Option 2 : Installation manuelle

**Windows :**
1. Téléchargez PostgreSQL : https://www.postgresql.org/download/windows/
2. Installez avec les options par défaut
3. Notez le mot de passe administrateur
4. Ouvrez pgAdmin ou cmd et exécutez :
   ```sql
   CREATE DATABASE site_database;
   ```

**macOS :**
```bash
brew install postgresql
brew services start postgresql
psql postgres -c "CREATE DATABASE site_database;"
```

**Linux (Ubuntu/Debian) :**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE DATABASE site_database;"
```

## 🎯 Après installation

1. **Redémarrez votre terminal**
2. **Mettez à jour le fichier `.env`** avec votre mot de passe PostgreSQL :
   ```env
   DATABASE_PASSWORD=your_postgres_password
   ```
3. **Testez la connexion** :
   ```bash
   npm run start:postgres
   ```

## ✅ Résultat attendu

Vous devriez voir :
```
🚀 Démarrage de Site Database Backend...
✅ Connexion PostgreSQL réussie!
📊 Version PostgreSQL: PostgreSQL 15.x
🎯 Démarrage de NestJS...
```

## 🆘 Besoin d'aide ?

- **Guide complet** : `POSTGRESQL_SETUP.md`
- **Problème spécifique** : Consultez les logs d'erreur
- **Alternative** : Utilisez le script automatique `npm run install:postgresql` 
