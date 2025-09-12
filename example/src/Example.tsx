import React, { useState } from 'react';
import { 
  Calendar,
  IDateRange
} from 'react-infinite-scroll-calendar';
import { RangeMask } from './components/RangeMask';

const cn = (...classes: Array<string | undefined | null | false>) => {
  return classes.filter(Boolean).join(' ');
};

const Example: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<IDateRange>({ start: null, end: null });
  const [weekStartsOn, setWeekStartsOn] = useState(1);
  const [showRangeMask, setShowRangeMask] = useState(true); // Переключатель для маски
  const [disableMode, setDisableMode] = useState<'future' | 'past' | 'weekends' | 'holidays' | 'range'>('future');

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const getDisabledConfig = () => {
    switch (disableMode) {
      case 'future':
        return { after: today }; // Disable all dates after today
      case 'past':
        return { before: tomorrow }; // Disable all dates before tomorrow
      case 'weekends':
        return { dayOfWeek: [0, 6] }; // Disable weekends (Sunday=0, Saturday=6)
      case 'holidays':
        return [new Date('2024-12-25'), new Date('2025-01-01'), new Date('2025-01-07')]; // Specific holiday dates
      case 'range':
        return { from: new Date('2024-12-20'), to: new Date('2025-01-10') }; // Holiday period range
      default:
        return undefined;
    }
  };

  const commonProps = {
    value: selectedRange,
    onChange: setSelectedRange,
    minDate: new Date('2024-09-01'), // minimum - 1 september 2024
    maxDate: new Date('2025-12-31'), // maximum - 31 december 2025
    disabled: getDisabledConfig(), // Use new flexible disabled API
    locale: 'ru-RU',
    weekStartsOn,
    estimateSize: 320
  };

  const examples = [
    {
      id: 'primitives',
      title: 'Primitive Components (Radix Style)',
      description: 'Полный контроль с data-атрибутами для стилизации',
      component: (
          <Calendar.Root
              {...commonProps}
              className={cn(
                  "w-full overflow-hidden rounded-xl bg-white pt-2",
              )}
          >
            <div className="flex h-full flex-col">
              <Calendar.Weekdays className="bg-white flex justify-between pt-[1px]">
                {({ weekdays }) => (
                    <>
                      {weekdays.map((day, idx) => (
                          <div
                              key={idx}
                              className="text-gray-500 w-10 py-2 text-center text-xs/[16px] uppercase"
                          >
                            <div className="">{day}</div>
                          </div>
                      ))}
                    </>
                )}
              </Calendar.Weekdays>

              <Calendar.Grid className="no-scrollbar h-80">
                {({ gridWidth, helpers, months, virtual }) => (
                      virtual.virtualItems.map((virtualItem) => {
                        const month = months[virtualItem.index];
                        return (
                            <div
                                key={virtualItem.key}
                                ref={(el) => {
                                  if (el) {
                                    virtual.virtualizer?.measureElement(el);
                                  }
                                }}
                                data-index={virtualItem.index}
                                style={{
                                  left: 0,
                                  minHeight: `${virtualItem.size}px`,
                                  position: "absolute",
                                  top: 0,
                                  transform: `translateY(${virtualItem.start}px)`,
                                  width: "100%",
                                }}
                            >
                              <Calendar.Month month={month}>
                                {({ month: monthData }) => {
                                  const rangeGeometry = helpers.getRangeGeometry();
                                  const monthRanges =
                                      rangeGeometry?.ranges.filter(
                                          (r) => r.monthIndex === virtualItem.index,
                                      ) || [];

                                  return (
                                      <div className="flex h-full flex-col pt-7">
                                        <div className="h2 text-black mb-5 flex-shrink-0 text-center font-bold capitalize">
                                          {monthData.monthName} {monthData.monthYear}
                                        </div>
                                        <div className="relative">
                                          <RangeMask
                                              className="z-40"
                                              geometry={{
                                                cellSize: { height: 44, width: 44 },
                                                gridWidth,
                                                ranges: monthRanges,
                                              }}
                                              pathClassName="fill-blue-100/50"
                                          />

                                          {monthData.weeks.map((weekDays, weekIdx) => {
                                            return (
                                                <div
                                                    key={weekIdx}
                                                    className="flex justify-between"
                                                >
                                                  {weekDays.map((day, dayIdx) => (
                                                      <Calendar.Day
                                                          key={dayIdx}
                                                          className={cn(
                                                              "relative flex h-11 items-center justify-center text-sm",
                                                              "data-[disabled]:text-gray-400 data-[disabled]:cursor-not-allowed data-[disabled]:hover:bg-transparent",
                                                              "[&>div]:data-[range-start]:bg-blue-600 [&>div]:data-[range-start]:text-white [&>div]:data-[range-start]:rounded-xl",
                                                              "[&>div]:data-[range-end]:bg-blue-600 [&>div]:data-[range-end]:text-white [&>div]:data-[range-end]:rounded-xl",
                                                              "[&>div]:data-[today]:after:content-[''] [&>div]:data-[today]:after:absolute [&>div]:data-[today]:after:bottom-[6px] [&>div]:data-[today]:after:left-1/2",
                                                              "[&>div]:data-[today]:after:-translate-x-1/2 [&>div]:data-[today]:after:w-1 [&>div]:data-[today]:after:h-1",
                                                              "[&>div]:data-[today]:after:bg-blue-600 [&>div]:data-[today]:after:rounded-full [&>div]:data-[today]:after:z-30",
                                                          )}
                                                          date={day}
                                                      >
                                                        {({ dayNumber }) =>
                                                            dayNumber ? (
                                                                <div
                                                                    className={cn(
                                                                        "relative flex h-11 w-11 items-center rounded-xl justify-center transition-colors duration-200",
                                                                        "hover:bg-gray-100 focus:outline-none",
                                                                    )}
                                                                >
                                                                    <span className="relative z-20">
                                                                      {dayNumber}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="h-11 w-11" />
                                                            )
                                                        }
                                                      </Calendar.Day>
                                                  ))}
                                                </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                  );
                                }}
                              </Calendar.Month>
                            </div>
                        );
                      })
                )}
              </Calendar.Grid>
            </div>
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

          {/* Disable Mode Controls */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-700 mb-3">Режимы блокировки дат:</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'future', label: 'После сегодня', desc: 'disabled={{ after: today }}' },
                { key: 'past', label: 'До сегодня', desc: 'disabled={{ before: today }}' },
                { key: 'weekends', label: 'Выходные', desc: 'disabled={{ dayOfWeek: [0, 6] }}' },
                { key: 'holidays', label: 'Праздники', desc: 'disabled={[date1, date2, ...]}' },
                { key: 'range', label: 'Период', desc: 'disabled={{ from: date1, to: date2 }}' }
              ].map(mode => (
                <button
                  key={mode.key}
                  onClick={() => setDisableMode(mode.key as any)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    disableMode === mode.key
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  )}
                  title={mode.desc}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Текущая конфигурация: <code className="bg-gray-200 px-2 py-1 rounded">
                disabled={JSON.stringify(getDisabledConfig()).replace(/"/g, "'")}
              </code>
            </div>
          </div>
          
          <div className="flex justify-center">
            {examples[0].component}
          </div>

          {/* Info about selected range */}
          {(selectedRange.start || selectedRange.end) && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-blue-700">
                <strong>Выбранный период:</strong>
                {' '}
                {selectedRange.start?.toLocaleDateString('ru-RU')}
                {selectedRange.end && ` — ${selectedRange.end.toLocaleDateString('ru-RU')}`}
              </p>
            </div>
          )}
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
      </div>
    </div>
  );
};


export default Example;