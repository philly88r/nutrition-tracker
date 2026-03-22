import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Calendar from '../components/Calendar';
import DailyFoodLog from '../components/DailyFoodLog';
import { useNutritionContext } from '../hooks/useNutritionContext';
import { getCentralDate } from '../utils/dateUtils';

const Dashboard = () => {
  const { state, dispatch } = useNutritionContext();
  const [selectedDate, setSelectedDate] = useState(getCentralDate());
  const [selectedDateEntries, setSelectedDateEntries] = useState([]);

  // Force selectedDate to current date on mount
  useEffect(() => {
    const today = getCentralDate();
    console.log('Dashboard: Setting initial date to', today);
    setSelectedDate(today);
    dispatch({ type: 'SET_CURRENT_DATE', payload: today });
  }, []);
  
  // Log selectedDate whenever it changes
  useEffect(() => {
    console.log('Dashboard: selectedDate changed to', selectedDate);
  }, [selectedDate]);

  // Update selected date entries when date or food entries change
  useEffect(() => {
    const entryDates = state.foodEntries.map(e => e.date).join(', ');
    const debugInfo = `Total Entries: ${state.foodEntries.length}\nSelected Date: ${selectedDate}\nEntry Dates: ${entryDates || 'none'}`;
    console.log('=== DASHBOARD DEBUG ===');
    console.log(debugInfo);
    console.log('======================');
    
    if (state.foodEntries.length > 0) {
      const dateEntries = state.foodEntries.filter(entry => entry.date === selectedDate);
      console.log(`Filtered ${dateEntries.length} entries for ${selectedDate}`);
      setSelectedDateEntries(dateEntries);
    } else {
      setSelectedDateEntries([]);
    }
  }, [selectedDate, state.foodEntries]);
  
  // Handle date selection from calendar
  const handleSelectDate = (date) => {
    setSelectedDate(date);
    dispatch({ type: 'SET_CURRENT_DATE', payload: date });
  };
  
  // Handle removing a food entry
  const handleRemoveEntry = (entryId) => {
    dispatch({ type: 'DELETE_FOOD_ENTRY', payload: entryId });
    dispatch({ type: 'SAVE_USER_DATA' });
  };

  const quickActions = [
    {
      title: 'Add Food Entry',
      description: 'Log a meal using USDA data or manual entry',
      link: '/add-food',
      color: 'bg-blue-50 text-blue-700'
    },
    {
      title: 'Macro Calculator',
      description: 'Recalculate personalized goals',
      link: '/macro-calculator',
      color: 'bg-purple-50 text-purple-700'
    },
    {
      title: 'Progress Reports',
      description: 'View daily, weekly, monthly trends',
      link: '/progress-reports',
      color: 'bg-emerald-50 text-emerald-700'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">Track today’s nutrition and quickly access key tools.</p>
        </div>
        <Link 
          to="/add-food" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
        >
          + Add Food Entry
        </Link>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main content */}
        <div className="lg:col-span-8 space-y-6">
          <DailyFoodLog 
            entries={selectedDateEntries}
            date={selectedDate}
            onRemoveEntry={handleRemoveEntry}
            onDateChange={handleSelectDate}
          />
        </div>

        {/* Sidebar column */}
        <div className="lg:col-span-4 space-y-6">
          <Calendar 
            foodLog={state.foodEntries} 
            onSelectDate={handleSelectDate} 
            selectedDate={selectedDate} 
          />

          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  to={action.link}
                  className={`block rounded-lg border border-gray-100 px-4 py-3 hover:shadow-sm transition ${action.color}`}
                >
                  <div className="font-semibold">{action.title}</div>
                  <p className="text-sm opacity-80">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">USDA FoodData Central</h2>
            <p className="mb-4 text-sm text-blue-100">
              Search thousands of foods with verified macro and micronutrient data straight from USDA.
            </p>
            <Link 
              to="/add-food" 
              className="inline-block px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100"
            >
              Search USDA Database
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
