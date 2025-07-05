import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { getDatabase, ref, onValue, off, update } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Language translations
const translations = {
  English: {
    loading: 'Loading...',
    dashboard: 'Dashboard',
    users: 'Manage Users',
    projects: 'Project Management',
    reports: 'Reports & Analytics',
    feedback: 'Feedback & Complaints',
    notifications: 'Notification Center',
    settings: 'Settings & Roles',
    darkMode: 'Dark Mode',
    language: 'Language',
    logout: 'Logout',
    profile: 'Profile',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',
  },
  Arabic: {
    loading: 'جاري التحميل...',
    dashboard: 'لوحة التحكم',
    users: 'إدارة المستخدمين',
    projects: 'إدارة المشاريع',
    reports: 'التقارير والتحليلات',
    feedback: 'التعليقات والشكاوى',
    notifications: 'مركز الإشعارات',
    settings: 'الإعدادات والأدوار',
    darkMode: 'الوضع المظلم',
    language: 'اللغة',
    logout: 'تسجيل الخروج',
    profile: 'الملف الشخصي',
    edit: 'تعديل',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    confirm: 'تأكيد',
  },
  French: {
    loading: 'Chargement...',
    dashboard: 'Tableau de bord',
    users: 'Gestion des utilisateurs',
    projects: 'Gestion de projet',
    reports: 'Rapports et analyses',
    feedback: 'Commentaires et plaintes',
    notifications: 'Centre de notifications',
    settings: 'Paramètres et rôles',
    darkMode: 'Mode Sombre',
    language: 'Langue',
    logout: 'Déconnexion',
    profile: 'Profil',
    edit: 'Modifier',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    confirm: 'Confirmer',
  },
  Spanish: {
    loading: 'Cargando...',
    dashboard: 'Panel de control',
    users: 'Gestión de usuarios',
    projects: 'Gestión de proyectos',
    reports: 'Informes y análisis',
    feedback: 'Comentarios y quejas',
    notifications: 'Centro de notificaciones',
    settings: 'Configuración y roles',
    darkMode: 'Modo Oscuro',
    language: 'Idioma',
    logout: 'Cerrar Sesión',
    profile: 'Perfil',
    edit: 'Editar',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    confirm: 'Confirmar',
  }
};

// Create the theme based on dark mode setting
const createAppTheme = (isDarkMode, language) => {
  const isRTL = language === 'Arabic';
  
  return createTheme({
    direction: isRTL ? 'rtl' : 'ltr',
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#667eea',
        light: '#9bb5ff',
        dark: '#3d4db8',
      },
      secondary: {
        main: '#764ba2',
        light: '#a478d4',
        dark: '#4a2172',
      },
      background: {
        default: isDarkMode ? '#0f172a' : '#f5f7fa',
        paper: isDarkMode ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#f1f5f9' : '#1e293b',
        secondary: isDarkMode ? '#cbd5e1' : '#64748b',
      },
      divider: isDarkMode ? '#475569' : '#e2e8f0',
      action: {
        hover: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      },
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 600,
            transition: 'all 0.2s ease',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDarkMode 
              ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
              : '0 4px 20px rgba(0, 0, 0, 0.08)',
            borderRadius: 16,
            border: isDarkMode 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            transition: 'all 0.3s ease',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: isDarkMode 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isDarkMode 
              ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
              : '0 1px 3px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.3s ease',
          },
        },
      },
    },
  });
};

// Create context
const GlobalThemeContext = createContext();

// Custom hook to use theme
export const useGlobalTheme = () => {
  const context = useContext(GlobalThemeContext);
  if (!context) {
    throw new Error('useGlobalTheme must be used within a GlobalThemeProvider');
  }
  return context;
};

// Global Theme Provider Component
export const GlobalThemeProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [settings, setSettings] = useState({
    darkMode: false,
    language: 'English',
    notifications: true,
    emailNotifications: true,
    pushNotifications: false,
  });
  const [loading, setLoading] = useState(true);

  const database = getDatabase();
  const auth = getAuth();

  // Get current translations
  const t = translations[settings.language] || translations.English;
  const isRTL = settings.language === 'Arabic';

  // Create MUI theme based on current settings
  const muiTheme = createAppTheme(settings.darkMode, settings.language);

  // Authentication and settings listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Listen to user settings
        const settingsRef = ref(database, `settings/${user.uid}`);
        const settingsListener = onValue(settingsRef, (snapshot) => {
          const settingsData = snapshot.val();
          if (settingsData) {
            setSettings(prev => ({ ...prev, ...settingsData }));
          }
          setLoading(false);
        }, (error) => {
          console.error('Error fetching settings:', error);
          setLoading(false);
        });

        return () => off(settingsRef, 'value', settingsListener);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, database]);

  // Function to update settings
  const updateSetting = async (key, value) => {
    try {
      // Update local state immediately for responsive UI
      setSettings(prev => ({ ...prev, [key]: value }));
      
      // Save to Firebase if user is authenticated
      if (currentUser) {
        const settingsRef = ref(database, `settings/${currentUser.uid}`);
        await update(settingsRef, { [key]: value });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating setting:', error);
      // Revert local state if Firebase update fails
      setSettings(prev => ({ ...prev, [key]: key === 'darkMode' ? !value : value }));
      return { success: false, error: error.message };
    }
  };

  // Context value
  const value = {
    // Settings
    settings,
    isDarkMode: settings.darkMode,
    language: settings.language,
    
    // Translations
    t,
    isRTL,
    
    // Functions
    updateSetting,
    
    // User info
    currentUser,
    loading,
    
    // MUI theme
    muiTheme,
  };

  return (
    <GlobalThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </GlobalThemeContext.Provider>
  );
};

export default GlobalThemeProvider;
