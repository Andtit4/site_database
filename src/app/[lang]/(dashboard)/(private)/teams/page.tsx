'use client'

import { useEffect, useState } from 'react'
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip
} from '@mui/material'
import { teamsService, departmentsService, sitesService } from '@/services'
import { Team, TeamStatus, CreateTeamDto, UpdateTeamDto } from '@/services/teamsService'
import { EquipmentType } from '@/services/equipmentService'

const TeamsPage = () => {
  const [teams, setTeams] = useState<Team[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState<CreateTeamDto>({
    id: '',
    name: '',
    description: '',
    status: TeamStatus.ACTIVE,
    leadName: '',
    leadContact: '',
    memberCount: 0,
    location: '',
    equipmentType: '',
    departmentId: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [teamsData, departmentsData, sitesData] = await Promise.all([
        teamsService.getAllTeams(),
        departmentsService.getAllDepartments(),
        sitesService.getAllSites()
      ])
      setTeams(teamsData)
      setDepartments(departmentsData)
      setSites(sitesData)
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenDialog = (team?: Team) => {
    if (team) {
      setCurrentTeam(team)
      setFormData({
        id: team.id,
        name: team.name,
        description: team.description || '',
        status: team.status as TeamStatus,
        leadName: team.leadName || '',
        leadContact: team.leadContact || '',
        memberCount: team.memberCount,
        location: team.location || '',
        lastActiveDate: team.lastActiveDate,
        metadata: team.metadata,
        equipmentType: team.equipmentType || '',
        departmentId: team.departmentId
      })
    } else {
      setCurrentTeam(null)
      setFormData({
        id: '',
        name: '',
        description: '',
        status: TeamStatus.ACTIVE,
        leadName: '',
        leadContact: '',
        memberCount: 0,
        location: '',
        equipmentType: '',
        departmentId: departments.length > 0 ? departments[0].id : ''
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name as string]: value
    })
  }

  const handleSubmit = async () => {
    try {
      if (currentTeam) {
        // Mise à jour de l'équipe
        const updateData: UpdateTeamDto = { 
          name: formData.name,
          description: formData.description,
          status: formData.status,
          leadName: formData.leadName,
          leadContact: formData.leadContact,
          memberCount: formData.memberCount,
          location: formData.location,
          lastActiveDate: formData.lastActiveDate,
          metadata: formData.metadata,
          equipmentType: formData.equipmentType,
          departmentId: formData.departmentId
        }
        await teamsService.updateTeam(currentTeam.id, updateData)
      } else {
        // Création d'une nouvelle équipe
        await teamsService.createTeam(formData)
      }
      
      handleCloseDialog()
      fetchData() // Recharger la liste
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de l\'équipe:', err)
      setError('Erreur lors de l\'enregistrement de l\'équipe')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe?')) {
      try {
        await teamsService.deleteTeam(id)
        fetchData() // Recharger la liste
      } catch (err) {
        console.error('Erreur lors de la suppression de l\'équipe:', err)
        setError('Erreur lors de la suppression de l\'équipe')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case TeamStatus.ACTIVE:
        return 'success'
      case TeamStatus.STANDBY:
        return 'warning'
      case TeamStatus.INACTIVE:
        return 'error'
      default:
        return 'default'
    }
  }

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(dept => dept.id === departmentId)
    return department ? department.name : '-'
  }

  if (loading) {
    return <Typography>Chargement des équipes...</Typography>
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Gestion des Équipes</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Ajouter une équipe
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Département</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Responsable</TableCell>
                  <TableCell>Membres</TableCell>
                  <TableCell>Type d'équipement</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>{team.id}</TableCell>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{getDepartmentName(team.departmentId)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={team.status} 
                        color={getStatusColor(team.status) as any} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{team.leadName || '-'}</TableCell>
                    <TableCell>{team.memberCount}</TableCell>
                    <TableCell>{team.equipmentType || '-'}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleOpenDialog(team)}>
                        Modifier
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(team.id)}>
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentTeam ? 'Modifier l\'équipe' : 'Ajouter une équipe'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="id"
                label="ID de l'équipe"
                fullWidth
                value={formData.id}
                onChange={handleInputChange}
                disabled={!!currentTeam}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Nom de l'équipe"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Département</InputLabel>
                <Select
                  name="departmentId"
                  value={formData.departmentId}
                  label="Département"
                  onChange={handleInputChange}
                >
                  {departments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Statut"
                  onChange={handleInputChange}
                >
                  <MenuItem value={TeamStatus.ACTIVE}>Actif</MenuItem>
                  <MenuItem value={TeamStatus.STANDBY}>En attente</MenuItem>
                  <MenuItem value={TeamStatus.INACTIVE}>Inactif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="leadName"
                label="Nom du responsable"
                fullWidth
                value={formData.leadName || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="leadContact"
                label="Contact du responsable"
                fullWidth
                value={formData.leadContact || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="memberCount"
                label="Nombre de membres"
                type="number"
                fullWidth
                value={formData.memberCount}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="location"
                label="Localisation"
                fullWidth
                value={formData.location || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type d'équipement</InputLabel>
                <Select
                  name="equipmentType"
                  value={formData.equipmentType || ''}
                  label="Type d'équipement"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Aucun</MenuItem>
                  <MenuItem value={EquipmentType.ANTENNA}>Antennes</MenuItem>
                  <MenuItem value={EquipmentType.ROUTER}>Routeurs</MenuItem>
                  <MenuItem value={EquipmentType.BATTERY}>Batteries</MenuItem>
                  <MenuItem value={EquipmentType.GENERATOR}>Générateurs</MenuItem>
                  <MenuItem value={EquipmentType.COOLING}>Refroidissement</MenuItem>
                  <MenuItem value={EquipmentType.SHELTER}>Shelters</MenuItem>
                  <MenuItem value={EquipmentType.TOWER}>Pylônes</MenuItem>
                  <MenuItem value={EquipmentType.SECURITY}>Sécurité</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentTeam ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TeamsPage 
