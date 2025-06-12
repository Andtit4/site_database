import api from './api';
import authService from './authService';

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
  specifications?: Record<string, any>; // Spécifications dynamiques
  customFieldsValues?: Record<string, any>; // Champs personnalisés
  departmentId?: string; // Ajout du département
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSiteDto {
  id: string;
  name: string;
  region: string;
  longitude: number;
  latitude: number;
  status: SiteStatus;
  oldBase?: string;
  newBase?: string;
  specifications?: Record<string, any>; // Spécifications dynamiques
  customFieldsValues?: Record<string, any>; // Champs personnalisés
  departmentId?: string; // Ajout du département
}

export interface UpdateSiteDto {
  name?: string;
  region?: string;
  zone?: string;
  longitude?: number;
  latitude?: number;
  status?: SiteStatus;
  oldBase?: string;
  newBase?: string;
  specifications?: Record<string, any>; // Spécifications dynamiques
  customFieldsValues?: Record<string, any>; // Champs personnalisés
  departmentId?: string; // Ajout du département
}

export interface SiteFilterDto {
  departmentId?: string;
  region?: string;
  status?: string;
  search?: string;
  showDeleted?: boolean;
}

// Fonction helper pour récupérer l'utilisateur actuel depuis localStorage
const getCurrentUserSync = () => {
  try {
    if (typeof window === 'undefined') return null; // Vérification SSR
    const userString = localStorage.getItem('user');
    if (!userString) return null;
    return JSON.parse(userString);
  } catch (error) {
    return null;
  }
};

// Fonction helper pour vérifier les permissions côté frontend
const checkSitesPermission = (): boolean => {
  const user = getCurrentUserSync();
  if (!user) return false;
  
  // Les ADMIN ont accès à tout
  if (user.isAdmin) return true;
  
  // Les DEPARTMENT_ADMIN et TEAM_MEMBER ont accès aux sites de leur département
  if ((user.isDepartmentAdmin || user.isTeamMember) && user.departmentId) {
    return true;
  }
  
  return false;
}

const getAllSites = async (filters: SiteFilterDto = {}): Promise<Site[]> => {
  // Vérifier les permissions avant de faire l'appel
  if (!checkSitesPermission()) {
    console.warn('Accès aux sites refusé - permissions insuffisantes');
    return []; // Retourner un tableau vide au lieu de lever une erreur
  }

  const user = getCurrentUserSync();
  if (!user) return [];

  // Construire les paramètres de requête
  const params = new URLSearchParams();
  
  // Appliquer automatiquement le filtre de département pour les non-admins
  if (!user.isAdmin && user.departmentId) {
    params.append('departmentId', user.departmentId);
  } else if (filters.departmentId) {
    params.append('departmentId', filters.departmentId);
  }
  
  if (filters.search) params.append('search', filters.search);
  if (filters.region) params.append('region', filters.region);
  if (filters.status) params.append('status', filters.status);
  if (filters.showDeleted) params.append('includeDeleted', 'true');

  try {
    const response = await api.get(`/sites?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    // Si on reçoit quand même une 403, retourner un tableau vide
    if (error.status === 403 || error.response?.status === 403) {
      console.warn('Accès aux sites refusé par le serveur - retour de données vides');
      return [];
    }
    throw error;
  }
};

const getSiteById = async (id: string): Promise<Site> => {
  // Vérifier les permissions avant de faire l'appel
  if (!checkSitesPermission()) {
    throw new Error('Accès refusé - permissions insuffisantes');
  }

  const user = getCurrentUserSync();
  
  try {
    const response = await api.get(`/sites/${id}`);
    const site = response.data;
    
    // Vérifier que l'utilisateur peut accéder à ce site spécifique
    if (!user?.isAdmin && user?.departmentId && site.departmentId !== user.departmentId) {
      throw new Error('Accès refusé - ce site n\'appartient pas à votre département');
    }
    
    return site;
  } catch (error: any) {
    if (error.status === 403 || error.response?.status === 403) {
      throw new Error('Accès refusé - permissions insuffisantes');
    }
    throw error;
  }
};

const getSitesByDepartment = async (departmentId: string): Promise<Site[]> => {
  // Vérifier les permissions avant de faire l'appel
  if (!checkSitesPermission()) {
    return [];
  }

  const user = getCurrentUserSync();
  
  // Vérifier que l'utilisateur peut accéder à ce département
  if (!user?.isAdmin && user?.departmentId !== departmentId) {
    console.warn('Accès refusé - département différent de celui de l\'utilisateur');
    return [];
  }

  return getAllSites({ departmentId });
};

const createSite = async (siteData: CreateSiteDto): Promise<Site> => {
  const user = getCurrentUserSync();
  
  // Vérifier les permissions de création
  if (!user?.isAdmin && !user?.isDepartmentAdmin) {
    throw new Error('Accès refusé - vous n\'avez pas les permissions pour créer des sites');
  }
  
  // Forcer le département de l'utilisateur pour les non-admins
  if (!user.isAdmin && user.departmentId) {
    siteData.departmentId = user.departmentId;
  }

  const response = await api.post('/sites', siteData);
  return response.data;
};

const updateSite = async (id: string, siteData: UpdateSiteDto): Promise<Site> => {
  const user = getCurrentUserSync();
  
  // Vérifier les permissions de modification
  if (!user?.isAdmin && !user?.isDepartmentAdmin) {
    throw new Error('Accès refusé - vous n\'avez pas les permissions pour modifier des sites');
  }
  
  // Vérifier que le site appartient au département de l'utilisateur (pour les non-admins)
  if (!user.isAdmin) {
    const site = await getSiteById(id); // Cela vérifiera déjà les permissions
  }

  const response = await api.patch(`/sites/${id}`, siteData);
  return response.data;
};

const deleteSite = async (id: string): Promise<void> => {
  const user = getCurrentUserSync();
  
  // Vérifier les permissions de suppression
  if (!user?.isAdmin && !user?.isDepartmentAdmin) {
    throw new Error('Accès refusé - vous n\'avez pas les permissions pour supprimer des sites');
  }
  
  // Vérifier que le site appartient au département de l'utilisateur (pour les non-admins)
  if (!user.isAdmin) {
    const site = await getSiteById(id); // Cela vérifiera déjà les permissions
  }

  await api.delete(`/sites/${id}`);
};

const getSiteEquipment = async (siteId: string): Promise<any[]> => {
  // Vérifier d'abord l'accès au site
  if (!checkSitesPermission()) {
    return [];
  }
  
  try {
    // Vérifier l'accès au site avant de récupérer ses équipements
    await getSiteById(siteId);
    
    const response = await api.get(`/sites/${siteId}/equipment`);
    return response.data;
  } catch (error: any) {
    if (error.message.includes('Accès refusé')) {
      return [];
    }
    throw error;
  }
};

export const sitesService = {
  getAllSites,
  getSiteById,
  getSitesByDepartment,
  createSite,
  updateSite,
  deleteSite,
  getSiteEquipment
};
