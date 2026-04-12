import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SummaryBox from './SummaryBox';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function RevenueLineChart({ data }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
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
            // tickFormatter={(v) => `Rs ${(v/1000).toFixed(0)}K`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
          />
          <Tooltip
            formatter={(v) => [`Rs ${v.toLocaleString()}`, 'Revenue']}
            labelFormatter={(m) => MONTHS[m] || `Month ${m}`}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#185FA5"
            strokeWidth={2}
            dot={{ r: 3, fill: '#185FA5' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
      {/* <SummaryBox text="Revenue peaked in the highest month. Consistent upward trend across the year." /> */}
    </div>
  );
}