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
  Tooltip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Stack,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Fade
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Business as CompanyIcon,
  Schedule as PendingIcon,
  Done as CompleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  DateRange as DateIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  School as EducationIcon,
  Code as SkillsIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  AccessTime as DurationIcon,
  Group as GroupIcon,
  Quiz as QuizIcon,
  CalendarToday as CreatedIcon,
  Timeline as StatusIcon,
  Event as EventIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

// Import Firebase functions
import { ref, get, update, push, set, onValue, off, remove } from 'firebase/database';
import { database } from '../config/firebase';
import { useGlobalTheme } from '../contexts/GlobalThemeContext';
import { ThemeToggleButton } from './ThemeToggleButton';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  
  // Categories management states
  const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Set up categories listener
    const categoriesRef = ref(database, 'categories');
    
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      try {
        const data = snapshot.val();
        console.log('Raw categories data:', data);
        
        if (!data) {
          console.log('No categories data, setting empty array');
          setCategories([]);
          return;
        }

        const categoriesList = [];
        
        // Process each category entry for the new structure (categoryName: true)
        for (const categoryName in data) {
          if (data.hasOwnProperty(categoryName)) {
            const value = data[categoryName];
            console.log(`Processing category ${categoryName}:`, value);
            
            // Skip if value is not true (for the boolean structure)
            if (value !== true) {
              console.log(`Skipping category ${categoryName} with value:`, value);
              continue;
            }
            
            // Create category object
            const category = {
              id: categoryName,
              name: categoryName,
              createdAt: Date.now(), // We don't store timestamps in this structure
              projectCount: 0 // We don't store project counts in this structure
            };
            
            console.log(`Adding valid category:`, category);
            categoriesList.push(category);
          }
        }
        
        console.log('Final categories list:', categoriesList);
        
        // Set categories without sorting
        setCategories(categoriesList);
        
      } catch (error) {
        console.error('Error in categories listener:', error);
        setCategories([]);
        setError('Failed to load categories: ' + error.message);
      }
    }, (error) => {
      console.error('Firebase categories listener error:', error);
      setCategories([]);
      setError('Failed to connect to categories database: ' + error.message);
    });

    // Cleanup function
    return () => {
      try {
        off(categoriesRef, 'value', unsubscribe);
      } catch (error) {
        console.error('Error removing Firebase listener:', error);
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects from Firebase
      const projectsRef = ref(database, 'projects');
      const projectsSnapshot = await get(projectsRef);
      const projectsData = projectsSnapshot.val() || {};
      
      // Fetch companies from Firebase users
      const companiesRef = ref(database, 'users');
      const companiesSnapshot = await get(companiesRef);
      const companiesData = companiesSnapshot.val() || {};
      
      // Filter only company users
      const companyUsers = Object.entries(companiesData).reduce((acc, [id, data]) => {
        if (data.role === 'company') {
          acc[id] = {
            name: data.name || data.companyName || 'Unknown Company',
            logoUrl: data.logoUrl || ''
          };
        }
        return acc;
      }, {});
      
      setCompanies(companyUsers);
      
      // Convert projects to array with company info
      const projectsArray = Object.entries(projectsData).map(([id, data]) => {
        const companyInfo = companyUsers[data.companyId] || {};
        return {
          id,
          ...data,
          companyName: companyInfo.name || 'Unknown Company',
          companyLogo: companyInfo.logoUrl || ''
        };
      });
      
      setProjects(projectsArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      setLoading(false);
    }
  };



  // Add new category
  const handleAddCategory = async () => {
    console.log('handleAddCategory called with:', newCategory);
    
    if (!newCategory || typeof newCategory !== 'string' || !newCategory.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    const trimmedName = newCategory.trim();
    console.log('Trimmed category name:', trimmedName);

    // Check if category already exists
    const exists = categories.some(cat => {
      console.log('Checking existing category:', cat.name, 'against:', trimmedName);
      return cat.name && cat.name.toLowerCase() === trimmedName.toLowerCase();
    });
    
    if (exists) {
      setError('Category already exists');
      return;
    }

    setAddingCategory(true);
    try {
      // Set the category name as key with value true
      const categoryRef = ref(database, `categories/${trimmedName}`);
      
      console.log('Adding category to Firebase:', trimmedName, '= true');
      console.log('Category ref:', categoryRef);
      
      await set(categoryRef, true);

      setNewCategory('');
      setError(null);
      console.log('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add category: ' + error.message);
    } finally {
      setAddingCategory(false);
    }
  };

  // Start editing category
  const handleEditCategoryStart = (category) => {
    setEditingCategory(category.id);
    setEditCategoryValue(category.name);
  };

  // Save edited category
  const handleEditCategorySave = async (categoryId) => {
    if (!editCategoryValue.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    const newName = editCategoryValue.trim();

    // Check if new name already exists (excluding current category)
    if (categories.some(cat => cat.name !== categoryId && cat.name.toLowerCase() === newName.toLowerCase())) {
      setError('Category name already exists');
      return;
    }

    try {
      // For the new structure, we need to:
      // 1. Remove the old category
      // 2. Add the new category
      if (categoryId !== newName) {
        // Remove old category
        await remove(ref(database, `categories/${categoryId}`));
        // Add new category
        await set(ref(database, `categories/${newName}`), true);
      }

      setEditingCategory(null);
      setEditCategoryValue('');
      setError(null);
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category');
    }
  };

  // Cancel editing category
  const handleEditCategoryCancel = () => {
    setEditingCategory(null);
    setEditCategoryValue('');
  };

  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    try {
      // Delete the category using its name as the key
      await remove(ref(database, `categories/${categoryId}`));
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setEditedProject({...project});
    setEditMode(false);
    setDialogOpen(true);
  };

  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      // Update status in Firebase
      await update(ref(database, `projects/${projectId}`), {
        status: newStatus
      });
      
      // Update local state
      setProjects(prev => prev.map(p => 
        p.id === projectId ? {...p, status: newStatus} : p
      ));
      
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(prev => ({...prev, status: newStatus}));
        setEditedProject(prev => ({...prev, status: newStatus}));
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      setError('Failed to update project status');
    }
  };

  const handleEditProject = async () => {
    try {
      const { id, companyName, companyLogo, ...projectData } = editedProject;
      
      // Update project in Firebase
      await update(ref(database, `projects/${id}`), projectData);
      
      // Update local state
      setProjects(prev => prev.map(p => 
        p.id === id ? {...editedProject} : p
      ));
      
      setEditMode(false);
      setSelectedProject(editedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field, value) => {
    setEditedProject(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim())
    }));
  };

  const handleDateChange = (field, value) => {
    // Convert date string to timestamp
    const timestamp = new Date(value).getTime();
    setEditedProject(prev => ({
      ...prev,
      [field]: timestamp
    }));
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

  const formatDate = (timestamp) => {
    return timestamp ? new Date(timestamp).toLocaleDateString() : 'Not specified';
  };

  const formatDateForInput = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0];
  };

  const ProjectCard = ({ project }) => {
    const statusStyle = getStatusColor(project.status);
    
    return (
      <Card
        sx={{
          height: '100%',
          transition: 'all 0.3s ease',
          border: '1px solid #e0e0e0',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
            borderColor: '#1976d2'
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header with title and status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, color: '#1976d2' }}>
              {project.title}
            </Typography>
            <Chip
              onClick={() => {
                setSelectedProject(project);
                setEditedProject({...project});
                setEditMode(true);
                setDialogOpen(true);
              }}                  
              label={project.status}
              sx={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
                fontWeight: 500,
                textTransform: 'capitalize',
                ml: 1
              }}
            />
          </Box>

          {/* Company info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              src={project.companyLogo} 
              sx={{ width: 24, height: 24, mr: 1, bgcolor: '#1976d2' }}
            >
              <CompanyIcon sx={{ fontSize: 14 }} />
            </Avatar>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {project.companyName}
            </Typography>
          </Box>

          {/* Description */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
            {project.description?.length > 100 
              ? `${project.description.substring(0, 100)}...` 
              : project.description || 'No description available'}
          </Typography>

          {/* Key details */}
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
              <Chip 
                onClick={() => {
                  setSelectedProject(project);
                  setEditedProject({...project});
                  setEditMode(true);
                  setDialogOpen(true);
                }}
                icon={<CategoryIcon sx={{ fontSize: 14 }} />}
                label={project.category} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.75rem', mb: 0.5 }}
              />
              <Chip 
                onClick={() => {
                  setSelectedProject(project);
                  setEditedProject({...project});
                  setEditMode(true);
                  setDialogOpen(true);
                }}
                icon={<MoneyIcon sx={{ fontSize: 14 }} />}
                label={project.compensationType} 
                size="small" 
                variant="outlined"
                color={project.compensationType === 'Paid' ? 'success' : 'default'}
                sx={{ fontSize: '0.75rem', mb: 0.5 }}
              />
              {project.location && (
                <Chip 
                  onClick={() => {
                    setSelectedProject(project);
                    setEditedProject({...project});
                    setEditMode(true);
                    setDialogOpen(true);
                  }}
                  icon={<LocationIcon sx={{ fontSize: 14 }} />}
                  label={project.location} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', mb: 0.5 }}
                />
              )}
            </Stack>
            {project.compensationType === 'Paid' && project.amount && (
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                ${project.amount}
              </Typography>
            )}
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Applicants</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {project.applicants || 0}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Required</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {project.studentsRequired || 0}
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {project.duration || 'No duration set'}
            </Typography>
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={() => handleViewProject(project)}
                  sx={{ color: '#1976d2' }}
                >
                  <ViewIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Edit Project">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedProject(project);
                    setEditedProject({...project});
                    setEditMode(true);
                    setDialogOpen(true);
                  }}
                  sx={{ color: '#9c27b0' }}
                >
                  <EditIcon />
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
        <Button onClick={fetchData} sx={{ mt: 2 }}>Retry</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Project Management
          </Typography>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setCategoriesDialogOpen(true)}
            sx={{ borderColor: '#1976d2', color: '#1976d2' }}
          >
            Manage Categories
          </Button>
        </Box>
        <Typography variant="h6" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Manage and oversee internship projects across your organization
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Fade in={true}>
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Total Projects', value: projects.length, color: '#1976d2' },
          { label: 'Pending', value: pendingProjects.length, color: '#ff9800' },
          { label: 'Approved', value: approvedProjects.length, color: '#4caf50' },
          { label: 'Completed', value: completedProjects.length, color: '#2196f3' },
          { label: 'Rejected', value: rejectedProjects.length, color: '#f44336' }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                border: `1px solid ${stat.color}30`
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={<Badge badgeContent={projects.length} color="primary">All Projects</Badge>} />
          <Tab label={<Badge badgeContent={pendingProjects.length} color="warning">Pending</Badge>} />
          <Tab label={<Badge badgeContent={approvedProjects.length} color="success">Approved</Badge>} />
          <Tab label={<Badge badgeContent={completedProjects.length} color="info">Completed</Badge>} />
          <Tab label={<Badge badgeContent={rejectedProjects.length} color="error">Rejected</Badge>} />
        </Tabs>
      </Box>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {getProjectsByTab().map((project) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
            <ProjectCard project={project} />
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
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

      {/* Categories Management Dialog */}
      <Dialog
        open={categoriesDialogOpen}
        onClose={() => setCategoriesDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CategoryIcon sx={{ mr: 2, color: '#1976d2' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Manage Categories
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Add Category Section */}
          <Box sx={{ mb: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
              Add New Category
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                label="Category Name"
                placeholder="Enter new category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCategory();
                  }
                }}
                variant="outlined"
              />
              
              <Button
                variant="contained"
                onClick={handleAddCategory}
                disabled={addingCategory || !newCategory.trim()}
                sx={{
                  minWidth: 56,
                  height: 56,
                  backgroundColor: '#4caf50',
                  '&:hover': {
                    backgroundColor: '#45a049',
                  }
                }}
              >
                {addingCategory ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  <AddIcon />
                )}
              </Button>
            </Box>
            
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
              Press Enter or click the + button to add category
            </Typography>
          </Box>

          {/* Categories List */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Existing Categories ({categories.length})
            </Typography>

            {categories.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CategoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No Categories Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add your first project category above to get started
                </Typography>
              </Box>
            ) : (
              <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                {categories.map((category, index) => (
                  <ListItem
                    key={category.id}
                    sx={{
                      borderBottom: index < categories.length - 1 ? '1px solid #f0f0f0' : 'none',
                      py: 2
                    }}
                  >
                    <ListItemText
                      primary={
                        editingCategory === category.id ? (
                          <TextField
                            fullWidth
                            value={editCategoryValue}
                            onChange={(e) => setEditCategoryValue(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleEditCategorySave(category.id);
                              } else if (e.key === 'Escape') {
                                handleEditCategoryCancel();
                              }
                            }}
                            variant="outlined"
                            size="small"
                            autoFocus
                          />
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {category.name}
                          </Typography>
                        )
                      }
                      secondary={
                        !editingCategory && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Created: Active Category
                            </Typography>
                          </Box>
                        )
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      {editingCategory === category.id ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Save">
                            <IconButton
                              onClick={() => handleEditCategorySave(category.id)}
                              size="small"
                              sx={{ color: '#4caf50' }}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton
                              onClick={handleEditCategoryCancel}
                              size="small"
                              sx={{ color: '#f44336' }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Category">
                            <IconButton
                              onClick={() => handleEditCategoryStart(category)}
                              size="small"
                              sx={{ color: '#1976d2' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Category">
                            <IconButton
                              onClick={() => {
                                setCategoryToDelete(category);
                                setDeleteConfirmOpen(true);
                              }}
                              size="small"
                              sx={{ color: '#f44336' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setCategoriesDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography>
            Are you sure you want to delete the category "{categoryToDelete?.name}"?
          </Typography>
          {categoryToDelete?.projectCount > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This category has {categoryToDelete.projectCount} projects associated with it. 
              Deleting this category may affect those projects.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteCategory(categoryToDelete?.id)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        {selectedProject && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {editMode ? (
                    <TextField
                      fullWidth
                      label="Project Title"
                      name="title"
                      value={editedProject.title || ''}
                      onChange={handleInputChange}
                      sx={{ minWidth: 300 }}
                    />
                  ) : (
                    <>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {selectedProject.title}
                      </Typography>
                      <Chip
                        label={selectedProject.status}
                        sx={{
                          backgroundColor: getStatusColor(selectedProject.status).bg,
                          color: getStatusColor(selectedProject.status).color,
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}
                      />
                    </>
                  )}
                </Box>
                <IconButton onClick={() => setDialogOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent>
              <Grid container spacing={3}>
                {/* Company Information */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <CompanyIcon sx={{ mr: 1 }} />
                      Company Information
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        src={selectedProject.companyLogo} 
                        sx={{ width: 40, height: 40, mr: 2 }}
                      >
                        <CompanyIcon />
                      </Avatar>
                      <Typography variant="h6">{selectedProject.companyName}</Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Project Status */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <StatusIcon sx={{ mr: 1 }} />
                      Status & Management
                    </Typography>
                    {editMode ? (
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={editedProject.status || 'pending'}
                          label="Status"
                          onChange={(e) => handleInputChange({
                            target: { name: 'status', value: e.target.value }
                          })}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Box>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          Current Status: <strong>{selectedProject.status}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Created: {formatDate(selectedProject.createdAt)}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <DescriptionIcon sx={{ mr: 1 }} />
                      Project Description
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        name="description"
                        value={editedProject.description || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <Typography variant="body1">
                        {selectedProject.description || 'No description available'}
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Project Details */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Project Details
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CategoryIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Category"
                          secondary={editMode ? (
                            <TextField
                              fullWidth
                              select
                              label="Category"
                              name="category"
                              value={editedProject.category || ''}
                              onChange={handleInputChange}
                              size="small"
                              sx={{ mt: 1 }}
                            >
                              {categories.map((category) => (
                                <MenuItem key={category.id} value={category.name}>
                                  {category.name}
                                </MenuItem>
                              ))}
                            </TextField>
                          ) : selectedProject.category}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><DurationIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Duration"
                          secondary={editMode ? (
                            <TextField
                              fullWidth
                              label="Duration"
                              name="duration"
                              value={editedProject.duration || ''}
                              onChange={handleInputChange}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          ) : selectedProject.duration}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><LocationIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Location"
                          secondary={editMode ? (
                            <TextField
                              fullWidth
                              label="Location"
                              name="location"
                              value={editedProject.location || ''}
                              onChange={handleInputChange}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          ) : selectedProject.location || 'Not specified'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><EducationIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Education Level"
                          secondary={editMode ? (
                            <TextField
                              fullWidth
                              select
                              label="Education Level"
                              name="educationLevel"
                              value={editedProject.educationLevel || ''}
                              onChange={handleInputChange}
                              size="small"
                              sx={{ mt: 1 }}
                            >
                              <MenuItem value="Any">Any</MenuItem>
                              <MenuItem value="Junior">Junior</MenuItem>
                              <MenuItem value="Senior">Senior</MenuItem>
                            </TextField>
                          ) : selectedProject.educationLevel}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                {/* Compensation & Requirements */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Compensation & Requirements
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><MoneyIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Compensation Type"
                          secondary={editMode ? (
                            <TextField
                              fullWidth
                              select
                              label="Compensation Type"
                              name="compensationType"
                              value={editedProject.compensationType || ''}
                              onChange={handleInputChange}
                              size="small"
                              sx={{ mt: 1 }}
                            >
                              <MenuItem value="Paid">Paid</MenuItem>
                              <MenuItem value="Unpaid">Unpaid</MenuItem>
                            </TextField>
                          ) : selectedProject.compensationType}
                        />
                      </ListItem>
                      {(selectedProject.compensationType === 'Paid' || editedProject?.compensationType === 'Paid') && (
                        <ListItem>
                          <ListItemIcon><MoneyIcon /></ListItemIcon>
                          <ListItemText 
                            primary="Amount"
                            secondary={editMode ? (
                              <TextField
                                fullWidth
                                type="number"
                                label="Amount ($)"
                                name="amount"
                                value={editedProject.amount || ''}
                                onChange={handleInputChange}
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            ) : selectedProject.amount ? `${selectedProject.amount}` : 'Not specified'}
                          />
                        </ListItem>
                      )}
                      <ListItem>
                        <ListItemIcon><GroupIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Students Required"
                          secondary={editMode ? (
                            <TextField
                              fullWidth
                              type="number"
                              label="Students Required"
                              name="studentsRequired"
                              value={editedProject.studentsRequired || ''}
                              onChange={handleInputChange}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          ) : selectedProject.studentsRequired || 'Not specified'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Current Applicants"
                          secondary={selectedProject.applicants || 0}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                {/* Skills */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Skills Required
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        label="Skills (comma separated)"
                        name="skills"
                        value={editedProject.skills?.join(', ') || ''}
                        onChange={(e) => handleArrayChange('skills', e.target.value)}
                        helperText="Enter skills separated by commas"
                      />
                    ) : (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedProject.skills?.map((skill, index) => (
                          <Chip 
                            key={index} 
                            label={skill} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        )) || <Typography color="text.secondary">No skills specified</Typography>}
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Timeline */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Timeline
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CreatedIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Created"
                          secondary={formatDate(selectedProject.createdAt)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><EventIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Start Date"
                          secondary={editMode ? (
                            <TextField
                              fullWidth
                              type="date"
                              label="Start Date"
                              name="startDate"
                              value={formatDateForInput(editedProject.startDate)}
                              onChange={(e) => handleDateChange('startDate', e.target.value)}
                              size="small"
                              sx={{ mt: 1 }}
                              InputLabelProps={{ shrink: true }}
                            />
                          ) : formatDate(selectedProject.startDate)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><EventIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Deadline"
                          secondary={editMode ? (
                            <TextField
                              fullWidth
                              type="date"
                              label="Deadline"
                              name="deadline"
                              value={formatDateForInput(editedProject.deadline)}
                              onChange={(e) => handleDateChange('deadline', e.target.value)}
                              size="small"
                              sx={{ mt: 1 }}
                              InputLabelProps={{ shrink: true }}
                            />
                          ) : formatDate(selectedProject.deadline)}
                        />
                      </ListItem>
                      {selectedProject.completedAt && (
                        <ListItem>
                          <ListItemIcon><CompleteIcon /></ListItemIcon>
                          <ListItemText 
                            primary="Completed"
                            secondary={formatDate(selectedProject.completedAt)}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
              {editMode ? (
                <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'space-between' }}>
                  <Button 
                    onClick={() => {
                      setEditMode(false);
                      setEditedProject({...selectedProject});
                    }}
                    variant="outlined"
                    color="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditProject}
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    sx={{ 
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)'
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
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
                          sx={{ 
                            background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
                            boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)'
                          }}
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
                          sx={{ 
                            background: 'linear-gradient(45deg, #f44336 30%, #e57373 90%)',
                            boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)'
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {selectedProject.status === 'approved' && (
                      <Button
                        onClick={() => {
                          handleUpdateStatus(selectedProject.id, 'completed');
                          setDialogOpen(false);
                        }}
                        variant="contained"
                        color="info"
                        startIcon={<CompleteIcon />}
                        sx={{ 
                          background: 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
                          boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)'
                        }}
                      >
                        Mark Complete
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        setEditMode(true);
                      }}
                      variant="outlined"
                      startIcon={<EditIcon />}
                      sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                    >
                      Edit Project
                    </Button>
                  </Box>
                  <Button 
                    onClick={() => setDialogOpen(false)}
                    variant="outlined"
                  >
                    Close
                  </Button>
                </Box>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Projects;