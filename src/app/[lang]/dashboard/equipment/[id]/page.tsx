'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Divider,
  Avatar,
  Alert,
  Skeleton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Build as BuildIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'
import { equipmentService } from '@/services'
import { Equipment, EquipmentStatus } from '@/services/equipmentService'
import { EquipmentTypes } from '@/services/specificationsService'
import specificationsService, { Specification } from '@/services/specificationsService'

interface EquipmentDetailsPageProps {
  params: Promise<{
    lang: string
    id: string
  }>
}

const EquipmentDetailsPage = ({ params }: EquipmentDetailsPageProps) => {
  const router = useRouter()
  const resolvedParams = use(params)
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Equipment>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [typeSpecifications, setTypeSpecifications] = useState<Specification[]>([])
  const [specificationValues, setSpecificationValues] = useState<Record<string, any>>({})

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await equipmentService.getEquipmentById(resolvedParams.id)
      setEquipment(data)
      setEditData(data)
      
      // Charger les spécifications existantes
      if (data.specifications) {
        setSpecificationValues(data.specifications)
      }
      
      // Charger les spécifications du type d'équipement
      if (data.type) {
        await loadTypeSpecifications(data.type)
      }
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'équipement:', err)
      setError('Équipement non trouvé ou erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const loadTypeSpecifications = async (equipmentType: string) => {
    try {
      const specs = await specificationsService.getSpecificationsByType(equipmentType)
      setTypeSpecifications(specs)
    } catch (err) {
      console.error('Erreur lors du chargement des spécifications du type:', err)
      setTypeSpecifications([])
    }
  }

  useEffect(() => {
    if (resolvedParams.id) {
      fetchEquipment()
    }
  }, [resolvedParams.id])

  const handleEdit = () => {
    setEditing(true)
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setEditData(equipment || {})
    // Restaurer les valeurs des spécifications
    if (equipment?.specifications) {
      setSpecificationValues(equipment.specifications)
    }
  }

  const handleSaveEdit = async () => {
    if (!equipment || !editData) return

    try {
      setSaving(true)
      
      // Préparer les données avec les spécifications
      const updateData = {
        ...editData,
        specifications: specificationValues
      }
      
      const updatedEquipment = await equipmentService.updateEquipment(equipment.id, updateData)
      setEquipment(updatedEquipment)
      setEditing(false)
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err)
      setError('Erreur lors de la mise à jour de l\'équipement')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!equipment) return

    try {
      await equipmentService.deleteEquipment(equipment.id)
      router.push(`/${resolvedParams.lang}/dashboard/equipment`)
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      setError('Erreur lors de la suppression de l\'équipement')
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const handleTypeChange = async (newType: string) => {
    setEditData({ ...editData, type: newType })
    // Charger les nouvelles spécifications pour ce type
    await loadTypeSpecifications(newType)
    // Réinitialiser les valeurs de spécifications
    setSpecificationValues({})
  }

  const handleSpecificationChange = (columnName: string, value: any, columnType: string) => {
    let convertedValue = value
    
    // Convertir la valeur selon le type
    switch (columnType) {
      case 'int':
        convertedValue = value ? parseInt(value) : null
        break
      case 'float':
      case 'decimal':
        convertedValue = value ? parseFloat(value) : null
        break
      case 'boolean':
        convertedValue = value === 'true' || value === true
        break
      default:
        convertedValue = value
    }
    
    setSpecificationValues(prev => ({
      ...prev,
      [columnName]: convertedValue
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case EquipmentStatus.ACTIVE: return 'success'
      case EquipmentStatus.MAINTENANCE: return 'warning'
      case EquipmentStatus.INACTIVE: return 'error'
      case EquipmentStatus.PLANNED: return 'info'
      case EquipmentStatus.UNDER_INSTALLATION: return 'primary'
      default: return 'default'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case EquipmentTypes.ANTENNE: return '📡'
      case EquipmentTypes.ROUTEUR: return '🌐'
      case EquipmentTypes.BATTERIE: return '🔋'
      case EquipmentTypes.GÉNÉRATEUR: return '⚡'
      case EquipmentTypes.REFROIDISSEMENT: return '❄️'
      case EquipmentTypes.SHELTER: return '🏠'
      case EquipmentTypes.PYLÔNE: return '🗼'
      case EquipmentTypes.SÉCURITÉ: return '🔒'
      default: return '⚙️'
    }
  }

  const formatSpecificationValue = (value: any, columnType: string) => {
    if (value === null || value === undefined) return 'Non défini'
    
    switch (columnType) {
      case 'boolean':
        return value ? 'Oui' : 'Non'
      case 'date':
        return value ? new Date(value).toLocaleDateString('fr-FR') : 'Non défini'
      case 'datetime':
        return value ? new Date(value).toLocaleString('fr-FR') : 'Non défini'
      case 'int':
      case 'float':
      case 'decimal':
        return typeof value === 'number' ? value.toLocaleString() : value
      default:
        return value.toString()
    }
  }

  const renderSpecificationField = (column: any) => {
    const value = specificationValues[column.name] || ''
    
    if (editing) {
      switch (column.type) {
        case 'boolean':
          return (
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <Select
                value={value.toString()}
                onChange={(e) => handleSpecificationChange(column.name, e.target.value, column.type)}
              >
                <MenuItem value="true">Oui</MenuItem>
                <MenuItem value="false">Non</MenuItem>
              </Select>
            </FormControl>
          )
        case 'date':
          return (
            <TextField
              fullWidth
              size="small"
              type="date"
              value={value ? (typeof value === 'string' ? value.split('T')[0] : value) : ''}
              onChange={(e) => handleSpecificationChange(column.name, e.target.value, column.type)}
              sx={{ mt: 1 }}
              InputLabelProps={{ shrink: true }}
            />
          )
        case 'datetime':
          return (
            <TextField
              fullWidth
              size="small"
              type="datetime-local"
              value={value ? (typeof value === 'string' ? value.slice(0, 16) : value) : ''}
              onChange={(e) => handleSpecificationChange(column.name, e.target.value, column.type)}
              sx={{ mt: 1 }}
              InputLabelProps={{ shrink: true }}
            />
          )
        case 'int':
        case 'float':
        case 'decimal':
          return (
            <TextField
              fullWidth
              size="small"
              type="number"
              value={value || ''}
              onChange={(e) => handleSpecificationChange(column.name, e.target.value, column.type)}
              sx={{ mt: 1 }}
              inputProps={{
                step: column.type === 'int' ? 1 : 0.01
              }}
            />
          )
        default:
          return (
            <TextField
              fullWidth
              size="small"
              value={value || ''}
              onChange={(e) => handleSpecificationChange(column.name, e.target.value, column.type)}
              sx={{ mt: 1 }}
              inputProps={{
                maxLength: column.length
              }}
            />
          )
      }
    } else {
      return (
        <Typography variant="body1" sx={{ mt: 1 }}>
          {formatSpecificationValue(value, column.type)}
        </Typography>
      )
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Skeleton variant="text" width="300px" height={40} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={200} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={150} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Détails de l'équipement</Typography>
        </Box>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchEquipment}>
              Réessayer
            </Button>
          }
        >
          {error}
        </Alert>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Informations de diagnostic :</Typography>
          <Typography variant="body2">ID recherché: <strong>{resolvedParams.id}</strong></Typography>
          <Typography variant="body2">L'équipement avec cet ID n'existe pas dans la base de données.</Typography>
        </Alert>

        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Solutions possibles :</Typography>
            <Box sx={{ ml: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                1. Vérifiez que l'ID est correct
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                2. L'équipement pourrait avoir été supprimé
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                3. Créez un nouvel équipement avec cet ID
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => router.push(`/${resolvedParams.lang}/dashboard/equipment`)}
                sx={{ mr: 1 }}
              >
                Aller à la liste des équipements
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => {
                  // Créer un équipement de test avec l'ID manquant
                  const newEquipment = {
                    id: resolvedParams.id,
                    type: 'ANTENNE',
                    model: 'Équipement de test',
                    manufacturer: 'Test Manufacturer',
                    serialNumber: 'TEST-001',
                    installDate: new Date().toISOString().split('T')[0],
                    status: 'ACTIF',
                    siteId: '', // À définir
                    specifications: {}
                  };
                  console.log('Équipement à créer:', newEquipment);
                  router.push(`/${resolvedParams.lang}/dashboard/equipment?create=true&id=${resolvedParams.id}`);
                }}
              >
                Créer cet équipement
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    )
  }

  if (!equipment) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Équipement non trouvé</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {getTypeIcon(equipment.type)}
          </Avatar>
          <Box>
            <Typography variant="h4">
              {equipment.name || `${equipment.type} - ${equipment.model}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {equipment.id}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Tooltip title="Actualiser">
            <IconButton onClick={fetchEquipment} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {!editing && (
            <Tooltip title="Modifier">
              <IconButton onClick={handleEdit} sx={{ mr: 1 }}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Supprimer">
            <IconButton onClick={() => setDeleteDialogOpen(true)} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Informations principales */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon sx={{ mr: 1 }} />
                  Informations générales
                </Typography>
                {editing && (
                  <Box>
                    <Button 
                      onClick={handleCancelEdit} 
                      sx={{ mr: 1 }}
                      startIcon={<CancelIcon />}
                    >
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleSaveEdit} 
                      variant="contained"
                      disabled={saving}
                      startIcon={<SaveIcon />}
                    >
                      {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  {editing ? (
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        value={editData.type || ''}
                        onChange={(e) => handleTypeChange(e.target.value)}
                      >
                        {Object.values(EquipmentTypes).map((type) => (
                          <MenuItem key={type} value={type}>
                            {getTypeIcon(type)} {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {getTypeIcon(equipment.type)} {equipment.type}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                  {editing ? (
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        value={editData.status || ''}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      >
                        {Object.values(EquipmentStatus).map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={equipment.status}
                        color={getStatusColor(equipment.status) as any}
                        size="small"
                      />
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Modèle</Typography>
                  {editing ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editData.model || ''}
                      onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                      sx={{ mt: 1 }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {equipment.model || 'Non spécifié'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Fabricant</Typography>
                  {editing ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editData.manufacturer || ''}
                      onChange={(e) => setEditData({ ...editData, manufacturer: e.target.value })}
                      sx={{ mt: 1 }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {equipment.manufacturer || 'Non spécifié'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Numéro de série</Typography>
                  {editing ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editData.serialNumber || ''}
                      onChange={(e) => setEditData({ ...editData, serialNumber: e.target.value })}
                      sx={{ mt: 1 }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mt: 1, fontFamily: 'monospace' }}>
                      {equipment.serialNumber || 'Non spécifié'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Localisation</Typography>
                  {editing ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editData.location || ''}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      sx={{ mt: 1 }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ mr: 1, fontSize: 16 }} />
                      {equipment.location || 'Non spécifiée'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  {editing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      sx={{ mt: 1 }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {equipment.description || 'Aucune description disponible'}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Informations techniques */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <BuildIcon sx={{ mr: 1 }} />
                Informations techniques
              </Typography>

              <Grid container spacing={3}>
                {typeSpecifications.length > 0 ? (
                  typeSpecifications.map((specification) =>
                    specification.columns.map((column) => (
                      <Grid item xs={12} sm={6} key={`${specification.id}-${column.name}`}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {column.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                        {renderSpecificationField(column)}
                      </Grid>
                    ))
                  )
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Aucune spécification technique définie pour ce type d'équipement.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar avec dates et informations additionnelles */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <CalendarIcon sx={{ mr: 1 }} />
                Dates importantes
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Date d'achat</Typography>
                <Typography variant="body1">
                  {equipment.purchaseDate 
                    ? new Date(equipment.purchaseDate).toLocaleDateString('fr-FR')
                    : 'Non spécifiée'
                  }
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Date d'installation</Typography>
                <Typography variant="body1">
                  {equipment.installDate 
                    ? new Date(equipment.installDate).toLocaleDateString('fr-FR')
                    : 'Non spécifiée'
                  }
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Dernière maintenance</Typography>
                <Typography variant="body1">
                  {equipment.lastMaintenanceDate 
                    ? new Date(equipment.lastMaintenanceDate).toLocaleDateString('fr-FR')
                    : 'Aucune maintenance'
                  }
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Fin de garantie</Typography>
                <Typography variant="body1">
                  {equipment.warrantyExpiration 
                    ? new Date(equipment.warrantyExpiration).toLocaleDateString('fr-FR')
                    : 'Non spécifiée'
                  }
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Actions rapides
              </Typography>
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mb: 1 }}
                startIcon={<BuildIcon />}
              >
                Planifier maintenance
              </Button>
              <Button 
                fullWidth 
                variant="outlined"
                startIcon={<LocationIcon />}
              >
                Voir sur la carte
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cet équipement ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EquipmentDetailsPage 
