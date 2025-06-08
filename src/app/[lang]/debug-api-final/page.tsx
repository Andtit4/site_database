'use client'

import { useState, useEffect } from 'react'
import { Box, Typography, Paper, Button, Alert } from '@mui/material'

export default function DebugApiPage() {
  const [apiCalls, setApiCalls] = useState<string[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)

  // Monitorer les appels API en interceptant fetch
  useEffect(() => {
    if (!isMonitoring) return

    const originalFetch = global.fetch
    const callLog: string[] = []

    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString()
      const timestamp = new Date().toLocaleTimeString()
      const logEntry = `${timestamp} - ${init?.method || 'GET'} ${url}`
      
      callLog.push(logEntry)
      setApiCalls(prev => [...prev, logEntry])
      
      console.log('API Call:', logEntry)
      
      return originalFetch(input, init)
    }

    return () => {
      global.fetch = originalFetch
    }
  }, [isMonitoring])

  const startMonitoring = () => {
    setApiCalls([])
    setIsMonitoring(true)
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
  }

  const clearLog = () => {
    setApiCalls([])
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Moniteur des appels API - Test Final
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Cette page permet de vérifier qu'il n'y a plus d'appels API continuels.
        Activez le monitoring, allez sur le dashboard et les sites, puis revenez ici pour voir les résultats.
      </Alert>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={startMonitoring}
          disabled={isMonitoring}
        >
          Démarrer le monitoring
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={stopMonitoring}
          disabled={!isMonitoring}
        >
          Arrêter le monitoring
        </Button>
        <Button 
          variant="outlined" 
          onClick={clearLog}
        >
          Vider le log
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Statut: {isMonitoring ? '🔴 Monitoring actif' : '⭕ Monitoring arrêté'}
      </Typography>

      <Typography variant="h6" gutterBottom>
        Nombre d'appels API: {apiCalls.length}
      </Typography>

      <Paper sx={{ p: 2, maxHeight: '400px', overflow: 'auto' }}>
        {apiCalls.length === 0 ? (
          <Typography color="text.secondary">
            Aucun appel API enregistré
          </Typography>
        ) : (
          <Box>
            {apiCalls.map((call, index) => (
              <Typography 
                key={index} 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace', 
                  mb: 0.5,
                  color: call.includes('/api/') ? 'primary.main' : 'text.primary'
                }}
              >
                {call}
              </Typography>
            ))}
          </Box>
        )}
      </Paper>

      <Alert severity="success" sx={{ mt: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Test réussi si :
        </Typography>
        <Typography variant="body2" component="div">
          • Pas d'appels API répétitifs toutes les secondes<br/>
          • Les appels API ne se déclenchent que lors d'actions utilisateur<br/>
          • Le dashboard se charge une seule fois au démarrage<br/>
          • La page des sites se charge une seule fois au démarrage
        </Typography>
      </Alert>
    </Box>
  )
} 
