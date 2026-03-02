import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNutritionContext } from '../hooks/useNutritionContext';
import { useAuth } from '../context/AuthContext';
import { authAPI, kdpAPI } from '../services/apiService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [kdpBookCode, setKdpBookCode] = useState('');
  const [kdpEmail, setKdpEmail] = useState('');
  const [kdpPin, setKdpPin] = useState('');
  const [kdpError, setKdpError] = useState('');
  const [kdpStep, setKdpStep] = useState('code'); // code | register
  const [kdpIsLoading, setKdpIsLoading] = useState(false);
  const [kdpSuccess, setKdpSuccess] = useState('');
  const [kdpMode, setKdpMode] = useState('login'); // login | register
  const navigate = useNavigate();
  const { state, dispatch } = useNutritionContext();
  const { login, isAuthenticated } = useAuth();

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handlePinChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 6 digits
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPin(value);
      setError('');
    }
  };

  const handleKdpValidate = async (e) => {
    e.preventDefault();
    setKdpError('');
    setKdpSuccess('');
    setKdpIsLoading(true);
    try {
      await kdpAPI.validateCode(kdpBookCode.trim());
      setKdpStep('register');
      setKdpSuccess('Code validated. Enter your email and create a 6-digit PIN.');
    } catch (err) {
      setKdpError(err.message || 'Invalid code. Please check your book code.');
    } finally {
      setKdpIsLoading(false);
    }
  };

  const handleKdpRegister = async (e) => {
    e.preventDefault();
    setKdpError('');
    setKdpSuccess('');
    setKdpIsLoading(true);
    try {
      const response = await kdpAPI.register(
        kdpBookCode.trim(),
        kdpEmail.trim(),
        kdpPin
      );
      login(response.token, response.user.email);
      navigate('/');
    } catch (err) {
      setKdpError(err.message || 'Registration failed. Please try again.');
    } finally {
      setKdpIsLoading(false);
    }
  };

  const handleKdpLogin = async (e) => {
    e.preventDefault();
    setKdpError('');
    setKdpSuccess('');
    setKdpIsLoading(true);
    try {
      const response = await kdpAPI.login(kdpEmail.trim(), kdpPin);
      login(response.token, response.user.email);
      navigate('/');
    } catch (err) {
      setKdpError(err.message || 'Login failed. Please try again.');
    } finally {
      setKdpIsLoading(false);
    }
  };

  const handleKdpPinChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setKdpPin(value);
      setKdpError('');
    }
  };

  const resetKdp = () => {
    setKdpBookCode('');
    setKdpEmail('');
    setKdpPin('');
    setKdpError('');
    setKdpSuccess('');
    setKdpStep('code');
    setKdpMode('login');
  };

  const switchKdpMode = (mode) => {
    setKdpMode(mode);
    setKdpError('');
    setKdpSuccess('');
    if (mode === 'register') {
      setKdpStep('code');
      setKdpBookCode('');
      setKdpEmail('');
      setKdpPin('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Verify PIN with backend (backend will find user by PIN)
      const response = await authAPI.verifyPin(null, pin);
      
      // Login with token and email from response
      login(response.token, response.user.email);
      
      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid PIN. Please try again.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="text-center">
          <img 
            src="/images/nutrition-logo.svg" 
            alt="NutriTrack Logo" 
            className="mx-auto h-16 w-16" 
          />
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">
            NutriTrack
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please enter your 6-digit PIN to access your nutrition tracker
          </p>
        </div>
        
        {/* Legacy PIN login (unchanged) */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="pin" className="sr-only">PIN</label>
            <input
              id="pin"
              name="pin"
              type="password"
              required
              value={pin}
              onChange={handlePinChange}
              className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 text-center text-2xl tracking-widest focus:outline-none focus:ring-primary focus:border-primary focus:z-10"
              placeholder="• • • • • •"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="text-red-500 text-center text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={pin.length !== 6 || isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Unlock'}
            </button>
          </div>
          
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            Default PIN: 123456<br/>
            <span className="text-xs">First time? Your PIN will be created automatically</span>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span>KDP Buyers</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* KDP Flow */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">KDP Access</h3>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => switchKdpMode('login')}
                className={`px-3 py-1 rounded-md ${kdpMode === 'login' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchKdpMode('register')}
                className={`px-3 py-1 rounded-md ${kdpMode === 'register' ? 'bg-secondary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={resetKdp}
                className="text-xs text-primary hover:underline"
              >
                Reset
              </button>
            </div>
          </div>

          {kdpMode === 'login' && (
            <form className="space-y-4" onSubmit={handleKdpLogin}>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label htmlFor="kdp-login-email" className="sr-only">Email</label>
                  <input
                    id="kdp-login-email"
                    type="email"
                    required
                    value={kdpEmail}
                    onChange={(e) => setKdpEmail(e.target.value)}
                    className="appearance-none rounded-md block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <label htmlFor="kdp-login-pin" className="sr-only">6-digit PIN</label>
                  <input
                    id="kdp-login-pin"
                    type="password"
                    required
                    value={kdpPin}
                    onChange={handleKdpPinChange}
                    maxLength={6}
                    className="appearance-none rounded-md block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 text-center tracking-widest focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="••••••"
                  />
                </div>
              </div>
              {kdpError && <div className="text-red-500 text-sm text-center">{kdpError}</div>}
              {kdpSuccess && <div className="text-green-600 text-sm text-center">{kdpSuccess}</div>}
              <button
                type="submit"
                disabled={!kdpEmail || kdpPin.length !== 6 || kdpIsLoading}
                className="w-full py-3 px-4 text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {kdpIsLoading ? 'Signing in...' : 'Login'}
              </button>
            </form>
          )}

          {kdpMode === 'register' && (
            <>
              {kdpStep === 'code' && (
                <form className="space-y-4" onSubmit={handleKdpValidate}>
                  <div>
                    <label htmlFor="kdp-code" className="sr-only">Book Code</label>
                    <input
                      id="kdp-code"
                      name="kdp-code"
                      type="text"
                      required
                      value={kdpBookCode}
                      onChange={(e) => setKdpBookCode(e.target.value)}
                      className="appearance-none rounded-md block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="Enter book code"
                    />
                  </div>
                  {kdpError && <div className="text-red-500 text-sm text-center">{kdpError}</div>}
                  {kdpSuccess && <div className="text-green-600 text-sm text-center">{kdpSuccess}</div>}
                  <button
                    type="submit"
                    disabled={!kdpBookCode || kdpIsLoading}
                    className="w-full py-3 px-4 text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {kdpIsLoading ? 'Validating...' : 'Validate Book Code'}
                  </button>
                </form>
              )}

              {kdpStep === 'register' && (
                <form className="space-y-4" onSubmit={handleKdpRegister}>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label htmlFor="kdp-email" className="sr-only">Email</label>
                      <input
                        id="kdp-email"
                        type="email"
                        required
                        value={kdpEmail}
                        onChange={(e) => setKdpEmail(e.target.value)}
                        className="appearance-none rounded-md block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Email"
                      />
                    </div>
                    <div>
                      <label htmlFor="kdp-pin" className="sr-only">6-digit PIN</label>
                      <input
                        id="kdp-pin"
                        type="password"
                        required
                        value={kdpPin}
                        onChange={handleKdpPinChange}
                        maxLength={6}
                        className="appearance-none rounded-md block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 text-center tracking-widest focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="••••••"
                      />
                    </div>
                  </div>
                  {kdpError && <div className="text-red-500 text-sm text-center">{kdpError}</div>}
                  {kdpSuccess && <div className="text-green-600 text-sm text-center">{kdpSuccess}</div>}
                  <button
                    type="submit"
                    disabled={!kdpEmail || kdpPin.length !== 6 || kdpIsLoading}
                    className="w-full py-3 px-4 text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {kdpIsLoading ? 'Creating account...' : 'Register & Unlock'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
