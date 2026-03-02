import { useState, useEffect } from 'react';

const LoadingScreen = ({ message = 'Loading your nutrition data...' }) => {
  const [showLoadingText, setShowLoadingText] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  
  // Only show loading text after a delay, to avoid flashing for fast loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoadingText(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Animated loading dots
  useEffect(() => {
    if (!showLoadingText) return;
    
    const interval = setInterval(() => {
      setLoadingDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [showLoadingText]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50">
      <div className="animate-spin">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
             className="text-primary dark:text-primary-light">
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" 
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      
      {showLoadingText && (
        <div className="mt-6 text-center">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{message}{loadingDots}</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Calculating your nutrients</p>
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;
