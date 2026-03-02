import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import GroceryList from './pages/GroceryList';
import AddFoodPage from './pages/AddFoodPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import MacroCalculatorPage from './pages/MacroCalculatorPage';
import ProgressReports from './pages/ProgressReports';
import NotFound from './pages/NotFound';
import LoadingScreen from './components/UI/LoadingScreen';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import DataPersister from './components/DataPersister';

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/grocery"
      element={
        <ProtectedRoute>
          <Layout>
            <GroceryList />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/add-food"
      element={
        <ProtectedRoute>
          <Layout>
            <AddFoodPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/settings"
      element={
        <ProtectedRoute>
          <Layout>
            <SettingsPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/macro-calculator"
      element={
        <ProtectedRoute>
          <Layout>
            <MacroCalculatorPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/progress-reports"
      element={
        <ProtectedRoute>
          <Layout>
            <ProgressReports />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route path="/dashboard" element={<Navigate to="/" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Simulate quick app bootstrap; replace with real init if needed
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 200);
      return () => clearTimeout(timer);
    } catch (err) {
      console.error('App initialization error:', err);
      setError(err.message || 'Unknown error');
    }
  }, []);

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>App Error</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <DataPersister />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
