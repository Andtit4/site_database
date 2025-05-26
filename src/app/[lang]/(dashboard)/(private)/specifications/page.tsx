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
import { specificationsService, equipmentService } from '@/services'
import { Specification, SpecificationCategory, CreateSpecificationDto, UpdateSpecificationDto } from '@/services/specificationsService'
import { EquipmentType } from '@/services/equipmentService'

const SpecificationsPage = () => {
  const [specifications, setSpecifications] = useState<Specification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentSpecification, setCurrentSpecification] = useState<Specification | null>(null)
  const [formData, setFormData] = useState<CreateSpecificationDto>({
    name: '',
    description: '',
    category: SpecificationCategory.TECHNICAL,
    value: '',
    unit: '',
    isStandard: true,
    appliesTo: []
  })

  const fetchSpecifications = async () => {
    try {
      setLoading(true)
      const data = await specificationsService.getAllSpecifications()
      setSpecifications(data)
    } catch (err) {
      console.error('Erreur lors de la récupération des spécifications:', err)
      setError('Erreur lors du chargement des spécifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpecifications()
    
    // Ajouter un écouteur d'événement pour ouvrir le dialogue d'ajout depuis le menu
    const handleOpenAddDialog = () => {
      handleOpenDialog();
    };
    
    window.addEventListener('openAddSpecificationDialog', handleOpenAddDialog);
    
    // Nettoyer l'écouteur d'événement lors du démontage du composant
    return () => {
      window.removeEventListener('openAddSpecificationDialog', handleOpenAddDialog);
    };
  }, [])

  const handleOpenDialog = (specification?: Specification) => {
    if (specification) {
      setCurrentSpecification(specification)
      setFormData({
        name: specification.name,
        description: specification.description || '',
        category: specification.category as SpecificationCategory,
        value: specification.value,
        unit: specification.unit || '',
        isStandard: specification.isStandard,
        appliesTo: specification.appliesTo || []
      })
    } else {
      setCurrentSpecification(null)
      setFormData({
        name: '',
        description: '',
        category: SpecificationCategory.TECHNICAL,
        value: '',
        unit: '',
        isStandard: true,
        appliesTo: []
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

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked
    })
  }

  const handleEquipmentTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFormData({
      ...formData,
      appliesTo: event.target.value as string[]
    })
  }

  const handleSubmit = async () => {
    try {
      if (currentSpecification) {
        // Mise à jour de la spécification
        const updateData: UpdateSpecificationDto = { ...formData }
        await specificationsService.updateSpecification(currentSpecification.id, updateData)
      } else {
        // Création d'une nouvelle spécification
        await specificationsService.createSpecification(formData)
      }
      
      handleCloseDialog()
      fetchSpecifications() // Recharger la liste
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de la spécification:', err)
      setError('Erreur lors de l\'enregistrement de la spécification')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette spécification?')) {
      try {
        await specificationsService.deleteSpecification(id)
        fetchSpecifications() // Recharger la liste
      } catch (err) {
        console.error('Erreur lors de la suppression de la spécification:', err)
        setError('Erreur lors de la suppression de la spécification')
      }
    }
  }

  if (loading) {
    return <Typography>Chargement des spécifications...</Typography>
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Gestion des Spécifications</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Ajouter une spécification
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Valeur</TableCell>
                  <TableCell>Unité</TableCell>
                  <TableCell>Standard</TableCell>
                  <TableCell>Équipements</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {specifications.map((specification) => (
                  <TableRow key={specification.id}>
                    <TableCell>{specification.name}</TableCell>
                    <TableCell>{specification.category}</TableCell>
                    <TableCell>{specification.value}</TableCell>
                    <TableCell>{specification.unit || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={specification.isStandard ? 'Standard' : 'Spécifique'} 
                        color={specification.isStandard ? 'success' : 'info'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {specification.appliesTo?.map((type, index) => (
                        <Chip 
                          key={index}
                          label={type} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleOpenDialog(specification)}>
                        Modifier
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(specification.id)}>
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
          {currentSpecification ? 'Modifier la spécification' : 'Ajouter une spécification'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Nom de la spécification"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Catégorie"
                  onChange={handleInputChange}
                >
                  <MenuItem value={SpecificationCategory.TECHNICAL}>Technique</MenuItem>
                  <MenuItem value={SpecificationCategory.PERFORMANCE}>Performance</MenuItem>
                  <MenuItem value={SpecificationCategory.SAFETY}>Sécurité</MenuItem>
                  <MenuItem value={SpecificationCategory.ENVIRONMENTAL}>Environnement</MenuItem>
                  <MenuItem value={SpecificationCategory.COMPLIANCE}>Conformité</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="value"
                label="Valeur"
                fullWidth
                value={formData.value}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="unit"
                label="Unité"
                fullWidth
                value={formData.unit || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="isStandard"
                    checked={formData.isStandard}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Spécification standard"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>S'applique aux équipements</InputLabel>
                <Select
                  name="appliesTo"
                  multiple
                  value={formData.appliesTo || []}
                  label="S'applique aux équipements"
                  onChange={handleEquipmentTypeChange as any}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
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
            {currentSpecification ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SpecificationsPage 
