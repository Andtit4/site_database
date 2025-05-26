import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class DepartmentAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return user && (user.isAdmin || user.isDepartmentAdmin);
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
    
    // Les administrateurs de département ont accès uniquement à leur département
    return user && user.isDepartmentAdmin && user.departmentId === departmentId;
  }
} 