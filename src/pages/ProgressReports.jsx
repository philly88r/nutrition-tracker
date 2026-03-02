import React, { useState, useMemo } from 'react';
import { useNutritionContext } from '../hooks/useNutritionContext';
import MacroTracker from '../components/MacroTracker';

/**
 * Progress Reports Page
 * Shows daily, weekly, and monthly nutrition progress
 */
const ProgressReports = () => {
  const { state } = useNutritionContext();
  const [timeframe, setTimeframe] = useState('week'); // 'day', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculate date ranges
  const getDateRange = () => {
    const date = new Date(selectedDate);
    
    if (timeframe === 'day') {
      return {
        start: selectedDate,
        end: selectedDate,
        label: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      };
    } else if (timeframe === 'week') {
      // Get start of week (Sunday)
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return {
        start: startOfWeek.toISOString().split('T')[0],
        end: endOfWeek.toISOString().split('T')[0],
        label: `Week of ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      };
    } else {
      // Month
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      return {
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
    }
  };

  const dateRange = getDateRange();

  // Filter entries for the selected timeframe
  const filteredEntries = useMemo(() => {
    return state.foodEntries.filter(entry => {
      return entry.date >= dateRange.start && entry.date <= dateRange.end;
    });
  }, [state.foodEntries, dateRange]);

  // Calculate totals for the period
  const periodTotals = useMemo(() => {
    return filteredEntries.reduce((acc, entry) => {
      acc.calories += entry.calories || 0;
      acc.protein += entry.protein || 0;
      acc.carbs += entry.carbs || 0;
      acc.fat += entry.fat || 0;
      acc.fiber += entry.fiber || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  }, [filteredEntries]);

  // Calculate daily averages
  const getDaysInRange = () => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const daysInRange = getDaysInRange();
  const dailyAverages = {
    calories: periodTotals.calories / daysInRange,
    protein: periodTotals.protein / daysInRange,
    carbs: periodTotals.carbs / daysInRange,
    fat: periodTotals.fat / daysInRange,
    fiber: periodTotals.fiber / daysInRange
  };

  // Group entries by date
  const entriesByDate = useMemo(() => {
    const grouped = {};
    filteredEntries.forEach(entry => {
      if (!grouped[entry.date]) {
        grouped[entry.date] = [];
      }
      grouped[entry.date].push(entry);
    });
    return grouped;
  }, [filteredEntries]);

  // Calculate daily totals for each day
  const dailyData = useMemo(() => {
    const data = [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayEntries = entriesByDate[dateStr] || [];
      
      const dayTotals = dayEntries.reduce((acc, entry) => {
        acc.calories += entry.calories || 0;
        acc.protein += entry.protein || 0;
        acc.carbs += entry.carbs || 0;
        acc.fat += entry.fat || 0;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
      
      data.push({
        date: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        ...dayTotals,
        entryCount: dayEntries.length
      });
    }
    
    return data;
  }, [dateRange, entriesByDate]);

  // Calculate goal achievement
  const goalAchievement = {
    calories: (dailyAverages.calories / state.dailyGoals.calories) * 100,
    protein: (dailyAverages.protein / state.dailyGoals.protein) * 100,
    carbs: (dailyAverages.carbs / state.dailyGoals.carbs) * 100,
    fat: (dailyAverages.fat / state.dailyGoals.fat) * 100
  };

  // Navigate dates
  const navigateDate = (direction) => {
    const date = new Date(selectedDate);
    
    if (timeframe === 'day') {
      date.setDate(date.getDate() + direction);
    } else if (timeframe === 'week') {
      date.setDate(date.getDate() + (direction * 7));
    } else {
      date.setMonth(date.getMonth() + direction);
    }
    
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Progress Reports</h1>
        <p className="text-sm text-gray-600">Track your nutrition progress over time</p>
      </div>

      {/* Timeframe Selector */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Timeframe Tabs */}
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setTimeframe('day')}
              className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                timeframe === 'day'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                timeframe === 'week'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                timeframe === 'month'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Previous"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center min-w-[180px] sm:min-w-[220px]">
              <div className="text-xs sm:text-sm font-semibold text-gray-900">{dateRange.label}</div>
            </div>
            
            <button
              onClick={() => navigateDate(1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Next"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
          <div className="text-xs sm:text-sm opacity-90 mb-1">Avg Calories/Day</div>
          <div className="text-2xl sm:text-3xl font-bold">{dailyAverages.calories.toFixed(0)}</div>
          <div className="text-xs sm:text-sm opacity-75 mt-1">
            Goal: {state.dailyGoals.calories} ({goalAchievement.calories.toFixed(0)}%)
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
          <div className="text-xs sm:text-sm opacity-90 mb-1">Avg Protein/Day</div>
          <div className="text-2xl sm:text-3xl font-bold">{dailyAverages.protein.toFixed(1)}g</div>
          <div className="text-xs sm:text-sm opacity-75 mt-1">
            Goal: {state.dailyGoals.protein}g ({goalAchievement.protein.toFixed(0)}%)
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
          <div className="text-xs sm:text-sm opacity-90 mb-1">Avg Carbs/Day</div>
          <div className="text-2xl sm:text-3xl font-bold">{dailyAverages.carbs.toFixed(1)}g</div>
          <div className="text-xs sm:text-sm opacity-75 mt-1">
            Goal: {state.dailyGoals.carbs}g ({goalAchievement.carbs.toFixed(0)}%)
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
          <div className="text-xs sm:text-sm opacity-90 mb-1">Avg Fat/Day</div>
          <div className="text-2xl sm:text-3xl font-bold">{dailyAverages.fat.toFixed(1)}g</div>
          <div className="text-xs sm:text-sm opacity-75 mt-1">
            Goal: {state.dailyGoals.fat}g ({goalAchievement.fat.toFixed(0)}%)
          </div>
        </div>
      </div>

      {/* Period Totals */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Period Totals ({daysInRange} days)</h2>
        <MacroTracker 
          totals={periodTotals}
          goals={{
            calories: state.dailyGoals.calories * daysInRange,
            protein: state.dailyGoals.protein * daysInRange,
            carbs: state.dailyGoals.carbs * daysInRange,
            fat: state.dailyGoals.fat * daysInRange
          }}
          showPercentages={true}
        />
      </div>

      {/* Daily Breakdown */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Daily Breakdown</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entries
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calories
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Protein
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carbs
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fat
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailyData.map((day) => (
                <tr key={day.date} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{day.dayName}</div>
                    <div className="text-xs text-gray-500">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {day.entryCount}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.calories.toFixed(0)}
                  </td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.protein.toFixed(1)}g
                  </td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.carbs.toFixed(1)}g
                  </td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.fat.toFixed(1)}g
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {dailyData.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>No food entries for this period</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressReports;
