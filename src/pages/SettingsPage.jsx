import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNutritionContext } from '../hooks/useNutritionContext';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/apiService';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { state, dispatch } = useNutritionContext();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Handle PIN input changes
  const handlePinChange = (setter) => (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 6 digits
    if (/^\d*$/.test(value) && value.length <= 6) {
      setter(value);
    }
  };

  // Handle PIN update
  const handleUpdatePin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    
    // Validate new PIN
    if (newPin.length !== 6) {
      setMessage({ text: 'New PIN must be 6 digits', type: 'error' });
      setIsLoading(false);
      return;
    }
    
    // Validate PIN confirmation
    if (newPin !== confirmPin) {
      setMessage({ text: 'New PIN and confirmation do not match', type: 'error' });
      setIsLoading(false);
      return;
    }
    
    try {
      // Update PIN via API
      await authAPI.updatePin(currentPin, newPin);
      
      // Show success message
      setMessage({ text: 'PIN updated successfully', type: 'success' });
      
      // Reset form
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      setMessage({ text: error.message || 'Failed to update PIN', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      payload: { theme: newTheme } 
    });
    
    // Save settings
    dispatch({ type: 'SAVE_USER_DATA' });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PIN Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          
          <form onSubmit={handleUpdatePin} className="space-y-4">
            <div>
              <label htmlFor="currentPin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current PIN
              </label>
              <input
                id="currentPin"
                type="password"
                value={currentPin}
                onChange={handlePinChange(setCurrentPin)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Enter current 6-digit PIN"
                required
              />
            </div>
            
            <div>
              <label htmlFor="newPin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New PIN
              </label>
              <input
                id="newPin"
                type="password"
                value={newPin}
                onChange={handlePinChange(setNewPin)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Enter new 6-digit PIN"
                required
              />
            </div>
            
            <div>
              <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New PIN
              </label>
              <input
                id="confirmPin"
                type="password"
                value={confirmPin}
                onChange={handlePinChange(setConfirmPin)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Confirm new 6-digit PIN"
                required
              />
            </div>
            
            {message.text && (
              <div className={`text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                {message.text}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? 'Updating...' : 'Update PIN'}
            </button>
          </form>
        </div>
        
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button
              onClick={handleThemeToggle}
              className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                state.settings.theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span className="sr-only">Toggle theme</span>
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  state.settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Session</h2>
          
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
