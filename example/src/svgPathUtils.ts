interface Point {
  x: number;
  y: number;
  corner?: string | null;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  row: number;
  startCol: number;
  endCol: number;
}

interface CornerFlags {
  topLeft: boolean;
  topRight: boolean;
  bottomLeft: boolean;
  bottomRight: boolean;
}

/**
 * Creates an array of rectangles for rows in the range
 */
export function createRectsForRange(
  range: { startRow: number; endRow: number; startCol: number; endCol: number },
  gridWidth: number,
  cellSize: { width: number; height: number }
): Rect[] {
  const rects: Rect[] = [];
  
  for (let rowOffset = 0; rowOffset <= range.endRow - range.startRow; rowOffset++) {
    const currentRow = range.startRow + rowOffset;
    const isFirstRow = currentRow === range.startRow;
    const isLastRow = currentRow === range.endRow;
    
    let startCol = 0;
    let endCol = gridWidth - 1;
    
    if (isFirstRow) startCol = range.startCol;
    if (isLastRow) endCol = range.endCol;
    
    rects.push({
      x: startCol * cellSize.width,
      y: currentRow * cellSize.height,
      width: (endCol - startCol + 1) * cellSize.width,
      height: cellSize.height,
      row: currentRow,
      startCol,
      endCol
    });
  }
  
  return rects;
}

/**
 * Creates contour points from rectangles
 */
export function createContourPoints(rects: Rect[], corners: CornerFlags): Point[] {
  if (rects.length === 0) return [];
  
  const points: Point[] = [];
  const firstRect = rects[0];
  const lastRect = rects[rects.length - 1];
  
  // Top border
  points.push({ x: firstRect.x, y: firstRect.y, corner: corners.topLeft ? 'top-left' : null });
  points.push({ x: firstRect.x + firstRect.width, y: firstRect.y, corner: corners.topRight ? 'top-right' : null });
  
  // Right border
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    const nextRect = rects[i + 1];
    
    if (nextRect) {
      if (nextRect.x + nextRect.width !== rect.x + rect.width) {
        points.push({ x: rect.x + rect.width, y: rect.y + rect.height });
        points.push({ x: nextRect.x + nextRect.width, y: rect.y + rect.height });
        if (nextRect.y !== rect.y + rect.height) {
          points.push({ x: nextRect.x + nextRect.width, y: nextRect.y });
        }
      }
    } else {
      points.push({ x: rect.x + rect.width, y: rect.y + rect.height, corner: corners.bottomRight ? 'bottom-right' : null });
    }
  }
  
  // Bottom border
  points.push({ x: lastRect.x, y: lastRect.y + lastRect.height, corner: corners.bottomLeft ? 'bottom-left' : null });
  
  // Left border
  for (let i = rects.length - 2; i >= 0; i--) {
    const rect = rects[i];
    const prevRect = rects[i + 1];
    
    if (rect.x !== prevRect.x) {
      points.push({ x: prevRect.x, y: prevRect.y + prevRect.height });
      points.push({ x: rect.x, y: prevRect.y + prevRect.height });
      if (rect.y + rect.height !== prevRect.y + prevRect.height) {
        points.push({ x: rect.x, y: rect.y + rect.height });
      }
    }
  }
  
  return points;
}

/**
 * Creates SVG path from points with rounding consideration
 */
export function createSVGPath(points: Point[], radius: number): string {
  if (points.length === 0) return '';
  
  let path = '';
  
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const nextPoint = points[(i + 1) % points.length];
    const prevPoint = points[i === 0 ? points.length - 1 : i - 1];
    
    if (i === 0) {
      // First point
      if (point.corner && radius > 0) {
        const dx2 = nextPoint.x - point.x;
        const dy2 = nextPoint.y - point.y;
        const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        
        if (len2 > 0) {
          const r = Math.min(radius, len2 / 2);
          path = `M ${point.x + (dx2 / len2) * r} ${point.y + (dy2 / len2) * r}`;
        } else {
          path = `M ${point.x} ${point.y}`;
        }
      } else {
        path = `M ${point.x} ${point.y}`;
      }
    } else {
      // Intermediate points
      if (point.corner && radius > 0) {
        const dx1 = point.x - prevPoint.x;
        const dy1 = point.y - prevPoint.y;
        const dx2 = nextPoint.x - point.x;
        const dy2 = nextPoint.y - point.y;
        
        const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        
        if (len1 > 0 && len2 > 0) {
          const r = Math.min(radius, len1 / 2, len2 / 2);
          
          path += ` L ${point.x - (dx1 / len1) * r} ${point.y - (dy1 / len1) * r}`;
          path += ` Q ${point.x} ${point.y} ${point.x + (dx2 / len2) * r} ${point.y + (dy2 / len2) * r}`;
        } else {
          path += ` L ${point.x} ${point.y}`;
        }
      } else {
        path += ` L ${point.x} ${point.y}`;
      }
    }
  }
  
  // Closing the contour
  const firstPoint = points[0];
  if (firstPoint.corner && radius > 0) {
    const lastPoint = points[points.length - 1];
    const dx1 = firstPoint.x - lastPoint.x;
    const dy1 = firstPoint.y - lastPoint.y;
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    
    if (len1 > 0) {
      const r = Math.min(radius, len1 / 2);
      path += ` L ${firstPoint.x - (dx1 / len1) * r} ${firstPoint.y - (dy1 / len1) * r}`;
      path += ` Q ${firstPoint.x} ${firstPoint.y} ${firstPoint.x + (points[1].x - firstPoint.x) / Math.sqrt((points[1].x - firstPoint.x) ** 2 + (points[1].y - firstPoint.y) ** 2) * r} ${firstPoint.y + (points[1].y - firstPoint.y) / Math.sqrt((points[1].x - firstPoint.x) ** 2 + (points[1].y - firstPoint.y) ** 2) * r}`;
    }
  }
  
  path += ' Z';
  return path;
}