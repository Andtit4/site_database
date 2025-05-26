import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    // Obtenir le token depuis le cookie auth_token
    const token = Cookies.get('token');
    
    if (token) {
      console.log('API: Ajout du token d\'authentification à la requête');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('API: Aucun token d\'authentification trouvé');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error.response?.status, error.message);
    
    if (error.response?.status === 401) {
      console.error('API: Erreur 401 - Token invalide ou expiré');

      // Supprimer le token invalide
      Cookies.remove('token');
      Cookies.remove('user_name');
      
      // Afficher un avertissement mais ne pas rediriger automatiquement
      console.warn('Votre session a expiré. Veuillez vous reconnecter.');
    }

    return Promise.reject(error);
  }
);

export default api; 
