'use client'

import { useState, useEffect } from 'react'
import { Box, Typography, Button, Alert, Card, CardContent } from '@mui/material'
import { useAuth } from '@/hooks/useAuth'
import { useSitesWithPermissions } from '@/hooks/useSitesWithPermissions'

export default function DebugApiPage() {
  const [apiCalls, setApiCalls] = useState<string[]>([])
  const [testActive, setTestActive] = useState(false)
  const { user, loading: authLoading } = useAuth()
  
  // Test avec le hook useSitesWithPermissions
  const { 
    sites, 
    loading: sitesLoading, 
    error: sitesError 
  } = useSitesWithPermissions({
    filters: { showDeleted: false },
    autoFetch: testActive
  })

  // Enregistrer les appels API
  useEffect(() => {
    if (testActive) {
      const originalFetch = window.fetch
      let callCount = 0
      
      window.fetch = (...args) => {
        callCount++
        const url = args[0]?.toString() || 'Unknown'
        const timestamp = new Date().toLocaleTimeString()
        setApiCalls(prev => [...prev, `${timestamp} - Appel #${callCount}: ${url}`])
        
        // Arrêter après 10 appels pour éviter le spam
        if (callCount > 10) {
          setTestActive(false)
          setApiCalls(prev => [...prev, `ARRÊT - Plus de 10 appels détectés!`])
        }
        
        return originalFetch(...args)
      }
      
      return () => {
        window.fetch = originalFetch
      }
    }
  }, [testActive])

  const startTest = () => {
    setApiCalls([])
    setTestActive(true)
    setTimeout(() => setTestActive(false), 10000) // Arrêter après 10 secondes
  }

  const stopTest = () => {
    setTestActive(false)
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Diagnostic API - Test des boucles infinies
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Status</Typography>
          <Typography>Utilisateur connecté: {user?.username || 'Non connecté'}</Typography>
          <Typography>Chargement auth: {authLoading ? 'Oui' : 'Non'}</Typography>
          <Typography>Chargement sites: {sitesLoading ? 'Oui' : 'Non'}</Typography>
          <Typography>Nombre de sites: {sites.length}</Typography>
          <Typography>Test actif: {testActive ? 'Oui' : 'Non'}</Typography>
          {sitesError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Erreur sites: {sitesError}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Box sx={{ mb: 4 }}>
        <Button 
          variant="contained" 
          onClick={startTest} 
          disabled={testActive}
          sx={{ mr: 2 }}
        >
          Démarrer le test (10 sec)
        </Button>
        <Button 
          variant="outlined" 
          onClick={stopTest} 
          disabled={!testActive}
        >
          Arrêter le test
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Appels API détectés ({apiCalls.length})
          </Typography>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {apiCalls.map((call, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 1, fontFamily: 'monospace' }}>
                {call}
              </Typography>
            ))}
            {apiCalls.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Aucun appel API détecté. Démarrez le test pour commencer la surveillance.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
} 
