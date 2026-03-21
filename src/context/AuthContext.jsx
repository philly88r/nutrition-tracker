import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/apiService';
import { migrateLocalDataToBackend, isMigrationComplete } from '../services/dataMigration';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication status from localStorage and verify token
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userEmail = localStorage.getItem('userEmail');
      
      if (token && userEmail) {
        try {
          // Verify token with backend
          const response = await authAPI.verifyToken();
          if (response.valid) {
            setIsAuthenticated(true);
            setUser(response.user);
          } else {
            // Token invalid, clear auth
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          // Token verification failed
          localStorage.removeItem('authToken');
          localStorage.removeItem('userEmail');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function (stores token from API)
  const login = async (token, userEmail) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', userEmail);
    setIsAuthenticated(true);
    setUser({ email: userEmail });
    
    // Migrate local data to backend if not already done
    if (!isMigrationComplete()) {
      try {
        console.log('Migrating local data to backend...');
        await migrateLocalDataToBackend();
        console.log('Data migration successful!');
      } catch (error) {
        console.error('Data migration failed:', error);
        // Don't block login if migration fails
      }
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Protected route component
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show loading spinner while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location.pathname === '/' ? '/dashboard' : location }} replace />;
  }

  return children;
};

export default AuthContext;
