'use client'

import { useEffect, useState } from 'react'

import { Card, CardContent, CardHeader, Grid, Typography, Box, IconButton, Button } from '@mui/material'

import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

import { sitesService, equipmentService, teamsService, departmentsService } from '@/services'
import { Site } from '@/services/sitesService'
import { Equipment } from '@/services/equipmentService'
import { Team } from '@/services/teamsService'
import { Department } from '@/services/departmentsService'

// Importer les composants de la bibliothèque Recharts pour les graphiques

const TelecomDashboardPage = () => {
  const [stats, setStats] = useState({
    totalSites: 0,
    totalEquipment: 0,
    totalTeams: 0,
    totalDepartments: 0,
    equipmentByType: [] as { name: string; value: number }[],
    sitesByRegion: [] as { name: string; value: number }[],
    equipmentStatus: [] as { name: string; value: number }[]
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1']

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Récupérer les données des API
        const sitesData = await sitesService.getAllSites()
        const equipmentData = await equipmentService.getAllEquipment()
        const teamsData = await teamsService.getAllTeams()
        const departmentsData = await departmentsService.getAllDepartments()

        // Calculer les statistiques d'équipement par type
        const equipmentByType = Object.entries(
          equipmentData.reduce((acc, equipment) => {
            const type = equipment.name.split(' ')[0] // Simplification pour l'exemple

            acc[type] = (acc[type] || 0) + 1
            
return acc
          }, {} as Record<string, number>)
        ).map(([name, value]) => ({ name, value }))

        // Calculer les statistiques de sites par région
        const sitesByRegion = Object.entries(
          sitesData.reduce((acc, site) => {
            acc[site.region] = (acc[site.region] || 0) + 1
            
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

        setStats({
          totalSites: sitesData.length,
          totalEquipment: equipmentData.length,
          totalTeams: teamsData.length,
          totalDepartments: departmentsData.length,
          equipmentByType,
          sitesByRegion,
          equipmentStatus
        })
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err)
        setError('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <Typography>Chargement des données...</Typography>
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Tableau de bord Télécommunications</Typography>

      {/* Cartes de statistiques */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader title="Sites" />
            <CardContent>
              <Typography variant="h3">{stats.totalSites}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader title="Équipements" />
            <CardContent>
              <Typography variant="h3">{stats.totalEquipment}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader title="Équipes" />
            <CardContent>
              <Typography variant="h3">{stats.totalTeams}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader title="Départements" />
            <CardContent>
              <Typography variant="h3">{stats.totalDepartments}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={4}>
        {/* Graphique des équipements par type */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Équipements par type" />
            <CardContent sx={{ height: 300 }}>
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
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique des sites par région */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Sites par région" />
            <CardContent sx={{ height: 300 }}>
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
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique des statuts d'équipement */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="État des équipements" />
            <CardContent sx={{ height: 300 }}>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TelecomDashboardPage 
