import React from 'react';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export type SelectionMode = 'single' | 'range';

// Validation utility functions
export const validateDateRange = (range: DateRange): DateRange => {
  if (range.start && range.end && range.start > range.end) {
    console.warn('[Calendar] Date range start is greater than end. Swapping values automatically.');
    return { start: range.end, end: range.start };
  }
  return range;
};

export const validateDateBounds = (minDate?: Date, maxDate?: Date): { minDate?: Date; maxDate?: Date } => {
  if (minDate && maxDate && minDate > maxDate) {
    console.warn('[Calendar] minDate is greater than maxDate. Swapping values automatically.');
    return { minDate: maxDate, maxDate: minDate };
  }
  return { minDate, maxDate };
};

/**
 * Example usage:
 * 
 * // These props will be automatically corrected:
 * <Calendar.Root
 *   minDate={new Date('2025-01-01')}
 *   maxDate={new Date('2024-12-31')} // ❌ Wrong order - will be swapped automatically
 *   defaultValue={{
 *     start: new Date('2024-12-31'),
 *     end: new Date('2024-12-01')   // ❌ Wrong order - will be swapped automatically
 *   }}
 * />
 */

export interface CalendarMonth {
  date: Date;
  month: number;
  year: number;
  monthName: string;
  monthNameShort: string;
  monthYear: string;
  days: Array<Date | null>;
}

// Re-export VirtualItem from @tanstack/react-virtual to avoid conflicts
export type VirtualItem = import('@tanstack/virtual-core').VirtualItem;

export interface CalendarState {
  selectedRange: DateRange;
  hoveredDate: Date | null;
  selectionMode: SelectionMode;
  visibleMonths: CalendarMonth[];
  currentMonthIndex: number;
  isScrolling: boolean;
  isInitialized: boolean;
}

export interface CalendarActions {
  selectDate: (date: Date) => void;
  clearSelection: () => void;
  setHoveredDate: (date: Date | null) => void;
  setSelectionMode: (mode: SelectionMode) => void;
  scrollToMonth: (index: number) => void;
  scrollToToday: () => void;
}

export interface CalendarHelpers {
  isDateDisabled: (date: Date | null) => boolean;
  isDateInRange: (date: Date | null) => boolean;
  isDateRangeEnd: (date: Date | null) => boolean;
  isToday: (date: Date | null) => boolean;
  getDaysInRange: () => number;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
}

export interface CalendarProps {
  selectionMode?: SelectionMode;
  defaultValue?: DateRange;
  value?: DateRange;
  onChange?: (value: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabledDays?: number[];
  locale?: string;
  weekStartsOn?: 0 | 1;
  monthNames?: string[];
  dayNames?: string[];
  monthBuffer?: { before: number; after: number };
  minMonth?: Date;
  maxMonth?: Date;
  estimateSize?: number;
  children?: React.ReactNode | ((props: CalendarRenderProps & { weekdays: string[] }) => React.ReactNode);
}

export interface CalendarRenderProps {
  state: CalendarState;
  actions: CalendarActions;
  helpers: CalendarHelpers;
  props: {
    containerProps: React.HTMLAttributes<HTMLDivElement>;
  };
  virtual: {
    virtualItems: VirtualItem[];
    totalSize: number;
    scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto' }) => void;
    scrollToCurrentMonth: () => void;
    virtualizer: import('@tanstack/react-virtual').Virtualizer<HTMLDivElement, Element>;
  };
}