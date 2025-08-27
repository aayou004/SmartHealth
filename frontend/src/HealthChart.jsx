import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import * as htmlToImage from 'html-to-image';
import { ThemeContext } from "./ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import "@material/web/select/outlined-select.js";
import "@material/web/select/select-option.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/button/outlined-button.js";

const HealthChart = ({ data, daysToShow, setDaysToShow }) => {
  const [selectedMetric, setSelectedMetric] = useState("steps");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sliderRef = useRef(null);
  const fullscreenSliderRef = useRef(null);
  const fullscreenChartRef = useRef(null);

  const chartColors = useMemo(() => ({
    tick: '#EEECE3',
    grid: 'rgba(238, 236, 227, 0.2)',
    line: '#CF9421',
    tooltipBg: 'rgba(218, 213, 198, 0.1)',
    tooltipBorder: 'rgba(238, 236, 227, 0.5)',
  }), []);

  // Only Steps, Sleep, Weight
  const metricOptions = useMemo(() => [
    { value: "steps", label: "Steps" },
    { value: "sleep_hours", label: "Sleep" },
    { value: "weight", label: "Weight" },
  ], []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    [sliderRef.current, fullscreenSliderRef.current].filter(Boolean).forEach(slider => {
      const min = parseInt(slider.min, 10);
      const max = parseInt(slider.max, 10);
      const val = parseInt(slider.value, 10);
      slider.style.setProperty('--slider-percentage', `${((val - min) * 100) / (max - min)}%`);
    });
  }, [daysToShow, data.length]);

  const filteredData = useMemo(() => data.slice(-daysToShow), [data, daysToShow]);

  const chartTitle = useMemo(() => {
    const option = metricOptions.find(opt => opt.value === selectedMetric);
    return (option?.label || 'Unknown') + " Over Time";
  }, [selectedMetric, metricOptions]);

  const selectedMetricLabel = useMemo(() => {
    const option = metricOptions.find(opt => opt.value === selectedMetric);
    return option?.label || 'Unknown';
  }, [selectedMetric, metricOptions]);

  const formatDate = useCallback((tickItem) => {
    const [year, month, day] = tickItem.split('-');
    return `${month}/${day}`;
  }, []);

  const handleDownload = useCallback(() => {
    if (!fullscreenChartRef.current) return;
    htmlToImage.toPng(fullscreenChartRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'health-chart.png';
        link.href = dataUrl;
        link.click();
      })
      .catch(err => console.error('Failed to download chart:', err));
  }, []);

  const handleMetricChange = useCallback((e) => setSelectedMetric(e.target.value), []);
  const handleDaysChange = useCallback((e) => setDaysToShow(Number(e.target.value)), [setDaysToShow]);

  const chartContent = useMemo(() => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={filteredData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fill: chartColors.tick }} tickFormatter={formatDate} />
        <YAxis tick={{ fill: chartColors.tick }} />
        <Tooltip
          contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, borderRadius: '0.75rem' }}
          labelStyle={{ color: chartColors.tick }}
        />
        <Line type="monotone" dataKey={selectedMetric} name={selectedMetricLabel} stroke={chartColors.line} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  ), [filteredData, selectedMetric, selectedMetricLabel, chartColors, formatDate]);

  return (
    <>
      <div className="w-full h-full p-2 flex flex-col">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-4 gap-4">
          <div className="w-64 justify-self-start">
            <md-outlined-select value={selectedMetric} onchange={handleMetricChange}>
              {metricOptions.map(option => (
                <md-select-option key={option.value} value={option.value}>{option.label}</md-select-option>
              ))}
            </md-outlined-select>
          </div>
          <h2 className="text-2xl font-bold text-[var(--theme-text)] capitalize text-center">{chartTitle}</h2>
          <div className="justify-self-end">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <md-outlined-button onClick={toggleFullscreen}>Maximize</md-outlined-button>
            </motion.div>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-[var(--theme-text)] opacity-70">No Data Available</p>
          </div>
        ) : (
          <div className="flex-1">{chartContent}</div>
        )}

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-1 w-52">
            <input
              ref={sliderRef}
              type="range"
              min="7"
              max={data.length > 7 ? data.length : 7}
              value={daysToShow}
              onChange={handleDaysChange}
              className="w-full themed-slider"
            />
            <span className="text-sm font-semibold text-[var(--theme-text)] w-10 text-right pb-0.5">{daysToShow}d</span>
          </div>
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {isFullscreen && (
            <motion.div
              className="fullscreen-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleFullscreen}
            >
              <motion.div
                ref={fullscreenChartRef}
                className="fullscreen-chart bg-[var(--theme-card-bg)] p-6 rounded-xl border border-[var(--theme-outline)]"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-full h-full flex flex-col">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-4 gap-4">
                    <div className="w-64 justify-self-start">
                      <md-outlined-select value={selectedMetric} onchange={handleMetricChange}>
                        {metricOptions.map(option => (
                          <md-select-option key={option.value} value={option.value}>{option.label}</md-select-option>
                        ))}
                      </md-outlined-select>
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--theme-text)] capitalize text-center">{chartTitle}</h2>
                    <div className="justify-self-end flex items-center gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <md-outlined-button onClick={handleDownload}>Download</md-outlined-button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <md-outlined-button onClick={toggleFullscreen}>Minimize</md-outlined-button>
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex-1">{chartContent}</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-1 w-52">
                      <input
                        ref={fullscreenSliderRef}
                        type="range"
                        min="7"
                        max={data.length > 7 ? data.length : 7}
                        value={daysToShow}
                        onChange={handleDaysChange}
                        className="w-full themed-slider"
                      />
                      <span className="text-sm font-semibold text-[var(--theme-text)] w-10 text-right pb-0.5">{daysToShow}d</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.getElementById('portal-root')
      )}
    </>
  );
};

export default HealthChart;
