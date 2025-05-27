import api from './api';

// Définition des interfaces basées sur la structure du backend
export interface Specification {
  id: string;
  equipmentType: string;
  columns: ColumnDefinition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ColumnDefinition {
  name: string;
  type: string;
  length?: number;
  nullable?: boolean;
  defaultValue?: string;
}

export interface CreateSpecificationDto {
  equipmentType: string;
  columns: ColumnDefinition[];
}

export interface UpdateSpecificationDto {
  equipmentType?: string;
  columns?: ColumnDefinition[];
}

// Types d'équipements supportés par le backend
export enum EquipmentTypes {
  ANTENNE = 'ANTENNE',
  ROUTEUR = 'ROUTEUR',
  BATTERIE = 'BATTERIE',
  GÉNÉRATEUR = 'GÉNÉRATEUR',
  REFROIDISSEMENT = 'REFROIDISSEMENT',
  SHELTER = 'SHELTER',
  PYLÔNE = 'PYLÔNE',
  SÉCURITÉ = 'SÉCURITÉ'
}

// Types de colonnes SQL supportés
export enum ColumnTypes {
  VARCHAR = 'varchar',
  INTEGER = 'int',
  FLOAT = 'float',
  DECIMAL = 'decimal',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  TEXT = 'text'
}

const specificationsService = {
  getAllSpecifications: async (): Promise<Specification[]> => {
    try {
      const response = await api.get('/specifications');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des spécifications:', error);
      throw new Error('Impossible de récupérer les spécifications');
    }
  },

  getSpecificationsByType: async (equipmentType: string): Promise<Specification[]> => {
    try {
      const response = await api.get(`/specifications/type/${equipmentType}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des spécifications pour ${equipmentType}:`, error);
      throw new Error(`Impossible de récupérer les spécifications pour ${equipmentType}`);
    }
  },

  getSpecificationById: async (id: string): Promise<Specification> => {
    try {
      const response = await api.get(`/specifications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la spécification ${id}:`, error);
      throw new Error(`Spécification avec l'ID ${id} non trouvée`);
    }
  },

  createSpecification: async (specification: CreateSpecificationDto): Promise<Specification> => {
    try {
      const response = await api.post('/specifications', specification);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la spécification:', error);
      throw new Error('Impossible de créer la spécification');
    }
  },

  updateSpecification: async (id: string, specification: UpdateSpecificationDto): Promise<Specification> => {
    try {
      const response = await api.put(`/specifications/${id}`, specification);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la spécification ${id}:`, error);
      throw new Error(`Impossible de mettre à jour la spécification ${id}`);
    }
  },

  deleteSpecification: async (id: string): Promise<void> => {
    try {
      await api.delete(`/specifications/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la spécification ${id}:`, error);
      throw new Error(`Impossible de supprimer la spécification ${id}`);
    }
  }
};

export default specificationsService; 
