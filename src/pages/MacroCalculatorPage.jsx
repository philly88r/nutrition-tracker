import React from 'react';
import { useNavigate } from 'react-router-dom';
import MacroCalculator from '../components/MacroCalculator';

/**
 * Macro Calculator Page
 * Allows users to calculate their personalized macro goals
 */
const MacroCalculatorPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen">
      <MacroCalculator onClose={handleClose} />
    </div>
  );
};

export default MacroCalculatorPage;
