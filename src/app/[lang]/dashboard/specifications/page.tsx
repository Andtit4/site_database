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
  FormControlLabel,
  Switch,
  IconButton
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import specificationsService from '@/services/specificationsService'
import { 
  Specification, 
  CreateSpecificationDto, 
  UpdateSpecificationDto, 
  ColumnDefinition,
  EquipmentTypes,
  ColumnTypes
} from '@/services/specificationsService'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'

const SpecificationsPage = () => {
  const { 
    user, 
    loading: authLoading, 
    canViewEquipmentSpecifications,
    canViewAllResources,
    getUserDepartmentId 
  } = useAuth()
  const router = useRouter()
  const params = useParams()
  const lang = params.lang || 'fr'

  const [specifications, setSpecifications] = useState<Specification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Vérifier les permissions
  useEffect(() => {
    if (!authLoading && user) {
      if (!canViewEquipmentSpecifications()) {
        router.push(`/${lang}/dashboard/telecom-dashboard`)
        return
      }
    }
  }, [authLoading, user, canViewEquipmentSpecifications, router, lang])
  const [openDialog, setOpenDialog] = useState(false)
  const [currentSpecification, setCurrentSpecification] = useState<Specification | null>(null)
  const [formData, setFormData] = useState<CreateSpecificationDto>({
    equipmentType: EquipmentTypes.ANTENNE,
    columns: []
  })
  const [tempColumn, setTempColumn] = useState<ColumnDefinition>({
    name: '',
    type: ColumnTypes.VARCHAR,
    length: 255,
    nullable: true,
    defaultValue: ''
  })

  const fetchSpecifications = async () => {
    try {
      setLoading(true)
      const data = await specificationsService.getAllSpecifications()
      
      // Filtrer selon les permissions de l'utilisateur
      let filteredData = data
      if (!canViewAllResources() && user?.isDepartmentAdmin) {
        // Pour les admins de département, filtrer selon les types d'équipements de leur département
        const userDepartmentId = getUserDepartmentId()
        if (userDepartmentId) {
          // TODO: Implémenter la logique pour récupérer les types d'équipements autorisés pour ce département
          // Pour l'instant, on affiche toutes les spécifications mais l'admin ne pourra créer que certains types
          filteredData = data
        }
      }
      
      setSpecifications(filteredData)
      setError(null)
    } catch (err: any) {
      console.error('Erreur lors de la récupération des spécifications:', err)
      setError(err.message || 'Erreur lors du chargement des spécifications')
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
        equipmentType: specification.equipmentType,
        columns: [...specification.columns]
      })
    } else {
      setCurrentSpecification(null)
      setFormData({
        equipmentType: EquipmentTypes.ANTENNE,
        columns: []
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setTempColumn({
      name: '',
      type: ColumnTypes.VARCHAR,
      length: 255,
      nullable: true,
      defaultValue: ''
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target
    
    if (name === 'equipmentType') {
      setFormData({
        ...formData,
        equipmentType: value as string
      })
    }
  }

  const handleColumnInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target
    
    if (name === 'nullable') {
      setTempColumn({
        ...tempColumn,
        nullable: value === 'true'
      })
    } else if (name === 'length' && value) {
      setTempColumn({
        ...tempColumn,
        length: parseInt(value as string, 10)
      })
    } else {
      setTempColumn({
        ...tempColumn,
        [name as string]: value
      })
    }
  }

  const handleAddColumn = () => {
    if (!tempColumn.name || !tempColumn.type) {
      alert('Le nom et le type de colonne sont requis')
      return
    }
    
    const newColumn: ColumnDefinition = {
      ...tempColumn
    }
    
    setFormData({
      ...formData,
      columns: [...formData.columns, newColumn]
    })
    
    // Réinitialiser le formulaire de colonne temporaire
    setTempColumn({
      name: '',
      type: ColumnTypes.VARCHAR,
      length: 255,
      nullable: true,
      defaultValue: ''
    })
  }

  const handleRemoveColumn = (index: number) => {
    const updatedColumns = [...formData.columns]
    updatedColumns.splice(index, 1)
    setFormData({
      ...formData,
      columns: updatedColumns
    })
  }

  const handleSubmit = async () => {
    try {
      if (!formData.equipmentType) {
        alert('Le type d\'équipement est requis')
        return
      }
      
      if (formData.columns.length === 0) {
        alert('Vous devez ajouter au moins une colonne')
        return
      }
      
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
      setError(null)
    } catch (err: any) {
      console.error('Erreur lors de l\'enregistrement de la spécification:', err)
      setError(err.message || 'Erreur lors de l\'enregistrement de la spécification')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette spécification? Cette action supprimera également la table correspondante en base de données.')) {
      try {
        await specificationsService.deleteSpecification(id)
        fetchSpecifications() // Recharger la liste
        setError(null)
      } catch (err: any) {
        console.error('Erreur lors de la suppression de la spécification:', err)
        setError(err.message || 'Erreur lors de la suppression de la spécification')
      }
    }
  }

  if (loading) {
    return <Typography>Chargement des spécifications...</Typography>
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Gestion des Spécifications d'Équipements</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Ajouter une spécification
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type d'Équipement</TableCell>
                  <TableCell>Nombre de Colonnes</TableCell>
                  <TableCell>Nom de la Table</TableCell>
                  <TableCell>Date de Création</TableCell>
                  <TableCell>Date de Mise à Jour</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {specifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucune spécification trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  specifications.map((specification) => (
                    <TableRow key={specification.id}>
                      <TableCell>
                        <Chip label={specification.equipmentType} color="primary" />
                      </TableCell>
                      <TableCell>{specification.columns.length}</TableCell>
                      <TableCell>{`spec_${specification.equipmentType.toLowerCase()}`}</TableCell>
                      <TableCell>{new Date(specification.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(specification.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => handleOpenDialog(specification)}>
                          Modifier
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDelete(specification.id)}>
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Type d'Équipement</InputLabel>
                <Select
                  name="equipmentType"
                  value={formData.equipmentType}
                  label="Type d'Équipement"
                  onChange={handleInputChange}
                  disabled={!!currentSpecification} // Désactiver si en mode édition
                >
                  {Object.values(EquipmentTypes).map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Colonnes de la Table
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Longueur</TableCell>
                      <TableCell>Nullable</TableCell>
                      <TableCell>Valeur par Défaut</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.columns.map((column, index) => (
                      <TableRow key={index}>
                        <TableCell>{column.name}</TableCell>
                        <TableCell>{column.type}</TableCell>
                        <TableCell>{column.length || '-'}</TableCell>
                        <TableCell>{column.nullable ? 'Oui' : 'Non'}</TableCell>
                        <TableCell>{column.defaultValue || '-'}</TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleRemoveColumn(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Ajouter une nouvelle colonne
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                name="name"
                label="Nom de la colonne"
                fullWidth
                value={tempColumn.name}
                onChange={handleColumnInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={tempColumn.type}
                  label="Type"
                  onChange={handleColumnInputChange}
                >
                  {Object.values(ColumnTypes).map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                name="length"
                label="Longueur"
                type="number"
                fullWidth
                value={tempColumn.length || ''}
                onChange={handleColumnInputChange}
                disabled={tempColumn.type !== ColumnTypes.VARCHAR}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Nullable</InputLabel>
                <Select
                  name="nullable"
                  value={tempColumn.nullable ? 'true' : 'false'}
                  label="Nullable"
                  onChange={handleColumnInputChange}
                >
                  <MenuItem value="true">Oui</MenuItem>
                  <MenuItem value="false">Non</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                name="defaultValue"
                label="Valeur par défaut"
                fullWidth
                value={tempColumn.defaultValue || ''}
                onChange={handleColumnInputChange}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleAddColumn}
                startIcon={<AddIcon />}
                fullWidth
                sx={{ height: '100%' }}
              >
                Ajouter la colonne
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={formData.columns.length === 0}
          >
            {currentSpecification ? 'Mettre à jour' : 'Créer la spécification'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SpecificationsPage 
