import api from './api';

export interface DynamicFieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'select';
  label: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

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

const siteDynamicFieldsService = {
  // Récupérer les définitions de champs pour un type de site
  getFieldDefinitions: async (siteType: SiteTypes): Promise<DynamicFieldDefinition[]> => {
    try {
      const response = await api.get(`/sites/dynamic-fields/definitions/${siteType}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des définitions de champs:', error);
      throw error;
    }
  },

  // Récupérer toutes les définitions de champs pour tous les types
  getAllFieldDefinitions: async (): Promise<Record<SiteTypes, DynamicFieldDefinition[]>> => {
    try {
      const response = await api.get('/sites/dynamic-fields/definitions');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de toutes les définitions:', error);
      throw error;
    }
  },

  // Valider les valeurs des champs dynamiques
  validateDynamicFields: async (
    fieldDefinitions: DynamicFieldDefinition[],
    values: Record<string, any>
  ): Promise<{ isValid: boolean; errors: string[] }> => {
    try {
      const response = await api.post('/sites/dynamic-fields/validate', {
        fieldDefinitions,
        values
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la validation des champs dynamiques:', error);
      throw error;
    }
  },

  // Appliquer les valeurs par défaut
  applyDefaultValues: async (
    fieldDefinitions: DynamicFieldDefinition[],
    values?: Record<string, any>
  ): Promise<Record<string, any>> => {
    try {
      const response = await api.post('/sites/dynamic-fields/apply-defaults', {
        fieldDefinitions,
        values
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'application des valeurs par défaut:', error);
      throw error;
    }
  },

  // Nettoyer les valeurs dynamiques
  cleanDynamicValues: async (
    fieldDefinitions: DynamicFieldDefinition[],
    values: Record<string, any>
  ): Promise<Record<string, any>> => {
    try {
      const response = await api.post('/sites/dynamic-fields/clean', {
        fieldDefinitions,
        values
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors du nettoyage des valeurs:', error);
      throw error;
    }
  },

  // Récupérer tous les types de sites disponibles
  getSiteTypes: async (): Promise<{ value: string; label: string }[]> => {
    try {
      const response = await api.get('/sites/dynamic-fields/types');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des types de sites:', error);
      throw error;
    }
  },

  // Utilitaire: Convertir une valeur selon son type
  convertValue: (value: any, type: string): any => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value) || value === 'true';
      case 'date':
        return new Date(value);
      default:
        return String(value);
    }
  },

  // Utilitaire: Formater une valeur pour l'affichage
  formatValue: (value: any, type: string): string => {
    if (value === null || value === undefined) {
      return '-';
    }

    switch (type) {
      case 'boolean':
        return value ? 'Oui' : 'Non';
      case 'date':
        return new Date(value).toLocaleDateString('fr-FR');
      case 'number':
        return Number(value).toLocaleString('fr-FR');
      default:
        return String(value);
    }
  },

  // Utilitaire: Générer un composant de champ selon son type
  getFieldComponent: (field: DynamicFieldDefinition): string => {
    switch (field.type) {
      case 'boolean':
        return 'checkbox';
      case 'date':
        return 'date';
      case 'number':
        return 'number';
      case 'select':
        return 'select';
      default:
        return 'text';
    }
  },

  // Utilitaire: Obtenir le label d'un type de site
  getSiteTypeLabel: (siteType: SiteTypes): string => {
    const labels: Record<SiteTypes, string> = {
      [SiteTypes.TOUR]: 'Tour',
      [SiteTypes.SHELTER]: 'Shelter',
      [SiteTypes.PYLONE]: 'Pylône',
      [SiteTypes.BATIMENT]: 'Bâtiment',
      [SiteTypes.TOIT_BATIMENT]: 'Toit de bâtiment',
      [SiteTypes.ROOFTOP]: 'Rooftop',
      [SiteTypes.TERRAIN_BAILLE]: 'Terrain en bail',
      [SiteTypes.TERRAIN_PROPRIETAIRE]: 'Terrain propriétaire',
      [SiteTypes.AUTRE]: 'Autre'
    };
    return labels[siteType] || siteType;
  }
};

export default siteDynamicFieldsService; 
