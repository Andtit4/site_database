'use client'

import { useState, useEffect, useCallback } from 'react'

import authService, { type User } from '@/services/authService'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('useAuth: Initialisation du hook')
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    console.log('useAuth: Début de l\'initialisation auth')
    
    try {
      // D'abord, vérifier s'il y a un token
      const hasToken = authService.isAuthenticated()

      console.log('useAuth: Token trouvé:', hasToken)
      
      if (!hasToken) {
        console.log('useAuth: Aucun token, utilisateur non connecté')
        setUser(null)
        setLoading(false)

        return
      }

      // Utiliser d'abord le cache si disponible pour éviter un écran de chargement
      const cachedUser = authService.getCachedUser()

      if (cachedUser) {
        console.log('useAuth: Utilisateur trouvé en cache:', cachedUser.username)
        setUser(cachedUser)
      }

      // Puis vérifier avec le serveur en arrière-plan
      console.log('useAuth: Vérification avec le serveur...')
      const currentUser = await authService.getCurrentUser()
      
      if (currentUser) {
        console.log('useAuth: Utilisateur confirmé par le serveur:', currentUser.username)
        setUser(currentUser)
      } else {
        console.log('useAuth: Aucun utilisateur retourné par le serveur')
        setUser(null)
      }
    } catch (error: any) {
      console.error('useAuth: Erreur lors de l\'initialisation:', error.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const { user: loggedInUser } = await authService.login(credentials)

      setUser(loggedInUser)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  // Fonctions de permissions
  const canViewAllResources = useCallback((): boolean => {
    if (!user) return false
    return user.isAdmin
  }, [user?.isAdmin])

  const canViewSpecifications = useCallback((): boolean => {
    if (!user) return false
    return user.isAdmin || user.isDepartmentAdmin
  }, [user?.isAdmin, user?.isDepartmentAdmin])

  // Nouvelle fonction : Accès à la gestion des utilisateurs (ADMIN seulement)
  const canManageUsers = useCallback((): boolean => {
    if (!user) return false
    return user.isAdmin // Seuls les ADMIN globaux peuvent gérer les utilisateurs
  }, [user?.isAdmin])

  // Nouvelle fonction : Accès aux spécifications de sites
  const canViewSiteSpecifications = useCallback((): boolean => {
    if (!user) return false
    return user.isAdmin // Seuls les ADMIN globaux peuvent voir les spécifications de sites
  }, [user?.isAdmin])

  // Nouvelle fonction : Accès aux spécifications d'équipements de son département
  const canViewEquipmentSpecifications = useCallback((): boolean => {
    if (!user) return false
    return user.isAdmin || user.isDepartmentAdmin // ADMIN et DEPARTMENT_ADMIN
  }, [user?.isAdmin, user?.isDepartmentAdmin])

  // Nouvelle fonction : Filtrer les utilisateurs selon le département
  const canViewUser = useCallback((userDepartmentId?: string | null): boolean => {
    if (!user) return false
    
    // Les ADMIN peuvent voir tous les utilisateurs
    if (user.isAdmin) return true
    
    // Les DEPARTMENT_ADMIN ne voient que les utilisateurs de leur département
    if (user.isDepartmentAdmin && user.departmentId) {
      return userDepartmentId === user.departmentId?.toString()
    }
    
    return false
  }, [user?.isAdmin, user?.isDepartmentAdmin, user?.departmentId])

  const canCreate = useCallback((resourceType: 'site' | 'team' | 'equipment'): boolean => {
    if (!user) return false
    
    switch (resourceType) {
      case 'site':
        return user.isAdmin || user.isDepartmentAdmin
      case 'team':
        return user.isAdmin
      case 'equipment':
        return user.isAdmin || user.isDepartmentAdmin || user.isTeamMember
      default:
        return false
    }
  }, [user?.isAdmin, user?.isDepartmentAdmin, user?.isTeamMember])

  const canEdit = useCallback((resourceType: 'site' | 'team' | 'equipment'): boolean => {
    if (!user) return false
    
    switch (resourceType) {
      case 'site':
        return user.isAdmin || user.isDepartmentAdmin
      case 'team':
        return user.isAdmin
      case 'equipment':
        return user.isAdmin || user.isDepartmentAdmin || user.isTeamMember
      default:
        return false
    }
  }, [user?.isAdmin, user?.isDepartmentAdmin, user?.isTeamMember])

  const canDelete = useCallback((resourceType: 'site' | 'team' | 'equipment'): boolean => {
    if (!user) return false
    
    switch (resourceType) {
      case 'site':
        return user.isAdmin
      case 'team':
        return user.isAdmin
      case 'equipment':
        return user.isAdmin || user.isDepartmentAdmin
      default:
        return false
    }
  }, [user?.isAdmin, user?.isDepartmentAdmin])

  const getUserDepartmentId = useCallback((): string | null => {
    return user?.departmentId?.toString() || null
  }, [user?.departmentId])

  const getUserTeamId = useCallback((): string | null => {
    return user?.teamId?.toString() || null
  }, [user?.teamId])

  const canAccessDepartmentResource = useCallback((resourceDepartmentId: string | null): boolean => {
    if (!user) return false
    
    // Les admins ont accès à tout
    if (user.isAdmin) return true
    
    // Si pas de département spécifié pour la ressource, accès autorisé
    if (!resourceDepartmentId) return true
    
    // Vérifier si l'utilisateur a accès au département de la ressource
    return user.departmentId?.toString() === resourceDepartmentId
  }, [user?.isAdmin, user?.departmentId])

  return {
    user,
    loading,
    login,
    logout,
    // Propriétés dérivées
    isAuthenticated: !!user,
    // Fonctions de permissions
    canViewAllResources,
    canViewSpecifications,
    canCreate,
    canEdit,
    canDelete,
    getUserDepartmentId,
    getUserTeamId,
    canAccessDepartmentResource,
    // Nouvelles fonctions de permissions
    canManageUsers,
    canViewSiteSpecifications,
    canViewEquipmentSpecifications,
    canViewUser
  }
}

export default useAuth 
