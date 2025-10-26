import React, { useEffect, useState } from "react";
import "./DonutChart.css";

interface DonutChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  fontSize?: string;
  nationalAverage?: number; // optional dashed tick marker
}

const DonutChart: React.FC<DonutChartProps> = ({
  percentage,
  size = 180,
  strokeWidth = 20,
  color,
  fontSize,
  nationalAverage,
}) => {
  // Geometry
  const r = (size - strokeWidth) / 2;
  const C = 2 * Math.PI * r;
  const center = size / 2;

  // Start animation from 0 fill → final percentage
  const [dashOffset, setDashOffset] = useState(C); // initially empty ring

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDashOffset(C * (1 - percentage / 100));
    }, 50); // small delay to trigger animation after mount
    return () => clearTimeout(timeout);
  }, [C, percentage]);

  // pick stroke color
  let strokeColor = color;
  if (!strokeColor) {
    if (percentage > 67) strokeColor = "#9DE580"; // darker green
    else if (percentage >= 33) strokeColor = "#FFBD7A";
    else strokeColor = "#FF7A7A";
  }

  // font size scaling
  if (!fontSize) {
    fontSize = size < 60 ? `${size * 0.45}px` : `${size * 0.22}px`;
  }

  // --- optional national average tick ---
  let avgTick: React.ReactNode = null;
  if (nationalAverage !== undefined) {
    const angleDeg = (nationalAverage / 100) * 360;
    const innerR = r - strokeWidth / 2;
    const outerR = r + strokeWidth / 2;
    const rad = (angleDeg * Math.PI) / 180;

    const x1 = center + Math.cos(rad) * innerR;
    const y1 = center + Math.sin(rad) * innerR;
    const x2 = center + Math.cos(rad) * outerR;
    const y2 = center + Math.sin(rad) * outerR;

    avgTick = (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="white"
        strokeWidth={2.2}
        strokeDasharray="4 4"
        strokeLinecap="round"
        opacity={0.9}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="donut-chart"
    >
      {/* background ring */}
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="transparent"
        stroke="#2a2d2a"
        strokeOpacity={0.9}
        strokeWidth={strokeWidth}
      />

      {/* main ring + national avg tick */}
      <g transform={`rotate(-90 ${center} ${center})`}>
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={C}
          strokeDashoffset={dashOffset}
          strokeLinecap={size < 50 ? "butt" : "round"}
          style={{
            transition:
              "stroke-dashoffset 1.2s cubic-bezier(0.65, 0, 0.35, 1)",
          }}
        />
        {avgTick}
      </g>

      {/* centered percentage text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".45em"
        fill="white"
        fontSize={fontSize}
        fontWeight={600}
      >
        {`${Math.round(percentage)}%`}
      </text>
    </svg>
  );
};

export default DonutChart;
