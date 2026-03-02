import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Reports = () => {
  const [calorieData, setCalorieData] = useState({ labels: [], datasets: [] });
  const [macroData, setMacroData] = useState({ labels: [], datasets: [] });
  const [dateRange, setDateRange] = useState('week'); // 'week', 'month', 'year'

  useEffect(() => {
    generateReports();
  }, [dateRange]);

  const generateReports = () => {
    try {
      const storedLog = localStorage.getItem('foodLog');
      
      if (storedLog) {
        const foodLog = JSON.parse(storedLog);
        
        // Get date range
        const today = new Date();
        let startDate = new Date();
        
        if (dateRange === 'week') {
          startDate.setDate(today.getDate() - 7);
        } else if (dateRange === 'month') {
          startDate.setMonth(today.getMonth() - 1);
        } else if (dateRange === 'year') {
          startDate.setFullYear(today.getFullYear() - 1);
        }
        
        // Filter entries by date range
        const filteredEntries = foodLog.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= startDate && entryDate <= today;
        });
        
        // Group entries by date
        const entriesByDate = filteredEntries.reduce((acc, entry) => {
          if (!acc[entry.date]) {
            acc[entry.date] = [];
          }
          acc[entry.date].push(entry);
          return acc;
        }, {});
        
        // Sort dates
        const sortedDates = Object.keys(entriesByDate).sort();
        
        // Calculate daily totals
        const dailyCalories = [];
        const dailyProtein = [];
        const dailyCarbs = [];
        const dailyFat = [];
        
        sortedDates.forEach(date => {
          const entries = entriesByDate[date];
          
          const totals = entries.reduce((acc, entry) => {
            acc.calories += entry.calories || 0;
            acc.protein += entry.protein || 0;
            acc.carbs += entry.carbs || 0;
            acc.fat += entry.fat || 0;
            return acc;
          }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
          
          dailyCalories.push(totals.calories);
          dailyProtein.push(totals.protein);
          dailyCarbs.push(totals.carbs);
          dailyFat.push(totals.fat);
        });
        
        // Format dates for display
        const formattedDates = sortedDates.map(date => {
          const d = new Date(date);
          return `${d.getMonth() + 1}/${d.getDate()}`;
        });
        
        // Set calorie chart data
        setCalorieData({
          labels: formattedDates,
          datasets: [
            {
              label: 'Calories',
              data: dailyCalories,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.1
            }
          ]
        });
        
        // Set macro chart data
        setMacroData({
          labels: formattedDates,
          datasets: [
            {
              label: 'Protein (g)',
              data: dailyProtein,
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
              label: 'Carbs (g)',
              data: dailyCarbs,
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
            {
              label: 'Fat (g)',
              data: dailyFat,
              backgroundColor: 'rgba(255, 206, 86, 0.5)',
            }
          ]
        });
      }
    } catch (err) {
      console.error('Error generating reports:', err);
    }
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Nutrition Reports</h1>
      
      {/* Date range selector */}
      <div className="mb-6">
        <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
          Date Range
        </label>
        <select
          id="dateRange"
          value={dateRange}
          onChange={handleDateRangeChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last 365 Days</option>
        </select>
      </div>
      
      {/* Calorie chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Daily Calorie Intake</h2>
        {calorieData.labels.length > 0 ? (
          <div className="h-64">
            <Line
              data={calorieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No data available for the selected date range
          </div>
        )}
      </div>
      
      {/* Macronutrient chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Daily Macronutrients</h2>
        {macroData.labels.length > 0 ? (
          <div className="h-64">
            <Bar
              data={macroData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No data available for the selected date range
          </div>
        )}
      </div>
      
      {/* Info card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2">About Your Nutrition Data</h2>
        <p className="text-gray-600 mb-4">
          These reports are generated based on your food log entries. For more accurate tracking, use foods from the USDA database.
        </p>
        <p className="text-gray-600">
          The USDA FoodData Central database provides comprehensive, accurate nutritional information for thousands of foods.
        </p>
      </div>
    </div>
  );
};

export default Reports;
