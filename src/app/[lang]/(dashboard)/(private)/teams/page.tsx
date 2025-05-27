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
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material'
import { teamsService, departmentsService, sitesService } from '@/services'
import { Team, TeamStatus, CreateTeamDto, UpdateTeamDto, TeamFilterDto } from '@/services/teamsService'
import { EquipmentTypes } from '@/services/equipmentService'
import notificationService from '@/services/notificationService'

const TeamsPage = () => {
  const [teams, setTeams] = useState<Team[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [filterData, setFilterData] = useState<TeamFilterDto>({})
  const [formData, setFormData] = useState<CreateTeamDto>({
    name: '',
    description: '',
    status: TeamStatus.ACTIVE,
    leadName: '',
    leadContact: '',
    memberCount: 0,
    location: '',
    equipmentType: '',
    equipmentTypes: [],
    departmentId: '',
    createAccount: false,
    userEmail: '',
    hasDepartmentRights: false
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [teamsData, departmentsData, sitesData] = await Promise.all([
        teamsService.getAllTeams(filterData),
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
    
    // Ajouter un écouteur d'événement pour ouvrir le dialogue d'ajout depuis le menu
    const handleOpenAddDialog = () => {
      handleOpenDialog();
    };
    
    window.addEventListener('openAddTeamDialog', handleOpenAddDialog);
    
    // Nettoyer l'écouteur d'événement lors du démontage du composant
    return () => {
      window.removeEventListener('openAddTeamDialog', handleOpenAddDialog);
    };
  }, [filterData])

  const handleOpenDialog = (team?: Team) => {
    if (team) {
      setCurrentTeam(team)
      setFormData({
        name: team.name,
        description: team.description || '',
        status: team.status as TeamStatus,
        leadName: team.leadName || '',
        leadContact: team.leadContact || '',
        memberCount: team.memberCount,
        location: team.location || '',
        lastActiveDate: team.lastActiveDate ? new Date(team.lastActiveDate).toISOString().split('T')[0] : undefined,
        metadata: team.metadata,
        equipmentType: team.equipmentType || '',
        equipmentTypes: Array.isArray(team.equipmentTypes) ? team.equipmentTypes : (team.equipmentType ? [team.equipmentType] : []),
        departmentId: team.departmentId || '',
        createAccount: false,
        userEmail: '',
        hasDepartmentRights: false
      })
    } else {
      setCurrentTeam(null)
      setFormData({
        name: '',
        description: '',
        status: TeamStatus.ACTIVE,
        leadName: '',
        leadContact: '',
        memberCount: 0,
        location: '',
        equipmentType: '',
        equipmentTypes: [],
        departmentId: departments.length > 0 ? departments[0].id : '',
        createAccount: false,
        userEmail: '',
        hasDepartmentRights: false
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target
    
    // Traitement spécial pour memberCount
    if (name === 'memberCount') {
      setFormData({
        ...formData,
        memberCount: Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name as string]: value
      });
    }
  }

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked
    })
  }

  const handleEquipmentTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedTypes = event.target.value as string[];
    console.log("Types d'équipement sélectionnés:", selectedTypes);
    
    setFormData({
      ...formData,
      equipmentTypes: selectedTypes,
      // On ne modifie plus automatiquement equipmentType ici, cela sera fait lors de la soumission
    });
  }

  const handleSubmit = async () => {
    try {
      const dataToSend = {
        ...formData,
        // S'assurer que le type principal est défini si des types sont sélectionnés
        equipmentType: formData.equipmentTypes && formData.equipmentTypes.length > 0 
          ? formData.equipmentTypes[0] 
          : formData.equipmentType || '',
      };
      
      console.log("Données à envoyer:", dataToSend);
      
      // Trouver le nom du département
      const departmentName = departments.find(dept => dept.id === dataToSend.departmentId)?.name || 'Inconnu';
      
      if (currentTeam) {
        // Mise à jour de l'équipe
        const updateData: UpdateTeamDto = { 
          name: dataToSend.name,
          description: dataToSend.description,
          status: dataToSend.status,
          leadName: dataToSend.leadName,
          leadContact: dataToSend.leadContact,
          memberCount: dataToSend.memberCount,
          location: dataToSend.location,
          lastActiveDate: dataToSend.lastActiveDate,
          metadata: dataToSend.metadata,
          equipmentType: dataToSend.equipmentType,
          equipmentTypes: dataToSend.equipmentTypes,
          departmentId: dataToSend.departmentId
        }
        await teamsService.updateTeam(currentTeam.id, updateData);
        
        // Ajouter une notification pour la mise à jour
        notificationService.notifyTeamUpdated(dataToSend.name, departmentName);
      } else {
        // Création d'une nouvelle équipe
        await teamsService.createTeam(dataToSend);
        
        // Ajouter une notification pour la création
        notificationService.notifyTeamCreated(dataToSend.name, departmentName);
      }
      
      handleCloseDialog()
      fetchData() // Recharger la liste
    } catch (err: any) {
      console.error('Erreur lors de l\'enregistrement de l\'équipe:', err)
      setError(err.message || 'Erreur lors de l\'enregistrement de l\'équipe')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe?')) {
      try {
        // Récupérer les informations de l'équipe avant suppression
        const teamToDelete = teams.find(team => team.id === id);
        if (teamToDelete) {
          const departmentName = departments.find(dept => dept.id === teamToDelete.departmentId)?.name || 'Inconnu';
          
          // Supprimer l'équipe
          await teamsService.deleteTeam(id);
          
          // Ajouter une notification pour la suppression
          notificationService.notifyTeamDeleted(teamToDelete.name, departmentName);
        } else {
          await teamsService.deleteTeam(id);
        }
        
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

  // Fonction pour obtenir le libellé d'un type d'équipement
  const getEquipmentTypeLabel = (type: string): string => {
    switch (type) {
      case EquipmentTypes.ANTENNE: return "Antennes";
      case EquipmentTypes.ROUTEUR: return "Routeurs";
      case EquipmentTypes.BATTERIE: return "Batteries";
      case EquipmentTypes.GÉNÉRATEUR: return "Générateurs";
      case EquipmentTypes.REFROIDISSEMENT: return "Refroidissement";
      case EquipmentTypes.SHELTER: return "Shelters";
      case EquipmentTypes.PYLÔNE: return "Pylônes";
      case EquipmentTypes.SÉCURITÉ: return "Sécurité";
      default: return type;
    }
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

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Filtres</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filterData.status || ''}
                  label="Statut"
                  onChange={(e) => setFilterData({ ...filterData, status: e.target.value as TeamStatus || undefined })}
                >
                  <MenuItem value="">Tous les statuts</MenuItem>
                  <MenuItem value={TeamStatus.ACTIVE}>Actif</MenuItem>
                  <MenuItem value={TeamStatus.STANDBY}>En attente</MenuItem>
                  <MenuItem value={TeamStatus.INACTIVE}>Inactif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Département</InputLabel>
                <Select
                  value={filterData.departmentId || ''}
                  label="Département"
                  onChange={(e) => setFilterData({ ...filterData, departmentId: e.target.value as string || undefined })}
                >
                  <MenuItem value="">Tous les départements</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type d'équipement</InputLabel>
                <Select
                  value={filterData.equipmentType || ''}
                  label="Type d'équipement"
                  onChange={(e) => setFilterData({ ...filterData, equipmentType: e.target.value as string || undefined })}
                >
                  <MenuItem value="">Tous les types</MenuItem>
                  <MenuItem value={EquipmentTypes.ANTENNE}>Antennes</MenuItem>
                  <MenuItem value={EquipmentTypes.ROUTEUR}>Routeurs</MenuItem>
                  <MenuItem value={EquipmentTypes.BATTERIE}>Batteries</MenuItem>
                  <MenuItem value={EquipmentTypes.GÉNÉRATEUR}>Générateurs</MenuItem>
                  <MenuItem value={EquipmentTypes.REFROIDISSEMENT}>Refroidissement</MenuItem>
                  <MenuItem value={EquipmentTypes.SHELTER}>Shelters</MenuItem>
                  <MenuItem value={EquipmentTypes.PYLÔNE}>Pylônes</MenuItem>
                  <MenuItem value={EquipmentTypes.SÉCURITÉ}>Sécurité</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Recherche"
                value={filterData.search || ''}
                onChange={(e) => setFilterData({ ...filterData, search: e.target.value || undefined })}
                placeholder="Nom, description, responsable..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
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
                    <TableCell>
                      {team.equipmentTypes && team.equipmentTypes.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {team.equipmentTypes.map((type) => (
                            <Chip key={type} label={getEquipmentTypeLabel(type)} size="small" />
                          ))}
                        </Box>
                      ) : (
                        team.equipmentType ? getEquipmentTypeLabel(team.equipmentType) : '-'
                      )}
                    </TableCell>
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
                {teams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Aucune équipe trouvée
                    </TableCell>
                  </TableRow>
                )}
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
                <InputLabel>Types d'équipement</InputLabel>
                <Select
                  name="equipmentTypes"
                  multiple
                  value={formData.equipmentTypes || []}
                  label="Types d'équipement"
                  onChange={handleEquipmentTypeChange as any}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => {
                        return <Chip key={value} label={getEquipmentTypeLabel(value)} />;
                      })}
                    </Box>
                  )}
                >
                  <MenuItem value={EquipmentTypes.ANTENNE}>Antennes</MenuItem>
                  <MenuItem value={EquipmentTypes.ROUTEUR}>Routeurs</MenuItem>
                  <MenuItem value={EquipmentTypes.BATTERIE}>Batteries</MenuItem>
                  <MenuItem value={EquipmentTypes.GÉNÉRATEUR}>Générateurs</MenuItem>
                  <MenuItem value={EquipmentTypes.REFROIDISSEMENT}>Refroidissement</MenuItem>
                  <MenuItem value={EquipmentTypes.SHELTER}>Shelters</MenuItem>
                  <MenuItem value={EquipmentTypes.PYLÔNE}>Pylônes</MenuItem>
                  <MenuItem value={EquipmentTypes.SÉCURITÉ}>Sécurité</MenuItem>
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
            
            {!currentTeam && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Options de compte utilisateur
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="createAccount"
                        checked={formData.createAccount}
                        onChange={handleSwitchChange}
                        color="primary"
                      />
                    }
                    label="Créer un compte utilisateur"
                  />
                </Grid>
                {formData.createAccount && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="userEmail"
                        label="Email de l'utilisateur"
                        type="email"
                        fullWidth
                        value={formData.userEmail || ''}
                        onChange={handleInputChange}
                        required={formData.createAccount}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="password"
                        label="Mot de passe (facultatif)"
                        type="password"
                        fullWidth
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        helperText="Laissez vide pour générer un mot de passe aléatoire"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            name="hasDepartmentRights"
                            checked={formData.hasDepartmentRights}
                            onChange={handleSwitchChange}
                            color="primary"
                          />
                        }
                        label="Accès administrateur au département"
                      />
                    </Grid>
                  </>
                )}
              </>
            )}
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
