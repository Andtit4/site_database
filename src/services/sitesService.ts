import api from './api';

// Statuts possibles d'un site
export enum SiteStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
  DELETED = 'DELETED',
}

export enum region {
  MARITIME = 'MARITIME',
  CENTRALE = 'CENTRALE',
  LOME = 'LOME',
  KARA = 'KARA',
  DAPAONG = 'DAPAONG',
  SAVANE = 'SAVANE',
  PLATEAUX = 'PLATEAUX',
}

export interface Site {
  id: string;
  name: string;
  region: string;
  zone?: string;
  longitude: number;
  latitude: number;
  status: string;
  oldBase?: string;
  newBase?: string;
  type?: string; // Type de site pour les spécifications dynamiques
  specifications?: Record<string, any>; // Spécifications dynamiques
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSiteDto {
  id: string;
  name: string;
  region: string;
  longitude: number;
  latitude: number;
  status?: string;
  oldBase?: string;
  newBase?: string;
  type?: string; // Type de site pour les spécifications dynamiques
  specifications?: Record<string, any>; // Spécifications dynamiques
}

export interface UpdateSiteDto {
  name?: string;
  region?: string;
  zone?: string;
  longitude?: number;
  latitude?: number;
  status?: string;
  oldBase?: string;
  newBase?: string;
  type?: string; // Type de site pour les spécifications dynamiques
  specifications?: Record<string, any>; // Spécifications dynamiques
}

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const sitesService = {
  getAllSites: async (showDeleted: boolean = false): Promise<Site[]> => {
    try {
      const params = showDeleted ? { includeDeleted: true } : {};
      const response = await api.get('/sites', { params });
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des sites:', error);
      throw new ApiError(
        'Impossible de récupérer la liste des sites. Veuillez réessayer plus tard.',
        error.response?.status || 500
      );
    }
  },

  getSiteById: async (id: string): Promise<Site> => {
    try {
      const response = await api.get(`/sites/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new ApiError(`Le site avec l'ID ${id} n'existe pas.`, 404);
      }
      console.error(`Erreur lors de la récupération du site ${id}:`, error);
      throw new ApiError(
        `Impossible de récupérer les informations du site ${id}.`,
        error.response?.status || 500
      );
    }
  },

  createSite: async (site: CreateSiteDto): Promise<Site> => {
    try {
      const response = await api.post('/sites', site);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new ApiError(`Un site avec l'ID ${site.id} existe déjà.`, 409);
      }
      console.error('Erreur lors de la création du site:', error);
      throw new ApiError(
        'Impossible de créer le site. Veuillez vérifier les informations saisies.',
        error.response?.status || 500
      );
    }
  },

  updateSite: async (id: string, site: UpdateSiteDto): Promise<Site> => {
    try {
      // Ne pas vérifier d'abord si le site existe, car cela entraîne une double requête
      // Effectuer directement la mise à jour avec PATCH (mise à jour partielle)
      const response = await api.patch(`/sites/${id}`, site);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new ApiError(`Le site avec l'ID ${id} n'existe pas.`, 404);
      }
      console.error(`Erreur lors de la mise à jour du site ${id}:`, error);
      throw new ApiError(
        `Impossible de mettre à jour le site ${id}.`,
        error.response?.status || 500
      );
    }
  },

  deleteSite: async (id: string): Promise<void> => {
    try {
      // Ne pas vérifier d'abord si le site existe, car cela entraîne une double requête
      // Effectuer directement la suppression
      await api.delete(`/sites/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new ApiError(`Le site avec l'ID ${id} n'existe pas.`, 404);
      }
      console.error(`Erreur lors de la suppression du site ${id}:`, error);
      throw new ApiError(
        `Impossible de supprimer le site ${id}.`,
        error.response?.status || 500
      );
    }
  },

  getSiteEquipment: async (id: string): Promise<any[]> => {
    try {
      const response = await api.get(`/sites/${id}/equipment`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new ApiError(`Le site avec l'ID ${id} n'existe pas.`, 404);
      }
      console.error(`Erreur lors de la récupération des équipements du site ${id}:`, error);
      throw new ApiError(
        `Impossible de récupérer les équipements du site ${id}.`,
        error.response?.status || 500
      );
    }
  },

  getSiteTeams: async (id: string): Promise<any[]> => {
    try {
      const response = await api.get(`/sites/${id}/teams`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new ApiError(`Le site avec l'ID ${id} n'existe pas.`, 404);
      }
      console.error(`Erreur lors de la récupération des équipes du site ${id}:`, error);
      throw new ApiError(
        `Impossible de récupérer les équipes du site ${id}.`,
        error.response?.status || 500
      );
    }
  },

  // Méthode pour obtenir les spécifications d'un site
  getSiteSpecifications: async (id: string): Promise<Record<string, any>> => {
    try {
      const response = await api.get(`/sites/${id}/specifications`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new ApiError(`Le site avec l'ID ${id} n'existe pas.`, 404);
      }
      console.error(`Erreur lors de la récupération des spécifications du site ${id}:`, error);
      throw new ApiError(
        `Impossible de récupérer les spécifications du site ${id}.`,
        error.response?.status || 500
      );
    }
  },

  // Méthode pour mettre à jour les spécifications d'un site
  updateSiteSpecifications: async (id: string, specifications: Record<string, any>): Promise<Record<string, any>> => {
    try {
      const response = await api.patch(`/sites/${id}/specifications`, specifications);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new ApiError(`Le site avec l'ID ${id} n'existe pas.`, 404);
      }
      console.error(`Erreur lors de la mise à jour des spécifications du site ${id}:`, error);
      throw new ApiError(
        `Impossible de mettre à jour les spécifications du site ${id}.`,
        error.response?.status || 500
      );
    }
  }
};

export default sitesService;
