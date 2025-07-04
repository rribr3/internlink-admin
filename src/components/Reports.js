import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Avatar,
  useTheme,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassIcon,
  Cancel as CancelIcon,
  ChatBubble as ChatIcon,
  Notifications as NotificationsIcon,
  Announcement as AnnouncementIcon,
  TrendingUp as TrendingIcon,
  EmojiEvents as TopIcon,
  Lightbulb as InsightIcon,
  ThumbsUpDown as FeedbackIcon,
  Equalizer as StatsIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  InsertChart as MixedChartIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement, Filler } from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import { alpha } from '@mui/material/styles';
import { database } from '../config/firebase';
import { ref, onValue, off } from 'firebase/database';
import { useGlobalTheme } from '../contexts/GlobalThemeContext';
import { ThemeToggleButton } from './ThemeToggleButton';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
  Filler
);

// Custom styled component wrapper with fixed cursor
const StyledContainer = ({ children, ...props }) => (
  <Box
    {...props}
    sx={{
      ...props.sx,
      '& *': {
        cursor: 'default !important'
      },
      '& button, & .MuiButton-root, & .MuiTab-root, & .MuiChip-root:not([disabled]), & .MuiTableCell-root, & .MuiListItem-root, & [role="button"], & a': {
        cursor: 'pointer !important'
      },
      '& input, & textarea, & .MuiTextField-root input, & .MuiInputBase-input': {
        cursor: 'text !important'
      },
      '& .MuiIconButton-root, & .MuiCheckbox-root, & .MuiRadio-root, & .MuiSwitch-root': {
        cursor: 'pointer !important'
      },
      '& canvas, & svg, & .recharts-wrapper, & .recharts-surface, & .recharts-layer': {
        cursor: 'default !important'
      }
    }}
  >
    {children}
  </Box>
);

const Reports = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({});
  const [isUsingMockData, setIsUsingMockData] = useState(true);

  useEffect(() => {
    // Add global cursor fix styles to document head
    const styleId = 'cursor-fix-styles';
    let existingStyle = document.getElementById(styleId);
    
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Global cursor fix for Reports component */
        .reports-container * {
          cursor: default !important;
        }
        
        .reports-container button,
        .reports-container .MuiButton-root,
        .reports-container .MuiTab-root,
        .reports-container .MuiChip-root:not([disabled]),
        .reports-container .MuiTableCell-root,
        .reports-container .MuiListItem-root,
        .reports-container [role="button"],
        .reports-container a,
        .reports-container .clickable {
          cursor: pointer !important;
        }
        
        .reports-container input,
        .reports-container textarea,
        .reports-container .MuiTextField-root input,
        .reports-container .MuiInputBase-input {
          cursor: text !important;
        }
        
        .reports-container .MuiIconButton-root,
        .reports-container .MuiCheckbox-root,
        .reports-container .MuiRadio-root,
        .reports-container .MuiSwitch-root {
          cursor: pointer !important;
        }
        
        .reports-container canvas,
        .reports-container svg,
        .reports-container .recharts-wrapper,
        .reports-container .recharts-surface,
        .reports-container .recharts-layer {
          cursor: default !important;
        }
        
        .reports-container *:hover,
        .reports-container *:focus,
        .reports-container *:active {
          cursor: inherit !important;
        }
        
        /* Ensure disabled elements maintain default cursor */
        .reports-container [disabled],
        .reports-container .Mui-disabled {
          cursor: default !important;
        }
      `;
      document.head.appendChild(style);
    }

    let dataListeners = [];
    
    const fetchFirebaseData = async () => {
      try {
        let firebaseData = {
          users: { total: 0, companies: 0, students: 0, admins: 0, userMap: {} },
          projects: { total: 0, approved: 0, completed: 0, rejected: 0, categories: {} },
          applications: { total: 0, accepted: 0, shortlisted: 0, pending: 0, rejected: 0 },
          communication: { totalMessages: 0, textMessages: 0, imageMessages: 0, fileMessages: 0, systemMessages: 0, activeChatThreads: 0 },
          userActivity: [],
          topApplicants: [],
          companyActivity: [],
          feedback: { companyFeedback: 0, studentFeedback: 0, averageRating: 0, ratings: [] },
          announcements: { general: 0, company: 0, student: 0 },
          companies: []
        };
        let hasFirebaseData = false;

        // Set up real-time listeners for different data paths
        const setupListener = (path, callback) => {
          const dataRef = ref(database, path);
          const unsubscribe = onValue(dataRef, (snapshot) => {
            if (snapshot.exists()) {
              callback(snapshot.val());
              hasFirebaseData = true;
              setIsUsingMockData(false);
            }
          }, (error) => {
            console.warn(`Firebase listener error for ${path}:`, error);
          });
          dataListeners.push(() => off(dataRef, 'value', unsubscribe));
          return unsubscribe;
        };

        // Listen to users data
        setupListener('users', (users) => {
          const userEntries = Object.entries(users || {});
          const userArray = userEntries.map(([id, user]) => ({ ...user, id }));
          
          const companies = userArray.filter(user => user.role === 'company');
          const students = userArray.filter(user => user.role === 'student');
          const admins = userArray.filter(user => user.role === 'admin');
          
          // Create user map for name lookup
          const userMap = {};
          userArray.forEach(user => {
            userMap[user.id] = user.name || user.companyName || 'Unknown User';
          });
          
          firebaseData.users = {
            total: userArray.length,
            companies: companies.length,
            students: students.length,
            admins: admins.length,
            userMap
          };

          // Store company information
          firebaseData.companies = companies.map(company => ({
            id: company.id,
            name: company.name || company.companyName || 'Unknown Company'
          }));
          
          setData({ ...firebaseData });
        });

        // Listen to projects data
        setupListener('projects', (projects) => {
          const projectArray = Object.values(projects || {});
          const approved = projectArray.filter(p => p.status === 'approved').length;
          const completed = projectArray.filter(p => p.status === 'completed').length;
          const rejected = projectArray.filter(p => p.status === 'rejected').length;
          
          // Count categories
          const categories = {};
          projectArray.forEach(project => {
            if (project.category) {
              categories[project.category] = (categories[project.category] || 0) + 1;
            }
          });

          firebaseData.projects = {
            total: projectArray.length,
            approved,
            completed,
            rejected,
            categories: Object.keys(categories).length > 0 ? categories : { 'No Projects': 0 }
          };
          setData({ ...firebaseData });
        });

        // Listen to applications data
        setupListener('applications', (applications) => {
          const appArray = Object.values(applications || {});
          const accepted = appArray.filter(app => app.status === 'Accepted').length;
          const shortlisted = appArray.filter(app => app.status === 'Shortlisted').length;
          const pending = appArray.filter(app => app.status === 'Pending').length;
          const rejected = appArray.filter(app => app.status === 'Rejected').length;

          // Calculate top applicants with real user names
          const applicantStats = {};
          appArray.forEach(app => {
            if (app.userId) {
              if (!applicantStats[app.userId]) {
                applicantStats[app.userId] = {
                  userId: app.userId,
                  accepted: 0,
                  shortlisted: 0,
                  pending: 0,
                  rejected: 0
                };
              }
              const status = app.status.toLowerCase();
              if (applicantStats[app.userId][status] !== undefined) {
                applicantStats[app.userId][status]++;
              }
            }
          });

          const topApplicants = Object.values(applicantStats)
            .sort((a, b) => (b.accepted + b.shortlisted) - (a.accepted + a.shortlisted))
            .slice(0, 5)
            .map((applicant, index) => {
              const userName = firebaseData.users?.userMap?.[applicant.userId] || `User ${applicant.userId.substring(0, 8)}`;
              return {
                name: userName,
                id: applicant.userId,
                avatar: userName.charAt(0).toUpperCase(),
                accepted: applicant.accepted,
                shortlisted: applicant.shortlisted,
                pending: applicant.pending,
                rejected: applicant.rejected
              };
            });

          firebaseData.applications = {
            total: appArray.length,
            accepted,
            shortlisted,
            pending,
            rejected
          };
          firebaseData.topApplicants = topApplicants;
          setData({ ...firebaseData });
        });

        // Listen to chat metadata for communication stats
        setupListener('chat_metadata', (chatData) => {
          const chatArray = Object.values(chatData || {});
          firebaseData.communication.activeChatThreads = chatArray.length;

          // Calculate company activity from chat metadata
          const companyMessageCount = {};
          chatArray.forEach(chat => {
            if (chat.participants) {
              Object.keys(chat.participants).forEach(participantId => {
                const company = firebaseData.companies?.find(c => c.id === participantId);
                if (company) {
                  companyMessageCount[company.name] = (companyMessageCount[company.name] || 0) + 1;
                }
              });
            }
          });

          const companyActivity = Object.entries(companyMessageCount)
            .map(([name, count]) => ({ name, messages: count }))
            .sort((a, b) => b.messages - a.messages)
            .slice(0, 5);

          firebaseData.companyActivity = companyActivity.length > 0 ? companyActivity : [
            { name: 'No Activity', messages: 0 }
          ];
          
          setData({ ...firebaseData });
        });

        // Listen to chats for message stats
        setupListener('chats', (chats) => {
          let totalMessages = 0;
          let textMessages = 0;
          let imageMessages = 0;
          let fileMessages = 0;
          let systemMessages = 0;

          Object.values(chats || {}).forEach(chat => {
            if (chat.messages) {
              const messages = Object.values(chat.messages);
              totalMessages += messages.length;
              
              messages.forEach(msg => {
                switch (msg.messageType) {
                  case 'text':
                    textMessages++;
                    break;
                  case 'image':
                    imageMessages++;
                    break;
                  case 'file':
                    fileMessages++;
                    break;
                  case 'system':
                    systemMessages++;
                    break;
                  default:
                    textMessages++;
                }
              });
            }
          });

          firebaseData.communication = {
            ...firebaseData.communication,
            totalMessages,
            textMessages,
            imageMessages,
            fileMessages,
            systemMessages
          };
          setData({ ...firebaseData });
        });

        // Listen to user activity data
        setupListener('user_activity', (activity) => {
          const activityArray = Object.entries(activity || {})
            .map(([date, data]) => ({
              date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              count: data.count
            }))
            .slice(-7); // Last 7 days

          firebaseData.userActivity = activityArray;
          setData({ ...firebaseData });
        });

        // Listen to company feedback
        setupListener('company_feedback', (feedback) => {
          const feedbackArray = Object.values(feedback || {});
          const ratings = feedbackArray.map(f => f.rating).filter(r => r !== undefined);
          const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

          firebaseData.feedback.companyFeedback = feedbackArray.length;
          firebaseData.feedback.averageRating = Math.round(averageRating * 10) / 10;
          firebaseData.feedback.ratings = ratings;
          setData({ ...firebaseData });
        });

        // Listen to student feedback
        setupListener('student_feedback', (feedback) => {
          const feedbackArray = Object.values(feedback || {});
          firebaseData.feedback.studentFeedback = feedbackArray.length;
          setData({ ...firebaseData });
        });

        // Listen to announcements
        setupListener('announcements', (announcements) => {
          firebaseData.announcements.general = Object.keys(announcements || {}).length;
          setData({ ...firebaseData });
        });

        setupListener('announcements_by_role', (announcements) => {
          const companyAnnouncements = Object.keys(announcements?.company || {}).length;
          const studentAnnouncements = Object.keys(announcements?.student || {}).length;
          
          firebaseData.announcements.company = companyAnnouncements;
          firebaseData.announcements.student = studentAnnouncements;
          setData({ ...firebaseData });
        });

        // Simulate loading time
        setTimeout(() => {
          setLoading(false);
          if (!hasFirebaseData) {
            setError('No data found in Firebase - displaying empty dashboard');
          }
        }, 2000);

      } catch (error) {
        console.error('Firebase connection error:', error);
        setLoading(false);
        setError('Failed to connect to Firebase - check console for details');
        setIsUsingMockData(true);
      }
    };

    fetchFirebaseData();

    // Cleanup function
    return () => {
      dataListeners.forEach(cleanup => cleanup());
      // Remove the style element when component unmounts
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Default chart options with cursor fixes
  const defaultChartOptions = {
    plugins: {
      tooltip: {
        events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove']
      }
    },
    onHover: (event, activeElements) => {
      // Prevent cursor changes on chart hover
      if (event.native && event.native.target) {
        event.native.target.style.cursor = 'default';
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  // Chart data using the data
  const userDistributionData = {
    labels: ['Companies', 'Students', 'Admins'],
    datasets: [
      {
        data: [data.users?.companies || 0, data.users?.students || 0, data.users?.admins || 0],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.success.main,
          theme.palette.secondary.main
        ],
        borderWidth: 0,
      },
    ],
  };

  const projectStatusData = {
    labels: ['Approved', 'Completed', 'Rejected'],
    datasets: [
      {
        label: 'Projects',
        data: [data.projects?.approved || 0, data.projects?.completed || 0, data.projects?.rejected || 0],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.info.main,
          theme.palette.error.main
        ],
        borderWidth: 0,
      },
    ],
  };

  const projectCategoryData = {
    labels: Object.keys(data.projects?.categories || {}),
    datasets: [
      {
        data: Object.values(data.projects?.categories || {}),
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.warning.main,
          theme.palette.secondary.main,
          theme.palette.error.main,
          theme.palette.info.main
        ],
        borderWidth: 0,
      },
    ],
  };

  const applicationStatusData = {
    labels: ['Accepted', 'Shortlisted', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [
          data.applications?.accepted || 0,
          data.applications?.shortlisted || 0,
          data.applications?.pending || 0,
          data.applications?.rejected || 0
        ],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.info.main,
          theme.palette.error.main
        ],
        borderWidth: 0,
      },
    ],
  };

  const chatActivityData = {
    labels: (data.companyActivity || []).map(company => company.name),
    datasets: [
      {
        label: 'Chat Threads',
        data: (data.companyActivity || []).map(company => company.messages),
        backgroundColor: alpha(theme.palette.primary.main, 0.8),
        borderRadius: 4,
      },
    ],
  };

  const messageTypeData = {
    labels: ['Text', 'Image', 'File', 'System'],
    datasets: [
      {
        data: [
          data.communication?.textMessages || 0,
          data.communication?.imageMessages || 0,
          data.communication?.fileMessages || 0,
          data.communication?.systemMessages || 0
        ],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.error.main,
          theme.palette.success.main,
          theme.palette.warning.main
        ],
        borderWidth: 0,
      },
    ],
  };

  const userActivityData = {
    labels: (data.userActivity || []).map(activity => activity.date),
    datasets: [
      {
        label: 'Active Users',
        data: (data.userActivity || []).map(activity => activity.count),
        fill: true,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderColor: theme.palette.primary.main,
        tension: 0.4,
        pointBackgroundColor: theme.palette.primary.main,
      },
    ],
  };

  // Dynamic insights based on data
  const insights = [
    `Platform has ${data.users?.total || 0} total users with ${data.users?.companies || 0} companies and ${data.users?.students || 0} students actively using the system.`,
    `${data.projects?.completed || 0} projects have been successfully completed out of ${data.projects?.total || 0} total projects, showing a ${Math.round(((data.projects?.completed || 0) / (data.projects?.total || 1)) * 100)}% completion rate.`,
    `Application acceptance rate stands at ${Math.round(((data.applications?.accepted || 0) / (data.applications?.total || 1)) * 100)}%, indicating ${((data.applications?.accepted || 0) / (data.applications?.total || 1)) > 0.3 ? 'good' : 'selective'} hiring standards.`,
    `Communication is active with ${data.communication?.totalMessages || 0} total messages across ${data.communication?.activeChatThreads || 0} chat threads, showing ${data.communication?.totalMessages > 100 ? 'high' : 'moderate'} engagement.`,
    `Feedback system shows ${data.feedback?.averageRating || 0}/5 average rating from ${(data.feedback?.companyFeedback || 0) + (data.feedback?.studentFeedback || 0)} total reviews, indicating ${data.feedback?.averageRating > 4 ? 'excellent' : data.feedback?.averageRating > 3 ? 'good' : 'room for improvement'} satisfaction.`,
    `${(data.announcements?.general || 0) + (data.announcements?.company || 0) + (data.announcements?.student || 0)} announcements have been published, keeping users informed and engaged.`,
    `Top project categories show ${Object.keys(data.projects?.categories || {}).slice(0, 2).join(' and ')} leading demand, indicating strong market focus in these areas.`
  ];

  const recommendations = [
    'Increase student engagement by hosting virtual career fairs and skill-building workshops.',
    'Implement automated project matching based on student skills and company requirements.',
    'Create mentorship programs to improve application success rates.',
    'Develop analytics dashboards for companies to track their recruitment metrics.',
    'Launch feedback collection campaigns to gather more user insights.',
    'Establish partnerships with universities to expand the student user base.',
    'Introduce gamification elements to encourage more active participation.',
    'Implement AI-powered recommendation systems for better project matching.'
  ];

  const getPercentageChange = (current, category) => {
    const changes = {
      users: '+12%',
      companies: '+8%',
      students: '+25%',
      projects: '+15%',
      applications: '+22%',
      messages: '+18%'
    };
    return changes[category] || null;
  };

  const StatCard = ({ icon, title, value, change, color }) => (
    <Card sx={{ 
      height: '100%', 
      boxShadow: 'none', 
      border: `1px solid ${theme.palette.divider}`, 
      borderRadius: 2,
      cursor: 'default !important'
    }}>
      <CardContent sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        cursor: 'default !important' 
      }}>
        <Avatar sx={{ 
          bgcolor: alpha(color, 0.1), 
          color: color, 
          width: 48, 
          height: 48, 
          cursor: 'default !important' 
        }}>
          {React.cloneElement(icon, { fontSize: 'medium' })}
        </Avatar>
        <Box sx={{ cursor: 'default !important' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ cursor: 'default !important' }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, cursor: 'default !important' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, cursor: 'default !important' }}>
              {value}
            </Typography>
            {change && (
              <Chip 
                label={change} 
                size="small" 
                sx={{ 
                  bgcolor: change.startsWith('+') ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                  color: change.startsWith('+') ? theme.palette.success.main : theme.palette.error.main,
                  fontWeight: 500,
                  cursor: 'default !important'
                }} 
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ChartContainer = ({ title, icon, children }) => (
    <Paper sx={{ 
      p: 2, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      cursor: 'default !important',
      '& canvas': { cursor: 'default !important' },
      '& svg': { cursor: 'default !important' }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1, cursor: 'default !important' }}>
        {icon}
        <Typography variant="h6" sx={{ fontWeight: 600, cursor: 'default !important' }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ 
        flex: 1, 
        cursor: 'default !important',
        '& canvas': { cursor: 'default !important' },
        '& svg': { cursor: 'default !important' }
      }}>
        {children}
      </Box>
    </Paper>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading InternLink Analytics...</Typography>
          <Typography variant="body2" color="text.secondary">
            Connecting to Firebase database...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <StyledContainer className="reports-container">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {error && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.contrastText'
            }}>
              <StatsIcon fontSize="large" />
            </Box>
            InternLink Analytics Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {!isUsingMockData ? 'Real-time Analytics' : 'Demo Analytics Dashboard'} | Last updated: {new Date().toLocaleString()}
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          <Tab label="Overview" icon={<MixedChartIcon />} iconPosition="start" />
          <Tab label="Projects" icon={<WorkIcon />} iconPosition="start" />
          <Tab label="Applications" icon={<CheckCircleIcon />} iconPosition="start" />
          <Tab label="Engagement" icon={<TrendingIcon />} iconPosition="start" />
          <Tab label="Insights" icon={<InsightIcon />} iconPosition="start" />
        </Tabs>

        {/* Overview Tab */}
        {tabValue === 0 && (
          <Box>
            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<PeopleIcon />} 
                  title="Total Users" 
                  value={(data.users?.total || 0).toString()} 
                  change={getPercentageChange(data.users?.total, 'users')} 
                  color={theme.palette.primary.main} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<BusinessIcon />} 
                  title="Companies" 
                  value={(data.users?.companies || 0).toString()} 
                  change={getPercentageChange(data.users?.companies, 'companies')} 
                  color={theme.palette.success.main} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<SchoolIcon />} 
                  title="Students" 
                  value={(data.users?.students || 0).toString()} 
                  change={getPercentageChange(data.users?.students, 'students')} 
                  color={theme.palette.secondary.main} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<WorkIcon />} 
                  title="Projects" 
                  value={(data.projects?.total || 0).toString()} 
                  change={getPercentageChange(data.projects?.total, 'projects')} 
                  color={theme.palette.info.main} 
                />
              </Grid>
            </Grid>

            {/* Main Charts */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <ChartContainer title="User Distribution" icon={<PieChartIcon color="primary" />}>
                  <Doughnut 
                    data={userDistributionData} 
                    options={{
                      ...defaultChartOptions,
                      plugins: {
                        ...defaultChartOptions.plugins,
                        legend: { position: 'right' },
                        tooltip: { 
                          callbacks: {
                            label: (context) => {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      },
                      cutout: '70%',
                    }} 
                  />
                </ChartContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartContainer title="User Activity Trend" icon={<TimelineIcon color="primary" />}>
                  <Line 
                    data={userActivityData} 
                    options={{
                      ...defaultChartOptions,
                      plugins: {
                        ...defaultChartOptions.plugins,
                        legend: { display: false }
                      },
                      scales: { 
                        y: { 
                          beginAtZero: true,
                          grid: { color: theme.palette.divider }
                        },
                        x: {
                          grid: { color: theme.palette.divider }
                        }
                      }
                    }} 
                  />
                </ChartContainer>
              </Grid>
            </Grid>

            {/* Secondary Metrics */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <ChartContainer title="Project Status" icon={<BarChartIcon color="primary" />}>
                  <Bar 
                    data={projectStatusData} 
                    options={{
                      ...defaultChartOptions,
                      plugins: {
                        ...defaultChartOptions.plugins,
                        legend: { display: false }
                      },
                      scales: { 
                        y: { 
                          beginAtZero: true,
                          grid: { color: theme.palette.divider }
                        },
                        x: {
                          grid: { display: false }
                        }
                      }
                    }} 
                  />
                </ChartContainer>
              </Grid>
              <Grid item xs={12} md={4}>
                <ChartContainer title="Project Categories" icon={<PieChartIcon color="primary" />}>
                  <Pie 
                    data={projectCategoryData} 
                    options={{
                      ...defaultChartOptions,
                      plugins: {
                        ...defaultChartOptions.plugins,
                        legend: { position: 'right' }
                      }
                    }} 
                  />
                </ChartContainer>
              </Grid>
              <Grid item xs={12} md={4}>
                <ChartContainer title="Application Status" icon={<PieChartIcon color="primary" />}>
                  <Doughnut 
                    data={applicationStatusData} 
                    options={{
                      ...defaultChartOptions,
                      plugins: {
                        ...defaultChartOptions.plugins,
                        legend: { position: 'right' }
                      },
                      cutout: '60%',
                    }} 
                  />
                </ChartContainer>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Projects Tab */}
        {tabValue === 1 && (
          <Box>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <ChartContainer title="Project Categories Distribution" icon={<PieChartIcon color="primary" />}>
                  <Pie 
                    data={projectCategoryData} 
                    options={{
                      ...defaultChartOptions,
                      plugins: {
                        ...defaultChartOptions.plugins,
                        legend: { position: 'bottom' }
                      }
                    }} 
                  />
                </ChartContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartContainer title="Project Status Overview" icon={<BarChartIcon color="primary" />}>
                  <Bar 
                    data={projectStatusData} 
                    options={{
                      ...defaultChartOptions,
                      plugins: {
                        ...defaultChartOptions.plugins,
                        legend: { display: false }
                      },
                      scales: { 
                        y: { 
                          beginAtZero: true,
                          grid: { color: theme.palette.divider }
                        }
                      }
                    }} 
                  />
                </ChartContainer>
              </Grid>
            </Grid>
            
            {/* Project Stats */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<CheckCircleIcon />} 
                  title="Approved" 
                  value={(data.projects?.approved || 0).toString()} 
                  change="+2" 
                  color={theme.palette.success.main} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<CancelIcon />} 
                  title="Rejected" 
                  value={(data.projects?.rejected || 0).toString()} 
                  change="-1" 
                  color={theme.palette.error.main} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<HourglassIcon />} 
                  title="In Progress" 
                  value={((data.projects?.total || 0) - (data.projects?.completed || 0) - (data.projects?.rejected || 0)).toString()} 
                  change="+3" 
                  color={theme.palette.warning.main} 
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Applications Tab */}
        {tabValue === 2 && (
          <Box>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <ChartContainer title="Application Status Distribution" icon={<PieChartIcon color="primary" />}>
                  <Doughnut 
                    data={applicationStatusData} 
                    options={{
                      ...defaultChartOptions,
                      plugins: {
                        ...defaultChartOptions.plugins,
                        legend: { position: 'bottom' }
                      },
                      cutout: '50%',
                    }} 
                  />
                </ChartContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TopIcon color="primary" /> Top Applicants
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell align="center">Accepted</TableCell>
                          <TableCell align="center">Shortlisted</TableCell>
                          <TableCell align="center">Pending</TableCell>
                          <TableCell align="center">Rejected</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(data.topApplicants || []).map((applicant) => (
                          <TableRow key={applicant.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32 }}>{applicant.avatar}</Avatar>
                                {applicant.name}
                              </Box>
                            </TableCell>
                            <TableCell align="center">{applicant.accepted}</TableCell>
                            <TableCell align="center">{applicant.shortlisted}</TableCell>
                            <TableCell align="center">{applicant.pending}</TableCell>
                            <TableCell align="center">{applicant.rejected}</TableCell>
                          </TableRow>
                        ))}
                        {(data.topApplicants || []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                No applicant data available
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Application Stats */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<CheckCircleIcon />} 
                  title="Accepted" 
                  value={(data.applications?.accepted || 0).toString()} 
                  change="+8%" 
                  color={theme.palette.success.main} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<TrendingIcon />} 
                  title="Shortlisted" 
                  value={(data.applications?.shortlisted || 0).toString()} 
                  change="+12%" 
                  color={theme.palette.warning.main} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<HourglassIcon />} 
                  title="Pending" 
                  value={(data.applications?.pending || 0).toString()} 
                  change="-5%" 
                  color={theme.palette.info.main} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<CancelIcon />} 
                  title="Rejected" 
                  value={(data.applications?.rejected || 0).toString()} 
                  change="+3%" 
                  color={theme.palette.error.main} 
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Engagement Tab */}
        {tabValue === 3 && (
          <Box>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <ChartContainer title="Company Chat Activity" icon={<BarChartIcon color="primary" />}>
                  <Bar 
                    data={chatActivityData} 
                    options={{
                      ...defaultChartOptions,
                      plugins: {
                        ...defaultChartOptions.plugins,
                        legend: { display: false }
                      },
                      scales: { 
                        y: { 
                          beginAtZero: true,
                          grid: { color: theme.palette.divider }
                        }
                      }
                    }} 
                  />
                </ChartContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartContainer title="Message Types Distribution" icon={<PieChartIcon color="primary" />}>
                  <Doughnut 
                    data={messageTypeData} 
                    options={{
                      ...defaultChartOptions,
                      plugins: {
                        ...defaultChartOptions.plugins,
                        legend: { position: 'right' }
                      },
                      cutout: '60%',
                    }} 
                  />
                </ChartContainer>
              </Grid>
            </Grid>
            
            {/* Communication Stats */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<ChatIcon />} 
                  title="Total Messages" 
                  value={(data.communication?.totalMessages || 0).toString()} 
                  change={getPercentageChange(data.communication?.totalMessages, 'messages')} 
                  color={theme.palette.primary.main} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<TrendingIcon />} 
                  title="Active Chats" 
                  value={(data.communication?.activeChatThreads || 0).toString()} 
                  change="+15%" 
                  color={theme.palette.success.main} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<FeedbackIcon />} 
                  title="Avg Rating" 
                  value={(data.feedback?.averageRating || 0).toFixed(1)} 
                  change="+0.2" 
                  color={theme.palette.warning.main} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<AnnouncementIcon />} 
                  title="Announcements" 
                  value={((data.announcements?.general || 0) + (data.announcements?.company || 0) + (data.announcements?.student || 0)).toString()} 
                  change="+5" 
                  color={theme.palette.info.main} 
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Insights Tab */}
        {tabValue === 4 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InsightIcon color="primary" /> Key Insights
                  </Typography>
                  <List dense>
                    {insights.map((insight, index) => (
                      <React.Fragment key={index}>
                        <ListItem sx={{ alignItems: 'flex-start' }}>
                          <Box sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            mt: 0.5,
                            flexShrink: 0
                          }}>
                            {index + 1}
                          </Box>
                          <ListItemText primary={insight} />
                        </ListItem>
                        {index < insights.length - 1 && <Divider component="li" sx={{ my: 1 }} />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TopIcon color="primary" /> Strategic Recommendations
                  </Typography>
                  <List dense>
                    {recommendations.map((recommendation, index) => (
                      <React.Fragment key={index}>
                        <ListItem sx={{ alignItems: 'flex-start' }}>
                          <Box sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'success.main',
                            color: 'success.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            mt: 0.5,
                            flexShrink: 0
                          }}>
                            {index + 1}
                          </Box>
                          <ListItemText primary={recommendation} />
                        </ListItem>
                        {index < recommendations.length - 1 && <Divider component="li" sx={{ my: 1 }} />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            InternLink Platform Analytics • {!isUsingMockData ? 'Data' : 'Demo Data'} • Last updated: {new Date().toLocaleString()}
          </Typography>
          <Chip 
            disabled
            label={!isUsingMockData ? "🔴 Live Data" : "📊 Demo Data"} 
            size="small" 
            sx={{ 
              mt: 1,
              bgcolor: alpha(!isUsingMockData ? theme.palette.success.main : theme.palette.info.main, 0.1),
              color: !isUsingMockData ? theme.palette.success.main : theme.palette.info.main,
              fontWeight: 500,
              cursor: 'default !important'
            }} 
          />
        </Box>
      </Container>
    </StyledContainer>
  );
};

export default Reports;