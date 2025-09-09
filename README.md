# React Infinite Scroll Calendar

Modern React calendar component with Radix UI-style primitives. Full control over styling and behavior with compound components pattern.

## Features

✨ **Radix UI-style Primitives** - Compound components for maximum flexibility  
🎨 **Data Attributes** - Easy styling with `data-selected`, `data-disabled`, `data-today`  
⚡ **TypeScript First** - Complete type safety and IntelliSense support  
🖥️ **Virtual Scrolling** - Smooth infinite scroll with `@tanstack/react-virtual`  
📱 **Responsive** - Works on desktop and mobile  
🌍 **i18n Ready** - Configurable locales and date formats  
🎯 **Production Ready** - Optimized build without console logs  

## Installation

```bash
npm install react-infinite-scroll-calendar
# or
yarn add react-infinite-scroll-calendar
# or
pnpm add react-infinite-scroll-calendar
```

### Peer Dependencies

```bash
npm install react react-dom @tanstack/react-virtual
```

## Quick Start

```tsx
import React, { useState } from 'react';
import { Calendar, DateRange } from 'react-infinite-scroll-calendar';

function MyCalendar() {
  const [dateRange, setDateRange] = useState<DateRange>({ 
    start: null, 
    end: null 
  });

  return (
    <Calendar.Root 
      value={dateRange} 
      onChange={setDateRange}
      selectionMode="range"
      locale="ru-RU"
    >
      {({ state, actions }) => (
        <div className="calendar-container">
          {/* Header with navigation */}
          <Calendar.Header className="calendar-header">
            {({ currentMonth }) => (
              <div>
                <h3>{currentMonth?.monthName}</h3>
                <div>
                  <button onClick={() => actions.setSelectionMode('single')}>
                    Single
                  </button>
                  <button onClick={() => actions.setSelectionMode('range')}>
                    Range
                  </button>
                  <button onClick={actions.clearSelection}>
                    Clear
                  </button>
                </div>
              </div>
            )}
          </Calendar.Header>
          
          {/* Weekday labels */}
          <Calendar.Weekdays className="calendar-weekdays">
            {({ weekdays }) => (
              <div className="weekdays-grid">
                {weekdays.map((day, idx) => (
                  <div key={idx}>{day}</div>
                ))}
              </div>
            )}
          </Calendar.Weekdays>
          
          {/* Scrollable calendar grid */}
          <Calendar.Grid className="calendar-grid">
            {({ months }) => (
              <div>
                {months.map(month => (
                  <Calendar.Month key={`${month.year}-${month.month}`} month={month}>
                    {({ month }) => (
                      <div>
                        <h4>{month.monthName}</h4>
                        <div className="days-grid">
                          {month.days.map((day, idx) => (
                            <Calendar.Day key={idx} date={day}>
                              {({ dayNumber, isDisabled, isSelected, isToday }) => (
                                <button
                                  disabled={isDisabled}
                                  data-selected={isSelected}
                                  data-today={isToday}
                                  data-disabled={isDisabled}
                                >
                                  {dayNumber}
                                </button>
                              )}
                            </Calendar.Day>
                          ))}
                        </div>
                      </div>
                    )}
                  </Calendar.Month>
                ))}
              </div>
            )}
          </Calendar.Grid>

          {/* Selection info */}
          <Calendar.SelectionInfo className="selection-info">
            {({ selectedRange, formatDate }) => (
              <div>
                {selectedRange.start ? (
                  <span>
                    {formatDate(selectedRange.start)}
                    {selectedRange.end && ` — ${formatDate(selectedRange.end)}`}
                  </span>
                ) : (
                  'Select dates'
                )}
              </div>
            )}
          </Calendar.SelectionInfo>
        </div>
      )}
    </Calendar.Root>
  );
}
```

## Styling with Data Attributes

The component provides data attributes for easy CSS styling:

```css
/* Selected dates */
[data-selected] { 
  background: #3b82f6; 
  color: white; 
}

/* Disabled dates */
[data-disabled] { 
  opacity: 0.5; 
  cursor: not-allowed; 
}

/* Today */
[data-today] { 
  outline: 2px solid #fbbf24; 
}

/* In range (for range selection) */
[data-in-range] { 
  background: #dbeafe; 
}

/* Range end dates */
[data-range-end] { 
  background: #1d4ed8; 
  font-weight: bold; 
}
```


## API Reference

### Components

- `Calendar.Root` - Main wrapper component
- `Calendar.Header` - Header with month info and actions
- `Calendar.Weekdays` - Weekday labels
- `Calendar.Grid` - Scrollable calendar container
- `Calendar.Month` - Individual month
- `Calendar.Day` - Individual day button
- `Calendar.SelectionInfo` - Selection display

### Props

#### CalendarProps

```tsx
interface CalendarProps {
  selectionMode?: 'single' | 'range';
  defaultValue?: DateRange;
  value?: DateRange;
  onChange?: (value: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabledDays?: number[]; // 0 = Sunday, 6 = Saturday
  locale?: string;
  weekStartsOn?: 0 | 1;
  monthNames?: string[];
  dayNames?: string[];
  monthBuffer?: { before: number; after: number };
}
```

#### DateRange

```tsx
interface DateRange {
  start: Date | null;
  end: Date | null;
}
```

## Examples

Check out the `/example` directory for complete implementation examples including:

- Primitive Components (Radix Style)
- Virtual Scrolling Implementation  
- Custom Styling Examples
- Week Start Configuration

## Development

```bash
# Clone the repository
git clone https://github.com/monterarty/react-infinite-scroll-calendar.git

# Install dependencies
npm install

# Build the library
npm run build

# Run example
cd example
npm install
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [monterarty](https://github.com/monterarty)

## Changelog

### 1.1.0
- **BREAKING**: Removed headless `useCalendar` hook - focus on Radix-style primitives only
- ✅ Fixed virtual scrolling initialization flickering
- ✅ Added smooth loading animation during initialization  
- ✅ Removed all console.log statements for production
- ✅ Improved TypeScript definitions
- ✅ Cleaned repository structure
- ✅ Production-ready build optimizations

### 1.0.0
- Initial release
- Radix UI-style compound components
- Data attributes for styling
- TypeScript support
- Virtual infinite scroll functionality
- i18n support