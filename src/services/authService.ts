import api from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isDepartmentAdmin: boolean;
  isTeamMember: boolean;
  departmentId?: number;
  teamId?: number;
  hasDepartmentRights: boolean;
  managedEquipmentTypes: string[] | null;
  isActive: boolean;
  lastLogin?: string | Date;
  createdAt: string | Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;

  // Authentification
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('authService: Début de la connexion pour', credentials.username);
    
    try {
      const response = await api.post('/auth/login', credentials);

      console.log('authService: Réponse de connexion reçue:', response.status);
      
      if (!response.data || !response.data.accessToken) {
        throw new Error('Format de réponse invalide - token manquant');
      }

      const { accessToken, ...userData } = response.data;
      
      // Construire l'objet utilisateur avec les bonnes propriétés
      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isAdmin: userData.isAdmin,
        isDepartmentAdmin: userData.isDepartmentAdmin,
        isTeamMember: userData.isTeamMember,
        departmentId: userData.departmentId,
        teamId: userData.teamId,
        hasDepartmentRights: userData.hasDepartmentRights,
        managedEquipmentTypes: userData.managedEquipmentTypes || [],
        isActive: true, // Par défaut lors de la connexion
        lastLogin: userData.lastLogin,
        createdAt: userData.createdAt
      };

      // Stocker les données d'authentification
      this.setToken(accessToken);
      this.setUser(user);
      
      console.log('authService: Connexion réussie, token et utilisateur stockés');
      
      return { user, token: accessToken };
    } catch (error: any) {
      console.error('authService: Erreur lors de la connexion:', error.message);
      
      // Nettoyage en cas d'erreur
      this.clearAuth();
      
      throw error;
    }
  }

  // Déconnexion
  logout(): void {
    console.log('authService: Déconnexion');
    this.clearAuth();
  }

  // Récupérer l'utilisateur actuel depuis le serveur
  async getCurrentUser(): Promise<User | null> {
    console.log('authService: Début de fetchCurrentUser');
    
    if (!this.isAuthenticated()) {
      console.log('authService: Pas de token, utilisateur non connecté');
      
return null;
    }

    try {
      console.log('authService: Appel API /auth/me');
      const response = await api.get('/auth/me');
      
      const userData = response.data;

      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isAdmin: userData.isAdmin,
        isDepartmentAdmin: userData.isDepartmentAdmin,
        isTeamMember: userData.isTeamMember,
        departmentId: userData.departmentId,
        teamId: userData.teamId,
        hasDepartmentRights: userData.hasDepartmentRights,
        managedEquipmentTypes: userData.managedEquipmentTypes || [],
        isActive: userData.isActive ?? true,
        lastLogin: userData.lastLogin,
        createdAt: userData.createdAt
      };

      this.setUser(user);
      console.log('authService: Utilisateur récupéré et mis à jour:', user.username);
      
      return user;
    } catch (error: any) {
      console.error('authService: Erreur lors de la récupération de l\'utilisateur:', error.message);
      
      // Si le token est invalide, nettoyer l'authentification
      if (error.response?.status === 401) {
        console.log('authService: Token invalide, nettoyage de l\'authentification');
        this.clearAuth();
      }
      
      return null;
    }
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    const token = this.getToken();
    const isAuth = Boolean(token);

    console.log('authService: Vérification d\'authentification:', isAuth ? 'Authentifié' : 'Non authentifié');
    
return isAuth;
  }

  // Gestion du token
  private setToken(token: string): void {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
    
    // Stocker également dans un cookie pour le middleware
    document.cookie = `token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    
    console.log('authService: Token stocké dans localStorage et cookie');
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem(TOKEN_KEY);
    }

    
return this.token;
  }

  private removeToken(): void {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
    
    // Supprimer également le cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    console.log('authService: Token supprimé du localStorage et cookie');
  }

  // Gestion de l'utilisateur
  private setUser(user: User): void {
    this.currentUser = user;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getCachedUser(): User | null {
    if (!this.currentUser) {
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
        } catch (error) {
          console.error('authService: Erreur lors du parsing de l\'utilisateur stocké');
          localStorage.removeItem(USER_KEY);
        }
      }
    }

    
return this.currentUser;
  }

  private removeUser(): void {
    this.currentUser = null;
    localStorage.removeItem(USER_KEY);
  }

  // Nettoyer toutes les données d'authentification
  private clearAuth(): void {
    this.removeToken();
    this.removeUser();
    console.log('authService: Authentification nettoyée');
  }

  // Méthode de diagnostic
  diagnose(): void {
    console.log('=== DIAGNOSTIC AUTH SERVICE ===');
    console.log('Token présent:', Boolean(this.getToken()));
    console.log('Utilisateur en cache:', Boolean(this.getCachedUser()));
    console.log('Authentifié:', this.isAuthenticated());
    console.log('Token value:', this.getToken()?.substring(0, 20) + '...');
    console.log('User cache:', this.getCachedUser()?.username);
    
    // Vérifier le cookie aussi
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    console.log('Cookie token présent:', Boolean(cookieToken));
    console.log('Cookie token value:', cookieToken?.substring(0, 20) + '...');
    console.log('================================');
  }
}

const authService = new AuthService();

export default authService; 
