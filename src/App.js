import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalThemeProvider } from './contexts/GlobalThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Projects from './components/Projects';
import Reports from './components/Reports';
import Feedback from './components/Feedback';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import IssuesReports from './components/IssuesReports'; // <-- Add this import
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Component to handle conditional redirects based on auth status
const ConditionalRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ConditionalRedirect />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute>
          <Layout><Users /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/projects" element={
        <ProtectedRoute>
          <Layout><Projects /></Layout>
        </ProtectedRoute>
      } />
      
      {/* Add the Issues & Reports route */}
      <Route path="/issues" element={
        <ProtectedRoute>
          <Layout><IssuesReports /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <Layout><Reports /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/feedback" element={
        <ProtectedRoute>
          <Layout><Feedback /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Layout><Notifications /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout><Settings /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<ConditionalRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <GlobalThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </GlobalThemeProvider>
  );
}

export default App;