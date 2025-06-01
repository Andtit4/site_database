import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DepartmentAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return user && (user.isAdmin || user.isDepartmentAdmin || user.isTeamMember);
  }
}

@Injectable()
export class SpecificDepartmentGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const departmentId = request.params.departmentId || request.body.departmentId;
    
    // Les administrateurs ont accès à tous les départements
    if (user && user.isAdmin) {
      return true;
    }
    
    // Les administrateurs de département et les membres d'équipe ont accès uniquement à leur département
    return user && (user.isDepartmentAdmin || user.isTeamMember) && user.departmentId === departmentId;
  }
}

@Injectable()
export class TeamMemberGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Permet l'accès aux admins, admins de département et membres d'équipe
    return user && (user.isAdmin || user.isDepartmentAdmin || user.isTeamMember);
  }
} 
