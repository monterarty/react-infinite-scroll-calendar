import { IRangeSegment } from 'react-infinite-scroll-calendar';

export interface CornerFlags {
  topLeft: boolean;
  topRight: boolean;
  bottomLeft: boolean;
  bottomRight: boolean;
}

/**
 * Analyzes ranges and determines which corners of each segment need to be rounded
 * to create a unified contour for the entire range
 */
export function analyzeCorners(ranges: IRangeSegment[]): CornerFlags[] {
  return ranges.map((range, index) => ({
    bottomLeft:
        (index === 0 && range.isFirstSegment) || index === ranges.length - 1,
    bottomRight: index === ranges.length - 1 || ranges[index + 1]?.endCol !== 6,
    topLeft: index === 0 || (index === 1 && ranges[index - 1].startCol !== 0),
    topRight:
        index === 0 || (index === ranges.length - 1 && range.isLastSegment),
  }));
}