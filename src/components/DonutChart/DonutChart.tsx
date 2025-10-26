import React, { useEffect, useState, useRef } from "react";
import "./DonutChart.css";

interface DonutChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  fontSize?: string;
  nationalAverage?: number;
  animate?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({
  percentage,
  size = 180,
  strokeWidth = 20,
  color,
  fontSize,
  nationalAverage,
  animate = true,
}) => {
  const r = (size - strokeWidth) / 2;
  const C = 2 * Math.PI * r;
  const center = size / 2;

  const hasAnimated = useRef(false);
  const [dashOffset, setDashOffset] = useState(C);

  // ✅ clean, single useEffect (handles both mount + sidebar animation)
  useEffect(() => {
    const targetOffset = C * (1 - percentage / 100);
  
    // When animate=true (like sidebarOpen), restart animation from empty ring
    if (animate) {
      setDashOffset(C); // start at 0%
      const timeout = setTimeout(() => {
        setDashOffset(targetOffset); // animate fill
      }, 100); // small delay ensures re-render
      return () => clearTimeout(timeout);
    } else {
      // If animation not triggered, just render at final value
      setDashOffset(targetOffset);
    }
  }, [animate, percentage, C]);
  

  // ✅ color logic (green/red only)
  const strokeColor = color || (percentage >= 50 ? "#6CAF5C" : "#FF7A7A");
  const labelSize =
    fontSize ||
    (size <= 50
      ? `${size * 0.3}px` // smaller for sidebar donuts
      : size < 100
      ? `${size * 0.22}px`
      : `${size * 0.18}px`);

  const shouldRotate = true;

  // --- national average tick ---
  let avgTick: React.ReactNode = null;
  if (nationalAverage !== undefined) {
    const angleDeg = (nationalAverage / 100) * 360;
    const rad = (angleDeg * Math.PI) / 180;
    const innerR = r - strokeWidth / 2;
    const outerR = r + strokeWidth / 2;
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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* background ring */}
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="transparent"
        stroke="#2A2D2A"
        strokeOpacity={0.5}
        strokeWidth={strokeWidth}
      />

      {/* main ring */}
      <g transform={shouldRotate ? `rotate(-90 ${center} ${center})` : undefined}>
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
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.65, 0, 0.35, 1)",
          }}
        />
        {avgTick}
      </g>

      {/* percentage label */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".35em"
        fill="white"
        fontSize={labelSize}
        fontWeight={600}
      >
        {`${Math.round(percentage)}%`}
      </text>
    </svg>
  );
};

export default DonutChart;
