import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ICalendarProps,
  ICalendarState,
  ICalendarActions,
  ICalendarHelpers,
  ICalendarMonth,
  IDateRange,
  TSelectionMode,
  validateDateRange,
  validateDateBounds, TCalendarDay, TCalendarWeek
} from '../types';
import { useVirtualCalendar } from './useVirtualCalendar';
import {COUNT_DAYS_IN_WEEK, FIRST_DAY_OF_WEEK, LAST_DAY_OF_WEEK} from "../const";

export function useCalendar(props: ICalendarProps) {
  const {
    selectionMode = 'range',
    defaultValue = { start: null, end: null },
    value,
    onChange,
    minDate: rawMinDate,
    maxDate: rawMaxDate,
    disabledDates = [],
    disabledDays = [],
    locale = 'ru-RU',
    weekStartsOn = 0,
    dayNames,
    monthBuffer = { before: 12, after: 24 },
    minMonth: rawMinMonth,
    maxMonth: rawMaxMonth,
    estimateSize = 320
  } = props;

  // Validate and fix date bounds
  const { minDate, maxDate } = validateDateBounds(rawMinDate, rawMaxDate);
  const { minDate: minMonth, maxDate: maxMonth } = validateDateBounds(rawMinMonth, rawMaxMonth);

  // Validate defaultValue range
  const validatedDefaultValue = validateDateRange(defaultValue);

  // Internal state
  const [internalSelectedRange, setInternalSelectedRange] = useState<IDateRange>(validatedDefaultValue);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [internalSelectionMode, setInternalSelectionMode] = useState<TSelectionMode>(selectionMode);
  const [visibleMonths, setVisibleMonths] = useState<ICalendarMonth[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(monthBuffer.before);
  const [isScrolling] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Use controlled or uncontrolled value
  const selectedRange = value !== undefined ? value : internalSelectedRange;

  const getDefaultDayNames = () => {
    if (dayNames) return dayNames;
    
    const names = [];
    const date = new Date(2024, 0, weekStartsOn === FIRST_DAY_OF_WEEK ? FIRST_DAY_OF_WEEK : LAST_DAY_OF_WEEK); // Start from Monday or Sunday
    
    for (let i = 0; i < COUNT_DAYS_IN_WEEK; i++) {
      const dayDate = new Date(date);
      dayDate.setDate(date.getDate() + i);
      names.push(dayDate.toLocaleDateString(locale, { weekday: 'short' }));
    }
    return names;
  };

  // Generate months array
  const generateMonths = useCallback((): ICalendarMonth[] => {
    const months: ICalendarMonth[] = [];
    const today = new Date();

    // Determine actual date bounds
    const actualMinDate = minMonth || minDate;
    const actualMaxDate = maxMonth || maxDate;

    let startDate: Date;
    let endDate: Date;

    if (actualMinDate && actualMaxDate) {
      // If both bounds are set, use them
      startDate = new Date(actualMinDate.getFullYear(), actualMinDate.getMonth(), 1);
      endDate = new Date(actualMaxDate.getFullYear(), actualMaxDate.getMonth(), 1);
    } else if (actualMinDate) {
      // If only minimum date is set, generate forward with buffer
      startDate = new Date(actualMinDate.getFullYear(), actualMinDate.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + monthBuffer.after, 1);
    } else if (actualMaxDate) {
      // If only maximum date is set, generate backward with buffer
      startDate = new Date(today.getFullYear(), today.getMonth() - monthBuffer.before, 1);
      endDate = new Date(actualMaxDate.getFullYear(), actualMaxDate.getMonth(), 1);
    } else {
      // If no bounds are set, use buffer from current date
      startDate = new Date(today.getFullYear(), today.getMonth() - monthBuffer.before, 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + monthBuffer.after, 1);
    }

    // Generate months from startDate to endDate
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthName = currentDate.toLocaleDateString(locale, {month: 'long'});
      const monthNameShort = currentDate.toLocaleDateString(locale, {month: 'short'});
      const monthYear = currentDate.toLocaleDateString(locale, {year: 'numeric'});
      const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
      const weeks = getWeeksInMonth(days);

      months.push({
        date: new Date(currentDate),
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
        monthName,
        monthNameShort,
        monthYear,
        weeks,
        days
      });

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months;
  }, [locale, monthBuffer.before, monthBuffer.after, weekStartsOn, minDate, maxDate, minMonth, maxMonth]);

  // Generate weeks
const getWeeksInMonth = (days: TCalendarDay[]):TCalendarWeek[] => {
  return Array.from({
    length: Math.ceil(days.length / COUNT_DAYS_IN_WEEK),
  }).map((_, weekIdx) => {
    const weekDays = days.slice(
        weekIdx * COUNT_DAYS_IN_WEEK,
        (weekIdx + 1) * COUNT_DAYS_IN_WEEK,
    );

    while (weekDays.length < COUNT_DAYS_IN_WEEK) {
      weekDays.push(null);
    }

    return weekDays;
  })
}

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
    const months = generateMonths();
    setVisibleMonths(months);
    
    // Determine which month to scroll to
    let targetDate: Date;
    
    // If there's a provided range value and start date
    if (selectedRange.start) {
      targetDate = new Date(selectedRange.start.getFullYear(), selectedRange.start.getMonth(), 1);
    } else {
      // Otherwise scroll to current month
      const today = new Date();
      targetDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    
    const foundIndex = months.findIndex(month => 
      month.date.getFullYear() === targetDate.getFullYear() && 
      month.date.getMonth() === targetDate.getMonth()
    );
    
    // If target month is found, use its index, otherwise use first month
    const indexToUse = foundIndex >= 0 ? foundIndex : 0;
    setCurrentMonthIndex(indexToUse);
  }, [generateMonths, selectedRange.start]);

  // Virtual calendar integration
  const virtual = useVirtualCalendar({
    months: visibleMonths,
    containerRef,
    currentMonthIndex,
    estimateSize,
    overscan: 3
  });

  // Scroll to current month after months are loaded
  const hasScrolledToInitial = useRef(false);
  useEffect(() => {
    if (visibleMonths.length > 0 && currentMonthIndex >= 0 && !hasScrolledToInitial.current) {
      hasScrolledToInitial.current = true;
      
      // Use scrollToIndex for precise positioning
      virtual.virtualizer.scrollToIndex(currentMonthIndex, { align: 'start' });
      
      // Show calendar after delay to complete measurements
      setTimeout(() => {
        setIsInitialized(true);
      }, 100);
    }
  }, [visibleMonths.length, currentMonthIndex, virtual.virtualizer]);

  // Helpers
  const helpers: ICalendarHelpers = {
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

      // In single mode, there's no range concept
      if (internalSelectionMode === 'single') {
        return false;
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
      
      // If we have both start and end, check if this is the end date
      if (selectedRange.end && date.toDateString() === selectedRange.end.toDateString()) {
        return true;
      }
      
      // If we have start but no end, and we're hovering
      if (selectedRange.start && !selectedRange.end && hoveredDate && date.toDateString() === hoveredDate.toDateString()) {
        // Check if hovered date is after start (making it the end)
        if (hoveredDate >= selectedRange.start) {
          return true;
        }
      }
      
      // If we have start but no end, and we're hovering on a date before start
      // Then the current start becomes the end
      if (selectedRange.start && !selectedRange.end && hoveredDate && hoveredDate < selectedRange.start && date.toDateString() === selectedRange.start.toDateString()) {
        return true; // Current start becomes end
      }
      
      return false;
    },

    isDateRangeStart: (date: Date | null): boolean => {
      if (!date || internalSelectionMode === 'single') return false;
      
      // If we have both start and end, check if this is the start date
      if (selectedRange.start && date.toDateString() === selectedRange.start.toDateString()) {
        // But if we're hovering and hover is before start, then start will become end
        if (selectedRange.start && !selectedRange.end && hoveredDate && hoveredDate < selectedRange.start) {
          return false; // This will become the end, not start
        }
        return true;
      }
      
      // If we have start but no end, and we're hovering on a date before start
      if (selectedRange.start && !selectedRange.end && hoveredDate && date.toDateString() === hoveredDate.toDateString()) {
        // Check if hovered date is before start (making it the new start)
        if (hoveredDate < selectedRange.start) {
          return true;
        }
      }
      
      return false;
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
    },

    getRangeGeometry: (): import('../types').IRangeGeometry | null => {
      if (!selectedRange.start || internalSelectionMode === 'single') return null;
      
      const effectiveEnd = selectedRange.end || hoveredDate;
      if (!effectiveEnd) return null;

      const startDate = selectedRange.start < effectiveEnd ? selectedRange.start : effectiveEnd;
      const endDate = selectedRange.start < effectiveEnd ? effectiveEnd : selectedRange.start;
      
      const ranges: import('../types').IRangeSegment[] = [];
      
      // Iterate through all visible months
      visibleMonths.forEach((month, monthIndex) => {
        const monthStart = new Date(month.year, month.month, 1);
        const monthEnd = new Date(month.year, month.month + 1, 0);
        
        // Check if range intersects with this month
        if (endDate < monthStart || startDate > monthEnd) return;
        
        const segmentStart = startDate > monthStart ? startDate : monthStart;
        const segmentEnd = endDate < monthEnd ? endDate : monthEnd;
        
        // Find position of first day of month in grid
        let firstDayOfWeek = monthStart.getDay();
        if (weekStartsOn === 1) {
          firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        }
        
        // Split segment by weeks (rows)
        // Go day by day and group by weeks
        const weekSegments: Array<{
          startRow: number;
          endRow: number;
          startCol: number;
          endCol: number;
          dates: Date[];
        }> = [];
        
        let currentWeekSegment: {
          startRow: number;
          endRow: number;
          startCol: number;
          endCol: number;
          dates: Date[];
        } | null = null;
        
        for (let d = new Date(segmentStart); d <= segmentEnd; d.setDate(d.getDate() + 1)) {
          if (d.getMonth() !== month.month) continue;
          
          const dayInMonth = d.getDate();
          const posInGrid = firstDayOfWeek + dayInMonth - 1;
          const row = Math.floor(posInGrid / 7);
          const col = posInGrid % 7;
          
          if (!currentWeekSegment || currentWeekSegment.endRow !== row) {
            // Start new week segment
            if (currentWeekSegment) {
              weekSegments.push(currentWeekSegment);
            }
            currentWeekSegment = {
              startRow: row,
              endRow: row,
              startCol: col,
              endCol: col,
              dates: [new Date(d)]
            };
          } else {
            // Continue current week segment
            currentWeekSegment.endCol = col;
            currentWeekSegment.dates.push(new Date(d));
          }
        }
        
        if (currentWeekSegment) {
          weekSegments.push(currentWeekSegment);
        }
        
        // Create separate ranges for each week segment
        weekSegments.forEach((weekSegment, weekIndex) => {
          const isFirstWeekSegment = weekIndex === 0 && segmentStart.getTime() === startDate.getTime();
          const isLastWeekSegment = weekIndex === weekSegments.length - 1 && segmentEnd.getTime() === endDate.getTime();
          
          ranges.push({
            monthIndex,
            startRow: weekSegment.startRow,
            endRow: weekSegment.endRow,
            startCol: weekSegment.startCol,
            endCol: weekSegment.endCol,
            isFirstSegment: isFirstWeekSegment,
            isLastSegment: isLastWeekSegment,
            dates: weekSegment.dates
          });
        });
      });
      
      return {
        ranges,
        cellSize: { width: 48, height: 48 } // Can be made configurable
      };
    }
  };

  // Handle selection change
  const handleSelectionChange = (newValue: IDateRange) => {
    const validatedValue = validateDateRange(newValue);

    if (value === undefined) {
      setInternalSelectedRange(validatedValue);
    }
    onChange?.(validatedValue);
  };

  // Actions
  const actions: ICalendarActions = {
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

    setSelectionMode: (mode: TSelectionMode) => {
      setInternalSelectionMode(mode);
      actions.clearSelection();
    },

    scrollToMonth: (index: number) => {
      virtual.scrollToIndex(index, { align: 'center' });
      setCurrentMonthIndex(index);
    },

    scrollToToday: () => {
      virtual.scrollToIndex(monthBuffer.before, { align: 'center' });
      setCurrentMonthIndex(monthBuffer.before);
    }
  };

  // Handle scroll - now managed by virtual calendar
  const handleScroll = useCallback(() => {
    // Virtual calendar handles scroll positioning automatically
  }, []);

  // State object
  const state: ICalendarState = {
    selectedRange,
    hoveredDate,
    selectionMode: internalSelectionMode,
    visibleMonths,
    currentMonthIndex,
    isScrolling,
    isInitialized
  };

  // Props for HTML elements
  const containerProps = {
    ref: containerRef,
    onScroll: handleScroll
  };

  const scrollAreaProps = {
    style: { overflowY: 'auto' as const }
  };

  return {
    state,
    actions,
    helpers,
    props: {
      containerProps,
      scrollAreaProps
    },
    weekdays: getDefaultDayNames(),
    virtual: {
      virtualItems: virtual.virtualItems,
      totalSize: virtual.totalSize,
      scrollToIndex: virtual.scrollToIndex,
      scrollToCurrentMonth: virtual.scrollToCurrentMonth,
      virtualizer: virtual.virtualizer
    }
  };
}