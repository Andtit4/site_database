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
import { departmentsService, equipmentService } from '@/services'
import { Department, DepartmentType, CreateDepartmentDto, UpdateDepartmentDto } from '@/services/departmentsService'
import { EquipmentTypes } from '@/services/equipmentService'
import notificationService from '@/services/notificationService'

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState<CreateDepartmentDto>({
    name: '',
    type: DepartmentType.TRANSMISSION,
    description: '',
    responsibleName: '',
    contactEmail: '',
    contactPhone: undefined,
    isActive: true,
    managedEquipmentTypes: []
  })

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const data = await departmentsService.getAllDepartments()
      setDepartments(data)
    } catch (err) {
      console.error('Erreur lors de la récupération des départements:', err)
      setError('Erreur lors du chargement des départements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
    
    const handleOpenAddDialog = () => {
      handleOpenDialog();
    };
    
    window.addEventListener('openAddDepartmentDialog', handleOpenAddDialog);
    
    // Nettoyer l'écouteur d'event
    return () => {
      window.removeEventListener('openAddDepartmentDialog', handleOpenAddDialog);
    };
  }, [])

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setCurrentDepartment(department)
      setFormData({
        name: department.name,
        type: department.type as DepartmentType,
        description: department.description || '',
        responsibleName: department.responsibleName,
        contactEmail: department.contactEmail,
        contactPhone: department.contactPhone,
        isActive: department.isActive,
        managedEquipmentTypes: department.managedEquipmentTypes || []
      })
    } else {
      setCurrentDepartment(null)
      setFormData({
        name: '',
        type: DepartmentType.TRANSMISSION,
        description: '',
        responsibleName: '',
        contactEmail: '',
        contactPhone: undefined,
        isActive: true,
        managedEquipmentTypes: []
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target
    
    //convertir en nombre ou undefined
    if (name === 'contactPhone') {
      const phoneValue = value as string;
      setFormData({
        ...formData,
        contactPhone: phoneValue && phoneValue.trim() !== '' ? Number(phoneValue) : undefined
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
    setFormData({
      ...formData,
      managedEquipmentTypes: event.target.value as string[]
    })
  }

  const handleSubmit = async () => {
    try {
      if (currentDepartment) {
        // Mise à jour du département
        const updateData: UpdateDepartmentDto = { ...formData }
        console.log("Mise à jour du département avec:", updateData);
        await departmentsService.updateDepartment(currentDepartment.id, updateData);
        
        // Notification de mise à jour
        try {
          notificationService.notifyDepartmentUpdated(formData.name);
        } catch (notifError) {
          console.error('Erreur lors de la création de la notification:', notifError);
        }
      } else {
        // Création d'un nouveau département
        console.log("Création d'un nouveau département avec:", formData);
        await departmentsService.createDepartment(formData);
        
        // Notification de création
        try {
          notificationService.notifyDepartmentCreated(formData.name);
        } catch (notifError) {
          console.error('Erreur lors de la création de la notification:', notifError);
        }
      }
      
      handleCloseDialog();
      fetchDepartments(); 
    } catch (err: any) {
      console.error('Erreur lors de l\'enregistrement du département:', err);
      
      // Afficher un message d'erreur approprié
      const errorMessage = err.message || 'Erreur lors de l\'enregistrement du département';
      setError(errorMessage);
      
      // Montrer l'erreur pendant 5 secondes puis effacer
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce département?')) {
      try {
        // Récupérer le nom du département avant suppression pour la notification
        const departmentToDelete = departments.find(dept => dept.id === id);
        const departmentName = departmentToDelete ? departmentToDelete.name : 'Inconnu';
        
        await departmentsService.deleteDepartment(id);
        
        if (departmentToDelete) {
          try {
            notificationService.notifyDepartmentDeleted(departmentName);
          } catch (notifError) {
            console.error('Erreur lors de la création de la notification:', notifError);
          }
        }
        
        fetchDepartments(); // Recharger la liste
      } catch (err: any) {
        console.error('Erreur lors de la suppression du département:', err);
        
        // Afficher un message d'erreur approprié
        const errorMessage = err.message || 'Erreur lors de la suppression du département';
        setError(errorMessage);
        
        // Montrer l'erreur pendant 5 secondes puis effacer
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    }
  }

  if (loading) {
    return <Typography>Chargement des départements...</Typography>
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Gestion des Départements</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Ajouter un département
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Responsable</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Équipements gérés</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department.type}</TableCell>
                    <TableCell>{department.responsibleName}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{department.contactEmail}</Typography>
                      {department.contactPhone && (
                        <Typography variant="body2">{department.contactPhone}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={department.isActive ? 'Actif' : 'Inactif'} 
                        color={department.isActive ? 'success' : 'error'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {department.managedEquipmentTypes?.map((type, index) => (
                        <Chip 
                          key={index}
                          label={type} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleOpenDialog(department)}>
                        Modifier
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(department.id)}>
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
          {currentDepartment ? 'Modifier le département' : 'Ajouter un département'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Nom du département"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Type de département</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="Type de département"
                  onChange={handleInputChange}
                >
                  <MenuItem value={DepartmentType.TRANSMISSION}>Transmission</MenuItem>
                  <MenuItem value={DepartmentType.ENERGIE}>Énergie</MenuItem>
                  <MenuItem value={DepartmentType.INFRASTRUCTURE}>Infrastructure</MenuItem>
                  <MenuItem value={DepartmentType.INFORMATIQUE}>Informatique</MenuItem>
                  <MenuItem value={DepartmentType.SECURITE}>Sécurité</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="responsibleName"
                label="Nom du responsable"
                fullWidth
                value={formData.responsibleName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="contactEmail"
                label="Email de contact"
                type="email"
                fullWidth
                value={formData.contactEmail}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="contactPhone"
                label="Téléphone de contact"
                type="number"
                fullWidth
                value={formData.contactPhone || ''}
                onChange={handleInputChange}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                helperText="Entrez uniquement des chiffres"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Département actif"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Types d'équipements gérés</InputLabel>
                <Select
                  name="managedEquipmentTypes"
                  multiple
                  value={formData.managedEquipmentTypes || []}
                  label="Types d'équipements gérés"
                  onChange={handleEquipmentTypeChange as any}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentDepartment ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DepartmentsPage 
