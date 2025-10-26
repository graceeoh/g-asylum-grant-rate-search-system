import React, { useEffect, useState } from "react";
import "./DonutChart.css";

interface DonutChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  fontSize?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  percentage,
  size = 80,
  strokeWidth = 10,
  color,
  fontSize,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  // Animate fill from 0 → actual value
  useEffect(() => {
    const progress = circumference * (1 - percentage / 100);
    const timeout = setTimeout(() => setOffset(progress), 50);
    return () => clearTimeout(timeout);
  }, [percentage, circumference]);

  const strokeColor =
    color ||
    (percentage > 67
      ? "#C5FBA3"
      : percentage >= 33
      ? "#FFBD7A"
      : "#FF7A7A");

  if (!fontSize) {
    fontSize = size < 60 ? `${size * 0.45}px` : `${size * 0.22}px`;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="donut-chart"
    >
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="#404247"
        strokeOpacity={0.8}
        strokeWidth={strokeWidth}
      />

      {/* Foreground ring (animated stroke) */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 1.5s ease",
          transform: `rotate(-90deg)`,
          transformOrigin: "50% 50%",
        }}
      />

      {/* Center text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fill="white"
        fontSize={fontSize}
      >
        {`${Math.round(percentage)}%`}
      </text>
    </svg>
  );
};

export default DonutChart;
