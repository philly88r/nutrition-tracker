import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNutritionContext } from '../../hooks/useNutritionContext';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';

// Icons
import { 
  Bars3Icon,
  MoonIcon,
  SunIcon,
  CalendarIcon,
  PlusIcon,
  UserCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Header = ({ toggleSidebar }) => {
  const { state, dispatch } = useNutritionContext();
  const { logout } = useAuth();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const datePickerRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Handle clicks outside of menus to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
      
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      payload: { theme: newTheme } 
    });
    
    // Save settings
    dispatch({ type: 'SAVE_USER_DATA' });
  };

  // Handle date change
  const handleDateChange = (date) => {
    dispatch({ type: 'SET_CURRENT_DATE', payload: date });
    setShowDatePicker(false);
    
    // Save current date
    dispatch({ type: 'SAVE_USER_DATA' });
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      navigate(`/foods?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  // Format the current date - always use today's date
  const formattedDate = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center z-10">
      <div className="px-4 w-full flex items-center justify-between">
        {/* Left section - sidebar toggle and current date */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-800 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
            aria-label="Toggle menu"
          >
            <span className="sr-only">Toggle sidebar</span>
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          {/* Current date with picker */}
          <div className="relative ml-4" ref={datePickerRef}>
            <button
              className="flex items-center px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>{formattedDate}</span>
            </button>
            
            {/* Date picker dropdown */}
            {showDatePicker && (
              <div className="absolute top-10 left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-30 p-4">
                <input
                  type="date"
                  className="form-input"
                  value={state.currentDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Right section - search, add food, theme toggle, user menu */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search foods..."
                className="w-48 pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>
          
          {/* Add food button */}
          <button
            onClick={() => navigate('/add-food')}
            className="hidden sm:flex items-center px-3 py-1.5 text-sm bg-primary hover:bg-primary-dark text-white rounded-md"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            <span>Add Food</span>
          </button>
          
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
          >
            {state.settings.theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
          
          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"
            >
              <UserCircleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
            
            {/* User menu dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {state.user?.name || 'User'}
                  </p>
                  {state.user?.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {state.user.email}
                    </p>
                  )}
                </div>
                
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                >
                  Settings
                </a>
                
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                    navigate('/login');
                  }}
                >
                  Logout
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
