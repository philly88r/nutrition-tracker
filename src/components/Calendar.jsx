import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';

const Calendar = ({ foodLog, onSelectDate, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Generate days for the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Navigate to previous/next month
  const prevMonth = () => setCurrentMonth(month => new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(month => new Date(month.getFullYear(), month.getMonth() + 1, 1));
  
  // Check if a date has food entries
  const hasFoodEntries = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return foodLog.some(entry => entry.date === dateStr);
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Previous month"
          >
            &lt;
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Next month"
          >
            &gt;
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasEntries = hasFoodEntries(day);
          const isSelected = selectedDate === dateStr;
          
          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`
                h-12 rounded-md flex flex-col items-center justify-center
                ${isSameMonth(day, currentMonth) ? 'text-gray-900' : 'text-gray-400'}
                ${isSelected ? 'bg-blue-100 border border-blue-500' : 
                  hasEntries ? 'bg-green-50' : 'hover:bg-gray-100'}
                ${isSameDay(day, new Date()) && !isSelected ? 'border border-gray-300' : ''}
              `}
            >
              <span>{format(day, 'd')}</span>
              {hasEntries && (
                <div className="w-2 h-2 rounded-full mt-1 bg-green-500"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
