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
  IconButton,
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
import { sitesService } from '@/services'
import { Site, CreateSiteDto, UpdateSiteDto, SiteStatus } from '@/services/sitesService'

const SitesPage = () => {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentSite, setCurrentSite] = useState<Site | null>(null)
  const [formData, setFormData] = useState<CreateSiteDto>({
    id: '',
    name: '',
    region: '',
    zone: '',
    longitude: 0,
    latitude: 0,
    status: SiteStatus.ACTIVE
  })

  const fetchSites = async () => {
    try {
      setLoading(true)
      const data = await sitesService.getAllSites()
      setSites(data)
    } catch (err) {
      console.error('Erreur lors de la récupération des sites:', err)
      setError('Erreur lors du chargement des sites')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSites()
    
    // Ajouter un écouteur d'événement pour ouvrir le dialogue d'ajout depuis le menu
    const handleOpenAddDialog = () => {
      handleOpenDialog();
    };
    
    window.addEventListener('openAddSiteDialog', handleOpenAddDialog);
    
    // Nettoyer l'écouteur d'événement lors du démontage du composant
    return () => {
      window.removeEventListener('openAddSiteDialog', handleOpenAddDialog);
    };
  }, [])

  const handleOpenDialog = (site?: Site) => {
    if (site) {
      setCurrentSite(site)
      setFormData({
        id: site.id,
        name: site.name,
        region: site.region,
        zone: site.zone || '',
        longitude: site.longitude,
        latitude: site.latitude,
        status: site.status as SiteStatus,
        oldBase: site.oldBase,
        newBase: site.newBase
      })
    } else {
      setCurrentSite(null)
      setFormData({
        id: '',
        name: '',
        region: '',
        zone: '',
        longitude: 0,
        latitude: 0,
        status: SiteStatus.ACTIVE
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
      if (currentSite) {
        // Mise à jour du site
        const updateData: UpdateSiteDto = {
          name: formData.name,
          region: formData.region,
          zone: formData.zone,
          longitude: formData.longitude,
          latitude: formData.latitude,
          status: formData.status,
          oldBase: formData.oldBase,
          newBase: formData.newBase
        }
        await sitesService.updateSite(currentSite.id, updateData)
      } else {
        // Création d'un nouveau site
        await sitesService.createSite(formData)
      }
      
      handleCloseDialog()
      fetchSites() // Recharger la liste
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du site:', err)
      setError('Erreur lors de l\'enregistrement du site')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce site?')) {
      try {
        await sitesService.deleteSite(id)
        fetchSites() // Recharger la liste
      } catch (err) {
        console.error('Erreur lors de la suppression du site:', err)
        setError('Erreur lors de la suppression du site')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case SiteStatus.ACTIVE:
        return 'success'
      case SiteStatus.MAINTENANCE:
        return 'warning'
      case SiteStatus.INACTIVE:
        return 'error'
      case SiteStatus.UNDER_CONSTRUCTION:
        return 'info'
      default:
        return 'default'
    }
  }

  if (loading) {
    return <Typography>Chargement des sites...</Typography>
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Gestion des Sites</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Ajouter un site
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Région</TableCell>
                  <TableCell>Zone</TableCell>
                  <TableCell>Coordonnées</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>{site.id}</TableCell>
                    <TableCell>{site.name}</TableCell>
                    <TableCell>{site.region}</TableCell>
                    <TableCell>{site.zone || '-'}</TableCell>
                    <TableCell>
                      {site.latitude}, {site.longitude}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={site.status} 
                        color={getStatusColor(site.status) as any} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleOpenDialog(site)}>
                        Modifier
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(site.id)}>
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
        <DialogTitle>{currentSite ? 'Modifier le site' : 'Ajouter un site'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="id"
                label="ID du site"
                fullWidth
                value={formData.id}
                onChange={handleInputChange}
                disabled={!!currentSite}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Nom du site"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="region"
                label="Région"
                fullWidth
                value={formData.region}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="zone"
                label="Zone"
                fullWidth
                value={formData.zone}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="latitude"
                label="Latitude"
                type="number"
                fullWidth
                value={formData.latitude}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="longitude"
                label="Longitude"
                type="number"
                fullWidth
                value={formData.longitude}
                onChange={handleInputChange}
                required
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
                  <MenuItem value={SiteStatus.ACTIVE}>Actif</MenuItem>
                  <MenuItem value={SiteStatus.MAINTENANCE}>Maintenance</MenuItem>
                  <MenuItem value={SiteStatus.INACTIVE}>Inactif</MenuItem>
                  <MenuItem value={SiteStatus.UNDER_CONSTRUCTION}>En construction</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="oldBase"
                label="Ancienne base"
                fullWidth
                value={formData.oldBase || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="newBase"
                label="Nouvelle base"
                fullWidth
                value={formData.newBase || ''}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentSite ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SitesPage 
