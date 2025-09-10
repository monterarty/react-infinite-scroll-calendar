import React from 'react';

export interface IDateRange {
  start: Date | null;
  end: Date | null;
}

export type TSelectionMode = 'single' | 'range';

// Validation utility functions
export const validateDateRange = (range: IDateRange): IDateRange => {
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

export interface ICalendarMonth {
  date: Date;
  month: number;
  year: number;
  monthName: string;
  monthNameShort: string;
  monthYear: string;
  days: Array<Date | null>;
}

// Re-export VirtualItem from @tanstack/react-virtual to avoid conflicts
export type TVirtualItem = import('@tanstack/virtual-core').VirtualItem;

export interface ICalendarState {
  selectedRange: IDateRange;
  hoveredDate: Date | null;
  selectionMode: TSelectionMode;
  visibleMonths: ICalendarMonth[];
  currentMonthIndex: number;
  isScrolling: boolean;
  isInitialized: boolean;
}

export interface ICalendarActions {
  selectDate: (date: Date) => void;
  clearSelection: () => void;
  setHoveredDate: (date: Date | null) => void;
  setSelectionMode: (mode: TSelectionMode) => void;
  scrollToMonth: (index: number) => void;
  scrollToToday: () => void;
}

export interface ICalendarHelpers {
  isDateDisabled: (date: Date | null) => boolean;
  isDateInRange: (date: Date | null) => boolean;
  isDateRangeEnd: (date: Date | null) => boolean;
  isDateRangeStart: (date: Date | null) => boolean;
  isToday: (date: Date | null) => boolean;
  getDaysInRange: () => number;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
}

export interface ICalendarProps {
  selectionMode?: TSelectionMode;
  defaultValue?: IDateRange;
  value?: IDateRange;
  onChange?: (value: IDateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabledDays?: number[];
  locale?: string;
  weekStartsOn?: number;
  monthNames?: string[];
  dayNames?: string[];
  monthBuffer?: { before: number; after: number };
  minMonth?: Date;
  maxMonth?: Date;
  estimateSize?: number;
  children?: React.ReactNode | ((props: ICalendarRenderProps & { weekdays: string[] }) => React.ReactNode);
}

export interface ICalendarRenderProps {
  state: ICalendarState;
  actions: ICalendarActions;
  helpers: ICalendarHelpers;
  props: {
    containerProps: React.HTMLAttributes<HTMLDivElement>;
  };
  virtual: {
    virtualItems: TVirtualItem[];
    totalSize: number;
    scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto' }) => void;
    scrollToCurrentMonth: () => void;
    virtualizer: import('@tanstack/react-virtual').Virtualizer<HTMLDivElement, Element>;
  };
}