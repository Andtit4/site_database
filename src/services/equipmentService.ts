import api from './api';
import { EquipmentTypes } from './specificationsService';
import specificationsService from './specificationsService';

// Exporter le même enum que celui du service de spécifications pour la cohérence
export { EquipmentTypes } from './specificationsService';

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
  teamId?: string;
  type: string; // Type d'équipement (doit correspondre à un type défini dans EquipmentTypes)
  specifications?: Record<string, any>; // Spécifications dynamiques basées sur le type
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEquipmentDto {
  id: string; // L'API backend attend un ID fourni par le client
  type: string; // Type d'équipement (doit correspondre à un type défini dans EquipmentTypes)
  model: string;
  manufacturer?: string;
  serialNumber?: string;
  installDate: string;
  lastMaintenanceDate?: string;
  status?: string;
  specifications?: Record<string, any>;
  siteId: string;
  departmentId?: string;
  teamId?: string;
}

export interface UpdateEquipmentDto {
  type?: string;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  installDate?: string;
  lastMaintenanceDate?: string;
  status?: string;
  specifications?: Record<string, any>;
  siteId?: string;
  departmentId?: string;
  teamId?: string;
}

export interface EquipmentFilterDto {
  search?: string;
  type?: string[];
  status?: string[];
  siteId?: string;
  departmentId?: string;
}

const equipmentService = {
  getAllEquipment: async (filters?: EquipmentFilterDto): Promise<Equipment[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.type && filters.type.length > 0) {
        filters.type.forEach(type => queryParams.append('type', type));
      }
      if (filters.status && filters.status.length > 0) {
        filters.status.forEach(status => queryParams.append('status', status));
      }
      if (filters.siteId) queryParams.append('siteId', filters.siteId);
      if (filters.departmentId) queryParams.append('departmentId', filters.departmentId);
    }
    
    const url = queryParams.toString() ? `/equipment?${queryParams.toString()}` : '/equipment';
    const response = await api.get(url);
    return response.data;
  },

  getEquipmentById: async (id: string): Promise<Equipment> => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },

  createEquipment: async (equipment: CreateEquipmentDto): Promise<Equipment> => {
    // Générer un ID unique si non fourni
    if (!equipment.id) {
      equipment.id = crypto.randomUUID();
    }
    
    const response = await api.post('/equipment', equipment);
    return response.data;
  },

  updateEquipment: async (id: string, equipment: UpdateEquipmentDto): Promise<Equipment> => {
    const response = await api.patch(`/equipment/${id}`, equipment);
    return response.data;
  },

  deleteEquipment: async (id: string): Promise<void> => {
    await api.delete(`/equipment/${id}`);
  },

  getEquipmentBySite: async (siteId: string): Promise<Equipment[]> => {
    return equipmentService.getAllEquipment({ siteId });
  },

  getEquipmentByDepartment: async (departmentId: string): Promise<Equipment[]> => {
    return equipmentService.getAllEquipment({ departmentId });
  },

  getEquipmentByType: async (type: string): Promise<Equipment[]> => {
    return equipmentService.getAllEquipment({ type: [type] });
  },

  getEquipmentStatistics: async (): Promise<any> => {
    const response = await api.get('/equipment/statistics');
    return response.data;
  },

  // Récupérer les spécifications d'un type d'équipement
  getSpecificationsForType: async (equipmentType: string): Promise<any[]> => {
    try {
      const specifications = await specificationsService.getSpecificationsByType(equipmentType);
      return specifications;
    } catch (error) {
      console.error(`Erreur lors de la récupération des spécifications pour ${equipmentType}:`, error);
      return [];
    }
  }
};

export default equipmentService; 
