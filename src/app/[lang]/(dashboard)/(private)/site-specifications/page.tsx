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
  IconButton
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

import type { 
  SiteSpecification, 
  CreateSiteSpecificationDto, 
  UpdateSiteSpecificationDto, 
  SiteColumnDefinition} from '@/services/siteSpecificationsService';
import siteSpecificationsService, {
  SiteTypes,
  ColumnTypes
} from '@/services/siteSpecificationsService'


// Fonction pour formater les noms des types de sites
const formatSiteType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'TOUR': 'Tour',
    'SHELTER': 'Shelter',
    'PYLONE': 'Pylône',
    'BATIMENT': 'Bâtiment',
    'TOIT_BATIMENT': 'Toit de bâtiment',
    'ROOFTOP': 'Rooftop',
    'TERRAIN_BAILLE': 'Terrain baillé',
    'TERRAIN_PROPRIETAIRE': 'Terrain propriétaire',
    'AUTRE': 'Autre'
  };
  
  return typeMap[type] || type;
};

// Fonction pour obtenir le nom de la table à partir du type de site
const getTableName = (siteType: string): string => {
  return `site_spec_${siteType.toLowerCase()}`;
};

// Fonction pour formater les dates
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const SiteSpecificationsPage = () => {
  const [specifications, setSpecifications] = useState<SiteSpecification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentSpecification, setCurrentSpecification] = useState<SiteSpecification | null>(null)

  const [formData, setFormData] = useState<CreateSiteSpecificationDto>({
    siteType: SiteTypes.TOUR,
    columns: []
  })

  const [tempColumn, setTempColumn] = useState<SiteColumnDefinition>({
    name: '',
    type: ColumnTypes.VARCHAR,
    length: 255,
    nullable: true,
    defaultValue: ''
  })

  const fetchSpecifications = async () => {
    try {
      setLoading(true)
      const data = await siteSpecificationsService.getAllSiteSpecifications()

      console.log('Spécifications reçues:', data)
      setSpecifications(data)
      setError(null)
    } catch (err: any) {
      console.error('Erreur lors de la récupération des spécifications de sites:', err)
      setError(err.message || 'Erreur lors du chargement des spécifications de sites')
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
    
    window.addEventListener('openAddSiteSpecificationDialog', handleOpenAddDialog);
    
    // Nettoyer l'écouteur d'événement lors du démontage du composant
    return () => {
      window.removeEventListener('openAddSiteSpecificationDialog', handleOpenAddDialog);
    };
  }, [])

  const handleOpenDialog = (specification?: SiteSpecification) => {
    if (specification) {
      setCurrentSpecification(specification)
      setFormData({
        siteType: specification.siteType,
        columns: [...specification.columns]
      })
    } else {
      setCurrentSpecification(null)
      setFormData({
        siteType: SiteTypes.TOUR,
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
    
    if (name === 'siteType') {
      setFormData({
        ...formData,
        siteType: value as string
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
    
    const newColumn: SiteColumnDefinition = {
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
      if (!formData.siteType) {
        alert('Le type de site est requis')
        
return
      }
      
      if (formData.columns.length === 0) {
        alert('Vous devez ajouter au moins une colonne')
        
return
      }
      
      if (currentSpecification) {
        // Mise à jour de la spécification
        const updateData: UpdateSiteSpecificationDto = { ...formData }

        await siteSpecificationsService.updateSiteSpecification(currentSpecification.id, updateData)
      } else {
        // Création d'une nouvelle spécification
        await siteSpecificationsService.createSiteSpecification(formData)
      }
      
      handleCloseDialog()
      fetchSpecifications() // Recharger la liste
      setError(null)
    } catch (err: any) {
      console.error('Erreur lors de l\'enregistrement de la spécification de site:', err)
      setError(err.message || 'Erreur lors de l\'enregistrement de la spécification de site')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette spécification de site? Cette action supprimera également la table correspondante en base de données.')) {
      try {
        await siteSpecificationsService.deleteSiteSpecification(id)
        fetchSpecifications() // Recharger la liste
        setError(null)
      } catch (err: any) {
        console.error('Erreur lors de la suppression de la spécification de site:', err)
        setError(err.message || 'Erreur lors de la suppression de la spécification de site')
      }
    }
  }

  if (loading) {
    return <Typography>Chargement des spécifications de sites...</Typography>
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Gestion des Spécifications de Sites</Typography>
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
                  <TableCell>Type de Site</TableCell>
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
                      Aucune spécification de site trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  specifications.map((specification) => (
                    <TableRow key={specification.id}>
                      <TableCell>
                        <Chip 
                          label={formatSiteType(specification.siteType)} 
                          color="primary" 
                          title={specification.siteType}
                        />
                      </TableCell>
                      <TableCell>{specification.columns.length}</TableCell>
                      <TableCell>
                        {getTableName(specification.siteType)} 
                        <Typography variant="caption" display="block" color="textSecondary">
                          (Type: {specification.siteType})
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(specification.createdAt)}</TableCell>
                      <TableCell>{formatDate(specification.updatedAt)}</TableCell>
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
          {currentSpecification ? 'Modifier la spécification de site' : 'Ajouter une spécification de site'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Type de Site</InputLabel>
                <Select
                  name="siteType"
                  value={formData.siteType}
                  label="Type de Site"
                  onChange={handleInputChange}
                  disabled={!!currentSpecification} // Désactiver si en mode édition
                >
                  {Object.values(SiteTypes).map((type) => (
                    <MenuItem key={type} value={type}>
                      {formatSiteType(type)}
                    </MenuItem>
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

export default SiteSpecificationsPage 
