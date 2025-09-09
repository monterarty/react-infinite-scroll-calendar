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
import { useVirtualCalendar } from './useVirtualCalendar';

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
    dayNames,
    monthBuffer = { before: 12, after: 24 },
    minMonth,
    maxMonth
  } = props;

  // Internal state
  const [internalSelectedRange, setInternalSelectedRange] = useState<DateRange>(defaultValue);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [internalSelectionMode, setInternalSelectionMode] = useState<SelectionMode>(selectionMode);
  const [visibleMonths, setVisibleMonths] = useState<CalendarMonth[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(monthBuffer.before);
  const [isScrolling] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

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

    // Определяем реальные границы
    const actualMinDate = minMonth || minDate;
    const actualMaxDate = maxMonth || maxDate;

    let startDate: Date;
    let endDate: Date;

    if (actualMinDate && actualMaxDate) {
      // Если заданы обе границы, используем их
      startDate = new Date(actualMinDate.getFullYear(), actualMinDate.getMonth(), 1);
      endDate = new Date(actualMaxDate.getFullYear(), actualMaxDate.getMonth(), 1);
    } else if (actualMinDate) {
      // Если задана только минимальная дата, генерируем вперед с буфером
      startDate = new Date(actualMinDate.getFullYear(), actualMinDate.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + monthBuffer.after, 1);
    } else if (actualMaxDate) {
      // Если задана только максимальная дата, генерируем назад с буфером
      startDate = new Date(today.getFullYear(), today.getMonth() - monthBuffer.before, 1);
      endDate = new Date(actualMaxDate.getFullYear(), actualMaxDate.getMonth(), 1);
    } else {
      // Если границы не заданы, используем буфер от текущей даты
      startDate = new Date(today.getFullYear(), today.getMonth() - monthBuffer.before, 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + monthBuffer.after, 1);
    }

    // Генерируем месяцы от startDate до endDate
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthName = currentDate.toLocaleDateString(locale, { month: 'long' });
      const monthNameShort = currentDate.toLocaleDateString(locale, { month: 'short' });
      const monthYear = currentDate.toLocaleDateString(locale, { year: 'numeric' });
      
      months.push({
        date: new Date(currentDate),
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
        monthName,
        monthNameShort,
        monthYear,
        days: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())
      });

      // Переходим к следующему месяцу
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months;
  }, [locale, monthBuffer.before, monthBuffer.after, weekStartsOn, minDate, maxDate, minMonth, maxMonth]);

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
    // Найти индекс текущего месяца в сгенерированном списке
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const foundIndex = months.findIndex(month => 
      month.date.getFullYear() === currentMonth.getFullYear() && 
      month.date.getMonth() === currentMonth.getMonth()
    );
    
    // Если текущий месяц найден, используем его индекс, иначе используем первый месяц
    const indexToUse = foundIndex >= 0 ? foundIndex : 0;
    setCurrentMonthIndex(indexToUse);
  }, [generateMonths]);

  // Virtual calendar integration
  const virtual = useVirtualCalendar({
    months: visibleMonths,
    containerRef,
    currentMonthIndex,
    estimateSize: 320,
    overscan: 3
  });

  // Scroll to current month after months are loaded
  const hasScrolledToInitial = useRef(false);
  useEffect(() => {
    if (visibleMonths.length > 0 && currentMonthIndex >= 0 && !hasScrolledToInitial.current) {
      hasScrolledToInitial.current = true;
      const targetOffset = currentMonthIndex * 320;
      virtual.virtualizer.scrollToOffset(targetOffset);
      
      // Показать календарь после небольшой задержки для завершения позиционирования
      setTimeout(() => {
        setIsInitialized(true);
      }, 50);
    }
  }, [visibleMonths.length, currentMonthIndex, virtual.virtualizer]);

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
  const state: CalendarState = {
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