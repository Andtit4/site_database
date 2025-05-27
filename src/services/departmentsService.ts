import api from './api';

export enum DepartmentType {
  TRANSMISSION = 'TRANSMISSION',
  ENERGIE = 'ENERGIE',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  INFORMATIQUE = 'INFORMATIQUE',
  SECURITE = 'SECURITE',
}

export interface Department {
  id: string;
  name: string;
  type: string;
  description?: string;
  responsibleName: string;
  contactEmail: string;
  contactPhone?: number;
  isActive: boolean;
  managedEquipmentTypes?: string[];
  equipmentTypes?: string[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export interface CreateDepartmentDto {
  name: string;
  type: string;
  description?: string;
  responsibleName: string;
  contactEmail: string;
  contactPhone?: number;
  isActive?: boolean;
  managedEquipmentTypes?: string[];
  password?: string;
  createAccount?: boolean;
}

export interface UpdateDepartmentDto {
  name?: string;
  type?: string;
  description?: string;
  responsibleName?: string;
  contactEmail?: string;
  contactPhone?: number;
  isActive?: boolean;
  managedEquipmentTypes?: string[];
  isDeleted?: boolean;
}

const departmentsService = {
  getAllDepartments: async (): Promise<Department[]> => {
    try {
      const response = await api.get('/departments');
      
      // Assurons-nous que equipmentTypes est disponible pour le frontend
      return response.data.map((department: Department) => ({
        ...department,
        equipmentTypes: department.managedEquipmentTypes || []
      }));
    } catch (error: any) {
      console.error("Erreur getAllDepartments:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors de la récupération des départements");
      }
      throw error;
    }
  },

  getDepartmentById: async (id: string): Promise<Department> => {
    try {
      const response = await api.get(`/departments/${id}`);
      
      // Assurons-nous que equipmentTypes est disponible pour le frontend
      return {
        ...response.data,
        equipmentTypes: response.data.managedEquipmentTypes || []
      };
    } catch (error: any) {
      console.error("Erreur getDepartmentById:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || `Département avec l'ID ${id} non trouvé`);
      }
      throw error;
    }
  },

  createDepartment: async (department: CreateDepartmentDto): Promise<Department> => {
    try {
      console.log("Frontend DTO avant transformation:", department);
      
      // Convertir contactPhone en nombre si c'est une chaîne
      const processedDepartment: CreateDepartmentDto = {
        ...department,
        contactPhone: department.contactPhone !== undefined ? 
          Number(department.contactPhone) : undefined,
      };
      
      // Si equipmentTypes est présent mais pas managedEquipmentTypes, copiez-le
      if (!processedDepartment.managedEquipmentTypes && (department as any).equipmentTypes) {
        processedDepartment.managedEquipmentTypes = (department as any).equipmentTypes;
      }
      
      // Supprimer le champ equipmentTypes qui n'est pas attendu par le backend
      const backendData = { ...processedDepartment };
      delete (backendData as any).equipmentTypes;
      
      console.log("Données envoyées au backend:", backendData);

      const response = await api.post('/departments', backendData);
      console.log("Réponse du backend:", response.data);
      
      return {
        ...response.data,
        equipmentTypes: response.data.managedEquipmentTypes || []
      };
    } catch (error: any) {
      console.error("Erreur createDepartment:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors de la création du département");
      }
      throw error;
    }
  },

  updateDepartment: async (id: string, department: UpdateDepartmentDto): Promise<Department> => {
    try {
      console.log("Frontend DTO avant transformation (update):", department);
      
      // Convertir contactPhone en nombre si c'est une chaîne
      const processedDepartment: UpdateDepartmentDto = {
        ...department,
        contactPhone: department.contactPhone !== undefined ? 
          Number(department.contactPhone) : undefined,
      };
      
      // Si equipmentTypes est présent mais pas managedEquipmentTypes, copiez-le
      if (!processedDepartment.managedEquipmentTypes && (department as any).equipmentTypes) {
        processedDepartment.managedEquipmentTypes = (department as any).equipmentTypes;
      }
      
      // Supprimer le champ equipmentTypes qui n'est pas attendu par le backend
      const backendData = { ...processedDepartment };
      delete (backendData as any).equipmentTypes;
      
      console.log("Données envoyées au backend (update):", backendData);

      const response = await api.put(`/departments/${id}`, backendData);
      console.log("Réponse du backend (update):", response.data);
      
      return {
        ...response.data,
        equipmentTypes: response.data.managedEquipmentTypes || []
      };
    } catch (error: any) {
      console.error("Erreur updateDepartment:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors de la mise à jour du département");
      }
      throw error;
    }
  },

  deleteDepartment: async (id: string): Promise<void> => {
    try {
      // Vérifier d'abord si le département existe et peut être supprimé
      console.log(`Tentative de suppression du département avec l'ID: ${id}`);
      
      // Vérifier si le département a des équipes associées
      try {
        const teams = await departmentsService.getDepartmentTeams(id);
        if (teams && teams.length > 0) {
          throw new Error(`Ce département ne peut pas être supprimé car il contient ${teams.length} équipe(s). Veuillez d'abord supprimer ou réaffecter ces équipes.`);
        }
      } catch (teamError: any) {
        // Si l'erreur est autre que "département a des équipes", propager l'erreur
        if (!teamError.message.includes('ne peut pas être supprimé')) {
          throw teamError;
        }
      }

      // Procéder à la suppression
      await api.delete(`/departments/${id}`);
      console.log(`Département avec l'ID ${id} supprimé avec succès`);
    } catch (error: any) {
      console.error("Erreur deleteDepartment:", error);
      
      // Détails d'erreur plus verbeux
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        console.error("Statut:", error.response.status);
        console.error("Headers:", error.response.headers);
        
        // Personnaliser le message d'erreur en fonction du statut
        if (error.response.status === 500) {
          throw new Error("Erreur serveur lors de la suppression. Il est possible que ce département ait des relations avec d'autres entités qui empêchent sa suppression.");
        } else if (error.response.status === 404) {
          throw new Error(`Le département avec l'ID ${id} n'existe pas ou a déjà été supprimé.`);
        } else if (error.response.status === 403) {
          throw new Error("Vous n'avez pas les permissions nécessaires pour supprimer ce département.");
        } else {
          throw new Error(error.response.data.message || "Erreur lors de la suppression du département");
        }
      }
      throw error;
    }
  },

  getDepartmentTeams: async (id: string): Promise<any[]> => {
    try {
      const response = await api.get(`/departments/${id}/teams`);
      return response.data;
    } catch (error: any) {
      console.error("Erreur getDepartmentTeams:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors de la récupération des équipes du département");
      }
      throw error;
    }
  },

  getDepartmentEquipment: async (id: string): Promise<any[]> => {
    try {
      const response = await api.get(`/departments/${id}/equipment`);
      return response.data;
    } catch (error: any) {
      console.error("Erreur getDepartmentEquipment:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors de la récupération des équipements du département");
      }
      throw error;
    }
  }
};

export default departmentsService; 
