import api from './api';

export enum CustomFieldType {
  STRING = 'STRING',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  SELECT = 'SELECT'
}

export interface SiteCustomField {
  id: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: CustomFieldType;
  required: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  description?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomFieldDto {
  fieldName: string;
  fieldLabel: string;
  fieldType: CustomFieldType;
  required?: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  description?: string;
  sortOrder?: number;
}

export interface UpdateCustomFieldDto {
  fieldLabel?: string;
  fieldType?: CustomFieldType;
  required?: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  description?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface FieldBackup {
  id: string;
  timestamp: Date;
  action: 'DELETE' | 'MODIFY';
  fieldData: SiteCustomField;
  affectedSitesCount?: number;
  reason?: string;
}

export interface FieldAnalysisResult {
  affectedSitesCount: number;
  warnings: string[];
  hasData: boolean;
}

export const siteCustomFieldsService = {
  // Récupérer tous les champs personnalisés
  getAll: async (): Promise<SiteCustomField[]> => {
    const response = await api.get('/site-custom-fields');
    return response.data;
  },

  // Récupérer les champs personnalisés actifs
  getActive: async (): Promise<SiteCustomField[]> => {
    const response = await api.get('/site-custom-fields/active');
    return response.data;
  },

  // Récupérer un champ par ID
  getById: async (id: string): Promise<SiteCustomField> => {
    const response = await api.get(`/site-custom-fields/${id}`);
    return response.data;
  },

  // Créer un nouveau champ personnalisé
  create: async (data: CreateCustomFieldDto): Promise<SiteCustomField> => {
    const response = await api.post('/site-custom-fields', data);
    return response.data;
  },

  // Mettre à jour un champ personnalisé
  update: async (id: string, data: UpdateCustomFieldDto): Promise<SiteCustomField> => {
    const response = await api.put(`/site-custom-fields/${id}`, data);
    return response.data;
  },

  // Supprimer un champ personnalisé
  delete: async (id: string): Promise<void> => {
    await api.delete(`/site-custom-fields/${id}`);
  },

  // Activer/désactiver un champ
  toggleActive: async (id: string): Promise<SiteCustomField> => {
    const response = await api.put(`/site-custom-fields/${id}/toggle-active`);
    return response.data;
  },

  // Mettre à jour l'ordre des champs
  updateSortOrder: async (fieldIds: string[]): Promise<void> => {
    await api.put('/site-custom-fields/sort-order', { fieldIds });
  },

  // Valider les valeurs personnalisées
  validateValues: async (values: Record<string, any>): Promise<{ isValid: boolean; errors: string[] }> => {
    const response = await api.post('/site-custom-fields/validate', { values });
    return response.data;
  },

  // Appliquer les valeurs par défaut
  applyDefaults: async (values?: Record<string, any>): Promise<Record<string, any>> => {
    const response = await api.post('/site-custom-fields/apply-defaults', { values });
    return response.data;
  },

  // Nettoyer les valeurs
  cleanValues: async (values: Record<string, any>): Promise<Record<string, any>> => {
    const response = await api.post('/site-custom-fields/clean', { values });
    return response.data;
  },

  // ===== NOUVELLES MÉTHODES POUR LA SÉCURITÉ ET LA RESTAURATION =====

  // Analyser l'impact de la suppression d'un champ
  analyzeFieldDeletion: async (fieldId: string): Promise<FieldAnalysisResult> => {
    const response = await api.post(`/site-custom-fields/${fieldId}/analyze-deletion`);
    return response.data;
  },

  // Analyser l'impact de la modification d'un champ
  analyzeFieldModification: async (fieldId: string, newData: UpdateCustomFieldDto): Promise<FieldAnalysisResult> => {
    const response = await api.post(`/site-custom-fields/${fieldId}/analyze-modification`, newData);
    return response.data;
  },

  // Créer une sauvegarde d'un champ
  createBackup: async (backupData: Omit<FieldBackup, 'id'>): Promise<FieldBackup> => {
    const response = await api.post('/site-custom-fields/backups', backupData);
    return response.data;
  },

  // Récupérer toutes les sauvegardes (admin uniquement)
  getBackups: async (): Promise<FieldBackup[]> => {
    const response = await api.get('/site-custom-fields/backups');
    return response.data;
  },

  // Récupérer une sauvegarde par ID (admin uniquement)
  getBackupById: async (backupId: string): Promise<FieldBackup> => {
    const response = await api.get(`/site-custom-fields/backups/${backupId}`);
    return response.data;
  },

  // Restaurer un champ depuis une sauvegarde (admin uniquement)
  restoreFromBackup: async (backupId: string): Promise<SiteCustomField> => {
    const response = await api.post(`/site-custom-fields/backups/${backupId}/restore`);
    return response.data;
  },

  // Supprimer une sauvegarde (admin uniquement)
  deleteBackup: async (backupId: string): Promise<void> => {
    await api.delete(`/site-custom-fields/backups/${backupId}`);
  },

  // Nettoyer les anciennes sauvegardes (admin uniquement)
  cleanOldBackups: async (olderThanDays: number = 90): Promise<{ deletedCount: number }> => {
    const response = await api.delete(`/site-custom-fields/backups/cleanup`, {
      data: { olderThanDays }
    });
    return response.data;
  }
};

// ===== UTILITAIRES =====

// Types de champs disponibles
export const getFieldTypeOptions = () => [
  { value: CustomFieldType.STRING, label: 'Texte court' },
  { value: CustomFieldType.TEXTAREA, label: 'Texte long' },
  { value: CustomFieldType.NUMBER, label: 'Nombre' },
  { value: CustomFieldType.BOOLEAN, label: 'Oui/Non' },
  { value: CustomFieldType.DATE, label: 'Date' },
  { value: CustomFieldType.SELECT, label: 'Liste déroulante' }
];

// Obtenir le libellé d'un type de champ
export const getFieldTypeLabel = (type: CustomFieldType): string => {
  const option = getFieldTypeOptions().find(opt => opt.value === type);
  return option ? option.label : type;
};

// Convertir une valeur selon le type de champ
export const convertFieldValue = (value: any, type: CustomFieldType): any => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  switch (type) {
    case CustomFieldType.NUMBER:
      return Number(value);
    case CustomFieldType.BOOLEAN:
      return Boolean(value);
    case CustomFieldType.DATE:
      return new Date(value).toISOString().split('T')[0];
    default:
      return String(value);
  }
};

// Formater une valeur pour l'affichage
export const formatFieldValue = (value: any, type: CustomFieldType): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  switch (type) {
    case CustomFieldType.NUMBER:
      return Number(value).toLocaleString();
    case CustomFieldType.BOOLEAN:
      return value ? 'Oui' : 'Non';
    case CustomFieldType.DATE:
      return new Date(value).toLocaleDateString('fr-FR');
    default:
      return String(value);
  }
};

export default siteCustomFieldsService; 
