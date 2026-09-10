import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Games from './pages/Games';
import GamePlay from './pages/GamePlay';
import GestureDrawing from './pages/GestureDrawing';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientProfile from './pages/PatientProfile';
import Patients from './pages/Patients';
import Reminders from './pages/Reminders';
import Analytics from './pages/Analytics';
import './i18n';
import Profile from './pages/Profile';
import GameHistory from './pages/GameHistory';
import Settings from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="games" element={<Games />} />
        <Route path="game/:id" element={<GamePlay />} />
        <Route path="game/gesture-drawing" element={<GestureDrawing />} />
        <Route path="doctor" element={<DoctorDashboard />} />
        <Route path="patient/:id" element={<PatientProfile />} />
        <Route path="patients" element={<Patients />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />
        <Route path="game-history" element={<GameHistory />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;