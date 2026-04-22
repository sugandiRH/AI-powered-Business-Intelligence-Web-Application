import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function RevenueLineChart({ data }) {
  return (
    <div className="border-gray-700 bg-gray-800/60 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-900">Monthly revenue trend</p>
          <p className="text-xs text-gray-400">SUM(total) by month</p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-1 rounded">
          LineChart
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="month"
            tickFormatter={(m) => MONTHS[m] || m}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
          />
          <Tooltip
            formatter={(v) => [`Rs ${v.toLocaleString()}`, 'Revenue']}
            labelFormatter={(m) => MONTHS[m] || `Month ${m}`}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#9A92F0"
            strokeWidth={2}
            dot={{ r: 3, fill: '#9A92F0' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}