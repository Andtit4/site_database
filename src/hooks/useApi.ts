import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ApiClient, type ApiResponse } from '@/utils/api'
import authService from '@/services/authService'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  requireAuth?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

/**
 * Hook personnalisé pour faciliter les appels API avec gestion d'état
 */
export function useApi<T = any>(options: UseApiOptions = {}) {
  const { requireAuth = true, onSuccess, onError } = options
  const { data: session } = useSession()
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const makeRequest = useCallback(
    async (
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      endpoint: string,
      data?: any
    ): Promise<ApiResponse<T>> => {
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        let response: ApiResponse<T>

        switch (method) {
          case 'GET':
            response = await ApiClient.get<T>(endpoint, { requireAuth })
            break
          case 'POST':
            response = await ApiClient.post<T>(endpoint, data, { requireAuth })
            break
          case 'PUT':
            response = await ApiClient.put<T>(endpoint, data, { requireAuth })
            break
          case 'DELETE':
            response = await ApiClient.delete<T>(endpoint, { requireAuth })
            break
          case 'PATCH':
            response = await ApiClient.patch<T>(endpoint, data, { requireAuth })
            break
          default:
            throw new Error(`Méthode HTTP non supportée: ${method}`)
        }

        if (response.error) {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: response.error || 'Erreur inconnue' 
          }))
          onError?.(response.error)
        } else {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            data: response.data || null 
          }))
          onSuccess?.(response.data)
        }

        return response
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur réseau'
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: errorMessage 
        }))
        onError?.(errorMessage)
        return { error: errorMessage, status: 500 }
      }
    },
    [requireAuth, onSuccess, onError]
  )

  const get = useCallback((endpoint: string) => 
    makeRequest('GET', endpoint), [makeRequest])

  const post = useCallback((endpoint: string, data?: any) => 
    makeRequest('POST', endpoint, data), [makeRequest])

  const put = useCallback((endpoint: string, data?: any) => 
    makeRequest('PUT', endpoint, data), [makeRequest])

  const del = useCallback((endpoint: string) => 
    makeRequest('DELETE', endpoint), [makeRequest])

  const patch = useCallback((endpoint: string, data?: any) => 
    makeRequest('PATCH', endpoint, data), [makeRequest])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  // Intercepteur de réponse pour gérer les erreurs d'authentification
  useEffect(() => {
    const responseInterceptor = ApiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        // Si erreur 401 (Unauthorized), le token a probablement expiré
        if (error.response?.status === 401) {
          console.log('useApi: Erreur 401 détectée, token probablement expiré');
          authService.checkTokenAndRedirect();
        }
        return Promise.reject(error);
      }
    );

    // Nettoyer l'intercepteur lors du démontage du composant
    return () => {
      ApiClient.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return {
    ...state,
    get,
    post,
    put,
    delete: del,
    patch,
    reset,
    isAuthenticated: !!session?.user,
    user: session?.user,
  }
}

/**
 * Hook spécialisé pour les opérations CRUD courantes
 */
export function useCrudApi<T = any>(baseEndpoint: string, options: UseApiOptions = {}) {
  const api = useApi<T>(options)

  const list = useCallback(() => api.get(baseEndpoint), [api, baseEndpoint])
  
  const getById = useCallback((id: string | number) => 
    api.get(`${baseEndpoint}/${id}`), [api, baseEndpoint])
  
  const create = useCallback((data: any) => 
    api.post(baseEndpoint, data), [api, baseEndpoint])
  
  const update = useCallback((id: string | number, data: any) => 
    api.put(`${baseEndpoint}/${id}`, data), [api, baseEndpoint])
  
  const remove = useCallback((id: string | number) => 
    api.delete(`${baseEndpoint}/${id}`), [api, baseEndpoint])

  return {
    ...api,
    list,
    getById,
    create,
    update,
    remove,
  }
}

export default useApi 
