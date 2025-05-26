import api from './api';

// Statuts possibles d'un site
export enum SiteStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
}

export enum region {
  MARITIME = 'MARITIME',
  CENTRALE = 'CENTRALE',
  LOME = 'LOME',
  KARA  = 'KARA ',
  DAPAONG = 'DAPAONG',
  SAVANE  = 'SAVANE',
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSiteDto {
  id: string;
  name: string;
  region: string;
  zone?: string;
  longitude: number;
  latitude: number;
  status?: string;
  oldBase?: string;
  newBase?: string;
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
}



// Vérifie si on doit utiliser les données mockées (en mode développement)
const useMockData = false;

const sitesService = {
  getAllSites: async (): Promise<Site[]> => {
    const response = await api.get('/sites');


return response.data;
  },

  getSiteById: async (id: string): Promise<Site> => {


    const response = await api.get(`/sites/${id}`);


return response.data;
  },

  createSite: async (site: CreateSiteDto): Promise<Site> => {
    console.log(site);
    const response = await api.post('/sites', site);


return response.data;
  },

  updateSite: async (id: string, site: UpdateSiteDto): Promise<Site> => {
    if (useMockData) {
      const index = mockSites.findIndex(s => s.id === id);

      if (index === -1) {
        throw new Error('Site non trouvé');
      }

      const updatedSite = {
        ...mockSites[index],
        ...site,
        updatedAt: new Date()
      };

      mockSites[index] = updatedSite;

return Promise.resolve(updatedSite);
    }

    const response = await api.put(`/sites/${id}`, site);


return response.data;
  },

  deleteSite: async (id: string): Promise<void> => {
    if (useMockData) {
      const index = mockSites.findIndex(s => s.id === id);

      if (index !== -1) {
        mockSites.splice(index, 1);
      }


return Promise.resolve();
    }

    await api.delete(`/sites/${id}`);
  },

  getSiteEquipment: async (id: string): Promise<any[]> => {
    if (useMockData) {
      // Simuler quelques équipements pour le site
      return Promise.resolve([
        { id: `eq-${id}-1`, name: 'Antenne 5G', status: 'ACTIVE' },
        { id: `eq-${id}-2`, name: 'Émetteur radio', status: 'ACTIVE' },
        { id: `eq-${id}-3`, name: 'Boîtier alimentation', status: 'MAINTENANCE' }
      ]);
    }

    const response = await api.get(`/sites/${id}/equipment`);


return response.data;
  },

  getSiteTeams: async (id: string): Promise<any[]> => {
    if (useMockData) {
      // Simuler quelques équipes pour le site
      return Promise.resolve([
        { id: `team-${id}-1`, name: 'Équipe maintenance Paris' },
        { id: `team-${id}-2`, name: 'Équipe technique réseau' }
      ]);
    }

    const response = await api.get(`/sites/${id}/teams`);


return response.data;
  }
};

export default sitesService;
