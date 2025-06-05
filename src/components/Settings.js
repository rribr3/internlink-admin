// src/components/Settings.js
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

const Settings = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 800,
          background: 'linear-gradient(135deg, #FF9F45 0%, #FFB74D 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}
      >
        Settings & Roles
      </Typography>
      <Typography variant="h6" sx={{ color: 'rgba(0, 0, 0, 0.6)', mb: 4 }}>
        System configuration and user permissions
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SettingsIcon sx={{ fontSize: 48, color: '#FF9F45', mb: 2 }} />
              <Typography variant="h6">System Settings</Typography>
              <Typography variant="body2" color="text.secondary">
                Coming Soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AdminIcon sx={{ fontSize: 48, color: '#FF9F45', mb: 2 }} />
              <Typography variant="h6">User Roles</Typography>
              <Typography variant="body2" color="text.secondary">
                Coming Soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SecurityIcon sx={{ fontSize: 48, color: '#FF9F45', mb: 2 }} />
              <Typography variant="h6">Security</Typography>
              <Typography variant="body2" color="text.secondary">
                Coming Soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings;