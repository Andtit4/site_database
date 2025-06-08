import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Augmenter le timeout à 30 secondes temporairement
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      console.log(`API: Ajout du token d'authentification à la requête ${config.method?.toUpperCase()} ${config.url}`);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log(`API: Aucun token trouvé pour la requête ${config.method?.toUpperCase()} ${config.url}`);
    }

    console.log(`API: Début de la requête ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API: Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    console.log(`API: Réponse reçue ${response.status} pour ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    const { config, response, code, message } = error;

    if (code === 'ECONNABORTED') {
      console.error(`API: Timeout (${config?.timeout}ms) pour ${config?.method?.toUpperCase()} ${config?.url}:`, message);
    } else if (code === 'ECONNREFUSED') {
      console.error(`API: Connexion refusée pour ${config?.method?.toUpperCase()} ${config?.url}:`, message);
    } else if (response) {
      console.error(`API: Erreur ${response.status} pour ${config?.method?.toUpperCase()} ${config?.url}:`, response.data || message);
      
      // Si erreur 401, supprimer le token
      if (response.status === 401) {
        console.log('API: Token invalide, suppression du localStorage');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    } else {
      console.error(`API: Erreur réseau pour ${config?.method?.toUpperCase()} ${config?.url}:`, message);
    }

    return Promise.reject(error);
  }
);

export default api; 
