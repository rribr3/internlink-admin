// src/components/Users.js - Fixed Form Reloading Issue
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  AutoAwesome as AutoAwesomeIcon,
  Block as BlockIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ActivateIcon, // Add this line
  AdminPanelSettings as AdminIcon,
  PictureAsPdf as PdfIcon,
  GetApp as DownloadIcon,
  OpenInNew as OpenIcon,
  Fullscreen as FullscreenIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { ref, get, remove, update } from 'firebase/database';
import { database } from '../config/firebase';
import { useGlobalTheme } from '../contexts/GlobalThemeContext';
import { ThemeToggleButton } from './ThemeToggleButton';

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
  const [actionDialog, setActionDialog] = useState(false);
const [actionType, setActionType] = useState(''); // 'deactivate', 'reactivate', 'delete'
const [deactivationReason, setDeactivationReason] = useState('');
// 2. ADD STATE FOR CV DIALOG (add this with your other state variables)
const [cvDialog, setCvDialog] = useState(false);
const [cvUrl, setCvUrl] = useState('');
const [legalDocsDialog, setLegalDocsDialog] = useState(false);
const [legalDocsUrl, setLegalDocsUrl] = useState('');
const [renderError, setRenderError] = useState(null);

const handleViewLegalDocs = (url) => {
  setLegalDocsUrl(url);
  setLegalDocsDialog(true);
};

const LegalDocsDialog = () => (
  <Dialog
    open={legalDocsDialog}
    onClose={() => setLegalDocsDialog(false)}
    maxWidth="lg"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: 4,
        overflow: 'hidden',
        maxHeight: '95vh',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
      }
    }}
  >
    {/* Legal Docs Dialog Header */}
    <Box
      sx={{
        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
        color: 'white',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <DocumentIcon sx={{ mr: 2, fontSize: 28 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {selectedUser?.companyName || selectedUser?.name || 'Company'}'s Legal Documents
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Official Legal Documentation & Compliance
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        {/* Download Legal Docs Button */}
        <Button
          variant="outlined"
          color='primary'
          startIcon={<DownloadIcon />}
          onClick={async () => {
            try {
              // Enhanced download function for Dropbox URLs
              const downloadFile = async (url, filename) => {
                try {
                  // First try: Direct fetch and blob download
                  const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                      'Accept': 'application/pdf,application/octet-stream,*/*',
                    },
                    mode: 'cors'
                  });
                  
                  if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  
                  const blob = await response.blob();
                  const downloadUrl = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = downloadUrl;
                  link.download = filename;
                  link.style.display = 'none';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(downloadUrl);
                  
                  console.log('Download completed successfully');
                } catch (fetchError) {
                  console.error('Fetch download failed:', fetchError);
                  
                  // Fallback: Try using a temporary link with download attribute
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = filename;
                  link.target = '_blank';
                  link.rel = 'noopener noreferrer';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              };
              
              // Convert Dropbox URL for better download compatibility
              let downloadUrl = selectedUser.legalDocsUrl;
              if (downloadUrl.includes('dl.dropboxusercontent.com')) {
                // Ensure it's a download URL (dl=1)
                downloadUrl = downloadUrl.includes('dl=') 
                  ? downloadUrl.replace('dl=0', 'dl=1')
                  : downloadUrl + (downloadUrl.includes('?') ? '&dl=1' : '?dl=1');
              }
              
              // Create filename in format: companyname_legal_docs.pdf
              const companyName = selectedUser?.companyName || selectedUser?.name || 'Company';
              const cleanName = companyName
                .toLowerCase()
                .replace(/\s+/g, '') // Remove all spaces
                .replace(/[^a-z0-9]/g, ''); // Remove special characters, keep only letters and numbers
              const filename = `${cleanName}_legal_docs.pdf`;
              
              console.log('Downloading Legal Docs with filename:', filename);
              
              await downloadFile(downloadUrl, filename);
              
            } catch (error) {
              console.error('Download process failed:', error);
              // Ultimate fallback - open in new tab for manual download
              window.open(selectedUser.legalDocsUrl, '_blank');
            }
          }}
          sx={{
            borderColor: '#ff9800',
            color: '#ff9800',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              borderColor: '#f57c00',
              backgroundColor: 'rgba(255, 152, 0, 0.04)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Download
        </Button>
        
        {/* Close Button */}
        <IconButton
          onClick={() => setLegalDocsDialog(false)}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.15)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>

    {/* Legal Docs Content */}
    <DialogContent sx={{ p: 0, backgroundColor: '#f8fafc' }}>
      {legalDocsUrl && (
        <Box sx={{ width: '100%', height: '80vh', position: 'relative' }}>
          {/* Try different approaches for PDF viewing */}
          {(() => {
            // Convert Dropbox share URL to direct URL for iframe viewing
            let directUrl = legalDocsUrl;
            
            // Check if it's a Dropbox URL and convert it
            if (legalDocsUrl.includes('dropbox') || legalDocsUrl.includes('dl.dropboxusercontent.com')) {
              // Try to convert to direct access
              if (legalDocsUrl.includes('dl.dropboxusercontent.com')) {
                // Already a direct URL, but may need adjustment
                directUrl = legalDocsUrl.replace('dl=0', 'dl=1');
              } else if (legalDocsUrl.includes('dropbox.com')) {
                // Convert share URL to direct URL
                directUrl = legalDocsUrl.replace('dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
              }
            }

            return (
              <>
                {/* Try iframe first */}
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(directUrl)}&embedded=true`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '0 0 16px 16px'
                  }}
                  title={`${selectedUser?.companyName || selectedUser?.name || 'Company'}'s Legal Documents`}
                  onError={(e) => {
                    console.log('Google Docs viewer failed, trying direct iframe');
                    e.target.style.display = 'none';
                    document.getElementById('direct-legal-iframe').style.display = 'block';
                  }}
                />
                
                {/* Fallback iframe with direct URL */}
                <iframe
                  id="direct-legal-iframe"
                  src={directUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '0 0 16px 16px',
                    display: 'none'
                  }}
                  title={`${selectedUser?.companyName || selectedUser?.name || 'Company'}'s Legal Documents Direct`}
                  onError={(e) => {
                    console.log('Direct iframe failed, showing fallback');
                    e.target.style.display = 'none';
                    document.getElementById('legal-fallback-message').style.display = 'block';
                  }}
                />
              </>
            );
          })()}
          
          {/* Fallback message if PDF doesn't load */}
          <Box
            id="legal-fallback-message"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              backgroundColor: 'rgba(255,255,255,0.95)',
              p: 4,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'none',
              width: '90%',
              maxWidth: '500px'
            }}
          >
            <DocumentIcon sx={{ fontSize: 48, color: '#ff9800', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
              Legal Documents Preview Not Available
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
              These legal documents are stored on Dropbox and cannot be previewed directly in the browser. 
              Please download the file or open it in a new tab to view.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                href={legalDocsUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  textTransform: 'none',
                  mb: 1
                }}
              >
                Download Legal Docs
              </Button>
              <Button
                variant="outlined"
                startIcon={<OpenIcon />}
                onClick={() => window.open(legalDocsUrl, '_blank')}
                sx={{
                  borderColor: '#ff9800',
                  color: '#ff9800',
                  textTransform: 'none',
                  mb: 1
                }}
              >
                Open in New Tab
              </Button>
            </Box>
            
            {/* Additional info */}
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: 'rgba(255, 152, 0, 0.05)', 
              borderRadius: 2,
              border: '1px solid rgba(255, 152, 0, 0.1)'
            }}>
              <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                <strong>File Location:</strong> Dropbox Cloud Storage
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                <strong>Tip:</strong> For best viewing experience, download the file to your device
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </DialogContent>
  </Dialog>
);

const handleViewCV = (url) => {
  setCvUrl(url);
  setCvDialog(true);
};

const CVDialog = () => (
  <Dialog
    open={cvDialog}
    onClose={() => setCvDialog(false)}
    maxWidth="lg"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: 4,
        overflow: 'hidden',
        maxHeight: '95vh',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
      }
    }}
  >
    {/* CV Dialog Header */}
    <Box
      sx={{
        background: 'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)',
        color: 'white',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <PdfIcon sx={{ mr: 2, fontSize: 28 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {selectedUser?.name || 'Student'}'s CV
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Professional Resume & Curriculum Vitae
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>

      
        
        {/* Download CV Button */}
            <Button
              variant="outlined"
              color='primary'
              
              startIcon={<DownloadIcon />}
              onClick={async () => {
                try {
                  // Enhanced download function for Dropbox URLs
                  const downloadFile = async (url, filename) => {
                    try {
                      // First try: Direct fetch and blob download
                      const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                          'Accept': 'application/pdf,application/octet-stream,*/*',
                        },
                        mode: 'cors'
                      });
                      
                      if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                      }
                      
                      const blob = await response.blob();
                      const downloadUrl = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = downloadUrl;
                      link.download = filename;
                      link.style.display = 'none';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(downloadUrl);
                      
                      console.log('Download completed successfully');
                    } catch (fetchError) {
                      console.error('Fetch download failed:', fetchError);
                      
                      // Fallback: Try using a temporary link with download attribute
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = filename;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  };
                  
                  // Convert Dropbox URL for better download compatibility
                  let downloadUrl = selectedUser.cvUrl;
                  if (downloadUrl.includes('dl.dropboxusercontent.com')) {
                    // Ensure it's a download URL (dl=1)
                    downloadUrl = downloadUrl.includes('dl=') 
                      ? downloadUrl.replace('dl=0', 'dl=1')
                      : downloadUrl + (downloadUrl.includes('?') ? '&dl=1' : '?dl=1');
                  }
                  
                  // Create filename in format: studentname_cv.pdf
                  const studentName = selectedUser?.name || 'Student';
                  const cleanName = studentName
                    .toLowerCase()
                    .replace(/\s+/g, '') // Remove all spaces
                    .replace(/[^a-z0-9]/g, ''); // Remove special characters, keep only letters and numbers
                  const filename = `${cleanName}_cv.pdf`;
                  
                  console.log('Downloading CV with filename:', filename);
                  
                  await downloadFile(downloadUrl, filename);
                  
                } catch (error) {
                  console.error('Download process failed:', error);
                  // Ultimate fallback - open in new tab for manual download
                  window.open(selectedUser.cvUrl, '_blank');
                }
              }}
               sx={{
                borderColor: '#ab47bc',
                color: '#ab47bc',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  borderColor: '#8e24aa',
                  backgroundColor: 'rgba(171, 71, 188, 0.04)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Download
            </Button>
        
        {/* Close Button */}
        <IconButton
          onClick={() => setCvDialog(false)}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.15)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>

    {/* CV Content */}
    <DialogContent sx={{ p: 0, backgroundColor: '#f8fafc' }}>
      {cvUrl && (
        <Box sx={{ width: '100%', height: '80vh', position: 'relative' }}>
          {/* Try different approaches for PDF viewing */}
          {(() => {
            // Convert Dropbox share URL to direct URL for iframe viewing
            let directUrl = cvUrl;
            
            // Check if it's a Dropbox URL and convert it
            if (cvUrl.includes('dropbox') || cvUrl.includes('dl.dropboxusercontent.com')) {
              // Try to convert to direct access
              if (cvUrl.includes('dl.dropboxusercontent.com')) {
                // Already a direct URL, but may need adjustment
                directUrl = cvUrl.replace('dl=0', 'dl=1');
              } else if (cvUrl.includes('dropbox.com')) {
                // Convert share URL to direct URL
                directUrl = cvUrl.replace('dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
              }
            }

            return (
              <>
                {/* Try iframe first */}
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(directUrl)}&embedded=true`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '0 0 16px 16px'
                  }}
                  title={`${selectedUser?.name || 'Student'}'s CV`}
                  onError={(e) => {
                    console.log('Google Docs viewer failed, trying direct iframe');
                    e.target.style.display = 'none';
                    document.getElementById('direct-iframe').style.display = 'block';
                  }}
                />
                
                {/* Fallback iframe with direct URL */}
                <iframe
                  id="direct-iframe"
                  src={directUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '0 0 16px 16px',
                    display: 'none'
                  }}
                  title={`${selectedUser?.name || 'Student'}'s CV Direct`}
                  onError={(e) => {
                    console.log('Direct iframe failed, showing fallback');
                    e.target.style.display = 'none';
                    document.getElementById('fallback-message').style.display = 'block';
                  }}
                />
              </>
            );
          })()}
          
          {/* Fallback message if PDF doesn't load */}
          <Box
            id="fallback-message"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              backgroundColor: 'rgba(255,255,255,0.95)',
              p: 4,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'none',
              width: '90%',
              maxWidth: '500px'
            }}
          >
            <PdfIcon sx={{ fontSize: 48, color: '#ab47bc', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
              CV Preview Not Available
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
              This CV is stored on Dropbox and cannot be previewed directly in the browser. 
              Please download the file or open it in a new tab to view.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                href={cvUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  background: 'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)',
                  textTransform: 'none',
                  mb: 1
                }}
              >
                Download CV
              </Button>
              <Button
                variant="outlined"
                startIcon={<OpenIcon />}
                onClick={() => window.open(cvUrl, '_blank')}
                sx={{
                  borderColor: '#ab47bc',
                  color: '#ab47bc',
                  textTransform: 'none',
                  mb: 1
                }}
              >
                Open in New Tab
              </Button>
            </Box>
            
            {/* Additional info */}
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: 'rgba(171, 71, 188, 0.05)', 
              borderRadius: 2,
              border: '1px solid rgba(171, 71, 188, 0.1)'
            }}>
              <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                <strong>File Location:</strong> Dropbox Cloud Storage
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                <strong>Tip:</strong> For best viewing experience, download the file to your device
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </DialogContent>
  </Dialog>
);

const handleDeactivateUser = (user) => {
  setSelectedUser(user);
  setActionType('deactivate');
  setActionDialog(true);
};
const handleReactivateUser = (user) => {
  setSelectedUser(user);
  setActionType('reactivate');
  setActionDialog(true);
};

const handleScheduleDelete = (user) => {
  setSelectedUser(user);
  setActionType('delete');
  setActionDialog(true);
};

const confirmAction = async () => {
  try {
    const timestamp = new Date().toISOString();
    const currentUser = "currentAdminId"; // Replace with actual current user ID
    
    if (actionType === 'deactivate') {
      const updateData = {
        status: 'deactivated',
        deactivatedAt: timestamp,
        deactivatedBy: currentUser,
        deactivationReason: deactivationReason || 'Admin deactivation'
      };
      
      await update(ref(database, `users/${selectedUser.id}`), updateData);
      await update(ref(database, `user_status/${selectedUser.id}`), { online: false });
      
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...updateData }
          : user
      ));
      
      showSnackbar('User deactivated successfully', 'success');
      
    } else if (actionType === 'reactivate') {
      const updateData = {
        status: 'active',
        reactivatedAt: timestamp,
        reactivatedBy: currentUser
      };
      
      // First update the user with new data
      await update(ref(database, `users/${selectedUser.id}`), updateData);
      
      // Then remove deactivation fields using remove() instead of update with null
      await remove(ref(database, `users/${selectedUser.id}/deactivatedAt`));
      await remove(ref(database, `users/${selectedUser.id}/deactivatedBy`));
      await remove(ref(database, `users/${selectedUser.id}/deactivationReason`));
      
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { 
              ...user, 
              ...updateData, 
              deactivatedAt: undefined, 
              deactivatedBy: undefined, 
              deactivationReason: undefined 
            }
          : user
      ));
      
      showSnackbar('User reactivated successfully', 'success');
      
    } else if (actionType === 'delete') {
      // Schedule deletion (30 days from now)
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 30);
      
      const scheduledDeletion = {
        userId: selectedUser.id,
        scheduledFor: deletionDate.toISOString(),
        createdAt: timestamp,
        status: 'pending'
      };
      
      await update(ref(database, `scheduled_deletions/${selectedUser.id}`), scheduledDeletion);
      await update(ref(database, `users/${selectedUser.id}`), {
        scheduledDeletion: deletionDate.toISOString()
      });
      
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, scheduledDeletion: deletionDate.toISOString() }
          : user
      ));
      
      showSnackbar('User scheduled for deletion in 30 days', 'warning');
    }
    
    // Close dialog and reset state
    setActionDialog(false);
    setSelectedUser(null);
    setDeactivationReason('');
    setActionType('');
    
  } catch (error) {
    console.error(`Error ${actionType}ing user:`, error);
    showSnackbar(`Error ${actionType}ing user: ${error.message}`, 'error');
  }
};
const handleCancelDeletion = async (user) => {
  try {
    console.log('Cancelling deletion for user:', user.id, user.name);
    
    // Check if scheduled_deletions entry exists first
    const scheduledDeletionRef = ref(database, `scheduled_deletions/${user.id}`);
    const scheduledDeletionSnapshot = await get(scheduledDeletionRef);
    
    if (scheduledDeletionSnapshot.exists()) {
      console.log('Removing from scheduled_deletions...');
      await remove(scheduledDeletionRef);
      console.log('Successfully removed from scheduled_deletions');
    } else {
      console.log('No scheduled_deletions entry found');
    }
    
    // Check if user scheduledDeletion field exists
    const userScheduledDeletionRef = ref(database, `users/${user.id}/scheduledDeletion`);
    const userScheduledDeletionSnapshot = await get(userScheduledDeletionRef);
    
    if (userScheduledDeletionSnapshot.exists()) {
      console.log('Removing scheduledDeletion field from user...');
      await remove(userScheduledDeletionRef);
      console.log('Successfully removed scheduledDeletion field');
    } else {
      console.log('No scheduledDeletion field found on user');
    }
    
    // Update local state
    setUsers(users.map(u => 
      u.id === user.id 
        ? { ...u, scheduledDeletion: undefined }
        : u
    ));
    
    console.log('Local state updated successfully');
    showSnackbar('Scheduled deletion cancelled successfully', 'success');
    
  } catch (error) {
    console.error('Detailed error cancelling deletion:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      userId: user.id,
      userName: user.name
    });
    
    // More specific error message
    if (error.code === 'PERMISSION_DENIED') {
      showSnackbar('Permission denied - check Firebase rules', 'error');
    } else if (error.code === 'NETWORK_ERROR') {
      showSnackbar('Network error - check connection', 'error');
    } else {
      showSnackbar(`Error cancelling deletion: ${error.message}`, 'error');
    }
  }
};

// Alternative method - if the above doesn't work, try this simpler approach:
const handleCancelDeletionSimple = async (user) => {
  try {
    console.log('Using simple cancellation method for user:', user.id);
    
    // Use update with null to remove fields (alternative approach)
    const updates = {};
    updates[`scheduled_deletions/${user.id}`] = null;
    updates[`users/${user.id}/scheduledDeletion`] = null;
    
    await update(ref(database), updates);
    
    // Update local state
    setUsers(users.map(u => 
      u.id === user.id 
        ? { ...u, scheduledDeletion: undefined }
        : u
    ));
    
    showSnackbar('Scheduled deletion cancelled successfully', 'success');
    
  } catch (error) {
    console.error('Error with simple cancellation:', error);
    showSnackbar(`Error cancelling deletion: ${error.message}`, 'error');
  }
};

const ActionDialog = () => (
  <Dialog
    open={actionDialog}
    onClose={() => {
      setActionDialog(false);
      setDeactivationReason('');
      setActionType('');
    }}
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
    <Box
      sx={{
        background: actionType === 'delete' 
          ? 'linear-gradient(135deg, #ff5722 0%, #d32f2f 100%)'
          : actionType === 'deactivate'
          ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
          : 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
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
        {actionType === 'delete' && <ScheduleIcon sx={{ fontSize: 40 }} />}
        {actionType === 'deactivate' && <BlockIcon sx={{ fontSize: 40 }} />}
        {actionType === 'reactivate' && <ActivateIcon sx={{ fontSize: 40 }} />}
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        {actionType === 'delete' && 'Schedule Deletion'}
        {actionType === 'deactivate' && 'Deactivate User'}
        {actionType === 'reactivate' && 'Reactivate User'}
      </Typography>
      <Typography variant="body1" sx={{ opacity: 0.9 }}>
        {actionType === 'delete' && 'User will be deleted in 30 days'}
        {actionType === 'deactivate' && 'User will lose access immediately'}
        {actionType === 'reactivate' && 'User will regain full access'}
      </Typography>
    </Box>

    <DialogContent sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
        {actionType === 'delete' && `Schedule ${selectedUser?.name || selectedUser?.companyName} for deletion?`}
        {actionType === 'deactivate' && `Deactivate ${selectedUser?.name || selectedUser?.companyName}?`}
        {actionType === 'reactivate' && `Reactivate ${selectedUser?.name || selectedUser?.companyName}?`}
      </Typography>
      
      {selectedUser && (
        <Card
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: '#fafafa',
            border: '2px solid #f0f0f0',
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
              <Chip
                label={selectedUser.role.toUpperCase()}
                size="small"
                sx={{ mt: 1, fontSize: '0.7rem' }}
              />
            </Box>
          </Box>
        </Card>
      )}

      {actionType === 'deactivate' && (
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Deactivation Reason (Optional)"
          value={deactivationReason}
          onChange={(e) => setDeactivationReason(e.target.value)}
          variant="outlined"
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          placeholder="Enter reason for deactivation..."
        />
      )}

      <Alert 
        severity={actionType === 'delete' ? 'error' : actionType === 'deactivate' ? 'warning' : 'info'}
        sx={{ 
          mb: 3, 
          textAlign: 'left',
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        <Typography variant="body2">
          {actionType === 'delete' && (
            <>
              <strong>Warning:</strong> User will be scheduled for deletion in 30 days. 
              They can still access the platform until then.
            </>
          )}
          {actionType === 'deactivate' && (
            <>
              <strong>Notice:</strong> User will immediately lose access to the platform 
              but their data will be preserved.
            </>
          )}
          {actionType === 'reactivate' && (
            <>
              <strong>Confirmation:</strong> User will regain full access to their account 
              and all platform features.
            </>
          )}
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
        onClick={() => {
          setActionDialog(false);
          setDeactivationReason('');
          setActionType('');
        }}
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
        onClick={confirmAction}
        variant="contained"
        size="large"
        sx={{
          flex: 1,
          backgroundColor: actionType === 'delete' 
            ? '#d32f2f' 
            : actionType === 'deactivate' 
            ? '#f57c00' 
            : '#2e7d32',
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
          '&:hover': {
            backgroundColor: actionType === 'delete' 
              ? '#b71c1c' 
              : actionType === 'deactivate' 
              ? '#ef6c00' 
              : '#1b5e20'
          }
        }}
        startIcon={
          actionType === 'delete' ? <ScheduleIcon /> :
          actionType === 'deactivate' ? <BlockIcon /> :
          <ActivateIcon />
        }
      >
        {actionType === 'delete' && 'Schedule Deletion'}
        {actionType === 'deactivate' && 'Deactivate User'}
        {actionType === 'reactivate' && 'Reactivate User'}
      </Button>
    </DialogActions>
  </Dialog>
);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({});
  const [editStep, setEditStep] = useState(0);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Enhanced Slide Transition
  const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return (
    <Slide
      direction="up"
      ref={ref}
      {...props}
      timeout={{
        enter: 300,
        exit: 200
      }}
    />
  );
});

  // Memoized form field change handler to prevent reloading
  const handleFormFieldChange = useCallback((fieldName, value) => {
    setEditFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, []);

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
          maxHeight: '95vh'
        }
      }}
    >
      {selectedUser && (
        <>
          {/* Compact Professional Header */}
          <Box
            sx={{
              position: 'relative',
              background: selectedUser.role === 'student' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              p: 2,
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
            {/* Fixed Close Button */}
            <IconButton 
              onClick={() => setProfileDialog(false)}
              sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease',
                zIndex: 1000
              }}
            >
              <CloseIcon />
            </IconButton>
            
            {/* Profile Header Content */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, position: 'relative', zIndex: 1 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: { xs: 60, md: 80 },
                    height: { xs: 60, md: 80 },
                    mr: { xs: 2, md: 3 },
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: '3px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {selectedUser.role === 'student' ? 
                    <StudentIcon sx={{ fontSize: { xs: 30, md: 40 } }} /> : 
                    <CompanyIcon sx={{ fontSize: { xs: 30, md: 40 } }} />
                  }
                </Avatar>
                {/* Verified Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: { xs: 8, md: 12 },
                    backgroundColor: '#4caf50',
                    borderRadius: '50%',
                    p: 0.5,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                  }}
                >
                  <VerifiedIcon sx={{ fontSize: 14, color: 'white' }} />
                </Box>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h4"
                  sx={{ 
                    fontWeight: 800, 
                    mb: 1, 
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  {selectedUser.name || selectedUser.companyName}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Chip 
                    size="small"
                    disabled
                    icon={selectedUser.role === 'student' ? <StudentIcon /> : <CompanyIcon />}
                    label={selectedUser.role.toUpperCase()}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '1px',
                      border: '1px solid rgba(255,255,255,0.3)',
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
                      fontSize: { xs: '0.9rem', md: '1rem' }
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
                      fontSize: { xs: '0.9rem', md: '1rem' }
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
                p: 1.5,
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 2,
                position: 'relative',
                zIndex: 1
              }}
            >
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1, opacity: 0.9, fontSize: 18 }} />
                    <Typography variant="body2" sx={{ opacity: 0.95, wordBreak: 'break-word', fontSize: '0.8rem' }}>
                      {selectedUser.email}
                    </Typography>
                  </Box>
                </Grid>
                {selectedUser.phone && (
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ mr: 1, opacity: 0.9, fontSize: 18 }} />
                      <Typography variant="body2" sx={{ opacity: 0.95, fontSize: '0.8rem' }}>
                        {selectedUser.phone}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {selectedUser.location && (
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ mr: 1, opacity: 0.9, fontSize: 18 }} />
                      <Typography variant="body2" sx={{ opacity: 0.95, fontSize: '0.8rem' }}>
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
                                    onClick={() => handleEditUser(selectedUser)} // or your edit handler
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
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6a1b9a', mb: 2 }}>
            📄 Professional Documents
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {/* View CV Button */}
            <Button
              variant="contained"
              startIcon={<PdfIcon />}
              onClick={() => handleViewCV(selectedUser.cvUrl)}
              sx={{
                background: 'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)',
                color: 'white',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(171, 71, 188, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              View CV
            </Button>
            
 {/* Download CV Button */}
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={async () => {
                try {
                  // Enhanced download function for Dropbox URLs
                  const downloadFile = async (url, filename) => {
                    try {
                      // First try: Direct fetch and blob download
                      const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                          'Accept': 'application/pdf,application/octet-stream,*/*',
                        },
                        mode: 'cors'
                      });
                      
                      if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                      }
                      
                      const blob = await response.blob();
                      const downloadUrl = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = downloadUrl;
                      link.download = filename;
                      link.style.display = 'none';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(downloadUrl);
                      
                      console.log('Download completed successfully');
                    } catch (fetchError) {
                      console.error('Fetch download failed:', fetchError);
                      
                      // Fallback: Try using a temporary link with download attribute
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = filename;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  };
                  
                  // Convert Dropbox URL for better download compatibility
                  let downloadUrl = selectedUser.cvUrl;
                  if (downloadUrl.includes('dl.dropboxusercontent.com')) {
                    // Ensure it's a download URL (dl=1)
                    downloadUrl = downloadUrl.includes('dl=') 
                      ? downloadUrl.replace('dl=0', 'dl=1')
                      : downloadUrl + (downloadUrl.includes('?') ? '&dl=1' : '?dl=1');
                  }
                  
                  // Create filename in format: studentname_cv.pdf
                  const studentName = selectedUser?.name || 'Student';
                  const cleanName = studentName
                    .toLowerCase()
                    .replace(/\s+/g, '') // Remove all spaces
                    .replace(/[^a-z0-9]/g, ''); // Remove special characters, keep only letters and numbers
                  const filename = `${cleanName}_cv.pdf`;
                  
                  console.log('Downloading CV with filename:', filename);
                  
                  await downloadFile(downloadUrl, filename);
                  
                } catch (error) {
                  console.error('Download process failed:', error);
                  // Ultimate fallback - open in new tab for manual download
                  window.open(selectedUser.cvUrl, '_blank');
                }
              }}
              sx={{
                borderColor: '#ab47bc',
                color: '#ab47bc',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  borderColor: '#8e24aa',
                  backgroundColor: 'rgba(171, 71, 188, 0.04)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Download
            </Button>
            
     
          </Box>
          
          {/* CV Info */}
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: 'rgba(171, 71, 188, 0.05)', 
            borderRadius: 2,
            border: '1px solid rgba(171, 71, 188, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DocumentIcon sx={{ color: '#ab47bc', mr: 1, fontSize: 18 }} />
              <Typography variant="caption" sx={{ color: '#6a1b9a', fontWeight: 600 }}>
                CV Available
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Click "View CV" to preview the document or download for offline viewing
            </Typography>
          </Box>
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

{/* Digital Presence & Legal Documents - Enhanced */}
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
        background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mr: 2
      }}
    >
      <PublicIcon sx={{ color: 'white', fontSize: 20 }} />
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 600, color: '#7b1fa2' }}>
      Digital Presence & Documents
    </Typography>
  </Box>
  
  <Stack spacing={2}>
    {/* Legal Documents Section */}
    {selectedUser.legalDocsUrl && (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#7b1fa2', mb: 2 }}>
          📋 Legal Documentation
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {/* View Legal Docs Button */}
          <Button
            variant="contained"
            startIcon={<DocumentIcon />}
            onClick={() => handleViewLegalDocs(selectedUser.legalDocsUrl)}
            sx={{
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              color: 'white',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(255, 152, 0, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            View Legal Docs
          </Button>
          
          {/* Download Legal Docs Button */}
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={async () => {
              try {
                // Enhanced download function for Dropbox URLs
                const downloadFile = async (url, filename) => {
                  try {
                    // First try: Direct fetch and blob download
                    const response = await fetch(url, {
                      method: 'GET',
                      headers: {
                        'Accept': 'application/pdf,application/octet-stream,*/*',
                      },
                      mode: 'cors'
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const blob = await response.blob();
                    const downloadUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = filename;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(downloadUrl);
                    
                    console.log('Download completed successfully');
                  } catch (fetchError) {
                    console.error('Fetch download failed:', fetchError);
                    
                    // Fallback: Try using a temporary link with download attribute
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                };
                
                // Convert Dropbox URL for better download compatibility
                let downloadUrl = selectedUser.legalDocsUrl;
                if (downloadUrl.includes('dl.dropboxusercontent.com')) {
                  // Ensure it's a download URL (dl=1)
                  downloadUrl = downloadUrl.includes('dl=') 
                    ? downloadUrl.replace('dl=0', 'dl=1')
                    : downloadUrl + (downloadUrl.includes('?') ? '&dl=1' : '?dl=1');
                }
                
                // Create filename in format: companyname_legal_docs.pdf
                const companyName = selectedUser?.companyName || selectedUser?.name || 'Company';
                const cleanName = companyName
                  .toLowerCase()
                  .replace(/\s+/g, '') // Remove all spaces
                  .replace(/[^a-z0-9]/g, ''); // Remove special characters, keep only letters and numbers
                const filename = `${cleanName}_legal_docs.pdf`;
                
                console.log('Downloading Legal Docs with filename:', filename);
                
                await downloadFile(downloadUrl, filename);
                
              } catch (error) {
                console.error('Download process failed:', error);
                // Ultimate fallback - open in new tab for manual download
                window.open(selectedUser.legalDocsUrl, '_blank');
              }
            }}
            sx={{
              borderColor: '#ff9800',
              color: '#ff9800',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                borderColor: '#f57c00',
                backgroundColor: 'rgba(255, 152, 0, 0.04)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Download
          </Button>
        </Box>
        
        {/* Legal Docs Info */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'rgba(255, 152, 0, 0.05)', 
          borderRadius: 2,
          border: '1px solid rgba(255, 152, 0, 0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <DocumentIcon sx={{ color: '#ff9800', mr: 1, fontSize: 18 }} />
            <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 600 }}>
              Legal Documents Available
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Click "View Legal Docs" to preview the documents or download for offline viewing
          </Typography>
        </Box>
      </Box>
    )}

    {/* Existing Website and LinkedIn buttons */}
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
        onClick={() => {
          window.open('https://www.linkedin.com/', '_blank', 'noopener,noreferrer');
        }}
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

  // Enhanced Multi-Step Edit Dialog - FIXED FORM RELOADING
  // Fixed EditDialog Component - Resolves Runtime Error
// Fixed EditDialog Component - Resolves Popup and Navigation Issues
// Final Fixed EditDialog Component - Completely eliminates page jumping
const EditDialog = () => {
  const [formData, setFormData] = useState({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [renderError, setRenderError] = useState(null);
  const dialogRef = useRef(null);
  const isMounted = useRef(true);
  const [errorBoundaryState, setErrorBoundaryState] = useState({
  hasError: false,
  error: null,
  errorInfo: null,
  timestamp: null
});

  // Initialize form data when dialog opens or user changes
  useEffect(() => {
  if (renderError || errorBoundaryState.hasError) {
    const errorTimestamp = "2025-07-07 12:09:52"; // Current UTC time
    const errorData = {
      message: renderError?.message || errorBoundaryState.error?.message,
      stack: renderError?.stack || errorBoundaryState.error?.stack,
      componentStack: errorBoundaryState.errorInfo?.componentStack,
      timestamp: errorTimestamp,
      user: "reemibb",
      dialogStep: editStep,
      formState: formData
    };

    // Log error details
    console.error('EditDialog Error:', {
      ...errorData,
      selectedUser: selectedUser?.id,
      location: 'EditDialog Component'
    });

    // Show user-friendly error message
    showSnackbar(
      `An error occurred while editing the profile. Please try again. (Error ID: ${Date.now()})`, 
      'error'
    );

    // Reset error states
    setRenderError(null);
    setErrorBoundaryState({
      hasError: false,
      error: null,
      errorInfo: null,
      timestamp: null
    });

    // Attempt recovery
    try {
      // Save current form data to prevent loss
      if (formData && Object.keys(formData).length > 0) {
        const recoveryKey = `editDialog_recovery_${selectedUser?.id}_${errorTimestamp}`;
        localStorage.setItem(recoveryKey, JSON.stringify({
          formData,
          timestamp: errorTimestamp,
          user: "reemibb",
          step: editStep
        }));
      }

      // Reset dialog if needed
      if (errorBoundaryState.hasError) {
        setEditDialog(false);
        setEditStep(0);
      }
    } catch (recoveryError) {
      console.error('Error during recovery:', recoveryError);
    }
  }
}, [
  renderError, 
  errorBoundaryState.hasError, 
  errorBoundaryState.error, 
  errorBoundaryState.errorInfo,
  editStep,
  formData,
  selectedUser?.id,
  showSnackbar
]);

  // Error boundary effect
  useEffect(() => {
    if (renderError) {
      console.error('Render error:', renderError);
      showSnackbar('An error occurred. Please try again.', 'error');
      setRenderError(null);
    }
  }, [renderError]);

  const editSteps = useMemo(() => {
    return selectedUser?.role === 'student' 
      ? ['Basic Info', 'Academic', 'Professional', 'Social Links']
      : ['Basic Info', 'Company Details', 'Mission & Vision', 'Digital Presence'];
  }, [selectedUser?.role]);

  const autoSaveChanges = useCallback(async (currentFormData) => {
    if (!selectedUser || !currentFormData || !isMounted.current) return;
    
    try {
      setIsAutoSaving(true);
      
      const updatedData = selectedUser.role === 'student' 
        ? {
            name: currentFormData.name?.trim(),
            email: currentFormData.email?.trim(),
            phone: currentFormData.phone?.trim(),
            location: currentFormData.location?.trim(),
            university: currentFormData.university?.trim(),
            major: currentFormData.major?.trim(),
            degree: currentFormData.degree?.trim(),
            gpa: currentFormData.gpa?.trim(),
            year: currentFormData.year?.trim(),
            gradyear: currentFormData.gradyear?.trim(),
            skills: currentFormData.skills?.trim(),
            bio: currentFormData.bio?.trim(),
            linkedin: currentFormData.linkedin?.trim(),
            github: currentFormData.github?.trim()
          }
        : {
            companyName: currentFormData.name?.trim(),
            email: currentFormData.email?.trim(),
            phone: currentFormData.phone?.trim(),
            location: currentFormData.location?.trim(),
            website: currentFormData.website?.trim(),
            industry: currentFormData.industry?.trim(),
            description: currentFormData.description?.trim(),
            mission: currentFormData.mission?.trim(),
            vision: currentFormData.vision?.trim(),
            linkedin: currentFormData.linkedin?.trim(),
            twitter: currentFormData.twitter?.trim()
          };

      // Remove undefined or empty values
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === undefined || updatedData[key] === '') {
          delete updatedData[key];
        }
      });

      if (Object.keys(updatedData).length === 0) return;

      updatedData.lastUpdated = new Date().toISOString();
      updatedData.updatedBy = 'reemibb'; // Using the current user's login

      const userRef = ref(database, `users/${selectedUser.id}`);
      await update(userRef, updatedData);

      if (isMounted.current) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedUser.id 
              ? { ...user, ...updatedData }
              : user
          )
        );
      }
      
      showSnackbar('Changes saved successfully', 'success');
    } catch (error) {
      console.error('Error saving changes:', error);
      showSnackbar('Error saving changes', 'error');
    } finally {
      if (isMounted.current) {
        setIsAutoSaving(false);
      }
    }
  }, [selectedUser]);

  const handleNextStep = useCallback(async () => {
    if (editStep >= editSteps.length - 1 || isAutoSaving) return;
    
    try {
      setIsAutoSaving(true);
      await autoSaveChanges(formData);
      setEditStep(prevStep => prevStep + 1);
    } catch (error) {
      console.error('Navigation error:', error);
      showSnackbar('Error while navigating', 'error');
    } finally {
      if (isMounted.current) {
        setIsAutoSaving(false);
      }
    }
  }, [editStep, editSteps.length, formData, autoSaveChanges, isAutoSaving]);

  const handlePrevStep = useCallback(async () => {
    if (editStep <= 0 || isAutoSaving) return;
    
    try {
      setIsAutoSaving(true);
      await autoSaveChanges(formData);
      setEditStep(prevStep => prevStep - 1);
    } catch (error) {
      console.error('Navigation error:', error);
      showSnackbar('Error while navigating', 'error');
    } finally {
      if (isMounted.current) {
        setIsAutoSaving(false);
      }
    }
  }, [editStep, formData, autoSaveChanges, isAutoSaving]);

  const handleInputChange = useCallback((field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleClose = useCallback((event, reason) => {
    if (isAutoSaving || reason === 'backdropClick') return;
    setEditDialog(false);
    setEditStep(0);
  }, [isAutoSaving]);

  const handleFinalSave = useCallback(async () => {
    if (isAutoSaving) return;
    
    try {
      await autoSaveChanges(formData);
      setEditDialog(false);
      setEditStep(0);
      showSnackbar('All changes saved successfully', 'success');
    } catch (error) {
      console.error('Error saving final changes:', error);
      showSnackbar('Error saving changes', 'error');
    }
  }, [formData, autoSaveChanges, isAutoSaving]);

  if (!selectedUser || !editDialog) return null;

  try {
    return (
      <Dialog
        ref={dialogRef}
        open={editDialog}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        TransitionComponent={SlideTransition}
        disableEscapeKeyDown={isAutoSaving}
        keepMounted
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
        {/* Loading Overlay */}
        {isAutoSaving && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255,255,255,0.5)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* Header */}
        <Box
          sx={{
            background: selectedUser?.role === 'student' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            p: 2,
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                mr: 2,
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)'
              }}
            >
              {selectedUser?.role === 'student' ? <StudentIcon /> : <CompanyIcon />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Edit Profile
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedUser?.name || selectedUser?.companyName} • Step {editStep + 1} of {editSteps.length}
              </Typography>
            </Box>
            <IconButton 
              onClick={handleClose}
              disabled={isAutoSaving}
              sx={{ 
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.15)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Progress Steps */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {editSteps.map((step, index) => (
              <React.Fragment key={step}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: index <= editStep 
                      ? 'rgba(255,255,255,0.9)' 
                      : 'rgba(255,255,255,0.3)',
                    color: index <= editStep ? selectedUser?.role === 'student' ? '#667eea' : '#f093fb' : 'white',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {index < editStep ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : index + 1}
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: index <= editStep ? 1 : 0.7,
                    fontWeight: index === editStep ? 600 : 400,
                    fontSize: '0.75rem'
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
                      mx: 0.5,
                      transition: 'all 0.3s ease'
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>

        {/* Content */}
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 4 }}>
            {selectedUser?.role === 'student' ? (
              // Student form fields
              <Grid container spacing={3}>
                {editStep === 0 && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        label="Full Name"
                        fullWidth
                        value={formData.name || selectedUser?.name || ''}
                        onChange={handleInputChange('name')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Email"
                        fullWidth
                        value={formData.email || selectedUser?.email || ''}
                        onChange={handleInputChange('email')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Phone Number"
                        fullWidth
                        value={formData.phone || selectedUser?.phone || ''}
                        onChange={handleInputChange('phone')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Location"
                        fullWidth
                        value={formData.location || selectedUser?.location || ''}
                        onChange={handleInputChange('location')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                  </>
                )}
                
                {editStep === 1 && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        label="University"
                        fullWidth
                        value={formData.university || selectedUser?.university || ''}
                        onChange={handleInputChange('university')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Major"
                        fullWidth
                        value={formData.major || selectedUser?.major || ''}
                        onChange={handleInputChange('major')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Degree"
                        fullWidth
                        value={formData.degree || selectedUser?.degree || ''}
                        onChange={handleInputChange('degree')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="GPA"
                        fullWidth
                        value={formData.gpa || selectedUser?.gpa || ''}
                        onChange={handleInputChange('gpa')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Graduation Year"
                        fullWidth
                        value={formData.gradyear || selectedUser?.gradyear || ''}
                        onChange={handleInputChange('gradyear')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                  </>
                )}
                
                {editStep === 2 && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        label="Skills (comma separated)"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.skills || selectedUser?.skills || ''}
                        onChange={handleInputChange('skills')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Bio"
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.bio || selectedUser?.bio || ''}
                        onChange={handleInputChange('bio')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="CV URL"
                        fullWidth
                        value={formData.cvUrl || selectedUser?.cvUrl || ''}
                        onChange={handleInputChange('cvUrl')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                  </>
                )}
                
                {editStep === 3 && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="LinkedIn Profile"
                        fullWidth
                        value={formData.linkedin || selectedUser?.linkedin || ''}
                        onChange={handleInputChange('linkedin')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="GitHub Profile"
                        fullWidth
                        value={formData.github || selectedUser?.github || ''}
                        onChange={handleInputChange('github')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            ) : (
              // Company form fields
              <Grid container spacing={3}>
                {editStep === 0 && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        label="Company Name"
                        fullWidth
                        value={formData.name || selectedUser?.companyName || ''}
                        onChange={handleInputChange('name')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Email"
                        fullWidth
                        value={formData.email || selectedUser?.email || ''}
                        onChange={handleInputChange('email')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Phone Number"
                        fullWidth
                        value={formData.phone || selectedUser?.phone || ''}
                        onChange={handleInputChange('phone')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Location"
                        fullWidth
                        value={formData.location || selectedUser?.location || ''}
                        onChange={handleInputChange('location')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                  </>
                )}
                
                {editStep === 1 && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Industry"
                        fullWidth
                        value={formData.industry || selectedUser?.industry || ''}
                        onChange={handleInputChange('industry')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Website"
                        fullWidth
                        value={formData.website || selectedUser?.website || ''}
                        onChange={handleInputChange('website')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Legal Documents URL"
                        fullWidth
                        value={formData.legalDocsUrl || selectedUser?.legalDocsUrl || ''}
                        onChange={handleInputChange('legalDocsUrl')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                  </>
                )}
                
                {editStep === 2 && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        label="Company Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.description || selectedUser?.description || ''}
                        onChange={handleInputChange('description')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Mission"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.mission || selectedUser?.mission || ''}
                        onChange={handleInputChange('mission')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Vision"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.vision || selectedUser?.vision || ''}
                        onChange={handleInputChange('vision')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                  </>
                )}
                
                {editStep === 3 && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="LinkedIn Profile"
                        fullWidth
                        value={formData.linkedin || selectedUser?.linkedin || ''}
                        onChange={handleInputChange('linkedin')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Twitter Profile"
                        fullWidth
                        value={formData.twitter || selectedUser?.twitter || ''}
                        onChange={handleInputChange('twitter')}
                        variant="outlined"
                        disabled={isAutoSaving}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            )}
          </Box>
        </DialogContent>

        {/* Actions */}
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
            disabled={editStep === 0 || isAutoSaving}
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
              disabled={isAutoSaving}
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
              onClick={handleFinalSave}
              disabled={isAutoSaving}
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
  } catch (error) {
    setRenderError(error);
    return null;
  }
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
  // Only reset step if dialog is not already open
  if (!editDialog) setEditStep(0);
  setSelectedUser(user);
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
const UserCard = ({ user }) => {
  const isDeactivated = user.status === 'deactivated';
  const isScheduledForDeletion = user.scheduledDeletion;
  
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        borderRadius: 3,
        border: isDeactivated 
          ? '2px solid #ff9800' 
          : isScheduledForDeletion 
          ? '2px solid #f44336' 
          : '1px solid #e0e7ff',
        background: isDeactivated 
          ? 'linear-gradient(145deg, #fff3e0 0%, #ffffff 100%)'
          : isScheduledForDeletion
          ? 'linear-gradient(145deg, #ffebee 0%, #ffffff 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          border: user.role === 'student' ? '1px solid #667eea' : '1px solid #f093fb'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Status indicators */}
        {(isDeactivated || isScheduledForDeletion) && (
          <Box sx={{ mb: 2 }}>
            {isDeactivated && (
              <Chip
              disabled
                icon={<BlockIcon />}
                label="DEACTIVATED"
                size="small"
                sx={{
                  backgroundColor: '#ff9800',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  letterSpacing: '0.5px'
                }}
              />
            )}
            {isScheduledForDeletion && (
              <Chip
                icon={<ScheduleIcon />}
                label="SCHEDULED FOR DELETION"
                size="small"
                sx={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  letterSpacing: '0.5px',
                  ml: isDeactivated ? 1 : 0
                }}
              />
            )}
          </Box>
        )}

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
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                filter: isDeactivated ? 'grayscale(50%)' : 'none',
                opacity: isDeactivated ? 0.7 : 1
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
                backgroundColor: isDeactivated 
                  ? '#ff9800' 
                  : isScheduledForDeletion 
                  ? '#f44336' 
                  : '#4caf50',
                borderRadius: '50%',
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isDeactivated ? (
                <BlockIcon sx={{ fontSize: 12, color: 'white' }} />
              ) : isScheduledForDeletion ? (
                <ScheduleIcon sx={{ fontSize: 12, color: 'white' }} />
              ) : (
                <VerifiedIcon sx={{ fontSize: 12, color: 'white' }} />
              )}
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
                whiteSpace: 'nowrap',
                color: isDeactivated ? '#666' : 'inherit',
                textDecoration: isScheduledForDeletion ? 'line-through' : 'none'
              }}
            >
              {user.name || user.companyName || 'Unknown'}
            </Typography>
            <Chip
              disabled
              variant="filled"
              label={user.role.toUpperCase()}
              size="small"
              sx={{
                background: user.role === 'student'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
                letterSpacing: '0.5px',
                filter: isDeactivated ? 'grayscale(50%)' : 'none',
                opacity: isDeactivated ? 0.7 : 1
              }}
            />
          </Box>
        </Box>

        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 20 }}>
            <EmailIcon sx={{ 
              fontSize: 16, 
              mr: 1.5, 
              color: isDeactivated ? '#999' : '#667eea' 
            }} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: isDeactivated ? '#999' : '#666',
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
              <PhoneIcon sx={{ 
                fontSize: 16, 
                mr: 1.5, 
                color: isDeactivated ? '#999' : '#f093fb' 
              }} />
              <Typography variant="body2" sx={{ 
                color: isDeactivated ? '#999' : '#666' 
              }}>
                {user.phone}
              </Typography>
            </Box>
          )}
          
          {user.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 20 }}>
              <LocationIcon sx={{ 
                fontSize: 16, 
                mr: 1.5, 
                color: isDeactivated ? '#999' : '#4caf50' 
              }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isDeactivated ? '#999' : '#666',
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

        {/* Deactivation/Deletion Info */}
        {(isDeactivated || isScheduledForDeletion) && (
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
            {isDeactivated && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#ff9800' }}>
                  Deactivated {user.deactivatedAt && new Date(user.deactivatedAt).toLocaleDateString()}
                </Typography>
                {user.deactivationReason && (
                  <Typography variant="caption" sx={{ display: 'block', color: '#666', mt: 0.5 }}>
                    Reason: {user.deactivationReason}
                  </Typography>
                )}
              </Box>
            )}
            {isScheduledForDeletion && (
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#f44336' }}>
                Scheduled for deletion: {new Date(user.scheduledDeletion).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        )}

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
          
          {!isDeactivated && !isScheduledForDeletion && (
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
          )}

          {isDeactivated ? (
            <Tooltip title="Reactivate User" placement="top">
              <IconButton 
                size="small" 
                sx={{ 
                  color: '#4caf50',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleReactivateUser(user)}
              >
                <ActivateIcon />
              </IconButton>
            </Tooltip>
          ) : !isScheduledForDeletion && (
            <Tooltip title="Deactivate User" placement="top">
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
                onClick={() => handleDeactivateUser(user)}
              >
                <BlockIcon />
              </IconButton>
            </Tooltip>
          )}

          {!isScheduledForDeletion ? (
            <Tooltip title="Schedule Deletion" placement="top">
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
                onClick={() => handleScheduleDelete(user)}
              >
                <ScheduleIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Cancel Deletion" placement="top">
              <IconButton 
                size="small" 
                sx={{ 
                  color: '#2196f3',
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleCancelDeletion(user)}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

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
      <ActionDialog />
      <CVDialog />  {/* ADD THIS LINE */}
      <LegalDocsDialog />



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