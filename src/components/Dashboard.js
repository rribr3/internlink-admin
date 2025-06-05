// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Container,
  Paper,
  Fade,
  Grow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  People as PeopleIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  KeyboardArrowUp as ArrowUpIcon
} from '@mui/icons-material';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebase';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalCompanies: 0,
    totalProjects: 0,
    totalApplications: 0,
    approvedProjects: 0,
    completedProjects: 0,
    pendingApplications: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      console.log('Fetching data from Firebase Realtime Database...');
      
      // Fetch users data
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      const usersData = usersSnapshot.val() || {};
      
      console.log('Users data:', usersData);
      
      const usersArray = Object.values(usersData);
      const students = usersArray.filter(user => user.role === 'student');
      const companies = usersArray.filter(user => user.role === 'company');

      // Fetch projects data
      const projectsRef = ref(database, 'projects');
      const projectsSnapshot = await get(projectsRef);
      const projectsData = projectsSnapshot.val() || {};
      
      console.log('Projects data:', projectsData);
      
      const projectsArray = Object.values(projectsData);
      const approvedProjects = projectsArray.filter(project => project.status === 'approved');
      const completedProjects = projectsArray.filter(project => project.status === 'completed');

      // Fetch applications data
      const applicationsRef = ref(database, 'applications');
      const applicationsSnapshot = await get(applicationsRef);
      const applicationsData = applicationsSnapshot.val() || {};
      
      console.log('Applications data:', applicationsData);
      
      const applicationsArray = Object.values(applicationsData);
      const pendingApplications = applicationsArray.filter(app => app.status === 'Pending');

      setStats({
        totalUsers: usersArray.length,
        totalStudents: students.length,
        totalCompanies: companies.length,
        totalProjects: projectsArray.length,
        totalApplications: applicationsArray.length,
        approvedProjects: approvedProjects.length,
        completedProjects: completedProjects.length,
        pendingApplications: pendingApplications.length
      });

      setLoading(false);
      console.log('Data loaded successfully!');

    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(`Failed to load data: ${error.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, gradient, delay = 0, trend }) => (
    <Grow in={!loading} timeout={800} style={{ transitionDelay: `${delay}ms` }}>
      <Card 
        sx={{ 
          height: '100%',
          cursor: 'pointer',
          borderRadius: 3,
          background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
          color: 'white',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': { 
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${gradient.shadow}`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover::before': {
            opacity: 1,
          }
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'rotate(10deg) scale(1.1)',
                }
              }}
            >
              {React.cloneElement(icon, { 
                sx: { fontSize: 32, color: 'white' }
              })}
            </Box>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArrowUpIcon sx={{ fontSize: 16, color: '#4CAF50' }} />
                <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          
          <Typography 
            variant="h3" 
            component="div" 
            sx={{ 
              fontWeight: 800,
              mb: 1,
              fontSize: { xs: '2rem', sm: '2.5rem' },
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {loading ? (
              <CircularProgress size={32} sx={{ color: 'white' }} />
            ) : (
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 2s infinite linear',
                  '@keyframes shimmer': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '100%': { backgroundPosition: '100% 50%' }
                  }
                }}
              >
                {value.toLocaleString()}
              </Box>
            )}
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 500,
              opacity: 0.95,
              fontSize: '1.1rem',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {title}
          </Typography>

          {/* Decorative elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              opacity: 0.5,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              opacity: 0.7,
            }}
          />
        </CardContent>
      </Card>
    </Grow>
  );

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in timeout={500}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1a1a1a' }}>
              Dashboard Overview
            </Typography>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                '& .MuiAlert-icon': { fontSize: 28 }
              }}
            >
              {error}
            </Alert>
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: 2,
                '& .MuiAlert-icon': { fontSize: 28 }
              }}
            >
              Make sure you've:
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                <li>Added your Firebase configuration to src/config/firebase.js</li>
                <li>Set up Realtime Database security rules to allow reading</li>
                <li>Your Firebase project has the data: users, projects, applications</li>
              </ul>
            </Alert>
          </Box>
        </Fade>
      </Container>
    );
  }

  const primaryStats = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <PeopleIcon />,
      gradient: { from: '#667eea', to: '#764ba2', shadow: 'rgba(102, 126, 234, 0.4)' },
      trend: "+12%"
    },
    {
      title: "Students",
      value: stats.totalStudents,
      icon: <PeopleIcon />,
      gradient: { from: '#f093fb', to: '#f5576c', shadow: 'rgba(245, 87, 108, 0.4)' },
      trend: "+8%"
    },
    {
      title: "Companies",
      value: stats.totalCompanies,
      icon: <BusinessIcon />,
      gradient: { from: '#4facfe', to: '#00f2fe', shadow: 'rgba(79, 172, 254, 0.4)' },
      trend: "+5%"
    },
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: <WorkIcon />,
      gradient: { from: '#43e97b', to: '#38f9d7', shadow: 'rgba(67, 233, 123, 0.4)' },
      trend: "+15%"
    }
  ];

  const secondaryStats = [
    {
      title: "Approved Projects",
      value: stats.approvedProjects,
      icon: <CheckCircleIcon />,
      gradient: { from: '#fa709a', to: '#fee140', shadow: 'rgba(250, 112, 154, 0.4)' }
    },
    {
      title: "Completed Projects",
      value: stats.completedProjects,
      icon: <TrendingUpIcon />,
      gradient: { from: '#a8edea', to: '#fed6e3', shadow: 'rgba(168, 237, 234, 0.4)' }
    },
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: <AssignmentIcon />,
      gradient: { from: '#d299c2', to: '#fef9d7', shadow: 'rgba(210, 153, 194, 0.4)' }
    },
    {
      title: "Pending Applications",
      value: stats.pendingApplications,
      icon: <ScheduleIcon />,
      gradient: { from: '#89f7fe', to: '#66a6ff', shadow: 'rgba(137, 247, 254, 0.4)' }
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography 
              variant="h3" 
              component="h1"
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              Dashboard Overview
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(0, 0, 0, 0.6)',
                fontWeight: 400
              }}
            >
              Real-time insights and analytics
            </Typography>
          </Box>
          
          <Tooltip title="Refresh Data">
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                width: 56,
                height: 56,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'scale(1.1)',
                },
                '&:disabled': {
                  background: 'rgba(102, 126, 234, 0.5)',
                  color: 'rgba(255, 255, 255, 0.7)',
                }
              }}
            >
              <RefreshIcon sx={{ 
                fontSize: 28,
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Fade>
      
      {/* Loading State */}
      {loading && (
        <Fade in timeout={400}>
          <Paper
            elevation={0}
            sx={{ 
              p: 6,
              mb: 4,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
              borderRadius: 3,
              border: '1px solid rgba(102, 126, 234, 0.1)',
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <CircularProgress 
              size={48} 
              sx={{ 
                color: '#667eea',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                }
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#667eea',
                fontWeight: 600,
                textAlign: 'center'
              }}
            >
              Loading analytics from Firebase...
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(0, 0, 0, 0.6)',
                textAlign: 'center'
              }}
            >
              Please wait while we fetch your latest data
            </Typography>
          </Paper>
        </Fade>
      )}
      
      {/* Primary Stats */}
      <Fade in={!loading} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 3,
              fontWeight: 700,
              color: '#1a1a1a',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 60,
                height: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
              }
            }}
          >
            📊 Overview
          </Typography>
          <Grid container spacing={3}>
            {primaryStats.map((stat, index) => (
              <Grid item xs={12} sm={6} lg={3} key={stat.title}>
                <StatCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  gradient={stat.gradient}
                  delay={index * 100}
                  trend={stat.trend}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>

      {/* Secondary Stats */}
      <Fade in={!loading} timeout={1000}>
        <Box>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 3,
              fontWeight: 700,
              color: '#1a1a1a',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 60,
                height: 4,
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                borderRadius: 2,
              }
            }}
          >
            🎯 Detailed Analytics
          </Typography>
          <Grid container spacing={3}>
            {secondaryStats.map((stat, index) => (
              <Grid item xs={12} sm={6} lg={3} key={stat.title}>
                <StatCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  gradient={stat.gradient}
                  delay={400 + index * 100}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>

      {/* No Data Warning */}
      {!loading && stats.totalUsers === 0 && (
        <Fade in timeout={1200}>
          <Alert 
            severity="warning" 
            sx={{ 
              mt: 4,
              borderRadius: 2,
              '& .MuiAlert-icon': { fontSize: 28 }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              No Data Found
            </Typography>
            Make sure your Firebase database has data in the users, projects, and applications nodes.
          </Alert>
        </Fade>
      )}
    </Container>
  );
};

export default Dashboard;