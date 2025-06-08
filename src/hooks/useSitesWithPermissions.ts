import { useState, useEffect, useCallback, useMemo } from 'react';

import { sitesService } from '@/services';
import type { Site, SiteFilterDto } from '@/services/sitesService';
import { useAuth } from './useAuth';

interface UseSitesWithPermissionsReturn {
  sites: Site[];
  loading: boolean;
  error: string | null;
  permissionError: boolean;
  refreshSites: (customFilters?: SiteFilterDto) => Promise<void>;
}

interface UseSitesWithPermissionsOptions {
  filters?: SiteFilterDto;
  autoFetch?: boolean;
}

export const useSitesWithPermissions = (
  options: UseSitesWithPermissionsOptions = {}
): UseSitesWithPermissionsReturn => {
  const { filters, autoFetch = true } = options;

  // Stabiliser la référence de filters
  const stableFilters = useMemo(() => filters || {}, [filters]);

  const { 
    user, 
    loading: authLoading 
  } = useAuth();

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(autoFetch); // Ne pas charger si autoFetch est false
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState(false);

  const fetchSites = useCallback(async (customFilters?: SiteFilterDto) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      setPermissionError(false);

      // Vérifier les permissions DIRECTEMENT (pas de fonction séparée)
      const hasAccess = user.isAdmin || 
                       (user.isDepartmentAdmin && user.departmentId) || 
                       (user.isTeamMember && user.departmentId);
      
      if (!hasAccess) {
        console.warn('Accès aux sites refusé - permissions insuffisantes');
        setPermissionError(true);
        setSites([]);
        setLoading(false);
        
return;
      }

      // Construire les filtres selon les permissions
      const finalFilters: SiteFilterDto = { ...stableFilters, ...customFilters };

      // Si l'utilisateur ne peut pas voir toutes les ressources, filtrer par département
      // DIRECTEMENT avec user.isAdmin au lieu de canViewAllResources()
      if (!user.isAdmin) {
        const userDepartmentId = user.departmentId?.toString() || null;

        if (userDepartmentId) {
          finalFilters.departmentId = userDepartmentId;
        } else {
          // Si l'utilisateur n'a pas de département, ne charger aucun site
          setSites([]);
          setLoading(false);
          
return;
        }
      }

      // Le service sitesService gère maintenant les permissions en interne
      const data = await sitesService.getAllSites(finalFilters);

      setSites(data);
      
    } catch (err: any) {
      console.error('Erreur lors de la récupération des sites:', err);
      setError(err.message || 'Erreur lors du chargement des sites');
    } finally {
      setLoading(false);
    }
  }, [user, stableFilters]); // RETIRÉ canViewAllResources et getUserDepartmentId !

  useEffect(() => {
    if (!authLoading && user && autoFetch) {
      fetchSites();
    } else if (!authLoading && !user) {
      // Utilisateur non connecté
      setSites([]);
      setPermissionError(true);
      setLoading(false);
    }
  }, [authLoading, user, autoFetch]); // RETIRÉ fetchSites pour éviter les boucles

  const refreshSites = useCallback(async (customFilters?: SiteFilterDto) => {
    await fetchSites(customFilters);
  }, [fetchSites]);

  return {
    sites,
    loading,
    error,
    permissionError,
    refreshSites,
  };
}; 
