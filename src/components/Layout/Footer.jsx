import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 text-center text-xs text-gray-500 dark:text-gray-400">
      <p>&copy; {currentYear} NutriTrack. All rights reserved.</p>
      <p className="mt-1">Built with health and nutrition in mind.</p>
    </footer>
  );
};

export default Footer;
