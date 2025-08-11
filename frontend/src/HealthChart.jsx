import React, { useState, useMemo, useContext } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { ThemeContext } from "./ThemeContext";
import "@material/web/select/outlined-select.js";
import "@material/web/select/select-option.js";

const HealthChart = ({ data }) => {
  const { theme } = useContext(ThemeContext);
  const [selectedMetric, setSelectedMetric] = useState("steps");
  const [daysToShow, setDaysToShow] = useState(30);

  const colors = {
    light: {
      tick: 'var(--dracula-background)',
      grid: 'var(--theme-chart-grid)',
      line: 'var(--theme-chart-line)',
      tooltipBg: 'var(--theme-card-bg)',
      tooltipBorder: 'var(--theme-outline)',
    },
    dark: {
      tick: 'var(--dracula-foreground)',
      grid: 'var(--theme-chart-grid)',
      line: 'var(--theme-chart-line)',
      tooltipBg: 'var(--theme-card-bg)',
      tooltipBorder: 'var(--theme-outline)',
    }
  };
  const currentColors = theme === 'dark' ? colors.dark : colors.light;

  const filteredData = useMemo(() => {
    return data.slice(-daysToShow);
  }, [data, daysToShow]);

  const metricOptions = [
    { value: "steps", label: "Steps" },
    { value: "sleep_hours", label: "Sleep" },
    { value: "water_glasses", label: "Water" },
    { value: "calorie_intake", label: "Calories" },
    { value: "weight", label: "Weight" },
    { value: "active_minutes", label: "Activity" },
    { value: "heart_rate", label: "Heart Rate" },
    { value: "mood", label: "Mood" },
    { value: "stress_level", label: "Stress" },
  ];

  const chartTitle = metricOptions.find(opt => opt.value === selectedMetric)?.label + " Over Time";

  const formatDate = (tickItem) => {
    const [year, month, day] = tickItem.split('-');
    return `${month}/${day}`;
  };

  return (
    <div className="w-full h-[32rem] p-2 flex flex-col">
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="min-w-[10rem]">
          <md-outlined-select value={selectedMetric} onchange={(e) => setSelectedMetric(e.target.value)}>
            {metricOptions.map(option => (
              <md-select-option key={option.value} value={option.value}>{option.label}</md-select-option>
            ))}
          </md-outlined-select>
        </div>
        <h2 className="text-2xl font-bold text-[var(--theme-text)] capitalize text-center flex-1">
          {chartTitle}
        </h2>
        <div className="flex items-center gap-2 min-w-[12rem]">
            <label className="text-sm text-[var(--theme-text)]">Range:</label>
            <input 
                type="range" 
                min="7" 
                max={data.length > 7 ? data.length : 7} 
                value={daysToShow} 
                onChange={(e) => setDaysToShow(Number(e.target.value))}
                className="w-full themed-slider"
            />
            <span className="text-sm font-semibold text-[var(--theme-text)] w-12 text-right">{daysToShow} days</span>
        </div>
      </div>
      {filteredData.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <p className="text-[var(--theme-text)] opacity-70">No Data Available</p>
        </div>
      ) : (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid stroke={currentColors.grid} strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: currentColors.tick }} tickFormatter={formatDate} />
              <YAxis tick={{ fill: currentColors.tick }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: currentColors.tooltipBg,
                  borderColor: currentColors.tooltipBorder,
                  borderRadius: '0.75rem'
                }}
                labelStyle={{ color: currentColors.tick }}
                itemStyle={{ color: currentColors.line }}
              />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke={currentColors.line}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default HealthChart;
