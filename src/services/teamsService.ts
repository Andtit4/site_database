import api from './api';

export enum TeamStatus {
  ACTIVE = 'ACTIVE',
  STANDBY = 'STANDBY',
  INACTIVE = 'INACTIVE',
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  status: string;
  leadName?: string;
  leadContact?: string;
  memberCount: number;
  location?: string;
  createdAt: Date;
  lastActiveDate?: Date;
  metadata?: Record<string, any>;
  equipmentType?: string;
  equipmentTypes?: string[];
  department?: any;
  departmentId: string;
  sites?: any[];
  users?: any[];
  equipment?: any[];
  isDeleted: boolean;
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  status?: TeamStatus;
  leadName?: string;
  leadContact?: string;
  memberCount?: number;
  location?: string;
  lastActiveDate?: string;
  metadata?: Record<string, any>;
  equipmentType?: string;
  equipmentTypes?: string[];
  departmentId?: string;
  createAccount?: boolean;
  password?: string;
  userEmail?: string;
  hasDepartmentRights?: boolean;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  status?: TeamStatus;
  leadName?: string;
  leadContact?: string;
  memberCount?: number;
  location?: string;
  lastActiveDate?: string;
  metadata?: Record<string, any>;
  equipmentType?: string;
  equipmentTypes?: string[];
  departmentId?: string;
  isDeleted?: boolean;
}

export interface TeamFilterDto {
  status?: TeamStatus;
  departmentId?: string;
  equipmentType?: string;
  search?: string;
}

const teamsService = {
  getAllTeams: async (filterDto?: TeamFilterDto): Promise<Team[]> => {
    try {
      const params = new URLSearchParams();
      if (filterDto) {
        if (filterDto.status) params.append('status', filterDto.status);
        if (filterDto.departmentId) params.append('departmentId', filterDto.departmentId);
        if (filterDto.equipmentType) params.append('equipmentType', filterDto.equipmentType);
        if (filterDto.search) params.append('search', filterDto.search);
      }
      
      const queryString = params.toString();
      const url = queryString ? `/teams?${queryString}` : '/teams';
      
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error("Erreur getAllTeams:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors de la récupération des équipes");
      }
      throw error;
    }
  },

  getTeamById: async (id: string): Promise<Team> => {
    try {
      const response = await api.get(`/teams/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Erreur getTeamById:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || `Équipe avec l'ID ${id} non trouvée`);
      }
      throw error;
    }
  },

  createTeam: async (team: CreateTeamDto): Promise<Team> => {
    try {
      console.log("Création d'équipe - données envoyées:", team);
      const response = await api.post('/teams', team);
      console.log("Réponse du backend:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur createTeam:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors de la création de l'équipe");
      }
      throw error;
    }
  },

  updateTeam: async (id: string, team: UpdateTeamDto): Promise<Team> => {
    try {
      console.log("Mise à jour d'équipe - données envoyées:", team);
      const response = await api.put(`/teams/${id}`, team);
      console.log("Réponse du backend:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur updateTeam:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors de la mise à jour de l'équipe");
      }
      throw error;
    }
  },

  deleteTeam: async (id: string): Promise<void> => {
    try {
      await api.delete(`/teams/${id}`);
    } catch (error: any) {
      console.error("Erreur deleteTeam:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors de la suppression de l'équipe");
      }
      throw error;
    }
  },

  getTeamsByDepartment: async (departmentId: string): Promise<Team[]> => {
    try {
      const response = await api.get(`/teams/department/${departmentId}`);
      return response.data;
    } catch (error: any) {
      console.error("Erreur getTeamsByDepartment:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors de la récupération des équipes du département");
      }
      throw error;
    }
  },

  getTeamsByEquipmentType: async (equipmentType: string): Promise<Team[]> => {
    try {
      const response = await api.get(`/teams/equipment-type/${equipmentType}`);
      return response.data;
    } catch (error: any) {
      console.error("Erreur getTeamsByEquipmentType:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors de la récupération des équipes par type d'équipement");
      }
      throw error;
    }
  },

  getTeamMembers: async (id: string): Promise<any[]> => {
    try {
      const response = await api.get(`/teams/${id}/members`);
      return response.data;
    } catch (error: any) {
      console.error("Erreur getTeamMembers:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors de la récupération des membres de l'équipe");
      }
      throw error;
    }
  },

  assignTeamToSite: async (teamId: string, siteId: string): Promise<void> => {
    try {
      await api.post(`/teams/${teamId}/sites/${siteId}`);
    } catch (error: any) {
      console.error("Erreur assignTeamToSite:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors de l'assignation de l'équipe au site");
      }
      throw error;
    }
  },

  removeTeamFromSite: async (teamId: string, siteId: string): Promise<void> => {
    try {
      await api.delete(`/teams/${teamId}/sites/${siteId}`);
    } catch (error: any) {
      console.error("Erreur removeTeamFromSite:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors du retrait de l'équipe du site");
      }
      throw error;
    }
  },

  getTeamSites: async (id: string): Promise<any[]> => {
    try {
      const response = await api.get(`/teams/${id}/sites`);
      return response.data;
    } catch (error: any) {
      console.error("Erreur getTeamSites:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors de la récupération des sites de l'équipe");
      }
      throw error;
    }
  },

  getTeamStatistics: async (): Promise<any> => {
    try {
      const response = await api.get('/teams/statistics');
      return response.data;
    } catch (error: any) {
      console.error("Erreur getTeamStatistics:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        throw new Error(error.response.data.message || "Erreur lors de la récupération des statistiques des équipes");
      }
      throw error;
    }
  }
};

export default teamsService; 
