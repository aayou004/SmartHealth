import React, { useContext } from "react";
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

const HealthChart = ({ data, metric }) => {
  const { theme } = useContext(ThemeContext);

  // Define colors based on theme from CSS variables
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

  return (
    <div className="w-full h-96 bg-[var(--theme-card-bg)] rounded-xl p-4 border border-[var(--theme-outline)]">
      <h2 className="text-xl font-bold mb-4 text-[var(--theme-text)] capitalize">
        {metric.replace("_", " ")} Over Time
      </h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid stroke={currentColors.grid} strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: currentColors.tick }}>
            <Label value="Date" offset={-5} position="insideBottom" fill={currentColors.tick} />
          </XAxis>
          <YAxis tick={{ fill: currentColors.tick }}>
            <Label
              value={metric.replace("_", " ").toUpperCase()}
              angle={-90}
              position="insideLeft"
              offset={10}
              style={{ textAnchor: "middle", fill: currentColors.tick }}
            />
          </YAxis>
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
            dataKey={metric}
            stroke={currentColors.line}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthChart;
