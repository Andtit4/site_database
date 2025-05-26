'use client'

import { useState } from 'react'
import { ApiTester } from '@/utils/testApi'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'

interface TestResult {
  success: boolean
  message: string
  details?: any
}

/**
 * Composant de debug pour tester les connexions API
 */
export default function ApiDebug() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<{
    backend?: TestResult
    nextApi?: TestResult
    allSuccess?: boolean
  } | null>(null)

  const runTests = async () => {
    setTesting(true)
    setResults(null)
    
    try {
      const testResults = await ApiTester.runAllTests()
      setResults(testResults)
    } catch (error) {
      console.error('Erreur lors des tests:', error)
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (success?: boolean) => {
    if (success === undefined) return '⏳'
    return success ? '✅' : '❌'
  }

  const getAlertSeverity = (success?: boolean) => {
    if (success === undefined) return 'info'
    return success ? 'success' : 'error'
  }

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          🔧 Debug API - Test des connexions
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Cet outil teste la connectivité entre le frontend, l'API Next.js et le backend NestJS.
        </Typography>

        <Box mb={3}>
          <Button 
            variant="contained" 
            onClick={runTests}
            disabled={testing}
            startIcon={testing ? <CircularProgress size={20} /> : null}
          >
            {testing ? 'Test en cours...' : 'Lancer les tests'}
          </Button>
        </Box>

        {results && (
          <Box>
            <Alert severity={getAlertSeverity(results.allSuccess)} sx={{ mb: 2 }}>
              <Typography variant="h6">
                Résultat global : {getStatusIcon(results.allSuccess)} 
                {results.allSuccess ? 'Tous les tests ont réussi' : 'Certains tests ont échoué'}
              </Typography>
            </Alert>

            <Accordion>
              <AccordionSummary expandIcon={<i className="tabler-chevron-down" />}>
                <Typography>
                  {getStatusIcon(results.backend?.success)} Backend NestJS
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Alert severity={getAlertSeverity(results.backend?.success)}>
                  <Typography variant="body2">
                    {results.backend?.message}
                  </Typography>
                </Alert>
                {results.backend?.details && (
                  <Box mt={2}>
                    <Typography variant="caption" component="div">
                      Détails techniques :
                    </Typography>
                    <pre style={{ 
                      fontSize: '12px', 
                      backgroundColor: '#f5f5f5', 
                      padding: '8px', 
                      borderRadius: '4px',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(results.backend.details, null, 2)}
                    </pre>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<i className="tabler-chevron-down" />}>
                <Typography>
                  {getStatusIcon(results.nextApi?.success)} API Next.js
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Alert severity={getAlertSeverity(results.nextApi?.success)}>
                  <Typography variant="body2">
                    {results.nextApi?.message}
                  </Typography>
                </Alert>
                {results.nextApi?.details && (
                  <Box mt={2}>
                    <Typography variant="caption" component="div">
                      Détails techniques :
                    </Typography>
                    <pre style={{ 
                      fontSize: '12px', 
                      backgroundColor: '#f5f5f5', 
                      padding: '8px', 
                      borderRadius: '4px',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(results.nextApi.details, null, 2)}
                    </pre>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        )}

        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            📋 Points de vérification
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>Le backend NestJS doit fonctionner sur le port 3001</li>
            <li>L'endpoint <code>/api/auth/login</code> doit être accessible</li>
            <li>L'API Next.js doit pouvoir communiquer avec le backend</li>
            <li>Les variables d'environnement doivent être correctement configurées</li>
          </Typography>
          
          <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
            💡 Astuce : Ouvrez la console de développement pour voir les logs détaillés
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
} 
