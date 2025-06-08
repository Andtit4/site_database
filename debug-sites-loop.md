# Debug - Boucle infinie dans SitesPage

## Problème résolu
❌ **Erreur**: `Maximum update depth exceeded` dans SitesPage.useEffect

## Cause identifiée
La boucle infinie était causée par des fonctions qui changeaient de référence à chaque render, créant des dépendances instables dans les useEffect.

## Corrections apportées

### 1. Stabilisation des fonctions dans useSitesWithPermissions.ts
```tsx
// Ajout useCallback pour canAccessSites
const canAccessSites = useCallback((): boolean => {
  // ...logique
}, [user]);

// Ajout useCallback pour fetchSites 
const fetchSites = useCallback(async (customFilters?: SiteFilterDto) => {
  // ...logique
}, [user, canViewAllResources, getUserDepartmentId, stableFilters, canAccessSites]);

// Ajout useCallback pour refreshSites
const refreshSites = useCallback(async (customFilters?: SiteFilterDto) => {
  await fetchSites(customFilters);
}, [fetchSites]);

// Stabilisation des filters avec useMemo
const stableFilters = useMemo(() => filters || {}, [filters]);
```

### 2. Stabilisation d'applyFilters dans SitesPage
```tsx
const applyFilters = useCallback((sitesToFilter: Site[]) => {
  // ...logique de filtrage
  setFilteredSites(result);
  setPage(1);
}, [filterValues]);
```

### 3. Dépendances corrigées
- `refreshSites` maintenant stable grâce à useCallback
- `applyFilters` stable et optimisée
- `filters` stabilisé avec useMemo

## Comment tester
1. Se connecter en tant que chef de département
2. Aller sur `/fr/dashboard/sites`
3. Vérifier qu'il n'y a plus d'erreur dans la console
4. Tester les filtres et la pagination

## Fichiers modifiés
- `src/hooks/useSitesWithPermissions.ts` - Stabilisation des fonctions
- `src/app/[lang]/dashboard/sites/page.tsx` - Optimisation applyFilters 
