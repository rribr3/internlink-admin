import React, { useState, useEffect } from 'react';
  import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Paper,
    Avatar,
    Chip,
    Rating,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Fade,
    Slide,
    Zoom,
    CircularProgress,
    Alert,
    Badge,
    LinearProgress,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TablePagination,
    Accordion,
    AccordionSummary,
    AccordionDetails
  } from '@mui/material';
  import {
    Feedback as FeedbackIcon,
    Comment as CommentIcon,
    Star as StarIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    FilterList as FilterIcon,
    Search as SearchIcon,
    ExpandMore as ExpandMoreIcon,
    Business as BusinessIcon,
    School as SchoolIcon,
    Person as PersonIcon,
    Schedule as ScheduleIcon,
    Analytics as AnalyticsIcon,
    Insights as InsightsIcon,
    SentimentVeryDissatisfied,
    SentimentDissatisfied,
    SentimentNeutral,
    SentimentSatisfied,
    SentimentVerySatisfied,
    Timeline as TimelineIcon,
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Share as ShareIcon
  } from '@mui/icons-material';
  import { alpha, keyframes } from '@mui/material/styles';
  import { database } from '../config/firebase';
  import { ref, onValue, off } from 'firebase/database';
  import { useGlobalTheme } from '../contexts/GlobalThemeContext';
  import { ThemeToggleButton } from './ThemeToggleButton';

  // Enhanced Animations
  const fadeInUp = keyframes`
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  const bounce = keyframes`
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0, -30px, 0);
    }
    70% {
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  `;

  const pulse = keyframes`
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(161, 110, 255, 0.7);
    }
    70% {
      transform: scale(1.05);
      box-shadow: 0 0 0 10px rgba(161, 110, 255, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(161, 110, 255, 0);
    }
  `;

  const shimmer = keyframes`
    0% { backgroundPosition: 0% 50%; }
    100% { backgroundPosition: 100% 50%; }
  `;

  const glow = keyframes`
    0% { box-shadow: 0 0 5px rgba(161, 110, 255, 0.2); }
    50% { box-shadow: 0 0 20px rgba(161, 110, 255, 0.6); }
    100% { box-shadow: 0 0 5px rgba(161, 110, 255, 0.2); }
  `;

  

  const Feedback = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [companyFeedback, setCompanyFeedback] = useState([]);
    const [studentFeedback, setStudentFeedback] = useState([]);
    const [users, setUsers] = useState({});
    const [projects, setProjects] = useState({});
    const [applications, setApplications] = useState({});
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [filterRating, setFilterRating] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterSentiment, setFilterSentiment] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('timestamp');
    const [sortOrder, setSortOrder] = useState('desc');
    const [expandedAccordion, setExpandedAccordion] = useState(false);

    useEffect(() => {
      let listeners = [];

      const setupListener = (path, callback) => {
        const dataRef = ref(database, path);
        const unsubscribe = onValue(dataRef, (snapshot) => {
          if (snapshot.exists()) {
            callback(snapshot.val());
          }
        }, (error) => {
          console.warn(`Firebase listener error for ${path}:`, error);
          setError(`Failed to load ${path} data`);
        });
        listeners.push(() => off(dataRef, 'value', unsubscribe));
      };

      const fetchData = async () => {
        try {
          // Listen to users data
          setupListener('users', (usersData) => {
            setUsers(usersData || {});
          });

          // Listen to projects data
          setupListener('projects', (projectsData) => {
            setProjects(projectsData || {});
          });

          // Listen to applications data
          setupListener('applications', (applicationsData) => {
            setApplications(applicationsData || {});
          });

          // Listen to company feedback
          setupListener('company_feedback', (feedbackData) => {
            const feedbackArray = Object.entries(feedbackData || {}).map(([id, feedback]) => ({
              id,
              ...feedback,
              type: 'company'
            }));
            setCompanyFeedback(feedbackArray);
          });

          // Listen to student feedback
          setupListener('student_feedback', (feedbackData) => {
            const feedbackArray = Object.entries(feedbackData || {}).map(([id, feedback]) => ({
              id,
              ...feedback,
              type: 'student'
            }));
            setStudentFeedback(feedbackArray);
          });

          setTimeout(() => {
            setLoading(false);
          }, 2500);

        } catch (error) {
          console.error('Error fetching feedback data:', error);
          setError('Failed to load feedback data');
          setLoading(false);
        }
      };

      fetchData();

      return () => {
        listeners.forEach(cleanup => cleanup());
      };
    }, []);

    // Enhanced data processing
    const allFeedback = [...companyFeedback, ...studentFeedback].map(feedback => {
      const user = users[feedback.studentId] || users[feedback.companyId] || {};
      const project = projects[feedback.projectId] || {};
      const sentiment = getSentimentFromRating(feedback.rating);
      
      return {
        ...feedback,
        userName: user.name || user.companyName || 'Anonymous User',
        userEmail: user.email || 'No email',
        userAvatar: user.logoUrl || null,
        userRole: user.role || 'unknown',
        projectName: project.title || 'Unknown Project',
        projectCategory: project.category || 'Uncategorized',
        companyName: feedback.companyName || 'Unknown Company',
        formattedDate: new Date(feedback.timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        formattedTime: new Date(feedback.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        timeAgo: getTimeAgo(feedback.timestamp),
        sentiment
      };
    }).sort((a, b) => b.timestamp - a.timestamp);

    // Enhanced filtering
    const filteredFeedback = allFeedback.filter(feedback => {
      const matchesRating = filterRating === 'all' || feedback.rating == filterRating;
      const matchesType = filterType === 'all' || feedback.type === filterType;
      const matchesSentiment = filterSentiment === 'all' || feedback.sentiment.label.toLowerCase() === filterSentiment;
      const matchesSearch = searchTerm === '' || 
        feedback.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feedback.comment && feedback.comment.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesRating && matchesType && matchesSentiment && matchesSearch;
    });

    // Enhanced statistics
    const stats = {
      totalFeedback: allFeedback.length,
      averageRating: allFeedback.length > 0 ? 
        (allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length).toFixed(1) : 0,
      companyCount: companyFeedback.length,
      studentCount: studentFeedback.length,
      positiveCount: allFeedback.filter(f => f.rating >= 4).length,
      negativeCount: allFeedback.filter(f => f.rating <= 2).length,
      neutralCount: allFeedback.filter(f => f.rating === 3).length,
      ratingDistribution: {
        1: allFeedback.filter(f => f.rating === 1).length,
        2: allFeedback.filter(f => f.rating === 2).length,
        3: allFeedback.filter(f => f.rating === 3).length,
        4: allFeedback.filter(f => f.rating === 4).length,
        5: allFeedback.filter(f => f.rating === 5).length,
      },
      recentFeedback: allFeedback.slice(0, 5),
      topRatedProjects: getTopRatedProjects(),
      feedbackTrends: getFeedbackTrends(),
      satisfactionRate: allFeedback.length > 0 ? 
        Math.round((allFeedback.filter(f => f.rating >= 4).length / allFeedback.length) * 100) : 0
    };

    function getSentimentFromRating(rating) {
      if (rating <= 2) return { 
        label: 'Negative', 
        color: '#f44336', 
        icon: SentimentVeryDissatisfied,
        bgColor: alpha('#f44336', 0.1)
      };
      if (rating === 3) return { 
        label: 'Neutral', 
        color: '#ff9800', 
        icon: SentimentNeutral,
        bgColor: alpha('#ff9800', 0.1)
      };
      return { 
        label: 'Positive', 
        color: '#4caf50', 
        icon: SentimentVerySatisfied,
        bgColor: alpha('#4caf50', 0.1)
      };
    }

    function getTimeAgo(timestamp) {
      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      return 'Just now';
    }

    function getTopRatedProjects() {
      const projectRatings = {};
      allFeedback.forEach(feedback => {
        if (!projectRatings[feedback.projectName]) {
          projectRatings[feedback.projectName] = { 
            name: feedback.projectName, 
            ratings: [], 
            category: feedback.projectCategory 
          };
        }
        projectRatings[feedback.projectName].ratings.push(feedback.rating);
      });

      return Object.values(projectRatings)
        .map(project => ({
          ...project,
          averageRating: project.ratings.reduce((a, b) => a + b, 0) / project.ratings.length,
          totalRatings: project.ratings.length
        }))
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5);
    }

    function getFeedbackTrends() {
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          count: 0,
          averageRating: 0
        };
      }).reverse();

      allFeedback.forEach(feedback => {
        const feedbackDate = new Date(feedback.timestamp).toISOString().split('T')[0];
        const dayData = last30Days.find(day => day.date === feedbackDate);
        if (dayData) {
          dayData.count++;
          dayData.totalRating = (dayData.totalRating || 0) + feedback.rating;
          dayData.averageRating = dayData.totalRating / dayData.count;
        }
      });

      return last30Days;
    }

    const handleRefresh = async () => {
      setRefreshing(true);
      try {
        // Force re-fetch data by updating a state that triggers useEffect
        setError(null);
        setTimeout(() => {
          setRefreshing(false);
        }, 1000);
      } catch (error) {
        console.error('Error refreshing data:', error);
        setError('Failed to refresh data');
        setRefreshing(false);
      }
    };

    const handleViewDetails = (feedback) => {
      setSelectedFeedback(feedback);
      setOpenDetailDialog(true);
    };

    const handleCloseDetailDialog = () => {
      setOpenDetailDialog(false);
    };

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    const handleFilterRatingChange = (event) => {
      setFilterRating(event.target.value);
      setPage(0);
    };

    const handleFilterTypeChange = (event) => {
      setFilterType(event.target.value);
      setPage(0);
    };

    const handleFilterSentimentChange = (event) => {
      setFilterSentiment(event.target.value);
      setPage(0);
    };

    const handleSearchChange = (event) => {
      setSearchTerm(event.target.value);
      setPage(0);
    };

    const handleSort = (property) => {
      const isAsc = sortBy === property && sortOrder === 'asc';
      setSortOrder(isAsc ? 'desc' : 'asc');
      setSortBy(property);
    };

    const handleAccordionChange = () => {
      setExpandedAccordion(!expandedAccordion);
    };

    // Enhanced StatCard component
    const StatCard = ({ 
      title, 
      value, 
      subtitle, 
      icon, 
      gradient, 
      trend, 
      onClick, 
      progress,
      delay = 0 
    }) => (
      <Zoom in timeout={800} style={{ transitionDelay: `${delay}ms` }}>
        <Card 
          onClick={onClick}
          sx={{ 
            height: '100%',
            cursor: onClick ? 'pointer' : 'default',
            borderRadius: 4,
            background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
            color: 'white',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            animation: `${fadeInUp} 0.8s ease-out`,
            '&:hover': { 
              transform: onClick ? 'translateY(-12px) scale(1.03)' : 'translateY(-6px)',
              boxShadow: `0 25px 50px ${gradient.shadow}`,
              animation: `${glow} 1.5s infinite`,
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
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  animation: `${bounce} 3s infinite`,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                {React.cloneElement(icon, { sx: { fontSize: 36, color: 'white' } })}
              </Box>
              {trend && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {trend.startsWith('+') ? 
                    <TrendingUpIcon sx={{ fontSize: 20, color: '#4CAF50' }} /> :
                    <TrendingDownIcon sx={{ fontSize: 20, color: '#f44336' }} />
                  }
                  <Typography variant="body2" sx={{ 
                    color: trend.startsWith('+') ? '#4CAF50' : '#f44336', 
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}>
                    {trend}
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Typography 
              variant="h2" 
              component="div" 
              sx={{ 
                fontWeight: 900,
                mb: 1,
                fontSize: { xs: '2.2rem', sm: '2.8rem' },
                textShadow: '0 4px 8px rgba(0,0,0,0.2)',
                background: 'linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${shimmer} 3s infinite linear`,
                backgroundSize: '200% 100%'
              }}
            >
              {value}
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                opacity: 0.95,
                fontSize: '1.2rem',
                mb: subtitle ? 0.5 : 0,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {title}
            </Typography>

            {subtitle && (
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.8,
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                {subtitle}
              </Typography>
            )}

            {progress !== undefined && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'white',
                      borderRadius: 4,
                      boxShadow: '0 2px 8px rgba(255,255,255,0.3)'
                    }
                  }}
                />
                <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.9, fontWeight: 600 }}>
                  {progress}% Satisfaction Rate
                </Typography>
              </Box>
            )}

            {/* Enhanced decorative elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                opacity: 0.6,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -50,
                left: -50,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.04)',
                opacity: 0.8,
              }}
            />
          </CardContent>
        </Card>
      </Zoom>
    );

    // Enhanced FeedbackCard component
    const FeedbackCard = ({ feedback, delay = 0 }) => {
      const SentimentIcon = feedback.sentiment.icon;
      
      return (
        <Slide direction="up" in timeout={800} style={{ transitionDelay: `${delay}ms` }}>
          <Card 
            onClick={() => handleViewDetails(feedback)}
            sx={{ 
              mb: 3,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha('#f8f9fa', 0.95)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `2px solid ${alpha(feedback.sentiment.color, 0.2)}`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: `0 20px 40px ${alpha(feedback.sentiment.color, 0.25)}`,
                borderColor: feedback.sentiment.color,
                background: `linear-gradient(135deg, ${alpha('#ffffff', 1)} 0%, ${alpha(feedback.sentiment.color, 0.05)} 100%)`,
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                <Avatar 
                  src={feedback.userAvatar} 
                  sx={{ 
                    width: 64, 
                    height: 64,
                    border: `3px solid ${feedback.sentiment.color}`,
                    animation: `${pulse} 3s infinite`,
                    fontSize: '1.5rem',
                    fontWeight: 700
                  }}
                >
                  {feedback.userName.charAt(0)}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.3rem' }}>
                        {feedback.userName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          icon={feedback.type === 'company' ? <BusinessIcon /> : <SchoolIcon />}
                          label={feedback.type === 'company' ? 'Company Review' : 'Student Review'}
                          size="small"
                          sx={{ 
                            backgroundColor: feedback.type === 'company' ? 
                              alpha('#2196F3', 0.15) : alpha('#4CAF50', 0.15),
                            color: feedback.type === 'company' ? '#1976D2' : '#388E3C',
                            fontWeight: 600,
                            borderRadius: 2
                          }}
                        />
                        <Chip 
                          icon={<SentimentIcon />}
                          label={feedback.sentiment.label}
                          size="small"
                          sx={{ 
                            backgroundColor: feedback.sentiment.bgColor,
                            color: feedback.sentiment.color,
                            fontWeight: 600,
                            borderRadius: 2
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ textAlign: 'right' }}>
                      <Rating 
                        value={feedback.rating} 
                        readOnly 
                        size="medium"
                        sx={{ 
                          mb: 1,
                          '& .MuiRating-iconFilled': {
                            color: '#FFD700',
                            filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))'
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 500 }}>
                        {feedback.formattedDate}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {feedback.formattedTime}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                      📂 Project: <span style={{ color: '#1976D2', fontWeight: 700 }}>{feedback.projectName}</span>
                    </Typography>
                    {feedback.companyName && feedback.companyName !== 'Unknown Company' && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        🏢 Company: <span style={{ color: '#388E3C', fontWeight: 700 }}>{feedback.companyName}</span>
                      </Typography>
                    )}
                  </Box>
                  
                  {feedback.comment && (
                    <Paper 
                      sx={{ 
                        p: 3, 
                        mt: 2,
                        backgroundColor: feedback.sentiment.bgColor,
                        border: `1px solid ${alpha(feedback.sentiment.color, 0.2)}`,
                        borderRadius: 3,
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -8,
                          left: 20,
                          width: 0,
                          height: 0,
                          borderLeft: '8px solid transparent',
                          borderRight: '8px solid transparent',
                          borderBottom: `8px solid ${feedback.sentiment.bgColor}`,
                        }
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontStyle: 'italic', 
                          lineHeight: 1.8,
                          fontSize: '1.05rem',
                          color: '#333',
                          fontWeight: 500,
                         
                        }}
                      >
                        {feedback.comment}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Slide>
      );
    };

    // Feedback Detail Dialog
    const FeedbackDetailDialog = () => {
      if (!selectedFeedback) return null;
      
      const SentimentIcon = selectedFeedback.sentiment.icon;
      
      return (
        <Dialog
          open={openDetailDialog}
          onClose={handleCloseDetailDialog}
          maxWidth="md"
          fullWidth
          TransitionComponent={Fade}
        >
          <DialogTitle sx={{ 
            backgroundColor: selectedFeedback.sentiment.bgColor,
            borderBottom: `1px solid ${alpha(selectedFeedback.sentiment.color, 0.2)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: alpha(selectedFeedback.sentiment.color, 0.2)
            }}>
              <SentimentIcon sx={{ color: selectedFeedback.sentiment.color }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Feedback Details
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  textAlign: 'center',
                  mb: 4
                }}>
                  <Avatar 
                    src={selectedFeedback.userAvatar} 
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mb: 3,
                      border: `4px solid ${selectedFeedback.sentiment.color}`,
                      boxShadow: `0 8px 24px ${alpha(selectedFeedback.sentiment.color, 0.3)}`
                    }}
                  >
                    {selectedFeedback.userName.charAt(0)}
                  </Avatar>
                  
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    {selectedFeedback.userName}
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedFeedback.userEmail}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Chip 
                      disabled
                      icon={selectedFeedback.type === 'company' ? <BusinessIcon /> : <SchoolIcon />}
                      label={selectedFeedback.type === 'company' ? 'Company' : 'Student'}
                      size="medium"
                      sx={{ 
                        backgroundColor: selectedFeedback.type === 'company' ? 
                          alpha('#2196F3', 0.15) : alpha('#4CAF50', 0.15),
                        color: selectedFeedback.type === 'company' ? '#1976D2' : '#388E3C',
                        fontWeight: 600,
                        borderRadius: 2
                      }}
                    />
                    <Chip 
                      disabled
                      icon={<SentimentIcon />}
                      label={selectedFeedback.sentiment.label}
                      size="medium"
                      sx={{ 
                        backgroundColor: selectedFeedback.sentiment.bgColor,
                        color: selectedFeedback.sentiment.color,
                        fontWeight: 600,
                        borderRadius: 2
                      }}
                    />
                  </Box>
                  
                  <Rating 
                    value={selectedFeedback.rating} 
                    readOnly 
                    size="large"
                    sx={{ 
                      mb: 2,
                      '& .MuiRating-iconFilled': {
                        color: '#FFD700',
                        filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))'
                      }
                    }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <ScheduleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    {selectedFeedback.formattedDate} at {selectedFeedback.formattedTime}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Project Information
                  </Typography>
                  
                  <Box sx={{ 
                    backgroundColor: alpha('#1976D2', 0.08),
                    borderRadius: 3,
                    p: 3,
                    mb: 3,
                    borderLeft: `4px solid #1976D2`
                  }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      📂 {selectedFeedback.projectName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Category: {selectedFeedback.projectCategory}
                    </Typography>
                  </Box>
                  
                  {selectedFeedback.companyName && selectedFeedback.companyName !== 'Unknown Company' && (
                    <Box sx={{ 
                      backgroundColor: alpha('#388E3C', 0.08),
                      borderRadius: 3,
                      p: 3,
                      mb: 3,
                      borderLeft: `4px solid #388E3C`
                    }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                        🏢 {selectedFeedback.companyName}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {selectedFeedback.comment && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Feedback Comment
                    </Typography>
                    
                    <Paper 
                      sx={{ 
                        p: 3,
                        backgroundColor: selectedFeedback.sentiment.bgColor,
                        border: `1px solid ${alpha(selectedFeedback.sentiment.color, 0.2)}`,
                        borderRadius: 3,
                        position: 'relative',
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          lineHeight: 1.8,
                          fontSize: '1.1rem',
                          color: '#333',
                          fontWeight: 500
                        }}
                      >
                        {selectedFeedback.comment}
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Additional Details
                  </Typography>
                  
                  <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Feedback Type</TableCell>
                          <TableCell>
                            {selectedFeedback.type === 'company' ? 'Company Review' : 'Student Review'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Sentiment</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SentimentIcon sx={{ color: selectedFeedback.sentiment.color }} />
                              <span>{selectedFeedback.sentiment.label}</span>
                            </Box>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating value={selectedFeedback.rating} readOnly size="small" />
                              <span>({selectedFeedback.rating}/5)</span>
                            </Box>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
                          <TableCell>
                            {selectedFeedback.timeAgo} ({selectedFeedback.formattedDate})
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            p: 3,
            borderTop: `1px solid ${alpha('#ddd', 0.5)}`
          }}>
            <Button 
              onClick={handleCloseDetailDialog}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      );
    };

    if (loading) {
      return (
        <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 4 }}>
              <CircularProgress 
                size={100} 
                thickness={4}
                sx={{ 
                  color: '#A16EFF',
                  animation: `${pulse} 2s infinite ease-in-out`,
                }} 
              />
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}>
                <FeedbackIcon sx={{ fontSize: 40, color: '#A16EFF' }} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ color: '#A16EFF', fontWeight: 800, mb: 2 }}>
              Loading Feedback Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Fetching user reviews and testimonials from Firebase...
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#A16EFF',
                    animation: `${pulse} 1.4s infinite ease-in-out`,
                    animationDelay: `${i * 0.16}s`
                  }}
                />
              ))}
            </Box>
          </Box>
        </Container>
      );
    }

    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Enhanced Header */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 5, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #A16EFF 0%, #B39DDB 30%, #E1BEE7 60%, #F3E5F5 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2,
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                    letterSpacing: '-0.02em',
                    animation: `${shimmer} 4s infinite linear`,
                    backgroundSize: '200% 100%',
                  }}
                > 
                  Feedback Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, fontSize: '1.2rem', lineHeight: 1.8 }}>
                  Get insights into user feedback and sentiment analysis.
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Tooltip title="Refresh Data">
                  <IconButton
                    onClick={handleRefresh}
                    sx={{
                      backgroundColor: '#A16EFF',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#8A5AE5',
                        animation: `${pulse} 2s infinite`
                      }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {/* Stats Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Feedback"
                  value={stats.totalFeedback}
                  subtitle="All feedback received"
                  icon={<FeedbackIcon />}
                  gradient={{
                    from: '#A16EFF',
                    to: '#5E35B1',
                    shadow: alpha('#A16EFF', 0.4)
                  }}
                  trend={stats.totalFeedback > 0 ? '+12%' : null}
                  delay={100}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Average Rating"
                  value={stats.averageRating}
                  subtitle="Out of 5 stars"
                  icon={<StarIcon />}
                  gradient={{
                    from: '#FF9800',
                    to: '#F57C00',
                    shadow: alpha('#FF9800', 0.4)
                  }}
                  progress={stats.averageRating * 20}
                  delay={200}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Company Feedback"
                  value={stats.companyCount}
                  subtitle="From companies"
                  icon={<BusinessIcon />}
                  gradient={{
                    from: '#2196F3',
                    to: '#1565C0',
                    shadow: alpha('#2196F3', 0.4)
                  }}
                  delay={300}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Student Feedback"
                  value={stats.studentCount}
                  subtitle="From students"
                  icon={<SchoolIcon />}
                  gradient={{
                    from: '#4CAF50',
                    to: '#2E7D32',
                    shadow: alpha('#4CAF50', 0.4)
                  }}
                  delay={400}
                />
              </Grid>
            </Grid>
          </Box>
        </Fade>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Left Column - Feedback List */}
          <Grid item xs={12} md={8}>
            <Fade in timeout={800}>
              <Card sx={{ 
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                mb: 4,
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  p: 3,
                  backgroundColor: '#F5F5F7',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Recent Feedback
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      size="small"
                      placeholder="Search feedback..."
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                        sx: { borderRadius: 3 }
                      }}
                      value={searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 200 }}
                    />
                    
                    <Tooltip title="Filter Options">
                      <IconButton
                        onClick={handleAccordionChange}
                        sx={{
                          backgroundColor: expandedAccordion ? alpha('#A16EFF', 0.1) : 'transparent',
                          color: expandedAccordion ? '#A16EFF' : 'text.secondary',
                          borderRadius: 2
                        }}
                      >
                        <FilterIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Accordion 
                  expanded={expandedAccordion}
                  elevation={0}
                  sx={{
                    backgroundColor: '#F9F9FA',
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ minHeight: '48px !important', height: 48, display: 'none' }}
                  />
                  <AccordionDetails sx={{ pt: 0, pb: 3, px: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Rating</InputLabel>
                          <Select
                            value={filterRating}
                            onChange={handleFilterRatingChange}
                            label="Rating"
                            sx={{ borderRadius: 3 }}
                          >
                            <MenuItem value="all">All Ratings</MenuItem>
                            <MenuItem value="5">5 Stars</MenuItem>
                            <MenuItem value="4">4 Stars</MenuItem>
                            <MenuItem value="3">3 Stars</MenuItem>
                            <MenuItem value="2">2 Stars</MenuItem>
                            <MenuItem value="1">1 Star</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={filterType}
                            onChange={handleFilterTypeChange}
                            label="Type"
                            sx={{ borderRadius: 3 }}
                          >
                            <MenuItem value="all">All Types</MenuItem>
                            <MenuItem value="company">Company Feedback</MenuItem>
                            <MenuItem value="student">Student Feedback</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Sentiment</InputLabel>
                          <Select
                            value={filterSentiment}
                            onChange={handleFilterSentimentChange}
                            label="Sentiment"
                            sx={{ borderRadius: 3 }}
                          >
                            <MenuItem value="all">All Sentiments</MenuItem>
                            <MenuItem value="positive">Positive</MenuItem>
                            <MenuItem value="neutral">Neutral</MenuItem>
                            <MenuItem value="negative">Negative</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
                
                <Box sx={{ p: 3 }}>
                  {filteredFeedback.length === 0 ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      py: 8,
                      textAlign: 'center'
                    }}>
                      <FeedbackIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No feedback found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your filters or search term
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {filteredFeedback
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((feedback, index) => (
                          <FeedbackCard 
                            key={feedback.id} 
                            feedback={feedback} 
                            delay={index * 100}
                          />
                        ))
                      }
                      
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredFeedback.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{ 
                          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                          pt: 2
                        }}
                      />
                    </>
                  )}
                </Box>
              </Card>
            </Fade>
          </Grid>
          
          {/* Right Column - Analytics */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={800} style={{ transitionDelay: '300ms' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Rating Distribution */}
                <Card sx={{ 
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    p: 3,
                    backgroundColor: '#F5F5F7',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      Rating Distribution
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = stats.ratingDistribution[rating] || 0;
                        const percentage = stats.totalFeedback > 0 ? 
                          Math.round((count / stats.totalFeedback) * 100) : 0;
                        
                        return (
                          <Box key={rating} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Rating value={rating} readOnly size="small" />
                              <Typography variant="body2" sx={{ ml: 1, minWidth: 40 }}>
                                ({count})
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={percentage}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: alpha('#A16EFF', 0.1),
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: 
                                    rating >= 4 ? '#4CAF50' : 
                                    rating === 3 ? '#FF9800' : '#F44336',
                                  borderRadius: 4
                                }
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#4CAF50' }}>
                            {stats.positiveCount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Positive
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#FF9800' }}>
                            {stats.neutralCount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Neutral
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#F44336' }}>
                            {stats.negativeCount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Negative
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
                
                {/* Top Rated Projects */}
                <Card sx={{ 
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    p: 3,
                    backgroundColor: '#F5F5F7',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      Top Rated Projects
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <List sx={{ py: 0 }}>
                      {stats.topRatedProjects.map((project, index) => (
                        <ListItem 
                          key={index} 
                          sx={{ 
                            px: 0,
                            py: 2,
                            borderBottom: index < stats.topRatedProjects.length - 1 ? 
                              '1px solid rgba(0, 0, 0, 0.05)' : 'none'
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar 
                              sx={{ 
                                backgroundColor: alpha('#A16EFF', 0.1),
                                color: '#A16EFF',
                                fontWeight: 700
                              }}
                            >
                              {index + 1}
                            </Avatar>
                          </ListItemAvatar>
                          
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {project.name}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                  <Rating 
                                    value={project.averageRating} 
                                    precision={0.1} 
                                    readOnly 
                                    size="small" 
                                    sx={{ mr: 1 }}
                                  />
                                  <Typography variant="body2" color="text.secondary">
                                    {project.averageRating.toFixed(1)} ({project.totalRatings})
                                  </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {project.category}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Card>
                
                {/* Recent Activity */}
                <Card sx={{ 
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    p: 3,
                    backgroundColor: '#F5F5F7',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      Recent Activity
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <List sx={{ py: 0 }}>
                      {stats.recentFeedback.map((feedback, index) => {
                        const SentimentIcon = feedback.sentiment.icon;
                        
                        return (
                          <ListItem 
                            key={index} 
                            sx={{ 
                              px: 0,
                              py: 2,
                              borderBottom: index < stats.recentFeedback.length - 1 ? 
                                '1px solid rgba(0, 0, 0, 0.05)' : 'none'
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar 
                                src={feedback.userAvatar}
                                sx={{ 
                                  backgroundColor: feedback.sentiment.bgColor,
                                  color: feedback.sentiment.color
                                }}
                              >
                                {feedback.userName.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {feedback.userName}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <SentimentIcon sx={{ 
                                      fontSize: 16, 
                                      color: feedback.sentiment.color,
                                      mr: 0.5
                                    }} />
                                    <Typography variant="body2" color="text.secondary">
                                      Rated {feedback.projectName}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {feedback.timeAgo}
                                  </Typography>
                                </>
                              }
                            />
                            
                            <Rating 
                              value={feedback.rating} 
                              readOnly 
                              size="small" 
                              sx={{ ml: 2 }}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                </Card>
              </Box>
            </Fade>
          </Grid>
        </Grid>
        
        {/* Feedback Detail Dialog */}
        <FeedbackDetailDialog />
      </Container>
    );
  };

  export default Feedback;