// src/components/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  IconButton,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Email,
  Lock,
  BlockOutlined
} from '@mui/icons-material';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref, get, update, set } from 'firebase/database';
import { auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('admin@internlink.com');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const database = getDatabase();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const checkUserRoleAndStatus = async (userId) => {
    try {
      console.log('🔍 Checking user role and status for:', userId);
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log('👤 User data:', userData);
        
        const userRole = userData.role;
        const userStatus = userData.status;
        
        console.log(`🔐 Role: ${userRole}, Status: ${userStatus}`);
        
        // Check if user is admin
        if (userRole !== 'admin') {
          return {
            allowed: false,
            message: 'Access denied. Only administrators can access this portal.',
            type: 'role'
          };
        }
        
        // Check if admin is active
        if (userStatus === 'deactivated') {
          return {
            allowed: false,
            message: 'Your admin account has been deactivated. Please contact the system administrator.',
            type: 'status'
          };
        }
        
        // User is admin and active
        return {
          allowed: true,
          userData: userData
        };
        
      } else {
        return {
          allowed: false,
          message: 'User profile not found in the system.',
          type: 'not_found'
        };
      }
    } catch (error) {
      console.error('❌ Error checking user role and status:', error);
      return {
        allowed: false,
        message: 'Error verifying user permissions. Please try again.',
        type: 'error'
      };
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Attempting to sign in with:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('✅ Firebase authentication successful:', firebaseUser.uid);
      
      // Check user role and status in database
      const permissionCheck = await checkUserRoleAndStatus(firebaseUser.uid);
      
      if (!permissionCheck.allowed) {
        // Sign out the user immediately if not allowed
        await signOut(auth);
        console.log('🚫 Access denied, user signed out');
        
        // Show appropriate error message
        if (permissionCheck.type === 'status') {
          setError(
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BlockOutlined sx={{ fontSize: 20 }} />
              {permissionCheck.message}
            </Box>
          );
        } else {
          setError(permissionCheck.message);
        }
        return;
      }
      
      console.log('✅ Permission check passed - Admin with active status');
      console.log('📊 User data:', permissionCheck.userData);
      
      // Update user's last login timestamp
      try {
        const userRef = ref(database, `users/${firebaseUser.uid}`);
        const userStatusRef = ref(database, `user_status/${firebaseUser.uid}`);
        
        // Update last login and online status
        await Promise.all([
          update(userRef, { 
            lastLogin: new Date().toISOString() 
          }),
          set(userStatusRef, {
            online: true,
            lastSeen: Date.now(),
            loginTime: Date.now()
          })
        ]);
        
        console.log('✅ User status updated');
      } catch (updateError) {
        console.warn('⚠️ Could not update user status:', updateError);
        // Don't prevent login if status update fails
      }
      
      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Provide more user-friendly error messages
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Incorrect email or password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled by Firebase.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 2, sm: 3 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            top: '10%',
            left: '10%',
            animation: 'float 6s ease-in-out infinite'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '150px',
            height: '150px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
            bottom: '20%',
            right: '15%',
            animation: 'float 8s ease-in-out infinite reverse'
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' }
          }
        }}
      />

      <Container maxWidth="sm" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'visible',
            position: 'relative',
            width: '100%',
            maxWidth: 450,
            animation: 'slideUp 0.8s ease-out',
            '@keyframes slideUp': {
              from: {
                opacity: 0,
                transform: 'translateY(30px)'
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          {loading && (
            <LinearProgress
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                borderRadius: '16px 16px 0 0'
              }}
            />
          )}

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Logo and Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: { xs: 60, sm: 70 },
                  height: { xs: 60, sm: 70 },
                  mx: 'auto',
                  mb: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                  animation: 'pulse 2s ease-in-out infinite alternate',
                  '@keyframes pulse': {
                    from: { transform: 'scale(1)' },
                    to: { transform: 'scale(1.05)' }
                  }
                }}
              >
                <AdminPanelSettings sx={{ fontSize: { xs: 28, sm: 35 }, color: 'white' }} />
              </Box>

              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  fontSize: { xs: '1.8rem', sm: '2.2rem' }
                }}
              >
                Welcome Back
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(0, 0, 0, 0.6)',
                  fontWeight: 400,
                  mb: 0.5,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                InternLink Admin Portal
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(0, 0, 0, 0.5)',
                  fontStyle: 'italic',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              >
                Secure access for active administrators only
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  animation: 'fadeIn 0.3s ease',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(-10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' }
                  }
                }}
              >
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleLogin}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'rgba(0, 0, 0, 0.4)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)'
                    },
                    '&.Mui-focused': {
                      background: 'rgba(255, 255, 255, 1)',
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                      transform: 'translateY(-2px)'
                    }
                  }
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'rgba(0, 0, 0, 0.4)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                        disabled={loading}
                        sx={{ color: 'rgba(0, 0, 0, 0.4)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)'
                    },
                    '&.Mui-focused': {
                      background: 'rgba(255, 255, 255, 1)',
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                      transform: 'translateY(-2px)'
                    }
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: { xs: 1.5, sm: 1.8 },
                  borderRadius: 2,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%)',
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }}
                    />
                    Verifying Access...
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AdminPanelSettings />
                    Sign In
                  </Box>
                )}
              </Button>
            </Box>

            {/* Security Notice */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  color: 'rgba(102, 126, 234, 0.8)',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  lineHeight: 1.4
                }}
              >
                🔒 Access restricted to active administrators only
                <br />
                All login attempts are monitored and logged
              </Typography>
            </Box>

            {/* Footer */}
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                color: 'rgba(0, 0, 0, 0.4)',
                fontWeight: 300,
                fontSize: '0.75rem',
                mt: 2
              }}
            >
              © 2025 InternLink Admin Portal
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;