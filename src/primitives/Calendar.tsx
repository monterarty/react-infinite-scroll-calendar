import React, { createContext, useContext, forwardRef } from 'react';
import { Virtualizer } from '@tanstack/react-virtual';
import { useCalendar } from '../headless';
import { ICalendarProps, ICalendarRenderProps, ICalendarMonth, TVirtualItem, ICalendarState, ICalendarActions, ICalendarHelpers, IDateRange } from '../types';

const cn = (...classes: Array<string | undefined | null | false>) => {
  return classes.filter(Boolean).join(' ');
};

type RenderFunction<T = Record<string, unknown>> = (props: T) => React.ReactNode;

interface CalendarContextValue extends ICalendarRenderProps {
  weekdays: string[];
  virtual: {
    virtualItems: TVirtualItem[];
    totalSize: number;
    scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto' }) => void;
    scrollToCurrentMonth: () => void;
    virtualizer: Virtualizer<HTMLDivElement, Element>;
  };
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

const useCalendarContext = (): CalendarContextValue => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('Calendar components must be used within Calendar.Root');
  }
  return context;
};

interface CalendarRootProps extends ICalendarProps {
  children?: React.ReactNode | RenderFunction<CalendarContextValue>;
  className?: string;
}

const CalendarRoot = forwardRef<HTMLDivElement, CalendarRootProps>(
  ({ children, className, ...calendarProps }, ref) => {
    const calendar = useCalendar(calendarProps);
    
    const contextValue: CalendarContextValue = {
      state: calendar.state,
      actions: calendar.actions,
      helpers: calendar.helpers,
      props: calendar.props,
      weekdays: calendar.weekdays,
      virtual: calendar.virtual
    };

    const content = typeof children === 'function' ? children(contextValue) : children;

    return (
      <CalendarContext.Provider value={contextValue}>
        <div 
          ref={ref} 
          className={cn('calendar-root', className)}
          data-calendar-root=""
        >
          {content}
        </div>
      </CalendarContext.Provider>
    );
  }
);
CalendarRoot.displayName = 'CalendarRoot';

interface CalendarHeaderProps {
  children?: React.ReactNode | RenderFunction<{
    currentMonth: ICalendarMonth | null;
    actions: ICalendarActions;
    canNavigatePrev: boolean;
    canNavigateNext: boolean;
  }>;
  className?: string;
}

const CalendarHeader = forwardRef<HTMLDivElement, CalendarHeaderProps>(
  ({ className, children }, ref) => {
    const { state, actions } = useCalendarContext();
    const currentMonth = state.visibleMonths[state.currentMonthIndex];
    
    const canNavigatePrev = state.currentMonthIndex > 0;
    const canNavigateNext = state.currentMonthIndex < state.visibleMonths.length - 1;
    
    const headerProps = {
      currentMonth,
      actions,
      canNavigatePrev,
      canNavigateNext
    };

    const content = typeof children === 'function' ? children(headerProps) : children;

    return (
      <div
        ref={ref}
        className={cn('calendar-header', className)}
        data-calendar-header=""
      >
        {content}
      </div>
    );
  }
);
CalendarHeader.displayName = 'CalendarHeader';

interface CalendarNavigationProps {
  children?: React.ReactNode | RenderFunction<{
    actions: ICalendarActions;
    canNavigatePrev: boolean;
    canNavigateNext: boolean;
  }>;
  className?: string;
}

const CalendarNavigation = forwardRef<HTMLDivElement, CalendarNavigationProps>(
  ({ className, children }, ref) => {
    const { state, actions } = useCalendarContext();
    
    const canNavigatePrev = state.currentMonthIndex > 0;
    const canNavigateNext = state.currentMonthIndex < state.visibleMonths.length - 1;
    
    const navigationProps = {
      actions,
      canNavigatePrev,
      canNavigateNext
    };

    const content = typeof children === 'function' ? children(navigationProps) : children;

    return (
      <div
        ref={ref}
        className={cn('calendar-navigation', className)}
        data-calendar-navigation=""
      >
        {content}
      </div>
    );
  }
);
CalendarNavigation.displayName = 'CalendarNavigation';

interface CalendarWeekdaysProps {
  children?: React.ReactNode | RenderFunction<{ weekdays: string[] }>;
  className?: string;
}

const CalendarWeekdays = forwardRef<HTMLDivElement, CalendarWeekdaysProps>(
  ({ className, children }, ref) => {
    const { weekdays } = useCalendarContext();
    
    const weekdaysProps = { weekdays };
    const content = typeof children === 'function' ? children(weekdaysProps) : children;

    return (
      <div
        ref={ref}
        className={cn('calendar-weekdays', className)}
        data-calendar-weekdays=""
      >
        {content}
      </div>
    );
  }
);
CalendarWeekdays.displayName = 'CalendarWeekdays';

interface CalendarGridProps {
  children?: React.ReactNode | RenderFunction<{
    months: ICalendarMonth[];
    helpers: ICalendarHelpers;
    actions: ICalendarActions;
    state: ICalendarState;
    virtual: {
      virtualItems: TVirtualItem[];
      totalSize: number;
      virtualizer?: Virtualizer<HTMLDivElement, Element>;
    };
  }>;
  className?: string;
}

const CalendarGrid = forwardRef<HTMLDivElement, CalendarGridProps>(
  ({ className, children }, ref) => {
    const context = useCalendarContext();
    
    const gridProps = {
      months: context.state.visibleMonths,
      helpers: context.helpers,
      actions: context.actions,
      state: context.state,
      virtual: {
        virtualItems: context.virtual.virtualItems,
        totalSize: context.virtual.totalSize,
        virtualizer: context.virtual.virtualizer
      }
    };

    const content = typeof children === 'function' ? children(gridProps) : children;
    return (
      <div
        ref={ref}
        className={cn('calendar-grid', className)}
        data-calendar-grid=""
        {...context.props.containerProps}
        style={{ overflow: 'auto', position: 'relative' }}
      >
        <div 
          style={{ 
            opacity: context.state.isInitialized ? 1 : 0,
            transition: 'opacity 200ms ease-in-out'
          }}
        >
          {content}
        </div>
        {!context.state.isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    );
  }
);
CalendarGrid.displayName = 'CalendarGrid';

interface CalendarMonthProps {
  month: ICalendarMonth;
  children?: React.ReactNode | RenderFunction<{
    month: ICalendarMonth;
    helpers: ICalendarHelpers;
    actions: ICalendarActions;
    state: ICalendarState;
  }>;
  className?: string;
}

const CalendarMonth = forwardRef<HTMLDivElement, CalendarMonthProps>(
  ({ month, className, children }, ref) => {
    const { state, actions, helpers } = useCalendarContext();
    
    const monthProps = {
      month,
      helpers,
      actions,
      state
    };

    const content = typeof children === 'function' ? children(monthProps) : children;

    return (
      <div
        ref={ref}
        className={cn('calendar-month', className)}
        data-calendar-month=""
      >
        {content}
      </div>
    );
  }
);
CalendarMonth.displayName = 'CalendarMonth';

interface CalendarDayProps {
  date: Date | null;
  children?: React.ReactNode | RenderFunction<{
    date: Date | null;
    isDisabled: boolean;
    isSelected: boolean;
    isInRange: boolean;
    isRangeEnd: boolean;
    isRangeStart: boolean;
    isToday: boolean;
    isHovered: boolean;
    dayNumber: number | null;
    actions: ICalendarActions;
  }>;
  className?: string;
  disabled?: boolean;
}

const CalendarDay = forwardRef<HTMLButtonElement, CalendarDayProps>(
  ({ date, className, children, disabled: disabledProp = false }, ref) => {
    const { state, actions, helpers } = useCalendarContext();
    
    const isDisabled = disabledProp || helpers.isDateDisabled(date);
    const isSelected = helpers.isDateInRange(date);
    const isInRange = helpers.isDateInRange(date);
    const isRangeEnd = helpers.isDateRangeEnd(date);
    const isRangeStart = helpers.isDateRangeStart(date);
    const isToday = helpers.isToday(date);
    const isHovered = Boolean(date && state.hoveredDate?.toDateString() === date.toDateString());
    
    const dayProps = {
      date,
      isDisabled,
      isSelected,
      isInRange,
      isRangeEnd,
      isRangeStart,
      isToday,
      isHovered,
      dayNumber: date ? date.getDate() : null,
      actions
    };

    const handleClick = () => {
      if (date && !isDisabled) {
        actions.selectDate(date);
      }
    };

    const handleMouseEnter = () => {
      if (date && !isDisabled && state.selectionMode === 'range' && state.selectedRange.start && !state.selectedRange.end) {
        actions.setHoveredDate(date);
      }
    };

    const handleMouseLeave = () => {
      if (state.selectionMode === 'range') {
        actions.setHoveredDate(null);
      }
    };

    const content = typeof children === 'function' ? children(dayProps) : children;

    return (
      <button
        ref={ref}
        className={cn('calendar-day', className)}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={isDisabled}
        data-calendar-day=""
        data-selected={isSelected || undefined}
        data-disabled={isDisabled || undefined}
        data-today={isToday || undefined}
        data-in-range={isInRange || undefined}
        data-range-start={isRangeStart || undefined}
        data-range-end={isRangeEnd || undefined}
      >
        {content}
      </button>
    );
  }
);
CalendarDay.displayName = 'CalendarDay';

interface CalendarSelectionInfoProps {
  children?: React.ReactNode | RenderFunction<{
    selectedRange: IDateRange;
    selectionMode: string;
    daysInRange: number;
    formatDate: (date: Date) => string;
  }>;
  className?: string;
}

const CalendarSelectionInfo = forwardRef<HTMLDivElement, CalendarSelectionInfoProps>(
  ({ className, children }, ref) => {
    const { state, helpers } = useCalendarContext();
    
    const selectionInfoProps = {
      selectedRange: state.selectedRange,
      selectionMode: state.selectionMode,
      daysInRange: helpers.getDaysInRange(),
      formatDate: helpers.formatDate
    };

    const content = typeof children === 'function' ? children(selectionInfoProps) : children;

    return (
      <div
        ref={ref}
        className={cn('calendar-selection-info', className)}
        data-calendar-selection-info=""
      >
        {content}
      </div>
    );
  }
);
CalendarSelectionInfo.displayName = 'CalendarSelectionInfo';

export const Calendar = {
  Root: CalendarRoot,
  Header: CalendarHeader,
  Navigation: CalendarNavigation,
  Weekdays: CalendarWeekdays,
  Grid: CalendarGrid,
  Month: CalendarMonth,
  Day: CalendarDay,
  SelectionInfo: CalendarSelectionInfo,
};

export {
  CalendarRoot,
  CalendarHeader,
  CalendarNavigation,
  CalendarWeekdays,
  CalendarGrid,
  CalendarMonth,
  CalendarDay,
  CalendarSelectionInfo,
};