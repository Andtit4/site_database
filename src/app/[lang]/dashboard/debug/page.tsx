'use client'

import { useState } from 'react'
import { Box, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material'
import { useAuth } from '@/hooks/useAuth'
import api from '@/services/api'
import authService from '@/services/authService'

const DebugPage = () => {
  const { user, loading } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])
  const [testing, setTesting] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testAuth = async () => {
    setTesting(true)
    setTestResults([])
    
    try {
      addResult('=== TEST D\'AUTHENTIFICATION ===')
      
      // Test 1: Vérifier le token
      const token = authService.getToken()
      addResult(`Token présent: ${!!token}`)
      if (token) {
        addResult(`Token (10 premiers chars): ${token.substring(0, 10)}...`)
      }
      
      // Test 2: Vérifier l'utilisateur en cache
      const cachedUser = authService.getCachedUser()
      addResult(`Utilisateur en cache: ${!!cachedUser}`)
      if (cachedUser) {
        addResult(`Utilisateur: ${cachedUser.username} (Admin: ${cachedUser.isAdmin})`)
      }
      
      // Test 3: Tester /auth/me
      addResult('Test de /auth/me...')
      try {
        const response = await api.get('/auth/me')
        addResult(`✅ /auth/me réussi: ${response.data.username}`)
      } catch (error: any) {
        addResult(`❌ /auth/me échoué: ${error.message}`)
      }
      
      // Test 4: Tester /sites (avec timeout court)
      addResult('Test de /sites...')
      try {
        const startTime = Date.now()
        const response = await api.get('/sites', { timeout: 5000 })
        const duration = Date.now() - startTime
        addResult(`✅ /sites réussi en ${duration}ms: ${response.data.length} sites`)
      } catch (error: any) {
        addResult(`❌ /sites échoué: ${error.message}`)
      }
      
      // Test 5: Diagnostic authService
      addResult('=== DIAGNOSTIC AUTH SERVICE ===')
      authService.diagnose()
      
    } catch (error: any) {
      addResult(`❌ Erreur générale: ${error.message}`)
    } finally {
      setTesting(false)
    }
  }

  const clearAuth = () => {
    localStorage.clear()
    setTestResults([])
    addResult('LocalStorage vidé')
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Page de diagnostic
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          État actuel
        </Typography>
        
        {user ? (
          <Alert severity="success">
            Connecté en tant que: {user.username} (Admin: {user.isAdmin ? 'Oui' : 'Non'})
          </Alert>
        ) : (
          <Alert severity="warning">
            Non connecté
          </Alert>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Actions de test
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            onClick={testAuth}
            disabled={testing}
          >
            {testing ? <CircularProgress size={20} /> : 'Tester l\'authentification'}
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            onClick={clearAuth}
          >
            Vider le cache
          </Button>
        </Box>
      </Paper>

      {testResults.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Résultats des tests
          </Typography>
          
          <Box
            component="pre"
            sx={{
              backgroundColor: '#f5f5f5',
              p: 2,
              borderRadius: 1,
              maxHeight: 400,
              overflow: 'auto',
              fontSize: '0.875rem',
              fontFamily: 'monospace'
            }}
          >
            {testResults.join('\n')}
          </Box>
        </Paper>
      )}
    </Box>
  )
}

export default DebugPage 
