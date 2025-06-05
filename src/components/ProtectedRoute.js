// src/components/ProtectedRoute.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  return currentUser ? children : <Login />;
};

export default ProtectedRoute;