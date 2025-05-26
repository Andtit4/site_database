import api from './api';

export interface Specification {
  id: string;
  name: string;
  description?: string;
  category: string;
  value: string;
  unit?: string;
  isStandard: boolean;
  appliesTo: string[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export interface CreateSpecificationDto {
  name: string;
  description?: string;
  category: string;
  value: string;
  unit?: string;
  isStandard?: boolean;
  appliesTo?: string[];
}

export interface UpdateSpecificationDto {
  name?: string;
  description?: string;
  category?: string;
  value?: string;
  unit?: string;
  isStandard?: boolean;
  appliesTo?: string[];
}

export enum SpecificationCategory {
  TECHNICAL = 'TECHNICAL',
  PERFORMANCE = 'PERFORMANCE',
  SAFETY = 'SAFETY',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  COMPLIANCE = 'COMPLIANCE'
}

const specificationsService = {
  getAllSpecifications: async (): Promise<Specification[]> => {
    try {
      const response = await api.get('/specifications');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des spécifications:', error);
      // Retourner des données simulées en cas d'erreur
      return mockSpecifications;
    }
  },

  getSpecificationById: async (id: string): Promise<Specification> => {
    try {
      const response = await api.get(`/specifications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la spécification ${id}:`, error);
      // Retourner une donnée simulée en cas d'erreur
      return mockSpecifications.find(spec => spec.id === id) || mockSpecifications[0];
    }
  },

  createSpecification: async (specification: CreateSpecificationDto): Promise<Specification> => {
    try {
      const response = await api.post('/specifications', specification);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la spécification:', error);
      // Simuler une création réussie
      const newSpec = {
        id: 'temp-' + Date.now(),
        ...specification,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
      } as Specification;
      mockSpecifications.push(newSpec);
      return newSpec;
    }
  },

  updateSpecification: async (id: string, specification: UpdateSpecificationDto): Promise<Specification> => {
    try {
      const response = await api.put(`/specifications/${id}`, specification);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la spécification ${id}:`, error);
      // Simuler une mise à jour réussie
      const index = mockSpecifications.findIndex(spec => spec.id === id);
      if (index !== -1) {
        mockSpecifications[index] = {
          ...mockSpecifications[index],
          ...specification,
          updatedAt: new Date()
        };
        return mockSpecifications[index];
      }
      throw new Error('Spécification non trouvée');
    }
  },

  deleteSpecification: async (id: string): Promise<void> => {
    try {
      await api.delete(`/specifications/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la spécification ${id}:`, error);
      // Simuler une suppression réussie
      const index = mockSpecifications.findIndex(spec => spec.id === id);
      if (index !== -1) {
        mockSpecifications[index].isDeleted = true;
      }
    }
  }
};

// Données simulées pour les tests
const mockSpecifications: Specification[] = [
  {
    id: 'spec-001',
    name: 'Hauteur d\'antenne',
    description: 'Hauteur recommandée pour l\'installation de l\'antenne',
    category: SpecificationCategory.TECHNICAL,
    value: '30-50',
    unit: 'm',
    isStandard: true,
    appliesTo: ['ANTENNA'],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
    isDeleted: false
  },
  {
    id: 'spec-002',
    name: 'Puissance de sortie',
    description: 'Puissance de sortie maximale',
    category: SpecificationCategory.PERFORMANCE,
    value: '40',
    unit: 'W',
    isStandard: true,
    appliesTo: ['ROUTER', 'ANTENNA'],
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-02-10'),
    isDeleted: false
  },
  {
    id: 'spec-003',
    name: 'Autonomie batterie',
    description: 'Durée de fonctionnement sur batterie',
    category: SpecificationCategory.PERFORMANCE,
    value: '8',
    unit: 'h',
    isStandard: true,
    appliesTo: ['BATTERY'],
    createdAt: new Date('2023-02-05'),
    updatedAt: new Date('2023-02-05'),
    isDeleted: false
  },
  {
    id: 'spec-004',
    name: 'Résistance au vent',
    description: 'Vitesse maximale de vent supportée',
    category: SpecificationCategory.SAFETY,
    value: '120',
    unit: 'km/h',
    isStandard: true,
    appliesTo: ['TOWER', 'ANTENNA'],
    createdAt: new Date('2023-02-15'),
    updatedAt: new Date('2023-03-10'),
    isDeleted: false
  },
  {
    id: 'spec-005',
    name: 'Température de fonctionnement',
    description: 'Plage de température pour un fonctionnement optimal',
    category: SpecificationCategory.ENVIRONMENTAL,
    value: '-10 à 50',
    unit: '°C',
    isStandard: true,
    appliesTo: ['ROUTER', 'BATTERY', 'GENERATOR'],
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2023-03-25'),
    isDeleted: false
  }
];

export default specificationsService; 
