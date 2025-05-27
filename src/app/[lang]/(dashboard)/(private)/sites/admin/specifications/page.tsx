'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import ListAltIcon from '@mui/icons-material/ListAlt'
import SchemaIcon from '@mui/icons-material/Schema'

import siteSpecificationsService, { SiteTypes, ColumnTypes, SiteSpecification } from '@/services/siteSpecificationsService'
import { useSnackbar } from 'notistack'

interface Column {
  name: string
  type: string
  length?: number
  nullable?: boolean
  defaultValue?: string
  description?: string
}

interface SpecificationFormData {
  siteType: string
  columns: Column[]
}

const emptyColumn: Column = {
  name: '',
  type: ColumnTypes.VARCHAR,
  length: 255,
  nullable: true,
  defaultValue: '',
  description: ''
}

const typeRequiresLength = (type: string) => {
  return type === ColumnTypes.VARCHAR
}

function TabPanel(props: {
  children?: React.ReactNode
  index: number
  value: number
}) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`spec-tabpanel-${index}`}
      aria-labelledby={`spec-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

const SiteSpecificationsAdmin = () => {
  const [specifications, setSpecifications] = useState<SiteSpecification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogType, setDialogType] = useState<'create' | 'edit'>('create')
  const [selectedSpecification, setSelectedSpecification] = useState<SiteSpecification | null>(null)
  const [formData, setFormData] = useState<SpecificationFormData>({
    siteType: '',
    columns: [{ ...emptyColumn }]
  })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<SiteSpecification | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [viewSpecification, setViewSpecification] = useState<SiteSpecification | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    fetchSpecifications()
  }, [])

  const fetchSpecifications = async () => {
    try {
      setLoading(true)
      const data = await siteSpecificationsService.getAllSiteSpecifications()
      setSpecifications(data)
    } catch (err) {
      console.error('Erreur lors du chargement des spécifications:', err)
      setError('Impossible de charger les spécifications des sites')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleOpenCreateDialog = () => {
    setFormData({
      siteType: '',
      columns: [{ ...emptyColumn }]
    })
    setDialogType('create')
    setOpenDialog(true)
  }

  const handleOpenEditDialog = (specification: SiteSpecification) => {
    setSelectedSpecification(specification)
    setFormData({
      siteType: specification.siteType,
      columns: [...specification.columns]
    })
    setDialogType('edit')
    setOpenDialog(true)
  }

  const handleOpenViewDialog = (specification: SiteSpecification) => {
    setViewSpecification(specification)
    setViewDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedSpecification(null)
  }

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false)
    setViewSpecification(null)
  }

  const handleOpenDeleteConfirm = (specification: SiteSpecification) => {
    setDeleteTarget(specification)
    setDeleteConfirmOpen(true)
  }

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false)
    setDeleteTarget(null)
  }

  const handleSiteTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFormData({
      ...formData,
      siteType: event.target.value as string
    })
  }

  const handleAddColumn = () => {
    setFormData({
      ...formData,
      columns: [...formData.columns, { ...emptyColumn }]
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

  const handleColumnChange = (index: number, field: keyof Column, value: any) => {
    const updatedColumns = [...formData.columns]
    
    // Traitement spécial pour le type de colonne
    if (field === 'type') {
      // Si le nouveau type ne nécessite pas de longueur, supprimer la propriété length
      if (!typeRequiresLength(value)) {
        delete updatedColumns[index].length
      } else if (!updatedColumns[index].length) {
        // Si le type nécessite une longueur et qu'elle n'existe pas, ajouter une valeur par défaut
        updatedColumns[index].length = 255
      }
    }
    
    updatedColumns[index] = {
      ...updatedColumns[index],
      [field]: value
    }
    
    setFormData({
      ...formData,
      columns: updatedColumns
    })
  }

  const validateForm = () => {
    // Vérifier que le type de site est sélectionné
    if (!formData.siteType) {
      enqueueSnackbar('Veuillez sélectionner un type de site', { variant: 'error' })
      return false
    }
    
    // Vérifier que chaque colonne a un nom et un type
    for (const column of formData.columns) {
      if (!column.name.trim()) {
        enqueueSnackbar('Toutes les colonnes doivent avoir un nom', { variant: 'error' })
        return false
      }
      
      if (!column.type) {
        enqueueSnackbar('Toutes les colonnes doivent avoir un type', { variant: 'error' })
        return false
      }
      
      // Vérifier que les noms de colonnes sont uniques
      const columnNames = formData.columns.map(col => col.name)
      if (columnNames.filter(name => name === column.name).length > 1) {
        enqueueSnackbar(`Le nom de colonne "${column.name}" est utilisé plusieurs fois`, { variant: 'error' })
        return false
      }
      
      // Vérifier que la longueur est spécifiée pour les types qui le nécessitent
      if (typeRequiresLength(column.type) && !column.length) {
        enqueueSnackbar(`La longueur est requise pour la colonne "${column.name}" de type ${column.type}`, { variant: 'error' })
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    try {
      setLoading(true)
      
      if (dialogType === 'create') {
        await siteSpecificationsService.createSiteSpecification(formData)
        enqueueSnackbar('Spécification de site créée avec succès', { variant: 'success' })
      } else {
        if (selectedSpecification) {
          await siteSpecificationsService.updateSiteSpecification(selectedSpecification.id, formData)
          enqueueSnackbar('Spécification de site mise à jour avec succès', { variant: 'success' })
        }
      }
      
      handleCloseDialog()
      fetchSpecifications()
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de la spécification:', err)
      enqueueSnackbar('Erreur lors de l\'enregistrement de la spécification', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    
    try {
      setLoading(true)
      await siteSpecificationsService.deleteSiteSpecification(deleteTarget.id)
      enqueueSnackbar('Spécification de site supprimée avec succès', { variant: 'success' })
      
      handleCloseDeleteConfirm()
      fetchSpecifications()
    } catch (err) {
      console.error('Erreur lors de la suppression de la spécification:', err)
      enqueueSnackbar('Erreur lors de la suppression de la spécification', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const getSpecificationsForType = (type: string) => {
    return specifications.filter(spec => spec.siteType === type)
  }

  if (loading && specifications.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Gestion des spécifications de sites</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Nouvelle spécification
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {specifications.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Aucune spécification de site définie
              </Typography>
              <Typography color="textSecondary" paragraph>
                Créez votre première spécification de site en cliquant sur le bouton ci-dessus.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
                sx={{ mt: 2 }}
              >
                Nouvelle spécification
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="specification tabs">
              <Tab icon={<ListAltIcon />} iconPosition="start" label="Liste complète" />
              <Tab icon={<SchemaIcon />} iconPosition="start" label="Par type de site" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type de site</TableCell>
                    <TableCell>Colonnes</TableCell>
                    <TableCell>Dernière mise à jour</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {specifications.map(specification => (
                    <TableRow key={specification.id}>
                      <TableCell>
                        <Chip 
                          label={specification.siteType} 
                          color="primary" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>{specification.columns.length}</TableCell>
                      <TableCell>
                        {new Date(specification.updatedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir les détails">
                          <IconButton 
                            onClick={() => handleOpenViewDialog(specification)}
                            color="info"
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton 
                            onClick={() => handleOpenEditDialog(specification)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton 
                            onClick={() => handleOpenDeleteConfirm(specification)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {Object.values(SiteTypes).map(type => (
                <Grid item xs={12} md={6} lg={4} key={type}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {type}
                      </Typography>
                      
                      {getSpecificationsForType(type).length > 0 ? (
                        <>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                              {getSpecificationsForType(type).length} spécification(s)
                            </Typography>
                          </Box>
                          <Box>
                            {getSpecificationsForType(type).map(spec => (
                              <Box key={spec.id} sx={{ mb: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2">
                                    {spec.columns.length} colonnes
                                  </Typography>
                                  <Box>
                                    <IconButton 
                                      onClick={() => handleOpenViewDialog(spec)}
                                      color="info"
                                      size="small"
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                      onClick={() => handleOpenEditDialog(spec)}
                                      color="primary"
                                      size="small"
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                      onClick={() => handleOpenDeleteConfirm(spec)}
                                      color="error"
                                      size="small"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                              </Box>
                            ))}
                          </Box>
                        </>
                      ) : (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="textSecondary" paragraph>
                            Aucune spécification définie
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => {
                              setFormData({
                                siteType: type,
                                columns: [{ ...emptyColumn }]
                              })
                              setDialogType('create')
                              setOpenDialog(true)
                            }}
                          >
                            Créer
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        </Card>
      )}

      {/* Dialogue de création/édition */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'create' ? 'Nouvelle spécification de site' : 'Modifier la spécification de site'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="site-type-label">Type de site</InputLabel>
              <Select
                labelId="site-type-label"
                value={formData.siteType}
                onChange={handleSiteTypeChange}
                label="Type de site"
                disabled={dialogType === 'edit'}
              >
                {Object.values(SiteTypes).map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom>
              Colonnes
            </Typography>

            {formData.columns.map((column, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Nom de la colonne"
                      value={column.name}
                      onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={column.type}
                        onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                        label="Type"
                        required
                      >
                        {Object.values(ColumnTypes).map(type => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {typeRequiresLength(column.type) && (
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Longueur"
                        type="number"
                        value={column.length || ''}
                        onChange={(e) => handleColumnChange(index, 'length', parseInt(e.target.value))}
                        required
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!column.nullable}
                          onChange={(e) => handleColumnChange(index, 'nullable', !e.target.checked)}
                        />
                      }
                      label="Requis"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveColumn(index)}
                        disabled={formData.columns.length <= 1}
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Valeur par défaut"
                      value={column.defaultValue || ''}
                      onChange={(e) => handleColumnChange(index, 'defaultValue', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={column.description || ''}
                      onChange={(e) => handleColumnChange(index, 'description', e.target.value)}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Box sx={{ mt: 2, mb: 3 }}>
              <Button
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddColumn}
                variant="outlined"
                fullWidth
              >
                Ajouter une colonne
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de visualisation */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Détails de la spécification: {viewSpecification?.siteType}
        </DialogTitle>
        <DialogContent>
          {viewSpecification && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Type de site: <Chip label={viewSpecification.siteType} color="primary" />
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Colonnes définies:
                </Typography>
                
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nom</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Requis</TableCell>
                        <TableCell>Valeur par défaut</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewSpecification.columns.map((column, index) => (
                        <TableRow key={index}>
                          <TableCell>{column.name}</TableCell>
                          <TableCell>
                            {`${column.type}${column.length ? `(${column.length})` : ''}`}
                          </TableCell>
                          <TableCell>
                            {column.nullable === false ? (
                              <Chip size="small" label="Oui" color="primary" />
                            ) : (
                              <Chip size="small" label="Non" variant="outlined" />
                            )}
                          </TableCell>
                          <TableCell>
                            {column.defaultValue || '-'}
                          </TableCell>
                          <TableCell>
                            {column.description || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Créé le: {new Date(viewSpecification.createdAt).toLocaleString('fr-FR')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Dernière mise à jour: {new Date(viewSpecification.updatedAt).toLocaleString('fr-FR')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Fermer</Button>
          <Button
            startIcon={<EditIcon />}
            variant="contained"
            onClick={() => {
              handleCloseViewDialog()
              if (viewSpecification) {
                handleOpenEditDialog(viewSpecification)
              }
            }}
          >
            Modifier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DeleteIcon color="error" sx={{ mr: 1 }} />
            Confirmer la suppression
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Voulez-vous vraiment supprimer la spécification pour le type de site <strong>{deleteTarget?.siteType}</strong> ?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Cette action est irréversible et supprimera également toutes les données de spécification associées aux sites de ce type.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Annuler</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            {loading ? 'Chargement...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SiteSpecificationsAdmin 
