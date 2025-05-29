'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import WarningIcon from '@mui/icons-material/Warning'
import EquipmentIcon from '@mui/icons-material/Widgets'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import InfoIcon from '@mui/icons-material/Info'
import ConstructionIcon from '@mui/icons-material/Construction'

import { sitesService } from '@/services'
import siteSpecificationsService from '@/services/siteSpecificationsService'
import { SiteStatus } from '@/services/sitesService'
import type { Site } from '@/services/sitesService'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`site-tabpanel-${index}`}
      aria-labelledby={`site-tab-${index}`}
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

const SiteDetailsPage = ({ params }: { params: { id: string; lang: string } }) => {
  const router = useRouter()
  const lang = params.lang || 'fr'
  const [site, setSite] = useState<Site | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [equipments, setEquipments] = useState<any[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [siteType, setSiteType] = useState<any>(null)

  const fetchSite = async () => {
    try {
      setLoading(true)
      const data = await sitesService.getSiteById(params.id)
      setSite(data)
      
      // Charger les équipements du site
      try {
        const equipmentData = await sitesService.getSiteEquipment(params.id)
        setEquipments(equipmentData)
      } catch (err) {
        console.error('Erreur lors du chargement des équipements:', err)
        // Ne pas bloquer l'affichage du site si les équipements ne sont pas chargés
      }
      
      // Si le site a un type, charger les spécifications du type
      if (data.type) {
        try {
          const specifications = await siteSpecificationsService.getSiteSpecificationsByType(data.type)
          if (specifications && specifications.length > 0) {
            setSiteType(specifications[0])
          }
        } catch (err) {
          console.error('Erreur lors du chargement des spécifications du type:', err)
        }
      }
      
    } catch (err: any) {
      console.error('Erreur lors du chargement du site:', err)
      setError(err.message || 'Erreur lors du chargement des informations du site')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSite()
  }, [params.id])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const navigateToSitesList = () => {
    router.push(`/${lang}/sites`)
  }

  const handleEditClick = () => {
    // Rediriger vers la page principale avec le dialogue d'édition ouvert
    // Utiliser un événement personnalisé pour ouvrir le dialogue
    navigateToSitesList()
    setTimeout(() => {
      if (site) {
        const event = new CustomEvent('openSiteEditDialog', { detail: { site } })
        window.dispatchEvent(event)
      }
    }, 100)
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true)
      await sitesService.deleteSite(params.id)
      setDeleteDialogOpen(false)
      navigateToSitesList()
    } catch (err: any) {
      console.error('Erreur lors de la suppression du site:', err)
      setError(err.message || 'Erreur lors de la suppression du site')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
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
      case SiteStatus.DELETED:
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case SiteStatus.ACTIVE:
        return 'Actif'
      case SiteStatus.MAINTENANCE:
        return 'Maintenance'
      case SiteStatus.INACTIVE:
        return 'Inactif'
      case SiteStatus.UNDER_CONSTRUCTION:
        return 'En construction'
      case SiteStatus.DELETED:
        return 'Supprimé'
      default:
        return status
    }
  }

  const navigateToEquipmentDetails = (equipmentId: string) => {
    router.push(`/${lang}/equipment/${equipmentId}`)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={navigateToSitesList}
          sx={{ mb: 2 }}
        >
          Retour à la liste des sites
        </Button>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    )
  }

  if (!site) {
    return (
      <Box sx={{ p: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={navigateToSitesList}
          sx={{ mb: 2 }}
        >
          Retour à la liste des sites
        </Button>
        <Alert severity="warning">
          Site introuvable
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={navigateToSitesList}
        >
          Retour à la liste des sites
        </Button>
        <Box>
          <Button 
            startIcon={<EditIcon />} 
            onClick={handleEditClick}
            sx={{ mr: 1 }}
            disabled={site.status === SiteStatus.DELETED}
          >
            Modifier
          </Button>
          <Button 
            startIcon={<DeleteIcon />} 
            color="error" 
            onClick={handleDeleteClick}
            disabled={site.status === SiteStatus.DELETED}
          >
            Supprimer
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">{site.name}</Typography>
            <Chip
              label={getStatusLabel(site.status)}
              color={getStatusColor(site.status) as any}
            />
          </Box>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            ID: {site.id}
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Informations générales
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Région:</Typography>
                    <Typography>{site.region}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Type:</Typography>
                    <Typography>{site.type || 'Non spécifié'}</Typography>
                  </Box>
                  {site.oldBase && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Ancienne base:</Typography>
                      <Typography>{site.oldBase}</Typography>
                    </Box>
                  )}
                  {site.newBase && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Nouvelle base:</Typography>
                      <Typography>{site.newBase}</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Localisation
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Coordonnées:</Typography>
                    <Typography>{site.latitude}, {site.longitude}</Typography>
                  </Box>
                  {site.zone && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Zone:</Typography>
                      <Typography>{site.zone}</Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    startIcon={<LocationOnIcon />}
                    href={`https://www.google.com/maps/search/?api=1&query=${site.latitude},${site.longitude}`}
                    target="_blank"
                    size="small"
                  >
                    Voir sur Google Maps
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Statistiques
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Nombre d'équipements:</Typography>
                    <Typography>{equipments.length}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Dernière mise à jour:</Typography>
                    <Typography>
                      {new Date(site.updatedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Date de création:</Typography>
                    <Typography>
                      {new Date(site.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="site tabs">
            <Tab icon={<InfoIcon />} iconPosition="start" label="Spécifications" />
            <Tab icon={<EquipmentIcon />} iconPosition="start" label="Équipements" />
            <Tab icon={<ConstructionIcon />} iconPosition="start" label="Maintenance" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Spécifications spécifiques au type {site.type || 'Non défini'}
              </Typography>
              
              {site.specifications && Object.keys(site.specifications).length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nom</TableCell>
                        <TableCell>Valeur</TableCell>
                        {siteType && (
                          <TableCell>Type</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(site.specifications).map(([key, value]) => {
                        // Trouver le type de la colonne si disponible
                        const columnDef = siteType?.columns?.find((col: any) => col.name === key);
                        
                        return (
                          <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{value !== null && value !== undefined ? String(value) : '-'}</TableCell>
                            {siteType && (
                              <TableCell>
                                {columnDef ? `${columnDef.type}${columnDef.length ? `(${columnDef.length})` : ''}` : '-'}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  Ce site n'a pas de spécifications définies.
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Équipements du site
              </Typography>
              
              {equipments.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Modèle</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell>Date d'installation</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {equipments.map((equipment) => (
                        <TableRow key={equipment.id}>
                          <TableCell>{equipment.id}</TableCell>
                          <TableCell>{equipment.type}</TableCell>
                          <TableCell>{equipment.model}</TableCell>
                          <TableCell>
                            <Chip
                              label={equipment.status}
                              color={equipment.status === 'ACTIVE' ? 'success' : equipment.status === 'MAINTENANCE' ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {equipment.installationDate ? new Date(equipment.installationDate).toLocaleDateString('fr-FR') : '-'}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="small"
                              onClick={() => navigateToEquipmentDetails(equipment.id)}
                            >
                              Détails
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  Aucun équipement associé à ce site.
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Historique de maintenance
              </Typography>
              
              <Alert severity="info">
                Fonctionnalité à venir.
              </Alert>
            </CardContent>
          </Card>
        </TabPanel>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon color="error" sx={{ mr: 1 }} />
            Confirmer la suppression
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le site <strong>{site.name}</strong> ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SiteDetailsPage 
