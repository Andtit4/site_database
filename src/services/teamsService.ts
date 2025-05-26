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
  departmentId: string;
  isDeleted: boolean;
}

export interface CreateTeamDto {
  id: string;
  name: string;
  description?: string;
  status?: string;
  leadName?: string;
  leadContact?: string;
  memberCount: number;
  location?: string;
  lastActiveDate?: Date;
  metadata?: Record<string, any>;
  equipmentType?: string;
  departmentId: string;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  status?: string;
  leadName?: string;
  leadContact?: string;
  memberCount?: number;
  location?: string;
  lastActiveDate?: Date;
  metadata?: Record<string, any>;
  equipmentType?: string;
  departmentId?: string;
  isDeleted?: boolean;
}

const teamsService = {
  getAllTeams: async (): Promise<Team[]> => {
    const response = await api.get('/teams');
    return response.data;
  },

  getTeamById: async (id: string): Promise<Team> => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  createTeam: async (team: CreateTeamDto): Promise<Team> => {
    const response = await api.post('/teams', team);
    return response.data;
  },

  updateTeam: async (id: string, team: UpdateTeamDto): Promise<Team> => {
    const response = await api.put(`/teams/${id}`, team);
    return response.data;
  },

  deleteTeam: async (id: string): Promise<void> => {
    await api.delete(`/teams/${id}`);
  },

  getTeamMembers: async (id: string): Promise<any[]> => {
    const response = await api.get(`/teams/${id}/members`);
    return response.data;
  },

  assignTeamToSite: async (teamId: string, siteId: string): Promise<void> => {
    await api.post(`/teams/${teamId}/sites/${siteId}`);
  },

  removeTeamFromSite: async (teamId: string, siteId: string): Promise<void> => {
    await api.delete(`/teams/${teamId}/sites/${siteId}`);
  },

  getTeamSites: async (id: string): Promise<any[]> => {
    const response = await api.get(`/teams/${id}/sites`);
    return response.data;
  },

  getTeamStatistics: async (): Promise<any> => {
    const response = await api.get('/teams/statistics');
    return response.data;
  }
};

export default teamsService; 
