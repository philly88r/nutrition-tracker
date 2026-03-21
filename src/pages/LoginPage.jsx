import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, kdpAPI } from '../services/apiService';

const LoginPage = () => {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'kdp'
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  // --- Standard auth state ---
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError]   = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await authAPI.login(email.trim(), password);
      login(res.token, res.user.email);
      navigate('/');
    } catch (err) {
      setAuthError(err.message || 'Login failed. Check your email and password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await authAPI.register(email.trim(), password);
      login(res.token, res.user.email);
      navigate('/');
    } catch (err) {
      setAuthError(err.message || 'Registration failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // --- KDP state ---
  const [kdpMode, setKdpMode]       = useState('login'); // 'login' | 'register'
  const [kdpStep, setKdpStep]       = useState('code');  // 'code' | 'register'
  const [kdpBookCode, setKdpBookCode] = useState('');
  const [kdpEmail, setKdpEmail]     = useState('');
  const [kdpPin, setKdpPin]         = useState('');
  const [kdpError, setKdpError]     = useState('');
  const [kdpSuccess, setKdpSuccess] = useState('');
  const [kdpLoading, setKdpLoading] = useState(false);

  const handleKdpPinChange = (e) => {
    const v = e.target.value;
    if (/^\d*$/.test(v) && v.length <= 6) { setKdpPin(v); setKdpError(''); }
  };

  const handleKdpValidate = async (e) => {
    e.preventDefault();
    setKdpError(''); setKdpSuccess(''); setKdpLoading(true);
    try {
      await kdpAPI.validateCode(kdpBookCode.trim());
      setKdpStep('register');
      setKdpSuccess('Code validated! Enter your email and create a 6-digit PIN.');
    } catch (err) {
      setKdpError(err.message || 'Invalid code. Please check your book code.');
    } finally { setKdpLoading(false); }
  };

  const handleKdpRegister = async (e) => {
    e.preventDefault();
    setKdpError(''); setKdpSuccess(''); setKdpLoading(true);
    try {
      const res = await kdpAPI.register(kdpBookCode.trim(), kdpEmail.trim(), kdpPin);
      login(res.token, res.user.email);
      navigate('/');
    } catch (err) {
      setKdpError(err.message || 'Registration failed. Please try again.');
    } finally { setKdpLoading(false); }
  };

  const handleKdpLogin = async (e) => {
    e.preventDefault();
    setKdpError(''); setKdpSuccess(''); setKdpLoading(true);
    try {
      const res = await kdpAPI.login(kdpEmail.trim(), kdpPin);
      login(res.token, res.user.email);
      navigate('/');
    } catch (err) {
      setKdpError(err.message || 'Login failed. Please try again.');
    } finally { setKdpLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const btnPrimary = "w-full py-3 px-4 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors";
  const btnSecondary = "w-full py-3 px-4 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/images/logo-dark.png" alt="NutriTrack" className="mx-auto h-28 w-28 object-contain" />
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">NutriTrack</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your AI-powered nutrition companion</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
          {[
            { key: 'login',    label: 'Sign In' },
            { key: 'register', label: 'Sign Up' },
            { key: 'kdp',      label: '📖 Book Code' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setAuthError(''); setKdpError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-5">

          {/* --- SIGN IN --- */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
              </div>
              {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
              <button type="submit" disabled={authLoading} className={btnPrimary}>
                {authLoading ? 'Signing in...' : 'Sign In'}
              </button>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <button type="button" onClick={() => setTab('register')} className="text-blue-600 hover:underline font-medium">Sign up free</button>
              </p>
            </form>
          )}

          {/* --- SIGN UP --- */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className={inputClass} />
              </div>
              {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
              <button type="submit" disabled={authLoading} className={btnPrimary}>
                {authLoading ? 'Creating account...' : 'Create Account'}
              </button>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <button type="button" onClick={() => setTab('login')} className="text-blue-600 hover:underline font-medium">Sign in</button>
              </p>
            </form>
          )}

          {/* --- KDP BOOK CODE --- */}
          {tab === 'kdp' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Purchased the book? Use your included code to unlock access.
              </p>

              {/* Login / Register toggle */}
              <div className="flex gap-2">
                {['login', 'register'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setKdpMode(m); setKdpError(''); setKdpSuccess(''); setKdpStep('code'); setKdpBookCode(''); setKdpEmail(''); setKdpPin(''); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      kdpMode === m
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {m === 'login' ? 'Already Registered' : 'New Registration'}
                  </button>
                ))}
              </div>

              {/* KDP Login */}
              {kdpMode === 'login' && (
                <form onSubmit={handleKdpLogin} className="space-y-3">
                  <input type="email" required value={kdpEmail} onChange={e => setKdpEmail(e.target.value)} placeholder="Email" className={inputClass} />
                  <input type="password" required value={kdpPin} onChange={handleKdpPinChange} maxLength={6} placeholder="6-digit PIN" className={`${inputClass} text-center tracking-widest`} />
                  {kdpError && <p className="text-red-500 text-sm text-center">{kdpError}</p>}
                  <button type="submit" disabled={!kdpEmail || kdpPin.length !== 6 || kdpLoading} className={btnSecondary}>
                    {kdpLoading ? 'Signing in...' : 'Sign In with Book Code'}
                  </button>
                </form>
              )}

              {/* KDP Register */}
              {kdpMode === 'register' && (
                <>
                  {kdpStep === 'code' && (
                    <form onSubmit={handleKdpValidate} className="space-y-3">
                      <input type="text" required value={kdpBookCode} onChange={e => setKdpBookCode(e.target.value)} placeholder="Enter your book code" className={inputClass} />
                      {kdpError && <p className="text-red-500 text-sm text-center">{kdpError}</p>}
                      <button type="submit" disabled={!kdpBookCode || kdpLoading} className={btnSecondary}>
                        {kdpLoading ? 'Validating...' : 'Validate Book Code'}
                      </button>
                    </form>
                  )}
                  {kdpStep === 'register' && (
                    <form onSubmit={handleKdpRegister} className="space-y-3">
                      {kdpSuccess && <p className="text-green-600 text-sm text-center">{kdpSuccess}</p>}
                      <input type="email" required value={kdpEmail} onChange={e => setKdpEmail(e.target.value)} placeholder="Email" className={inputClass} />
                      <input type="password" required value={kdpPin} onChange={handleKdpPinChange} maxLength={6} placeholder="Create a 6-digit PIN" className={`${inputClass} text-center tracking-widest`} />
                      {kdpError && <p className="text-red-500 text-sm text-center">{kdpError}</p>}
                      <button type="submit" disabled={!kdpEmail || kdpPin.length !== 6 || kdpLoading} className={btnSecondary}>
                        {kdpLoading ? 'Creating account...' : 'Register & Unlock'}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
