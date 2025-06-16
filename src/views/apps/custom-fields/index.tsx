'use client'

import React from 'react';

import { Container, Typography, Box } from '@mui/material';

import SiteCustomFieldsManager from '@/components/SiteCustomFieldsManager';

const CustomFieldsPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Configuration des Champs Personnalisés
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          Configurez les champs personnalisés qui seront disponibles lors de la création et modification des sites.
          Ces champs apparaîtront automatiquement dans les formulaires de sites.
        </Typography>
        
        <SiteCustomFieldsManager />
      </Box>
    </Container>
  );
};

export default CustomFieldsPage; 
