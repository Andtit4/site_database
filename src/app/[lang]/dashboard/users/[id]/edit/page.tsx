'use client'

import { useEffect, useState } from 'react'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Alert,
  CircularProgress,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  FormHelperText,
  Paper,
  CardHeader
} from '@mui/material'
import { ArrowBack, Save, Person, Security, Business, Group } from '@mui/icons-material'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import usersService from '@/services/usersService'
import departmentsService, { Department } from '@/services/departmentsService'
import teamsService, { Team } from '@/services/teamsService'
import { User } from '@/services/authService'
import EditUserDialog from '@/views/apps/user/list/EditUserDialog'
import { Permission } from '@/services/permissionsService'

interface EditUserFormData {
  username: string
  email: string
  firstName: string
  lastName: string
  departmentId: string
  teamId: string
  isDepartmentAdmin: boolean
  isTeamMember: boolean
  isActive: boolean
  hasDepartmentRights: boolean
  managedEquipmentTypes: string[]
}

const EQUIPMENT_TYPES = [
  'ANTENNE',
  'ROUTEUR',
  'BATTERIE',
  'GÉNÉRATEUR',
  'REFROIDISSEMENT',
  'SHELTER',
  'PYLÔNE',
  'SÉCURITÉ'
]

const EditUserPage = () => {
  const { user: currentUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const lang = params.lang || 'fr'
  const userId = params.id as string

  const [formData, setFormData] = useState<EditUserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    departmentId: '',
    teamId: '',
    isDepartmentAdmin: false,
    isTeamMember: false,
    isActive: true,
    hasDepartmentRights: false,
    managedEquipmentTypes: []
  })

  const [originalUser, setOriginalUser] = useState<User | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push(`/${lang}/auth/login`)
      return
    }
    
    if (!authLoading && currentUser && !currentUser.isAdmin) {
      router.push(`/${lang}/dashboard/telecom-dashboard`)
      return
    }
    
    if (!authLoading && currentUser && currentUser.isAdmin) {
      initializeData()
    }
  }, [authLoading, currentUser, router, lang, userId])

  // Filtrer les équipes selon le département sélectionné
  useEffect(() => {
    if (formData.departmentId) {
      const departmentTeams = teams.filter(team => team.departmentId === formData.departmentId)
      setFilteredTeams(departmentTeams)
    } else {
      setFilteredTeams([])
    }
    
    // Réinitialiser l'équipe si elle ne correspond plus au département
    if (formData.teamId && formData.departmentId) {
      const selectedTeam = teams.find(team => team.id === formData.teamId)
      if (selectedTeam && selectedTeam.departmentId !== formData.departmentId) {
        setFormData(prev => ({ ...prev, teamId: '' }))
      }
    }
  }, [formData.departmentId, teams])

  const initializeData = async () => {
    try {
      setPageLoading(true)
      await Promise.all([
        fetchUser(),
        fetchDepartments(),
        fetchTeams()
      ])
    } catch (err) {
      console.error('Erreur lors de l\'initialisation:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setPageLoading(false)
    }
  }

  const fetchUser = async () => {
    try {
      const userData = await usersService.getUserById(userId)
      setOriginalUser(userData)
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        departmentId: userData.departmentId || '',
        teamId: userData.teamId || '',
        isDepartmentAdmin: userData.isDepartmentAdmin,
        isTeamMember: userData.isTeamMember,
        isActive: userData.isActive,
        hasDepartmentRights: userData.hasDepartmentRights,
        managedEquipmentTypes: Array.isArray(userData.managedEquipmentTypes) 
          ? userData.managedEquipmentTypes 
          : []
      })
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', err)
      setError('Utilisateur non trouvé')
    }
  }

  const fetchDepartments = async () => {
    try {
      const departmentsData = await departmentsService.getAllDepartments()
      setDepartments(departmentsData)
    } catch (err) {
      console.error('Erreur lors de la récupération des départements:', err)
    }
  }

  const fetchTeams = async () => {
    try {
      const teamsData = await teamsService.getAllTeams()
      setTeams(teamsData)
    } catch (err) {
      console.error('Erreur lors de la récupération des équipes:', err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Supprimer l'erreur de validation si elle existe
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name!]: value }))
    
    if (validationErrors[name!]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name!]
        return newErrors
      })
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleEquipmentTypesChange = (e: SelectChangeEvent<string[]>) => {
    const value = e.target.value as string[]
    setFormData(prev => ({ ...prev, managedEquipmentTypes: value }))
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.username.trim()) {
      errors.username = 'Le nom d\'utilisateur est requis'
    }

    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'L\'email n\'est pas valide'
    }

    if (!formData.firstName.trim()) {
      errors.firstName = 'Le prénom est requis'
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Le nom de famille est requis'
    }

    if ((formData.isDepartmentAdmin || formData.isTeamMember) && !formData.departmentId) {
      errors.departmentId = 'Le département est requis pour ce type d\'utilisateur'
    }

    if (formData.isTeamMember && !formData.teamId) {
      errors.teamId = 'L\'équipe est requise pour un membre d\'équipe'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        departmentId: formData.departmentId || undefined,
        teamId: formData.teamId || undefined,
        isDepartmentAdmin: formData.isDepartmentAdmin,
        isTeamMember: formData.isTeamMember,
        isActive: formData.isActive,
        hasDepartmentRights: formData.hasDepartmentRights,
        managedEquipmentTypes: formData.managedEquipmentTypes
      }

      await usersService.updateUser(userId, userData)
      setSuccess('Utilisateur modifié avec succès!')
      
      // Rediriger vers la liste des utilisateurs après 2 secondes
      setTimeout(() => {
        router.push(`/${lang}/dashboard/users`)
      }, 2000)

    } catch (err: any) {
      console.error('Erreur lors de la modification:', err)
      setError(err.message || 'Erreur lors de la modification de l\'utilisateur')
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionsSave = async (permissions: Permission[]) => {
    try {
      await usersService.updateUserPermissions(userId, permissions)
      // Rafraîchir les données de l'utilisateur
      fetchUser()
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions:', error)
    }
  }

  // Afficher le loader pendant l'authentification
  if (authLoading || pageLoading) {
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

  // Erreur lors du chargement de l'utilisateur
  if (error && !originalUser) {
    return (
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push(`/${lang}/dashboard/users`)}
            sx={{ mr: 2 }}
          >
            Retour
          </Button>
          <Typography variant="h4">Modifier l'utilisateur</Typography>
        </Box>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push(`/${lang}/dashboard/users`)}
        >
          Retour
        </Button>
        <Typography variant="h4">Modifier l'utilisateur</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 4 }}>
          {success}
        </Alert>
      )}

      {pageLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Informations personnelles */}
            <Grid item xs={12}>
              <Paper elevation={1}>
                <CardHeader 
                  title="Informations personnelles" 
                  avatar={<Person />}
                  sx={{ pb: 2 }}
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="username"
                        label="Nom d'utilisateur"
                        value={formData.username}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        error={!!validationErrors.username}
                        helperText={validationErrors.username}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="email"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        error={!!validationErrors.email}
                        helperText={validationErrors.email}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="firstName"
                        label="Prénom"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        error={!!validationErrors.firstName}
                        helperText={validationErrors.firstName}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="lastName"
                        label="Nom de famille"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        error={!!validationErrors.lastName}
                        helperText={validationErrors.lastName}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Paper>
            </Grid>

            {/* Département et Équipe */}
            <Grid item xs={12}>
              <Paper elevation={1}>
                <CardHeader 
                  title="Département et Équipe" 
                  avatar={<Business />}
                  sx={{ pb: 2 }}
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Département</InputLabel>
                        <Select
                          name="departmentId"
                          value={formData.departmentId}
                          onChange={handleSelectChange}
                          label="Département"
                          error={!!validationErrors.departmentId}
                        >
                          <MenuItem value="">
                            <em>Aucun département</em>
                          </MenuItem>
                          {departments.map((dept) => (
                            <MenuItem key={dept.id} value={dept.id}>
                              {dept.name} ({dept.type})
                            </MenuItem>
                          ))}
                        </Select>
                        {validationErrors.departmentId && (
                          <FormHelperText error>
                            {validationErrors.departmentId}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth disabled={!formData.departmentId}>
                        <InputLabel>Équipe</InputLabel>
                        <Select
                          name="teamId"
                          value={formData.teamId}
                          onChange={handleSelectChange}
                          label="Équipe"
                          error={!!validationErrors.teamId}
                        >
                          <MenuItem value="">
                            <em>Aucune équipe</em>
                          </MenuItem>
                          {filteredTeams.map((team) => (
                            <MenuItem key={team.id} value={team.id}>
                              {team.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {validationErrors.teamId && (
                          <FormHelperText error>
                            {validationErrors.teamId}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Paper>
            </Grid>

            {/* Permissions des Sites */}
            <Grid item xs={12}>
              <Paper elevation={1}>
                <CardHeader 
                  title="Permissions des Sites" 
                  avatar={<Security />}
                  action={
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setPermissionsDialogOpen(true)}
                      startIcon={<Security />}
                    >
                      Modifier les Permissions
                    </Button>
                  }
                  sx={{ pb: 2 }}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Permissions actuelles :
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {originalUser?.permissions?.map((permission) => (
                          <Chip
                            key={permission}
                            label={permission}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Paper>
            </Grid>

            {/* Boutons d'action */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push(`/${lang}/dashboard/users`)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      )}

      {/* Dialogue de Permissions */}
      <EditUserDialog
        open={permissionsDialogOpen}
        onClose={() => setPermissionsDialogOpen(false)}
        user={originalUser}
        onSave={handlePermissionsSave}
      />
    </Box>
  )
}

export default EditUserPage 
