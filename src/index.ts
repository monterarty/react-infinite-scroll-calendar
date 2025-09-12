// Radix-style Primitive Components
export { Calendar } from './primitives/Calendar';

// Headless Hook
export { useCalendar } from './headless/useCalendar';

// Types and Utilities
export type { 
  ICalendarProps,
  IDateRange,
  TSelectionMode,
  ICalendarState,
  ICalendarActions,
  ICalendarHelpers,
  ICalendarRenderProps,
  ICalendarMonth,
  TVirtualItem,
  IRangeGeometry,
  IRangeSegment
} from './types';

export { 
  validateDateRange,
  validateDateBounds
} from './types';