// Radix-style Primitive Components
export { Calendar } from './primitives/Calendar';

// Headless Hook
export { useCalendar } from './headless/useCalendar';

// Types and Utilities
export type { 
  CalendarProps, 
  DateRange, 
  SelectionMode,
  CalendarState,
  CalendarActions,
  CalendarHelpers,
  CalendarRenderProps,
  CalendarMonth,
  VirtualItem
} from './types';

export { 
  validateDateRange,
  validateDateBounds
} from './types';