import React, { useState } from 'react';
import { 
  Calendar,
  useCalendar,
  DateRange
} from 'react-infinite-scroll-calendar';

const cn = (...classes: Array<string | undefined | null | false>) => {
  return classes.filter(Boolean).join(' ');
};

const Example: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<DateRange>({ start: null, end: null });
  const [currentExample, setCurrentExample] = useState<string>('primitives');

  const commonProps = {
    value: selectedRange,
    onChange: setSelectedRange,
    minDate: new Date(),
    disabledDays: [0, 6], // weekends
    locale: 'ru-RU'
  };

  const examples = [
    {
      id: 'primitives',
      title: 'Primitive Components (Radix Style)',
      description: 'Полный контроль с data-атрибутами для стилизации',
      component: (
        <Calendar.Root {...commonProps} className="max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
          {({ state, actions }) => (
            <div>
              <Calendar.Header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                {({ currentMonth }) => (
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4">{currentMonth?.monthName}</h3>
                    
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => actions.setSelectionMode('single')}
                        className={cn(
                          'px-4 py-2 rounded-full text-sm font-medium transition-all',
                          state.selectionMode === 'single' 
                            ? 'bg-white text-purple-600 shadow-lg' 
                            : 'bg-purple-500 hover:bg-purple-400'
                        )}
                      >
                        Одна дата
                      </button>
                      <button 
                        onClick={() => actions.setSelectionMode('range')}
                        className={cn(
                          'px-4 py-2 rounded-full text-sm font-medium transition-all',
                          state.selectionMode === 'range' 
                            ? 'bg-white text-blue-600 shadow-lg' 
                            : 'bg-blue-500 hover:bg-blue-400'
                        )}
                      >
                        Диапазон
                      </button>
                      <button 
                        onClick={actions.clearSelection}
                        className="px-4 py-2 bg-red-500 hover:bg-red-400 rounded-full text-sm font-medium transition-colors"
                      >
                        Очистить
                      </button>
                    </div>
                  </div>
                )}
              </Calendar.Header>

              <Calendar.Weekdays className="grid grid-cols-7 bg-gray-50 border-b">
                {({ weekdays }) => (
                  <>
                    {weekdays.map((day: string, idx: number) => (
                      <div key={idx} className="text-center py-3 text-sm font-semibold text-gray-600">
                        {day}
                      </div>
                    ))}
                  </>
                )}
              </Calendar.Weekdays>

              <Calendar.Grid className="h-80 overflow-y-auto">
                {({ months }) => (
                  <div className="p-2">
                    {months.slice(10, 15).map((month: any) => (
                      <Calendar.Month key={`${month.year}-${month.month}`} month={month}>
                        {({ month: monthData }) => (
                          <div className="mb-6">
                            <div className="text-center font-bold text-gray-800 mb-3 text-lg">
                              {monthData.monthName}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {monthData.days.map((day: Date | null, dayIdx: number) => (
                                <Calendar.Day 
                                  key={dayIdx} 
                                  date={day}
                                  className={cn(
                                    'h-12 w-full rounded-lg border-0 text-sm font-medium transition-all duration-200',
                                    'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400',
                                    'data-[disabled]:opacity-30 data-[disabled]:cursor-not-allowed data-[disabled]:hover:scale-100',
                                    'data-[selected]:bg-gradient-to-br data-[selected]:from-purple-500 data-[selected]:to-blue-500 data-[selected]:text-white',
                                    'data-[in-range]:bg-gradient-to-r data-[in-range]:from-purple-100 data-[in-range]:to-blue-100',
                                    'data-[range-end]:bg-gradient-to-br data-[range-end]:from-purple-600 data-[range-end]:to-blue-600 data-[range-end]:text-white data-[range-end]:font-bold',
                                    'data-[today]:ring-2 data-[today]:ring-yellow-400 data-[today]:bg-yellow-50'
                                  )}
                                >
                                  {({ dayNumber }) => dayNumber}
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

              <Calendar.SelectionInfo className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-t">
                {({ selectedRange, formatDate, daysInRange }) => (
                  <div className="text-center">
                    {selectedRange.start ? (
                      <div className="space-y-1">
                        <div className="font-medium text-gray-800">
                          {formatDate(selectedRange.start)}
                          {selectedRange.end && ` — ${formatDate(selectedRange.end)}`}
                        </div>
                        {selectedRange.end && (
                          <div className="text-sm text-purple-600 font-medium">
                            {daysInRange} {daysInRange === 1 ? 'день' : daysInRange < 5 ? 'дня' : 'дней'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500">Выберите даты</div>
                    )}
                  </div>
                )}
              </Calendar.SelectionInfo>
            </div>
          )}
        </Calendar.Root>
      )
    },
    {
      id: 'hook-only',
      title: 'useCalendar Hook Only',
      description: 'Полностью кастомный UI с использованием только хука',
      component: <HookOnlyExample {...commonProps} />
    }
  ];

  const currentExampleData = examples.find(ex => ex.id === currentExample) || examples[0];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          React Infinite Scroll Calendar
        </h1>
        <p className="text-center text-gray-600 mb-8 text-lg">
          Radix-подобные primitive компоненты для полной кастомизации
        </p>

        {/* Example Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {examples.map((example) => (
            <button
              key={example.id}
              onClick={() => setCurrentExample(example.id)}
              className={cn(
                'px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                'border-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400',
                currentExample === example.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 shadow-sm'
              )}
            >
              {example.title}
            </button>
          ))}
        </div>

        {/* Current Example */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentExampleData.title}
            </h2>
            <p className="text-gray-600">
              {currentExampleData.description}
            </p>
          </div>
          
          <div className="flex justify-center">
            {currentExampleData.component}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧩</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Primitive Components</h3>
              <p className="text-sm text-gray-600">
                Составные компоненты как в Radix UI с полным контролем над структурой и стилизацией
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Data Attributes</h3>
              <p className="text-sm text-gray-600">
                Стилизация через data-атрибуты: data-selected, data-disabled, data-today и другие
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">TypeScript</h3>
              <p className="text-sm text-gray-600">
                Полная типизация всех API, автокомплит и проверка типов из коробки
              </p>
            </div>
          </div>
        </div>

        {/* Selection Status */}
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <h3 className="font-bold text-blue-800 mb-2">Текущий выбор</h3>
          <div className="text-blue-700">
            {selectedRange.start ? (
              <div>
                <strong>От:</strong> {selectedRange.start.toLocaleDateString('ru-RU')}
                {selectedRange.end && (
                  <>
                    {' '}<strong>До:</strong> {selectedRange.end.toLocaleDateString('ru-RU')}
                    <div className="text-sm mt-1">
                      Дней: {Math.ceil((selectedRange.end.getTime() - selectedRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1}
                    </div>
                  </>
                )}
              </div>
            ) : (
              'Даты не выбраны'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook-only example component
const HookOnlyExample: React.FC<any> = (props: any) => {
  const calendar = useCalendar(props);
  
  return (
    <div className="max-w-md bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-1 shadow-xl">
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
          <h3 className="text-center font-bold text-lg">
            Hook Only Calendar
          </h3>
          <div className="text-center text-sm opacity-90">
            {calendar.state.visibleMonths[calendar.state.currentMonthIndex]?.monthName}
          </div>
        </div>

        <div className="grid grid-cols-7 bg-gray-50 text-center text-xs font-medium text-gray-600">
          {calendar.weekdays.map((day: string, idx: number) => (
            <div key={idx} className="py-2">{day}</div>
          ))}
        </div>

        <div 
          {...calendar.props.containerProps} 
          className="h-64 overflow-y-auto p-3"
        >
          {calendar.state.visibleMonths.slice(10, 15).map((month: any) => (
            <div key={`${month.year}-${month.month}`} className="mb-4">
              <div className="text-center font-medium text-indigo-700 mb-2 text-sm">
                {month.monthName}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {month.days.map((date: Date | null, idx: number) => {
                  const isDisabled = calendar.helpers.isDateDisabled(date);
                  const isSelected = calendar.helpers.isDateInRange(date);
                  const isToday = calendar.helpers.isToday(date);
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => date && !isDisabled && calendar.actions.selectDate(date)}
                      disabled={!date || isDisabled}
                      className={cn(
                        'h-8 w-8 text-xs rounded-full transition-all duration-200',
                        !date && 'invisible',
                        date && !isDisabled && 'hover:bg-indigo-100 cursor-pointer',
                        isDisabled && 'text-gray-300 cursor-not-allowed',
                        isSelected && 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold',
                        isToday && !isSelected && 'ring-2 ring-yellow-400 bg-yellow-50'
                      )}
                    >
                      {date ? date.getDate() : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-indigo-50 text-center text-sm text-indigo-700 min-h-[2.5rem] flex items-center justify-center">
          {calendar.state.selectedRange.start ? (
            <div className="w-full">
              <div className="font-medium">Выбрано:</div>
              <div className="text-xs mt-1">
                {calendar.helpers.formatDate(calendar.state.selectedRange.start)}
                {calendar.state.selectedRange.end && (
                  <> — {calendar.helpers.formatDate(calendar.state.selectedRange.end)}</>
                )}
              </div>
            </div>
          ) : (
            <div>Выберите даты</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Example;