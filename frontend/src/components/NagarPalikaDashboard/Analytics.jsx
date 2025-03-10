import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

const Analytics = ({ detections }) => {
  // Process data for charts
  const dailyData = detections.reduce((acc, detection) => {
    const date = format(new Date(detection.detected_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { date, count: 0 };
    }
    acc[date].count++;
    return acc;
  }, {});

  const chartData = Object.values(dailyData).sort((a, b) =>
    new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Detection Trends</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#4f46e5"
              fill="#818cf8"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;