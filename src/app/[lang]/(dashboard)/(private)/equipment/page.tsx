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
import { 
  equipmentService, 
  sitesService,
  departmentsService 
} from '@/services'
import { Equipment, EquipmentStatus, EquipmentType, CreateEquipmentDto, UpdateEquipmentDto } from '@/services/equipmentService'

const EquipmentPage = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentEquipment, setCurrentEquipment] = useState<Equipment | null>(null)
  const [formData, setFormData] = useState<CreateEquipmentDto>({
    name: '',
    description: '',
    model: '',
    serialNumber: '',
    manufacturer: '',
    status: EquipmentStatus.ACTIVE,
    siteId: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [equipmentData, sitesData, departmentsData] = await Promise.all([
        equipmentService.getAllEquipment(),
        sitesService.getAllSites(),
        departmentsService.getAllDepartments()
      ])
      setEquipment(equipmentData)
      setSites(sitesData)
      setDepartments(departmentsData)
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
  }, [])

  const handleOpenDialog = (equip?: Equipment) => {
    if (equip) {
      setCurrentEquipment(equip)
      setFormData({
        name: equip.name,
        description: equip.description || '',
        model: equip.model || '',
        serialNumber: equip.serialNumber || '',
        manufacturer: equip.manufacturer || '',
        purchaseDate: equip.purchaseDate,
        installDate: equip.installDate,
        lastMaintenanceDate: equip.lastMaintenanceDate,
        status: equip.status as EquipmentStatus,
        location: equip.location || '',
        purchasePrice: equip.purchasePrice,
        warrantyExpiration: equip.warrantyExpiration,
        ipAddress: equip.ipAddress || '',
        macAddress: equip.macAddress || '',
        siteId: equip.siteId,
        departmentId: equip.departmentId
      })
    } else {
      setCurrentEquipment(null)
      setFormData({
        name: '',
        description: '',
        model: '',
        serialNumber: '',
        manufacturer: '',
        status: EquipmentStatus.ACTIVE,
        siteId: sites.length > 0 ? sites[0].id : ''
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
      if (currentEquipment) {
        // Mise à jour de l'équipement
        const updateData: UpdateEquipmentDto = { ...formData }
        await equipmentService.updateEquipment(currentEquipment.id, updateData)
      } else {
        // Création d'un nouvel équipement
        await equipmentService.createEquipment(formData)
      }
      
      handleCloseDialog()
      fetchData() // Recharger la liste
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

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Site</TableCell>
                  <TableCell>Département</TableCell>
                  <TableCell>Modèle</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Dernière maintenance</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipment.map((equip) => (
                  <TableRow key={equip.id}>
                    <TableCell>{equip.name}</TableCell>
                    <TableCell>
                      {sites.find(site => site.id === equip.siteId)?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {departments.find(dept => dept.id === equip.departmentId)?.name || '-'}
                    </TableCell>
                    <TableCell>{equip.model || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={equip.status} 
                        color={getStatusColor(equip.status) as any} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {equip.lastMaintenanceDate 
                        ? new Date(equip.lastMaintenanceDate).toLocaleDateString() 
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
                ))}
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
                name="name"
                label="Nom de l'équipement"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                required
              />
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
                  value={formData.status}
                  label="Statut"
                  onChange={handleInputChange}
                >
                  <MenuItem value={EquipmentStatus.ACTIVE}>Actif</MenuItem>
                  <MenuItem value={EquipmentStatus.MAINTENANCE}>Maintenance</MenuItem>
                  <MenuItem value={EquipmentStatus.INACTIVE}>Inactif</MenuItem>
                  <MenuItem value={EquipmentStatus.PLANNED}>Planifié</MenuItem>
                  <MenuItem value={EquipmentStatus.UNDER_INSTALLATION}>En installation</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="purchasePrice"
                label="Prix d'achat"
                type="number"
                fullWidth
                value={formData.purchasePrice || ''}
                onChange={handleInputChange}
              />
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
            {currentEquipment ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EquipmentPage 
