'use client'

import { useEffect, useState, useCallback } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { Card, CardContent, CardHeader, Grid, Typography, Box, Button, Divider, Alert, CircularProgress } from '@mui/material'

import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'

import { equipmentService, teamsService, departmentsService } from '@/services'
import siteSpecificationsService from '@/services/siteSpecificationsService'
import { SiteStatus } from '@/services/sitesService'
import { useAuth } from '@/hooks/useAuth'
import { useSitesWithPermissions } from '@/hooks/useSitesWithPermissions'

// Importer les composants de la bibliothèque Recharts pour les graphiques

const TelecomDashboardPage = () => {
  const { 
    user, 
    loading: authLoading, 
    canViewAllResources 
  } = useAuth()
  
  // Utiliser le hook pour les sites avec gestion des permissions
  const { 
    sites, 
    loading: sitesLoading, 
    error: sitesError, 
    permissionError: sitesPermissionError,
    refreshSites 
  } = useSitesWithPermissions({
    filters: { showDeleted: false }, // Charge seulement les sites non supprimés pour le dashboard
    autoFetch: false // Désactivé pour éviter les chargements automatiques continuels
  });
  
  const [stats, setStats] = useState({
    totalSites: 0,
    totalEquipment: 0,
    totalTeams: 0,
    totalDepartments: 0,
    equipmentByType: [] as { name: string; value: number }[],
    sitesByRegion: [] as { name: string; value: number }[],
    sitesByType: [] as { name: string; value: number }[],
    sitesByStatus: [] as { name: string; value: number }[],
    equipmentStatus: [] as { name: string; value: number }[]
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const params = useParams()
  const lang = params.lang || 'fr'

  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1']

  // Charger les données initiales une seule fois
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Charger les sites et autres données en parallèle
      const promises: Promise<any>[] = [
        refreshSites(), // Charger les sites une fois
        equipmentService.getAllEquipment(),
        teamsService.getAllTeams(),
        departmentsService.getAllDepartments(),
        siteSpecificationsService.getAllSiteSpecifications()
      ]

      const [, equipmentData, teamsData, departmentsData] = await Promise.all(promises)

      // Calculer les statistiques d'équipement par type
      const equipmentByType = Object.entries(
        equipmentData.reduce((acc, equipment) => {
          const type = equipment.type || 'Inconnu'

          acc[type] = (acc[type] || 0) + 1
          
return acc
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value }))

      // Calculer les statistiques d'équipement par statut
      const equipmentStatus = Object.entries(
        equipmentData.reduce((acc, equipment) => {
          acc[equipment.status] = (acc[equipment.status] || 0) + 1
          
return acc
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value }))

      setStats(prev => ({
        ...prev,
        totalEquipment: equipmentData.length,
        totalTeams: teamsData.length,
        totalDepartments: departmentsData.length,
        equipmentByType,
        equipmentStatus
      }))
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }, [refreshSites])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${lang}/auth/login`)
      
return
    }
    
    if (!authLoading && user) {
      fetchInitialData()
    }
  }, [authLoading, user]) // RETIRÉ router, lang, fetchInitialData pour éliminer la boucle

  // Mettre à jour seulement les statistiques de sites quand ils changent
  useEffect(() => {
    if (!sitesLoading && sites.length > 0) {
      // updateSitesStats()
    }
  }, [sites])

  // Fonction updateSitesStats supprimée car elle n'est plus utilisée

  // Fonction pour obtenir un libellé lisible pour les statuts
  const getStatusLabel = (status: string) => {
    switch (status) {
      case SiteStatus.ACTIVE:
        return 'Actif'
      case SiteStatus.MAINTENANCE:
        return 'Maintenance'
      case SiteStatus.INACTIVE:
        return 'Inactif'
      case SiteStatus.UNDER_CONSTRUCTION:
        return 'En construction'
      case SiteStatus.DELETED:
        return 'Supprimé'
      default:
        return status
    }
  }

  // Afficher le loader pendant l'authentification
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Rediriger si l'utilisateur n'est pas authentifié
  if (!user) {
    return null
  }

  if (loading || sitesLoading) {
    return <Typography>Chargement des données...</Typography>
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Tableau de bord Télécommunications</Typography>
        <Button 
          variant="outlined"
          onClick={fetchInitialData}
          disabled={loading || sitesLoading}
        >
          {(loading || sitesLoading) ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </Box>

      {/* Alerte pour les erreurs de permissions */}
      {sitesPermissionError && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Accès limité aux données des sites
          </Typography>
          <Typography variant="body2">
            Votre compte n&apos;a pas les permissions nécessaires pour accéder aux données des sites. 
            Les statistiques affichées se basent uniquement sur les équipements, équipes et départements accessibles.
            {!canViewAllResources() && (
              <> Vous ne pouvez voir que les ressources de votre département.</>
            )}
          </Typography>
        </Alert>
      )}

      {/* Erreur sites */}
      {sitesError && (
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Erreur lors du chargement des sites
          </Typography>
          <Typography variant="body2">
            {sitesError}
          </Typography>
        </Alert>
      )}

      {/* Cartes de statistiques */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader title="Sites" />
            <CardContent>
              <Typography variant="h3">{sitesPermissionError ? 'N/A' : stats.totalSites}</Typography>
              <Typography variant="body2" color="text.secondary">
                {sitesPermissionError ? 'Accès restreint' : 'Sites actifs'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader title="Équipements" />
            <CardContent>
              <Typography variant="h3">{stats.totalEquipment}</Typography>
              <Typography variant="body2" color="text.secondary">Équipements totaux</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader title="Équipes" />
            <CardContent>
              <Typography variant="h3">{stats.totalTeams}</Typography>
              <Typography variant="body2" color="text.secondary">Équipes actives</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader title="Départements" />
            <CardContent>
              <Typography variant="h3">{stats.totalDepartments}</Typography>
              <Typography variant="body2" color="text.secondary">Départements actifs</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {!sitesPermissionError && (
        <>
          <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>Statistiques des Sites</Typography>
          <Divider sx={{ mb: 4 }} />

          {/* Graphiques des sites */}
          <Grid container spacing={4}>
            {/* Graphique des sites par région */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Sites par région" />
                <CardContent sx={{ height: 300 }}>
                  {stats.sitesByRegion.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.sitesByRegion}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.sitesByRegion.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography color="text.secondary">Aucune donnée disponible</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Graphique des sites par type */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Sites par type" />
                <CardContent sx={{ height: 300 }}>
                  {stats.sitesByType.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.sitesByType}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name="Nombre de sites" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography color="text.secondary">Aucune donnée disponible</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Graphique des statuts de sites */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Statut des sites" />
                <CardContent sx={{ height: 300 }}>
                  {stats.sitesByStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.sitesByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.sitesByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography color="text.secondary">Aucune donnée disponible</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Graphique des équipements par type - toujours visible */}
            <Grid item xs={12} md={sitesPermissionError ? 12 : 6}>
              <Card>
                <CardHeader title="Équipements par type" />
                <CardContent sx={{ height: 300 }}>
                  {stats.equipmentByType.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.equipmentByType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.equipmentByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography color="text.secondary">Aucune donnée disponible</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Graphique des statuts d'équipement - toujours visible */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title="État des équipements" />
                <CardContent sx={{ height: 300 }}>
                  {stats.equipmentStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.equipmentStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.equipmentStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography color="text.secondary">Aucune donnée disponible</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}

export default TelecomDashboardPage 
