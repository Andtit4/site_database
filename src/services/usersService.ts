import api from './api';
import { User, RegisterUserDto, UpdateUserDto } from './authService';

export interface CreateUserDto extends RegisterUserDto {
  // Hérite de RegisterUserDto du authService
}

class UsersService {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }

  async createAdmin(adminData: CreateUserDto): Promise<User> {
    const response = await api.post('/auth/admin/create', adminData);
    return response.data;
  }

  async createDepartmentUser(userData: CreateUserDto): Promise<User> {
    const response = await api.post('/auth/department/create', userData);
    return response.data;
  }
}

const usersService = new UsersService();
export default usersService; 
