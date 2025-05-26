# Guide d'intégration API - Système d'authentification

Ce guide explique comment utiliser l'intégration API mise en place pour l'authentification et les appels vers le backend NestJS.

## Architecture

L'intégration suit une architecture en couches :

```
Frontend (Next.js) ↔ API Routes (Next.js) ↔ Backend (NestJS)
```

### Flux d'authentification

1. **Login** : L'utilisateur saisit ses identifiants
2. **API Route** : `/api/login` traite la demande et appelle le backend
3. **Backend** : Authentifie l'utilisateur et retourne un JWT
4. **NextAuth** : Stocke l'utilisateur et le token dans la session
5. **Client** : Utilise le token pour les appels API suivants

## Fichiers créés/modifiés

### 1. Routes API
- `src/app/api/login/route.ts` - Route de login intégrée avec le backend
- ~~`src/app/api/login/users.ts`~~ - Supprimé (données mockées)

### 2. Configuration d'authentification
- `src/libs/auth.ts` - Configuration NextAuth mise à jour
- `src/types/next-auth.d.ts` - Extension des types NextAuth

### 3. Utilitaires et services
- `src/utils/api.ts` - Client API avec authentification automatique
- `src/hooks/useApi.ts` - Hook React pour les appels API
- `src/services/authService.ts` - Service d'authentification centralisé

### 4. Types
- `src/types/api.ts` - Types TypeScript pour l'API

### 5. Exemples
- `src/components/examples/UserProfile.tsx` - Composant exemple

## Configuration requise

### Variables d'environnement

Créez un fichier `.env.local` avec :

```env
# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Backend API
BACKEND_URL=http://localhost:3001

# Database (pour Prisma)
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Utilisation

### 1. Login simple

```tsx
import { AuthService } from '@/services/authService'

const handleLogin = async () => {
  try {
    await AuthService.login({
      email: 'user@example.com',
      password: 'password123'
    })
    // Redirection automatique après connexion
  } catch (error) {
    console.error('Erreur de connexion:', error.message)
  }
}
```

### 2. Appels API avec authentification

```tsx
import { useApi } from '@/hooks/useApi'

function MyComponent() {
  const { data, loading, error, get } = useApi()

  const fetchUsers = () => {
    get('/api/users') // Le token est automatiquement inclus
  }

  return (
    <div>
      {loading && <p>Chargement...</p>}
      {error && <p>Erreur: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}
```

### 3. Client API direct

```tsx
import { ApiClient } from '@/utils/api'

// GET avec authentification
const users = await ApiClient.get('/api/users')

// POST avec données
const newUser = await ApiClient.post('/api/users', {
  username: 'newuser',
  email: 'newuser@example.com'
})

// Sans authentification
const publicData = await ApiClient.get('/api/public', { requireAuth: false })
```

### 4. Vérification de session

```tsx
import { useSession } from 'next-auth/react'

function ProtectedComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <p>Chargement...</p>
  if (!session) return <p>Accès refusé</p>

  return (
    <div>
      <h1>Bienvenue {session.user.name}</h1>
      <p>Rôle: {session.user.role}</p>
      <p>Token: {session.user.accessToken ? '✅' : '❌'}</p>
    </div>
  )
}
```

### 5. CRUD avec hook spécialisé

```tsx
import { useCrudApi } from '@/hooks/useApi'

function UsersManager() {
  const {
    data: users,
    loading,
    error,
    list,
    create,
    update,
    remove
  } = useCrudApi('/api/users')

  const handleCreateUser = async () => {
    await create({
      username: 'newuser',
      email: 'test@example.com'
    })
    list() // Rafraîchir la liste
  }

  return (
    <div>
      <button onClick={list}>Charger les utilisateurs</button>
      <button onClick={handleCreateUser}>Créer un utilisateur</button>
      {/* Affichage des données... */}
    </div>
  )
}
```

## Gestion des erreurs

### Erreurs d'authentification

```tsx
import { AuthService } from '@/services/authService'

try {
  await AuthService.login(credentials)
} catch (error) {
  if (error.message.includes('invalid')) {
    // Identifiants incorrects
  } else {
    // Autre erreur (réseau, serveur, etc.)
  }
}
```

### Erreurs d'API

```tsx
const { data, error, get } = useApi({
  onError: (error) => {
    console.error('Erreur API:', error)
    // Afficher une notification d'erreur
  },
  onSuccess: (data) => {
    console.log('Succès:', data)
    // Afficher une notification de succès
  }
})
```

## Sécurité

### Token JWT
- Le token JWT est automatiquement inclus dans les headers `Authorization: Bearer <token>`
- Le token est stocké dans la session NextAuth (cryptée)
- Expiration automatique après 30 jours (configurable)

### Protection des routes
- Utilisez `useSession` pour protéger les composants
- Le middleware NextAuth peut protéger les routes automatiquement
- Les appels API vérifient automatiquement l'authentification

## Tests

### Test de login

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Test d'API avec token

```bash
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer your-jwt-token"
```

## Dépannage

### Problèmes courants

1. **Token manquant** : Vérifiez que l'utilisateur est connecté avec `useSession`
2. **CORS** : Configurez les headers CORS dans le backend NestJS
3. **Variables d'environnement** : Vérifiez que `BACKEND_URL` est correct
4. **Connexion backend** : Vérifiez que le backend NestJS fonctionne sur le bon port

### Logs de debug

```tsx
// Activer les logs NextAuth
// Ajoutez dans .env.local
DEBUG=1

// Logs de l'API client
console.log('Session:', await getSession())
console.log('Token:', session?.user?.accessToken)
```

## Endpoints disponibles

### Authentification
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/change-password` - Changer le mot de passe

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/:id` - Utilisateur par ID
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

(Ajoutez d'autres endpoints selon votre API backend) 
