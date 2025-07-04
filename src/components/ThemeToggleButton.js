import React from 'react';
import { IconButton, Tooltip, Fab, Switch, FormControlLabel, Box } from '@mui/material';
import { Brightness4, Brightness7, DarkMode, LightMode } from '@mui/icons-material';
import { useGlobalTheme } from '../contexts/GlobalThemeContext';

// Simple Icon Button Version
export const ThemeToggleButton = ({ variant = 'icon', size = 'medium', showLabel = false, ...props }) => {
  const { isDarkMode, updateSetting, t } = useGlobalTheme();

  const handleToggle = () => {
    updateSetting('darkMode', !isDarkMode);
  };

  // Floating Action Button variant
  if (variant === 'fab') {
    return (
      <Fab
        color="primary"
        onClick={handleToggle}
        size={size}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
          }
        }}
        {...props}
      >
        {isDarkMode ? <LightMode /> : <DarkMode />}
      </Fab>
    );
  }

  // Switch variant
  if (variant === 'switch') {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={isDarkMode}
            onChange={(e) => updateSetting('darkMode', e.target.checked)}
            icon={<Brightness7 sx={{ fontSize: 16 }} />}
            checkedIcon={<Brightness4 sx={{ fontSize: 16 }} />}
            sx={{
              '& .MuiSwitch-thumb': {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
              },
              '& .MuiSwitch-track': {
                backgroundColor: isDarkMode ? '#333333' : '#e0e0e0',
              }
            }}
          />
        }
        label={showLabel ? t.darkMode : ''}
        sx={{ margin: 0 }}
        {...props}
      />
    );
  }

  // Default icon button variant
  return (
    <Tooltip title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}>
      <IconButton
        onClick={handleToggle}
        color="inherit"
        size={size}
        sx={{
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
          }
        }}
        {...props}
      >
        {isDarkMode ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Tooltip>
  );
};

// Language Selector Component
export const LanguageSelector = ({ variant = 'select', ...props }) => {
  const { settings, updateSetting, t } = useGlobalTheme();

  if (variant === 'buttons') {
    const languages = [
      { code: 'English', flag: '🇺🇸', name: 'EN' },
      { code: 'Arabic', flag: '🇸🇦', name: 'AR' },
      { code: 'French', flag: '🇫🇷', name: 'FR' },
      { code: 'Spanish', flag: '🇪🇸', name: 'ES' },
    ];

    return (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {languages.map((lang) => (
          <IconButton
            key={lang.code}
            onClick={() => updateSetting('language', lang.code)}
            size="small"
            sx={{
              backgroundColor: settings.language === lang.code ? 'primary.main' : 'transparent',
              color: settings.language === lang.code ? 'primary.contrastText' : 'text.primary',
              '&:hover': {
                backgroundColor: settings.language === lang.code ? 'primary.dark' : 'action.hover',
              }
            }}
          >
            <span style={{ fontSize: '14px' }}>{lang.flag}</span>
          </IconButton>
        ))}
      </Box>
    );
  }

  // Default select variant would go here
  return null;
};

export default ThemeToggleButton;