import React, { useState } from 'react';
import { 
  Calendar,
  DateRange
} from 'react-infinite-scroll-calendar';

const cn = (...classes: Array<string | undefined | null | false>) => {
  return classes.filter(Boolean).join(' ');
};

const Example: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<DateRange>({ start: null, end: null });
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(1);

  const commonProps = {
    value: selectedRange,
    onChange: setSelectedRange,
    minDate: new Date('2024-09-01'), // минимум - 1 сентября 2024
    maxDate: new Date('2025-12-31'), // максимум - 31 декабря 2025
    disabledDays: [0, 6], // weekends disabled
    disabledDates: [new Date('2024-12-25'), new Date('2024-12-31')], // отключить праздники
    locale: 'ru-RU',
    weekStartsOn
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
                    
                    <div className="flex justify-center gap-3 mb-3">
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
                    
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => setWeekStartsOn(1)}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium transition-all',
                          weekStartsOn === 1 
                            ? 'bg-white text-green-600 shadow-lg' 
                            : 'bg-green-500 hover:bg-green-400'
                        )}
                      >
                        Пн-Вс
                      </button>
                      <button 
                        onClick={() => setWeekStartsOn(0)}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium transition-all',
                          weekStartsOn === 0 
                            ? 'bg-white text-orange-600 shadow-lg' 
                            : 'bg-orange-500 hover:bg-orange-400'
                        )}
                      >
                        Вс-Сб
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

              <Calendar.Grid className="h-80">
                {({ months, virtual }) => (
                    <div style={{ height: virtual.totalSize, position: 'relative', width: '100%' }}>
                      {virtual.virtualItems.map((virtualItem: any) => {
                        const month = months[virtualItem.index];
                        return (
                        <div
                          key={virtualItem.key}
                          data-index={virtualItem.index}
                          ref={(el) => el && virtual.virtualizer?.measureElement(el)}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          <Calendar.Month month={month}>
                            {({ month: monthData }) => (
                              <div className="p-2 h-full flex flex-col">
                                <div className="text-center font-bold text-gray-800 mb-3 text-lg flex-shrink-0">
                                  {monthData.monthName}
                                </div>
                                <div className="grid grid-cols-7 gap-1 flex-1">
                                  {monthData.days.map((day: Date | null, dayIdx: number) => (
                                    <Calendar.Day 
                                      key={dayIdx} 
                                      date={day}
                                      className={cn(
                                        'h-12 min-h-[48px] max-h-[48px] w-full rounded-lg border-0 text-sm font-medium transition-colors duration-200 flex items-center justify-center',
                                        'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400',
                                        'data-[disabled]:opacity-30 data-[disabled]:cursor-not-allowed data-[disabled]:hover:bg-transparent',
                                        'data-[selected]:bg-gradient-to-br data-[selected]:from-purple-500 data-[selected]:to-blue-500 data-[selected]:text-white data-[selected]:hover:bg-gradient-to-br data-[selected]:hover:from-purple-600 data-[selected]:hover:to-blue-600',
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
                        </div>
                      );
                    })}
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
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          React Infinite Scroll Calendar
        </h1>
        <p className="text-center text-gray-600 mb-8 text-lg">
          Radix-подобные primitive компоненты для полной кастомизации
        </p>

        {/* Current Example */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {examples[0].title}
            </h2>
            <p className="text-gray-600">
              {examples[0].description}
            </p>
          </div>
          
          <div className="flex justify-center">
            {examples[0].component}
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


export default Example;