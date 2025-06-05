// src/components/Feedback.js
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
  Feedback as FeedbackIcon,
  Comment as CommentIcon,
  Star as StarIcon
} from '@mui/icons-material';

const Feedback = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 800,
          background: 'linear-gradient(135deg, #A16EFF 0%, #B39DDB 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}
      >
        Feedback & Complaints
      </Typography>
      <Typography variant="h6" sx={{ color: 'rgba(0, 0, 0, 0.6)', mb: 4 }}>
        User feedback and support tickets
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <FeedbackIcon sx={{ fontSize: 48, color: '#A16EFF', mb: 2 }} />
              <Typography variant="h6">User Feedback</Typography>
              <Typography variant="body2" color="text.secondary">
                Coming Soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CommentIcon sx={{ fontSize: 48, color: '#A16EFF', mb: 2 }} />
              <Typography variant="h6">Support Tickets</Typography>
              <Typography variant="body2" color="text.secondary">
                Coming Soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <StarIcon sx={{ fontSize: 48, color: '#A16EFF', mb: 2 }} />
              <Typography variant="h6">Ratings & Reviews</Typography>
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

export default Feedback;