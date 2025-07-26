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
  const tickColor = theme === 'dark' ? '#E5E7EB' : '#1F2937';

  return (
    <div className="w-full h-96 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200 capitalize">
        {metric.replace("_", " ")} Over Time
      </h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid stroke={theme === 'dark' ? '#4B5563' : '#ccc'} strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: tickColor }}>
            <Label value="Date" offset={-5} position="insideBottom" fill={tickColor} />
          </XAxis>
          <YAxis tick={{ fill: tickColor }}>
            <Label
              value={metric.replace("_", " ").toUpperCase()}
              angle={-90}
              position="insideLeft"
              offset={10}
              style={{ textAnchor: "middle", fill: tickColor }}
            />
          </YAxis>
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              borderColor: '#374151'
            }}
            labelStyle={{ color: tickColor }}
          />
          <Line
            type="monotone"
            dataKey={metric}
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthChart;