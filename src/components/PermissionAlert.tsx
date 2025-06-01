import React from 'react';
import { Alert, Typography, Box } from '@mui/material';

interface PermissionAlertProps {
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  additionalInfo?: string;
  sx?: object;
}

const PermissionAlert: React.FC<PermissionAlertProps> = ({
  type,
  title,
  message,
  additionalInfo,
  sx = {}
}) => {
  return (
    <Alert severity={type} sx={{ mb: 2, ...sx }}>
      <Box>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Typography variant="body2">
          {message}
          {additionalInfo && (
            <>{additionalInfo}</>
          )}
        </Typography>
      </Box>
    </Alert>
  );
};

export default PermissionAlert; 
