'use client'

import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useApi } from '@/hooks/useApi'
import type { User } from '@/types/api'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

/**
 * Composant exemple montrant comment utiliser l'API avec les hooks personnalisés
 */
export default function UserProfile() {
  const { data: session, status } = useSession()
  const { 
    data: userProfile, 
    loading, 
    error, 
    get: fetchProfile 
  } = useApi<User>()

  // Récupérer le profil utilisateur au chargement
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile(`/api/users/${session.user.id}`)
    }
  }, [session?.user?.id, fetchProfile])

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (!session) {
    return (
      <Alert severity="warning">
        Vous devez être connecté pour voir cette page.
      </Alert>
    )
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'error'
      case 'department_admin':
        return 'warning'
      case 'team_member':
        return 'info'
      default:
        return 'default'
    }
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur'
      case 'department_admin':
        return 'Admin Département'
      case 'team_member':
        return 'Membre Équipe'
      default:
        return 'Utilisateur'
    }
  }

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar 
            src={session.user.image || '/images/avatars/1.png'}
            sx={{ width: 64, height: 64 }}
          >
            {session.user.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" component="h2">
              {session.user.name || 'Utilisateur'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {session.user.email}
            </Typography>
            <Chip 
              label={getRoleLabel(session.user.role)} 
              color={getRoleColor(session.user.role)}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        {loading && (
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <CircularProgress size={20} />
            <Typography variant="body2">
              Chargement du profil...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erreur lors du chargement du profil : {error}
          </Alert>
        )}

        {userProfile && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Informations détaillées
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>ID:</strong> {userProfile.id}
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Nom d'utilisateur:</strong> {userProfile.username}
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Prénom:</strong> {userProfile.firstName}
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Nom:</strong> {userProfile.lastName}
            </Typography>
            {userProfile.departmentId && (
              <Typography variant="body2" paragraph>
                <strong>Département ID:</strong> {userProfile.departmentId}
              </Typography>
            )}
            {userProfile.teamId && (
              <Typography variant="body2" paragraph>
                <strong>Équipe ID:</strong> {userProfile.teamId}
              </Typography>
            )}
            <Typography variant="body2" paragraph>
              <strong>Membre depuis:</strong> {new Date(userProfile.createdAt).toLocaleDateString('fr-FR')}
            </Typography>
            {userProfile.lastLogin && (
              <Typography variant="body2" paragraph>
                <strong>Dernière connexion:</strong> {new Date(userProfile.lastLogin).toLocaleString('fr-FR')}
              </Typography>
            )}
          </Box>
        )}

        <Typography variant="h6" gutterBottom>
          Session NextAuth
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Token d'accès:</strong> {session.user.accessToken ? '✅ Présent' : '❌ Absent'}
        </Typography>

        <Box display="flex" gap={2} mt={3}>
          <Button 
            variant="outlined" 
            onClick={() => fetchProfile(`/api/users/${session.user.id}`)}
            disabled={loading}
          >
            Actualiser le profil
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleLogout}
          >
            Se déconnecter
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
} 
