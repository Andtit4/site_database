'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab
} from '@mui/material'
import { 
  equipmentService, 
  sitesService,
  departmentsService,
  specificationsService
} from '@/services'
import { 
  Equipment, 
  EquipmentStatus, 
  CreateEquipmentDto, 
  UpdateEquipmentDto,
  EquipmentFilterDto
} from '@/services/equipmentService'
import { EquipmentTypes } from '@/services/specificationsService'
import { Specification } from '@/services/specificationsService'

const EquipmentPage = () => {
  const searchParams = useSearchParams()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [specifications, setSpecifications] = useState<Specification[]>([])
  const [currentSpecification, setCurrentSpecification] = useState<Specification | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentEquipment, setCurrentEquipment] = useState<Equipment | null>(null)
  const [filterValues, setFilterValues] = useState<EquipmentFilterDto>({})
  const [formData, setFormData] = useState<CreateEquipmentDto>({
    id: crypto.randomUUID(),
    type: EquipmentTypes.ANTENNE,
    model: '',
    installDate: new Date().toISOString().split('T')[0],
    status: EquipmentStatus.ACTIVE,
    siteId: '',
    specifications: {}
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [equipmentData, sitesData, departmentsData, specificationsData] = await Promise.all([
        equipmentService.getAllEquipment(filterValues),
        sitesService.getAllSites(),
        departmentsService.getAllDepartments(),
        specificationsService.getAllSpecifications()
      ])
      setEquipment(equipmentData)
      setSites(sitesData)
      setDepartments(departmentsData)
      setSpecifications(specificationsData)
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
    
    window.addEventListener('openAddEquipmentDialog', handleOpenAddDialog);
    
    // Nettoyer l'écouteur d'événement lors du démontage du composant
    return () => {
      window.removeEventListener('openAddEquipmentDialog', handleOpenAddDialog);
    };
  }, [filterValues])

  // Gérer les paramètres d'URL pour créer un équipement avec un ID spécifique
  useEffect(() => {
    const shouldCreate = searchParams.get('create')
    const idFromUrl = searchParams.get('id')
    
    if (shouldCreate === 'true' && idFromUrl && sites.length > 0) {
      setCurrentEquipment(null)
      const defaultSiteId = sites.length > 0 ? sites[0].id : '';
      setFormData({
        id: idFromUrl, // Utiliser l'ID de l'URL
        type: EquipmentTypes.ANTENNE,
        model: 'Équipement de test',
        manufacturer: 'Test Manufacturer',
        serialNumber: 'TEST-001',
        installDate: new Date().toISOString().split('T')[0],
        status: EquipmentStatus.ACTIVE,
        siteId: defaultSiteId,
        specifications: {}
      })
      setOpenDialog(true)
      
      // Nettoyer les paramètres d'URL après ouverture du dialogue
      const url = new URL(window.location.href)
      url.searchParams.delete('create')
      url.searchParams.delete('id')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, sites])

  // Trouver la spécification correspondant au type d'équipement sélectionné
  useEffect(() => {
    if (formData.type) {
      const spec = specifications.find(s => s.equipmentType === formData.type);
      setCurrentSpecification(spec || null);
      
      // Réinitialiser les spécifications lorsque le type change
      if (formData.specifications && Object.keys(formData.specifications).length > 0) {
        setFormData({
          ...formData,
          specifications: {}
        });
      }
    }
  }, [formData.type, specifications]);

  const handleOpenDialog = (equip?: Equipment) => {
    if (equip) {
      setCurrentEquipment(equip)
      setFormData({
        id: equip.id,
        type: equip.type,
        model: equip.model || '',
        serialNumber: equip.serialNumber || '',
        manufacturer: equip.manufacturer || '',
        installDate: equip.installDate ? new Date(equip.installDate).toISOString().split('T')[0] : '',
        lastMaintenanceDate: equip.lastMaintenanceDate ? new Date(equip.lastMaintenanceDate).toISOString().split('T')[0] : '',
        status: equip.status,
        specifications: equip.specifications || {},
        siteId: equip.siteId,
        departmentId: equip.departmentId,
        teamId: equip.teamId
      })
    } else {
      setCurrentEquipment(null)
      // Initialiser avec le premier site disponible
      const defaultSiteId = sites.length > 0 ? sites[0].id : '';
      setFormData({
        id: crypto.randomUUID(),
        type: EquipmentTypes.ANTENNE,
        model: '',
        installDate: new Date().toISOString().split('T')[0],
        status: EquipmentStatus.ACTIVE,
        siteId: defaultSiteId,
        specifications: {}
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

  const handleSpecificationChange = (name: string, value: any) => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [name]: value
      }
    });
  }

  const handleFilterChange = (name: string, value: any) => {
    setFilterValues({
      ...filterValues,
      [name]: value
    });
  }

  const validateEquipmentForm = () => {
    const errors: string[] = []

    // Vérifier les champs obligatoires
    if (!formData.type?.trim()) {
      errors.push('Le type d\'équipement est requis')
    }
    
    if (!formData.model?.trim()) {
      errors.push('Le modèle est requis')
    }
    
    if (!formData.siteId?.trim()) {
      errors.push('Le site est requis')
    }
    
    if (!formData.status?.trim()) {
      errors.push('Le statut est requis')
    }

    return errors
  }

  const handleSubmit = async () => {
    // Valider le formulaire avant soumission
    const validationErrors = validateEquipmentForm()
    
    if (validationErrors.length > 0) {
      setError(`Erreurs de validation: ${validationErrors.join(', ')}`)
      return
    }

    try {
      if (currentEquipment) {
        // Mise à jour de l'équipement
        const updateData: UpdateEquipmentDto = { 
          type: formData.type,
          model: formData.model,
          serialNumber: formData.serialNumber,
          manufacturer: formData.manufacturer,
          installDate: formData.installDate,
          lastMaintenanceDate: formData.lastMaintenanceDate,
          status: formData.status,
          specifications: formData.specifications,
          siteId: formData.siteId,
          departmentId: formData.departmentId,
          teamId: formData.teamId
        }
        await equipmentService.updateEquipment(currentEquipment.id, updateData)
      } else {
        // Création d'un nouvel équipement
        await equipmentService.createEquipment(formData)
      }
      
      handleCloseDialog()
      fetchData() // Recharger la liste
      setError(null) // Réinitialiser l'erreur
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de l\'équipement:', err)
      setError('Erreur lors de l\'enregistrement de l\'équipement')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet équipement?')) {
      try {
        await equipmentService.deleteEquipment(id)
        fetchData() // Recharger la liste
      } catch (err) {
        console.error('Erreur lors de la suppression de l\'équipement:', err)
        setError('Erreur lors de la suppression de l\'équipement')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case EquipmentStatus.ACTIVE:
        return 'success'
      case EquipmentStatus.MAINTENANCE:
        return 'warning'
      case EquipmentStatus.INACTIVE:
        return 'error'
      case EquipmentStatus.PLANNED:
        return 'info'
      case EquipmentStatus.UNDER_INSTALLATION:
        return 'secondary'
      default:
        return 'default'
    }
  }

  if (loading) {
    return <Typography>Chargement des équipements...</Typography>
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Gestion des Équipements</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Ajouter un équipement
        </Button>
      </Box>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Filtres</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                name="search"
                label="Recherche"
                fullWidth
                value={filterValues.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Modèle, numéro de série..."
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type d'équipement</InputLabel>
                <Select
                  name="type"
                  multiple
                  value={filterValues.type || []}
                  label="Type d'équipement"
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  {Object.values(EquipmentTypes).map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="status"
                  multiple
                  value={filterValues.status || []}
                  label="Statut"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {Object.values(EquipmentStatus).map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Site</InputLabel>
                <Select
                  name="siteId"
                  value={filterValues.siteId || ''}
                  label="Site"
                  onChange={(e) => handleFilterChange('siteId', e.target.value)}
                >
                  <MenuItem value="">Tous les sites</MenuItem>
                  {sites.map(site => (
                    <MenuItem key={site.id} value={site.id}>{site.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Modèle</TableCell>
                  <TableCell>Site</TableCell>
                  <TableCell>Département</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date d'installation</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Aucun équipement trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  equipment.map((equip) => (
                    <TableRow key={equip.id}>
                      <TableCell>{equip.id}</TableCell>
                      <TableCell>
                        <Chip label={equip.type} color="primary" size="small" />
                      </TableCell>
                      <TableCell>{equip.model || '-'}</TableCell>
                      <TableCell>
                        {sites.find(site => site.id === equip.siteId)?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {departments.find(dept => dept.id === equip.departmentId)?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={equip.status} 
                          color={getStatusColor(equip.status) as any} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {equip.installDate 
                          ? new Date(equip.installDate).toLocaleDateString() 
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => handleOpenDialog(equip)}>
                          Modifier
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDelete(equip.id)}>
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
          {currentEquipment ? 'Modifier l\'équipement' : 'Ajouter un équipement'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="id"
                label="ID de l'équipement"
                fullWidth
                value={formData.id}
                onChange={handleInputChange}
                disabled={!!currentEquipment}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Type d'équipement</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="Type d'équipement"
                  onChange={handleInputChange}
                  disabled={!!currentEquipment} // Désactiver en mode édition
                >
                  {Object.values(EquipmentTypes).map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Site</InputLabel>
                <Select
                  name="siteId"
                  value={formData.siteId}
                  label="Site"
                  onChange={handleInputChange}
                >
                  {sites.map(site => (
                    <MenuItem key={site.id} value={site.id}>
                      {site.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Département</InputLabel>
                <Select
                  name="departmentId"
                  value={formData.departmentId || ''}
                  label="Département"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Aucun</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="model"
                label="Modèle"
                fullWidth
                value={formData.model || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="serialNumber"
                label="Numéro de série"
                fullWidth
                value={formData.serialNumber || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="manufacturer"
                label="Fabricant"
                fullWidth
                value={formData.manufacturer || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="status"
                  value={formData.status || EquipmentStatus.ACTIVE}
                  label="Statut"
                  onChange={handleInputChange}
                >
                  {Object.values(EquipmentStatus).map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="installDate"
                label="Date d'installation"
                type="date"
                fullWidth
                value={formData.installDate || ''}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="lastMaintenanceDate"
                label="Dernière maintenance"
                type="date"
                fullWidth
                value={formData.lastMaintenanceDate || ''}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Section des spécifications dynamiques */}
            {currentSpecification && (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Spécifications spécifiques au type {formData.type}
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nom</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Valeur</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentSpecification.columns.map((column, index) => (
                        <TableRow key={index}>
                          <TableCell>{column.name}</TableCell>
                          <TableCell>{column.type}</TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              type={column.type === 'int' || column.type === 'float' || column.type === 'decimal' ? 'number' : 'text'}
                              value={formData.specifications?.[column.name] || ''}
                              onChange={(e) => handleSpecificationChange(column.name, e.target.value)}
                              required={!column.nullable}
                              placeholder={column.defaultValue || ''}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.type?.trim() || !formData.model?.trim() || !formData.siteId?.trim() || !formData.status?.trim()}
          >
            {currentEquipment ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EquipmentPage 
