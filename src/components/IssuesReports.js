// src/pages/IssuesReports.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Avatar,
  Divider,
  Paper,
  Tab,
  Tabs,
  Badge,
  Tooltip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ButtonGroup,
  Stack,
  Snackbar,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress
} from '@mui/material';
import {
  Report as ReportIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Visibility as VisibilityIcon,
  PriorityHigh as HighPriorityIcon,
  Schedule as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Comment as CommentIcon,
  Block as BlockIcon,
  Gavel as BanIcon,
  Message as MessageIcon,
  BugReport as BugIcon,
  RequestPage as FeatureIcon,
  Security as SecurityIcon,
  Description as DocumentationIcon,
  Upgrade as EnhancementIcon,
  Help as QuestionIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  Analytics as AnalyticsIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../config/firebase';
import { ref, onValue, push, update, set, get, query, orderByChild, equalTo, off } from 'firebase/database';

const IssuesReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [chatHistoryDialog, setChatHistoryDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionType, setActionType] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [actionSeverity, setActionSeverity] = useState('medium');
  const [banDuration, setBanDuration] = useState(7);
  const [warningTarget, setWarningTarget] = useState('reported');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [chatHistory, setChatHistory] = useState([]);
  const [reportHistory, setReportHistory] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [topCompanies, setTopCompanies] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const { currentUser } = useAuth();

  // Analytics Functions
  const getTopReportedCompanies = () => {
    const companyReports = {};
    reports.forEach(report => {
      if (users[report.reportedUserId]?.role === 'company') {
        const companyName = report.reportedUserName || 'Unknown Company';
        const companyId = report.reportedUserId;
        const key = `${companyName}_${companyId}`;
        companyReports[key] = {
          name: companyName,
          id: companyId,
          count: (companyReports[key]?.count || 0) + 1,
          status: users[companyId]?.status || 'active'
        };
      }
    });
    return Object.values(companyReports)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getTopReportedStudents = () => {
    const studentReports = {};
    reports.forEach(report => {
      if (users[report.reportedUserId]?.role === 'student') {
        const studentName = report.reportedUserName || 'Unknown Student';
        const studentId = report.reportedUserId;
        const key = `${studentName}_${studentId}`;
        studentReports[key] = {
          name: studentName,
          id: studentId,
          count: (studentReports[key]?.count || 0) + 1,
          status: users[studentId]?.status || 'active'
        };
      }
    });
    return Object.values(studentReports)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  // Fetch reports from Firebase
  useEffect(() => {
    const reportsRef = ref(database, 'issues');
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      if (snapshot.exists()) {
        const reportsData = snapshot.val();
        const reportsArray = [];
        
        // Handle nested structure: issues -> chatId -> reportId -> reportData
        Object.keys(reportsData).forEach(chatId => {
          const chatReports = reportsData[chatId];
          Object.keys(chatReports).forEach(reportId => {
            const report = chatReports[reportId];
            reportsArray.push({
              id: reportId,
              chatId: chatId,
              ...report,
              priority: determinePriority(report),
              category: determineCategory(report.description),
              // Normalize status - convert 'open' to 'pending'
              status: report.status === 'open' ? 'pending' : (report.status || 'pending')
            });
          });
        });
        
        // Sort by timestamp (newest first)
        reportsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setReports(reportsArray);
        setFilteredReports(reportsArray);
      } else {
        setReports([]);
        setFilteredReports([]);
      }
      setLoading(false);
    });

    return () => off(reportsRef, 'value', unsubscribe);
  }, []);

  // Fetch users data
  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        setUsers(snapshot.val());
      }
    });

    return () => off(usersRef, 'value', unsubscribe);
  }, []);

  // Update analytics data when reports or users change
  useEffect(() => {
    if (reports.length > 0 && Object.keys(users).length > 0) {
      setTopCompanies(getTopReportedCompanies());
      setTopStudents(getTopReportedStudents());
    }
  }, [reports, users]);

  // Get user details
  const getUserDetails = async (userId) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return {
          id: userId,
          ...snapshot.val()
        };
      }
      return { id: userId, name: 'Unknown User', email: 'unknown@email.com' };
    } catch (error) {
      console.error('Error getting user details:', error);
      return { id: userId, name: 'Unknown User', email: 'unknown@email.com' };
    }
  };

  // Determine priority based on content and user history
  const determinePriority = (report) => {
    if (!report.description || typeof report.description !== 'string') {
      return 'medium'; // Default priority
    }
    
    const description = report.description.toLowerCase();
    const highPriorityKeywords = ['harassment', 'abuse', 'fraud', 'threat', 'unsafe', 'security', 'vulnerability'];
    const mediumPriorityKeywords = ['unprofessional', 'disrespectful', 'late', 'unresponsive', 'bug', 'error'];
    
    if (highPriorityKeywords.some(keyword => description.includes(keyword))) {
      return 'high';
    } else if (mediumPriorityKeywords.some(keyword => description.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  };

  // Add this useEffect to handle URL parameters for opening issue details
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const issueId = urlParams.get('issueId');
    
    if (issueId && reports.length > 0) {
      // Find the issue report from reports array
      const issueReport = reports.find(report => report.id === issueId);
      
      if (issueReport) {
        // Open the details dialog with this issue
        handleViewDetails(issueReport);
        
        // Optional: Clear the URL parameters after opening
        if (window.history.replaceState) {
          const url = new URL(window.location);
          url.searchParams.delete('issueId');
          window.history.replaceState({}, '', url);
        }
      }
    }
  }, [reports]);

  // Determine category based on description - Updated categories
  const determineCategory = (description) => {
    if (!description || typeof description !== 'string') {
      return 'question'; // Default category
    }
    
    const desc = description.toLowerCase();
    if (desc.includes('bug') || desc.includes('error') || desc.includes('crash') || desc.includes('broken') || desc.includes('not working')) return 'bug';
    if (desc.includes('feature') || desc.includes('request') || desc.includes('add') || desc.includes('new') || desc.includes('suggestion')) return 'feature_request';
    if (desc.includes('question') || desc.includes('how') || desc.includes('why') || desc.includes('help') || desc.includes('support')) return 'question';
    if (desc.includes('enhancement') || desc.includes('improve') || desc.includes('better') || desc.includes('optimize') || desc.includes('upgrade')) return 'enhancement';
    if (desc.includes('documentation') || desc.includes('docs') || desc.includes('manual') || desc.includes('guide') || desc.includes('tutorial')) return 'documentation';
    if (desc.includes('security') || desc.includes('password') || desc.includes('auth') || desc.includes('vulnerability') || desc.includes('breach')) return 'security';
    return 'question';
  };

  // Get chat history
  const getChatHistory = async (chatId) => {
    try {
      const chatRef = ref(database, `chats/${chatId}/messages`);
      const snapshot = await get(chatRef);
      
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messages = Object.keys(messagesData).map(key => ({
          id: key,
          ...messagesData[key]
        }));
        
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        return messages;
      }
      return [];
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  };

  // Get user report history
  const getUserReportHistory = async (userId) => {
    try {
      const reportsRef = ref(database, 'issues');
      const snapshot = await get(reportsRef);
      
      if (snapshot.exists()) {
        const allReportsData = snapshot.val();
        const userReports = [];
        
        // Handle nested structure
        Object.keys(allReportsData).forEach(chatId => {
          const chatReports = allReportsData[chatId];
          Object.keys(chatReports).forEach(reportId => {
            const report = chatReports[reportId];
            if (report.createdBy === userId || report.reportedUserId === userId) {
              userReports.push({ id: reportId, chatId, ...report });
            }
          });
        });
        
        return userReports;
      }
      return [];
    } catch (error) {
      console.error('Error getting user report history:', error);
      return [];
    }
  };

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, priorityFilter, typeFilter, selectedTab]);

  const filterReports = () => {
    let filtered = [...reports];

    // Filter by tab (only for non-analytics tabs)
    if (selectedTab === 1) {
      // Show reports where creator is a company (has company role)
      filtered = filtered.filter(report => 
        users[report.createdBy]?.role === 'company'
      );
    } else if (selectedTab === 2) {
      // Show reports where creator is a student
      filtered = filtered.filter(report => 
        users[report.createdBy]?.role === 'student'
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(report =>
        (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.creatorName && report.creatorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.reportedUserName && report.reportedUserName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.id && report.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.type && report.type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => (report.status || 'pending') === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(report => report.priority === priorityFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.category === typeFilter);
    }

    setFilteredReports(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'resolved': return '#4caf50';
      case 'dismissed': return '#757575';
      default: return '#ff9800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <PendingIcon />;
      case 'resolved': return <CheckCircleIcon />;
      case 'dismissed': return <CancelIcon />;
      default: return <PendingIcon />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'resolved': return 'Resolved';
      case 'dismissed': return 'Dismissed';
      default: return 'Pending';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      case 'critical': return '#9c27b0';
      default: return '#757575';
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'bug': return <BugIcon sx={{ color: '#f44336' }} />;
      case 'feature_request': return <FeatureIcon sx={{ color: '#2196f3' }} />;
      case 'question': return <QuestionIcon sx={{ color: '#ff9800' }} />;
      case 'enhancement': return <EnhancementIcon sx={{ color: '#9c27b0' }} />;
      case 'documentation': return <DocumentationIcon sx={{ color: '#4caf50' }} />;
      case 'security': return <SecurityIcon sx={{ color: '#f44336' }} />;
      default: return <ReportIcon sx={{ color: '#757575' }} />;
    }
  };

  // Generate professional report title
  const generateReportTitle = (report) => {
    const fromName = report.creatorName || 'Unknown User';
    const toName = report.reportedUserName || 'Unknown User';
    const categoryLabels = {
      bug: 'Bug Report',
      feature_request: 'Feature Request',
      question: 'Question',
      enhancement: 'Enhancement',
      documentation: 'Documentation',
      security: 'Security Issue'
    };
    const typeLabel = categoryLabels[report.category] || 'Issue Report';
    
    return `${typeLabel}: ${fromName} → ${toName}`;
  };

  const handleViewDetails = async (report) => {
    setSelectedReport(report);
    
    // Get chat history if available
    if (report.chatId) {
      const history = await getChatHistory(report.chatId);
      setChatHistory(history);
    }
    
    // Get user report history
    const [creatorHistory, reportedHistory] = await Promise.all([
      getUserReportHistory(report.createdBy),
      getUserReportHistory(report.reportedUserId)
    ]);
    
    setReportHistory({
      creator: creatorHistory,
      reported: reportedHistory
    });
    
    setDialogOpen(true);
  };

  const handleTakeAction = (report, action = '') => {
    setSelectedReport(report);
    setActionType(action);
    setWarningTarget('reported');
    setActionDialogOpen(true);
  };

  const handleStatusChange = async (report, newStatus) => {
    try {
      await update(ref(database), {
        [`issues/${report.chatId}/${report.id}/status`]: newStatus,
        [`issues/${report.chatId}/${report.id}/lastUpdated`]: new Date().toISOString()
      });
      
      setSnackbar({
        open: true,
        message: `Report status updated to ${getStatusLabel(newStatus)}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({
        open: true,
        message: 'Error updating status. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleSubmitAction = async () => {
    if (!actionType) {
      setSnackbar({
        open: true,
        message: 'Please select an action type',
        severity: 'error'
      });
      return;
    }

    // Only require notes for warning actions
    if (actionType === 'warn_user' && !actionNotes.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide notes for warning action',
        severity: 'error'
      });
      return;
    }

    try {
      const actionId = push(ref(database, 'reportActions')).key;
      const timestamp = new Date().toISOString();

      // Create enhanced action record with comprehensive details
      const action = {
        id: actionId,
        reportId: selectedReport.id,
        chatId: selectedReport.chatId,
        actionType,
        actionDescription: getActionDescription(actionType),
        notes: actionNotes,
        severity: actionSeverity,
        takenBy: currentUser.uid,
        takenByName: currentUser.displayName || currentUser.email,
        takenByRole: 'admin',
        targetUserId: actionType === 'warn_user' && warningTarget === 'reporter' ? selectedReport.createdBy : selectedReport.reportedUserId,
        targetUserName: actionType === 'warn_user' && warningTarget === 'reporter' ? selectedReport.creatorName : selectedReport.reportedUserName,
        targetUserRole: actionType === 'warn_user' && warningTarget === 'reporter' ? users[selectedReport.createdBy]?.role : users[selectedReport.reportedUserId]?.role,
        warningTarget: actionType === 'warn_user' ? warningTarget : null,
        reporterId: selectedReport.createdBy,
        reporterName: selectedReport.creatorName,
        reporterRole: users[selectedReport.createdBy]?.role || 'unknown',
        timestamp: timestamp,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        banDuration: actionType === 'ban_user' ? banDuration : null,
        previousStatus: selectedReport.status || 'pending',
        newStatus: getNewStatus(actionType)
      };

      // Save action to reportActions
      await set(ref(database, `reportActions/${actionId}`), action);

      // Update report status and add action reference
      const reportUpdates = {
        [`issues/${selectedReport.chatId}/${selectedReport.id}/status`]: getNewStatus(actionType),
        [`issues/${selectedReport.chatId}/${selectedReport.id}/lastAction`]: actionType,
        [`issues/${selectedReport.chatId}/${selectedReport.id}/lastActionTimestamp`]: timestamp,
        [`issues/${selectedReport.chatId}/${selectedReport.id}/lastActionBy`]: currentUser.uid
      };

      // Handle specific actions
      switch (actionType) {
        case 'warn_user':
          const warningUserId = warningTarget === 'reporter' ? selectedReport.createdBy : selectedReport.reportedUserId;
          await updateUserWarnings(warningUserId);
          await sendWarningNotification(selectedReport, warningTarget);
          // REMOVED DUPLICATE: await saveWarningAnnouncement(selectedReport, warningTarget);
          reportUpdates[`issues/${selectedReport.chatId}/${selectedReport.id}/resolution`] = actionNotes.trim() || `Warning sent to ${warningTarget === 'reporter' ? 'reporter' : 'reported user'}`;
          break;
          
        case 'ban_user':
          await deactivateUser(selectedReport.reportedUserId);
          reportUpdates[`issues/${selectedReport.chatId}/${selectedReport.id}/resolution`] = actionNotes.trim() || `User account deactivated for ${banDuration} days`;
          await sendBanNotification(selectedReport);
          break;
          
        case 'resolve_report':
          reportUpdates[`issues/${selectedReport.chatId}/${selectedReport.id}/resolution`] = actionNotes.trim() || 'Report resolved by administrator';
          await sendResolutionNotification(selectedReport);
          await saveResolvedAnnouncement(selectedReport);
          break;

        case 'dismiss_report':
          reportUpdates[`issues/${selectedReport.chatId}/${selectedReport.id}/resolution`] = actionNotes.trim() || 'Report dismissed after review';
          await sendDismissalNotification(selectedReport);
          await saveDismissedAnnouncement(selectedReport);
          break;
      }

      // Apply updates
      await update(ref(database), reportUpdates);

      setSnackbar({
        open: true,
        message: 'Action taken successfully',
        severity: 'success'
      });

      setActionDialogOpen(false);
      setActionNotes('');
      setActionType('');
      setWarningTarget('reported');
      
    } catch (error) {
      console.error('Error taking action:', error);
      setSnackbar({
        open: true,
        message: 'Error taking action. Please try again.',
        severity: 'error'
      });
    }
  };

  const getNewStatus = (actionType) => {
    switch (actionType) {
      case 'warn_user':
        return 'resolved';
      case 'ban_user':
      case 'resolve_report':
        return 'resolved';
      case 'dismiss_report':
        return 'dismissed';
      default:
        return 'under_review';
    }
  };

  // Get action description for database record
  const getActionDescription = (actionType) => {
    switch (actionType) {
      case 'warn_user':
        return 'Warning sent to user for policy violation';
      case 'ban_user':
        return `User account deactivated for ${banDuration} days`;
      case 'resolve_report':
        return 'Report marked as resolved by administrator';
      case 'dismiss_report':
        return 'Report dismissed after review';
      default:
        return 'Action taken on report';
    }
  };

  const updateUserWarnings = async (userId) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const currentWarnings = userData.warnings || 0;
        
        await update(userRef, {
          warnings: currentWarnings + 1,
          lastWarning: new Date().toISOString(),
          status: currentWarnings >= 2 ? 'flagged' : userData.status
        });
      }
    } catch (error) {
      console.error('Error updating warnings:', error);
    }
  };

  // Save warning as announcement by role
  const saveWarningAnnouncement = async (report, warningTarget) => {
    try {
      const targetUserId = warningTarget === 'reporter' ? report.createdBy : report.reportedUserId;
      const targetUserName = warningTarget === 'reporter' ? report.creatorName : report.reportedUserName;
      const targetUserRole = users[targetUserId]?.role || 'student';
      const announcementId = push(ref(database, `announcements_by_role/${targetUserRole}`)).key;
      
      const announcement = {
        id: announcementId,
        title: 'Warning Notice',
        message: warningTarget === 'reporter' 
          ? `You have received a warning regarding your report. ${actionNotes || 'Please ensure all reports are submitted in good faith and with accurate information.'}`
          : `You have received a warning regarding your behavior in the system. ${actionNotes || 'Please review our community guidelines and maintain professional conduct.'}`,
        type: 'new_issue',
        issueId: report.id,
        severity: 'warning',
        targetUserId: targetUserId,
        targetUserName: targetUserName,
        reportId: report.id,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString(),
        isRead: false,
        priority: 'high',
        category: 'disciplinary_action'
      };

      await set(ref(database, `announcements_by_role/${targetUserRole}/${announcementId}`), announcement);
      
      console.log(`Warning announcement saved for ${targetUserRole} role`);
    } catch (error) {
      console.error('Error saving warning announcement:', error);
    }
  };

  // Save resolved announcement to reporter
  const saveResolvedAnnouncement = async (report) => {
    try {
      const reporterRole = users[report.createdBy]?.role || 'student';
      const announcementId = push(ref(database, `announcements_by_role/${reporterRole}`)).key;
      
      const announcement = {
        id: announcementId,
        title: 'Your Report Has Been Resolved',
        message: `Your report against ${report.reportedUserName} has been reviewed and resolved by our administration team. ${actionNotes || 'Thank you for helping us maintain a safe and professional environment.'}`,
        type: 'new_issue',
        issueId: report.id,
        severity: 'success',
        targetUserId: report.createdBy,
        targetUserName: report.creatorName,
        reportId: report.id,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString(),
        isRead: false,
        priority: 'medium',
        category: 'report_update'
      };

      await set(ref(database, `announcements_by_role/${reporterRole}/${announcementId}`), announcement);
      
      console.log(`Resolution announcement saved for ${reporterRole} role`);
    } catch (error) {
      console.error('Error saving resolution announcement:', error);
    }
  };

  // Save dismissed announcement to reporter
  const saveDismissedAnnouncement = async (report) => {
    try {
      const reporterRole = users[report.createdBy]?.role || 'student';
      const announcementId = push(ref(database, `announcements_by_role/${reporterRole}`)).key;
      
      const announcement = {
        id: announcementId,
        title: 'Your Report Has Been Reviewed',
        message: `Your report against ${report.reportedUserName} has been reviewed. After investigation, no further action is required at this time. ${actionNotes || 'We appreciate your concern and encourage you to continue reporting any issues you encounter.'}`,
        type: 'new_issue',
        issueId: report.id,
        severity: 'info',
        targetUserId: report.createdBy,
        targetUserName: report.creatorName,
        reportId: report.id,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString(),
        isRead: false,
        priority: 'low',
        category: 'report_update'
      };

      await set(ref(database, `announcements_by_role/${reporterRole}/${announcementId}`), announcement);
      
      console.log(`Dismissal announcement saved for ${reporterRole} role`);
    } catch (error) {
      console.error('Error saving dismissal announcement:', error);
    }
  };

  // Deactivate user account instead of banning
  const deactivateUser = async (userId) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      const deactivationEnd = new Date();
      deactivationEnd.setDate(deactivationEnd.getDate() + banDuration);
      
      await update(userRef, {
        status: 'deactivated',
        deactivatedUntil: deactivationEnd.toISOString(),
        deactivatedAt: new Date().toISOString(),
        deactivatedBy: currentUser.uid,
        deactivationDuration: banDuration,
        previousStatus: users[userId]?.status || 'active'
      });
      
      console.log(`User ${userId} account deactivated for ${banDuration} days`);
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  };

  // Function to reactivate user (can be called when removing ban)
  const reactivateUser = async (userId) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const previousStatus = userData.previousStatus || 'active';
        
        await update(userRef, {
          status: previousStatus,
          deactivatedUntil: null,
          deactivatedAt: null,
          deactivatedBy: null,
          deactivationDuration: null,
          reactivatedAt: new Date().toISOString(),
          reactivatedBy: currentUser.uid
        });
        
        setSnackbar({
          open: true,
          message: 'User account reactivated successfully',
          severity: 'success'
        });
        
        console.log(`User ${userId} account reactivated`);
      }
    } catch (error) {
      console.error('Error reactivating user:', error);
      setSnackbar({
        open: true,
        message: 'Error reactivating user account',
        severity: 'error'
      });
    }
  };

  // Send warning notification - UPDATED TO INCLUDE ANNOUNCEMENT SAVING
  const sendWarningNotification = async (report, warningTarget) => {
    try {
      const notificationsRef = ref(database, 'notifications');
      
      // Notify the warned user
      const targetUserId = warningTarget === 'reporter' ? report.createdBy : report.reportedUserId;
      const warningNotificationId = push(notificationsRef).key;
      await set(ref(database, `notifications/${warningNotificationId}`), {
        userId: targetUserId,
        type: 'warning',
        title: 'Warning Notice',
        message: warningTarget === 'reporter' 
          ? `You have received a warning regarding your report submission.`
          : `You have received a warning regarding your behavior.`,
        reportId: report.id,
        timestamp: new Date().toISOString(),
        read: false,
        severity: 'warning'
      });

      // Always notify the reporter about the action taken
      if (warningTarget !== 'reporter') {
        const reporterNotificationId = push(notificationsRef).key;
        await set(ref(database, `notifications/${reporterNotificationId}`), {
          userId: report.createdBy,
          type: 'report_action_taken',
          title: 'Action Taken on Your Report',
          message: `A warning has been sent to the reported user regarding your complaint.`,
          reportId: report.id,
          timestamp: new Date().toISOString(),
          read: false,
          severity: 'info'
        });
      }

      // Save warning announcement (MOVED HERE FROM handleSubmitAction to avoid duplication)
      await saveWarningAnnouncement(report, warningTarget);
      
    } catch (error) {
      console.error('Error sending warning notification:', error);
    }
  };

  // Send ban notification (now deactivation)
  const sendBanNotification = async (report) => {
    try {
      const notificationsRef = ref(database, 'notifications');
      
      // Notify the deactivated user
      const banNotificationId = push(notificationsRef).key;
      await set(ref(database, `notifications/${banNotificationId}`), {
        userId: report.reportedUserId,
        type: 'account_deactivated',
        title: 'Account Temporarily Deactivated',
        message: `Your account has been temporarily deactivated for ${banDuration} days due to violation of community guidelines. You will not be able to access the system during this period.`,
        reportId: report.id,
        timestamp: new Date().toISOString(),
        read: false,
        severity: 'error'
      });

      // Notify the reporter
      const reporterNotificationId = push(notificationsRef).key;
      await set(ref(database, `notifications/${reporterNotificationId}`), {
        userId: report.createdBy,
        type: 'report_action_taken',
        title: 'Action Taken on Your Report',
        message: `The reported user's account has been temporarily deactivated for ${banDuration} days.`,
        reportId: report.id,
        timestamp: new Date().toISOString(),
        read: false,
        severity: 'success'
      });

      // Save announcement for reporter
      const reporterRole = users[report.createdBy]?.role || 'student';
      const announcementId = push(ref(database, `announcements_by_role/${reporterRole}`)).key;
      
      const announcement = {
        id: announcementId,
        title: 'Your Report Led to Account Deactivation',
        message: `Following your report against ${report.reportedUserName}, their account has been temporarily deactivated for ${banDuration} days. Thank you for helping us maintain a safe environment.`,
        type: 'new_issue',
        issueId: report.id,
        severity: 'success',
        targetUserId: report.createdBy,
        targetUserName: report.creatorName,
        reportId: report.id,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString(),
        isRead: false,
        priority: 'high',
        category: 'report_action'
      };

      await set(ref(database, `announcements_by_role/${reporterRole}/${announcementId}`), announcement);
    } catch (error) {
      console.error('Error sending deactivation notification:', error);
    }
  };

  // Send resolution notification
  const sendResolutionNotification = async (report) => {
    try {
      const notificationsRef = ref(database, 'notifications');
      
      // Notify the reporter
      const reporterNotificationId = push(notificationsRef).key;
      await set(ref(database, `notifications/${reporterNotificationId}`), {
        userId: report.createdBy,
        type: 'report_resolved',
        title: 'Your Report Has Been Resolved',
        message: `Your report has been reviewed and resolved by our administration team.`,
        reportId: report.id,
        timestamp: new Date().toISOString(),
        read: false,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error sending resolution notification:', error);
    }
  };

  // Send dismissal notification
  const sendDismissalNotification = async (report) => {
    try {
      const notificationsRef = ref(database, 'notifications');
      
      // Notify the reporter
      const reporterNotificationId = push(notificationsRef).key;
      await set(ref(database, `notifications/${reporterNotificationId}`), {
        userId: report.createdBy,
        type: 'report_dismissed',
        title: 'Your Report Has Been Reviewed',
        message: `Your report has been reviewed. After investigation, no further action is required at this time.`,
        reportId: report.id,
        timestamp: new Date().toISOString(),
        read: false,
        severity: 'info'
      });
    } catch (error) {
      console.error('Error sending dismissal notification:', error);
    }
  };

  const getTabCount = (tabIndex) => {
    switch (tabIndex) {
      case 0: return reports.length;
      case 1: return reports.filter(r => users[r.createdBy]?.role === 'company').length;
      case 2: return reports.filter(r => users[r.createdBy]?.role === 'student').length;
      case 3: return '📊'; // Analytics tab
      default: return 0;
    }
  };

  // Updated action options
  const actionOptions = [
    { value: 'warn_user', label: 'Send Warning', color: '#ff9800', icon: <WarningIcon /> },
    { value: 'ban_user', label: 'Deactivate Account Temporarily', color: '#f44336', icon: <BanIcon /> },
    { value: 'resolve_report', label: 'Mark as Resolved', color: '#4caf50', icon: <CheckCircleIcon /> },
    { value: 'dismiss_report', label: 'Dismiss Report', color: '#757575', icon: <CancelIcon /> }
  ];

  // Analytics Components
  const renderAnalyticsTab = () => (
    <Grid container spacing={3}>
      {/* Companies Requiring Review Section */}
      <Grid item xs={12} md={6}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <FireIcon sx={{ mr: 1 }} />
            🚨 Companies Requiring Review
          </Typography>
        </Alert>
        
        <Card sx={{ background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#d32f2f', fontWeight: 600 }}>
              High-Risk Companies
            </Typography>
            {topCompanies.length > 0 ? (
              topCompanies.map((company, index) => (
                <Card key={company.id} sx={{ mb: 2, bgcolor: index === 0 ? '#ffcdd2' : 'white', border: index === 0 ? '2px solid #f44336' : '1px solid #e0e0e0' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {index === 0 && <TrophyIcon sx={{ color: '#f44336', mr: 1 }} />}
                        <BusinessIcon sx={{ color: '#f44336', mr: 2, fontSize: 32 }} />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                            #{index + 1} {company.name}
                          </Typography>
                          <Typography variant="body2" color="error">
                            Risk Level: {company.count} complaint{company.count > 1 ? 's' : ''}
                          </Typography>
                          {company.status === 'deactivated' && (
                            <Chip label="DEACTIVATED" size="small" color="error" sx={{ mt: 0.5 }} />
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                          {company.count}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min((company.count / Math.max(...topCompanies.map(c => c.count))) * 100, 100)} 
                          sx={{ 
                            width: 80, 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: '#ffcdd2',
                            '& .MuiLinearProgress-bar': { backgroundColor: '#f44336' }
                          }} 
                        />
                        <Typography variant="caption" color="error">
                          Action Required
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                <ShieldIcon sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
                <Typography variant="h6" color="success.main">
                  All Clear!
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  No companies with multiple reports
                </Typography>
              </Paper>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Students Needing Support Section */}
      <Grid item xs={12} md={6}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1 }} />
            🤝 Students Needing Support
          </Typography>
        </Alert>
        
        <Card sx={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
              Support Priority List
            </Typography>
            {topStudents.length > 0 ? (
              topStudents.map((student, index) => (
                <Card key={student.id} sx={{ mb: 2, bgcolor: index === 0 ? '#bbdefb' : 'white', border: index === 0 ? '2px solid #2196f3' : '1px solid #e0e0e0' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {index === 0 && <TrophyIcon sx={{ color: '#2196f3', mr: 1 }} />}
                        <SchoolIcon sx={{ color: '#2196f3', mr: 2, fontSize: 32 }} />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                            #{index + 1} {student.name}
                          </Typography>
                          <Typography variant="body2" color="primary">
                            Support Needed: {student.count} request{student.count > 1 ? 's' : ''}
                          </Typography>
                          {student.status === 'deactivated' && (
                            <Chip label="ACCOUNT SUSPENDED" size="small" color="warning" sx={{ mt: 0.5 }} />
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                          {student.count}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min((student.count / Math.max(...topStudents.map(s => s.count))) * 100, 100)} 
                          sx={{ 
                            width: 80, 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: '#bbdefb',
                            '& .MuiLinearProgress-bar': { backgroundColor: '#2196f3' }
                          }} 
                        />
                        <Typography variant="caption" color="primary">
                          Provide Guidance
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                <ShieldIcon sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
                <Typography variant="h6" color="success.main">
                  All Students Supported!
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  No students with multiple support requests
                </Typography>
              </Paper>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Analytics Summary Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <AnalyticsIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {reports.length}
                </Typography>
                <Typography variant="body1">
                  Total Reports
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <BusinessIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {reports.filter(r => users[r.reportedUserId]?.role === 'company').length}
                </Typography>
                <Typography variant="body1">
                  Company Reports
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <SchoolIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {reports.filter(r => users[r.reportedUserId]?.role === 'student').length}
                </Typography>
                <Typography variant="body1">
                  Student Reports
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {reports.filter(r => r.status === 'resolved').length}
                </Typography>
                <Typography variant="body1">
                  Resolved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading reports...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Issues & Reports Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Monitor and resolve disputes between students and companies
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={selectedTab} 
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={
              <Badge badgeContent={getTabCount(0)} color="primary">
                All Reports
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={getTabCount(1)} color="error">
                Company Reports
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={getTabCount(2)} color="info">
                Student Reports
              </Badge>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AnalyticsIcon sx={{ mr: 1 }} />
                Analytics
              </Box>
            } 
          />
        </Tabs>
      </Paper>

      {/* Conditional Content Based on Selected Tab */}
      {selectedTab === 3 ? (
        // Analytics Dashboard
        renderAnalyticsTab()
      ) : (
        <>
          {/* Filters */}
          <Paper sx={{ mb: 3, p: 3, borderRadius: 2 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="dismissed">Dismissed</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="bug">Bug</MenuItem>
                  <MenuItem value="feature_request">Feature Request</MenuItem>
                  <MenuItem value="question">Question</MenuItem>
                  <MenuItem value="enhancement">Enhancement</MenuItem>
                  <MenuItem value="documentation">Documentation</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Showing {filteredReports.length} of {reports.length} reports
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Reports List */}
          <Grid container spacing={3}>
            {filteredReports.map((report) => (
              <Grid item xs={12} key={`${report.chatId}_${report.id}`}>
                <Card sx={{ borderRadius: 2, boxShadow: 2, '&:hover': { boxShadow: 4 } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {getCategoryIcon(report.category)}
                          
                          <Typography variant="h6" sx={{ fontWeight: 600, mr: 2, ml: 1 }}>
                            {generateReportTitle(report)}
                          </Typography>
                          <Chip
                            disabled
                            icon={getStatusIcon(report.status || 'pending')}
                            label={getStatusLabel(report.status || 'pending')}
                            size="small"
                            sx={{ 
                              bgcolor: getStatusColor(report.status || 'pending'),
                              color: 'white',
                              mr: 1
                            }}
                          />
                          <Chip
                            label={report.priority?.toUpperCase() || 'MEDIUM'}
                            size="small"
                            sx={{ 
                              bgcolor: getPriorityColor(report.priority || 'medium'),
                              color: 'white'
                            }}
                          />
                        </Box>

                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              {users[report.createdBy]?.role === 'company' ? (
                                <BusinessIcon sx={{ mr: 2, color: '#1976d2' }} />
                              ) : (
                                <SchoolIcon sx={{ mr: 2, color: '#388e3c' }} />
                              )}
                              <Box>
                                <Typography variant="body2" color="textSecondary">
                                  Reported by:
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {report.creatorName || 'Unknown User'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {users[report.createdBy]?.role || 'Unknown Role'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <PersonIcon sx={{ mr: 2, color: '#388e3c' }} />
                              <Box>
                                <Typography variant="body2" color="textSecondary">
                                  Reported against:
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {report.reportedUserName || 'Unknown User'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {users[report.reportedUserId]?.role || 'Unknown Role'}
                                  {users[report.reportedUserId]?.status === 'deactivated' && (
                                    <Chip 
                                      disabled
                                      label="DEACTIVATED" 
                                      size="small" 
                                      color="error" 
                                      sx={{ ml: 1, fontSize: '0.6rem' }}
                                    />
                                  )}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>

                        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                          "{report.description || 'No description provided'}"
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="caption" color="textSecondary">
                              {new Date(report.timestamp).toLocaleDateString() || 'Invalid Date'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AssignmentIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="caption" color="textSecondary">
                              {report.category?.replace('_', ' ').toUpperCase()}
                            </Typography>
                          </Box>
                          {report.type && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <ReportIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="caption" color="textSecondary">
                                {report.type}
                              </Typography>
                            </Box>
                          )}
                          {report.chatId && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <MessageIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="caption" color="textSecondary">
                                Chat available
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewDetails(report)}
                          startIcon={<VisibilityIcon />}
                        >
                          View Details
                        </Button>
                        
                        {report.chatId && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={async () => {
                              const history = await getChatHistory(report.chatId);
                              setChatHistory(history);
                              setSelectedReport(report);
                              setChatHistoryDialog(true);
                            }}
                            startIcon={<MessageIcon />}
                            color="info"
                          >
                            View Chat
                          </Button>
                        )}

                        {/* Status Change Dropdown */}
                        <TextField
                          select
                          size="small"
                          label="Change Status"
                          value={report.status || 'pending'}
                          onChange={(e) => handleStatusChange(report, e.target.value)}
                          sx={{ minWidth: 140 }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="resolved">Resolved</MenuItem>
                          <MenuItem value="dismissed">Dismissed</MenuItem>
                        </TextField>
                        
                        {(report.status === 'pending' || report.status === 'under_review' || report.status === 'in_progress') && (
                          <ButtonGroup orientation="vertical" size="small">
                            <Button
                              variant="contained"
                              color="warning"
                              onClick={() => handleTakeAction(report, 'warn_user')}
                            >
                              Send Warning
                            </Button>
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => handleTakeAction(report, 'resolve_report')}
                            >
                              Mark Resolved
                            </Button>
                          </ButtonGroup>
                        )}

                        {/* Reactivate Button for deactivated users */}
                        {users[report.reportedUserId]?.status === 'deactivated' && (
                          <Button
                            variant="contained"
                            color="info"
                            size="small"
                            onClick={() => reactivateUser(report.reportedUserId)}
                          >
                            Reactivate User
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Empty State */}
          {filteredReports.length === 0 && !loading && (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
              <ReportIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No reports found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : 'No issues have been reported yet.'}
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedReport && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  {generateReportTitle(selectedReport)}
                </Typography>
                <Box>
                  <Chip
                    disabled
                    icon={getStatusIcon(selectedReport.status || 'pending')}
                    label={getStatusLabel(selectedReport.status || 'pending')}
                    sx={{ 
                      bgcolor: getStatusColor(selectedReport.status || 'pending'),
                      color: 'white',
                      mr: 1
                    }}
                  />
                  <Chip
                    label={selectedReport.priority?.toUpperCase() || 'MEDIUM'}
                    size="small"
                    sx={{ 
                      bgcolor: getPriorityColor(selectedReport.priority || 'medium'),
                      color: 'white'
                    }}
                  />
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Report Description
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f9f9f9', mb: 3 }}>
                    <Typography variant="body1" paragraph sx={{ fontStyle: 'italic' }}>
                      "{selectedReport.description || 'No description provided'}"
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Reported By
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      {users[selectedReport.createdBy]?.role === 'company' ? (
                        <BusinessIcon sx={{ mr: 2, color: '#1976d2' }} />
                      ) : (
                        <SchoolIcon sx={{ mr: 2, color: '#388e3c' }} />
                      )}
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedReport.creatorName || 'Unknown User'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          User ID: {selectedReport.createdBy}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Role: {users[selectedReport.createdBy]?.role || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Category: {selectedReport.category?.replace('_', ' ').toUpperCase() || 'Standard Report'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Reported Against
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <PersonIcon sx={{ mr: 2, color: '#388e3c' }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedReport.reportedUserName || 'Unknown User'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          User ID: {selectedReport.reportedUserId}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Role: {users[selectedReport.reportedUserId]?.role || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Status: {users[selectedReport.reportedUserId]?.status || 'Active'}
                          {users[selectedReport.reportedUserId]?.status === 'deactivated' && (
                            <Chip 
                              label="DEACTIVATED" 
                              size="small" 
                              color="error" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        {users[selectedReport.reportedUserId]?.deactivatedUntil && (
                          <Typography variant="body2" color="error">
                            Deactivated until: {new Date(users[selectedReport.reportedUserId].deactivatedUntil).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {chatHistory.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Recent Chat Messages (Last 5)
                    </Typography>
                    <Paper sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                      {chatHistory.slice(-5).map((message, index) => (
                        <Box key={index} sx={{ mb: 1, p: 1, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(message.timestamp).toLocaleString()}
                          </Typography>
                          <Typography variant="body2">
                            {message.text || message.message}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                )}

                {reportHistory.creator?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Reporter's History ({reportHistory.creator.length} reports)
                    </Typography>
                    <Paper sx={{ p: 2, maxHeight: 150, overflow: 'auto' }}>
                      {reportHistory.creator.slice(0, 3).map((report, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                          • {(report.description || 'No description').substring(0, 50)}... ({new Date(report.timestamp).toLocaleDateString()})
                        </Typography>
                      ))}
                    </Paper>
                  </Grid>
                )}

                {reportHistory.reported?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Reported User's History ({reportHistory.reported.length} reports)
                    </Typography>
                    <Paper sx={{ p: 2, maxHeight: 150, overflow: 'auto' }}>
                      {reportHistory.reported.slice(0, 3).map((report, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                          • {(report.description || 'No description').substring(0, 50)}... ({new Date(report.timestamp).toLocaleDateString()})
                        </Typography>
                      ))}
                    </Paper>
                  </Grid>
                )}

                {selectedReport.resolution && (
                  <Grid item xs={12}>
                    <Alert severity="success">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Resolution
                      </Typography>
                      <Typography variant="body2">
                        {selectedReport.resolution}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
              {selectedReport.chatId && (
                <Button
                  variant="outlined"
                  onClick={async () => {
                    const history = await getChatHistory(selectedReport.chatId);
                    setChatHistory(history);
                    setChatHistoryDialog(true);
                  }}
                  startIcon={<MessageIcon />}
                >
                  View Full Chat
                </Button>
              )}
              {(selectedReport.status === 'pending' || selectedReport.status === 'under_review' || selectedReport.status === 'in_progress') && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setDialogOpen(false);
                    handleTakeAction(selectedReport, '');
                  }}
                >
                  Take Action
                </Button>
              )}
              {users[selectedReport.reportedUserId]?.status === 'deactivated' && (
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => reactivateUser(selectedReport.reportedUserId)}
                >
                  Reactivate User
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Action Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Take Action on Report: {selectedReport ? generateReportTitle(selectedReport) : ''}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Action Type"
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              sx={{ mb: 3 }}
            >
              {actionOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ mr: 1 }}>{option.icon}</Box>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: option.color,
                        mr: 2
                      }}
                    />
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {actionType === 'warn_user' && (
              <Box sx={{ mb: 3 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Who should receive the warning?</FormLabel>
                  <RadioGroup
                    row
                    value={warningTarget}
                    onChange={(e) => setWarningTarget(e.target.value)}
                  >
                    <FormControlLabel 
                      value="reported" 
                      control={<Radio />} 
                      label={`Reported User (${selectedReport?.reportedUserName || 'Unknown'})`} 
                    />
                    <FormControlLabel 
                      value="reporter" 
                      control={<Radio />} 
                      label={`Reporter (${selectedReport?.creatorName || 'Unknown'})`} 
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            )}

            {(actionType === 'ban_user') && (
              <TextField
                select
                fullWidth
                label="Deactivation Duration"
                value={banDuration}
                onChange={(e) => setBanDuration(Number(e.target.value))}
                sx={{ mb: 3 }}
              >
                <MenuItem value={1}>1 Day</MenuItem>
                <MenuItem value={3}>3 Days</MenuItem>
                <MenuItem value={7}>1 Week</MenuItem>
                <MenuItem value={14}>2 Weeks</MenuItem>
                <MenuItem value={30}>1 Month</MenuItem>
              </TextField>
            )}

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Action Notes"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder={
                actionType === 'warn_user' 
                  ? "Enter detailed notes about this warning (required)..."
                  : "Enter optional notes about this action..."
              }
              required={actionType === 'warn_user'}
              helperText={
                actionType === 'warn_user' 
                  ? "Notes are required for warning actions"
                  : "Notes are optional for this action type"
              }
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => {
            setActionDialogOpen(false);
            setActionNotes('');
            setActionType('');
            setWarningTarget('reported');
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitAction}
            disabled={!actionType || (actionType === 'warn_user' && !actionNotes.trim())}
          >
            Submit Action
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat History Dialog */}
      <Dialog
        open={chatHistoryDialog}
        onClose={() => setChatHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chat History - {selectedReport ? generateReportTitle(selectedReport) : ''}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {chatHistory.length > 0 ? (
              chatHistory.map((message, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: '#f9f9f9' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {message.senderName || users[message.senderId]?.name || 'Unknown User'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(message.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {message.text || message.message}
                  </Typography>
                  {message.messageType === 'file' && (
                    <Typography variant="caption" color="primary" sx={{ fontStyle: 'italic' }}>
                      📎 File: {message.fileName}
                    </Typography>
                  )}
                </Paper>
              ))
            ) : (
              <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                No chat messages available
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChatHistoryDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IssuesReports;