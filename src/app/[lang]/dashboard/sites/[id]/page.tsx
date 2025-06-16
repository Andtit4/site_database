'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'

import { useRouter } from 'next/navigation'

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
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
import { SiteStatus } from '@/services/sitesService'
import type { Site } from '@/services/sitesService'
import { useAuth } from '@/hooks/useAuth'
import DynamicFieldsForm from '@/components/DynamicFieldsForm'

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

const SiteDetailsPage = ({ params }: { params: Promise<{ id: string; lang: string }> }) => {
  const router = useRouter()
  const resolvedParams = use(params)
  const lang = resolvedParams.lang || 'fr'

  const { 
    user, 
    loading: authLoading, 
    canViewSpecifications, 
    canEdit, 
    canAccessDepartmentResource 
  } = useAuth()
  
  const [site, setSite] = useState<Site | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [equipments, setEquipments] = useState<any[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const fetchSite = async () => {
    try {
      setLoading(true)
      const data = await sitesService.getSiteById(resolvedParams.id)
      
      // Vérifier si l'utilisateur peut accéder à ce site
      if (!canAccessDepartmentResource(data.departmentId || null)) {
        setError('Vous n\'avez pas l\'autorisation d\'accéder à ce site.')
        return
      }
      
      setSite(data)
      
      // Charger les équipements du site
      try {
        const equipmentData = await sitesService.getSiteEquipment(resolvedParams.id)
        setEquipments(equipmentData)
      } catch (err) {
        console.error('Erreur lors du chargement des équipements:', err)
        // Ne pas bloquer l'affichage du site si les équipements ne sont pas chargés
      }
      
    } catch (err: any) {
      console.error('Erreur lors du chargement du site:', err)
      setError(err.message || 'Erreur lors du chargement des informations du site')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchSite()
    }
  }, [resolvedParams.id, authLoading, user])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const navigateToSitesList = () => {
    router.push(`/${lang}/dashboard/sites`)
  }

  const handleEditClick = () => {
    // Vérifier les permissions avant de permettre l'édition
    if (!canEdit('site')) {
      setError('Vous n\'avez pas l\'autorisation de modifier ce site.')
      
return
    }
    
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
    // Vérifier les permissions avant de permettre la suppression
    if (!user?.isAdmin) {
      setError('Vous n\'avez pas l\'autorisation de supprimer ce site.')
      
return
    }
    
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true)
      await sitesService.deleteSite(resolvedParams.id)
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
          router.push(`/${lang}/dashboard/equipment/${equipmentId}`)
  }

  // Afficher le loader pendant l'authentification
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Rediriger si l'utilisateur n'est pas authentifié
  if (!user) {
    router.push(`/${lang}/login`)
    
return null
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

  // Préparer les onglets selon les permissions
  const availableTabs = [
    {
      icon: <EquipmentIcon />,
      label: 'Équipements',
      value: 0
    }
  ]

  // Ajouter l'onglet spécifications seulement si l'utilisateur a la permission
  if (canViewSpecifications()) {
    availableTabs.unshift({
      icon: <InfoIcon />,
      label: 'Spécifications',
      value: 0
    })

    // Réajuster les valeurs des onglets
    availableTabs[1].value = 1
    availableTabs.push({
      icon: <ConstructionIcon />,
      label: 'Maintenance',
      value: 2
    })
  } else {
    availableTabs.push({
      icon: <ConstructionIcon />,
      label: 'Maintenance',
      value: 1
    })
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
          {canEdit('site') && (
            <Button 
              startIcon={<EditIcon />} 
              onClick={handleEditClick}
              sx={{ mr: 1 }}
              disabled={site.status === SiteStatus.DELETED}
            >
              Modifier
            </Button>
          )}
          {user?.isAdmin && (
            <Button 
              startIcon={<DeleteIcon />} 
              color="error" 
              onClick={handleDeleteClick}
              disabled={site.status === SiteStatus.DELETED}
            >
              Supprimer
            </Button>
          )}
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
                    <Typography variant="body2" color="text.secondary">Nombre d&apos;équipements:</Typography>
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
            {availableTabs.map((tab, index) => (
              <Tab 
                key={index}
                icon={tab.icon} 
                iconPosition="start" 
                label={tab.label}
                value={tab.value}
              />
            ))}
          </Tabs>
        </Box>

        {/* Onglet Spécifications - seulement si l'utilisateur a la permission */}
        {canViewSpecifications() && (
          <TabPanel value={tabValue} index={0}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Champs personnalisés
                </Typography>
                
                {site.customFieldsValues && Object.keys(site.customFieldsValues).length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    <DynamicFieldsForm
                      values={site.customFieldsValues}
                      onChange={() => {}} // Mode lecture seule
                      readOnly={true}
                      showTitle={false}
                    />
                  </Box>
                ) : (
                  <Alert severity="info">
                    Ce site n&apos;a pas de champs personnalisés définis.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabPanel>
        )}

        <TabPanel value={tabValue} index={canViewSpecifications() ? 1 : 0}>
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
                        <TableCell>Date d&apos;installation</TableCell>
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

        <TabPanel value={tabValue} index={canViewSpecifications() ? 2 : 1}>
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
