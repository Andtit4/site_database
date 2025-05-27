import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true; // Si aucun rôle n'est requis, autoriser l'accès
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // Vérifier si l'utilisateur a l'un des rôles requis
    return requiredRoles.some((role) => {
      if (role === 'admin' && user.isAdmin) return true;
      if (role === 'user') return true; // Tous les utilisateurs authentifiés ont le rôle 'user'
      if (role === 'department-admin' && user.isDepartmentAdmin) return true;
      return false;
    });
  }
} 
