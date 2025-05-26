'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import Cookies from 'js-cookie'
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

import api from '@/services/api'

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
    const token = Cookies.get('auth_token')

    if (token) {
      const lang = params.lang || 'fr'

      router.push(`/${lang}/telecom-dashboard`)
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
      
      console.log('Tentative de connexion avec l\'API backend...');
   
      try {
        // Essayer de se connecter au backend API
        const response = await api.post('/auth/login', { username, password });
        
        if (response.data && response.data.accessToken) {
          // Enregistrer le token JWT retourné par l'API
		  console.log('Token reçu:', response.data.accessToken);
          const token = response.data.accessToken;

          Cookies.set('token', token, { expires: 1 });
          Cookies.set('user_name', username, { expires: 1 });
          
          console.log('Connexion API réussie, token reçu');
          
          // Rediriger vers le tableau de bord
          const lang = params.lang || 'fr';

          router.push(`/${lang}/telecom-dashboard`);
        } else {
          throw new Error('Format de réponse invalide');
        }
      } catch (apiError: any) {
        console.warn('Erreur API, utilisation du mode de secours:', apiError.message);
        
        // En cas d'erreur API, utiliser un token de secours pour le développement
       /*  const fallbackToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        
        Cookies.set('auth_token', fallbackToken, { expires: 1 });
        Cookies.set('user_name', username, { expires: 1 });
        
        console.log('Mode secours activé, token de secours utilisé'); */
        
        // Rediriger vers le tableau de bord même en mode secours
        const lang = params.lang || 'fr';

        router.push(`/${lang}/telecom-dashboard`);
      }
    } catch (err: any) {
      console.error('Erreur générale de connexion:', err);
      setError(err.message || 'Erreur lors de la connexion. Veuillez réessayer.');
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
        </CardContent>
      </Card>
    </Box>
  )
}

export default LoginPage 
