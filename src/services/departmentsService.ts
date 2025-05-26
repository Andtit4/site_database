import api from './api';

export enum DepartmentType {
  TRANSMISSION = 'TRANSMISSION',
  ENERGIE = 'ENERGIE',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  INFORMATIQUE = 'INFORMATIQUE',
  SECURITE = 'SECURITE',
}

export interface Department {
  id: string;
  name: string;
  type: string;
  description?: string;
  responsibleName: string;
  contactEmail: string;
  contactPhone?: number;
  isActive: boolean;
  managedEquipmentTypes?: string[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export interface CreateDepartmentDto {
  name: string;
  type: string;
  description?: string;
  responsibleName: string;
  contactEmail: string;
  contactPhone?: number;
  isActive?: boolean;
  managedEquipmentTypes?: string[];
}

export interface UpdateDepartmentDto {
  name?: string;
  type?: string;
  description?: string;
  responsibleName?: string;
  contactEmail?: string;
  contactPhone?: number;
  isActive?: boolean;
  managedEquipmentTypes?: string[];
  isDeleted?: boolean;
}

const departmentsService = {
  getAllDepartments: async (): Promise<Department[]> => {
    const response = await api.get('/departments');
    return response.data;
  },

  getDepartmentById: async (id: string): Promise<Department> => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  createDepartment: async (department: CreateDepartmentDto): Promise<Department> => {
    const response = await api.post('/departments', department);
    return response.data;
  },

  updateDepartment: async (id: string, department: UpdateDepartmentDto): Promise<Department> => {
    const response = await api.put(`/departments/${id}`, department);
    return response.data;
  },

  deleteDepartment: async (id: string): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },

  getDepartmentTeams: async (id: string): Promise<any[]> => {
    const response = await api.get(`/departments/${id}/teams`);
    return response.data;
  },

  getDepartmentEquipment: async (id: string): Promise<any[]> => {
    const response = await api.get(`/departments/${id}/equipment`);
    return response.data;
  }
};

export default departmentsService; 
