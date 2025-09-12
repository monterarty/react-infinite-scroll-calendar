import React from "react";

import { analyzeCorners, type CornerFlags } from "../utils/cornerAnalysis";
import {
    createRectsForRange,
    createContourPoints,
    createSVGPath,
} from "../utils/svgPathUtils";

interface IRangeGeometry {
    ranges: IRangeSegment[];
    cellSize: { width: number; height: number };
    gridWidth?: number;
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
    pathClassName?: string;
    roundRadius?: number;
}

export const RangeMask: React.FC<RangeMaskProps> = ({
                                                        className,
                                                        geometry,
                                                        pathClassName,
                                                        roundRadius = 12,
                                                    }) => {
    const { cellSize, gridWidth, ranges } = geometry;

    const cornersToRound = analyzeCorners(ranges);

    const createRangePath = (
        range: IRangeSegment,
        corners: CornerFlags,
    ): string => {
        const rects = createRectsForRange(range, cellSize, gridWidth);
        if (rects.length === 0) return "";

        const points = createContourPoints(rects, corners);
        return createSVGPath(points, roundRadius);
    };

    return (
        <svg
            className={className}
            style={{
                height: "100%",
                left: 0,
                pointerEvents: "none",
                position: "absolute",
                top: 0,
                width: "100%",
                zIndex: 0,
            }}
        >
            {ranges.map((range, idx) => {
                const segmentCorners = cornersToRound[idx];
                const rangePath = createRangePath(range, segmentCorners);

                return (
                    <g key={idx}>
                        <path className={pathClassName} d={rangePath} />
                    </g>
                );
            })}
        </svg>
    );
};
