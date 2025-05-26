import api from './api';

export enum EquipmentType {
  ANTENNA = 'ANTENNE',
  ROUTER = 'ROUTEUR',
  BATTERY = 'BATTERIE',
  GENERATOR = 'GÉNÉRATEUR',
  COOLING = 'REFROIDISSEMENT',
  SHELTER = 'SHELTER',
  TOWER = 'PYLÔNE',
  SECURITY = 'SÉCURITÉ',
}

export enum EquipmentStatus {
  ACTIVE = 'ACTIF',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIF',
  PLANNED = 'PLANIFIÉ',
  UNDER_INSTALLATION = 'EN_INSTALLATION',
}

export interface Equipment {
  id: string;
  name: string;
  description?: string;
  model?: string;
  serialNumber?: string;
  manufacturer?: string;
  purchaseDate?: Date;
  installDate?: Date;
  lastMaintenanceDate?: Date;
  status: string;
  location?: string;
  purchasePrice?: number;
  warrantyExpiration?: Date;
  ipAddress?: string;
  macAddress?: string;
  isDeleted: boolean;
  siteId: string;
  departmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEquipmentDto {
  name: string;
  description?: string;
  model?: string;
  serialNumber?: string;
  manufacturer?: string;
  purchaseDate?: Date;
  installDate?: Date;
  lastMaintenanceDate?: Date;
  status?: string;
  location?: string;
  purchasePrice?: number;
  warrantyExpiration?: Date;
  ipAddress?: string;
  macAddress?: string;
  siteId: string;
  departmentId?: string;
}

export interface UpdateEquipmentDto {
  name?: string;
  description?: string;
  model?: string;
  serialNumber?: string;
  manufacturer?: string;
  purchaseDate?: Date;
  installDate?: Date;
  lastMaintenanceDate?: Date;
  status?: string;
  location?: string;
  purchasePrice?: number;
  warrantyExpiration?: Date;
  ipAddress?: string;
  macAddress?: string;
  siteId?: string;
  departmentId?: string;
  isDeleted?: boolean;
}

const equipmentService = {
  getAllEquipment: async (): Promise<Equipment[]> => {
    const response = await api.get('/equipment');
    return response.data;
  },

  getEquipmentById: async (id: string): Promise<Equipment> => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },

  createEquipment: async (equipment: CreateEquipmentDto): Promise<Equipment> => {
    const response = await api.post('/equipment', equipment);
    return response.data;
  },

  updateEquipment: async (id: string, equipment: UpdateEquipmentDto): Promise<Equipment> => {
    const response = await api.put(`/equipment/${id}`, equipment);
    return response.data;
  },

  deleteEquipment: async (id: string): Promise<void> => {
    await api.delete(`/equipment/${id}`);
  },

  getEquipmentBySite: async (siteId: string): Promise<Equipment[]> => {
    const response = await api.get(`/equipment/site/${siteId}`);
    return response.data;
  },

  getEquipmentByDepartment: async (departmentId: string): Promise<Equipment[]> => {
    const response = await api.get(`/equipment/department/${departmentId}`);
    return response.data;
  }
};

export default equipmentService; 
