import Cookies from 'js-cookie';

import api from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isAdmin: boolean;
  isDepartmentAdmin: boolean;
  isTeamMember: boolean;
  isActive: boolean;
  isDeleted: boolean;
  hasDepartmentRights: boolean;
  managedEquipmentTypes?: string[];
  lastLogin?: Date;
  departmentId?: string;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterUserDto {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isAdmin?: boolean;
  isDepartmentAdmin?: boolean;
  isTeamMember?: boolean;
  hasDepartmentRights?: boolean;
  managedEquipmentTypes?: string[];
  departmentId?: string;
  teamId?: string;
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isAdmin?: boolean;
  isDepartmentAdmin?: boolean;
  isTeamMember?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  hasDepartmentRights?: boolean;
  managedEquipmentTypes?: string[];
  departmentId?: string;
  teamId?: string;
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', credentials);
    const { user, token } = response.data;
    
    // Stocker le token dans localStorage et cookies
    localStorage.setItem('token', token);
    Cookies.set('token', token, { expires: 7 }); // Expire dans 7 jours
    
    return { user, token };
  },

  register: async (userData: RegisterUserDto): Promise<User> => {
    const response = await api.post('/auth/register', userData);

    
return response.data;
  },

  logout: (): void => {
    // Supprimer le token du localStorage et des cookies
    localStorage.removeItem('token');
    Cookies.remove('token');
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Vérifier d'abord si un token existe avant de faire la requête
      const token = localStorage.getItem('token') || Cookies.get('token');

      if (!token) {
        return null; // Pas de token, donc pas d'utilisateur connecté
      }

      // Essayer la requête
      const response = await api.get('/auth/me');

      
return response.data;
    } catch (error: any) {
      // Si erreur 401, supprimer les tokens invalides
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        Cookies.remove('token');
      }
      
      // Renvoyer null dans tous les cas d'erreur
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token') || !!Cookies.get('token');
  },

  updateUser: async (id: string, userData: UpdateUserDto): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);

    
return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');

    
return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);

    
return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};

export default authService; 
