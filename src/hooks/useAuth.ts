import { useEffect, useState } from 'react';
import authService, { User } from '@/services/authService';
import permissionsService, { Permission } from '@/services/permissionsService';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
  canViewAllResources: () => boolean;
  canViewSpecifications: () => boolean;
  canCreate: (resourceType: 'site' | 'team' | 'equipment') => boolean;
  canEdit: (resourceType: 'site' | 'team' | 'equipment') => boolean;
  canDelete: (resourceType: 'site' | 'team' | 'equipment') => boolean;
  getUserDepartmentId: () => string | null;
  getUserTeamId: () => string | null;
  canAccessDepartmentResource: (resourceDepartmentId: string | null) => boolean;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      // D'abord essayer de récupérer depuis localStorage
      const userString = localStorage.getItem('user');
      if (userString) {
        const cachedUser = JSON.parse(userString);
        setUser(cachedUser);
      }
      
      // Puis vérifier avec le serveur
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        // Mettre à jour localStorage
        localStorage.setItem('user', JSON.stringify(currentUser));
      } else {
        // Si pas d'utilisateur du serveur, nettoyer
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur actuel:', error);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    await fetchCurrentUser();
  };

  const hasPermission = (permission: Permission): boolean => {
    return permissionsService.hasPermission(user, permission);
  };

  const canViewAllResources = (): boolean => {
    return permissionsService.canViewAllResources(user);
  };

  const canViewSpecifications = (): boolean => {
    return permissionsService.canViewSpecifications(user);
  };

  const canCreate = (resourceType: 'site' | 'team' | 'equipment'): boolean => {
    return permissionsService.canCreate(user, resourceType);
  };

  const canEdit = (resourceType: 'site' | 'team' | 'equipment'): boolean => {
    return permissionsService.canEdit(user, resourceType);
  };

  const canDelete = (resourceType: 'site' | 'team' | 'equipment'): boolean => {
    return permissionsService.canDelete(user, resourceType);
  };

  const getUserDepartmentId = (): string | null => {
    return permissionsService.getUserDepartmentId(user);
  };

  const getUserTeamId = (): string | null => {
    return permissionsService.getUserTeamId(user);
  };

  const canAccessDepartmentResource = (resourceDepartmentId: string | null): boolean => {
    return permissionsService.canAccessDepartmentResource(user, resourceDepartmentId);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    hasPermission,
    canViewAllResources,
    canViewSpecifications,
    canCreate,
    canEdit,
    canDelete,
    getUserDepartmentId,
    getUserTeamId,
    canAccessDepartmentResource,
    refreshUser,
  };
}; 
