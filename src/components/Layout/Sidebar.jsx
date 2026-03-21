import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNutritionContext } from '../../hooks/useNutritionContext';

// Icons
import {
  HomeIcon,
  BookOpenIcon,
  ArchiveBoxIcon,
  BeakerIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ShoppingBagIcon,
  CalculatorIcon,
  ChatBubbleLeftRightIcon,
  BookmarkIcon,
  EnvelopeIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, isMobile }) => {
  const { state, dispatch } = useNutritionContext();
  const location = useLocation();
  
  // Navigation items
  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/nutrition-coach', icon: ChatBubbleLeftRightIcon, label: 'AI Nutrition Coach' },
    { path: '/saved-recipes', icon: BookmarkIcon, label: 'Saved Recipes' },
    { path: '/macro-calculator', icon: CalculatorIcon, label: 'Macro Calculator' },
    { path: '/progress-reports', icon: ChartBarIcon, label: 'Progress Reports' },
    { path: '/grocery', icon: ShoppingBagIcon, label: 'Grocery List' },
    { path: '/contact', icon: EnvelopeIcon, label: 'Contact Us' },
    { path: '/upgrade', icon: BoltIcon, label: 'Upgrade to Pro', highlight: true }
  ];
  
  // Check if a nav item is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Render a nav item
  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    if (item.highlight) {
      return (
        <Link
          to={item.path}
          className="flex items-center px-4 py-2 my-1 text-sm font-semibold rounded-md transition-all bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600"
        >
          <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>{item.label}</span>
        </Link>
      );
    }

    return (
      <Link
        to={item.path}
        className={`flex items-center px-4 py-2 my-1 text-sm font-medium rounded-md transition-all ${
          active
            ? 'bg-primary-light/10 text-primary dark:bg-primary-dark/20 dark:text-primary-light'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        }`}
      >
        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 shadow-md flex-shrink-0 transition-all duration-300 ${
        isMobile 
          ? (isOpen ? 'translate-x-0' : '-translate-x-full')
          : 'translate-x-0'
      } ${isMobile ? 'fixed left-0 top-0 z-30 h-full w-64' : 'h-screen w-64 md:w-64'}`}
    >
      <div className="flex flex-col h-full">
        {/* Logo and app name */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <img src="/images/logo-dark.png" alt="Logo" className="h-14 w-14 object-contain" />
            <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              NutriTrack
            </h1>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item, index) => (
              <NavItem key={index} item={item} />
            ))}
          </div>
        </div>
        
        {/* Daily summary */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-700 p-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Today's Summary</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Calories</span>
                <span className="font-medium">{state.dailyTotals?.calories || 0} / {state.dailyGoals.calories}</span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Protein</span>
                <span className="font-medium">{state.dailyTotals?.protein || 0}g / {state.dailyGoals.protein}g</span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Carbs</span>
                <span className="font-medium">{state.dailyTotals?.carbs || 0}g / {state.dailyGoals.carbs}g</span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Fat</span>
                <span className="font-medium">{state.dailyTotals?.fat || 0}g / {state.dailyGoals.fat}g</span>
              </div>
              
              {/* Debug info - remove in production */}
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <button 
                  onClick={() => {
                    console.log('Current state:', state);
                    // Force recalculation
                    dispatch({ type: 'SET_CURRENT_DATE', payload: state.currentDate });
                    // Also force a direct calculation
                    setTimeout(() => {
                      dispatch({ type: 'CALCULATE_DAILY_TOTALS' });
                    }, 100);
                  }}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  Refresh Totals
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
