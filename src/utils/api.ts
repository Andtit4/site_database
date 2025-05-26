import { getSession } from 'next-auth/react'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

interface RequestOptions extends RequestInit {
  requireAuth?: boolean
}

/**
 * Utilitaire pour faire des appels API avec authentification automatique
 */
export class ApiClient {
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await getSession()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (session?.user?.accessToken) {
      headers.Authorization = `Bearer ${session.user.accessToken}`
    }

    return headers
  }

  private static async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { requireAuth = true, headers = {}, ...fetchOptions } = options

    try {
      const authHeaders = requireAuth ? await this.getAuthHeaders() : { 'Content-Type': 'application/json' }
      
      const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_URL}${endpoint}`
      
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...authHeaders,
          ...headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.message || 'API Error',
          status: response.status,
        }
      }

      return {
        data,
        status: response.status,
      }
    } catch (error) {
      console.error('API Client Error:', error)
      
return {
        error: error instanceof Error ? error.message : 'Network Error',
        status: 500,
      }
    }
  }

  /**
   * GET request
   */
  static async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  static async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  static async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  static async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * PATCH request
   */
  static async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

/**
 * Raccourcis pour les méthodes courantes
 */
export const api = {
  get: ApiClient.get,
  post: ApiClient.post,
  put: ApiClient.put,
  delete: ApiClient.delete,
  patch: ApiClient.patch,
}

export default ApiClient 
