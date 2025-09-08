import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CalendarProps, 
  CalendarState, 
  CalendarActions, 
  CalendarHelpers,
  CalendarMonth,
  DateRange,
  SelectionMode 
} from '../types';

export function useCalendar(props: CalendarProps) {
  const {
    selectionMode = 'range',
    defaultValue = { start: null, end: null },
    value,
    onChange,
    minDate,
    maxDate,
    disabledDates = [],
    disabledDays = [],
    locale = 'ru-RU',
    weekStartsOn = 0,
    monthNames,
    dayNames,
    monthBuffer = { before: 12, after: 24 }
  } = props;

  // Internal state
  const [internalSelectedRange, setInternalSelectedRange] = useState<DateRange>(defaultValue);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [internalSelectionMode, setInternalSelectionMode] = useState<SelectionMode>(selectionMode);
  const [visibleMonths, setVisibleMonths] = useState<CalendarMonth[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(monthBuffer.before);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Use controlled or uncontrolled value
  const selectedRange = value !== undefined ? value : internalSelectedRange;

  const getDefaultDayNames = () => {
    if (dayNames) return dayNames;
    
    const names = [];
    const date = new Date(2024, 0, weekStartsOn === 1 ? 1 : 7); // Start from Monday or Sunday
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(date);
      dayDate.setDate(date.getDate() + i);
      names.push(dayDate.toLocaleDateString(locale, { weekday: 'short' }));
    }
    return names;
  };

  // Generate months array
  const generateMonths = useCallback((): CalendarMonth[] => {
    const months: CalendarMonth[] = [];
    const today = new Date();

    for (let i = -monthBuffer.before; i <= monthBuffer.after; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const fullMonthName = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      
      months.push({
        date,
        month: date.getMonth(),
        year: date.getFullYear(),
        monthName: fullMonthName,
        days: getDaysInMonth(date.getFullYear(), date.getMonth())
      });
    }
    return months;
  }, [locale, monthNames, monthBuffer, weekStartsOn]);

  // Generate days in month
  const getDaysInMonth = (year: number, month: number): Array<Date | null> => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startingDayOfWeek = firstDay.getDay();

    // Adjust for week start day
    if (weekStartsOn === 1) {
      startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    }

    const days: Array<Date | null> = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Initialize months
  useEffect(() => {
    setVisibleMonths(generateMonths());
    setCurrentMonthIndex(monthBuffer.before);
  }, [generateMonths, monthBuffer.before]);

  // Helpers
  const helpers: CalendarHelpers = {
    isDateDisabled: (date: Date | null): boolean => {
      if (!date) return true;
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      if (disabledDays.includes(date.getDay())) return true;
      return disabledDates.some(
        disabledDate => date.toDateString() === disabledDate.toDateString()
      );
    },

    isDateInRange: (date: Date | null): boolean => {
      if (!date || !selectedRange.start) return false;

      if (internalSelectionMode === 'single') {
        return selectedRange.start && date.toDateString() === selectedRange.start.toDateString();
      }

      if (selectedRange.start && selectedRange.end) {
        return date >= selectedRange.start && date <= selectedRange.end;
      }

      if (selectedRange.start && hoveredDate && !selectedRange.end) {
        const start = selectedRange.start < hoveredDate ? selectedRange.start : hoveredDate;
        const end = selectedRange.start < hoveredDate ? hoveredDate : selectedRange.start;
        return date >= start && date <= end;
      }

      return selectedRange.start && date.toDateString() === selectedRange.start.toDateString();
    },

    isDateRangeEnd: (date: Date | null): boolean => {
      if (!date || internalSelectionMode === 'single') return false;
      return Boolean(
        (selectedRange.start && date.toDateString() === selectedRange.start.toDateString()) ||
        (selectedRange.end && date.toDateString() === selectedRange.end.toDateString())
      );
    },

    isToday: (date: Date | null): boolean => {
      if (!date) return false;
      const today = new Date();
      return date.toDateString() === today.toDateString();
    },

    getDaysInRange: (): number => {
      if (!selectedRange.start || !selectedRange.end) return 0;
      const diffTime = Math.abs(selectedRange.end.getTime() - selectedRange.start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    },

    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions): string => {
      const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      return date.toLocaleDateString(locale, { ...defaultOptions, ...options });
    }
  };

  // Handle selection change
  const handleSelectionChange = (newValue: DateRange) => {
    if (value === undefined) {
      setInternalSelectedRange(newValue);
    }
    onChange?.(newValue);
  };

  // Actions
  const actions: CalendarActions = {
    selectDate: (date: Date) => {
      if (helpers.isDateDisabled(date)) return;

      if (internalSelectionMode === 'single') {
        handleSelectionChange({ start: date, end: null });
        return;
      }

      // Range mode
      if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
        handleSelectionChange({ start: date, end: null });
      } else if (selectedRange.start && !selectedRange.end) {
        if (date < selectedRange.start) {
          handleSelectionChange({ start: date, end: selectedRange.start });
        } else {
          handleSelectionChange({ start: selectedRange.start, end: date });
        }
      }
    },

    clearSelection: () => {
      handleSelectionChange({ start: null, end: null });
      setHoveredDate(null);
    },

    setHoveredDate: (date: Date | null) => {
      setHoveredDate(date);
    },

    setSelectionMode: (mode: SelectionMode) => {
      setInternalSelectionMode(mode);
      actions.clearSelection();
    },

    scrollToMonth: (index: number) => {
      if (!containerRef.current) return;
      
      setIsScrolling(true);
      isScrollingRef.current = true;
      
      const monthHeight = 350; // This should be configurable
      
      containerRef.current.scrollTo({
        behavior: 'smooth',
        top: index * monthHeight
      });

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        isScrollingRef.current = false;
      }, 500);
    },

    scrollToToday: () => {
      actions.scrollToMonth(monthBuffer.before);
    }
  };

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (isScrollingRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const monthHeight = 350; // This should be configurable

    const newMonthIndex = Math.round(scrollTop / monthHeight);

    if (
      newMonthIndex !== currentMonthIndex &&
      newMonthIndex >= 0 &&
      newMonthIndex < visibleMonths.length
    ) {
      setCurrentMonthIndex(newMonthIndex);
    }
  }, [currentMonthIndex, visibleMonths.length]);

  // State object
  const state: CalendarState = {
    selectedRange,
    hoveredDate,
    selectionMode: internalSelectionMode,
    visibleMonths,
    currentMonthIndex,
    isScrolling
  };

  // Props for HTML elements
  const containerProps = {
    ref: containerRef,
    onScroll: handleScroll
  };

  const scrollAreaProps = {
    style: { height: '320px', overflowY: 'auto' as const }
  };

  return {
    state,
    actions,
    helpers,
    props: {
      containerProps,
      scrollAreaProps
    },
    weekdays: getDefaultDayNames()
  };
}