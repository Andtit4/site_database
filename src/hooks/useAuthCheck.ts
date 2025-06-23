'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import authService from '@/services/authService'

/**
 * Hook personnalisé pour vérifier périodiquement l'expiration du token
 * et rediriger automatiquement vers la page de login si nécessaire
 */
export const useAuthCheck = () => {
  const router = useRouter()
  const pathname = usePathname()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Ne pas démarrer la vérification sur les pages publiques
    const isPublicRoute = pathname.includes('/auth/') || 
                         pathname.includes('/assets/') || 
                         pathname.includes('/images/')
    
    if (isPublicRoute) {
      return
    }

    // Fonction pour vérifier l'authentification
    const checkAuthStatus = () => {
      if (!authService.checkTokenAndRedirect()) {
        // Si la fonction retourne false, le token est expiré et la redirection est en cours
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }

    // Vérification initiale
    checkAuthStatus()

    // Vérification périodique toutes les 30 secondes
    intervalRef.current = setInterval(checkAuthStatus, 30000)

    // Nettoyer l'intervalle au démontage du composant
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [pathname, router])

  // Vérifier lors des changements de focus de la page
  useEffect(() => {
    const handleFocus = () => {
      const isPublicRoute = pathname.includes('/auth/') || 
                           pathname.includes('/assets/') || 
                           pathname.includes('/images/')
      
      if (!isPublicRoute) {
        authService.checkTokenAndRedirect()
      }
    }

    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [pathname])
} 
