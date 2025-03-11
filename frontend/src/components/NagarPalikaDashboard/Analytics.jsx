import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

const Analytics = ({ detections, activeTab }) => {
  // Check if detections is null, undefined, or empty
  if (!detections || detections.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Detection Trends</h3>
        <p className="text-gray-500">No detection data available.</p>
      </div>
    );
  }

  // Process data for the chart
  const processData = (detections) => {
    const dailyData = detections.reduce((acc, detection) => {
      // Skip if timestamp is missing or prediction is not "Garbage"
      if (!detection.timestamp || detection.prediction !== "Garbage") return acc;

      // Filter based on activeTab
      const matchesStatus =
        activeTab === "all" || detection.status === activeTab;
      if (!matchesStatus) return acc;

      const date = format(parseISO(detection.timestamp), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, count: 0 };
      }
      acc[date].count++;
      return acc;
    }, {});

    const result = Object.values(dailyData).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );
    console.log("Processed Data:", result); // Log the processed data
    return result;
  };

  const chartData = processData(detections);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Detection Trends</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(parseISO(date), 'MMM d')}
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={{ stroke: '#ccc' }}
            />
            <YAxis
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={{ stroke: '#ccc' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
              labelFormatter={(date) => format(parseISO(date), 'MMMM d, yyyy')}
              formatter={(value) => [`Detections: ${value}`, 'Count']}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#4f46e5"
              fill="#818cf8"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;