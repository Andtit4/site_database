/**
 * Utilitaire pour tester la connexion à l'API backend
 */
export class ApiTester {
  private static readonly BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

  /**
   * Tester la connexion au backend
   */
  static async testBackendConnection(): Promise<{
    success: boolean
    message: string
    details?: any
  }> {
    try {
      console.log('🔍 Test de connexion au backend:', this.BACKEND_URL)
      
      const response = await fetch(`${this.BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'test@test.com',
          password: 'wrongpassword'
        })
      })

      console.log('📡 Réponse du backend:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      const data = await response.text()
      
      if (response.status === 401) {
        return {
          success: true,
          message: 'Backend accessible (erreur 401 attendue avec de mauvais identifiants)',
          details: { status: response.status, data }
        }
      }

      return {
        success: true,
        message: 'Backend accessible',
        details: { status: response.status, data }
      }

    } catch (error) {
      console.error('❌ Erreur de connexion au backend:', error)
      return {
        success: false,
        message: `Impossible de se connecter au backend: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        details: { error: error instanceof Error ? error.message : error }
      }
    }
  }

  /**
   * Tester l'API Next.js de login
   */
  static async testNextApiLogin(): Promise<{
    success: boolean
    message: string
    details?: any
  }> {
    try {
      console.log('🔍 Test de l\'API Next.js login')
      
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'wrongpassword'
        })
      })

      console.log('📡 Réponse de l\'API Next.js:', {
        status: response.status,
        statusText: response.statusText
      })

      const data = await response.json()

      if (response.status === 401) {
        return {
          success: true,
          message: 'API Next.js accessible (erreur 401 attendue avec de mauvais identifiants)',
          details: { status: response.status, data }
        }
      }

      return {
        success: true,
        message: 'API Next.js accessible',
        details: { status: response.status, data }
      }

    } catch (error) {
      console.error('❌ Erreur de l\'API Next.js:', error)
      return {
        success: false,
        message: `Erreur API Next.js: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        details: { error: error instanceof Error ? error.message : error }
      }
    }
  }

  /**
   * Lancer tous les tests
   */
  static async runAllTests() {
    console.log('🧪 === Tests de connexion API ===')
    
    const backendTest = await this.testBackendConnection()
    console.log('🌐 Backend:', backendTest.success ? '✅' : '❌', backendTest.message)
    if (backendTest.details) console.log('   Détails:', backendTest.details)
    
    const nextApiTest = await this.testNextApiLogin()
    console.log('⚡ Next.js API:', nextApiTest.success ? '✅' : '❌', nextApiTest.message)
    if (nextApiTest.details) console.log('   Détails:', nextApiTest.details)
    
    console.log('🧪 === Fin des tests ===')
    
    return {
      backend: backendTest,
      nextApi: nextApiTest,
      allSuccess: backendTest.success && nextApiTest.success
    }
  }
}

export default ApiTester 
