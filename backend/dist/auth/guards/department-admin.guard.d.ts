import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class DepartmentAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
export declare class SpecificDepartmentGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
