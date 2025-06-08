'use client'

import { useEffect, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Chip, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  CircularProgress, 
  Alert,
  Tooltip
} from '@mui/material'
import { Edit, Delete, Add, Person, AdminPanelSettings, Group } from '@mui/icons-material'

import { useAuth } from '@/hooks/useAuth'
import usersService from '@/services/usersService'
import type { User } from '@/services/authService'

const UsersPage = () => {
  const { user: currentUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const lang = params.lang || 'fr'

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  useEffect(() => {
    if (!authLoading && !currentUser) {
            router.push(`/${lang}/auth/login`)

      return
    }
    
    if (!authLoading && currentUser && !currentUser.isAdmin) {
      // Rediriger les non-admins vers le tableau de bord
            router.push(`/${lang}/dashboard/telecom-dashboard`)

      return
    }
    
    if (!authLoading && currentUser && currentUser.isAdmin) {
      fetchUsers()
    }
  }, [authLoading, currentUser, router, lang])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const usersData = await usersService.getAllUsers()
      
      setUsers(usersData)
    } catch (err: any) {
      console.error('Erreur lors de la récupération des utilisateurs:', err)
      setError('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await usersService.deleteUser(userToDelete.id)
      setUsers(users.filter(u => u.id !== userToDelete.id))
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err)
      setError('Erreur lors de la suppression de l\'utilisateur')
    }
  }

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  const getRoleChip = (user: User) => {
    if (user.isAdmin) {
      return <Chip icon={<AdminPanelSettings />} label="Administrateur" color="error" size="small" />
    }

    if (user.isDepartmentAdmin) {
      return <Chip icon={<Group />} label="Admin Département" color="warning" size="small" />
    }

    if (user.isTeamMember) {
      return <Chip icon={<Person />} label="Membre Équipe" color="info" size="small" />
    }

    
    return <Chip icon={<Person />} label="Utilisateur" color="default" size="small" />
  }

  const getStatusChip = (isActive: boolean) => {
    return (
      <Chip 
        label={isActive ? 'Actif' : 'Inactif'} 
        color={isActive ? 'success' : 'default'} 
        size="small" 
      />
    )
  }

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString

    
return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Afficher le loader pendant l'authentification
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Redirection en cours pour les non-admins
  if (!currentUser || !currentUser.isAdmin) {
    return null
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Gestion des utilisateurs</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push(`/${lang}/dashboard/users/create`)}
        >
          Nouvel utilisateur
        </Button>
      </Box>

      {/* Affichage des erreurs */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader 
          title="Liste des utilisateurs" 
          subheader={`${users.length} utilisateur${users.length > 1 ? 's' : ''} enregistré${users.length > 1 ? 's' : ''}`}
        />
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom d&apos;utilisateur</TableCell>
                    <TableCell>Nom complet</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Dernière connexion</TableCell>
                    <TableCell>Créé le</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {user.username}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleChip(user)}</TableCell>
                      <TableCell>{getStatusChip(user.isActive)}</TableCell>
                      <TableCell>
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Jamais'}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/${lang}/dashboard/users/${user.id}/edit`)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openDeleteDialog(user)}
                            disabled={user.id === currentUser?.id} // Empêcher l'auto-suppression
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="text.secondary">
                          Aucun utilisateur trouvé
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog de suppression */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Supprimer l&apos;utilisateur</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer l&apos;utilisateur &quot;{userToDelete?.username}&quot; ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Annuler</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UsersPage 
