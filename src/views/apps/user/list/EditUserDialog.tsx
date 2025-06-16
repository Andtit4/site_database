import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, FormControlLabel, Checkbox, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Permission } from '@/services/permissionsService';
import { User } from '@/services/authService';

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (permissions: Permission[]) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ open, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    permissions: [] as Permission[],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        permissions: user.permissions || [],
      });
    }
  }, [user]);

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permission],
      });
    } else {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter((p) => p !== permission),
      });
    }
  };

  const handleSave = () => {
    onSave(formData.permissions);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Modifier les Permissions</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Permissions des Sites</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.permissions.includes(Permission.VIEW_ALL_SITES)}
                    onChange={(e) => handlePermissionChange(Permission.VIEW_ALL_SITES, e.target.checked)}
                  />
                }
                label="Voir tous les sites"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.permissions.includes(Permission.VIEW_DEPARTMENT_SITES)}
                    onChange={(e) => handlePermissionChange(Permission.VIEW_DEPARTMENT_SITES, e.target.checked)}
                  />
                }
                label="Voir les sites du département"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.permissions.includes(Permission.CREATE_SITE)}
                    onChange={(e) => handlePermissionChange(Permission.CREATE_SITE, e.target.checked)}
                  />
                }
                label="Créer des sites"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.permissions.includes(Permission.EDIT_SITE)}
                    onChange={(e) => handlePermissionChange(Permission.EDIT_SITE, e.target.checked)}
                  />
                }
                label="Modifier des sites"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.permissions.includes(Permission.DELETE_SITE)}
                    onChange={(e) => handlePermissionChange(Permission.DELETE_SITE, e.target.checked)}
                  />
                }
                label="Supprimer des sites"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.permissions.includes(Permission.VIEW_SITE_SPECIFICATIONS)}
                    onChange={(e) => handlePermissionChange(Permission.VIEW_SITE_SPECIFICATIONS, e.target.checked)}
                  />
                }
                label="Voir les spécifications des sites"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.permissions.includes(Permission.EDIT_SITE_SPECIFICATIONS)}
                    onChange={(e) => handlePermissionChange(Permission.EDIT_SITE_SPECIFICATIONS, e.target.checked)}
                  />
                }
                label="Modifier les spécifications des sites"
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog; 
