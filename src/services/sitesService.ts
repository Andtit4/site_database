import api from './api';

// Statuts possibles d'un site
export enum SiteStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
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

// Données simulées pour le développement
const mockSites: Site[] = [
  {
    id: '1',
    name: 'Site Antenne Paris Nord',
    region: 'Île-de-France',
    zone: 'Paris Nord',
    longitude: 2.3522,
    latitude: 48.8566,
    status: SiteStatus.ACTIVE,
    createdAt: new Date('2022-01-15'),
    updatedAt: new Date('2023-06-10')
  },
  {
    id: '2',
    name: 'Site Émetteur Lyon Est',
    region: 'Auvergne-Rhône-Alpes',
    zone: 'Lyon',
    longitude: 4.8357,
    latitude: 45.7640,
    status: SiteStatus.MAINTENANCE,
    oldBase: 'Émetteur 2G',
    newBase: 'Émetteur 4G/5G',
    createdAt: new Date('2021-05-22'),
    updatedAt: new Date('2023-08-15')
  },
  {
    id: '3',
    name: 'Site Relais Marseille Sud',
    region: 'Provence-Alpes-Côte d\'Azur',
    zone: 'Marseille',
    longitude: 5.3698,
    latitude: 43.2965,
    status: SiteStatus.ACTIVE,
    createdAt: new Date('2022-07-05'),
    updatedAt: new Date('2023-03-18')
  },
  {
    id: '4',
    name: 'Antenne Lille Centre',
    region: 'Hauts-de-France',
    zone: 'Lille',
    longitude: 3.0573,
    latitude: 50.6292,
    status: SiteStatus.UNDER_CONSTRUCTION,
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2023-09-05')
  },
  {
    id: '5',
    name: 'Relais Bordeaux Port',
    region: 'Nouvelle-Aquitaine',
    zone: 'Bordeaux',
    longitude: -0.5795,
    latitude: 44.8378,
    status: SiteStatus.INACTIVE,
    createdAt: new Date('2021-11-30'),
    updatedAt: new Date('2022-12-20')
  },
  {
    id: '6',
    name: 'Tour de transmission Strasbourg',
    region: 'Grand Est',
    zone: 'Strasbourg',
    longitude: 7.7521,
    latitude: 48.5734,
    status: SiteStatus.ACTIVE,
    createdAt: new Date('2022-03-15'),
    updatedAt: new Date('2023-04-22')
  },
  {
    id: '7',
    name: 'Station Nantes Ouest',
    region: 'Pays de la Loire',
    zone: 'Nantes',
    longitude: -1.5536,
    latitude: 47.2184,
    status: SiteStatus.MAINTENANCE,
    createdAt: new Date('2021-08-07'),
    updatedAt: new Date('2023-02-11')
  },
  {
    id: '8',
    name: 'Pylône Toulouse Sud',
    region: 'Occitanie',
    zone: 'Toulouse',
    longitude: 1.4442,
    latitude: 43.6047,
    status: SiteStatus.ACTIVE,
    createdAt: new Date('2022-06-18'),
    updatedAt: new Date('2023-07-25')
  }
];

// Vérifie si on doit utiliser les données mockées (en mode développement)
const useMockData = false;

const sitesService = {
  getAllSites: async (): Promise<Site[]> => {
    if (useMockData) {
      console.log('Utilisation des données simulées pour les sites');
      
return Promise.resolve(mockSites);
    }
    
    const response = await api.get('/sites');

    
return response.data;
  },

  getSiteById: async (id: string): Promise<Site> => {
    if (useMockData) {
      const site = mockSites.find(site => site.id === id);

      if (!site) {
        throw new Error('Site non trouvé');
      }

      
return Promise.resolve(site);
    }
    
    const response = await api.get(`/sites/${id}`);

    
return response.data;
  },

  createSite: async (site: CreateSiteDto): Promise<Site> => {
    if (useMockData) {
      const newSite: Site = {
        ...site,
        status: site.status || SiteStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockSites.push(newSite);
      
return Promise.resolve(newSite);
    }
    
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
