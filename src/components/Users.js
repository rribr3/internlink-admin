// src/components/Users.js - Enhanced Dialogs Section
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Divider,
  Snackbar,
  Paper,
  Stack,
  Slide,
  Fade,
  useTheme,
  alpha,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  School as StudentIcon,
  Business as CompanyIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Language as WebsiteIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  BusinessCenter as BusinessCenterIcon,
  Timeline as TimelineIcon,
  AssignmentInd as AssignmentIndIcon,
  Public as PublicIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { ref, get, remove, update } from 'firebase/database';
import { database } from '../config/firebase';

const Users = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [profileDialog, setProfileDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({});
  const [editStep, setEditStep] = useState(0);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Enhanced Slide Transition
  const SlideTransition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  // Enhanced Profile View Dialog
  const ProfileDialog = () => (
    <Dialog
      open={profileDialog}
      onClose={() => setProfileDialog(false)}
      maxWidth="xl"
      fullWidth
      TransitionComponent={SlideTransition}
      PaperProps={{
        sx: { 
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.12)',
          maxHeight: '90vh'
        }
      }}
    >
      {selectedUser && (
        <>
          {/* Stunning Professional Header */}
          <Box
            sx={{
              position: 'relative',
              background: selectedUser.role === 'student' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              p: { xs: 3, md: 5 },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                pointerEvents: 'none'
              }
            }}
          >
            {/* Floating Close Button */}
            <IconButton 
              onClick={() => setProfileDialog(false)}
              sx={{ 
                position: 'absolute', 
                top: 20, 
                right: 20, 
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease',
                zIndex: 1
              }}
            >
              <CloseIcon />
            </IconButton>
            
            {/* Profile Header Content */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: { xs: 80, md: 120 },
                    height: { xs: 80, md: 120 },
                    mr: { xs: 2, md: 4 },
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: '4px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {selectedUser.role === 'student' ? 
                    <StudentIcon sx={{ fontSize: { xs: 40, md: 60 } }} /> : 
                    <CompanyIcon sx={{ fontSize: { xs: 40, md: 60 } }} />
                  }
                </Avatar>
                {/* Verified Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 5,
                    right: { xs: 10, md: 20 },
                    backgroundColor: '#4caf50',
                    borderRadius: '50%',
                    p: 0.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  <VerifiedIcon sx={{ fontSize: 16, color: 'white' }} />
                </Box>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800, 
                    mb: 1, 
                    fontSize: { xs: '1.8rem', md: '2.5rem' },
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  {selectedUser.name || selectedUser.companyName}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip
                    icon={selectedUser.role === 'student' ? <StudentIcon /> : <CompanyIcon />}
                    label={selectedUser.role.toUpperCase()}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      letterSpacing: '1px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Chip
                    icon={<StarIcon />}
                    label="VERIFIED"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(76, 175, 80, 0.9)',
                      color: 'white',
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </Box>
                
                {/* Professional Summary */}
                {selectedUser.role === 'student' && (
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      opacity: 0.9, 
                      fontWeight: 400,
                      fontSize: { xs: '1rem', md: '1.1rem' }
                    }}
                  >
                    {selectedUser.university ? `${selectedUser.major || 'Student'} at ${selectedUser.university}` : 'Student'}
                  </Typography>
                )}
                {selectedUser.role === 'company' && (
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      opacity: 0.9, 
                      fontWeight: 400,
                      fontSize: { xs: '1rem', md: '1.1rem' }
                    }}
                  >
                    {selectedUser.industry || 'Company'} • {selectedUser.location || 'Global'}
                  </Typography>
                )}
              </Box>
            </Box>
            
            {/* Quick Contact Bar */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 3,
                position: 'relative',
                zIndex: 1
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1, opacity: 0.9 }} />
                    <Typography variant="body2" sx={{ opacity: 0.95, wordBreak: 'break-word' }}>
                      {selectedUser.email}
                    </Typography>
                  </Box>
                </Grid>
                {selectedUser.phone && (
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ mr: 1, opacity: 0.9 }} />
                      <Typography variant="body2" sx={{ opacity: 0.95 }}>
                        {selectedUser.phone}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {selectedUser.location && (
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ mr: 1, opacity: 0.9 }} />
                      <Typography variant="body2" sx={{ opacity: 0.95 }}>
                        {selectedUser.location}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Box>

          {/* Content Area */}
          <DialogContent sx={{ p: 0, backgroundColor: '#fafbfc' }}>
            {selectedUser.role === 'student' ? (
              // Enhanced Student Profile
              <Box sx={{ p: { xs: 3, md: 5 } }}>
                <Grid container spacing={4}>
                  {/* Academic Excellence */}
                  <Grid item xs={12} lg={6}>
                    <Card
                      elevation={0}
                      sx={{
                        background: 'linear-gradient(145deg, #e3f2fd 0%, #f8faff 100%)',
                        border: '1px solid #bbdefb',
                        borderRadius: 4,
                        p: 3,
                        height: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -50,
                          right: -50,
                          width: 100,
                          height: 100,
                          background: 'radial-gradient(circle, rgba(103, 126, 234, 0.1) 0%, transparent 70%)',
                          borderRadius: '50%'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                          }}
                        >
                          <StudentIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1565c0' }}>
                            Academic Excellence
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', opacity: 0.8 }}>
                            Educational Background
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1565c0', mb: 1 }}>
                            🏛️ Institution
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#333', fontWeight: 500 }}>
                            {selectedUser.university || 'Not specified'}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1565c0', mb: 1 }}>
                            📚 Field of Study
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#555' }}>
                            {selectedUser.major || selectedUser.degree || 'Not specified'}
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1565c0', mb: 1 }}>
                              🎓 Graduation
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#555' }}>
                              {selectedUser.year || selectedUser.gradyear || 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1565c0', mb: 1 }}>
                              ⭐ GPA
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600 }}>
                                {selectedUser.gpa || 'N/A'}
                              </Typography>
                              {selectedUser.gpa && parseFloat(selectedUser.gpa) >= 3.5 && (
                                <StarIcon sx={{ ml: 1, color: '#ffc107', fontSize: 20 }} />
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </Stack>
                    </Card>
                  </Grid>

                  {/* Skills & Expertise */}
                  <Grid item xs={12} lg={6}>
                    <Card
                      elevation={0}
                      sx={{
                        background: 'linear-gradient(145deg, #f3e5f5 0%, #faf5ff 100%)',
                        border: '1px solid #e1bee7',
                        borderRadius: 4,
                        p: 3,
                        height: '100%',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            boxShadow: '0 8px 24px rgba(171, 71, 188, 0.3)'
                          }}
                        >
                          <WorkIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#6a1b9a' }}>
                            Skills & Expertise
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', opacity: 0.8 }}>
                            Technical Competencies
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6a1b9a', mb: 2 }}>
                            💼 Technical Skills
                          </Typography>
                          {selectedUser.skills ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {selectedUser.skills.split(',').map((skill, index) => (
                                <Chip
                                  key={index}
                                  label={skill.trim()}
                                  size="small"
                                  sx={{
                                    backgroundColor: 'rgba(171, 71, 188, 0.1)',
                                    color: '#6a1b9a',
                                    fontWeight: 500,
                                    '&:hover': {
                                      backgroundColor: 'rgba(171, 71, 188, 0.2)'
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
                              No skills listed yet
                            </Typography>
                          )}
                        </Box>
                        
                        {selectedUser.cvUrl && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6a1b9a', mb: 1 }}>
                              📄 Professional Documents
                            </Typography>
                            <Button
                              variant="outlined"
                              startIcon={<AssignmentIndIcon />}
                              href={selectedUser.cvUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                borderColor: '#ab47bc',
                                color: '#ab47bc',
                                borderRadius: 2,
                                textTransform: 'none',
                                '&:hover': {
                                  borderColor: '#8e24aa',
                                  backgroundColor: 'rgba(171, 71, 188, 0.04)'
                                }
                              }}
                            >
                              View Resume/CV
                            </Button>
                          </Box>
                        )}
                      </Stack>
                    </Card>
                  </Grid>

                  {/* About Section */}
                  <Grid item xs={12}>
                    <Card
                      elevation={0}
                      sx={{
                        background: 'linear-gradient(145deg, #e8f5e8 0%, #f1f8e9 100%)',
                        border: '1px solid #c8e6c9',
                        borderRadius: 4,
                        p: 4
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            boxShadow: '0 8px 24px rgba(67, 160, 71, 0.3)'
                          }}
                        >
                          <PersonIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                            Personal Story
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', opacity: 0.8 }}>
                            Background & Aspirations
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#444', 
                          lineHeight: 1.8,
                          fontSize: '1.1rem'
                        }}
                      >
                        {selectedUser.bio || 'This student hasn\'t shared their personal story yet, but their academic achievements speak volumes about their dedication and potential.'}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              // Enhanced Company Profile
              <Box sx={{ p: { xs: 3, md: 5 } }}>
                <Grid container spacing={4}>
                  {/* Company Overview */}
                  <Grid item xs={12} lg={8}>
                    <Card
                      elevation={0}
                      sx={{
                        background: 'linear-gradient(145deg, #fff3e0 0%, #fffbf0 100%)',
                        border: '1px solid #ffcc02',
                        borderRadius: 4,
                        p: 4,
                        height: '100%'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            boxShadow: '0 8px 24px rgba(255, 152, 0, 0.3)'
                          }}
                        >
                          <BusinessCenterIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#e65100' }}>
                            Company Overview
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', opacity: 0.8 }}>
                            Business Information
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100', mb: 1 }}>
                              🏢 Organization
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#333', fontWeight: 500 }}>
                              {selectedUser.companyName || selectedUser.name}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100', mb: 1 }}>
                              🏭 Industry
                            </Typography>
                            <Chip
                              label={selectedUser.industry || 'General Business'}
                              sx={{
                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                color: '#e65100',
                                fontWeight: 500
                              }}
                            />
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100', mb: 2 }}>
                              📖 About the Company
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.7 }}>
                              {selectedUser.description || selectedUser.mission || 'A forward-thinking organization committed to excellence and innovation in their field.'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>

                  {/* Contact & Links */}
                  <Grid item xs={12} lg={4}>
                    <Stack spacing={3}>
                      {/* Contact Information */}
                      <Card
                        elevation={0}
                        sx={{
                          background: 'linear-gradient(145deg, #e8f5e8 0%, #f1f8e9 100%)',
                          border: '1px solid #a5d6a7',
                          borderRadius: 4,
                          p: 3
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2
                            }}
                          >
                            <EmailIcon sx={{ color: 'white', fontSize: 20 }} />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                            Contact
                          </Typography>
                        </Box>
                        
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                              Email
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#333', wordBreak: 'break-word' }}>
                              {selectedUser.email}
                            </Typography>
                          </Box>
                          
                          {selectedUser.phone && (
                            <Box>
                              <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                                Phone
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#333' }}>
                                {selectedUser.phone}
                              </Typography>
                            </Box>
                          )}
                          
                          {selectedUser.location && (
                            <Box>
                              <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                                Location
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#333' }}>
                                {selectedUser.location}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Card>

                      {/* Digital Presence */}
                      <Card
                        elevation={0}
                        sx={{
                          background: 'linear-gradient(145deg, #f3e5f5 0%, #faf5ff 100%)',
                          border: '1px solid #e1bee7',
                          borderRadius: 4,
                          p: 3
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2
                            }}
                          >
                            <PublicIcon sx={{ color: 'white', fontSize: 20 }} />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#7b1fa2' }}>
                            Online
                          </Typography>
                        </Box>
                        
                        <Stack spacing={2}>
                          {selectedUser.website && (
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={<WebsiteIcon />}
                              href={selectedUser.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                justifyContent: 'flex-start',
                                textTransform: 'none',
                                borderColor: '#9c27b0',
                                color: '#9c27b0'
                              }}
                            >
                              Company Website
                            </Button>
                          )}
                          
                          {selectedUser.linkedin && (
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={<LinkedInIcon />}
                              href={selectedUser.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                justifyContent: 'flex-start',
                                textTransform: 'none',
                                borderColor: '#0077b5',
                                color: '#0077b5'
                              }}
                            >
                              LinkedIn Page
                            </Button>
                          )}
                        </Stack>
                      </Card>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
        </>
      )}
    </Dialog>
  );

  // Enhanced Multi-Step Edit Dialog
  const EditDialog = () => {
    const editSteps = selectedUser?.role === 'student' 
      ? ['Basic Info', 'Academic', 'Professional', 'Social Links']
      : ['Basic Info', 'Company Details', 'Mission & Vision', 'Digital Presence'];

    const handleNextStep = () => {
      if (editStep < editSteps.length - 1) {
        setEditStep(editStep + 1);
      }
    };

    const handlePrevStep = () => {
      if (editStep > 0) {
        setEditStep(editStep - 1);
      }
    };

    const handleSaveEdit = async () => {
      try {
        const updatedData = {};
        
        if (selectedUser.role === 'student') {
          updatedData.name = editFormData.name;
          updatedData.email = editFormData.email;
          updatedData.phone = editFormData.phone;
          updatedData.location = editFormData.location;
          updatedData.university = editFormData.university;
          updatedData.major = editFormData.major;
          updatedData.degree = editFormData.degree;
          updatedData.gpa = editFormData.gpa;
          updatedData.year = editFormData.year;
          updatedData.gradyear = editFormData.gradyear;
          updatedData.skills = editFormData.skills;
          updatedData.bio = editFormData.bio;
          updatedData.linkedin = editFormData.linkedin;
          updatedData.github = editFormData.github;
        } else {
          updatedData.companyName = editFormData.name;
          updatedData.email = editFormData.email;
          updatedData.phone = editFormData.phone;
          updatedData.location = editFormData.location;
          updatedData.website = editFormData.website;
          updatedData.industry = editFormData.industry;
          updatedData.description = editFormData.description;
          updatedData.mission = editFormData.mission;
          updatedData.vision = editFormData.vision;
          updatedData.linkedin = editFormData.linkedin;
          updatedData.twitter = editFormData.twitter;
        }

        await update(ref(database, `users/${selectedUser.id}`), updatedData);
        
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...updatedData }
            : user
        ));
        
        setEditDialog(false);
        setEditStep(0);
        setSelectedUser(null);
        showSnackbar('User updated successfully', 'success');
      } catch (error) {
        console.error('Error updating user:', error);
        showSnackbar('Error updating user', 'error');
      }
    };

    return (
      <Dialog
        open={editDialog}
        onClose={() => {
          setEditDialog(false);
          setEditStep(0);
        }}
        maxWidth="lg"
        fullWidth
        TransitionComponent={SlideTransition}
        PaperProps={{
          sx: { 
            borderRadius: 4,
            overflow: 'hidden',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.12)',
            maxHeight: '90vh'
          }
        }}
      >
        {/* Modern Header with Progress */}
        <Box
          sx={{
            background: selectedUser?.role === 'student' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            p: 4,
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                mr: 3,
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)'
              }}
            >
              {selectedUser?.role === 'student' ? <StudentIcon /> : <CompanyIcon />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Edit Profile
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {selectedUser?.name || selectedUser?.companyName} • Step {editStep + 1} of {editSteps.length}
              </Typography>
            </Box>
            <IconButton 
              onClick={() => {
                setEditDialog(false);
                setEditStep(0);
              }}
              sx={{ 
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.15)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Progress Stepper */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {editSteps.map((step, index) => (
              <React.Fragment key={step}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: index <= editStep 
                      ? 'rgba(255,255,255,0.9)' 
                      : 'rgba(255,255,255,0.3)',
                    color: index <= editStep ? selectedUser?.role === 'student' ? '#667eea' : '#f093fb' : 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {index < editStep ? <CheckCircleIcon /> : index + 1}
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: index <= editStep ? 1 : 0.7,
                    fontWeight: index === editStep ? 600 : 400,
                    fontSize: '0.85rem'
                  }}
                >
                  {step}
                </Typography>
                {index < editSteps.length - 1 && (
                  <Box
                    sx={{
                      flex: 1,
                      height: 2,
                      backgroundColor: index < editStep 
                        ? 'rgba(255,255,255,0.9)' 
                        : 'rgba(255,255,255,0.3)',
                      borderRadius: 1,
                      mx: 1,
                      transition: 'all 0.3s ease'
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 4 }}>
            {/* Step Content */}
            <Fade in key={editStep} timeout={300}>
              <Box>
                {selectedUser?.role === 'student' ? (
                  // Student Edit Steps
                  <>
                    {editStep === 0 && (
                      <Card elevation={0} sx={{ p: 4, backgroundColor: '#f8faff', border: '1px solid #e3f2fd' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1565c0', display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 2 }} />
                          Basic Information
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Full Name"
                              value={editFormData.name || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Email Address"
                              type="email"
                              value={editFormData.email || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Phone Number"
                              value={editFormData.phone || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Location"
                              value={editFormData.location || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    )}

                    {editStep === 1 && (
                      <Card elevation={0} sx={{ p: 4, backgroundColor: '#f3e5f5', border: '1px solid #e1bee7' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#7b1fa2', display: 'flex', alignItems: 'center' }}>
                          <StudentIcon sx={{ mr: 2 }} />
                          Academic Background
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="University/Institution"
                              value={editFormData.university || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, university: e.target.value })}
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Major/Field of Study"
                              value={editFormData.major || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, major: e.target.value })}
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Degree Level"
                              value={editFormData.degree || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, degree: e.target.value })}
                              variant="outlined"
                              placeholder="e.g., Bachelor's, Master's, PhD"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Graduation Year"
                              value={editFormData.gradyear || editFormData.year || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, gradyear: e.target.value, year: e.target.value })}
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="GPA"
                              value={editFormData.gpa || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, gpa: e.target.value })}
                              variant="outlined"
                              placeholder="e.g., 3.8"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    )}

                    {editStep === 2 && (
                      <Card elevation={0} sx={{ p: 4, backgroundColor: '#e8f5e8', border: '1px solid #c8e6c9' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#2e7d32', display: 'flex', alignItems: 'center' }}>
                          <WorkIcon sx={{ mr: 2 }} />
                          Professional Information
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Skills & Technologies"
                              multiline
                              rows={3}
                              value={editFormData.skills || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value })}
                              variant="outlined"
                              placeholder="e.g., JavaScript, Python, React, Node.js, Data Analysis..."
                              helperText="Separate skills with commas"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Personal Bio"
                              multiline
                              rows={4}
                              value={editFormData.bio || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                              variant="outlined"
                              placeholder="Tell us about yourself, your interests, career goals, and what makes you unique..."
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    )}

                    {editStep === 3 && (
                      <Card elevation={0} sx={{ p: 4, backgroundColor: '#fff3e0', border: '1px solid #ffcc02' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f57c00', display: 'flex', alignItems: 'center' }}>
                          <PublicIcon sx={{ mr: 2 }} />
                          Social & Professional Links
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="LinkedIn Profile"
                              value={editFormData.linkedin || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, linkedin: e.target.value })}
                              variant="outlined"
                              placeholder="https://linkedin.com/in/yourprofile"
                              InputProps={{
                                startAdornment: <LinkedInIcon sx={{ mr: 1, color: '#0077b5' }} />
                              }}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="GitHub Profile"
                              value={editFormData.github || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, github: e.target.value })}
                              variant="outlined"
                              placeholder="https://github.com/yourusername"
                              InputProps={{
                                startAdornment: <GitHubIcon sx={{ mr: 1, color: '#333' }} />
                              }}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    )}
                  </>
                ) : (
                  // Company Edit Steps
                  <>
                    {editStep === 0 && (
                      <Card elevation={0} sx={{ p: 4, backgroundColor: '#f8faff', border: '1px solid #e3f2fd' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1565c0', display: 'flex', alignItems: 'center' }}>
                          <BusinessCenterIcon sx={{ mr: 2 }} />
                          Basic Information
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Company Name"
                              value={editFormData.name || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Industry"
                              value={editFormData.industry || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                              variant="outlined"
                              placeholder="e.g., Technology, Finance, Healthcare"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Email Address"
                              type="email"
                              value={editFormData.email || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Phone Number"
                              value={editFormData.phone || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Business Address"
                              value={editFormData.location || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    )}

                    {editStep === 1 && (
                      <Card elevation={0} sx={{ p: 4, backgroundColor: '#f3e5f5', border: '1px solid #e1bee7' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#7b1fa2', display: 'flex', alignItems: 'center' }}>
                          <CompanyIcon sx={{ mr: 2 }} />
                          Company Details
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Company Website"
                              value={editFormData.website || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                              variant="outlined"
                              placeholder="https://yourcompany.com"
                              InputProps={{
                                startAdornment: <WebsiteIcon sx={{ mr: 1, color: '#666' }} />
                              }}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Company Description"
                              multiline
                              rows={4}
                              value={editFormData.description || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                              variant="outlined"
                              placeholder="Describe your company, what you do, your services, and what makes you unique..."
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    )}

                    {editStep === 2 && (
                      <Card elevation={0} sx={{ p: 4, backgroundColor: '#e8f5e8', border: '1px solid #c8e6c9' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#2e7d32', display: 'flex', alignItems: 'center' }}>
                          <AutoAwesomeIcon sx={{ mr: 2 }} />
                          Mission & Vision
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Mission Statement"
                              multiline
                              rows={4}
                              value={editFormData.mission || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, mission: e.target.value })}
                              variant="outlined"
                              placeholder="What is your company's purpose and mission?"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Vision Statement"
                              multiline
                              rows={4}
                              value={editFormData.vision || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, vision: e.target.value })}
                              variant="outlined"
                              placeholder="What is your company's vision for the future?"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    )}

                    {editStep === 3 && (
                      <Card elevation={0} sx={{ p: 4, backgroundColor: '#fff3e0', border: '1px solid #ffcc02' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f57c00', display: 'flex', alignItems: 'center' }}>
                          <PublicIcon sx={{ mr: 2 }} />
                          Digital Presence
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="LinkedIn Company Page"
                              value={editFormData.linkedin || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, linkedin: e.target.value })}
                              variant="outlined"
                              placeholder="https://linkedin.com/company/yourcompany"
                              InputProps={{
                                startAdornment: <LinkedInIcon sx={{ mr: 1, color: '#0077b5' }} />
                              }}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Twitter/X Handle"
                              value={editFormData.twitter || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, twitter: e.target.value })}
                              variant="outlined"
                              placeholder="https://twitter.com/yourcompany"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    )}
                  </>
                )}
              </Box>
            </Fade>
          </Box>
        </DialogContent>
        
        {/* Enhanced Action Bar */}
        <Box
          sx={{
            p: 3,
            background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Button 
            onClick={handlePrevStep}
            disabled={editStep === 0}
            startIcon={<TimelineIcon />}
            sx={{ 
              visibility: editStep === 0 ? 'hidden' : 'visible',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Previous
          </Button>
          
          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
            Step {editStep + 1} of {editSteps.length}
          </Typography>
          
          {editStep < editSteps.length - 1 ? (
            <Button 
              onClick={handleNextStep}
              variant="contained"
              endIcon={<TimelineIcon />}
              sx={{
                background: selectedUser?.role === 'student' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                borderRadius: 2
              }}
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSaveEdit}
              variant="contained"
              startIcon={<CheckCircleIcon />}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                borderRadius: 2
              }}
            >
              Save Changes
            </Button>
          )}
        </Box>
      </Dialog>
    );
  };

  // Enhanced Delete Confirmation Dialog
  const DeleteDialog = () => (
    <Dialog
      open={deleteDialog}
      onClose={() => setDeleteDialog(false)}
      maxWidth="sm"
      fullWidth
      TransitionComponent={SlideTransition}
      PaperProps={{
        sx: { 
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12)'
        }
      }}
    >
      {/* Warning Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #ff5722 0%, #d32f2f 100%)',
          color: 'white',
          p: 3,
          textAlign: 'center'
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '3px solid rgba(255,255,255,0.3)'
          }}
        >
          <WarningIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Confirm Deletion
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          This action cannot be undone
        </Typography>
      </Box>

      <DialogContent sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
          Are you sure you want to delete this {selectedUser?.role}?
        </Typography>
        
        {selectedUser && (
          <Card
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: '#fafafa',
              border: '2px solid #ffebee',
              borderRadius: 3,
              mb: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar
                sx={{
                  width: 50,
                  height: 50,
                  mr: 2,
                  backgroundColor: selectedUser.role === 'student' ? '#e3f2fd' : '#fce4ec'
                }}
              >
                {selectedUser.role === 'student' ? 
                  <StudentIcon sx={{ color: '#1976d2' }} /> : 
                  <CompanyIcon sx={{ color: '#c2185b' }} />
                }
              </Avatar>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                  {selectedUser.name || selectedUser.companyName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {selectedUser.email}
                </Typography>
              </Box>
            </Box>
          </Card>
        )}

        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3, 
            textAlign: 'left',
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <Typography variant="body2">
            <strong>Warning:</strong> All data associated with this {selectedUser?.role} will be permanently removed from the system.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 3, 
          backgroundColor: '#fafafa',
          gap: 2
        }}
      >
        <Button 
          onClick={() => setDeleteDialog(false)}
          variant="outlined"
          size="large"
          sx={{ 
            flex: 1,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={confirmDelete}
          variant="contained"
          size="large"
          sx={{
            flex: 1,
            backgroundColor: '#d32f2f',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: '#b71c1c'
            }
          }}
          startIcon={<DeleteIcon />}
        >
          Delete {selectedUser?.role}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Utility functions for the main component
  const fetchUsers = async () => {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      const usersData = snapshot.val() || {};
      
      const usersArray = Object.entries(usersData).map(([id, data]) => ({
        id,
        ...data
      }));
      
      setUsers(usersArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setProfileDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || user.companyName || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      university: user.university || '',
      major: user.major || '',
      degree: user.degree || '',
      gpa: user.gpa || '',
      year: user.year || '',
      gradyear: user.gradyear || '',
      skills: user.skills || '',
      bio: user.bio || '',
      website: user.website || '',
      industry: user.industry || '',
      description: user.description || '',
      mission: user.mission || '',
      vision: user.vision || '',
      linkedin: user.linkedin || '',
      github: user.github || '',
      twitter: user.twitter || ''
    });
    setEditStep(0);
    setEditDialog(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await remove(ref(database, `users/${selectedUser.id}`));
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setDeleteDialog(false);
      setSelectedUser(null);
      showSnackbar('User deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showSnackbar('Error deleting user', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const students = users.filter(user => user.role === 'student');
  const companies = users.filter(user => user.role === 'company');

  const getUsersByTab = () => {
    switch (tabValue) {
      case 0: return users;
      case 1: return students;
      case 2: return companies;
      default: return users;
    }
  };

  // Enhanced User Card Component
  const UserCard = ({ user }) => (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        borderRadius: 3,
        border: '1px solid #e0e7ff',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          border: user.role === 'student' ? '1px solid #667eea' : '1px solid #f093fb'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                mr: 2,
                background: user.role === 'student' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }}
            >
              {user.role === 'student' ? <StudentIcon /> : <CompanyIcon />}
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: 8,
                width: 20,
                height: 20,
                backgroundColor: '#4caf50',
                borderRadius: '50%',
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <VerifiedIcon sx={{ fontSize: 12, color: 'white' }} />
            </Box>
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {user.name || user.companyName || 'Unknown'}
            </Typography>
            <Chip
              label={user.role.toUpperCase()}
              size="small"
              sx={{
                background: user.role === 'student'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
                letterSpacing: '0.5px'
              }}
            />
          </Box>
        </Box>

        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 20 }}>
            <EmailIcon sx={{ fontSize: 16, mr: 1.5, color: '#667eea' }} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1
              }}
            >
              {user.email}
            </Typography>
          </Box>
          
          {user.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 20 }}>
              <PhoneIcon sx={{ fontSize: 16, mr: 1.5, color: '#f093fb' }} />
              <Typography variant="body2" sx={{ color: '#666' }}>
                {user.phone}
              </Typography>
            </Box>
          )}
          
          {user.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 20 }}>
              <LocationIcon sx={{ fontSize: 16, mr: 1.5, color: '#4caf50' }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user.location}
              </Typography>
            </Box>
          )}
        </Stack>

        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 1,
            pt: 2,
            borderTop: '1px solid #f0f0f0'
          }}
        >
          <Tooltip title="View Profile" placement="top">
            <IconButton 
              size="small" 
              sx={{ 
                color: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.2)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleViewProfile(user)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit User" placement="top">
            <IconButton 
              size="small" 
              sx={{ 
                color: '#ff9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.2)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleEditUser(user)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User" placement="top">
            <IconButton 
              size="small" 
              sx={{ 
                color: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.2)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleDeleteUser(user)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );

  // Loading and Error States
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 2, color: '#667eea' }} />
            <Typography variant="h6" sx={{ color: '#666' }}>Loading users...</Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3,
            '& .MuiAlert-message': { fontSize: '1.1rem' }
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Enhanced Header */}
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 900,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            fontSize: { xs: '2.5rem', md: '3.5rem' }
          }}
        >
          User Management
        </Typography>
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'rgba(0, 0, 0, 0.6)', 
            fontWeight: 400,
            maxWidth: 600,
            margin: '0 auto'
          }}
        >
          Comprehensive platform for managing students and companies
        </Typography>
      </Box>

      {/* Enhanced Tabs */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 4, 
          mb: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0'
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              minHeight: 72
            }
          }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge badgeContent={users.length} color="primary">
                  <PersonIcon />
                </Badge>
                All Users
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge badgeContent={students.length} color="success">
                  <StudentIcon />
                </Badge>
                Students
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge badgeContent={companies.length} color="warning">
                  <CompanyIcon />
                </Badge>
                Companies
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* Users Grid */}
      <Grid container spacing={3}>
        {getUsersByTab().map((user) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
            <UserCard user={user} />
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {getUsersByTab().length === 0 && (
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            mt: 4,
            borderRadius: 4,
            background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
            border: '2px dashed #e2e8f0'
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: '#f0f9ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              border: '3px solid #e0f2fe'
            }}
          >
            <PersonIcon sx={{ fontSize: 60, color: '#0284c7' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#334155' }}>
            No {tabValue === 1 ? 'students' : tabValue === 2 ? 'companies' : 'users'} found
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 400, margin: '0 auto' }}>
            {tabValue === 0 
              ? 'Users will appear here once they register on the platform'
              : `${tabValue === 1 ? 'Students' : 'Companies'} will be listed here when they join`
            }
          </Typography>
        </Paper>
      )}

      {/* Render Dialogs */}
      <ProfileDialog />
      <EditDialog />
      <DeleteDialog />

      {/* Enhanced Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: 3,
            fontWeight: 500,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Users;