'use client'

import { Box, Typography, Card, CardContent, Grid, Chip, Alert } from '@mui/material'
import { useAuth } from '@/hooks/useAuth'

export default function TestPermissionsPage() {
  const { 
    user, 
    loading,
    canViewAllResources,
    canViewSpecifications,
    canManageUsers,
    canViewSiteSpecifications,
    canViewEquipmentSpecifications,
    canViewUser,
    canCreate,
    canEdit,
    canDelete,
    getUserDepartmentId,
    getUserTeamId
  } = useAuth()

  if (loading) {
    return <Typography>Chargement...</Typography>
  }

  if (!user) {
    return <Typography>Utilisateur non connecté</Typography>
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Test des Permissions - {user.username}
      </Typography>

      <Grid container spacing={3}>
        {/* Informations utilisateur */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Informations Utilisateur</Typography>
              <Typography><strong>Nom:</strong> {user.username}</Typography>
              <Typography><strong>Email:</strong> {user.email}</Typography>
              <Typography><strong>Prénom:</strong> {user.firstName}</Typography>
              <Typography><strong>Nom:</strong> {user.lastName}</Typography>
              <Typography><strong>Département ID:</strong> {getUserDepartmentId() || 'Aucun'}</Typography>
              <Typography><strong>Équipe ID:</strong> {getUserTeamId() || 'Aucune'}</Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Rôles:</Typography>
                {user.isAdmin && <Chip label="ADMIN Global" color="error" sx={{ mr: 1, mb: 1 }} />}
                {user.isDepartmentAdmin && <Chip label="Admin Département" color="warning" sx={{ mr: 1, mb: 1 }} />}
                {user.isTeamMember && <Chip label="Membre Équipe" color="info" sx={{ mr: 1, mb: 1 }} />}
                {user.hasDepartmentRights && <Chip label="Droits Département" color="secondary" sx={{ mr: 1, mb: 1 }} />}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Permissions générales */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Permissions Générales</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography>
                  <strong>Voir toutes les ressources:</strong> 
                  <Chip 
                    label={canViewAllResources() ? 'OUI' : 'NON'} 
                    color={canViewAllResources() ? 'success' : 'default'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography>
                  <strong>Gérer les utilisateurs:</strong> 
                  <Chip 
                    label={canManageUsers() ? 'OUI' : 'NON'} 
                    color={canManageUsers() ? 'success' : 'default'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography>
                  <strong>Voir spécifications (général):</strong> 
                  <Chip 
                    label={canViewSpecifications() ? 'OUI' : 'NON'} 
                    color={canViewSpecifications() ? 'success' : 'default'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Permissions spécifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Permissions Spécifications</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography>
                  <strong>Spécifications de sites:</strong> 
                  <Chip 
                    label={canViewSiteSpecifications() ? 'OUI' : 'NON'} 
                    color={canViewSiteSpecifications() ? 'success' : 'error'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography>
                  <strong>Spécifications d'équipements:</strong> 
                  <Chip 
                    label={canViewEquipmentSpecifications() ? 'OUI' : 'NON'} 
                    color={canViewEquipmentSpecifications() ? 'success' : 'error'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Permissions CRUD */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Permissions CRUD</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {['site', 'team', 'equipment'].map((resourceType) => (
                  <Box key={resourceType}>
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize', mb: 0.5 }}>
                      {resourceType}:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                      <Chip 
                        label="Créer" 
                        color={canCreate(resourceType as any) ? 'success' : 'default'}
                        size="small"
                      />
                      <Chip 
                        label="Modifier" 
                        color={canEdit(resourceType as any) ? 'warning' : 'default'}
                        size="small"
                      />
                      <Chip 
                        label="Supprimer" 
                        color={canDelete(resourceType as any) ? 'error' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Règles appliquées */}
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="h6" sx={{ mb: 1 }}>Règles de permissions appliquées:</Typography>
            <ul>
              {user.isAdmin && (
                <li><strong>ADMIN Global:</strong> Accès complet à toutes les fonctionnalités</li>
              )}
              {user.isDepartmentAdmin && !user.isAdmin && (
                <>
                  <li><strong>Admin Département:</strong> Accès au tableau de bord</li>
                  <li><strong>Admin Département:</strong> Voir uniquement les équipes/techniciens de son département</li>
                  <li><strong>Admin Département:</strong> Accès uniquement aux spécifications d'équipements (pas de sites)</li>
                  <li><strong>Admin Département:</strong> Pas d'accès à la gestion des utilisateurs</li>
                </>
              )}
              {user.isTeamMember && !user.isDepartmentAdmin && !user.isAdmin && (
                <li><strong>Membre Équipe:</strong> Accès limité selon son équipe</li>
              )}
            </ul>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  )
} 
