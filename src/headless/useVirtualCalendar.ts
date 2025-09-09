import React, {useMemo} from 'react';
import {useVirtualizer} from '@tanstack/react-virtual';
import {CalendarMonth} from '../types';

export function useVirtualCalendar({
  months,
  containerRef,
  currentMonthIndex,
  estimateSize = 350,
  overscan = 5
}: {
  months: CalendarMonth[];
  containerRef: React.RefObject<HTMLDivElement>;
  currentMonthIndex: number;
  estimateSize?: number;
  overscan?: number;
}) {
  const initialOffset = currentMonthIndex * estimateSize;
  
  const virtualizer = useVirtualizer({
    count: months.length,
    getScrollElement: () => {
      return containerRef.current;
    },
    estimateSize: () => estimateSize,
    overscan,
    initialOffset
  });

  const virtualItems = virtualizer.getVirtualItems();
  const scrollToIndex = useMemo(() => (
    (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto' }) => {
      virtualizer.scrollToIndex(index, options);
    }
  ), [virtualizer]);

  const scrollToCurrentMonth = useMemo(() => (
    () => scrollToIndex(currentMonthIndex, { align: 'center' })
  ), [scrollToIndex, currentMonthIndex]);

  return {
    virtualizer,
    virtualItems,
    scrollToIndex,
    scrollToCurrentMonth,
    totalSize: virtualizer.getTotalSize()
  };
}