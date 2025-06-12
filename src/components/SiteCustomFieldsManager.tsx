'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  Tooltip,
  Grid,
  FormHelperText,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Restore as RestoreIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  DataUsage as DataUsageIcon
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import {
  siteCustomFieldsService,
  SiteCustomField,
  CreateCustomFieldDto,
  UpdateCustomFieldDto,
  CustomFieldType,
  Department,
  getFieldTypeLabel,
  getFieldTypeOptions
} from '../services/siteCustomFieldsService';

interface CustomFieldFormData {
  fieldName: string;
  fieldLabel: string;
  fieldType: CustomFieldType;
  required: boolean;
  defaultValue: string;
  options: string[];
  validation: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  description: string;
  allowedDepartmentIds: string[];
}

interface FieldBackup {
  id: string;
  timestamp: Date;
  action: 'DELETE' | 'MODIFY';
  fieldData: SiteCustomField;
  affectedSitesCount?: number;
  reason?: string;
}

interface DeleteConfirmData {
  field: SiteCustomField;
  affectedSitesCount: number;
  dataLossWarnings: string[];
}

const SiteCustomFieldsManager: React.FC = () => {
  const { user } = useAuth();
  const [fields, setFields] = useState<SiteCustomField[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<SiteCustomField | null>(null);
  const [formData, setFormData] = useState<CustomFieldFormData>({
    fieldName: '',
    fieldLabel: '',
    fieldType: CustomFieldType.STRING,
    required: false,
    defaultValue: '',
    options: [],
    validation: {},
    description: '',
    allowedDepartmentIds: []
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Nouveaux états pour la sécurité et la restauration
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmData, setDeleteConfirmData] = useState<DeleteConfirmData | null>(null);
  const [modifyConfirmOpen, setModifyConfirmOpen] = useState(false);
  const [modifyWarnings, setModifyWarnings] = useState<string[]>([]);
  const [backups, setBackups] = useState<FieldBackup[]>([]);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<FieldBackup | null>(null);

  useEffect(() => {
    loadFields();
    loadDepartments();
    if (user?.isAdmin) {
      loadBackups();
    }
  }, [user]);

  const loadFields = async () => {
    try {
      setLoading(true);
      
      // Pour les administrateurs, charger tous les champs
      // Pour les autres utilisateurs, charger seulement les champs de leur département
      let data;
      if (user?.isAdmin) {
        data = await siteCustomFieldsService.getAll();
      } else {
        // Récupérer les champs actifs filtrés par département
        const departmentId = user?.departmentId?.toString();
        data = await siteCustomFieldsService.getActive(departmentId, user?.isAdmin);
      }
      
      setFields(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des champs');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await siteCustomFieldsService.getDepartments();
      setDepartments(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des départements:', err);
    }
  };

  const loadBackups = async () => {
    try {
      const backupData = await siteCustomFieldsService.getBackups();
      setBackups(backupData);
    } catch (err: any) {
      console.error('Erreur lors du chargement des sauvegardes:', err);
    }
  };

  const analyzeFieldDeletion = async (field: SiteCustomField): Promise<DeleteConfirmData> => {
    try {
      const analysisResult = await siteCustomFieldsService.analyzeFieldDeletion(field.id);
      return {
        field,
        affectedSitesCount: analysisResult.affectedSitesCount,
        dataLossWarnings: analysisResult.warnings
      };
    } catch (err: any) {
      return {
        field,
        affectedSitesCount: 0,
        dataLossWarnings: ['Impossible d\'analyser l\'impact de la suppression']
      };
    }
  };

  const analyzeFieldModification = async (field: SiteCustomField, newData: UpdateCustomFieldDto): Promise<string[]> => {
    try {
      const analysisResult = await siteCustomFieldsService.analyzeFieldModification(field.id, newData);
      return analysisResult.warnings;
    } catch (err: any) {
      return ['Impossible d\'analyser l\'impact de la modification'];
    }
  };

  const createBackup = async (field: SiteCustomField, action: 'DELETE' | 'MODIFY', reason?: string): Promise<void> => {
    if (!user?.isAdmin) return;
    
    try {
      const analysisResult = await siteCustomFieldsService.analyzeFieldDeletion(field.id);
      const backup: Omit<FieldBackup, 'id'> = {
        timestamp: new Date(),
        action,
        fieldData: field,
        affectedSitesCount: analysisResult.affectedSitesCount,
        reason
      };
      
      await siteCustomFieldsService.createBackup(backup);
      await loadBackups();
    } catch (err: any) {
      console.error('Erreur lors de la création de la sauvegarde:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      fieldName: '',
      fieldLabel: '',
      fieldType: CustomFieldType.STRING,
      required: false,
      defaultValue: '',
      options: [],
      validation: {},
      description: '',
      allowedDepartmentIds: []
    });
    setFormErrors({});
    setEditingField(null);
  };

  const openDialog = (field?: SiteCustomField) => {
    if (field) {
      setEditingField(field);
      setFormData({
        fieldName: field.fieldName,
        fieldLabel: field.fieldLabel,
        fieldType: field.fieldType,
        required: field.required,
        defaultValue: field.defaultValue || '',
        options: field.options || [],
        validation: field.validation || {},
        description: field.description || '',
        allowedDepartmentIds: field.allowedDepartments?.map(d => d.id) || []
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fieldName.trim()) {
      errors.fieldName = 'Le nom technique est requis';
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.fieldName)) {
      errors.fieldName = 'Le nom technique doit commencer par une lettre et ne contenir que des lettres, chiffres et underscores';
    }

    if (!formData.fieldLabel.trim()) {
      errors.fieldLabel = 'Le libellé est requis';
    }

    if (formData.fieldType === CustomFieldType.SELECT && formData.options.length === 0) {
      errors.options = 'Les champs de type liste doivent avoir au moins une option';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const submitData: CreateCustomFieldDto | UpdateCustomFieldDto = {
        fieldLabel: formData.fieldLabel,
        fieldType: formData.fieldType,
        required: formData.required,
        defaultValue: formData.defaultValue || undefined,
        options: formData.fieldType === CustomFieldType.SELECT ? formData.options : undefined,
        validation: Object.keys(formData.validation).length > 0 ? formData.validation : undefined,
        description: formData.description || undefined,
        allowedDepartmentIds: formData.allowedDepartmentIds.length > 0 ? formData.allowedDepartmentIds : undefined
      };

      if (editingField) {
        // Vérifier l'impact des modifications
        const warnings = await analyzeFieldModification(editingField, submitData);
        if (warnings.length > 0) {
          setModifyWarnings(warnings);
          setModifyConfirmOpen(true);
          return;
        }
        
        // Créer une sauvegarde avant modification
        await createBackup(editingField, 'MODIFY', 'Modification du champ');
        
        await siteCustomFieldsService.update(editingField.id, submitData);
      } else {
        await siteCustomFieldsService.create({
          ...submitData,
          fieldName: formData.fieldName
        });
      }

      await loadFields();
      closeDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleModifyConfirm = async () => {
    if (!editingField) return;

    try {
      const submitData: UpdateCustomFieldDto = {
        fieldLabel: formData.fieldLabel,
        fieldType: formData.fieldType,
        required: formData.required,
        defaultValue: formData.defaultValue || undefined,
        options: formData.fieldType === CustomFieldType.SELECT ? formData.options : undefined,
        validation: Object.keys(formData.validation).length > 0 ? formData.validation : undefined,
        description: formData.description || undefined,
        allowedDepartmentIds: formData.allowedDepartmentIds.length > 0 ? formData.allowedDepartmentIds : undefined
      };

      // Créer une sauvegarde avant modification
      await createBackup(editingField, 'MODIFY', 'Modification confirmée malgré les avertissements');
      
      await siteCustomFieldsService.update(editingField.id, submitData);
      await loadFields();
      setModifyConfirmOpen(false);
      setModifyWarnings([]);
      closeDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleDeleteRequest = async (field: SiteCustomField) => {
    try {
      const analysisData = await analyzeFieldDeletion(field);
      setDeleteConfirmData(analysisData);
      setDeleteConfirmOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'analyse du champ');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmData) return;

    try {
      // Créer une sauvegarde avant suppression
      await createBackup(deleteConfirmData.field, 'DELETE', 'Suppression confirmée');
      
      await siteCustomFieldsService.delete(deleteConfirmData.field.id);
      await loadFields();
      setDeleteConfirmOpen(false);
      setDeleteConfirmData(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleRestore = async (backup: FieldBackup) => {
    if (!user?.isAdmin) return;

    try {
      await siteCustomFieldsService.restoreFromBackup(backup.id);
      await loadFields();
      await loadBackups();
      setRestoreDialogOpen(false);
      setSelectedBackup(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la restauration');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await siteCustomFieldsService.toggleActive(id);
      await loadFields();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la modification du statut');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    const newFields = Array.from(fields);
    const temp = newFields[index];
    newFields[index] = newFields[index - 1];
    newFields[index - 1] = temp;
    
    setFields(newFields);

    try {
      const fieldIds = newFields.map(field => field.id);
      await siteCustomFieldsService.updateSortOrder(fieldIds);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la réorganisation');
      await loadFields();
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === fields.length - 1) return;
    
    const newFields = Array.from(fields);
    const temp = newFields[index];
    newFields[index] = newFields[index + 1];
    newFields[index + 1] = temp;
    
    setFields(newFields);

    try {
      const fieldIds = newFields.map(field => field.id);
      await siteCustomFieldsService.updateSortOrder(fieldIds);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la réorganisation');
      await loadFields();
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  if (loading) return <Typography>Chargement...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Champs Personnalisés
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {user?.isAdmin && backups.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => setRestoreDialogOpen(true)}
            >
              Restaurer ({backups.length})
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openDialog()}
          >
            Ajouter un champ
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Indicateur de filtrage pour les utilisateurs non-admin */}
      {!user?.isAdmin && user?.departmentId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            📋 Vous voyez uniquement les champs personnalisés disponibles pour votre département.
            Les administrateurs peuvent gérer tous les champs du système.
          </Typography>
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Champs personnalisés configurés ({fields.length})
          </Typography>
          
          {fields.length === 0 ? (
            <Typography color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>
              Aucun champ personnalisé configuré. Cliquez sur "Ajouter un champ" pour commencer.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="100px">Ordre</TableCell>
                    <TableCell>Nom technique</TableCell>
                    <TableCell>Libellé</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Requis</TableCell>
                    <TableCell>Départements</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow
                      key={field.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Monter">
                            {index === 0 ? (
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleMoveUp(index)}
                                  disabled={index === 0}
                                >
                                  <i className="tabler-chevron-up" />
                                </IconButton>
                              </span>
                            ) : (
                              <IconButton
                                size="small"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                              >
                                <i className="tabler-chevron-up" />
                              </IconButton>
                            )}
                          </Tooltip>
                          <Tooltip title="Descendre">
                            {index === fields.length - 1 ? (
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleMoveDown(index)}
                                  disabled={index === fields.length - 1}
                                >
                                  <i className="tabler-chevron-down" />
                                </IconButton>
                              </span>
                            ) : (
                              <IconButton
                                size="small"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === fields.length - 1}
                              >
                                <i className="tabler-chevron-down" />
                              </IconButton>
                            )}
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {field.fieldName}
                        </Typography>
                      </TableCell>
                      <TableCell>{field.fieldLabel}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getFieldTypeLabel(field.fieldType)} 
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {field.required ? (
                          <Chip label="Requis" color="error" size="small" />
                        ) : (
                          <Chip label="Optionnel" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {field.allowedDepartments && field.allowedDepartments.length > 0 ? (
                            field.allowedDepartments.map((dept) => (
                              <Chip 
                                key={dept.id}
                                label={dept.name} 
                                size="small"
                                variant="outlined"
                                color="primary"
                                title={`${dept.type} - ${dept.responsibleName}`}
                              />
                            ))
                          ) : (
                            <Chip 
                              label="Tous départements" 
                              size="small"
                              variant="outlined"
                              color="default"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={field.active ? 'Actif' : 'Inactif'}
                          color={field.active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            onClick={() => openDialog(field)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={field.active ? 'Désactiver' : 'Activer'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleActive(field.id)}
                          >
                            {field.active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteRequest(field)}
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
          )}
        </CardContent>
      </Card>

      {/* Dialog pour créer/modifier un champ */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingField ? 'Modifier le champ personnalisé' : 'Ajouter un champ personnalisé'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nom technique"
                value={formData.fieldName}
                onChange={(e) => setFormData(prev => ({ ...prev, fieldName: e.target.value }))}
                fullWidth
                error={!!formErrors.fieldName}
                helperText={formErrors.fieldName || "Ex: surface_totale, hauteur_tour"}
                disabled={!!editingField}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Libellé d'affichage"
                value={formData.fieldLabel}
                onChange={(e) => setFormData(prev => ({ ...prev, fieldLabel: e.target.value }))}
                fullWidth
                error={!!formErrors.fieldLabel}
                helperText={formErrors.fieldLabel || "Ex: Surface totale, Hauteur de la tour"}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type de champ</InputLabel>
                <Select
                  value={formData.fieldType}
                  label="Type de champ"
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    fieldType: e.target.value as CustomFieldType,
                    options: e.target.value === CustomFieldType.SELECT ? prev.options : []
                  }))}
                >
                  {getFieldTypeOptions().map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.required}
                    onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                  />
                }
                label="Champ requis"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Valeur par défaut"
                value={formData.defaultValue}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                fullWidth
                multiline={formData.fieldType === CustomFieldType.TEXTAREA}
                rows={formData.fieldType === CustomFieldType.TEXTAREA ? 3 : 1}
              />
            </Grid>
            
            {/* Options pour les champs SELECT */}
            {formData.fieldType === CustomFieldType.SELECT && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Options de la liste déroulante
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {formData.options.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        label={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        fullWidth
                        size="small"
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeOption(index)}
                        disabled={formData.options.length <= 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={addOption}
                    startIcon={<AddIcon />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Ajouter une option
                  </Button>
                </Box>
                {formErrors.options && (
                  <FormHelperText error>{formErrors.options}</FormHelperText>
                )}
              </Grid>
            )}

            {/* Validation pour les champs NUMBER */}
            {formData.fieldType === CustomFieldType.NUMBER && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Validation numérique
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Valeur minimale"
                      type="number"
                      value={formData.validation.min || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        validation: {
                          ...prev.validation,
                          min: e.target.value ? Number(e.target.value) : undefined
                        }
                      }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Valeur maximale"
                      type="number"
                      value={formData.validation.max || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        validation: {
                          ...prev.validation,
                          max: e.target.value ? Number(e.target.value) : undefined
                        }
                      }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* Validation pour les champs STRING/TEXTAREA */}
            {(formData.fieldType === CustomFieldType.STRING || formData.fieldType === CustomFieldType.TEXTAREA) && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Validation de texte
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Longueur minimale"
                      type="number"
                      value={formData.validation.minLength || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        validation: {
                          ...prev.validation,
                          minLength: e.target.value ? Number(e.target.value) : undefined
                        }
                      }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Longueur maximale"
                      type="number"
                      value={formData.validation.maxLength || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        validation: {
                          ...prev.validation,
                          maxLength: e.target.value ? Number(e.target.value) : undefined
                        }
                      }))}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Expression régulière (optionnelle)"
                      value={formData.validation.pattern || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        validation: {
                          ...prev.validation,
                          pattern: e.target.value || undefined
                        }
                      }))}
                      fullWidth
                      size="small"
                      helperText="Ex: ^[A-Z]{2}[0-9]{3}$ pour un format spécifique"
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="Description / Aide"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
                helperText="Texte d'aide qui sera affiché sous le champ"
              />
            </Grid>

            {/* Sélection des départements autorisés */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Départements autorisés à remplir ce champ
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Départements</InputLabel>
                <Select
                  multiple
                  value={formData.allowedDepartmentIds}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    allowedDepartmentIds: e.target.value as string[] 
                  }))}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((id) => {
                        const dept = departments.find(d => d.id === id);
                        return (
                          <Chip 
                            key={id} 
                            label={dept?.name || id} 
                            size="small" 
                            color="primary"
                          />
                        );
                      })}
                    </Box>
                  )}
                  label="Départements"
                >
                  {departments.map((department) => (
                    <MenuItem key={department.id} value={department.id}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {department.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {department.type} - {department.responsibleName}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Si aucun département n'est sélectionné, tous les départements auront accès au champ.
                  Les administrateurs ont toujours accès à tous les champs.
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} startIcon={<CancelIcon />}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} variant="contained" startIcon={<SaveIcon />}>
            {editingField ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression avec analyse d'impact */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <WarningIcon />
          Confirmer la suppression du champ
        </DialogTitle>
        <DialogContent>
          {deleteConfirmData && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  ⚠️ Action irréversible - Perte de données
                </Typography>
                <Typography>
                  Vous êtes sur le point de supprimer le champ "{deleteConfirmData.field.fieldLabel}" 
                  ({deleteConfirmData.field.fieldName}).
                </Typography>
              </Alert>

              <Card sx={{ mb: 3, border: '1px solid', borderColor: 'warning.main' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DataUsageIcon />
                    Impact sur les données
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>{deleteConfirmData.affectedSitesCount} site(s)</strong> contiennent des données pour ce champ.
                  </Typography>
                  {deleteConfirmData.dataLossWarnings.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Données qui seront perdues :
                      </Typography>
                      <List dense>
                        {deleteConfirmData.dataLossWarnings.map((warning, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <WarningIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={warning} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {user?.isAdmin && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    💾 En tant qu'administrateur, une sauvegarde sera automatiquement créée avant la suppression.
                    Vous pourrez restaurer le champ et ses données depuis l'historique.
                  </Typography>
                </Alert>
              )}

              <Typography variant="body2" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                Cette action supprimera définitivement le champ et toutes ses valeurs dans tous les sites.
                {!user?.isAdmin && ' Cette action ne peut pas être annulée.'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Confirmer la suppression
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de modification avec avertissements */}
      <Dialog open={modifyConfirmOpen} onClose={() => setModifyConfirmOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
          <WarningIcon />
          Modification avec impact sur les données
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                ⚠️ Cette modification peut affecter les données existantes
              </Typography>
              <Typography>
                Les modifications que vous apportez peuvent avoir un impact sur les données déjà saisies.
              </Typography>
            </Alert>

            <Card sx={{ mb: 3, border: '1px solid', borderColor: 'warning.main' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Avertissements :
                </Typography>
                <List dense>
                  {modifyWarnings.map((warning, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <WarningIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={warning} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {user?.isAdmin && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  💾 Une sauvegarde sera automatiquement créée avant la modification.
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModifyConfirmOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleModifyConfirm} 
            color="warning" 
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Confirmer la modification
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de restauration (administrateurs uniquement) */}
      {user?.isAdmin && (
        <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon />
            Historique et restauration des champs
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Voici l'historique des champs supprimés ou modifiés. Vous pouvez restaurer un champ 
                pour récupérer sa configuration et ses données associées.
              </Typography>

              {backups.length === 0 ? (
                <Alert severity="info">
                  Aucune sauvegarde disponible pour le moment.
                </Alert>
              ) : (
                <Box>
                  {backups.map((backup) => (
                    <Accordion key={backup.id} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Chip 
                            label={backup.action} 
                            color={backup.action === 'DELETE' ? 'error' : 'warning'}
                            size="small"
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {backup.fieldData.fieldLabel}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ ml: 'auto' }}>
                            {new Date(backup.timestamp).toLocaleString('fr-FR')}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Informations du champ :
                            </Typography>
                            <Typography variant="body2">
                              <strong>Nom technique :</strong> {backup.fieldData.fieldName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Type :</strong> {getFieldTypeLabel(backup.fieldData.fieldType)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Requis :</strong> {backup.fieldData.required ? 'Oui' : 'Non'}
                            </Typography>
                            {backup.fieldData.description && (
                              <Typography variant="body2">
                                <strong>Description :</strong> {backup.fieldData.description}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Détails de la sauvegarde :
                            </Typography>
                            <Typography variant="body2">
                              <strong>Sites affectés :</strong> {backup.affectedSitesCount || 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Date :</strong> {new Date(backup.timestamp).toLocaleString('fr-FR')}
                            </Typography>
                            {backup.reason && (
                              <Typography variant="body2">
                                <strong>Raison :</strong> {backup.reason}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                              <Button
                                variant="contained"
                                startIcon={<RestoreIcon />}
                                onClick={() => {
                                  setSelectedBackup(backup);
                                  handleRestore(backup);
                                }}
                                size="small"
                              >
                                Restaurer ce champ
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRestoreDialogOpen(false)}>
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default SiteCustomFieldsManager; 
