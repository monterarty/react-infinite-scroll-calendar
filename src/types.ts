import React from 'react';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export type SelectionMode = 'single' | 'range';

export interface CalendarMonth {
  date: Date;
  month: number;
  year: number;
  monthName: string;
  monthNameShort: string;
  monthYear: string;
  days: Array<Date | null>;
}

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
  end: number;
  key: string | number;
  lane: number;
}

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
    virtualizer: any;
  };
}