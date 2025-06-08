'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material'

import authService from '@/services/authService'

const LoginPage = () => {
  const router = useRouter()
  const params = useParams()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    console.log('LoginPage: Vérification de l\'authentification existante');
    
    const isAuthenticated = authService.isAuthenticated()
    
    if (isAuthenticated) {
      console.log('LoginPage: Utilisateur déjà authentifié, redirection');
      const lang = params.lang || 'fr'
      router.push(`/${lang}/dashboard/telecom-dashboard`)
    } else {
      console.log('LoginPage: Utilisateur non authentifié');
    }
  }, [params.lang, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('LoginPage: Tentative de connexion pour', username);
      
      // Utiliser le service d'authentification
      const { user, token } = await authService.login({ username, password });
      
      console.log('LoginPage: Connexion réussie pour', user.username);
      console.log('LoginPage: Token reçu:', token ? 'Oui' : 'Non');
      
      // Rediriger vers le tableau de bord
      const lang = params.lang || 'fr';
      console.log('LoginPage: Redirection vers', `/${lang}/dashboard/telecom-dashboard`);
      
      router.push(`/${lang}/dashboard/telecom-dashboard`);
      
    } catch (err: any) {
      console.error('LoginPage: Erreur de connexion:', err.message);
      
      if (err.response?.status === 401) {
        setError('Nom d\'utilisateur ou mot de passe incorrect');
      } else if (err.code === 'ECONNABORTED') {
        setError('Délai d\'attente dépassé. Vérifiez votre connexion réseau.');
      } else if (err.message?.includes('ECONNREFUSED')) {
        setError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
      } else {
        setError(err.message || 'Erreur lors de la connexion. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #7367F0 0%, #9E95F5 100%)'
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
              Site Database
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestion des sites de télécommunications
            </Typography>
            <Typography variant="caption" color="primary" sx={{ mt: 2, display: 'block' }}>
              Connexion avec authentification backend
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              label="Nom d'utilisateur"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <TextField
              label="Mot de passe"
              variant="outlined"
              fullWidth
              margin="normal"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? 'Masquer' : 'Voir'}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Se connecter'}
            </Button>
          </form>
          
          {/* Informations de debug en mode développement */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Mode développement - Credentials par défaut : admin/password
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default LoginPage 
