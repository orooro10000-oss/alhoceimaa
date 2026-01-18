import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Booking } from '../types';

interface CalendarProps {
  bookings: Booking[];
  onChange: (start: string, end: string) => void;
  selectedStart: string;
  selectedEnd: string;
}

const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const DAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export const Calendar: React.FC<CalendarProps> = ({ bookings, onChange, selectedStart, selectedEnd }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Helper to format date as YYYY-MM-DD for comparison
  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateBooked = (dateStr: string) => {
    return bookings.some(b => dateStr >= b.startDate && dateStr <= b.endDate);
  };

  const isDateBeforeToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  };

  const handleDayClick = (day: number) => {
    const dateStr = formatDate(currentYear, currentMonth, day);
    
    if (isDateBooked(dateStr) || isDateBeforeToday(dateStr)) return;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Start new selection
      onChange(dateStr, '');
    } else {
      // Selecting end date
      if (dateStr < selectedStart) {
        // User clicked a date before start, treat as new start
        onChange(dateStr, '');
      } else {
        // Verify no booked dates in between
        const hasOverlap = bookings.some(b => 
          (b.startDate > selectedStart && b.startDate < dateStr)
        );

        if (hasOverlap) {
          alert('عذراً، الفترة المختارة تتضمن أياماً محجوزة مسبقاً.');
          onChange(dateStr, ''); // Reset to this date as start
        } else {
          onChange(selectedStart, dateStr);
        }
      }
    }
  };

  // Generate grid
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 select-none">
      {/* Header */}
      <div className="flex justify-between items-center mb-4" dir="rtl">
        <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full">
          <ChevronRight size={20} />
        </button>
        <span className="font-bold text-gray-800">
          {MONTHS[currentMonth]} {currentYear}
        </span>
        <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center" dir="rtl">
        {DAYS.map(d => (
          <div key={d} className="text-xs text-gray-500 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1" dir="rtl">
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {days.map(day => {
          const dateStr = formatDate(currentYear, currentMonth, day);
          const booked = isDateBooked(dateStr);
          const disabled = booked || isDateBeforeToday(dateStr);
          
          const isSelectedStart = dateStr === selectedStart;
          const isSelectedEnd = dateStr === selectedEnd;
          const isInRange = selectedStart && selectedEnd && dateStr > selectedStart && dateStr < selectedEnd;

          return (
            <button
              type="button"
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={disabled}
              className={`
                aspect-square rounded-full flex items-center justify-center text-sm relative
                ${disabled ? 'text-gray-300 cursor-not-allowed line-through decoration-gray-400 decoration-1' : 'hover:border-black border border-transparent'}
                ${(isSelectedStart || isSelectedEnd) ? 'bg-black text-white hover:bg-black hover:border-black font-bold' : ''}
                ${isInRange ? 'bg-gray-100 !rounded-none' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 justify-center">
        <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-black"></div>
            <span>محدد</span>
        </div>
        <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <span className="line-through">محجوز</span>
        </div>
      </div>
    </div>
  );
};