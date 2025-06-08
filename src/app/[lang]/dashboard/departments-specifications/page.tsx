'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Skeleton,
  Alert,
  Toolbar,
  Tooltip,
  IconButton
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import InfoIcon from '@mui/icons-material/Info'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { departmentsService, sitesService } from '@/services'
import siteSpecificationsService, { SiteSpecification } from '@/services/siteSpecificationsService'
import { Department } from '@/services/departmentsService'
import { Site } from '@/services/sitesService'

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
      id={`department-tabpanel-${index}`}
      aria-labelledby={`department-tab-${index}`}
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

function a11yProps(index: number) {
  return {
    id: `department-tab-${index}`,
    'aria-controls': `department-tabpanel-${index}`,
  }
}

const DepartmentsSpecificationsPage = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [siteSpecifications, setSiteSpecifications] = useState<SiteSpecification[]>([])
  const [filteredSpecifications, setFilteredSpecifications] = useState<{ [key: string]: any[] }>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState(0)
  const [selectedSpecification, setSelectedSpecification] = useState<SiteSpecification | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentData, setCurrentData] = useState<any[]>([])

  const fetchData = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      // Récupérer toutes les données nécessaires
      const [departmentsData, sitesData, specificationsData] = await Promise.all([
        departmentsService.getAllDepartments(),
        sitesService.getAllSites(),
        siteSpecificationsService.getAllSiteSpecifications()
      ])

      setDepartments(departmentsData)
      setSites(sitesData)
      setSiteSpecifications(specificationsData)

      // Organiser les spécifications par département
      organizeSpecificationsByDepartment(departmentsData, sitesData, specificationsData)

    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err)
      setError('Erreur lors du chargement des données. Vérifiez votre connexion et réessayez.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const organizeSpecificationsByDepartment = (
    depts: Department[], 
    sitesData: Site[], 
    specsData: SiteSpecification[]
  ) => {
    const organized: { [key: string]: any[] } = {}

    depts.forEach(dept => {
      // Trouver les sites du département
      const departmentSites = sitesData.filter(site => site.departmentId === dept.id)
      
      // Pour chaque site du département, créer des enregistrements de données basés sur les spécifications
      const departmentData: any[] = []

      departmentSites.forEach(site => {
        specsData.forEach(spec => {
          if (spec.siteType === site.type) {
            // Créer un enregistrement pour chaque spécification applicable
            departmentData.push({
              siteId: site.id,
              siteName: site.name,
              siteType: site.type,
              specification: spec,
              specificationId: spec.id
            })
          }
        })
      })

      organized[dept.id] = departmentData
    })

    setFilteredSpecifications(organized)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  const handleRefresh = () => {
    fetchData(true)
  }

  const handleViewSpecification = (specification: SiteSpecification) => {
    setSelectedSpecification(specification)
    
    // Simuler des données pour cette spécification (en production, ces données viendraient de la base de données)
    const mockData = generateMockDataForSpecification(specification)
    setCurrentData(mockData)
    setOpenDialog(true)
  }

  const generateMockDataForSpecification = (specification: SiteSpecification): any[] => {
    // Générer des données d'exemple basées sur les colonnes de la spécification
    const mockData: any[] = []
    
    for (let i = 1; i <= 5; i++) {
      const dataRow: any = {
        id: `mock-${i}`,
        site_id: `site-${i}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Ajouter des valeurs pour chaque colonne définie dans la spécification
      specification.columns.forEach(column => {
        switch (column.type) {
          case 'varchar':
            dataRow[column.name] = `Valeur ${i} pour ${column.name}`
            break
          case 'int':
            dataRow[column.name] = Math.floor(Math.random() * 100) + i
            break
          case 'float':
          case 'decimal':
            dataRow[column.name] = (Math.random() * 100 + i).toFixed(2)
            break
          case 'boolean':
            dataRow[column.name] = Math.random() > 0.5
            break
          case 'date':
            dataRow[column.name] = new Date().toISOString().split('T')[0]
            break
          case 'datetime':
            dataRow[column.name] = new Date().toISOString()
            break
          default:
            dataRow[column.name] = `Données ${i}`
        }
      })

      mockData.push(dataRow)
    }

    return mockData
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedSpecification(null)
    setCurrentData([])
  }

  const getTotalSpecifications = () => {
    return Object.values(filteredSpecifications).reduce((total, specs) => total + specs.length, 0)
  }

  // Composant de chargement pour les onglets
  const TabsLoadingSkeleton = () => (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
        <Skeleton variant="rectangular" height={48} />
      </Box>
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} />
      </Box>
    </Box>
  )

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Spécifications des Sites par Département
        </Typography>
        <Card>
          <TabsLoadingSkeleton />
        </Card>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Spécifications des Sites par Département
        </Typography>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => fetchData()}>
              Réessayer
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4">
            Spécifications des Sites par Département
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {departments.length} départements • {getTotalSpecifications()} spécifications totales
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Actualiser les données">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {departments.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <InfoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun département trouvé
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Veuillez d'abord créer des départements pour voir leurs spécifications.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange} 
              aria-label="onglets des départements"
              variant="scrollable"
              scrollButtons="auto"
            >
              {departments.map((department, index) => (
                <Tab 
                  key={department.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{department.name}</span>
                      <Chip 
                        label={filteredSpecifications[department.id]?.length || 0}
                        size="small"
                        color={filteredSpecifications[department.id]?.length > 0 ? "primary" : "default"}
                      />
                    </Box>
                  }
                  {...a11yProps(index)} 
                />
              ))}
            </Tabs>
          </Box>

          {departments.map((department, index) => (
            <TabPanel key={department.id} value={currentTab} index={index}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" color="primary">
                  Département: {department.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {department.description || 'Aucune description disponible'}
                </Typography>
              </Box>

              {filteredSpecifications[department.id]?.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Site</TableCell>
                        <TableCell>Type de Site</TableCell>
                        <TableCell>Spécification</TableCell>
                        <TableCell>Nombre de Colonnes</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSpecifications[department.id].map((item, idx) => (
                        <TableRow key={`${item.siteId}-${item.specificationId}-${idx}`} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {item.siteName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={item.siteType} 
                              color="primary" 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              Spéc. {item.siteType}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${item.specification.columns.length} colonnes`}
                              color="secondary" 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Voir les données de spécification">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewSpecification(item.specification)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Aucune spécification de site pour ce département
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Les spécifications apparaîtront ici une fois que :
                  </Typography>
                  <Box component="ul" sx={{ textAlign: 'left', display: 'inline-block', color: 'text.secondary' }}>
                    <li>Des sites seront assignés à ce département</li>
                    <li>Des spécifications de sites seront créées pour les types de sites correspondants</li>
                  </Box>
                </Box>
              )}
            </TabPanel>
          ))}
        </Card>
      )}

      {/* Dialog pour afficher les données de spécification */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" />
          Données de Spécification: {selectedSpecification?.siteType}
        </DialogTitle>
        <DialogContent>
          {selectedSpecification && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Les données affichées ci-dessous sont des exemples générés automatiquement. 
                  En production, ces données proviendront des tables créées dynamiquement dans la base de données.
                </Typography>
              </Alert>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Structure de la spécification:
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom de la colonne</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Nullable</TableCell>
                      <TableCell>Valeur par défaut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSpecification.columns.map((column, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {column.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={column.type} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={column.nullable ? 'Oui' : 'Non'} 
                            color={column.nullable ? 'default' : 'error'}
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {column.defaultValue || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Données d'exemple:
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Site ID</TableCell>
                      {selectedSpecification.columns.map((column, index) => (
                        <TableCell key={index}>{column.name}</TableCell>
                      ))}
                      <TableCell>Créé le</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentData.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {row.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {row.site_id}
                          </Typography>
                        </TableCell>
                        {selectedSpecification.columns.map((column, colIndex) => (
                          <TableCell key={colIndex}>
                            {typeof row[column.name] === 'boolean' 
                              ? (
                                <Chip 
                                  label={row[column.name] ? 'Oui' : 'Non'} 
                                  color={row[column.name] ? 'success' : 'default'}
                                  size="small"
                                />
                              )
                              : (
                                <Typography variant="body2">
                                  {row[column.name]}
                                </Typography>
                              )
                            }
                          </TableCell>
                        ))}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(row.created_at).toLocaleDateString('fr-FR')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DepartmentsSpecificationsPage 
