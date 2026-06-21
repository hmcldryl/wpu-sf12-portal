"use client";

import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  label: string;
}

const RADIUS = 80;
const CENTER = 100;
const ARC_LENGTH = Math.PI * RADIUS; // half-circle arc length

function describeArc(startPct: number, endPct: number): string {
  const startAngle = Math.PI - startPct * Math.PI;
  const endAngle = Math.PI - endPct * Math.PI;

  const startX = CENTER + RADIUS * Math.cos(startAngle);
  const startY = CENTER - RADIUS * Math.sin(startAngle);
  const endX = CENTER + RADIUS * Math.cos(endAngle);
  const endY = CENTER - RADIUS * Math.sin(endAngle);

  return `M ${startX} ${startY} A ${RADIUS} ${RADIUS} 0 0 1 ${endX} ${endY}`;
}

function bandColor(score: number): string {
  if (score >= 55) return "#16a34a"; // green
  if (score >= 45) return "#d97706"; // amber
  return "#dc2626"; // red
}

export default function ScoreGauge({ score, label }: ScoreGaugeProps) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const clamped = Math.max(0, Math.min(100, score));

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimatedPct(clamped / 100));
    return () => cancelAnimationFrame(raf);
  }, [clamped]);

  const dashOffset = ARC_LENGTH * (1 - animatedPct);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-full max-w-[220px]">
        {/* Background zones */}
        <path d={describeArc(0, 0.44)} fill="none" stroke="#fecaca" strokeWidth="14" strokeLinecap="round" />
        <path d={describeArc(0.44, 0.55)} fill="none" stroke="#fed7aa" strokeWidth="14" strokeLinecap="round" />
        <path d={describeArc(0.55, 1)} fill="none" stroke="#bbf7d0" strokeWidth="14" strokeLinecap="round" />

        {/* Foreground progress arc */}
        <path
          d={describeArc(0, 1)}
          fill="none"
          stroke={bandColor(clamped)}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>

      <div className="text-center -mt-6">
        <p className="text-3xl font-bold text-[#0927eb]">{score.toFixed(2)}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
