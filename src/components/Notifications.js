// src/components/Notifications.js
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
  Notifications as NotificationIcon,
  Campaign as CampaignIcon,
  Message as MessageIcon
} from '@mui/icons-material';

const Notifications = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 800,
          background: 'linear-gradient(135deg, #2ACFCF 0%, #4DD0E1 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}
      >
        Notification Center
      </Typography>
      <Typography variant="h6" sx={{ color: 'rgba(0, 0, 0, 0.6)', mb: 4 }}>
        System alerts and communications
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <NotificationIcon sx={{ fontSize: 48, color: '#2ACFCF', mb: 2 }} />
              <Typography variant="h6">System Alerts</Typography>
              <Typography variant="body2" color="text.secondary">
                Coming Soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CampaignIcon sx={{ fontSize: 48, color: '#2ACFCF', mb: 2 }} />
              <Typography variant="h6">Announcements</Typography>
              <Typography variant="body2" color="text.secondary">
                Coming Soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <MessageIcon sx={{ fontSize: 48, color: '#2ACFCF', mb: 2 }} />
              <Typography variant="h6">Messages</Typography>
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

export default Notifications;