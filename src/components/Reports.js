// src/components/Reports.js
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
  TrendingUp as TrendingIcon,
  PieChart as ChartIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';

const Reports = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 800,
          background: 'linear-gradient(135deg, #FFD460 0%, #FFEB9C 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}
      >
        Reports & Analytics
      </Typography>
      <Typography variant="h6" sx={{ color: 'rgba(0, 0, 0, 0.6)', mb: 4 }}>
        Data insights and performance metrics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingIcon sx={{ fontSize: 48, color: '#FFD460', mb: 2 }} />
              <Typography variant="h6">Performance Trends</Typography>
              <Typography variant="body2" color="text.secondary">
                Coming Soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ChartIcon sx={{ fontSize: 48, color: '#FFD460', mb: 2 }} />
              <Typography variant="h6">Usage Analytics</Typography>
              <Typography variant="body2" color="text.secondary">
                Coming Soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ReportIcon sx={{ fontSize: 48, color: '#FFD460', mb: 2 }} />
              <Typography variant="h6">Custom Reports</Typography>
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

export default Reports;