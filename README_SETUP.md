# 🚀 Guide de configuration rapide - Fix du problème de login

## ❌ Problème rencontré
- Erreur 401 (Unauthorized) lors du login
- Erreur JSON parsing: "CredentialsSignin" is not valid JSON

## ✅ Solutions appliquées

### 1. Correction de la gestion d'erreurs NextAuth
Le fichier `src/views/Login.tsx` a été corrigé pour gérer les erreurs NextAuth qui ne sont pas toujours du JSON valide.

### 2. Outils de debug créés
- `src/utils/testApi.ts` - Testeur de connectivité API
- `src/components/debug/ApiDebug.tsx` - Interface de debug
- `src/app/[lang]/(blank-layout-pages)/debug/page.tsx` - Page de debug

## 🔧 Configuration requise

### Variables d'environnement
Créez un fichier `.env.local` à la racine du projet :

```env
# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-a-random-string

# Backend API
BACKEND_URL=http://localhost:3001

# Database (pour Prisma)
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Démarrage des services

1. **Backend NestJS** (terminal 1) :
```bash
cd backend
npm install  # si pas encore fait
npm start
```

2. **Frontend Next.js** (terminal 2) :
```bash
npm install  # si pas encore fait
npm run dev
```

## 🧪 Test de la configuration

1. Accédez à : `http://localhost:3000/en/debug`
2. Cliquez sur "Lancer les tests"
3. Vérifiez que les deux services sont accessibles

## 🔍 Debug du login

### URL de test
- Frontend : `http://localhost:3000/en/login`
- Debug : `http://localhost:3000/en/debug`

### Identifiants de test
Utilisez les identifiants configurés dans votre backend NestJS (probablement un utilisateur admin créé via la route setup).

### Logs utiles
Ouvrez la console de développement (F12) pour voir :
- Les appels API
- Les erreurs détaillées
- Les réponses du serveur

## ⚠️ Points de vérification

1. **Backend accessible** : `http://localhost:3001/api/auth/login` doit répondre
2. **Variables d'environnement** : `BACKEND_URL` et `NEXTAUTH_URL` correctes
3. **Base de données** : Backend connecté à la DB
4. **Utilisateur test** : Au moins un utilisateur créé dans la base

## 🐛 Dépannage

### Erreur "ECONNREFUSED"
- Le backend n'est pas démarré ou n'écoute pas sur le bon port
- Vérifiez que `npm start` fonctionne dans le dossier `backend/`

### Erreur 401 persistante
- Vérifiez les identifiants utilisés
- Assurez-vous qu'un utilisateur existe dans la base de données
- Testez l'endpoint backend directement

### Erreur JSON parsing
- Cette erreur a été corrigée dans `Login.tsx`
- Assurez-vous d'avoir la dernière version du code

## 📞 Commandes utiles

```bash
# Nettoyer les caches
npm run clean

# Tester la connectivité backend
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpassword"}'

# Voir les processus sur les ports
netstat -an | findstr :3000
netstat -an | findstr :3001
``` 
