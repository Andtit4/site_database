import type { User } from './authService';

export enum UserRole {
  ADMIN = 'ADMIN',
  DEPARTMENT_ADMIN = 'DEPARTMENT_ADMIN',
  TEAM_MEMBER = 'TEAM_MEMBER'
}

export enum Permission {

  // Permissions sites
  VIEW_ALL_SITES = 'VIEW_ALL_SITES',
  VIEW_DEPARTMENT_SITES = 'VIEW_DEPARTMENT_SITES',
  CREATE_SITE = 'CREATE_SITE',
  EDIT_SITE = 'EDIT_SITE',
  DELETE_SITE = 'DELETE_SITE',
  
  // Permissions spécifications
  VIEW_SITE_SPECIFICATIONS = 'VIEW_SITE_SPECIFICATIONS',
  EDIT_SITE_SPECIFICATIONS = 'EDIT_SITE_SPECIFICATIONS',
  
  // Permissions équipes
  VIEW_ALL_TEAMS = 'VIEW_ALL_TEAMS',
  VIEW_DEPARTMENT_TEAMS = 'VIEW_DEPARTMENT_TEAMS',
  CREATE_TEAM = 'CREATE_TEAM',
  EDIT_TEAM = 'EDIT_TEAM',
  DELETE_TEAM = 'DELETE_TEAM',
  
  // Permissions équipements
  VIEW_ALL_EQUIPMENT = 'VIEW_ALL_EQUIPMENT',
  VIEW_DEPARTMENT_EQUIPMENT = 'VIEW_DEPARTMENT_EQUIPMENT',
  CREATE_EQUIPMENT = 'CREATE_EQUIPMENT',
  EDIT_EQUIPMENT = 'EDIT_EQUIPMENT',
  DELETE_EQUIPMENT = 'DELETE_EQUIPMENT',
}

// Mapping des rôles aux permissions
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Accès total à tout
    Permission.VIEW_ALL_SITES,
    Permission.CREATE_SITE,
    Permission.EDIT_SITE,
    Permission.DELETE_SITE,
    Permission.VIEW_SITE_SPECIFICATIONS,
    Permission.EDIT_SITE_SPECIFICATIONS,
    Permission.VIEW_ALL_TEAMS,
    Permission.CREATE_TEAM,
    Permission.EDIT_TEAM,
    Permission.DELETE_TEAM,
    Permission.VIEW_ALL_EQUIPMENT,
    Permission.CREATE_EQUIPMENT,
    Permission.EDIT_EQUIPMENT,
    Permission.DELETE_EQUIPMENT,
  ],
  [UserRole.DEPARTMENT_ADMIN]: [
    // Accès aux ressources du département
    Permission.VIEW_DEPARTMENT_SITES,
    Permission.CREATE_SITE,
    Permission.EDIT_SITE,
    Permission.DELETE_SITE,
    Permission.VIEW_SITE_SPECIFICATIONS,
    Permission.EDIT_SITE_SPECIFICATIONS,
    Permission.VIEW_DEPARTMENT_TEAMS,
    Permission.CREATE_TEAM,
    Permission.EDIT_TEAM,
    Permission.DELETE_TEAM,
    Permission.VIEW_DEPARTMENT_EQUIPMENT,
    Permission.CREATE_EQUIPMENT,
    Permission.EDIT_EQUIPMENT,
    Permission.DELETE_EQUIPMENT,
  ],
  [UserRole.TEAM_MEMBER]: [
    // Accès limité aux équipements de leur département
    Permission.VIEW_DEPARTMENT_SITES,
    Permission.VIEW_DEPARTMENT_TEAMS,
    Permission.VIEW_DEPARTMENT_EQUIPMENT,
  ]
};

class PermissionsService {
  /**
   * Détermine le rôle principal de l'utilisateur
   */
  private getUserRole(user: User): UserRole {
    if (user.isAdmin) return UserRole.ADMIN;
    if (user.isDepartmentAdmin) return UserRole.DEPARTMENT_ADMIN;
    if (user.isTeamMember) return UserRole.TEAM_MEMBER;
    
    // Par défaut, membre d'équipe
    return UserRole.TEAM_MEMBER;
  }

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  hasPermission(user: User | null, permission: Permission): boolean {
    if (!user) return false;
    
    const userRole = this.getUserRole(user);
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    
    return rolePermissions.includes(permission);
  }

  /**
   * Vérifie si l'utilisateur peut voir toutes les ressources ou seulement celles de son département
   */
  canViewAllResources(user: User | null): boolean {
    if (!user) return false;

    return this.hasPermission(user, Permission.VIEW_ALL_SITES);
  }

  /**
   * Retourne l'ID du département de l'utilisateur si applicable
   */
  getUserDepartmentId(user: User | null): string | null {
    if (!user) return null;

    return user.departmentId || null;
  }

  /**
   * Retourne l'ID de l'équipe de l'utilisateur si applicable
   */
  getUserTeamId(user: User | null): string | null {
    if (!user) return null;

    return user.teamId || null;
  }

  /**
   * Vérifie si l'utilisateur peut accéder à une ressource d'un département spécifique
   */
  canAccessDepartmentResource(user: User | null, resourceDepartmentId: string | null): boolean {
    if (!user) return false;
    
    // Admin peut tout voir
    if (this.hasPermission(user, Permission.VIEW_ALL_SITES)) {
      return true;
    }
    
    // Les autres ne peuvent voir que les ressources de leur département
    const userDepartmentId = this.getUserDepartmentId(user);

    if (!userDepartmentId || !resourceDepartmentId) {
      return false;
    }
    
    return userDepartmentId === resourceDepartmentId;
  }

  /**
   * Vérifie si l'utilisateur peut voir l'onglet spécifications
   */
  canViewSpecifications(user: User | null): boolean {
    if (!user) return false;

    return this.hasPermission(user, Permission.VIEW_SITE_SPECIFICATIONS);
  }

  /**
   * Retourne les permissions de l'utilisateur
   */
  getUserPermissions(user: User | null): Permission[] {
    if (!user) return [];
    
    const userRole = this.getUserRole(user);

    return ROLE_PERMISSIONS[userRole] || [];
  }

  /**
   * Vérifie si l'utilisateur peut créer des ressources
   */
  canCreate(user: User | null, resourceType: 'site' | 'team' | 'equipment'): boolean {
    if (!user) return false;
    
    switch (resourceType) {
      case 'site':
        return this.hasPermission(user, Permission.CREATE_SITE);
      case 'team':
        return this.hasPermission(user, Permission.CREATE_TEAM);
      case 'equipment':
        return this.hasPermission(user, Permission.CREATE_EQUIPMENT);
      default:
        return false;
    }
  }

  /**
   * Vérifie si l'utilisateur peut modifier des ressources
   */
  canEdit(user: User | null, resourceType: 'site' | 'team' | 'equipment'): boolean {
    if (!user) return false;
    
    switch (resourceType) {
      case 'site':
        return this.hasPermission(user, Permission.EDIT_SITE);
      case 'team':
        return this.hasPermission(user, Permission.EDIT_TEAM);
      case 'equipment':
        return this.hasPermission(user, Permission.EDIT_EQUIPMENT);
      default:
        return false;
    }
  }

  /**
   * Vérifie si l'utilisateur peut supprimer des ressources
   */
  canDelete(user: User | null, resourceType: 'site' | 'team' | 'equipment'): boolean {
    if (!user) return false;
    
    switch (resourceType) {
      case 'site':
        return this.hasPermission(user, Permission.DELETE_SITE);
      case 'team':
        return this.hasPermission(user, Permission.DELETE_TEAM);
      case 'equipment':
        return this.hasPermission(user, Permission.DELETE_EQUIPMENT);
      default:
        return false;
    }
  }
}

export const permissionsService = new PermissionsService();
export default permissionsService; 
