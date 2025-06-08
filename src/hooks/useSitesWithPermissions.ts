import { useState, useEffect } from 'react';

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

  const { 
    user, 
    loading: authLoading, 
    canViewAllResources, 
    getUserDepartmentId 
  } = useAuth();

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState(false);

  // Fonction pour vérifier si l'utilisateur peut accéder aux sites
  const canAccessSites = (): boolean => {
    if (!user) return false;
    
    // Les ADMIN ont accès à tout
    if (user.isAdmin) return true;
    
    // Les DEPARTMENT_ADMIN et TEAM_MEMBER ont accès aux sites de leur département
    if ((user.isDepartmentAdmin || user.isTeamMember) && user.departmentId) {
      return true;
    }
    
    return false;
  };

  const fetchSites = async (customFilters?: SiteFilterDto) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      setPermissionError(false);

      // Vérifier les permissions avant de faire l'appel
      if (!canAccessSites()) {
        console.warn('Accès aux sites refusé - permissions insuffisantes');
        setPermissionError(true);
        setSites([]);
        setLoading(false);
        
return;
      }

      // Construire les filtres selon les permissions
      const finalFilters: SiteFilterDto = { ...filters, ...customFilters };

      // Si l'utilisateur ne peut pas voir toutes les ressources, filtrer par département
      if (!canViewAllResources()) {
        const userDepartmentId = getUserDepartmentId();

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
  };

  useEffect(() => {
    if (!authLoading && user && autoFetch) {
      fetchSites();
    } else if (!authLoading && !user) {
      // Utilisateur non connecté
      setSites([]);
      setPermissionError(true);
      setLoading(false);
    }
  }, [authLoading, user, autoFetch]); // Retiré JSON.stringify(filters) qui cause des re-renders

  const refreshSites = async (customFilters?: SiteFilterDto) => {
    await fetchSites(customFilters);
  };

  return {
    sites,
    loading,
    error,
    permissionError,
    refreshSites,
  };
}; 
