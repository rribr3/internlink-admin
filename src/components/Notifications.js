import React, { useState, useEffect } from 'react';
import {
  ArrowBack,
  Send,
  People,
  Email,
  Notifications,
  Campaign,
  Business,
  School,
  AccessTime,
  Search
} from '@mui/icons-material';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, onValue, off } from 'firebase/database';
import { useGlobalTheme } from '../contexts/GlobalThemeContext';
import { ThemeToggleButton } from './ThemeToggleButton';

// Firebase configuration - Replace with your actual config
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const NotificationCenter = () => {
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users from Firebase
  useEffect(() => {
    const usersRef = ref(database, 'users');
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setUsers(usersList);
      } else {
        setUsers([]);
      }
    });

    return () => off(usersRef, 'value', unsubscribe);
  }, []);

  // Fetch announcements from Firebase
  useEffect(() => {
    const announcementsRef = ref(database, 'announcements');
    
    const unsubscribe = onValue(announcementsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const announcementsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
        setAnnouncements(announcementsList);
      } else {
        setAnnouncements([]);
      }
    });

    return () => off(announcementsRef, 'value', unsubscribe);
  }, []);

  const sendAnnouncementToFirebase = async (targetType, targetUsers = []) => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const timestamp = Date.now();
      
      // Create announcement in general announcements
      const announcementsRef = ref(database, 'announcements');
      const newAnnouncementRef = push(announcementsRef);
      
      await set(newAnnouncementRef, {
        title: announcementTitle,
        message: announcementMessage,
        timestamp: timestamp
      });

      // Create role-based announcements
      if (targetType === 'companies' || targetType === 'students') {
        const roleAnnouncementsRef = ref(database, `announcements_by_role/${targetType}`);
        const newRoleAnnouncementRef = push(roleAnnouncementsRef);
        
        await set(newRoleAnnouncementRef, {
          title: announcementTitle,
          message: announcementMessage,
          timestamp: timestamp
        });
      }

      // Send notifications to specific users
      if (targetUsers.length > 0) {
        const notificationPromises = targetUsers.map(async (user) => {
          const notificationRef = ref(database, `notifications/${user.id}`);
          const newNotificationRef = push(notificationRef);
          
          return set(newNotificationRef, {
            title: announcementTitle,
            message: announcementMessage,
            timestamp: timestamp,
            type: 'announcement',
            read: false
          });
        });
        
        await Promise.all(notificationPromises);
      }

      // Clear form
      setAnnouncementTitle('');
      setAnnouncementMessage('');
      setSelectedUserEmail('');
      
      alert('Announcement sent successfully!');
    } catch (error) {
      console.error('Error sending announcement:', error);
      alert('Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  const sendToAllUsers = () => {
    sendAnnouncementToFirebase('all users', users);
  };

  const sendToCompanies = () => {
    const companies = users.filter(user => user.role === 'company');
    sendAnnouncementToFirebase('companies', companies);
  };

  const sendToStudents = () => {
    const students = users.filter(user => user.role === 'student');
    sendAnnouncementToFirebase('students', students);
  };

  const sendToSpecificUser = async () => {
    if (!selectedUserEmail) {
      alert('Please select a user');
      return;
    }
    
    const selectedUser = users.find(u => u.email === selectedUserEmail);
    if (selectedUser) {
      await sendAnnouncementToFirebase('specific user', [selectedUser]);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAnnouncements = announcements.filter(announcement => 
    announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentCount = () => users.filter(u => u.role === 'student').length;
  const getCompanyCount = () => users.filter(u => u.role === 'company').length;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        padding: '16px 24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '8px 0',
              marginRight: '16px'
            }}>
             
            </button>
            <h1 style={{
              margin: '0',
              fontSize: '24px',
              fontWeight: '600',
              color: '#333'
            }}>
              Notification Center
            </h1>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '14px',
            color: '#666'
          }}>
            <span>Total Users: {users.length}</span>
            <span>Total Sent: {announcements.length}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Send Announcement Section */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#fafafa'
          }}>
            <h2 style={{
              margin: '0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#333'
            }}>
              Send New Announcement
            </h2>
          </div>
          
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333'
              }}>
                Title *
              </label>
              <input
                type="text"
                placeholder="Enter announcement title"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333'
              }}>
                Message *
              </label>
              <textarea
                placeholder="Enter your announcement message"
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <button
                onClick={sendToAllUsers}
                disabled={loading}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <People style={{ marginRight: '8px', fontSize: '18px' }} />
                Send to All Users ({users.length})
              </button>

              <button
                onClick={sendToCompanies}
                disabled={loading}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Business style={{ marginRight: '8px', fontSize: '18px' }} />
                Send to Companies ({getCompanyCount()})
              </button>

              <button
                onClick={sendToStudents}
                disabled={loading}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <School style={{ marginRight: '8px', fontSize: '18px' }} />
                Send to Students ({getStudentCount()})
              </button>
            </div>

            {/* Specific User Selection */}
            <div style={{
              borderTop: '1px solid #e0e0e0',
              paddingTop: '24px'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333'
              }}>
                Send to Specific User
              </label>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end'
              }}>
                <div style={{ flex: 1 }}>
                  <select
                    value={selectedUserEmail}
                    onChange={(e) => setSelectedUserEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select a user...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.email}>
                        {user.name} ({user.email}) - {user.role}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={sendToSpecificUser}
                  disabled={loading || !selectedUserEmail}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#9C27B0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: (!selectedUserEmail || loading) ? 'not-allowed' : 'pointer',
                    opacity: (!selectedUserEmail || loading) ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Email style={{ marginRight: '8px', fontSize: '18px' }} />
                  Send
                </button>
              </div>
            </div>

            {/* Loading indicator */}
            {loading && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#e3f2fd',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #1976d2',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></div>
                Sending announcement...
              </div>
            )}
          </div>
        </div>

        {/* Announcements History */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#fafafa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{
              margin: '0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#333'
            }}>
              Announcement History
            </h2>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#999',
                fontSize: '20px'
              }} />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: '44px',
                  paddingRight: '12px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  width: '250px'
                }}
              />
            </div>
          </div>

          {filteredAnnouncements.length === 0 ? (
            <div style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: '#666'
            }}>
              <Notifications style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#666' }}>
                {searchTerm ? 'No announcements found' : 'No announcements yet'}
              </h3>
              <p style={{ margin: '0', fontSize: '14px' }}>
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first announcement above'}
              </p>
            </div>
          ) : (
            <div>
              {filteredAnnouncements.map((announcement, index) => (
                <div
                  key={announcement.id}
                  style={{
                    padding: '20px 24px',
                    borderBottom: index < filteredAnnouncements.length - 1 ? '1px solid #e0e0e0' : 'none'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{
                      margin: '0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      {announcement.title}
                    </h3>
                    <span style={{
                      backgroundColor: '#e8f5e8',
                      color: '#2e7d32',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      Sent
                    </span>
                  </div>
                  
                  <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.5'
                  }}>
                    {announcement.message}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#999'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime style={{ marginRight: '4px', fontSize: '16px' }} />
                      {formatDate(announcement.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CSS for loading animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;