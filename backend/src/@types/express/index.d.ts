import { User } from '../../entities/user.entity';

declare namespace Express {
  export interface Request {
    user: {
      userId: string;
      username: string;
      isAdmin: boolean;
      isDepartmentAdmin: boolean;
      departmentId: string;
      [key: string]: any;
    };
  }
} 