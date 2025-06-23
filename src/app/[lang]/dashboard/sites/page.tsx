'use client'

import { useEffect, useState, useMemo } from 'react'

import { useRouter, useParams } from 'next/navigation'

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
  Pagination,
  CircularProgress,
  Alert
} from '@mui/material'

import type { SelectChangeEvent } from '@mui/material/Select'

import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'

import { sitesService } from '@/services'
import type { Site, CreateSiteDto, UpdateSiteDto } from '@/services/sitesService';
import { SiteStatus, region } from '@/services/sitesService'

import { useAuth } from '@/hooks/useAuth'
import { useSitesWithPermissions } from '@/hooks/useSitesWithPermissions'
import DynamicFieldsForm from '@/components/DynamicFieldsForm'

// Nombre de sites par page
const ITEMS_PER_PAGE = 10

const SitesPage = () => {
  const { 
    user, 
    loading: authLoading, 
    canViewAllResources, 
    canCreate, 
    canEdit,
    getUserDepartmentId 
  } = useAuth()
  
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentSite, setCurrentSite] = useState<Site | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [filterExpanded, setFilterExpanded] = useState(false);
  
  // Filtres
  const [filterValues, setFilterValues] = useState({
    search: '',
    region: '',
    status: ''
  });

  const { 
    sites, 
    loading, 
    error: sitesError, 
    permissionError, 
    refreshSites 
  } = useSitesWithPermissions({
    filters: { showDeleted },
    autoFetch: false
  });

  const [formData, setFormData] = useState<CreateSiteDto>({
    id: '',
    name: '',
    region: region.MARITIME,
    longitude: 0,
    latitude: 0,
    status: SiteStatus.ACTIVE,
    specifications: {},
    customFieldsValues: {},
    departmentId: getUserDepartmentId() || undefined // Définir automatiquement le département de l'utilisateur
  })

  const router = useRouter()
  const params = useParams()
  const lang = params.lang || 'fr'

  // Fonction pour gérer les changements dans les champs personnalisés
  const handleCustomFieldsChange = (values: Record<string, any>) => {
    setFormData({
      ...formData,
      customFieldsValues: values
    });
  };

  // Chargement initial des données une seule fois
  useEffect(() => {
    if (!authLoading && user) {
      refreshSites({ showDeleted })
    }
  }, [authLoading, user])

  // Rafraîchir SEULEMENT les sites quand showDeleted change (pas sur chaque rendu)
  useEffect(() => {
    if (!authLoading && user) {
      refreshSites({ showDeleted });
    }
  }, [showDeleted])

  // Event listeners - SIMPLIFIÉ pour éviter les re-renders
  useEffect(() => {
    const handleOpenAddDialog = () => {
      handleOpenDialog();
    };

    const handleOpenEditDialog = (event: CustomEvent) => {
      if (event.detail && event.detail.site) {
        handleOpenDialog(event.detail.site);
      }
    };

    window.addEventListener('openAddSiteDialog', handleOpenAddDialog);
    window.addEventListener('openSiteEditDialog', handleOpenEditDialog as EventListener);
    
    return () => {
      window.removeEventListener('openAddSiteDialog', handleOpenAddDialog);
      window.removeEventListener('openSiteEditDialog', handleOpenEditDialog as EventListener);
    };
  }, []) // AUCUNE dépendance pour éviter les boucles



  // Utiliser useMemo pour calculer les sites filtrés au lieu d'un useEffect
  const filteredSites = useMemo(() => {
    let result = [...sites];
    
    // Filtrer par recherche (nom, id)
    if (filterValues.search) {
      const searchTerm = filterValues.search.toLowerCase();

      result = result.filter(site => 
        site.name.toLowerCase().includes(searchTerm) || 
        site.id.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtrer par région
    if (filterValues.region) {
      result = result.filter(site => site.region === filterValues.region);
    }
    
    // Filtrer par statut
    if (filterValues.status) {
      result = result.filter(site => site.status === filterValues.status);
    }
    
    return result;
  }, [sites, filterValues]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [filterValues]);

  // Gérer le changement de page
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Gérer les changements dans les filtres
  const handleFilterChange = (name: string, value: string) => {
    setFilterValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenDialog = (site?: Site) => {
    if (site) {
      setCurrentSite(site)
      setFormData({
        id: site.id,
        name: site.name,
        region: site.region,
        longitude: site.longitude,
        latitude: site.latitude,
        status: site.status as SiteStatus,
        oldBase: site.oldBase,
        newBase: site.newBase,
        specifications: site.specifications || {},
        customFieldsValues: site.customFieldsValues || {},
        departmentId: site.departmentId
      })
    } else {
      setCurrentSite(null)
      
      // Définir le département par défaut DIRECTEMENT ici
      const userDepartmentId = getUserDepartmentId()

      const defaultDepartmentId = (userDepartmentId && !canViewAllResources()) 
        ? userDepartmentId 
        : undefined
      
      setFormData({
        id: '',
        name: '',
        region: region.MARITIME,
        longitude: 0,
        latitude: 0,
        status: SiteStatus.ACTIVE,
        specifications: {},
        customFieldsValues: {},
        departmentId: defaultDepartmentId
      })
    }

    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target
    
    // Convertir les valeurs de longitude et latitude en nombres pour le formulaire
    if (name === 'longitude' || name === 'latitude') {
      setFormData({
        ...formData,
        [name]: parseFloat(value as string) || 0
      })
    } else {
      setFormData({
        ...formData,
        [name as string]: value
      })
    }
  }



  const validateSiteForm = () => {
    const errors: string[] = []

    // Vérifier les champs obligatoires
    if (!formData.id?.trim()) {
      errors.push('L\'ID du site est requis')
    }
    
    if (!formData.name?.trim()) {
      errors.push('Le nom du site est requis')
    }
    
    if (!formData.region?.trim()) {
      errors.push('La région est requise')
    }

    // Valider les coordonnées GPS
    const longitude = Number(formData.longitude)
    const latitude = Number(formData.latitude)

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      errors.push('La longitude doit être un nombre valide entre -180 et 180')
    }

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      errors.push('La latitude doit être un nombre valide entre -90 et 90')
    }

    if (!formData.status?.trim()) {
      errors.push('Le statut est requis')
    }

    return errors
  }

  const handleSubmit = async () => {
    try {
      // Valider le formulaire avant soumission
      const validationErrors = validateSiteForm()
      
      if (validationErrors.length > 0) {
        setError(`Erreurs de validation: ${validationErrors.join(', ')}`)
        
return
      }

      // Convertir les coordonnées GPS en nombres
      const longitude = Number(formData.longitude)
      const latitude = Number(formData.latitude)

      const formDataToSubmit = {
        id: formData.id,
        name: formData.name,
        region: formData.region,
        longitude: parseFloat(longitude.toFixed(6)),
        latitude: parseFloat(latitude.toFixed(6)),
        status: formData.status,
        oldBase: formData.oldBase,
        newBase: formData.newBase,
        specifications: formData.specifications,
        customFieldsValues: formData.customFieldsValues,
        departmentId: formData.departmentId
      };
      
      // Déboguer les données avant soumission
      console.log("Données du formulaire à soumettre:", JSON.stringify(formDataToSubmit));
      
      if (currentSite) {
        // Mise à jour du site
        const updateData: UpdateSiteDto = {
          name: formDataToSubmit.name,
          region: formDataToSubmit.region,
          longitude: formDataToSubmit.longitude,
          latitude: formDataToSubmit.latitude,
          status: formDataToSubmit.status,
          oldBase: formDataToSubmit.oldBase,
          newBase: formDataToSubmit.newBase,
          specifications: formDataToSubmit.specifications,
          customFieldsValues: formDataToSubmit.customFieldsValues
        }

        await sitesService.updateSite(currentSite.id, updateData)
      } else {
        // Création d'un nouveau site
        await sitesService.createSite(formDataToSubmit)
      }

      handleCloseDialog()

      // refreshSites() // Ne plus recharger automatiquement - l'utilisateur peut cliquer sur "Actualiser"
    } catch (err: any) {
      console.error('Erreur lors de l\'enregistrement du site:', err)

      // Afficher un message d'erreur plus précis si disponible
      setError(err.message || 'Erreur lors de l\'enregistrement du site')
    }
  }

  const handleOpenDeleteDialog = (id: string) => {
    setSiteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSiteToDelete(null);
  };

  const handleDelete = async () => {
    if (!siteToDelete) return;

    try {
      await sitesService.deleteSite(siteToDelete);

      // Ne plus actualiser automatiquement - l'utilisateur peut cliquer sur "Actualiser"
      // await refreshSites();

      // Fermer la boîte de dialogue
      handleCloseDeleteDialog();
    } catch (err: any) {
      console.error('Erreur lors de la suppression du site:', err);

      // Afficher un message d'erreur plus précis si disponible
      setError(err.message || 'Erreur lors de la suppression du site');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      // Restaurer le site en changeant son statut à ACTIVE
      await sitesService.updateSite(id, { status: SiteStatus.ACTIVE });

      // Ne plus actualiser automatiquement - l'utilisateur peut cliquer sur "Actualiser"
      // await refreshSites();
    } catch (err: any) {
      console.error('Erreur lors de la restauration du site:', err);

      // Afficher un message d'erreur plus précis si disponible
      setError(err.message || 'Erreur lors de la restauration du site');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case SiteStatus.ACTIVE:
        return 'success';
      case SiteStatus.MAINTENANCE:
        return 'warning';
      case SiteStatus.INACTIVE:
        return 'error';
      case SiteStatus.UNDER_CONSTRUCTION:
        return 'info';
      case SiteStatus.DELETED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case SiteStatus.ACTIVE:
        return 'Actif';
      case SiteStatus.MAINTENANCE:
        return 'Maintenance';
      case SiteStatus.INACTIVE:
        return 'Inactif';
      case SiteStatus.UNDER_CONSTRUCTION:
        return 'En construction';
      case SiteStatus.DELETED:
        return 'Supprimé';
      default:
        return status;
    }
  };

  // Pagination des sites
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedSites = filteredSites.slice(startIndex, endIndex);

  // Fonction pour naviguer vers les détails d'un site
  const navigateToSiteDetails = (siteId: string) => {
    router.push(`/${lang}/dashboard/sites/${siteId}`)
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

  if (loading && sites.length === 0) {
    return <Typography>Chargement des sites...</Typography>
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Gestion des Sites</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                color="primary"
              />
            }
            label="Afficher les sites supprimés"
          />
          <Button 
            variant="outlined" 
            onClick={() => refreshSites({ showDeleted })}
            disabled={loading}
          >
            {loading ? 'Actualisation...' : 'Actualiser'}
          </Button>
          {canCreate('site') && (
            <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
              Ajouter un site
            </Button>
          )}
        </Box>
      </Box>

      {/* Alertes d'erreur */}
      {(error || sitesError) && (
        <Alert severity="error" sx={{ mb: 2 }}>{error || sitesError}</Alert>
      )}

      {/* Alerte pour les erreurs de permissions */}
      {permissionError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Accès limité aux données des sites
          </Typography>
          <Typography variant="body2">
            Votre compte n&apos;a pas les permissions nécessaires pour accéder aux données des sites depuis le serveur. 
            Veuillez contacter votre administrateur système pour obtenir les autorisations nécessaires.
            {!canViewAllResources() && (
              <> Vous devriez normalement pouvoir accéder aux sites de votre département.</>
            )}
          </Typography>
        </Alert>
      )}

      {/* Section de filtrage */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1 }} /> Filtres
            </Typography>
            <Button 
              size="small" 
              onClick={() => setFilterExpanded(!filterExpanded)}
            >
              {filterExpanded ? 'Réduire' : 'Développer'}
            </Button>
          </Box>

          <Box sx={{ display: filterExpanded ? 'block' : 'none' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Recherche"
                  value={filterValues.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="ID, nom, type..."
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Région</InputLabel>
                  <Select
                    value={filterValues.region}
                    label="Région"
                    onChange={(e) => handleFilterChange('region', e.target.value)}
                  >
                    <MenuItem value="">Toutes les régions</MenuItem>
                    {Object.values(region).map((r) => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={filterValues.status}
                    label="Statut"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="">Tous les statuts</MenuItem>
                    {Object.values(SiteStatus).map((status) => (
                      <MenuItem key={status} value={status}>{getStatusLabel(status)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Région</TableCell>
                  <TableCell>Coordonnées</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : displayedSites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {permissionError ? 'Aucun accès aux sites' : 'Aucun site trouvé'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedSites.map((site) => (
                    <TableRow key={site.id}>
                      <TableCell>{site.id}</TableCell>
                      <TableCell>{site.name}</TableCell>
                      <TableCell>{site.region}</TableCell>
                      <TableCell>
                        {site.latitude}, {site.longitude}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(site.status)}
                          color={getStatusColor(site.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {canEdit('site') && (
                          <Button 
                            size="small" 
                            onClick={() => handleOpenDialog(site)}
                            disabled={site.status === SiteStatus.DELETED}
                            sx={{ mr: 1 }}
                          >
                            Modifier
                          </Button>
                        )}
                        {user?.isAdmin && site.status !== SiteStatus.DELETED && (
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(site.id)}
                            sx={{ mr: 1 }}
                          >
                            Supprimer
                          </Button>
                        )}
                        {canEdit('site') && site.status === SiteStatus.DELETED && (
                          <Button 
                            size="small" 
                            color="success" 
                            onClick={() => handleRestore(site.id)}
                            sx={{ mr: 1 }}
                          >
                            Restaurer
                          </Button>
                        )}
                        <Button 
                          size="small" 
                          color="primary" 
                          onClick={() => navigateToSiteDetails(site.id)}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {filteredSites.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={Math.ceil(filteredSites.length / ITEMS_PER_PAGE)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
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
              <FormControl fullWidth required>
                <InputLabel>Région</InputLabel>
                <Select
                  name="region"
                  value={formData.region}
                  label="Région"
                  onChange={handleInputChange}
                >
                  {Object.entries(region).map(([key, value]) => (
                    <MenuItem key={key} value={value}>{value}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                inputProps={{ step: 'any' }}
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
                inputProps={{ step: 'any' }}
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
                  {currentSite && currentSite.status === SiteStatus.DELETED && (
                    <MenuItem value={SiteStatus.DELETED}>Supprimé</MenuItem>
                  )}
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
            {/* Champs personnalisés */}
            <Grid item xs={12}>
              <DynamicFieldsForm
                values={formData.customFieldsValues || {}}
                onChange={handleCustomFieldsChange}
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

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce site? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SitesPage
