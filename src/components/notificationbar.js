// src/components/NotificationBar.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Slide,
  Alert,
  Chip,
  Button,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  Campaign as CampaignIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { ref, onValue, off, update } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationBar = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Firebase listener for announcements
  useEffect(() => {
    if (!currentUser) return;

    const announcementsRef = ref(database, 'announcements_by_role/admin');
    
    const unsubscribe = onValue(announcementsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const unreadNotifications = [];

        Object.entries(data).forEach(([key, announcement]) => {
          if (!announcement.isRead) {
            unreadNotifications.push({
              id: key,
              ...announcement
            });
          }
        });

        setNotifications(unreadNotifications);
        setIsVisible(unreadNotifications.length > 0);
        setCurrentIndex(0);
      } else {
        setNotifications([]);
        setIsVisible(false);
      }
    });

    return () => {
      off(announcementsRef);
    };
  }, [currentUser]);

  // Auto-rotate notifications
  useEffect(() => {
    if (notifications.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [notifications.length, isPaused]);

  const handleClose = () => {
    setIsVisible(false);
  };



  const handleNotificationAction = (notification) => {
    // Navigate to settings page with notifications tab without marking as read
    navigate('/settings?tab=notifications');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <WarningIcon sx={{ fontSize: 20 }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 20 }} />;
      case 'success':
        return <SuccessIcon sx={{ fontSize: 20 }} />;
      case 'info':
      default:
        return <InfoIcon sx={{ fontSize: 20 }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'warning':
        return { bg: '#fff3cd', border: '#ffecb5', text: '#856404' };
      case 'error':
        return { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' };
      case 'success':
        return { bg: '#d4edda', border: '#c3e6cb', text: '#155724' };
      case 'info':
      default:
        return { bg: '#cce7ff', border: '#b8daff', text: '#004085' };
    }
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  const currentNotification = notifications[currentIndex];
  const colors = getNotificationColor(currentNotification.type);

  return (
    <Slide direction="down" in={isVisible} mountOnEnter unmountOnExit>
      <Paper
        elevation={4}
        sx={{
          position: 'relative',
          width: '100%',
          background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.border} 100%)`,
          borderBottom: `2px solid ${colors.border}`,
          borderRadius: 0,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, transparent 0%, ${colors.text} 50%, transparent 100%)`,
            animation: 'shimmer 3s ease-in-out infinite',
            '@keyframes shimmer': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(100%)' }
            }
          }
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 2 }}>
            {/* Icon */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.9)',
                color: colors.text,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              {getNotificationIcon(currentNotification.type)}
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: colors.text,
                    fontWeight: 700,
                    fontSize: '1rem',
                    lineHeight: 1.2
                  }}
                >
                  {currentNotification.title}
                </Typography>
                
                <Chip
                  label={currentNotification.type?.toUpperCase() || 'INFO'}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    color: 'white',
                    background: colors.text,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: colors.text,
                  opacity: 0.9,
                  fontSize: '0.85rem',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}
              >
                {currentNotification.message}
              </Typography>
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            {/* Notification counter */}
            {notifications.length > 1 && (
              <Chip
                label={`${currentIndex + 1}/${notifications.length}`}
                size="small"
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  color: colors.text,
                  borderColor: colors.text,
                  background: 'rgba(255, 255, 255, 0.7)'
                }}
              />
            )}

            {/* Action Button */}
            <Button
              size="small"
              variant="contained"
              onClick={() => navigate('/settings?tab=notifications')}
              sx={{
                background: colors.text,
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                px: 2,
                py: 0.5,
                minWidth: 'auto',
                textTransform: 'none',
                borderRadius: 1,
                '&:hover': {
                  background: colors.text,
                  opacity: 0.9,
                  transform: 'scale(1.05)'
                }
              }}
            >
              View
            </Button>

            {/* Close Button */}
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                color: colors.text,
                background: 'rgba(255, 255, 255, 0.7)',
                width: 32,
                height: 32,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.9)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Progress indicator for multiple notifications */}
        {notifications.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              background: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <Box
              sx={{
                height: '100%',
                background: colors.text,
                width: `${((currentIndex + 1) / notifications.length) * 100}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </Box>
        )}
      </Paper>
    </Slide>
  );
};

export default NotificationBar;