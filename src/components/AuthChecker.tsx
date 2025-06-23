'use client'

import { useAuthCheck } from '@/hooks/useAuthCheck'

/**
 * Composant pour vérifier automatiquement l'expiration du token
 * Ce composant doit être inclus dans le layout principal
 */
export const AuthChecker = () => {
  // Démarrer la vérification automatique de l'expiration du token
  useAuthCheck()

  // Ce composant ne rend rien visuellement
  return null
} 
