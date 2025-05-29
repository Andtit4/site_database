import api from './api';

// Définition des interfaces basées sur la structure du backend
export interface SiteSpecification {
  id: string;
  siteType: string;
  columns: SiteColumnDefinition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteColumnDefinition {
  name: string;
  type: string;
  length?: number;
  nullable?: boolean;
  defaultValue?: string;
}

export interface CreateSiteSpecificationDto {
  siteType: string;
  columns: SiteColumnDefinition[];
}

export interface UpdateSiteSpecificationDto {
  siteType?: string;
  columns?: SiteColumnDefinition[];
}

// Types de sites supportés par le backend
export enum SiteTypes {
  TOUR = 'TOUR',
  SHELTER = 'SHELTER',
  PYLONE = 'PYLONE',
  BATIMENT = 'BATIMENT',
  TOIT_BATIMENT = 'TOIT_BATIMENT',
  ROOFTOP = 'ROOFTOP',
  TERRAIN_BAILLE = 'TERRAIN_BAILLE',
  TERRAIN_PROPRIETAIRE = 'TERRAIN_PROPRIETAIRE',
  AUTRE = 'AUTRE'
}

// Types de colonnes SQL supportés (identiques à ceux des équipements)
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

const siteSpecificationsService = {
  getAllSiteSpecifications: async (): Promise<SiteSpecification[]> => {
    try {
      const response = await api.get('/site-specifications');

      
return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des spécifications de sites:', error);
      throw new Error('Impossible de récupérer les spécifications de sites');
    }
  },

  getSiteSpecificationsByType: async (siteType: string): Promise<SiteSpecification[]> => {
    try {
      const response = await api.get(`/site-specifications/type/${siteType}`);

      
return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des spécifications pour le type de site ${siteType}:`, error);
      throw new Error(`Impossible de récupérer les spécifications pour le type de site ${siteType}`);
    }
  },

  getSiteSpecificationById: async (id: string): Promise<SiteSpecification> => {
    try {
      const response = await api.get(`/site-specifications/${id}`);

      
return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la spécification de site ${id}:`, error);
      throw new Error(`Spécification de site avec l'ID ${id} non trouvée`);
    }
  },

  createSiteSpecification: async (specification: CreateSiteSpecificationDto): Promise<SiteSpecification> => {
    try {
      const response = await api.post('/site-specifications', specification);

      
return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la spécification de site:', error);
      throw new Error('Impossible de créer la spécification de site');
    }
  },

  updateSiteSpecification: async (id: string, specification: UpdateSiteSpecificationDto): Promise<SiteSpecification> => {
    try {
      const response = await api.put(`/site-specifications/${id}`, specification);

      
return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la spécification de site ${id}:`, error);
      throw new Error(`Impossible de mettre à jour la spécification de site ${id}`);
    }
  },

  deleteSiteSpecification: async (id: string): Promise<void> => {
    try {
      await api.delete(`/site-specifications/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la spécification de site ${id}:`, error);
      throw new Error(`Impossible de supprimer la spécification de site ${id}`);
    }
  },

  // Méthode pour obtenir les spécifications d'un site spécifique
  getSpecificationsForSite: async (siteId: string): Promise<any> => {
    try {
      const response = await api.get(`/sites/${siteId}/specifications`);

      
return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des spécifications pour le site ${siteId}:`, error);
      throw new Error(`Impossible de récupérer les spécifications pour le site ${siteId}`);
    }
  },

  // Méthode pour mettre à jour les spécifications d'un site spécifique
  updateSpecificationsForSite: async (siteId: string, specifications: any): Promise<any> => {
    try {
      const response = await api.patch(`/sites/${siteId}/specifications`, specifications);

      
return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour des spécifications pour le site ${siteId}:`, error);
      throw new Error(`Impossible de mettre à jour les spécifications pour le site ${siteId}`);
    }
  }
};

export default siteSpecificationsService; 
