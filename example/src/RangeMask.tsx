import React from 'react';
import { analyzeCorners, type CornerFlags } from './cornerAnalysis';
import { createRectsForRange, createContourPoints, createSVGPath } from './svgPathUtils';

interface IRangeGeometry {
  ranges: IRangeSegment[];
  gridWidth: number;
  cellSize: { width: number; height: number };
}

interface IRangeSegment {
  monthIndex: number;
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  isFirstSegment: boolean;
  isLastSegment: boolean;
  dates: Date[];
}

interface RangeMaskProps {
  geometry: IRangeGeometry;
  className?: string;
}

export const RangeMask: React.FC<RangeMaskProps> = ({ geometry, className }) => {
  const { ranges, gridWidth, cellSize } = geometry;
  const radius = 12;

  const cornersToRound = analyzeCorners(ranges);

  const createRangePath = (range: IRangeSegment, corners: CornerFlags): string => {
    const rects = createRectsForRange(range, gridWidth, cellSize);
    if (rects.length === 0) return '';
    
    const points = createContourPoints(rects, corners);
    return createSVGPath(points, radius);
  };
  
  return (
    <svg 
      className={className}
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: 99999999,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <linearGradient id="range-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(147, 51, 234, 0.2)" />
          <stop offset="50%" stopColor="rgba(59, 130, 246, 0.2)" />
          <stop offset="100%" stopColor="rgba(147, 51, 234, 0.2)" />
        </linearGradient>
        
        <linearGradient id="range-border-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(147, 51, 234, 0.6)" />
          <stop offset="50%" stopColor="rgba(59, 130, 246, 0.6)" />
          <stop offset="100%" stopColor="rgba(147, 51, 234, 0.6)" />
        </linearGradient>
        
      </defs>

      {ranges.map((range, idx) => {
        const segmentCorners = cornersToRound[idx];
        const rangePath = createRangePath(range, segmentCorners);
        
        return (
          <g key={idx}>
            <path
              d={rangePath}
              fill="url(#range-gradient)"
            />
            <path
              d={rangePath}
              fill="none"
              stroke="url(#range-border-gradient)"
              strokeWidth="2"
              opacity="0.8"
            />
          </g>
        );
      })}
    </svg>
  );
};