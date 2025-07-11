import React from "react";
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

const HealthChart = ({ data, metric }) => {
  return (
    <div className="w-full h-96 bg-white rounded-xl p-4 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800 capitalize">
        {metric.replace("_", " ")} Over Time
      </h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
          <XAxis dataKey="date">
            <Label value="Date" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis>
            <Label
              value={metric.replace("_", " ").toUpperCase()}
              angle={-90}
              position="insideLeft"
              offset={10}
              style={{ textAnchor: "middle" }}
            />
          </YAxis>
          <Tooltip />
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
