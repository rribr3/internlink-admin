// src/hooks/useNotificationBar.js
import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export const useNotificationBar = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setIsVisible(false);
      return;
    }

    const announcementsRef = ref(database, 'announcements_by_role/admin');
    
    const unsubscribe = onValue(announcementsRef, (snapshot) => {
      const unreadNotifications = [];
      let counter = 0;
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        Object.entries(data).forEach(([id, notification]) => {
          if (!notification.isRead) {
            unreadNotifications.push({ id, ...notification });
            counter++;
          }
        });
      }

      // Sort by timestamp (newest first)
      unreadNotifications.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      
      setNotifications(unreadNotifications);
      setUnreadCount(counter);
      setIsVisible(counter > 0);
    });

    return () => off(announcementsRef, 'value', unsubscribe);
  }, [currentUser]);

  return {
    notifications,
    unreadCount,
    isVisible,
    hasNotifications: unreadCount > 0
  };
};

export default useNotificationBar;