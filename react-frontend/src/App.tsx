import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LobbyProvider } from './contexts/LobbyContext';
import { ChatProvider } from './contexts/ChatContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './components/Dashboard';
import LobbyDetails from './components/lobby/LobbyDetails';

function App() {
  return (
    <AuthProvider>
      <LobbyProvider>
        <ChatProvider>
          <Router>
            <div className="min-h-screen bg-dark-900">
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/lobby/:id" 
                  element={
                    <ProtectedRoute>
                      <LobbyDetails />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          </Router>
        </ChatProvider>
      </LobbyProvider>
    </AuthProvider>
  );
}

export default App;
