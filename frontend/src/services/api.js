import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

// Configuration de base de l'instance Axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Gestionnaire d'erreurs simplifié
const handleError = (error) => {
  // Si c'est une erreur Axios avec une réponse
  if (error.response) {
    return {
      message: error.response.data?.message || 'Erreur serveur',
      status: error.response.status
    };
  }
  
  // Si c'est une erreur réseau
  if (error.request) {
    return {
      message: 'Impossible de contacter le serveur',
      status: 'NETWORK_ERROR'
    };
  }
  
  // Pour toute autre erreur
  return {
    message: error.message || 'Une erreur inattendue est survenue',
    status: 'UNKNOWN_ERROR'
  };
};

// Ajout du token aux requêtes
// Intercepteur de requête pour ajouter le token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Erreur intercepteur requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('❌ Erreur interceptée:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(handleError(error));
  }
);

const api = {
  auth: {
    login: async (credentials) => {
      try {
        console.log('📤 Tentative de connexion avec:', {
          email: credentials.email,
          passwordLength: credentials.password?.length
        });

        if (!credentials.email || !credentials.password) {
          throw new Error('Email et mot de passe requis');
        }

        const response = await axiosInstance.post('/auth/login', credentials);
        console.log('📥 Réponse du serveur:', {
          success: !!response,
          hasToken: !!response?.token,
          hasUser: !!response?.user
        });
        
        if (response.token && response.user) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          return response;
        } else {
          throw new Error('Réponse invalide du serveur');
        }
      } catch (error) {
        console.error('❌ Erreur de connexion:', {
          status: error.status,
          message: error.message,
          response: error.response?.data
        });
        throw handleError(error);
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    },

    verify: async () => {
      try {
        return await axiosInstance.get('/auth/verify');
      } catch (error) {
        throw handleError(error);
      }
    }
  },

  users: {
    getAll: async () => {
      try {
        return await axiosInstance.get('/users');
      } catch (error) {
        throw handleError(error);
      }
    },
    
    getOne: async (id) => {
      try {
        if (!id) throw new Error('ID utilisateur requis');
        return await axiosInstance.get(`/users/${id}`);
      } catch (error) {
        throw handleError(error);
      }
    },
    
    create: async (data) => {
      try {
        if (!data.email || !data.password || !data.name) {
          throw new Error('Email, mot de passe et nom requis');
        }
        return await axiosInstance.post('/users', data);
      } catch (error) {
        throw handleError(error);
      }
    },
    
    update: async (id, data) => {
      try {
        console.log('Envoi mise à jour:', { id, data });
        const response = await axiosInstance.patch(`/projects/${id}`, data);
        console.log('Réponse mise à jour:', response);
        return response;
      } catch (error) {
        console.error('Erreur mise à jour:', error);
        throw handleError(error);
      }
    },
    
    delete: async (id) => {
      try {
        if (!id) throw new Error('ID utilisateur requis');
        return await axiosInstance.delete(`/users/${id}`);
      } catch (error) {
        throw handleError(error);
      }
    }
  },
  
  //ajoutons d'abord les méthodes pour gérer les paramètres
   settings: {
      get: async () => {
        try {
          const response = await axiosInstance.get('/settings');
          return response;
        } catch (error) {
          console.error('Erreur récupération paramètres:', error);
          throw error;
        }
      },
      update: async (settings) => {
        try {
          const token = localStorage.getItem('token'); // Vérification du token
          console.log('Token présent:', !!token); // Debug
          
          const response = await axiosInstance.put('/settings', settings);
          return response;
        } catch (error) {
          console.error('Erreur mise à jour paramètres:', error);
          throw error;
        }
      }
    },

  projects: {
    getAll: async () => {
      try {
        return await axiosInstance.get('/projects');
      } catch (error) {
        throw handleError(error);
      }
    },
    
    getOne: async (id) => {
      try {
        if (!id) throw new Error('ID projet requis');
        return await axiosInstance.get(`/projects/${id}`);
      } catch (error) {
        throw handleError(error);
      }
    },
    
    create: async (projectData) => {
      try {
        const response = await axiosInstance.post('/projects', projectData);
        return response;
      } catch (error) {
        console.error('Erreur création projet:', error.response?.data || error);
        throw error;
      }
    },
    
    update: async (id, data) => {
      try {
        if (!id) throw new Error('ID projet requis');
        return await axiosInstance.patch(`/projects/${id}`, data);
      } catch (error) {
        throw handleError(error);
      }
    },
    
    delete: async (id) => {
      try {
        if (!id) throw new Error('ID projet requis');
        return await axiosInstance.delete(`/projects/${id}`);
      } catch (error) {
        throw handleError(error);
      }
    }
  }
};

export default api;