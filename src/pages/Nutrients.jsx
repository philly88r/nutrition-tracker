import React, { useState, useEffect } from 'react';
import { micronutrients } from '../data/nutrientData';

const Nutrients = () => {
  const [dailyNutrients, setDailyNutrients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Load food log and calculate nutrient totals
    const calculateNutrients = () => {
      try {
        const storedLog = localStorage.getItem('foodLog');
        
        if (storedLog) {
          const foodLog = JSON.parse(storedLog);
          const todayEntries = foodLog.filter(entry => entry.date === selectedDate);
          
          // Initialize nutrient totals
          const nutrientTotals = micronutrients.map(nutrient => ({
            ...nutrient,
            total: 0,
            percentRDI: 0
          }));
          
          // Calculate totals
          todayEntries.forEach(entry => {
            nutrientTotals.forEach(nutrient => {
              if (entry[nutrient.key]) {
                nutrient.total += entry[nutrient.key];
                nutrient.percentRDI = (nutrient.total / nutrient.rdi) * 100;
              }
            });
          });
          
          setDailyNutrients(nutrientTotals);
        }
      } catch (err) {
        console.error('Error calculating nutrients:', err);
      }
    };
    
    calculateNutrients();
  }, [selectedDate]);

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Micronutrients</h1>
      
      {/* Date selector */}
      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Select Date
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Nutrients table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nutrient
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % of RDI
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dailyNutrients.map((nutrient) => (
              <tr key={nutrient.key}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{nutrient.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {nutrient.total.toFixed(1)} {nutrient.unit}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {nutrient.percentRDI.toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        nutrient.percentRDI < 50 ? 'bg-red-500' : 
                        nutrient.percentRDI < 100 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(nutrient.percentRDI, 100)}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Information card */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">About Micronutrients</h2>
        <p className="text-sm text-blue-700 mb-2">
          Micronutrients are essential vitamins and minerals required in small amounts for normal growth and development.
        </p>
        <p className="text-sm text-blue-700">
          The values shown here are calculated based on your daily food log entries using data from the USDA FoodData Central database, 
          providing accurate and reliable nutritional information for your tracking needs.
        </p>
      </div>
    </div>
  );
};

export default Nutrients;
