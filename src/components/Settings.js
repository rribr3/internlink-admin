import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {  
  Settings as SettingsIcon,
  Shield,
  UserPlus, 
  Globe, 
  Moon, 
  User, 
  Mail, 
  Lock, 
  LogOut, 
  UserX, 
  Save, 
  X, 
  Plus,
  Trash2,
  Bell,
  Palette,
  ChevronRight,
  Key,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Star,
  Zap,
  Eye,
  Search,
  ArrowLeft,
  Smartphone,
  Monitor,
  Sun,
  FolderPlus, 
  XCircle, 
  Megaphone, 
  ExternalLink, 
  MoreVertical, 
  ChevronDown
} from 'lucide-react';

// Firebase imports (you need to install: npm install firebase)
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, set, update, push, remove, get } from 'firebase/database';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, updatePassword, signInWithEmailAndPassword, signOut, EmailAuthProvider, reauthenticateWithCredential, updateEmail, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// Firebase Configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyB5njjeJzVsQbOwPHPCv246bqavSz0ZpjU",
  authDomain: "internlink-defe9.firebaseapp.com",
  databaseURL: "https://internlink-defe9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "internlink-defe9",
  storageBucket: "internlink-defe9.firebasestorage.app",
  messagingSenderId: "1028110501477",
  appId: "1:1028110501477:web:bea8c64bda08326235a88c",
  measurementId: "G-50SGHKR860"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);
const auth = getAuth(app);
 // Theme colors
  const theme = {
    light: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardBg: 'rgba(255, 255, 255, 0.95)',
      textPrimary: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      sectionBg: '#f8fafc'
    },
    dark: {
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      cardBg: 'rgba(30, 41, 59, 0.95)',
      textPrimary: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#475569',
      sectionBg: '#374151'
    }
  };
  
const SettingsPage = () => {
  // Current admin user ID (from Firebase Auth)
  const [currentAdminId, setCurrentAdminId] = useState('7V09Rq8Jc8disJdpUnhMxti2o9g2');
  const [adminTab, setAdminTab] = useState('active'); // New state for admin tabs

  
  // State management
  const [notifications, setNotifications] = useState([]);
const [notificationFilter, setNotificationFilter] = useState('all');
const [openMenuId, setOpenMenuId] = useState(null);
const [notificationSettings, setNotificationSettings] = useState(false);
const [hasMoreNotifications, setHasMoreNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState({});
  const [userStatus, setUserStatus] = useState({});
  const [adminUsers, setAdminUsers] = useState({});
  const [settings, setSettings] = useState({
  language: 'English',
  darkMode: false,
  notifications: true,
  emailNotifications: true,
  pushNotifications: false,
  timezone: 'UTC+0',
  systemEmails: true,
  weeklyDigest: false,
  soundAlerts: false,
  emailFrequency: 'immediate'
});




  
  // Dialog states
  const [addAdminDialog, setAddAdminDialog] = useState(false);
const [changeNameDialog, setChangeNameDialog] = useState(false);
const [changeEmailDialog, setChangeEmailDialog] = useState(false);
const [changePasswordDialog, setChangePasswordDialog] = useState(false);
const [deactivateDialog, setDeactivateDialog] = useState(false);
const [logoutDialog, setLogoutDialog] = useState(false); // <-- Add this line
  
  // Form states
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [passwordForm, setPasswordForm] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const currentTheme = settings.darkMode ? theme.dark : theme.light;
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  
  if (tabParam && ['profile', 'security', 'preferences', 'team', 'notifications'].includes(tabParam)) {
    setActiveTab(tabParam);
    
    // Optional: Clear the URL parameter after setting the tab
    if (window.history.replaceState) {
      const url = new URL(window.location);
      url.searchParams.delete('tab');
      window.history.replaceState({}, '', url);
    }
  }
}, []);

const handleTabChange = (newTab) => {
  setActiveTab(newTab);
  
  // Optional: Update URL with current tab
  const url = new URL(window.location);
  url.searchParams.set('tab', newTab);
  window.history.pushState({}, '', url);
};

  // Authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentAdminId(user.uid);
      } else {
        // For demo purposes, we'll use the hardcoded admin ID
        setCurrentAdminId('7V09Rq8Jc8disJdpUnhMxti2o9g2');
      }
    });

    return () => unsubscribe();
  }, []);
  // Add this useEffect to fetch notifications from Firebase
useEffect(() => {
  if (!currentAdminId) return;

  // Listen to announcements for admin
  const announcementsRef = ref(database, 'announcements_by_role/admin');
  const announcementsListener = onValue(announcementsRef, (snapshot) => {
    const announcementsData = snapshot.val();
    const notificationsList = [];
    
    if (announcementsData) {
      Object.entries(announcementsData).forEach(([id, notification]) => {
        notificationsList.push({
          id,
          ...notification
        });
      });
    }
    
    // Sort by timestamp (newest first)
    notificationsList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    setNotifications(notificationsList);
    
    // Check if there are more than 20 notifications for pagination
    setHasMoreNotifications(notificationsList.length > 20);
  });

  return () => off(announcementsRef, 'value', announcementsListener);
}, [currentAdminId]);
const getNotificationIcon = (type) => {
  const iconSize = window.innerWidth < 640 ? 16 : 18;
  switch (type) {
    case 'project_created':
      return <FolderPlus size={iconSize} style={{ color: 'white' }} />;
    case 'project_approved':
      return <CheckCircle size={iconSize} style={{ color: 'white' }} />;
    case 'project_rejected':
      return <XCircle size={iconSize} style={{ color: 'white' }} />;
    case 'announcements':
      return <Megaphone size={iconSize} style={{ color: 'white' }} />;
    default:
      return <Bell size={iconSize} style={{ color: 'white' }} />;
  }
};

const getNotificationIconColor = (type) => {
  switch (type) {
    case 'project_created':
      return '#3b82f6';
    case 'project_approved':
      return '#10b981';
    case 'project_rejected':
      return '#ef4444';
    case 'announcements':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};

const getNotificationBadgeColor = (type) => {
  switch (type) {
    case 'project_created':
      return '#dbeafe';
    case 'project_approved':
      return '#d1fae5';
    case 'project_rejected':
      return '#fee2e2';
    case 'announcements':
      return '#fef3c7';
    case 'issues':
      return '#fee2e2';
    case 'new_company':
      return '#ede9fe';
    default:
      return '#f1f5f9';
  }
};

const getNotificationBadgeTextColor = (type) => {
  switch (type) {
    case 'project_created':
      return '#1d4ed8';
    case 'project_approved':
      return '#059669';
    case 'project_rejected':
      return '#dc2626';
    case 'announcements':
      return '#d97706';
    default:
      return '#475569';
  }
};

const getNotificationTypeLabel = (type) => {
  switch (type) {
    case 'project_created':
      return 'New Project';
    case 'project_approved':
      return 'Approved';
    case 'project_rejected':
      return 'Rejected';
    case 'announcements':
      return 'Announcement';
    case 'issues':
      return 'Issue';
    case 'new_company':
      return 'New Company';
    default:
      return 'Notification';
  }
};

const formatNotificationTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  
  return date.toLocaleDateString();
};

const getFilteredNotifications = () => {
  if (!notifications || !Array.isArray(notifications)) return [];
  
  let filtered = notifications;
  
  if (notificationFilter === 'unread') {
    filtered = notifications.filter(n => !n.isRead);
  } else if (notificationFilter !== 'all') {
    filtered = notifications.filter(n => n.type === notificationFilter);
  }
  
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
};
const getUnreadCount = () => {
  if (!notifications || !Array.isArray(notifications)) return 0;
  return notifications.filter(n => !n.isRead).length;
};

const handleNotificationClick = (notification) => {
  if (!notification.isRead) {
    markAsRead(notification.id);
  }
  // Add any additional click handling here
};

const toggleNotificationMenu = (notificationId) => {
  setOpenMenuId(openMenuId === notificationId ? null : notificationId);
};
// Add these handler functions
const markAllAsRead = async () => {
  try {
    const updates = {};
    notifications.forEach(notification => {
      if (!notification.isRead) {
        updates[`announcements_by_role/admin/${notification.id}/isRead`] = true;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
      showNotification('All notifications marked as read', 'success');
    }
  } catch (error) {
    console.error('Error marking all as read:', error);
    showNotification('Failed to mark all as read', 'error');
  }
};

const markAsRead = async (notificationId, isRead = true) => {
  try {
    const notificationRef = ref(database, `announcements_by_role/admin/${notificationId}`);
    await update(notificationRef, { isRead });
    showNotification(isRead ? 'Notification marked as read' : 'Notification marked as unread', 'success');
  } catch (error) {
    console.error('Error updating notification:', error);
    showNotification('Failed to update notification', 'error');
  }
};

const deleteNotification = async (notificationId) => {
  try {
    const notificationRef = ref(database, `announcements_by_role/admin/${notificationId}`);
    await remove(notificationRef);
    showNotification('Notification deleted', 'success');
  } catch (error) {
    console.error('Error deleting notification:', error);
    showNotification('Failed to delete notification', 'error');
  }
};
const navigate = useNavigate();

// Update the navigateToProject function
const navigateToProject = (projectId) => {
  // Navigate to projects page with the project ID as a query parameter
  navigate(`/projects?projectId=${projectId}`);
  showNotification('Navigating to project...', 'success');
};
const navigateToCompany = (companyId) => {
  navigate(`/users?action=viewProfile&companyId=${companyId}`);
  showNotification('Navigating to company details...', 'success');
};
const navigateToIssue = (issueId) => {
  // Use the correct path: /issues instead of /issuereports
  navigate(`/issues?issueId=${issueId}`);
  showNotification('Navigating to issue report...', 'success');
};
const loadMoreNotifications = () => {
  // Load more notifications from Firebase (pagination)
  // Implement based on your pagination strategy
  console.log('Load more notifications');
  showNotification('Load more functionality not implemented yet', 'info');
};

// Add this useEffect to handle clicking outside notification menus
useEffect(() => {
  const handleClickOutside = () => {
    setOpenMenuId(null);
  };
  
  if (openMenuId) {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }
}, [openMenuId]);

  // Firebase listeners
  useEffect(() => {
    if (!currentAdminId) return;

    const listeners = [];

    // Listen to current admin user data
    const userRef = ref(database, `users/${currentAdminId}`);
    const userListener = onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        setCurrentUser({
          id: currentAdminId,
          ...userData,
          joinDate: userData.joinDate || new Date().toISOString().split('T')[0]
        });
        setConnectionStatus('connected');
      } else {
        setError('User data not found');
      }
    }, (error) => {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
      setConnectionStatus('disconnected');
    });
    listeners.push(() => off(userRef, 'value', userListener));

    // Listen to all users data
    const allUsersRef = ref(database, 'users');
    const allUsersListener = onValue(allUsersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        setAllUsers(usersData);
        
        // Filter admin users
        const admins = {};
Object.keys(usersData).forEach(userId => {
  if (usersData[userId].role === 'admin') {
    admins[userId] = {
      ...usersData[userId],
      id: userId
    };
  }
});
setAdminUsers(admins);
      }
    }, (error) => {
      console.error('Error fetching users data:', error);
    });
    listeners.push(() => off(allUsersRef, 'value', allUsersListener));

    // Listen to user status data
    const statusRef = ref(database, 'user_status');
    const statusListener = onValue(statusRef, (snapshot) => {
      const statusData = snapshot.val();
      if (statusData) {
        setUserStatus(statusData);
      }
    });
    listeners.push(() => off(statusRef, 'value', statusListener));

    // Listen to current admin settings
    const settingsRef = ref(database, `settings/${currentAdminId}`);
    const settingsListener = onValue(settingsRef, (snapshot) => {
      const settingsData = snapshot.val();
      if (settingsData) {
        setSettings(prev => ({ ...prev, ...settingsData }));
      }
    });
    listeners.push(() => off(settingsRef, 'value', settingsListener));

    // Connection status monitoring
    const connectedRef = ref(database, '.info/connected');
    const connectionListener = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        setConnectionStatus('connected');
        // Update user's online status
        const userStatusRef = ref(database, `user_status/${currentAdminId}`);
        set(userStatusRef, {
          online: true,
          lastSeen: Date.now()
        });
      } else {
        setConnectionStatus('disconnected');
      }
    });
    listeners.push(() => off(connectedRef, 'value', connectionListener));

    // Cleanup all listeners
    return () => {
      listeners.forEach(cleanup => cleanup());
    };
  }, [currentAdminId]);

const handleAddAdmin = async () => {
  if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
    showNotification('Please fill all fields', 'error');
    return;
  }

  if (newAdmin.password.length < 8) {
    showNotification('Password must be at least 8 characters', 'error');
    return;
  }

  setLoading(true);
  try {
    // Step 1: Create user in Firebase Authentication
    console.log('Creating user in Firebase Auth...');
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      newAdmin.email, 
      newAdmin.password
    );
    
    const firebaseUserId = userCredential.user.uid;
    console.log('Firebase Auth user created with ID:', firebaseUserId);

    // Step 2: Generate admin ID in your format (using Firebase UID instead of custom format)
    const adminId = firebaseUserId; // Use Firebase UID as the admin ID

    // Step 3: Save admin data to Realtime Database
    const adminData = {
  email: newAdmin.email,
  name: newAdmin.name,
  role: 'admin',
  status: 'active' // Add this line
};

    const userRef = ref(database, `users/${adminId}`);
    await set(userRef, adminData);

    showNotification('Admin added successfully', 'success');
    setAddAdminDialog(false);
    setNewAdmin({ name: '', email: '', password: '' });
    
  } catch (error) {
    console.error('Error adding admin:', error);
    
    // Provide user-friendly error messages
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    }
    
    showNotification('Failed to add admin: ' + errorMessage, 'error');
  }
  setLoading(false);
};


  const handleChangeName = async () => {
    if (!newName.trim()) {
      showNotification('Please enter a valid name', 'error');
      return;
    }

    setLoading(true);
    try {
      const userRef = ref(database, `users/${currentAdminId}`);
      await update(userRef, { name: newName });
      
      showNotification('Name updated successfully', 'success');
      setChangeNameDialog(false);
      setNewName('');
    } catch (error) {
      console.error('Error updating name:', error);
      showNotification('Failed to update name: ' + error.message, 'error');
    }
    setLoading(false);
  };

// (Removed duplicate imports - already imported at the top)

const handleChangeEmail = async () => {
  if (!newEmail.trim() || !newEmail.includes('@')) {
    showNotification('Please enter a valid email', 'error');
    return;
  }

  if (!passwordForm.currentPassword) {
    showNotification('Please enter your current password to change email', 'error');
    return;
  }

  setLoading(true);
  try {
    // Get current Firebase Auth user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showNotification('No authenticated user found. Please log in again.', 'error');
      setLoading(false);
      return;
    }

    // Check if email is already in use by another user in database
    const allUsersRef = ref(database, 'users');
    const snapshot = await get(allUsersRef);
    const allUsers = snapshot.val();
    
    // Check if new email is already used by another user
    const emailExists = Object.values(allUsers || {}).some(user => 
      user.email === newEmail && user.id !== currentAdminId
    );
    
    if (emailExists) {
      showNotification('This email is already in use by another user', 'error');
      setLoading(false);
      return;
    }

    // Step 1: Re-authenticate user with current password (required by Firebase)
    const credential = EmailAuthProvider.credential(
      currentUser.email, 
      passwordForm.currentPassword
    );
    
    await reauthenticateWithCredential(currentUser, credential);
    console.log('✅ Re-authentication successful');

    // Step 2: Update email in Firebase Authentication
    await updateEmail(currentUser, newEmail);
    console.log('✅ Email updated in Firebase Auth - user can now login with new email');

    // Step 3: Update email in Realtime Database
    const userRef = ref(database, `users/${currentAdminId}`);
    await update(userRef, { 
      email: newEmail,
      emailLastChanged: new Date().toISOString()
    });
    console.log('✅ Email updated in Realtime Database');

    showNotification('Email updated successfully! You can now login with your new email.', 'success');
    setChangeEmailDialog(false);
    setNewEmail('');
    setPasswordForm(prev => ({ ...prev, currentPassword: '' }));
    
  } catch (error) {
    console.error('❌ Error updating email:', error);
    
    let errorMessage = error.message;
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already used by another Firebase account';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address';
        break;
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage = 'Current password is incorrect';
        break;
      case 'auth/requires-recent-login':
        errorMessage = 'Please log out and log in again, then try changing email';
        break;
      case 'auth/operation-not-allowed':
        // Fallback to database-only update if Firebase Auth doesn't allow email changes
        try {
          const userRef = ref(database, `users/${currentAdminId}`);
          await update(userRef, { 
            email: newEmail,
            emailLastChanged: new Date().toISOString(),
            emailUpdateNote: 'Email updated in database only. Firebase Auth login remains with original email.'
          });
          
          showNotification(
            'Email updated in database only. Firebase Auth email changes are disabled. You will login with your original email.', 
            'success'
          );
          setChangeEmailDialog(false);
          setNewEmail('');
          setPasswordForm(prev => ({ ...prev, currentPassword: '' }));
          setLoading(false);
          return;
        } catch (dbError) {
          errorMessage = 'Email changes are disabled and database update failed: ' + dbError.message;
        }
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = 'Failed to update email: ' + error.message;
    }
    
    showNotification(errorMessage, 'error');
  }
  setLoading(false);
};

// OR - Complete Firebase Auth + Database solution (more complex but complete)
const handleChangeEmailComplete = async () => {
  if (!newEmail.trim() || !newEmail.includes('@')) {
    showNotification('Please enter a valid email', 'error');
    return;
  }

  if (!passwordForm.currentPassword) {
    showNotification('Please enter your current password', 'error');
    return;
  }

  setLoading(true);
  try {
    // Step 1: Create new Firebase Auth user with new email
    const newUserCredential = await createUserWithEmailAndPassword(
      auth, 
      newEmail, 
      passwordForm.currentPassword // Use same password
    );
    
    const newUserId = newUserCredential.user.uid;
    
    // Step 2: Copy user data to new user ID
    const oldUserRef = ref(database, `users/${currentAdminId}`);
    const snapshot = await get(oldUserRef);
    const userData = snapshot.val();
    
    const newUserRef = ref(database, `users/${newUserId}`);
    await set(newUserRef, {
      ...userData,
      email: newEmail,
      emailLastChanged: new Date().toISOString(),
      migratedFrom: currentAdminId,
      firebaseUserId: newUserId
    });
    
    // Step 3: Mark old account as migrated
    await update(oldUserRef, {
      status: 'migrated',
      migratedTo: newUserId,
      migratedAt: new Date().toISOString()
    });
    
    // Step 4: Update current admin ID to new user ID
    setCurrentAdminId(newUserId);
    
    showNotification(
      'Email changed successfully! You now have a new account with the new email. Please log in with your new email next time.', 
      'success'
    );
    setChangeEmailDialog(false);
    setNewEmail('');
    setPasswordForm(prev => ({ ...prev, currentPassword: '' }));
    
  } catch (error) {
    console.error('Error changing email:', error);
    
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered to another Firebase account';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak for the new account';
    }
    
    showNotification('Failed to change email: ' + errorMessage, 'error');
  }
  setLoading(false);
};
const clearAllNotifications = async () => {
  try {
    const announcementsRef = ref(database, 'announcements_by_role/admin');
    await remove(announcementsRef);
    showNotification('All notifications cleared', 'success');
  } catch (error) {
    console.error('Error clearing notifications:', error);
    showNotification('Failed to clear notifications', 'error');
  }
};


  
const handleChangePassword = async () => {
  if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    showNotification('Please fill all password fields', 'error');
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showNotification('New passwords do not match', 'error');
    return;
  }

  if (passwordForm.newPassword.length < 8) {
    showNotification('Password must be at least 8 characters', 'error');
    return;
  }

  setLoading(true);
  try {
    // Get current user from Firebase Auth
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showNotification('No authenticated user found. Please log in again.', 'error');
      setLoading(false);
      return;
    }

    // Step 1: Re-authenticate user with current password
    const credential = EmailAuthProvider.credential(
      currentUser.email, 
      passwordForm.currentPassword
    );
    
    await reauthenticateWithCredential(currentUser, credential);
    console.log('✅ Re-authentication successful');
    
    // Step 2: Update password in Firebase Authentication
    await updatePassword(currentUser, passwordForm.newPassword);
    console.log('✅ Password updated in Firebase Auth');
    
    // Step 3: Update password change timestamp in Realtime Database
    const userRef = ref(database, `users/${currentAdminId}`);
    await update(userRef, { 
      passwordLastChanged: new Date().toISOString()
    });
    console.log('✅ Password change timestamp updated in database');
      
    showNotification('Password updated successfully', 'success');
    setChangePasswordDialog(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
  } catch (error) {
    console.error('❌ Error updating password:', error);
    
    let errorMessage = error.message;
    switch (error.code) {
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage = 'Current password is incorrect';
        break;
      case 'auth/weak-password':
        errorMessage = 'New password is too weak. Use at least 6 characters.';
        break;
      case 'auth/requires-recent-login':
        errorMessage = 'Please log out and log in again before changing password';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = 'Failed to update password: ' + error.message;
    }
    
    showNotification(errorMessage, 'error');
  }
  setLoading(false);
};

  const handleSettingChange = async (key, value) => {
    try {
      const settingsRef = ref(database, `settings/${currentAdminId}`);
      await update(settingsRef, { [key]: value });
      
      showNotification(`${key.charAt(0).toUpperCase() + key.slice(1)} updated`, 'success');
    } catch (error) {
      console.error('Error updating setting:', error);
      showNotification(`Failed to update ${key}: ` + error.message, 'error');
    }
  };

  const handleRemoveAdmin = async (adminId) => {
  if (adminId === currentAdminId) {
    showNotification('Cannot deactivate yourself', 'error');
    return;
  }

  try {
    const userRef = ref(database, `users/${adminId}`);
    await update(userRef, { 
      status: 'deactivated', 
      deactivatedAt: new Date().toISOString(),
      deactivatedBy: currentAdminId,
      deactivationReason: 'Admin deactivation by administrator'
    });
    
    const statusRef = ref(database, `user_status/${adminId}`);
    await update(statusRef, { online: false });
    
    showNotification('Admin deactivated successfully', 'success');
  } catch (error) {
    console.error('Error deactivating admin:', error);
    showNotification('Failed to deactivate admin: ' + error.message, 'error');
  }
};

  const handleLogout = async () => {
  setLoading(true);
  try {
    // Update user status to offline
    const statusRef = ref(database, `user_status/${currentAdminId}`);
    await update(statusRef, { 
      online: false, 
      lastSeen: Date.now() 
    });
    
    // Sign out from Firebase Auth
    await signOut(auth);
    
    showNotification('Logged out successfully', 'success');
    setLogoutDialog(false);
    
    // Optional: Redirect to login page
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
    
  } catch (error) {
    console.error('Error logging out:', error);
    showNotification('Failed to logout: ' + error.message, 'error');
  }
  setLoading(false);
};

 const handleDeactivateAccount = async () => {
  setLoading(true);
  try {
    const userRef = ref(database, `users/${currentAdminId}`);
    const deactivationDate = new Date().toISOString();
    const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
    
    // Mark account as deactivated with deletion schedule
    await update(userRef, { 
      status: 'deactivated', 
      deactivatedAt: deactivationDate,
      scheduledDeletion: deletionDate,
      deactivationReason: 'User requested account deactivation'
    });
    
    // Update user status to offline
    const statusRef = ref(database, `user_status/${currentAdminId}`);
    await update(statusRef, { 
      online: false,
      lastSeen: Date.now(),
      accountStatus: 'deactivated'
    });
    
    // Schedule deletion job (you would typically use a cloud function for this)
    await scheduleAccountDeletion(currentAdminId, deletionDate);
    
    showNotification('Account deactivated successfully. Will be permanently deleted in 30 days.', 'success');
    setDeactivateDialog(false);
    
    // Sign out user
    setTimeout(async () => {
      await signOut(auth);
      window.location.href = '/login';
    }, 2000);
    
  } catch (error) {
    console.error('Error deactivating account:', error);
    showNotification('Failed to deactivate account: ' + error.message, 'error');
  }
  setLoading(false);
};
const scheduleAccountDeletion = async (userId, deletionDate) => {
  try {
    // Create a scheduled deletion record
    const deletionRef = ref(database, `scheduled_deletions/${userId}`);
    await set(deletionRef, {
      userId: userId,
      scheduledFor: deletionDate,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    
    console.log(`Account ${userId} scheduled for deletion on ${deletionDate}`);
  } catch (error) {
    console.error('Error scheduling account deletion:', error);
  }
};
const cleanupDeactivatedAccounts = async () => {
  try {
    const scheduledDeletionsRef = ref(database, 'scheduled_deletions');
    const snapshot = await get(scheduledDeletionsRef);
    const deletions = snapshot.val();
    
    if (!deletions) return;
    
    const now = new Date().toISOString();
    
    for (const [userId, deletion] of Object.entries(deletions)) {
      if (deletion.status === 'pending' && deletion.scheduledFor <= now) {
        await performAccountDeletion(userId);
      }
    }
  } catch (error) {
    console.error('Error checking scheduled deletions:', error);
  }
};

const performAccountDeletion = async (userId) => {
  try {
    console.log(`Performing scheduled deletion for user ${userId}`);
    
    // 1. Delete from Realtime Database
    const userRef = ref(database, `users/${userId}`);
    await remove(userRef);
    
    const statusRef = ref(database, `user_status/${userId}`);
    await remove(statusRef);
    
    const settingsRef = ref(database, `settings/${userId}`);
    await remove(settingsRef);
    
    // 2. Delete from Firebase Authentication (if user exists)
    // Note: This requires admin SDK in a cloud function for production
    // For now, we'll just mark as deleted in database
    
    // 3. Remove from scheduled deletions
    const deletionRef = ref(database, `scheduled_deletions/${userId}`);
    await update(deletionRef, {
      status: 'completed',
      deletedAt: new Date().toISOString()
    });
    
    console.log(`User ${userId} successfully deleted from all systems`);
    
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    
    // Mark deletion as failed
    const deletionRef = ref(database, `scheduled_deletions/${userId}`);
    await update(deletionRef, {
      status: 'failed',
      error: error.message,
      lastAttempt: new Date().toISOString()
    });
  }
};



const fixEmailMismatch = async () => {
  setLoading(true);
  try {
    console.log('🔧 Fixing email mismatch - syncing to NEW email...');
    
    const currentAuthUser = auth.currentUser;
    if (!currentAuthUser) {
      showNotification('No user signed in to Firebase Auth', 'error');
      setLoading(false);
      return;
    }
    
    const oldEmail = currentAuthUser.email; // noura@gmail.com
    const newEmail = currentUser.email;     // noura10@gmail.com
    
    console.log('Syncing FROM:', oldEmail);
    console.log('Syncing TO:', newEmail);
    
    // Check if emails are different
    if (oldEmail === newEmail) {
      showNotification('Emails already match!', 'success');
      setLoading(false);
      return;
    }

    // Method 1: Try direct email update first
    try {
      await updateEmail(currentAuthUser, newEmail);
      console.log('✅ Direct email update successful!');
      
      // Clean up database
      const userRef = ref(database, `users/${currentAdminId}`);
      await update(userRef, {
        emailUpdateNote: null,
        emailSyncedAt: new Date().toISOString(),
        emailSyncMethod: 'direct_update'
      });
      
      showNotification('Email synced successfully! You can now login with: ' + newEmail, 'success');
      setLoading(false);
      return;
      
    } catch (directError) {
      console.log('❌ Direct update failed:', directError.code);
      
      if (directError.code === 'auth/operation-not-allowed') {
        // Fall back to account migration method
        console.log('🔄 Falling back to account migration...');
        await migrateToNewEmailAccount(oldEmail, newEmail);
      } else {
        throw directError; // Re-throw other errors
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing email mismatch:', error);
    showNotification('Failed to fix email: ' + error.message, 'error');
  }
  setLoading(false);
};

// Account migration method when direct update fails
const migrateToNewEmailAccount = async (oldEmail, newEmail) => {
  try {
    console.log('🔄 Migrating account from', oldEmail, 'to', newEmail);
    
    // Step 1: Get current user data and settings
    const oldUserRef = ref(database, `users/${currentAdminId}`);
    const oldSettingsRef = ref(database, `settings/${currentAdminId}`);
    
    const [userSnapshot, settingsSnapshot] = await Promise.all([
      get(oldUserRef),
      get(oldSettingsRef)
    ]);
    
    const userData = userSnapshot.val();
    const settingsData = settingsSnapshot.val();
    
    if (!userData) {
      throw new Error('Current user data not found');
    }
    
    // Step 2: Generate a temporary password for the new account
    const tempPassword = 'Temp' + Math.random().toString(36).substring(2, 10) + '!';
    
    // Step 3: Create new Firebase Auth account with new email
    const newUserCredential = await createUserWithEmailAndPassword(
      auth,
      newEmail,
      tempPassword
    );
    
    const newUserId = newUserCredential.user.uid;
    console.log('✅ New Firebase Auth account created:', newUserId);
    
    // Step 4: Create user record with new Firebase UID
    const newUserRef = ref(database, `users/${newUserId}`);
    await set(newUserRef, {
      ...userData,
      email: newEmail,
      firebaseUserId: newUserId,
      migratedFrom: currentAdminId,
      migratedAt: new Date().toISOString(),
      emailUpdateNote: null,
      tempPassword: tempPassword, // Store temporarily for user reference
      migrationReason: 'Email sync - Firebase required account migration'
    });
    
    // Step 5: Copy settings to new account
    if (settingsData) {
      const newSettingsRef = ref(database, `settings/${newUserId}`);
      await set(newSettingsRef, settingsData);
    }
    
    // Step 6: Copy user status
    const oldStatusRef = ref(database, `user_status/${currentAdminId}`);
    const statusSnapshot = await get(oldStatusRef);
    const statusData = statusSnapshot.val();
    
    if (statusData) {
      const newStatusRef = ref(database, `user_status/${newUserId}`);
      await set(newStatusRef, {
        ...statusData,
        migratedAt: Date.now()
      });
    }
    
    // Step 7: Mark old account as migrated
    await update(oldUserRef, {
      status: 'migrated',
      migratedTo: newUserId,
      migratedAt: new Date().toISOString(),
      migrationReason: 'Email sync to ' + newEmail
    });
    
    // Step 8: Update current admin ID
    setCurrentAdminId(newUserId);
    
    // Step 9: Show success message with new credentials
    const message = `✅ Email synced successfully! 
    
New login credentials:
📧 Email: ${newEmail}
🔑 Temporary Password: ${tempPassword}

Please save this password and change it after logging in.
You will be redirected to login page in 10 seconds.`;
    
    showNotification('Account migrated successfully! Check console for new login details.', 'success');
    console.log('🎉 MIGRATION COMPLETE!');
    console.log('📧 New Email:', newEmail);
    console.log('🔑 Temporary Password:', tempPassword);
    console.log('🆔 New User ID:', newUserId);
    
    // Show detailed message
    alert(message);
    
    // Auto-redirect to login page
    setTimeout(() => {
      if (window.confirm('Ready to login with your new email?')) {
        window.location.href = '/login';
      }
    }, 10000);
    
  } catch (migrationError) {
    console.error('❌ Migration failed:', migrationError);
    
    let errorMessage = migrationError.message;
    if (migrationError.code === 'auth/email-already-in-use') {
      errorMessage = 'The new email is already used by another Firebase account. Please use a different email.';
    }
    
    throw new Error('Account migration failed: ' + errorMessage);
  }
};

// Also add this enhanced password requirement function for new accounts
const generateSecurePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase  
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
  
  // Fill rest randomly
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Debug function to check current state
// (Removed duplicate debugEmailState function to avoid redeclaration error)

  // Revert Database Email to Match Firebase Auth
  const revertDatabaseEmail = async () => {
    setLoading(true);
    try {
      console.log('🔧 Reverting database email to match Firebase Auth...');
      
      const currentAuthUser = auth.currentUser;
      if (!currentAuthUser) {
        showNotification('No user signed in to Firebase Auth', 'error');
        setLoading(false);
        return;
      }
      
      // Update database to match Firebase Auth
      const userRef = ref(database, `users/${currentAdminId}`);
      await update(userRef, {
        email: currentAuthUser.email,
        emailUpdateNote: null,
        emailRevertedAt: new Date().toISOString()
      });
      
      showNotification('Database email reverted to match Firebase Auth', 'success');
      console.log('✅ Database email reverted to:', currentAuthUser.email);
      
    } catch (error) {
      console.error('❌ Error reverting database email:', error);
      showNotification('Failed to revert database email: ' + error.message, 'error');
    }
    setLoading(false);
  };

  // Debug Email State Function
  const debugEmailState = () => {
    const currentAuthUser = auth.currentUser;
    console.log('=== EMAIL DEBUG ===');
    console.log('Firebase Auth Email:', currentAuthUser?.email || 'Not signed in');
    console.log('Database Email:', currentUser?.email || 'Not loaded');
    console.log('Current Admin ID:', currentAdminId);
    console.log('Email Update Note:', currentUser?.emailUpdateNote || 'None');
    console.log('==================');
    
    if (currentAuthUser && currentUser && currentAuthUser.email !== currentUser.email) {
      console.log('⚠️ EMAIL MISMATCH DETECTED!');
      console.log('Use the Fix Email Sync button to resolve this.');
    } else {
      console.log('✅ Emails are in sync');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10b981';
      case 'connecting': return '#f59e0b';
      case 'disconnected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const isUserOnline = (userId) => {
    const status = userStatus[userId];
    return status && status.online && (Date.now() - (status.lastSeen || 0) < 300000);
  };

  // 3. ADD THESE FUNCTIONS BEFORE THE EXISTING getActiveAdmins FUNCTION:
const getActiveAdmins = () => {
  return Object.keys(adminUsers).filter(userId => {
    const user = adminUsers[userId];
    return user.status === 'active';
  });
};
const getDeactivatedAdmins = () => {
  return Object.keys(adminUsers).filter(userId => {
    const user = adminUsers[userId];
    return user.status === 'deactivated';
  });
};
const handleReactivateAdmin = async (adminId) => {
  try {
    const userRef = ref(database, `users/${adminId}`);
    await update(userRef, { 
      status: 'active', 
      reactivatedAt: new Date().toISOString(),
      reactivatedBy: currentAdminId,
      deactivatedAt: null,
      deactivatedBy: null,
      deactivationReason: null
    });
    
    showNotification('Admin reactivated successfully', 'success');
  } catch (error) {
    console.error('Error reactivating admin:', error);
    showNotification('Failed to reactivate admin: ' + error.message, 'error');
  }
};

  // Define styles as objects to prevent recreation on each render
  const inputStyle = useMemo(() => ({
    width: '100%',
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.2s',
    outline: 'none'
  }), [currentTheme, settings.darkMode]);

  const inputFocusStyle = useMemo(() => ({
    ...inputStyle,
    borderColor: '#667eea'
  }), [inputStyle]);

  // Memoize modal component to prevent unnecessary re-renders
  const Modal = useMemo(() => React.memo(({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: size === 'sm' ? '400px' : size === 'md' ? '500px' : size === 'lg' ? '600px' : '700px',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 32px',
            borderBottom: '1px solid #f1f5f9',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: 'white'
            }}>{title}</h3>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <X size={20} />
            </button>
          </div>
          <div style={{ padding: '32px', maxHeight: 'calc(90vh - 100px)', overflow: 'auto' }}>
            {children}
          </div>
        </div>
      </div>
    );
  }), []);

  // Memoize event handlers to prevent recreation
  const handleNewAdminChange = useCallback((field, value) => {
    setNewAdmin(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNewNameChange = useCallback((value) => {
    setNewName(value);
  }, []);

 

  const handlePasswordFormChange = useCallback((field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const Avatar = ({ name, size = 'md', status = false, userId = null }) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
    const sizeClasses = {
      sm: { width: '40px', height: '40px', fontSize: '16px' },
      md: { width: '56px', height: '56px', fontSize: '20px' },
      lg: { width: '72px', height: '72px', fontSize: '24px' },
      xl: { width: '96px', height: '96px', fontSize: '32px' }
    };

    const online = userId ? isUserOnline(userId) : false;

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{
          ...sizeClasses[size],
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '700',
          border: '3px solid white',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }}>
          {initials}
        </div>
        {status && (
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            width: '16px',
            height: '16px',
            backgroundColor: online ? '#10b981' : '#6b7280',
            borderRadius: '50%',
            border: '2px solid white'
          }}></div>
        )}
      </div>
    );
  };

  const ToggleSwitch = ({ checked, onChange, size = 'md' }) => {
    const sizes = {
      sm: { width: '40px', height: '24px', toggle: '20px' },
      md: { width: '48px', height: '28px', toggle: '24px' }
    };

    return (
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: sizes[size].width,
          height: sizes[size].height,
          backgroundColor: checked ? '#667eea' : '#e2e8f0',
          border: 'none',
          borderRadius: '14px',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: checked ? '0 4px 12px rgba(102, 126, 234, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{
          width: sizes[size].toggle,
          height: sizes[size].toggle,
          backgroundColor: 'white',
          borderRadius: '50%',
          position: 'absolute',
          top: '2px',
          left: checked ? `calc(100% - ${sizes[size].toggle} - 2px)` : '2px',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}></div>
      </button>
    );
  };

  const ConnectionIndicator = () => (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '8px 16px',
      backgroundColor: 'white',
      borderRadius: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      zIndex: 1001
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: getConnectionStatusColor()
      }}></div>
      <span style={{
        fontSize: '12px',
        fontWeight: '600',
        color: '#374151',
        textTransform: 'capitalize'
      }}>
        {connectionStatus}
      </span>
    </div>
  );

  const NotificationToast = () => {
    if (!notification.show) return null;

    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '16px 24px',
        backgroundColor: notification.type === 'error' ? '#ef4444' : '#10b981',
        color: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '400px'
      }}>
        {notification.type === 'error' ? (
          <AlertTriangle size={20} />
        ) : (
          <CheckCircle size={20} />
        )}
        <span style={{ fontSize: '14px', fontWeight: '500' }}>
          {notification.message}
        </span>
      </div>
    );
  };

  const tabItems = [
    { id: 'profile', label: 'My Profile', icon: User, color: '#667eea' },
    { id: 'security', label: 'Security', icon: Shield, color: '#f093fb' },
    { id: 'preferences', label: 'Preferences', icon: Palette, color: '#4facfe' },
    { id: 'team', label: 'Admin Management', icon: UserPlus, color: '#43e97b' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: '#fa709a' }
  ];

  // Show authentication error if no user
  if (!currentAdminId) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <AlertTriangle size={48} style={{ color: '#ef4444', margin: '0 auto 20px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Authentication Required</h3>
          <p style={{ margin: '0', color: '#64748b' }}>Please sign in to access admin settings</p>
        </div>
      </div>
    );
  }

  // Show loading if no current user data
  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #667eea',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Loading Settings</h3>
          <p style={{ margin: '0', color: '#64748b' }}>Connecting to Firebase...</p>
          {error && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
              <p style={{ margin: '0', color: '#dc2626', fontSize: '14px' }}>{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <ConnectionIndicator />
      <NotificationToast />

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '32px',
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '32px',
        minHeight: 'calc(100vh - 140px)'
      }}>
        {/* Sidebar */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '24px',
          height: 'fit-content',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <Avatar name={currentUser.name} size="xl" status={true} userId={currentUser.id} />
            <h3 style={{ 
              margin: '16px 0 4px 0', 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#1e293b' 
            }}>
              {currentUser.name}
            </h3>
            <p style={{ 
              margin: '0 0 8px 0', 
              color: '#64748b', 
              fontSize: '14px' 
            }}>
              {currentUser.email}
            </p>
            <span style={{
              backgroundColor: '#ecfdf5',
              color: '#059669',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}>
              {currentUser.role}
            </span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tabItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    backgroundColor: isActive ? `${item.color}15` : 'transparent',
                    color: isActive ? item.color : '#64748b',
                    border: isActive ? `2px solid ${item.color}30` : '2px solid transparent',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    transform: isActive ? 'translateX(4px)' : 'translateX(0)'
                  }}
                >
                  <Icon size={20} style={{ marginRight: '12px' }} />
                  {item.label}
                  {isActive && (
                    <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
                  )}
                </button>
              );
            })}
          </nav>

          <div style={{
            marginTop: '32px',
            padding: '20px',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            borderRadius: '16px',
            border: '1px solid #f59e0b20'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                padding: '8px',
                backgroundColor: '#f59e0b',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Star size={16} style={{ color: 'white' }} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#92400e' }}>
                  Real-time Updates
                </h4>
                <p style={{ margin: '0', fontSize: '12px', color: '#b45309', lineHeight: '1.4' }}>
                  All changes are automatically synced with Firebase Realtime Database!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden'
        }}>
          
{/* Team Tab */}
{activeTab === 'team' && (
  <div className="min-h-screen bg-gray-50">
    {/* Header Section */}
    <div style={{
      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      padding: 'clamp(20px, 5vw, 40px)',
      color: 'white'
    }}>
      <div className="max-w-7xl mx-auto">
        <div style={{ 
          display: 'flex', 
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
          gap: window.innerWidth < 768 ? '20px' : '16px'
        }}>
          <div>
            <h2 style={{ 
              margin: '0 0 8px 0', 
              fontSize: 'clamp(20px, 4vw, 28px)', 
              fontWeight: '700',
              lineHeight: '1.2'
            }}>
              Admin Management
            </h2>
            <p style={{ 
              margin: '0', 
              fontSize: 'clamp(14px, 2.5vw, 16px)', 
              opacity: 0.9,
              maxWidth: window.innerWidth < 768 ? '100%' : '600px'
            }}>
              Manage administrators and permissions • {getActiveAdmins().length} active • {getDeactivatedAdmins().length} deactivated
            </p>
          </div>
          <button
            onClick={() => setAddAdminDialog(true)}
            style={{
              padding: window.innerWidth < 768 ? '12px 20px' : '14px 28px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              fontSize: window.innerWidth < 768 ? '13px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content'
            }}
          >
            <UserPlus size={window.innerWidth < 768 ? 14 : 16} />
            {window.innerWidth < 480 ? 'Add Admin' : 'Add Administrator'}
          </button>
        </div>
      </div>
    </div>

    {/* Content Section */}
    <div className="max-w-7xl mx-auto" style={{ padding: 'clamp(20px, 5vw, 32px)' }}>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        flexDirection: window.innerWidth < 640 ? 'column' : 'row',
        gap: window.innerWidth < 640 ? '12px' : '8px',
        marginBottom: 'clamp(24px, 4vw, 32px)',
        padding: window.innerWidth < 640 ? '12px' : '6px',
        backgroundColor: '#f1f5f9',
        borderRadius: '16px'
      }}>
        <button
          onClick={() => setAdminTab('active')}
          style={{
            flex: 1,
            padding: window.innerWidth < 640 ? '16px 20px' : '14px 20px',
            backgroundColor: adminTab === 'active' ? 'white' : 'transparent',
            color: adminTab === 'active' ? '#059669' : '#64748b',
            border: 'none',
            borderRadius: '12px',
            fontSize: 'clamp(13px, 2vw, 14px)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            boxShadow: adminTab === 'active' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'
          }}
        >
          <CheckCircle size={window.innerWidth < 640 ? 14 : 16} />
          <span style={{ whiteSpace: window.innerWidth < 480 ? 'nowrap' : 'normal' }}>
            {window.innerWidth < 480 ? `Active (${getActiveAdmins().length})` : `Active Admins (${getActiveAdmins().length})`}
          </span>
        </button>
        <button
          onClick={() => setAdminTab('deactivated')}
          style={{
            flex: 1,
            padding: window.innerWidth < 640 ? '16px 20px' : '14px 20px',
            backgroundColor: adminTab === 'deactivated' ? 'white' : 'transparent',
            color: adminTab === 'deactivated' ? '#dc2626' : '#64748b',
            border: 'none',
            borderRadius: '12px',
            fontSize: 'clamp(13px, 2vw, 14px)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            boxShadow: adminTab === 'deactivated' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'
          }}
        >
          <UserX size={window.innerWidth < 640 ? 14 : 16} />
          <span style={{ whiteSpace: window.innerWidth < 480 ? 'nowrap' : 'normal' }}>
            {window.innerWidth < 480 ? `Inactive (${getDeactivatedAdmins().length})` : `Deactivated (${getDeactivatedAdmins().length})`}
          </span>
        </button>
      </div>

      {/* Active Admins Tab */}
      {adminTab === 'active' && (
        <div>
          {getActiveAdmins().length === 0 ? (
            <div style={{
              padding: 'clamp(40px, 8vw, 60px) clamp(20px, 5vw, 40px)',
              textAlign: 'center',
              backgroundColor: '#f0fdf4',
              borderRadius: '16px',
              border: '2px dashed #bbf7d0'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#dcfce7',
                borderRadius: '50%',
                width: 'clamp(48px, 10vw, 64px)',
                height: 'clamp(48px, 10vw, 64px)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle size={window.innerWidth < 640 ? 20 : 24} style={{ color: '#059669' }} />
              </div>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: 'clamp(16px, 3vw, 18px)', 
                fontWeight: '700', 
                color: '#065f46' 
              }}>
                No active administrators
              </h3>
              <p style={{ 
                margin: '0 0 24px 0', 
                fontSize: 'clamp(13px, 2.5vw, 14px)', 
                color: '#047857',
                maxWidth: '400px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                Start building your admin team by adding administrators
              </p>
              <button
                onClick={() => setAddAdminDialog(true)}
                style={{
                  padding: window.innerWidth < 640 ? '12px 20px' : '12px 24px',
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: 'clamp(13px, 2.5vw, 14px)',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Add First Administrator
              </button>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: 'clamp(12px, 3vw, 16px)'
            }}>
              {getActiveAdmins().map((adminId) => {
                const admin = adminUsers[adminId];
                const isOnline = isUserOnline(adminId);
                const lastSeen = userStatus[adminId]?.lastSeen;
                
                return (
                  <div
                    key={adminId}
                    style={{
                      padding: 'clamp(16px, 4vw, 24px)',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '16px',
                      border: '2px solid #bbf7d0',
                      display: 'flex',
                      flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                      justifyContent: 'space-between',
                      alignItems: window.innerWidth < 640 ? 'stretch' : 'center',
                      gap: window.innerWidth < 640 ? '16px' : '12px'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'clamp(12px, 3vw, 16px)',
                      flex: 1
                    }}>
                      <Avatar 
                        name={admin.name} 
                        size={window.innerWidth < 640 ? "sm" : "md"} 
                        status={true} 
                        userId={adminId} 
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h4 style={{ 
                            margin: '0', 
                            fontSize: 'clamp(14px, 3vw, 16px)', 
                            fontWeight: '700', 
                            color: '#065f46',
                            wordBreak: 'break-word'
                          }}>
                            {admin.name}
                          </h4>
                          {isOnline && (
                            <span style={{
                              backgroundColor: '#dcfce7',
                              color: '#166534',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: 'clamp(9px, 2vw, 10px)',
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}>
                              ONLINE
                            </span>
                          )}
                        </div>
                        <p style={{ 
                          margin: '2px 0 0 0', 
                          fontSize: 'clamp(12px, 2.5vw, 14px)', 
                          color: '#047857',
                          wordBreak: 'break-all'
                        }}>
                          {admin.email}
                        </p>
                        <p style={{ 
                          margin: '2px 0 0 0', 
                          fontSize: 'clamp(11px, 2vw, 12px)', 
                          color: '#6b7280' 
                        }}>
                          Last seen: {formatLastSeen(lastSeen)}
                        </p>
                        {admin.reactivatedAt && (
                          <p style={{ 
                            margin: '2px 0 0 0', 
                            fontSize: 'clamp(11px, 2vw, 12px)', 
                            color: '#059669' 
                          }}>
                            Reactivated: {new Date(admin.reactivatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'clamp(12px, 3vw, 16px)',
                      flexDirection: window.innerWidth < 480 ? 'column' : 'row',
                      width: window.innerWidth < 640 ? '100%' : 'auto'
                    }}>
                      <span style={{
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: 'clamp(10px, 2vw, 12px)',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}>
                        <CheckCircle size={12} />
                        Active Admin
                      </span>
                      {adminId !== currentAdminId && (
                        <button
                          onClick={() => handleRemoveAdmin(adminId)}
                          style={{
                            padding: window.innerWidth < 480 ? '12px 16px' : '10px 16px',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            border: '2px solid #fecaca',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: 'clamp(12px, 2.5vw, 14px)',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            width: window.innerWidth < 480 ? '100%' : 'auto',
                            justifyContent: 'center'
                          }}
                        >
                          <UserX size={window.innerWidth < 480 ? 14 : 16} />
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Deactivated Admins Tab */}
      {adminTab === 'deactivated' && (
        <div>
          {getDeactivatedAdmins().length === 0 ? (
            <div style={{
              padding: 'clamp(40px, 8vw, 60px) clamp(20px, 5vw, 40px)',
              textAlign: 'center',
              backgroundColor: '#fef2f2',
              borderRadius: '16px',
              border: '2px dashed #fecaca'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                width: 'clamp(48px, 10vw, 64px)',
                height: 'clamp(48px, 10vw, 64px)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UserX size={window.innerWidth < 640 ? 20 : 24} style={{ color: '#dc2626' }} />
              </div>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: 'clamp(16px, 3vw, 18px)', 
                fontWeight: '700', 
                color: '#991b1b' 
              }}>
                No deactivated administrators
              </h3>
              <p style={{ 
                margin: '0', 
                fontSize: 'clamp(13px, 2.5vw, 14px)', 
                color: '#b91c1c',
                maxWidth: '400px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                All administrators are currently active
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: 'clamp(12px, 3vw, 16px)'
            }}>
              {getDeactivatedAdmins().map((adminId) => {
                const admin = adminUsers[adminId];
                
                return (
                  <div
                    key={adminId}
                    style={{
                      padding: 'clamp(16px, 4vw, 24px)',
                      backgroundColor: '#fef2f2',
                      borderRadius: '16px',
                      border: '2px solid #fecaca',
                      display: 'flex',
                      flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                      justifyContent: 'space-between',
                      alignItems: window.innerWidth < 640 ? 'stretch' : 'center',
                      gap: window.innerWidth < 640 ? '16px' : '12px'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'clamp(12px, 3vw, 16px)',
                      flex: 1
                    }}>
                      <Avatar 
                        name={admin.name} 
                        size={window.innerWidth < 640 ? "sm" : "md"} 
                        status={false} 
                        userId={adminId} 
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h4 style={{ 
                            margin: '0', 
                            fontSize: 'clamp(14px, 3vw, 16px)', 
                            fontWeight: '700', 
                            color: '#991b1b',
                            wordBreak: 'break-word'
                          }}>
                            {admin.name}
                          </h4>
                          <span style={{
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: 'clamp(9px, 2vw, 10px)',
                            fontWeight: '600',
                            whiteSpace: 'nowrap'
                          }}>
                            DEACTIVATED
                          </span>
                        </div>
                        <p style={{ 
                          margin: '2px 0 0 0', 
                          fontSize: 'clamp(12px, 2.5vw, 14px)', 
                          color: '#b91c1c',
                          wordBreak: 'break-all'
                        }}>
                          {admin.email}
                        </p>
                        {admin.deactivatedAt && (
                          <p style={{ 
                            margin: '2px 0 0 0', 
                            fontSize: 'clamp(11px, 2vw, 12px)', 
                            color: '#6b7280' 
                          }}>
                            Deactivated: {new Date(admin.deactivatedAt).toLocaleDateString()}
                          </p>
                        )}
                        {admin.deactivationReason && (
                          <p style={{ 
                            margin: '2px 0 0 0', 
                            fontSize: 'clamp(11px, 2vw, 12px)', 
                            color: '#9ca3af',
                            wordBreak: 'break-word'
                          }}>
                            Reason: {admin.deactivationReason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'clamp(12px, 3vw, 16px)',
                      flexDirection: window.innerWidth < 480 ? 'column' : 'row',
                      width: window.innerWidth < 640 ? '100%' : 'auto'
                    }}>
                      <span style={{
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: 'clamp(10px, 2vw, 12px)',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}>
                        <UserX size={12} />
                        Deactivated
                      </span>
                      <button
                        onClick={() => handleReactivateAdmin(adminId)}
                        style={{
                          padding: window.innerWidth < 480 ? '12px 16px' : '10px 16px',
                          backgroundColor: '#f0fdf4',
                          color: '#059669',
                          border: '2px solid #bbf7d0',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: 'clamp(12px, 2.5vw, 14px)',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                          width: window.innerWidth < 480 ? '100%' : 'auto',
                          justifyContent: 'center'
                        }}
                      >
                        <CheckCircle size={window.innerWidth < 480 ? 14 : 16} />
                        Reactivate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
)}
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '32px',
                color: 'white'
              }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>
                  My Profile
                </h2>
                <p style={{ margin: '0', fontSize: '16px', opacity: 0.9 }}>
                  Manage your personal information and account settings
                </p>
              </div>

              <div style={{ padding: '32px' }}>
                <div style={{ display: 'grid', gap: '24px' }}>
                  {/* Personal Information */}
                  <div style={{
                    padding: '24px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                          Personal Information
                        </h3>
                        <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                          Update your personal details and contact information
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setNewName(currentUser.name);
                          setChangeNameDialog(true);
                        }}
                        style={{
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Full Name
                        </label>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginTop: '4px' }}>
                          {currentUser.name}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Email Address
                        </label>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginTop: '4px' }}>
                          {currentUser.email}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Role
                        </label>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginTop: '4px', textTransform: 'capitalize' }}>
                          {currentUser.role}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Member Since
                        </label>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginTop: '4px' }}>
                          {new Date(currentUser.joinDate || currentUser.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Email Sync Warning - Add this right after Personal Information div */}
                  {auth.currentUser && currentUser && auth.currentUser.email !== currentUser.email && (
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '16px',
                      border: '2px solid #f59e0b'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <AlertTriangle size={20} style={{ color: '#d97706' }} />
                        <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '700', color: '#92400e' }}>
                          Email Mismatch Detected
                        </h4>
                      </div>
                      <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#b45309', lineHeight: '1.5' }}>
                        Your login email ({auth.currentUser.email}) doesn't match your profile email ({currentUser.email}). 
                        This can cause login issues.
                      </p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={fixEmailMismatch}
                          disabled={loading}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#d97706',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                          }}
                        >
                          {loading ? 'Fixing...' : 'Fix Email Sync'}
                        </button>
                        <button
                          onClick={revertDatabaseEmail}
                          disabled={loading}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: 'white',
                            color: '#d97706',
                            border: '2px solid #d97706',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                          }}
                        >
                          {loading ? 'Reverting...' : 'Revert to Login Email'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  

                    <div style={{
                      padding: '20px',
                      backgroundColor: '#eff6ff',
                      borderRadius: '16px',
                      border: '1px solid #bfdbfe',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setChangePasswordDialog(true)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                          padding: '8px',
                          backgroundColor: '#2563eb',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Key size={16} style={{ color: 'white' }} />
                        </div>
                        <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '700', color: '#1e40af' }}>
                          Change Password
                        </h4>
                      </div>
                      <p style={{ margin: '0', fontSize: '14px', color: '#1e3a8a' }}>
                        Update your password for better security
                      </p>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div style={{
                    padding: '24px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '16px',
                    border: '2px solid #fecaca'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#dc2626' }}>
                          Danger Zone
                        </h3>
                        <p style={{ margin: '0', fontSize: '14px', color: '#991b1b' }}>
                          Irreversible and destructive actions
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => setDeactivateDialog(true)}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          Deactivate Account
                        </button>
                        <button
                          onClick={handleLogout}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: 'white',
                            color: '#dc2626',
                            border: '2px solid #dc2626',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                padding: '32px',
                color: 'white'
              }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>
                  Preferences
                </h2>
                <p style={{ margin: '0', fontSize: '16px', opacity: 0.9 }}>
                  Customize your experience and display settings
                </p>
              </div>

              <div style={{ padding: '32px' }}>
                <div style={{ display: 'grid', gap: '24px' }}>
                  {/* Theme Settings */}
                  <div style={{
                    padding: '24px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                      Appearance
                    </h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          padding: '12px',
                          background: settings.darkMode ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          borderRadius: '12px'
                        }}>
                          {settings.darkMode ? <Moon size={20} style={{ color: 'white' }} /> : <Sun size={20} style={{ color: 'white' }} />}
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                            Dark Mode
                          </h4>
                          <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                            Switch between light and dark themes
                          </p>
                        </div>
                      </div>
                      <ToggleSwitch 
                        checked={settings.darkMode} 
                        onChange={(value) => handleSettingChange('darkMode', value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

     {/* Notifications Tab */}
{activeTab === 'notifications' && (
  <div className="min-h-screen bg-gray-50">
    {/* Header Section */}
    <div style={{
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      padding: 'clamp(20px, 5vw, 32px)',
      color: 'white'
    }}>
      <div className="max-w-7xl mx-auto">
        <div style={{ 
          display: 'flex', 
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
          gap: window.innerWidth < 768 ? '16px' : '12px'
        }}>
          <div>
            <h2 style={{ 
              margin: '0 0 8px 0', 
              fontSize: 'clamp(20px, 4vw, 24px)', 
              fontWeight: '700' 
            }}>
              Notification Center
            </h2>
            <p style={{ 
              margin: '0', 
              fontSize: 'clamp(14px, 2.5vw, 16px)', 
              opacity: 0.9 
            }}>
              Stay updated with all system activities and announcements
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => markAllAsRead()}
              style={{
                padding: window.innerWidth < 768 ? '10px 16px' : '12px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <CheckCircle size={window.innerWidth < 768 ? 14 : 16} />
              Mark All Read
            </button>
            <button
          onClick={() => {
            if (window.confirm('Are you sure you want to clear all notifications? This cannot be undone.')) {
              clearAllNotifications();
            }
          }}
          style={{
            padding: '10px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Trash2 size={16} />
          Clear All
        </button>
      </div>
    </div>
  </div>
</div>
    {/* Content Section */}
    <div className="max-w-7xl mx-auto" style={{ padding: 'clamp(20px, 5vw, 32px)' }}>
      {/* Filter Tabs */}
        <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: 'clamp(20px, 4vw, 24px)',
        padding: '6px',
        backgroundColor: '#f1f5f9',
        borderRadius: '12px',
        overflowX: 'auto'
      }}>
{['all', 'unread', 'project_created','new_issue', 'company_registration'].map((filter) => (
          <button
            key={filter}
            onClick={() => setNotificationFilter(filter)}
            style={{
              padding: window.innerWidth < 640 ? '10px 16px' : '12px 20px',
              backgroundColor: notificationFilter === filter ? 'white' : 'transparent',
              color: notificationFilter === filter ? '#0f172a' : '#64748b',
              border: 'none',
              borderRadius: '8px',
              fontSize: 'clamp(12px, 2vw, 14px)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: notificationFilter === filter ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content'
            }}
          >
            {filter === 'all' && 'All'}
{filter === 'unread' && `Unread (${getUnreadCount()})`}
{filter === 'project_created' && 'New Projects'}
{filter === 'new_issue' && 'Issues'}
{filter === 'company_registration' && 'New Company'}
          </button>
        ))}
      </div>

    {/* Notifications List */}
<div style={{ 
  maxHeight: '70vh',
  overflowY: 'auto',
  paddingRight: '8px',
  // Custom scrollbar styling
  scrollbarWidth: 'thin',
  scrollbarColor: '#cbd5e1 #f1f5f9'
}}>
  <div style={{ display: 'grid', gap: 'clamp(12px, 3vw, 16px)', overflow: 'hidden' }}>
    {getFilteredNotifications().length === 0 ? (
      <div style={{
        padding: 'clamp(40px, 8vw, 60px)',
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#f1f5f9',
          borderRadius: '50%',
          width: 'clamp(48px, 10vw, 64px)',
          height: 'clamp(48px, 10vw, 64px)',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Bell size={window.innerWidth < 640 ? 20 : 24} style={{ color: '#64748b' }} />
        </div>
        <h3 style={{ 
          margin: '0 0 8px 0', 
          fontSize: 'clamp(16px, 3vw, 18px)', 
          fontWeight: '700', 
          color: '#1e293b' 
        }}>
          No notifications
        </h3>
        <p style={{ 
          margin: '0', 
          fontSize: 'clamp(13px, 2.5vw, 14px)', 
          color: '#64748b' 
        }}>
          {notificationFilter === 'unread' ? 'All notifications have been read' : 'No notifications to display'}
        </p>
      </div>
    ) : (
      getFilteredNotifications().map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          style={{
            padding: 'clamp(16px, 4vw, 20px)',
            backgroundColor: notification.isRead ? 'white' : '#f0f9ff',
            borderRadius: '12px',
            border: notification.isRead ? '1px solid #e2e8f0' : '2px solid #bae6fd',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <div style={{ 
            display: 'flex', 
            gap: 'clamp(12px, 3vw, 16px)',
            alignItems: 'flex-start'
          }}>
            {/* Notification Icon */}
            <div style={{
              padding: '8px',
              backgroundColor: getNotificationIconColor(notification.type),
              borderRadius: '10px',
              flexShrink: 0
            }}>
              {getNotificationIcon(notification.type)}
            </div>

            {/* Notification Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <h4 style={{ 
                  margin: '0', 
                  fontSize: 'clamp(14px, 3vw, 16px)', 
                  fontWeight: notification.isRead ? '600' : '700',
                  color: '#1e293b',
                  wordBreak: 'break-word'
                }}>
                  {notification.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{
                    fontSize: 'clamp(11px, 2vw, 12px)',
                    color: '#64748b',
                    whiteSpace: 'nowrap'
                  }}>
                    {formatNotificationTime(notification.date)}
                  </span>
                  {!notification.isRead && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%'
                    }} />
                  )}
                </div>
              </div>
              
              <p style={{ 
                margin: '0 0 12px 0', 
                fontSize: 'clamp(13px, 2.5vw, 14px)', 
                color: '#64748b',
                lineHeight: '1.5',
                wordBreak: 'break-word'
              }}>
                {notification.message}
              </p>

              {/* Notification Type Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  backgroundColor: getNotificationBadgeColor(notification.type),
                  color: getNotificationBadgeTextColor(notification.type),
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: 'clamp(10px, 2vw, 11px)',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  {getNotificationTypeLabel(notification.type)}
                </span>
                
                {notification.projectId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToProject(notification.projectId);
                    }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: 'clamp(10px, 2vw, 11px)',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ExternalLink size={10} />
                    View Project
                  </button>
                )}
                
                {/* ADD THE NEW BUTTONS HERE */}
                {notification.type === 'company_registration' && notification.companyId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToCompany(notification.companyId);
                    }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: 'clamp(10px, 2vw, 11px)',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ExternalLink size={10} />
                    View Company
                  </button>
                )}
                
                {notification.type === 'new_issue' && notification.issueId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToIssue(notification.issueId);
                    }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: 'clamp(10px, 2vw, 11px)',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ExternalLink size={10} />
                    View Issue
                  </button>
                )}
              </div>
            </div>

            {/* Action Menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNotificationMenu(notification.id);
                }}
                style={{
                  padding: '6px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#64748b',
                  transition: 'all 0.2s'
                }}
              >
                <MoreVertical size={16} />
              </button>
              
              {openMenuId === notification.id && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 10,
                  minWidth: '150px'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                      setOpenMenuId(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '13px',
                      color: '#374151',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Eye size={14} />
                    {notification.isRead ? 'Mark as Unread' : 'Mark as Read'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                      setOpenMenuId(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '13px',
                      color: '#dc2626',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</div>

      {/* Load More Button */}
      {hasMoreNotifications && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={loadMoreNotifications}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              color: '#374151',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto',
              transition: 'all 0.2s'
            }}
          >
            <ChevronDown size={16} />
            Load More Notifications
          </button>
        </div>
      )}
    </div>
  </div>
)}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                padding: '32px',
                color: 'white'
              }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>
                  Security & Privacy
                </h2>
                <p style={{ margin: '0', fontSize: '16px', opacity: 0.9 }}>
                  Manage your account security and privacy settings
                </p>
              </div>

              <div style={{ padding: '32px' }}>
                <div style={{ display: 'grid', gap: '24px' }}>
                  {/* Password Security */}
                  <div style={{
                    padding: '24px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          padding: '12px',
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          borderRadius: '12px'
                        }}>
                          <Key size={20} style={{ color: 'white' }} />
                        </div>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                            Password Security
                          </h3>
                          <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                            Last changed recently • Strong password
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setChangePasswordDialog(true)}
                        style={{
                          padding: '12px 24px',
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div style={{
                    padding: '24px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '16px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        padding: '12px',
                        backgroundColor: '#10b981',
                        borderRadius: '12px'
                      }}>
                        <CheckCircle size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#065f46' }}>
                          Account Status
                        </h3>
                        <p style={{ margin: '0', fontSize: '14px', color: '#047857' }}>
                          Your account is active and secure
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Logout Confirmation Modal */}
<Modal
  isOpen={logoutDialog}
  onClose={() => setLogoutDialog(false)}
  title="Sign Out Confirmation"
>
  <div style={{ display: 'grid', gap: '24px' }}>
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
      borderRadius: '16px',
      border: '2px solid #93c5fd'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          padding: '8px',
          backgroundColor: '#3b82f6',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <LogOut size={20} style={{ color: 'white' }} />
        </div>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700', color: '#1e40af' }}>
            Are you sure you want to sign out?
          </h3>
          <p style={{ margin: '0', fontSize: '14px', color: '#1e3a8a', lineHeight: '1.5' }}>
            You will be logged out of your admin account and redirected to the login page.
          </p>
        </div>
      </div>
    </div>

    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '16px',
      paddingTop: '24px'
    }}>
      <button
        onClick={() => setLogoutDialog(false)}
        style={{
          padding: '12px 24px',
          backgroundColor: '#f3f4f6',
          color: '#374151',
          border: 'none',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Cancel
      </button>
      <button
        onClick={handleLogout}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid white',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Signing Out...
          </>
        ) : (
          <>
            <LogOut size={16} />
            Yes, Sign Out
          </>
        )}
      </button>
    </div>
  </div>
</Modal>
      
      {/* Add Admin Modal */}
      <Modal
        isOpen={addAdminDialog}
        onClose={() => setAddAdminDialog(false)}
        title="Add New Administrator"
        size="lg"
      >
        <div style={{ display: 'grid', gap: '24px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              value={newAdmin.name}
              onChange={(e) => handleNewAdminChange('name', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter email address"
              value={newAdmin.email}
              onChange={(e) => handleNewAdminChange('email', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Temporary Password
            </label>
            <input
              type="password"
              placeholder="Create a temporary password"
              value={newAdmin.password}
              onChange={(e) => handleNewAdminChange('password', e.target.value)}
              style={inputStyle}
            />
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              Password must be at least 8 characters long
            </p>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '16px',
            paddingTop: '24px'
          }}>
            <button
              onClick={() => setAddAdminDialog(false)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddAdmin}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Add Administrator
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Name Modal */}
      <Modal
        isOpen={changeNameDialog}
        onClose={() => setChangeNameDialog(false)}
        title="Update Your Name"
      >
        <div style={{ display: 'grid', gap: '24px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              New Name
            </label>
            <input
              type="text"
              placeholder="Enter your new name"
              value={newName}
              onChange={(e) => handleNewNameChange(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '16px',
            paddingTop: '24px'
          }}>
            <button
              onClick={() => setChangeNameDialog(false)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleChangeName}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Updating...' : 'Update Name'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={changePasswordDialog}
        onClose={() => setChangePasswordDialog(false)}
        title="Update Password"
      >
        <div style={{ display: 'grid', gap: '24px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter your current password"
              value={passwordForm.currentPassword}
              onChange={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              New Password
            </label>
            <input
              type="password"
              placeholder="Create a new password"
              value={passwordForm.newPassword}
              onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm your new password"
              value={passwordForm.confirmPassword}
              onChange={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
              style={inputStyle}
            />
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '12px',
              color: '#6b7280',
              lineHeight: '1.4'
            }}>
              Password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.
            </p>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '16px',
            paddingTop: '24px'
          }}>
            <button
              onClick={() => setChangePasswordDialog(false)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Deactivate Account Modal */}
      <Modal
        isOpen={deactivateDialog}
        onClose={() => setDeactivateDialog(false)}
        title="Deactivate Account"
      >
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            borderRadius: '16px',
            border: '2px solid #fca5a5'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                padding: '8px',
                backgroundColor: '#dc2626',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={20} style={{ color: 'white' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700', color: '#991b1b' }}>
                  This action cannot be undone
                </h3>
                <p style={{ margin: '0', fontSize: '14px', color: '#7f1d1d', lineHeight: '1.5' }}>
                  Your account and all associated data will be permanently deactivated. 
                  This action is irreversible.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#374151' }}>
              What will happen:
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                'Your account will be immediately deactivated',
                'All admin privileges will be revoked',
                'Access to all services will be revoked',
                'This action cannot be reversed'
              ].map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#dc2626',
                    borderRadius: '50%'
                  }}></div>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '16px',
            paddingTop: '24px'
          }}>
            <button
              onClick={() => setDeactivateDialog(false)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Keep My Account
            </button>
            <button
              onClick={handleDeactivateAccount}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Processing...' : 'Yes, Deactivate Account'}
            </button>
          </div>
        </div>
      </Modal>

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;