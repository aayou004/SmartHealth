import React, { useContext, useState, useEffect, useMemo } from "react";
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
import axios from "axios";
import { format, subDays, addDays, getDay, startOfWeek, endOfWeek } from 'date-fns';

const HealthChart = ({ metric }) => {
  const { theme } = useContext(ThemeContext);
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  const [historicalData, setHistoricalData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [hasPrediction, setHasPrediction] = useState(false);

  // Define colors based on theme from CSS variables
  const colors = {
    light: {
      tick: 'var(--dracula-background)',
      grid: 'var(--theme-chart-grid)',
      line: 'var(--theme-chart-line)',
      trendLine: '#8884d8',
      tooltipBg: 'var(--theme-card-bg)',
      tooltipBorder: 'var(--theme-outline)',
    },
    dark: {
      tick: 'var(--dracula-foreground)',
      grid: 'var(--theme-chart-grid)',
      line: 'var(--theme-chart-line)',
      trendLine: '#82ca9d',
      tooltipBg: 'var(--theme-card-bg)',
      tooltipBorder: 'var(--theme-outline)',
    }
  };
  const currentColors = theme === 'dark' ? colors.dark : colors.light;

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.user_id || !metric) {
        setHistoricalData([]);
        setTrendData([]);
        setHasPrediction(false);
        return;
      }
      
      try {
        const [historicalRes, trendRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/logs/${user.user_id}`),
          axios.get(`http://localhost:5000/api/predict_trend/${user.user_id}/${metric}`)
        ]);
        
        setHistoricalData(historicalRes.data.filter(d => d[metric] != null));
        setTrendData(trendRes.data);
        setHasPrediction(trendRes.data.length > 0);

      } catch (error) {
        console.error("Error fetching data for chart:", error);
        setHistoricalData([]);
        setTrendData([]);
        setHasPrediction(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 200);
    return () => clearTimeout(timeoutId);

  }, [metric, user]);

  // Use useMemo to create a single, combined data array for the chart
  const combinedChartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      return [];
    }

    const dataMap = new Map(historicalData.map(item => [item.date, { ...item }]));
    
    if (trendData.length > 0) {
      trendData.forEach(item => {
        const date = item.date;
        if (dataMap.has(date)) {
          dataMap.get(date)[`predicted_${metric}`] = item[`predicted_${metric}`];
        } else {
          dataMap.set(date, {
            date: date,
            [metric]: null,
            [`predicted_${metric}`]: item[`predicted_${metric}`]
          });
        }
      });
    }

    return Array.from(dataMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));

  }, [historicalData, metric, trendData]);
  
  // Use useMemo to filter the data to the desired viewable range
  const filteredChartData = useMemo(() => {
    if (!combinedChartData || combinedChartData.length === 0) {
      return [];
    }
    const historicalDates = historicalData.map(d => new Date(d.date));
    const firstHistoricalDate = historicalDates.length > 0 ? historicalDates[0] : null;
    const lastHistoricalDate = historicalDates.length > 0 ? historicalDates[historicalDates.length - 1] : null;

    if (!firstHistoricalDate || !lastHistoricalDate) {
        return combinedChartData;
    }

    const sevenDaysFromStart = addDays(firstHistoricalDate, 7);
    const endOfView = sevenDaysFromStart > lastHistoricalDate
        ? sevenDaysFromStart
        : lastHistoricalDate;

    return combinedChartData.filter(d => {
        const date = new Date(d.date);
        return date >= firstHistoricalDate && date <= endOfView;
    });

  }, [combinedChartData, historicalData]);

  // A formatter function for the X-Axis labels
  const xAxisTickFormatter = (tickItem) => {
    const tickDate = new Date(tickItem);
    return format(tickDate, 'MMM d');
  };

  return (
    <div className="w-full h-96 bg-[var(--theme-card-bg)] rounded-xl p-4 border border-[var(--theme-outline)]">
      <h2 className="text-xl font-bold mb-4 text-[var(--theme-text)] capitalize">
        {metric.replace("_", " ")} Over Time
      </h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={filteredChartData}>
          <CartesianGrid stroke={currentColors.grid} strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: currentColors.tick }}
            tickFormatter={xAxisTickFormatter}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis domain={[0, 'dataMax']} tick={{ fill: currentColors.tick }}>
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
          {hasPrediction && (
            <Line
              type="monotone"
              dataKey={`predicted_${metric}`}
              stroke={currentColors.trendLine}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthChart;