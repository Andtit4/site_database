'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Alert,
  FormHelperText
} from '@mui/material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { fr } from 'date-fns/locale';
import {
  siteCustomFieldsService,
  SiteCustomField,
  CustomFieldType,
  convertFieldValue,
  formatFieldValue
} from '../services/siteCustomFieldsService';
import { useCustomFields } from '../hooks/useCustomFields';

interface DynamicFieldsFormProps {
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  readOnly?: boolean;
  showTitle?: boolean;
}

const DynamicFieldsForm: React.FC<DynamicFieldsFormProps> = ({
  values,
  onChange,
  readOnly = false,
  showTitle = true
}) => {
  // Utiliser le hook personnalisé pour récupérer les champs filtrés par département
  const { fields, loading, error, isAdmin, userDepartmentId } = useCustomFields();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldName: string, value: any, fieldType: CustomFieldType) => {
    const convertedValue = convertFieldValue(value, fieldType);
    const newValues = { ...values, [fieldName]: convertedValue };
    onChange(newValues);

    // Validation en temps réel
    validateField(fieldName, convertedValue);
  };

  const validateField = async (fieldName: string, value: any) => {
    try {
      const testValues = { ...values, [fieldName]: value };
      const validation = await siteCustomFieldsService.validateValues(testValues);
      
      const newErrors = { ...fieldErrors };
      delete newErrors[fieldName];
      
      if (!validation.isValid) {
        const fieldError = validation.errors.find(err => err.includes(fieldName));
        if (fieldError) {
          newErrors[fieldName] = fieldError;
        }
      }
      
      setFieldErrors(newErrors);
    } catch (err) {
      console.error('Erreur de validation:', err);
    }
  };

  const renderField = (field: SiteCustomField) => {
    const fieldValue = values[field.fieldName];
    const hasError = !!fieldErrors[field.fieldName];

    switch (field.fieldType) {
      case CustomFieldType.STRING:
        return (
          <TextField
            key={field.id}
            label={field.fieldLabel}
            value={fieldValue || ''}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value, field.fieldType)}
            fullWidth
            required={field.required}
            helperText={fieldErrors[field.fieldName] || field.description}
            error={hasError}
            disabled={readOnly}
          />
        );

      case CustomFieldType.TEXTAREA:
        return (
          <TextField
            key={field.id}
            label={field.fieldLabel}
            value={fieldValue || ''}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value, field.fieldType)}
            fullWidth
            multiline
            rows={3}
            required={field.required}
            helperText={fieldErrors[field.fieldName] || field.description}
            error={hasError}
            disabled={readOnly}
          />
        );

      case CustomFieldType.NUMBER:
        return (
          <TextField
            key={field.id}
            label={field.fieldLabel}
            type="number"
            value={fieldValue || ''}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value, field.fieldType)}
            fullWidth
            required={field.required}
            helperText={fieldErrors[field.fieldName] || field.description}
            error={hasError}
            disabled={readOnly}
            inputProps={{
              min: field.validation?.min,
              max: field.validation?.max
            }}
          />
        );

      case CustomFieldType.BOOLEAN:
        return (
          <FormControlLabel
            key={field.id}
            control={
              <Switch
                checked={Boolean(fieldValue)}
                onChange={(e) => handleFieldChange(field.fieldName, e.target.checked, field.fieldType)}
                disabled={readOnly}
              />
            }
            label={field.fieldLabel + (field.required ? ' *' : '')}
          />
        );

      case CustomFieldType.SELECT:
        return (
          <FormControl key={field.id} fullWidth error={hasError}>
            <InputLabel required={field.required}>{field.fieldLabel}</InputLabel>
            <Select
              value={fieldValue || ''}
              label={field.fieldLabel}
              onChange={(e) => handleFieldChange(field.fieldName, e.target.value, field.fieldType)}
              disabled={readOnly}
            >
              <MenuItem value="">
                <em>-- Sélectionner --</em>
              </MenuItem>
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {(fieldErrors[field.fieldName] || field.description) && (
              <FormHelperText>
                {fieldErrors[field.fieldName] || field.description}
              </FormHelperText>
            )}
          </FormControl>
        );

      case CustomFieldType.DATE:
        return (
          <TextField
            key={field.id}
            label={field.fieldLabel}
            type="date"
            value={fieldValue ? (typeof fieldValue === 'string' ? fieldValue.split('T')[0] : new Date(fieldValue).toISOString().split('T')[0]) : ''}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value, field.fieldType)}
            fullWidth
            required={field.required}
            helperText={fieldErrors[field.fieldName] || field.description}
            error={hasError}
            disabled={readOnly}
            InputLabelProps={{ shrink: true }}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <Typography>Chargement des champs personnalisés...</Typography>;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (fields.length === 0) {
    return readOnly ? null : (
      <Alert severity="info" sx={{ mb: 2 }}>
        Aucun champ personnalisé configuré. 
        Consultez la section d'administration pour en ajouter.
      </Alert>
    );
  }

  return (
    <Box>
      {showTitle && (
        <Typography variant="h6" gutterBottom>
          Champs personnalisés ({fields.length})
        </Typography>
      )}
      
      {/* Indicateur de filtrage pour les utilisateurs non-admin */}
      {!isAdmin && userDepartmentId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            📋 Champs disponibles pour votre département. 
            {fields.length === 0 && ' Aucun champ spécifique à votre département.'}
          </Typography>
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {fields.map((field) => (
          <Grid item xs={12} sm={field.fieldType === CustomFieldType.TEXTAREA ? 12 : 6} key={field.id}>
            {renderField(field)}
          </Grid>
        ))}
      </Grid>

      {readOnly && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            💡 Mode lecture seule - Les champs personnalisés sont affichés en consultation
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DynamicFieldsForm; 
