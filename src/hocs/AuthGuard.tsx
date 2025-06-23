'use client'

// Third-party Imports
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'

// Service Imports
import authService from '@/services/authService'

// Loader component for authentication check
const LoadingComponent = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column',
    gap: '10px'
  }}>
    <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #7367F0', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <p>Chargement...</p>
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Fonction pour toujours accepter l'authentification (temporaire pour le développement)
const forcedAuth = false; // DÉSACTIVÉ pour corriger le problème de déconnexion

const AuthGuard = ({ children, locale }: ChildrenType & { locale: Locale }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    console.log('AuthGuard: Vérification du chemin actuel:', pathname);
    
    // Pour éviter les boucles infinies, on vérifie si on est déjà sur la page de login
    const isLoginPage = pathname.includes('/auth/login')
    console.log('AuthGuard: Est page de login?', isLoginPage);
    
    // Si on est déjà sur la page de login, pas besoin de vérifier l'authentification
    if (isLoginPage) {
      setIsAuthenticated(false)
      setIsChecking(false)
      return
    }

    // Vérifier si l'utilisateur est authentifié
    const checkAuth = () => {
      try {
        setIsChecking(true)
        
        // Pour le développement, accepter toujours l'authentification
        if (forcedAuth) {
          console.log('AuthGuard: Mode développement - authentification forcée');
          setIsAuthenticated(true)
          setIsChecking(false)
          return;
        }
        
        // Vérifier si le token d'authentification existe et n'est pas expiré
        const authToken = localStorage.getItem('auth_token')
        console.log('AuthGuard: Token trouvé?', !!authToken);
        
        if (authToken) {
          // Vérifier si le token n'est pas expiré
          if (!authService.isTokenExpired()) {
            setIsAuthenticated(true)
            
            // Démarrer la validation périodique du token
            authService.startTokenValidation();
          } else {
            console.log('AuthGuard: Token expiré, nettoyage et redirection');
            authService.clearAuth()
            setIsAuthenticated(false)
            
            // Rediriger vers la page de connexion
            console.log('AuthGuard: Redirection vers', `/${locale}/auth/login`);
            router.push(`/${locale}/auth/login`)
          }
        } else {
          setIsAuthenticated(false)
          
          // Rediriger vers la page de connexion
          console.log('AuthGuard: Redirection vers', `/${locale}/auth/login`);
          router.push(`/${locale}/auth/login`)
        }
      } catch (error) {
        console.error("AuthGuard: Erreur lors de la vérification de l'authentification:", error)
        setIsAuthenticated(false)
        
        // Rediriger vers la page de connexion
        router.push(`/${locale}/auth/login`)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [locale, router, pathname])

  // Afficher un état de chargement pendant la vérification
  if (isChecking) {
    console.log('AuthGuard: Affichage du chargement');
    return <LoadingComponent />
  }

  // Si l'utilisateur n'est pas authentifié et qu'on n'est pas sur la page de login,
  // ne rien afficher (la redirection est en cours)
  if (!isAuthenticated && !pathname.includes('/auth/login')) {
    console.log('AuthGuard: Non authentifié et pas sur login - Redirection en cours');
    return <LoadingComponent />
  }

  // Afficher les enfants si l'utilisateur est authentifié ou si on est sur la page de login
  console.log('AuthGuard: Affichage du contenu');
  return <>{children}</>
}

export default AuthGuard
