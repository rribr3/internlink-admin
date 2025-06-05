// src/components/Projects.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Business as CompanyIcon,
  Schedule as PendingIcon,
  Done as CompleteIcon
} from '@mui/icons-material';
import { ref, get, update } from 'firebase/database';
import { database } from '../config/firebase';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projectsRef = ref(database, 'projects');
      const snapshot = await get(projectsRef);
      const projectsData = snapshot.val() || {};
      
      const projectsArray = Object.entries(projectsData).map(([id, data]) => ({
        id,
        ...data
      }));
      
      setProjects(projectsArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      await update(ref(database, `projects/${projectId}`), {
        status: newStatus
      });
      
      // Refresh projects
      fetchProjects();
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const pendingProjects = projects.filter(p => p.status === 'pending');
  const approvedProjects = projects.filter(p => p.status === 'approved');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const rejectedProjects = projects.filter(p => p.status === 'rejected');

  const getProjectsByTab = () => {
    switch (tabValue) {
      case 0: return projects;
      case 1: return pendingProjects;
      case 2: return approvedProjects;
      case 3: return completedProjects;
      case 4: return rejectedProjects;
      default: return projects;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: '#ff9800', color: 'white' };
      case 'approved': return { bg: '#4caf50', color: 'white' };
      case 'completed': return { bg: '#2196f3', color: 'white' };
      case 'rejected': return { bg: '#f44336', color: 'white' };
      default: return { bg: '#9e9e9e', color: 'white' };
    }
  };

  const ProjectCard = ({ project }) => {
    const statusStyle = getStatusColor(project.status);
    
    return (
      <Card
        sx={{
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              {project.title}
            </Typography>
            <Chip
              label={project.status}
              sx={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
                fontWeight: 500,
                textTransform: 'capitalize'
              }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
            {project.description?.substring(0, 100)}...
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CompanyIcon sx={{ fontSize: 16, mr: 1, color: 'rgba(0,0,0,0.6)' }} />
            <Typography variant="body2" color="text.secondary">
              {project.companyName || 'Unknown Company'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={() => handleViewProject(project)}
                  sx={{ color: '#667eea' }}
                >
                  <ViewIcon />
                </IconButton>
              </Tooltip>
              
              {project.status === 'pending' && (
                <>
                  <Tooltip title="Approve">
                    <IconButton
                      size="small"
                      onClick={() => handleUpdateStatus(project.id, 'approved')}
                      sx={{ color: '#4caf50' }}
                    >
                      <ApproveIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton
                      size="small"
                      onClick={() => handleUpdateStatus(project.id, 'rejected')}
                      sx={{ color: '#f44336' }}
                    >
                      <RejectIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              
              {project.status === 'approved' && (
                <Tooltip title="Mark Complete">
                  <IconButton
                    size="small"
                    onClick={() => handleUpdateStatus(project.id, 'completed')}
                    sx={{ color: '#2196f3' }}
                  >
                    <CompleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              {project.duration || 'No duration set'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={48} />
          <Typography sx={{ ml: 2 }}>Loading projects...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 800,
          background: 'linear-gradient(135deg, #28B463 0%, #58D68D 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}
      >
        Project Management
      </Typography>
      <Typography variant="h6" sx={{ color: 'rgba(0, 0, 0, 0.6)', mb: 4 }}>
        Manage and approve internship projects
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={<Badge badgeContent={projects.length} color="primary">All Projects</Badge>} />
          <Tab label={<Badge badgeContent={pendingProjects.length} color="warning">Pending</Badge>} />
          <Tab label={<Badge badgeContent={approvedProjects.length} color="success">Approved</Badge>} />
          <Tab label={<Badge badgeContent={completedProjects.length} color="info">Completed</Badge>} />
          <Tab label={<Badge badgeContent={rejectedProjects.length} color="error">Rejected</Badge>} />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {getProjectsByTab().map((project) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
            <ProjectCard project={project} />
          </Grid>
        ))}
      </Grid>

      {/* Project Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProject && (
          <>
            <DialogTitle>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {selectedProject.title}
              </Typography>
              <Chip
                label={selectedProject.status}
                sx={{
                  backgroundColor: getStatusColor(selectedProject.status).bg,
                  color: getStatusColor(selectedProject.status).color,
                  mt: 1
                }}
              />
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {selectedProject.description || 'No description available'}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Company
                    </Typography>
                    <Typography variant="body2">
                      {selectedProject.companyName || 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Duration
                    </Typography>
                    <Typography variant="body2">
                      {selectedProject.duration || 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Requirements
                    </Typography>
                    <Typography variant="body2">
                      {selectedProject.requirements || 'No requirements listed'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Skills Needed
                    </Typography>
                    <Typography variant="body2">
                      {selectedProject.skills || 'No skills specified'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              {selectedProject.status === 'pending' && (
                <>
                  <Button
                    onClick={() => {
                      handleUpdateStatus(selectedProject.id, 'approved');
                      setDialogOpen(false);
                    }}
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => {
                      handleUpdateStatus(selectedProject.id, 'rejected');
                      setDialogOpen(false);
                    }}
                    variant="contained"
                    color="error"
                    startIcon={<RejectIcon />}
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {getProjectsByTab().length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No projects found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Projects will appear here once companies post them
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Projects;