import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface SkillRadarProps {
  skills: {
    frontend: number;
    backend: number;
    ux_ui: number;
    dados: number;
    hardware_android: number;
    vibe_coding: number;
  };
  size?: "sm" | "md" | "lg";
}

export default function SkillRadar({ skills, size = "md" }: SkillRadarProps) {
  const data = [
    { subject: "Front", A: skills?.frontend || 0 },
    { subject: "Back", A: skills?.backend || 0 },
    { subject: "UX/UI", A: skills?.ux_ui || 0 },
    { subject: "Dados", A: skills?.dados || 0 },
    { subject: "Hard", A: skills?.hardware_android || 0 },
    { subject: "Vibe AI", A: skills?.vibe_coding || 0 },
  ];

  const heightClasses = {
    sm: "h-48 sm:h-56",
    md: "h-64",
    lg: "h-80",
  };

  const fontSize = size === "sm" ? 9 : size === "md" ? 10 : 12;
  const outerRadius = size === "sm" ? "70%" : size === "md" ? "75%" : "80%";

  const minHeightPx = size === 'sm' ? '192px' : size === 'md' ? '256px' : '320px';

  return (
    <div className={`w-full relative overflow-hidden bg-neo-bg ${heightClasses[size]}`} style={{ minHeight: minHeightPx }}>
      {/* Background Grid Pattern Accent */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />
      
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius={outerRadius} data={data}>
          <PolarGrid stroke="#000000" strokeWidth={1} strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: "#000000",
              fontSize: fontSize,
              fontWeight: "900",
              textAnchor: "middle",
            }}
          />
          <Radar
            name="Skills"
            dataKey="A"
            stroke="#B8FF29"
            strokeWidth={3}
            fill="#B8FF29"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
